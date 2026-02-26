/**
 * ═══════════════════════════════════════════════════════════
 *  GO: Guide to Omaha — Ticketmaster Discovery API
 * ═══════════════════════════════════════════════════════════
 *
 *  Fetches structured event data directly from the Ticketmaster
 *  Discovery API. No scraping or Claude parsing needed — the API
 *  returns real event details with verified ticket URLs.
 *
 *  Free tier: 5000 calls/day, 5 calls/sec
 *  Uses lat/long + 50mi radius centered on Omaha for reliable geo-filtering
 */

const fs = require("fs");
const path = require("path");

const API_KEY = process.env.TICKETMASTER_API_KEY;
const BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json";
const OMAHA_LAT = "41.2565";
const OMAHA_LON = "-95.9345";
const RADIUS = "50"; // miles
const PAGE_SIZE = 200;
const MAX_PAGES = 3;
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours
const CACHE_PATH = path.join(__dirname, "..", "..", "data", "cache", "ticketmaster-api.json");

const TODAY = new Date().toISOString().split("T")[0];
const END_DATE = (() => { const d = new Date(); d.setDate(d.getDate() + 90); return d.toISOString().split("T")[0]; })();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ═══ CATEGORY MAPPING ═══
// TM uses segment > genre > subGenre hierarchy. We check genre first (more specific).
const GENRE_TO_CAT = {
  // Comedy (lives under "Arts & Theatre" segment in TM)
  "comedy": "comedy",
  "stand-up comedy": "comedy",
  "stand up": "comedy",

  // Concerts / Music
  "rock": "concerts",
  "pop": "concerts",
  "hip-hop/rap": "concerts",
  "r&b": "concerts",
  "country": "concerts",
  "alternative": "concerts",
  "jazz": "concerts",
  "blues": "concerts",
  "folk": "concerts",
  "classical": "concerts",
  "metal": "concerts",
  "electronic": "concerts",
  "latin": "concerts",
  "reggae": "concerts",
  "soul": "concerts",
  "world": "concerts",
  "punk": "concerts",
  "indie": "concerts",
  "new age": "concerts",

  // Sports
  "basketball": "sports",
  "football": "sports",
  "hockey": "sports",
  "baseball": "sports",
  "soccer": "sports",
  "volleyball": "sports",
  "wrestling": "sports",
  "boxing": "sports",
  "mma/fighting arts": "sports",
  "motorsports/racing": "sports",
  "golf": "sports",
  "tennis": "sports",
  "rodeo": "sports",
  "equestrian": "sports",

  // Family
  "children's music": "family",
  "family": "family",
  "children's theatre": "family",
  "circus & specialty acts": "family",
  "ice shows": "family",
  "magic & illusion": "family",
  "puppetry": "family",

  // Arts
  "theatre": "arts",
  "dance": "arts",
  "opera": "arts",
  "ballet": "arts",
  "musical": "arts",
  "fine art": "arts",
  "film": "arts",
  "performance art": "arts",
  "spectacle": "arts",
  "variety": "arts",

  // Festivals
  "festival": "festivals",
  "fair": "festivals",
  "community/civic": "festivals",
};

const SEGMENT_TO_CAT = {
  "music": "concerts",
  "sports": "sports",
  "arts & theatre": "arts",
  "film": "arts",
  "miscellaneous": "festivals",
  "undefined": "concerts",
};

// ═══ AREA MAPPING ═══
// Map TM venue cities to our area names
const CITY_TO_AREA = {
  "omaha": "Omaha",
  "council bluffs": "Council Bluffs",
  "papillion": "Papillion",
  "la vista": "La Vista",
  "bellevue": "Bellevue",
  "ralston": "Ralston",
  "gretna": "Gretna",
  "elkhorn": "Omaha",
  "boys town": "Omaha",
  "carter lake": "Council Bluffs",
  "bennington": "Omaha",
  "springfield": "Papillion",
  "ashland": "Wider Net",
  "lincoln": null, // skip — outside metro
  "fremont": null,
};

// Cities in our metro area (lowercase). Events outside these are skipped.
const METRO_CITIES = new Set(Object.keys(CITY_TO_AREA).filter(c => CITY_TO_AREA[c] !== null));

// ═══ VENUE NAME NORMALIZATION ═══
const VENUE_ALIASES = {
  "chi health center omaha": "CHI Health Center",
  "chi health center arena": "CHI Health Center",
  "baxter arena": "Baxter Arena",
  "orpheum theater": "Orpheum Theater",
  "holland performing arts center": "Holland Center",
  "the admiral omaha": "The Admiral",
  "the admiral": "The Admiral",
  "slowdown": "The Slowdown",
  "the slowdown": "The Slowdown",
  "waiting room lounge": "The Waiting Room",
  "the waiting room": "The Waiting Room",
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

// ═══ CACHE ═══
function readCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) return null;
    const raw = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
    if (Date.now() - raw.timestamp > CACHE_TTL_MS) return null;
    return raw.events;
  } catch { return null; }
}

function writeCache(events) {
  const dir = path.dirname(CACHE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify({ timestamp: Date.now(), events }, null, 2));
}

// ═══ CLASSIFY EVENT ═══
function classifyTmEvent(classifications) {
  if (!classifications || !classifications.length) return "concerts";

  const c = classifications[0];

  // Check genre first (more specific)
  const genreName = (c.genre?.name || "").toLowerCase();
  if (GENRE_TO_CAT[genreName]) return GENRE_TO_CAT[genreName];

  // Check subGenre
  const subGenreName = (c.subGenre?.name || "").toLowerCase();
  if (GENRE_TO_CAT[subGenreName]) return GENRE_TO_CAT[subGenreName];

  // Fallback to segment
  const segmentName = (c.segment?.name || "").toLowerCase();
  if (SEGMENT_TO_CAT[segmentName]) return SEGMENT_TO_CAT[segmentName];

  return "concerts";
}

// ═══ NORMALIZE VENUE ═══
function normalizeVenue(venueName) {
  if (!venueName) return "TBD";
  const key = venueName.toLowerCase().trim();
  return VENUE_ALIASES[key] || venueName;
}

// ═══ MAP AREA ═══
function mapArea(venue) {
  if (!venue?.city?.name) return null;
  const city = venue.city.name.toLowerCase().trim();
  if (CITY_TO_AREA[city] !== undefined) return CITY_TO_AREA[city];
  // Check if city name contains a known metro city
  for (const [key, area] of Object.entries(CITY_TO_AREA)) {
    if (city.includes(key) && area !== null) return area;
  }
  return null; // outside metro — will be filtered out
}

// ═══ PICK BEST IMAGE ═══
// Prefer 16:9 ratio, width 640–1136 (ideal for card display)
function pickImage(images) {
  if (!images || !images.length) return null;

  // Prefer 16_9 ratio in ideal width range
  const ideal = images.find(
    (img) => img.ratio === "16_9" && img.width >= 640 && img.width <= 1136
  );
  if (ideal) return ideal.url;

  // Fallback: any 16_9 image
  const any16x9 = images.find((img) => img.ratio === "16_9" && img.width >= 500);
  if (any16x9) return any16x9.url;

  // Fallback: any image >= 500px wide
  const anyLarge = images.find((img) => img.width >= 500);
  if (anyLarge) return anyLarge.url;

  // Last resort: first image
  return images[0].url || null;
}

// ═══ MAP SINGLE EVENT ═══
function mapEvent(tmEvent) {
  // Filter out non-ticket products (suites, vouchers, hotel packages)
  const title = tmEvent.name || "";
  if (/^Suites:/i.test(title)) return null;
  if (/voucher/i.test(title)) return null;
  if (/hotel\s+reservations?/i.test(title)) return null;

  const venue = tmEvent._embedded?.venues?.[0];
  const area = mapArea(venue);
  if (area === null) return null; // outside metro

  // Skip cancelled/postponed
  const statusCode = tmEvent.dates?.status?.code;
  if (statusCode === "cancelled" || statusCode === "postponed") return null;

  // Date
  const localDate = tmEvent.dates?.start?.localDate;
  if (!localDate) return null;
  if (localDate < TODAY || localDate > END_DATE) return null;

  // Time
  const localTime = tmEvent.dates?.start?.localTime;
  let time = "TBD";
  if (localTime) {
    const [h, m] = localTime.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    time = `${h12}:${m} ${ampm}`;
  }

  // Price
  let price = "TBD";
  const priceRanges = tmEvent.priceRanges;
  if (priceRanges && priceRanges.length > 0) {
    const min = priceRanges[0].min;
    const max = priceRanges[0].max;
    if (min === 0 && max === 0) price = "Free";
    else if (min && max && min !== max) price = `$${min}–$${max}`;
    else if (min) price = `$${min}`;
    else if (max) price = `$${max}`;
  }

  // Category
  const cat = classifyTmEvent(tmEvent.classifications);

  // URL — prefer the main event URL, fallback to constructed URL
  const url = tmEvent.url || `https://www.ticketmaster.com/event/${tmEvent.id}`;

  // Image — pick best from TM images array
  const image = pickImage(tmEvent.images);

  // Description — TM often doesn't have one, use info or pleaseNote
  const desc = tmEvent.info
    || tmEvent.pleaseNote
    || (tmEvent._embedded?.attractions?.[0]?.name
      ? `${tmEvent._embedded.attractions[0].name} at ${normalizeVenue(venue?.name)}`
      : `Live event at ${normalizeVenue(venue?.name)}`);

  // Trim description to ~200 chars
  const shortDesc = desc.length > 200 ? desc.slice(0, 197) + "..." : desc;

  return {
    title: tmEvent.name,
    venue: normalizeVenue(venue?.name),
    area,
    date: localDate,
    time,
    price,
    desc: shortDesc,
    url,
    image,
    cat,
    sourceId: "ticketmaster-api",
    sourcePriority: 1,
    urlValid: true,
    affiliatePlatform: "ticketmaster",
    tmEventId: tmEvent.id,
  };
}

// ═══ FETCH FROM API ═══
async function fetchPage(page) {
  const params = new URLSearchParams({
    apikey: API_KEY,
    latlong: `${OMAHA_LAT},${OMAHA_LON}`,
    radius: RADIUS,
    unit: "miles",
    size: String(PAGE_SIZE),
    page: String(page),
    startDateTime: `${TODAY}T00:00:00Z`,
    endDateTime: `${END_DATE}T23:59:59Z`,
    sort: "date,asc",
  });

  const url = `${BASE_URL}?${params}`;
  const res = await fetch(url, {
    headers: { "Accept": "application/json" },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Ticketmaster API ${res.status}: ${body.slice(0, 200)}`);
  }

  return res.json();
}

async function fetchAllEvents() {
  const events = [];
  let totalPages = 1;

  for (let page = 0; page < Math.min(totalPages, MAX_PAGES); page++) {
    if (page > 0) await sleep(250); // respect rate limit (5/sec)

    const data = await fetchPage(page);
    const pageInfo = data.page;
    totalPages = pageInfo?.totalPages || 1;

    const tmEvents = data._embedded?.events || [];
    if (tmEvents.length === 0) break;

    for (const tmEvent of tmEvents) {
      const mapped = mapEvent(tmEvent);
      if (mapped) events.push(mapped);
    }

    console.log(`    Page ${page + 1}/${Math.min(totalPages, MAX_PAGES)}: ${tmEvents.length} raw → ${events.length} mapped so far`);
  }

  return events;
}

// ═══ MAIN EXPORT ═══
async function fetchTicketmasterEvents() {
  if (!API_KEY) {
    console.log("  ⏭ No TICKETMASTER_API_KEY — skipping Ticketmaster API");
    return [];
  }

  console.log("\n═══════════════════════════════════════");
  console.log("  PHASE 2b: TICKETMASTER API");
  console.log("═══════════════════════════════════════");

  // Check cache
  const cached = readCache();
  if (cached) {
    console.log(`  📦 Using cached Ticketmaster data (${cached.length} events)`);
    return cached;
  }

  console.log(`  🎫 Fetching Omaha events from Ticketmaster Discovery API...`);
  console.log(`     Location: ${OMAHA_LAT},${OMAHA_LON} (${RADIUS}mi radius)`);
  console.log(`     Date range: ${TODAY} to ${END_DATE}`);

  try {
    const events = await fetchAllEvents();
    console.log(`\n  ✓ Ticketmaster: ${events.length} events fetched`);

    // Cache results
    writeCache(events);
    console.log(`  ✓ Cached → ${CACHE_PATH}`);

    // Category breakdown
    const cats = {};
    events.forEach(e => { cats[e.cat] = (cats[e.cat] || 0) + 1; });
    console.log("  By category:");
    Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => console.log(`    ${c}: ${n}`));

    return events;
  } catch (err) {
    console.error(`  ✗ Ticketmaster API error: ${err.message}`);
    console.error("    Pipeline will continue with Jina sources only.");
    return [];
  }
}

module.exports = { fetchTicketmasterEvents };
