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

// ═══ VENUE ALIASES (imported from ticketmaster.js for consistent normalization) ═══
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

// ═══ SMART DEDUP: keep best data, merge from duplicates ═══

// Normalize venue name for matching — apply aliases first, then strip to alphanum
function normalizeVenue(v) {
  if (!v) return "";
  const lower = v.toLowerCase().trim();
  // Resolve alias to canonical name if possible
  const canonical = VENUE_ALIASES[lower] || lower;
  return canonical.toLowerCase()
    .replace(/\b(center|arena|theatre|theater|lounge|park)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// Build a set of venue calendar URLs for fallback detection
const venueCalendarUrls = new Set(Object.values(venueUrlMap));

// Score an event by data completeness (higher = better)
function scoreEvent(ev) {
  let s = 0;
  if (ev.image) s += 2;                                      // has a real image
  if (ev.url && !venueCalendarUrls.has(ev.url)) s += 2;      // has a real ticket URL (not venue calendar fallback)
  if (ev.price && ev.price !== "TBD") s += 1;                // has a real price
  if (ev.urlValid) s += 1;                                    // URL has been validated
  return s;
}

// Group events by normalized venue + date
const groups = {};
for (const ev of ingested) {
  const key = `${normalizeVenue(ev.venue)}|${ev.date}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(ev);
}

const dropIds = new Set();
let mergeCount = 0;
let keptTm = 0;
let keptScraped = 0;

for (const [key, evs] of Object.entries(groups)) {
  if (evs.length < 2) continue;

  const tmEvents = evs.filter((e) => e.sourceId === "ticketmaster-api");
  const scraped = evs.filter((e) => e.sourceId !== "ticketmaster-api");

  if (tmEvents.length === 0 || scraped.length === 0) continue;

  // Pick the best TM event (prefer one with image)
  const tm = tmEvents.find((t) => t.image) || tmEvents[0];
  // Pick the best scraped event (prefer one with url+image)
  const sc = scraped.reduce((best, cur) => scoreEvent(cur) > scoreEvent(best) ? cur : best, scraped[0]);

  const tmScore = scoreEvent(tm);
  const scScore = scoreEvent(sc);

  // Decide winner: higher score wins; on tie, prefer TM (structured API data)
  const keepTm = tmScore >= scScore;
  const winner = keepTm ? tm : sc;
  const loser = keepTm ? sc : tm;

  // Merge useful fields from loser into winner
  if (!winner.image && loser.image) winner.image = loser.image;
  if ((!winner.url || venueCalendarUrls.has(winner.url)) && loser.url && !venueCalendarUrls.has(loser.url)) winner.url = loser.url;
  if ((!winner.price || winner.price === "TBD") && loser.price && loser.price !== "TBD") winner.price = loser.price;
  if (!winner.urlValid && loser.urlValid) winner.urlValid = loser.urlValid;
  if (!winner.affiliatePlatform && loser.affiliatePlatform) winner.affiliatePlatform = loser.affiliatePlatform;

  // Keep richer local metadata from scraped event (tags, emoji, desc)
  if (!keepTm) {
    // Winner is scraped — it already has its own tags/emoji/desc
  } else {
    // Winner is TM — copy richer metadata from scraped if available
    if (loser.tags && (!winner.tags || winner.tags.length === 0)) winner.tags = loser.tags;
    if (loser.emoji && !winner.emoji) winner.emoji = loser.emoji;
    if (loser.desc && loser.desc.length > (winner.desc || "").length) winner.desc = loser.desc;
  }

  // Drop the loser + all other TM dupes in this group
  dropIds.add(loser.id);
  for (const t of tmEvents) {
    if (t.id !== winner.id) dropIds.add(t.id);
  }
  // Also drop other scraped dupes (keep only the best)
  for (const s of scraped) {
    if (s.id !== winner.id) dropIds.add(s.id);
  }

  mergeCount++;
  if (keepTm) keptTm++;
  else keptScraped++;
}

// Remove absorbed duplicates
const beforeDedup = ingested.length;
ingested = ingested.filter((e) => !dropIds.has(e.id));
if (mergeCount > 0) {
  console.log(`🔗 Smart dedup: ${mergeCount} pairs merged (kept TM: ${keptTm}, kept scraped: ${keptScraped}, dropped ${beforeDedup - ingested.length} dupes)`);
}

// ═══ VENUE URL FALLBACK: give URL-less events their venue calendar link ═══
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

// Get last pipeline run info
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
