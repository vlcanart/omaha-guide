#!/usr/bin/env node
/**
 * Pre-build step: Merges ingested events, generates build metadata,
 * and writes app/events-data.js for the app to import.
 */

const fs = require("fs");
const path = require("path");

const INGESTED_PATH = path.join(__dirname, "..", "data", "events.json");
const LOG_PATH = path.join(__dirname, "..", "data", "pipeline-log.json");
const OUTPUT_PATH = path.join(__dirname, "..", "app", "events-data.js");

const CONFIG_PATH = path.join(__dirname, "pipeline", "config.js");

const TODAY = new Date().toISOString().split("T")[0];
const BUILD_TIME = new Date().toISOString();

// Load venue URL map from pipeline config (sourceId → calendar URL)
let venueUrlMap = {};
try {
  const { SOURCES } = require(CONFIG_PATH);
  for (const s of SOURCES) {
    venueUrlMap[s.id] = s.url;
  }
} catch (err) {
  console.warn(`⚠ Could not load pipeline config for venue URLs: ${err.message}`);
}

let ingested = [];
if (fs.existsSync(INGESTED_PATH)) {
  try {
    const raw = JSON.parse(fs.readFileSync(INGESTED_PATH, "utf8"));
    const future = raw.filter((e) => e.date >= TODAY);
    const hidden = future.filter((e) => e.status === "hidden");
    ingested = future.filter((e) => e.status !== "hidden");
    console.log(`📅 Loaded ${ingested.length} active events (${raw.length - future.length} expired, ${hidden.length} hidden, filtered out)`);
  } catch (err) {
    console.warn(`⚠ Could not parse ${INGESTED_PATH}: ${err.message}`);
  }
} else {
  console.log("📅 No ingested events found — using seed data only");
}

// ═══ VENUE ALIASES (from ticketmaster.js for consistent normalization) ═══
const VENUE_ALIASES = {
  "chi health center omaha": "CHI Health Center",
  "chi health center arena": "CHI Health Center",
  "chi health center": "CHI Health Center",
  "baxter arena": "Baxter Arena",
  "orpheum theater": "Orpheum Theater",
  "orpheum theatre": "Orpheum Theater",
  "holland performing arts center": "Holland Center",
  "holland center": "Holland Center",
  "the admiral omaha": "The Admiral",
  "the admiral": "The Admiral",
  "admiral": "The Admiral",
  "slowdown": "The Slowdown",
  "the slowdown": "The Slowdown",
  "waiting room lounge": "The Waiting Room",
  "the waiting room": "The Waiting Room",
  "waiting room": "The Waiting Room",
  "reverb lounge": "Reverb Lounge",
  "mid-america center": "Mid-America Center",
  "stir concert cove": "Stir Concert Cove",
  "stir cove": "Stir Concert Cove",
  "the astro": "The Astro",
  "the astro theater": "The Astro",
  "liberty first credit union arena": "Liberty First Credit Union Arena",
  "werner park": "Werner Park",
  "henry doorly zoo": "Henry Doorly Zoo",
  "henry doorly zoo and aquarium": "Henry Doorly Zoo",
  "steelhouse omaha": "Steelhouse Omaha",
  "td ameritrade park": "Charles Schwab Field",
  "charles schwab field": "Charles Schwab Field",
  "charles schwab field omaha": "Charles Schwab Field",
  "sumtur amphitheater": "SumTur Amphitheater",
  "benson theatre": "Benson Theatre",
};

// ═══ FIX 1: URL SANITIZATION ═══
let urlFixCount = 0;
for (const ev of ingested) {
  if (!ev.url) continue;
  const orig = ev.url;

  // Decode double-encoded HTML entities: &amp%3B → &, &amp; → &
  ev.url = ev.url.replace(/&amp%3B/g, "&").replace(/&amp;/g, "&");

  // Convert travel.ticketmaster.com/tm-event/ID → www.ticketmaster.com/event/ID
  ev.url = ev.url.replace(
    /^https?:\/\/travel\.ticketmaster\.com\/tm-event\/([A-Za-z0-9]+).*/,
    "https://www.ticketmaster.com/event/$1"
  );
  // Any remaining travel.ticketmaster.com URL → use tmEventId if available
  if (/^https?:\/\/travel\.ticketmaster\.com\//.test(ev.url)) {
    if (ev.tmEventId) {
      ev.url = `https://www.ticketmaster.com/event/${ev.tmEventId}`;
    } else {
      ev.url = ""; // will be caught by fallback or filtered later
    }
  }

  if (ev.url !== orig) urlFixCount++;
}
if (urlFixCount > 0) {
  console.log(`🔧 Fixed ${urlFixCount} malformed URLs (entities, travel.ticketmaster)`);
}

// ═══ FIX 2: STRIP GENERIC TM PLACEHOLDER IMAGES ═══
// TM returns RETINA_PORTRAIT category placeholders for events without real artwork.
// Nulling these lets the frontend pickImg() use better keyword/category fallbacks.
let imgStripCount = 0;
for (const ev of ingested) {
  if (!ev.image) continue;
  if (/RETINA_PORTRAIT/i.test(ev.image) || /ARTIST_PAGE.*_3_2/i.test(ev.image)) {
    ev.image = null;
    imgStripCount++;
  }
}
if (imgStripCount > 0) {
  console.log(`🖼️  Stripped ${imgStripCount} generic TM placeholder images`);
}

// ═══ FIX 3: VENUE & EVENT EXCLUSIONS ═══
const EXCLUDED_VENUES = ["prairie meadows", "finish line"];
const beforeExclude = ingested.length;
ingested = ingested.filter((ev) => {
  const v = (ev.venue || "").toLowerCase();
  const p = (ev.price || "").toLowerCase();

  // Blanket venue exclusions
  if (EXCLUDED_VENUES.some((ex) => v.includes(ex))) return false;

  // Library venues with TBD pricing — drop (low-quality placeholders)
  if (v.includes("library") && (p === "tbd" || p === "" || p === "to be determined")) return false;

  // Scriptown Brewing — drop
  if (v.includes("scriptown")) return false;

  return true;
});
const excludedCount = beforeExclude - ingested.length;
if (excludedCount > 0) {
  console.log(`🚫 Excluded ${excludedCount} events (venue filters + library TBD + Scriptown)`);
}

// ═══ FIX: REGENERATE EVENT IDs ═══
// Old pipeline used Date.now() + random which caused ID collisions.
// Regenerate all IDs using content-based FNV-1a hash for stable, unique keys.
function stableId(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) | 0;
  }
  return (h >>> 0);
}

const seenIds = new Set();
let idFixCount = 0;
for (const ev of ingested) {
  const newId = stableId(`${ev.title}|${ev.date}|${ev.venue}|${ev.sourceId || ""}`);
  // If the new content-hash collides (extremely unlikely), add a suffix
  let finalId = newId;
  let suffix = 1;
  while (seenIds.has(finalId)) {
    finalId = stableId(`${ev.title}|${ev.date}|${ev.venue}|${ev.sourceId || ""}|${suffix}`);
    suffix++;
  }
  if (ev.id !== finalId) idFixCount++;
  ev.id = finalId;
  seenIds.add(finalId);
}
if (idFixCount > 0) {
  console.log(`🔑 Regenerated ${idFixCount} event IDs (content-based hash, 0 collisions)`);
}

// ═══ HELPER FUNCTIONS ═══

function normalizeVenue(v) {
  if (!v) return "";
  const lower = v.toLowerCase().trim();
  const canonical = VENUE_ALIASES[lower] || lower;
  return canonical.toLowerCase()
    .replace(/\b(center|arena|theatre|theater|lounge|park)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const venueCalendarUrls = new Set(Object.values(venueUrlMap));

function scoreEvent(ev) {
  let s = 0;
  if (ev.image) s += 2;
  if (ev.url && !venueCalendarUrls.has(ev.url)) s += 2;
  if (ev.price && ev.price !== "TBD") s += 1;
  if (ev.urlValid) s += 1;
  return s;
}

// Normalize title for fuzzy matching — strip noise words
function normalizeTitle(t) {
  return (t || "").toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(the|a|an|at|in|of|vs|v|and)\b/g, "")
    .replace(/\b(mens|womens|men's|women's)\b/g, "")
    .replace(/\b(omaha|nebraska|ne)\b/g, "")
    .replace(/\s+/g, " ").trim();
}

// Word-overlap similarity: overlap / smaller set size
function titleSimilarity(a, b) {
  const wa = new Set(normalizeTitle(a).split(" ").filter(Boolean));
  const wb = new Set(normalizeTitle(b).split(" ").filter(Boolean));
  if (wa.size === 0 || wb.size === 0) return 0;
  let overlap = 0;
  for (const w of wa) if (wb.has(w)) overlap++;
  return overlap / Math.min(wa.size, wb.size);
}

// Merge fields from donor into target (fills gaps only)
function mergeInto(target, donor) {
  if (!target.image && donor.image) target.image = donor.image;
  if ((!target.url || venueCalendarUrls.has(target.url)) && donor.url && !venueCalendarUrls.has(donor.url)) {
    target.url = donor.url;
  }
  if ((!target.price || target.price === "TBD") && donor.price && donor.price !== "TBD") target.price = donor.price;
  if (!target.urlValid && donor.urlValid) target.urlValid = donor.urlValid;
  if (!target.affiliatePlatform && donor.affiliatePlatform) target.affiliatePlatform = donor.affiliatePlatform;
  if (donor.tags && (!target.tags || target.tags.length === 0)) target.tags = donor.tags;
  if (donor.emoji && !target.emoji) target.emoji = donor.emoji;
  if (donor.desc && (donor.desc.length > (target.desc || "").length)) target.desc = donor.desc;
}

// ═══ DEDUP PASS 1: venue+date groups, API sources vs scraped ═══
// Merges any API source (ticketmaster-api, ticketomaha-api) against scraped sources
const API_SOURCES = new Set(["ticketmaster-api", "ticketomaha-api"]);

const groups = {};
for (const ev of ingested) {
  const key = `${normalizeVenue(ev.venue)}|${ev.date}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(ev);
}

const dropIds = new Set();
let mergeCount = 0;
let keptApi = 0;
let keptScraped = 0;

for (const [key, evs] of Object.entries(groups)) {
  if (evs.length < 2) continue;

  const apiEvents = evs.filter((e) => API_SOURCES.has(e.sourceId));
  const scraped = evs.filter((e) => !API_SOURCES.has(e.sourceId));

  if (apiEvents.length === 0 || scraped.length === 0) continue;

  const api = apiEvents.find((t) => t.image) || apiEvents[0];
  const sc = scraped.reduce((best, cur) => scoreEvent(cur) > scoreEvent(best) ? cur : best, scraped[0]);

  const apiScore = scoreEvent(api);
  const scScore = scoreEvent(sc);
  const keepApi = apiScore >= scScore;
  const winner = keepApi ? api : sc;
  const loser = keepApi ? sc : api;

  mergeInto(winner, loser);

  dropIds.add(loser.id);
  for (const t of apiEvents) { if (t.id !== winner.id) dropIds.add(t.id); }
  for (const s of scraped) { if (s.id !== winner.id) dropIds.add(s.id); }

  mergeCount++;
  if (keepApi) keptApi++;
  else keptScraped++;
}

const beforeDedup = ingested.length;
ingested = ingested.filter((e) => !dropIds.has(e.id));
if (mergeCount > 0) {
  console.log(`🔗 Dedup pass 1 (venue+date): ${mergeCount} pairs (kept API: ${keptApi}, scraped: ${keptScraped}, dropped ${beforeDedup - ingested.length})`);
}

// ═══ DEDUP PASS 2: fuzzy title matching within same venue+date ═══
// Catches "Creighton Bluejays vs Providence Friars" ≈ "Creighton Bluejays v Providence Friars"
// and cross-source dupes like visitomaha + chi scraper with different wording
const SIMILARITY_THRESHOLD = 0.6;

const groups2 = {};
for (const ev of ingested) {
  const key = `${normalizeVenue(ev.venue)}|${ev.date}`;
  if (!groups2[key]) groups2[key] = [];
  groups2[key].push(ev);
}

const dropIds2 = new Set();
let fuzzyMergeCount = 0;

for (const [key, evs] of Object.entries(groups2)) {
  if (evs.length < 2) continue;

  const used = new Set();
  for (let i = 0; i < evs.length; i++) {
    if (used.has(i)) continue;
    for (let j = i + 1; j < evs.length; j++) {
      if (used.has(j)) continue;
      const sim = titleSimilarity(evs[i].title, evs[j].title);
      if (sim >= SIMILARITY_THRESHOLD) {
        const scoreI = scoreEvent(evs[i]);
        const scoreJ = scoreEvent(evs[j]);
        const winner = scoreI >= scoreJ ? evs[i] : evs[j];
        const loser = scoreI >= scoreJ ? evs[j] : evs[i];
        mergeInto(winner, loser);
        dropIds2.add(loser.id);
        used.add(scoreI >= scoreJ ? j : i);
        fuzzyMergeCount++;
      }
    }
  }
}

const beforeFuzzy = ingested.length;
ingested = ingested.filter((e) => !dropIds2.has(e.id));
if (fuzzyMergeCount > 0) {
  console.log(`🔗 Dedup pass 2 (fuzzy title): ${fuzzyMergeCount} near-dupes merged (dropped ${beforeFuzzy - ingested.length})`);
}

// ═══ URL UPGRADE PASS ═══
// Events stuck with venue calendar URLs get upgraded if a matching API event
// exists at the same venue + date with a real ticket link
const ticketUrlMap = new Map();
for (const ev of ingested) {
  if (!API_SOURCES.has(ev.sourceId)) continue;
  if (!ev.url || venueCalendarUrls.has(ev.url)) continue;
  const key = `${normalizeVenue(ev.venue)}|${ev.date}`;
  // Keep the best ticket URL per venue+date
  if (!ticketUrlMap.has(key)) {
    ticketUrlMap.set(key, ev.url);
  }
}

let urlUpgradeCount = 0;
for (const ev of ingested) {
  if (!ev.url || !venueCalendarUrls.has(ev.url)) continue;
  const key = `${normalizeVenue(ev.venue)}|${ev.date}`;
  const betterUrl = ticketUrlMap.get(key);
  if (betterUrl) {
    ev.url = betterUrl;
    ev.urlUpgraded = true;
    urlUpgradeCount++;
  }
}
if (urlUpgradeCount > 0) {
  console.log(`🔗 URL upgrade pass: ${urlUpgradeCount} events upgraded from venue calendar → real ticket URLs`);
}

// ═══ STUBHUB PERFORMER FALLBACK ═══
// Events stuck with venue calendar URLs get linked to known StubHub performer pages
const STUBHUB_MAP = [
  { match: /omaha.*(hockey|maverick)/i, url: "https://www.stubhub.com/omaha-mavericks-men-s-hockey-tickets/performer/180988" },
  { match: /omaha.*(basketball|women.*basket)/i, url: "https://www.stubhub.com/omaha-mavericks-men-s-basketball-tickets/performer/170810" },
  { match: /creighton.*basketball/i, url: "https://www.stubhub.com/creighton-bluejays-mens-basketball-tickets/performer/3410" },
  { match: /creighton.*baseball/i, url: "https://www.stubhub.com/creighton-bluejays-baseball-tickets/performer/100291" },
  { match: /storm\s*chasers/i, url: "https://www.stubhub.com/omaha-storm-chasers-tickets/performer/3906" },
  { match: /union\s*omaha/i, url: "https://www.stubhub.com/union-omaha-tickets/performer/100623" },
  { match: /omaha.*lancers/i, url: "https://www.stubhub.com/omaha-lancers-tickets/performer/9488" },
  { match: /supernova|lovb.*nebraska/i, url: "https://www.stubhub.com/lovb-omaha-supernovas-tickets/performer/102118" },
];

let stubhubCount = 0;
for (const ev of ingested) {
  if (!ev.url || !venueCalendarUrls.has(ev.url)) continue;
  const text = `${ev.title} ${ev.venue}`;
  const match = STUBHUB_MAP.find(m => m.match.test(text));
  if (match) {
    ev.url = match.url;
    stubhubCount++;
  }
}
if (stubhubCount > 0) {
  console.log(`🎫 StubHub fallback: ${stubhubCount} events linked to StubHub performer pages`);
}

// ═══ VENUE URL FALLBACK ═══
let fallbackCount = 0;
for (const ev of ingested) {
  if (!ev.url && ev.sourceId && venueUrlMap[ev.sourceId]) {
    ev.url = venueUrlMap[ev.sourceId];
    fallbackCount++;
  }
}
if (fallbackCount > 0) {
  console.log(`🔗 Added venue URL fallback for ${fallbackCount} events`);
}

// ═══ FIX 4: FILTER OUT ZERO-DATA EVENTS ═══
const beforeFilter = ingested.length;
ingested = ingested.filter((ev) => ev.url || ev.image);
const zeroDataDropped = beforeFilter - ingested.length;
if (zeroDataDropped > 0) {
  console.log(`🗑️  Removed ${zeroDataDropped} zero-data events (no URL and no image)`);
}

// ═══ VENUE IMAGE MAP (rebuilt from curated photos in /public/images/venues/) ═══
// Each venue has a primary image + optional alternates for rotation.
// Loaded from manifest generated by scripts/import-venue-images.js
const VENUE_IMAGES = {
  "barnato":                     { primary: "/images/venues/barnato.jpg", alts: ["/images/venues/barnato-alt-1.jpg", "/images/venues/barnato-alt-2.jpg"] },
  "baxter arena":                { primary: "/images/venues/baxter-arena.jpg", alts: ["/images/venues/baxter-arena-alt-1.jpg", "/images/venues/baxter-arena-alt-2.jpg", "/images/venues/baxter-arena-alt-3.jpg", "/images/venues/baxter-arena-alt-4.jpg", "/images/venues/baxter-arena-alt-5.jpg"] },
  "bemis center":                { primary: "/images/venues/bemis-center.jpg", alts: ["/images/venues/bemis-center-alt-1.jpg"] },
  "benson theatre":              { primary: "/images/venues/benson-theatre.jpg", alts: ["/images/venues/benson-theatre-alt-1.jpg"] },
  "charles schwab field":        { primary: "/images/venues/charles-schwab-field.jpg", alts: [] },
  "chi health center":           { primary: "/images/venues/chi-health-center.jpg", alts: ["/images/venues/chi-health-center-alt-1.jpg", "/images/venues/chi-health-center-alt-2.jpg", "/images/venues/chi-health-center-alt-3.jpg", "/images/venues/chi-health-center-alt-4.jpg"] },
  "connie claussen field":       { primary: "/images/venues/connie-claussen-field.jpg", alts: [] },
  "council bluffs public library": { primary: "/images/venues/council-bluffs-public-library.jpg", alts: [] },
  "creighton softball stadium":  { primary: "/images/venues/creighton-softball-stadium.jpg", alts: [] },
  "durham museum":               { primary: "/images/venues/durham-museum.jpg", alts: ["/images/venues/durham-museum-alt-1.jpg"] },
  "film streams":                { primary: "/images/venues/film-streams.jpg", alts: ["/images/venues/film-streams-alt-1.jpg"] },
  "henry doorly zoo":            { primary: "/images/venues/henry-doorly-zoo.jpg", alts: ["/images/venues/henry-doorly-zoo-alt-1.jpg", "/images/venues/henry-doorly-zoo-alt-2.jpg"] },
  "hoff family arts":            { primary: "/images/venues/hoff-family-arts.jpg", alts: [] },
  "holland center":              { primary: "/images/venues/holland-center.jpg", alts: ["/images/venues/holland-center-alt-1.jpg", "/images/venues/holland-center-alt-2.jpg", "/images/venues/holland-center-alt-3.jpg", "/images/venues/holland-center-alt-4.jpg"] },
  "hot shops art center":        { primary: "/images/venues/hot-shops-art-center.jpg", alts: [] },
  "hoyt sherman place":          { primary: "/images/venues/hoyt-sherman-place.jpg", alts: ["/images/venues/hoyt-sherman-place-alt-1.jpg"] },
  "joslyn art museum":           { primary: "/images/venues/joslyn-art-museum.jpg", alts: ["/images/venues/joslyn-art-museum-alt-1.jpg"] },
  "kaneko":                      { primary: "/images/venues/kaneko.jpg", alts: [] },
  "kiewit luminarium":           { primary: "/images/venues/kiewit-luminarium.jpg", alts: ["/images/venues/kiewit-luminarium-alt-1.jpg"] },
  "la vista public library":     { primary: "/images/venues/la-vista-public-library.jpg", alts: [] },
  "liberty first credit union arena": { primary: "/images/venues/liberty-first-credit-union-arena.jpg", alts: ["/images/venues/liberty-first-credit-union-arena-alt-1.jpg"] },
  "mid-america center":          { primary: "/images/venues/mid-america-center.jpg", alts: ["/images/venues/mid-america-center-alt-1.jpg"] },
  "omaha community playhouse":   { primary: "/images/venues/omaha-community-playhouse.jpg", alts: ["/images/venues/omaha-community-playhouse-alt-1.jpg"] },
  "omaha funny bone":            { primary: "/images/venues/omaha-funny-bone.jpg", alts: [] },
  "orpheum theater":             { primary: "/images/venues/orpheum-theater.jpg", alts: ["/images/venues/orpheum-theater-alt-1.jpg", "/images/venues/orpheum-theater-alt-2.jpg", "/images/venues/orpheum-theater-alt-3.jpg", "/images/venues/orpheum-theater-alt-4.jpg"] },
  "steelhouse omaha":            { primary: "/images/venues/steelhouse-omaha.jpg", alts: ["/images/venues/steelhouse-omaha-alt-1.jpg"] },
  "stir concert cove":           { primary: "/images/venues/stir-concert-cove.jpg", alts: ["/images/venues/stir-concert-cove-alt-1.jpg"] },
  "tal anderson field":          { primary: "/images/venues/tal-anderson-field.jpg", alts: [] },
  "the admiral":                 { primary: "/images/venues/the-admiral.jpg", alts: [] },
  "the astro":                   { primary: "/images/venues/the-astro.jpg", alts: ["/images/venues/the-astro-alt-1.jpg", "/images/venues/the-astro-alt-2.jpg", "/images/venues/the-astro-alt-3.jpg", "/images/venues/the-astro-alt-4.jpg"] },
  "the riverfront":              { primary: "/images/venues/the-riverfront.jpg", alts: ["/images/venues/the-riverfront-alt-1.jpg"] },
  "the rose theater":            { primary: "/images/venues/the-rose-theater.jpg", alts: ["/images/venues/the-rose-theater-alt-1.jpg"] },
  "the slowdown":                { primary: "/images/venues/the-slowdown.jpg", alts: [] },
  "the waiting room":            { primary: "/images/venues/the-waiting-room.jpg", alts: [] },
  "werner park":                 { primary: "/images/venues/werner-park.jpg", alts: [] },
  "whiskey roadhouse":           { primary: "/images/venues/whiskey-roadhouse.jpg", alts: ["/images/venues/whiskey-roadhouse-alt-1.jpg"] },
  "witherspoon theater":         { primary: "/images/venues/witherspoon-theater.jpg", alts: [] },
};

// Maps all known venue name variations → canonical key in VENUE_IMAGES
const VENUE_NAME_TO_KEY = {
  // === Barnato ===
  "barnato": "barnato",
  // === Baxter Arena ===
  "baxter arena": "baxter arena",
  // === Bemis Center ===
  "bemis center": "bemis center",
  "bemis center for contemporary arts": "bemis center",
  "low end @ bemis center for contemporary arts": "bemis center",
  // === Benson Theatre ===
  "benson theatre": "benson theatre",
  // === Charles Schwab Field ===
  "charles schwab field": "charles schwab field",
  "charles schwab field omaha": "charles schwab field",
  "td ameritrade park": "charles schwab field",
  // === CHI Health Center ===
  "chi health center": "chi health center",
  "chi health center omaha": "chi health center",
  "chi health center arena": "chi health center",
  // === Connie Claussen Field ===
  "connie claussen field": "connie claussen field",
  // === Council Bluffs Public Library ===
  "council bluffs public library": "council bluffs public library",
  // === Creighton Softball Stadium ===
  "creighton softball stadium": "creighton softball stadium",
  // === Durham Museum ===
  "durham museum": "durham museum",
  "the durham museum": "durham museum",
  // === Film Streams ===
  "film streams": "film streams",
  // === Henry Doorly Zoo ===
  "henry doorly zoo": "henry doorly zoo",
  "henry doorly zoo and aquarium": "henry doorly zoo",
  // === Hoff Family Arts ===
  "hoff family arts": "hoff family arts",
  "hoff family arts & culture center": "hoff family arts",
  "hoff family arts and culture center": "hoff family arts",
  // === Holland Center (includes Holland Music Club per user alias) ===
  "holland center": "holland center",
  "holland performing arts center": "holland center",
  "holland pac": "holland center",
  "holland music club": "holland center",
  // === Hot Shops Art Center ===
  "hot shops art center": "hot shops art center",
  "hot shops art center - crystal forge": "hot shops art center",
  "hot shops art center - studio 101": "hot shops art center",
  "hot shops art center - studio #116": "hot shops art center",
  "hot shops art center - studio 220": "hot shops art center",
  "hot shops art center - foundry": "hot shops art center",
  // === Hoyt Sherman Place ===
  "hoyt sherman place": "hoyt sherman place",
  // === Joslyn Art Museum ===
  "joslyn art museum": "joslyn art museum",
  // === KANEKO ===
  "kaneko": "kaneko",
  // === Kiewit Luminarium ===
  "kiewit luminarium": "kiewit luminarium",
  // === La Vista Public Library ===
  "la vista public library": "la vista public library",
  // === Liberty First Credit Union Arena ===
  "liberty first credit union arena": "liberty first credit union arena",
  "liberty first cu arena": "liberty first credit union arena",
  // === Mid-America Center ===
  "mid-america center": "mid-america center",
  // === Omaha Community Playhouse ===
  "omaha community playhouse": "omaha community playhouse",
  // === Omaha Funny Bone ===
  "omaha funny bone": "omaha funny bone",
  "funny bone": "omaha funny bone",
  // === Orpheum Theater (includes Tenaska Center per user alias) ===
  "orpheum theater": "orpheum theater",
  "orpheum theater omaha": "orpheum theater",
  "orpheum theater - omaha": "orpheum theater",
  "orpheum theatre": "orpheum theater",
  "tenaska center": "orpheum theater",
  "tenaska ctr": "orpheum theater",
  "tenaska center - mammel foundation hall": "orpheum theater",
  // === Steelhouse Omaha ===
  "steelhouse omaha": "steelhouse omaha",
  // === Stir Concert Cove (includes Harrah's per user alias) ===
  "stir concert cove": "stir concert cove",
  "stir cove": "stir concert cove",
  "harrahs council bluffs": "stir concert cove",
  "harrah's council bluffs": "stir concert cove",
  // === Tal Anderson Field ===
  "tal anderson field": "tal anderson field",
  // === The Admiral ===
  "the admiral": "the admiral",
  "the admiral-ne": "the admiral",
  "admiral": "the admiral",
  // === The Astro ===
  "the astro": "the astro",
  "the astro theater": "the astro",
  "the astro amphitheater": "the astro",
  // === The RiverFront ===
  "the riverfront": "the riverfront",
  // === The Rose Theater ===
  "the rose theater": "the rose theater",
  // === The Slowdown ===
  "the slowdown": "the slowdown",
  "slowdown": "the slowdown",
  // === The Waiting Room ===
  "the waiting room": "the waiting room",
  "the waiting room lounge": "the waiting room",
  "waiting room lounge": "the waiting room",
  "waiting room": "the waiting room",
  // === Werner Park ===
  "werner park": "werner park",
  // === Whiskey Roadhouse ===
  "whiskey roadhouse": "whiskey roadhouse",
  // === Witherspoon Theater ===
  "witherspoon theater": "witherspoon theater",
};

// Pick a venue image for an event. Uses event ID for deterministic rotation
// across alternates so different events at the same venue get varied photos.
function findVenueImage(venueName, eventId) {
  if (!venueName) return null;
  const lower = venueName.toLowerCase().trim();

  // Direct alias lookup
  let key = VENUE_NAME_TO_KEY[lower];

  // Substring fallback: check if venue name contains a known key
  if (!key) {
    for (const [alias, target] of Object.entries(VENUE_NAME_TO_KEY)) {
      if (lower.includes(alias) || alias.includes(lower)) {
        key = target;
        break;
      }
    }
  }

  if (!key || !VENUE_IMAGES[key]) return null;

  const venue = VENUE_IMAGES[key];
  const allImages = [venue.primary, ...venue.alts];

  // Single image — just return it
  if (allImages.length === 1) return allImages[0];

  // Rotate: use event ID (number) mod image count for deterministic variety
  const idx = typeof eventId === "number" ? Math.abs(eventId) % allImages.length : 0;
  return allImages[idx];
}

// ═══ EVENT IMAGE CACHING ═══
// Downloads external event images to public/images/events/ for local serving.
// Rewrites ev.image to local path. Runs during prebuild so images are fresh.
const EVENTS_IMG_DIR = path.join(__dirname, "..", "public", "images", "events");

async function cacheEventImages(events) {
  if (!fs.existsSync(EVENTS_IMG_DIR)) {
    fs.mkdirSync(EVENTS_IMG_DIR, { recursive: true });
  }

  const withImages = events.filter(
    (e) => e.image && /^https?:\/\//.test(e.image)
  );
  if (withImages.length === 0) {
    console.log("🖼️  No external event images to cache");
    return;
  }

  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    // sharp not available — skip image caching silently in CI
    console.log(
      "🖼️  sharp not installed — skipping event image caching (install sharp for local images)"
    );
    return;
  }

  console.log(
    `🖼️  Caching ${withImages.length} event images to public/images/events/...`
  );

  const CONCURRENCY = 5;
  const TIMEOUT = 10000;
  let cached = 0;
  let skipped = 0;
  let failed = 0;

  // Process in batches of CONCURRENCY
  for (let i = 0; i < withImages.length; i += CONCURRENCY) {
    const batch = withImages.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (ev) => {
        const filename = `${ev.id}.jpg`;
        const outPath = path.join(EVENTS_IMG_DIR, filename);

        // Skip if already cached
        if (fs.existsSync(outPath)) {
          ev.image = `/images/events/${filename}`;
          skipped++;
          return;
        }

        try {
          const buf = await new Promise((resolve, reject) => {
            const proto = ev.image.startsWith("https")
              ? require("https")
              : require("http");
            proto
              .get(ev.image, { timeout: TIMEOUT }, (res) => {
                if (
                  [301, 302, 303, 307].includes(res.statusCode) &&
                  res.headers.location
                ) {
                  // Follow one redirect
                  const rProto = res.headers.location.startsWith("https")
                    ? require("https")
                    : require("http");
                  rProto
                    .get(res.headers.location, { timeout: TIMEOUT }, (r2) => {
                      if (r2.statusCode !== 200) {
                        reject(new Error(`HTTP ${r2.statusCode}`));
                        r2.resume();
                        return;
                      }
                      const c = [];
                      r2.on("data", (d) => c.push(d));
                      r2.on("end", () => resolve(Buffer.concat(c)));
                      r2.on("error", reject);
                    })
                    .on("error", reject);
                  return;
                }
                if (res.statusCode !== 200) {
                  reject(new Error(`HTTP ${res.statusCode}`));
                  res.resume();
                  return;
                }
                const chunks = [];
                res.on("data", (d) => chunks.push(d));
                res.on("end", () => resolve(Buffer.concat(chunks)));
                res.on("error", reject);
              })
              .on("error", reject)
              .on("timeout", () => reject(new Error("timeout")));
          });

          const optimized = await sharp(buf)
            .resize(600, 400, { fit: "cover", position: "center" })
            .jpeg({ quality: 80 })
            .toBuffer();

          fs.writeFileSync(outPath, optimized);
          ev.image = `/images/events/${filename}`;
          cached++;
        } catch {
          // Keep original URL as fallback
          failed++;
        }
      })
    );
  }

  // Clean up stale images (IDs no longer in dataset)
  const activeIds = new Set(events.map((e) => `${e.id}.jpg`));
  let cleaned = 0;
  try {
    for (const file of fs.readdirSync(EVENTS_IMG_DIR)) {
      if (file.endsWith(".jpg") && !activeIds.has(file)) {
        fs.unlinkSync(path.join(EVENTS_IMG_DIR, file));
        cleaned++;
      }
    }
  } catch {}

  console.log(
    `🖼️  Event images: ${cached} cached, ${skipped} existing, ${failed} failed${cleaned ? `, ${cleaned} stale removed` : ""}`
  );
}

// Run image caching (async wrapper for the sync script)
const runAsync = (async () => {
  await cacheEventImages(ingested);
})();

// Wait for async work, then apply venue fallbacks and generate output
runAsync
  .then(() => {
    // ═══ VENUE IMAGE FALLBACK PASS ═══
    // For events still missing images, assign curated venue photo if available.
    // Events with existing images from Ticketmaster etc. keep those.
    // Uses event ID for rotation so same-venue events get varied photos.
    let venueFallbackCount = 0;
    for (const ev of ingested) {
      if (ev.image) continue; // already has an image
      const venueImg = findVenueImage(ev.venue, ev.id);
      if (venueImg) {
        ev.image = venueImg;
        ev.imageSource = "venue-fallback";
        venueFallbackCount++;
      }
    }
    if (venueFallbackCount > 0) {
      console.log(`🏟️  Venue image fallback: ${venueFallbackCount} events got venue photos`);
    }
    const stillMissing = ingested.filter(e => !e.image).length;
    if (stillMissing > 0) {
      console.log(`📸 Still missing images: ${stillMissing} events`);
    }

    // ═══ OUTPUT ═══
    generateOutput();
  })
  .catch((err) => {
    console.warn(`⚠ Event image caching error: ${err.message}`);
    generateOutput();
  });

function generateOutput() {
let lastPipeline = null;
if (fs.existsSync(LOG_PATH)) {
  try {
    const log = JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));
    lastPipeline = log.timestamp;
  } catch {}
}

const output = `// AUTO-GENERATED by scripts/prebuild-events.js — do not edit manually
// Built: ${BUILD_TIME}
// Ingested events: ${ingested.length}

export const INGESTED_EVENTS = ${JSON.stringify(ingested, null, 2)};

export const BUILD_META = {
  buildTime: "${BUILD_TIME}",
  lastPipeline: ${lastPipeline ? `"${lastPipeline}"` : "null"},
  eventCount: ${ingested.length},
};

export const dedupeKey = (e) =>
  \`\${(e.title || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "")}|\${e.date}\`;
`;

fs.writeFileSync(OUTPUT_PATH, output);
console.log(`✓ Generated ${OUTPUT_PATH} with ${ingested.length} events (build: ${BUILD_TIME})`);
} // end generateOutput()
