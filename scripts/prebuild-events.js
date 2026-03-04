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

// ═══ FIX 3: VENUE EXCLUSIONS ═══
// Filter out events from venues that are too small or irrelevant
const EXCLUDED_VENUES = ["prairie meadows", "finish line", "library"];
const beforeExclude = ingested.length;
ingested = ingested.filter((ev) => {
  const v = (ev.venue || "").toLowerCase();
  return !EXCLUDED_VENUES.some((ex) => v.includes(ex));
});
const excludedCount = beforeExclude - ingested.length;
if (excludedCount > 0) {
  console.log(`🚫 Excluded ${excludedCount} events from filtered venues (${EXCLUDED_VENUES.join(", ")})`);
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

// ═══ OUTPUT ═══
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
