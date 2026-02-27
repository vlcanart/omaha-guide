/**
 * ═══════════════════════════════════════════════════════════
 *  GO: Guide to Omaha — Ticket Omaha Structured Data Scraper
 * ═══════════════════════════════════════════════════════════
 *
 *  Fetches event data directly from ticketomaha.com using JSON-LD
 *  structured data embedded in each event page. No Claude parsing needed.
 *
 *  Flow:
 *    1. Fetch sitemap page → extract event URLs
 *    2. Fetch each event page → extract JSON-LD (@type: "Event")
 *    3. Map to our event format
 *
 *  Respects robots.txt Crawl-delay: 5
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = "https://ticketomaha.com";
const SITEMAP_URL = `${BASE_URL}/sitemap`;
const CRAWL_DELAY_MS = 5000; // robots.txt Crawl-delay: 5
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const CACHE_PATH = path.join(__dirname, "..", "..", "data", "cache", "ticketomaha-api.json");
const FETCH_TIMEOUT_MS = 15000;

const TODAY = new Date().toISOString().split("T")[0];
const END_DATE = (() => { const d = new Date(); d.setDate(d.getDate() + 90); return d.toISOString().split("T")[0]; })();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ═══ VENUE NORMALIZATION ═══
// Reuse same aliases as ticketmaster.js for consistency
const VENUE_ALIASES = {
  "chi health center omaha": "CHI Health Center",
  "chi health center arena": "CHI Health Center",
  "baxter arena": "Baxter Arena",
  "orpheum theater": "Orpheum Theater",
  "the orpheum theater": "Orpheum Theater",
  "orpheum theatre": "Orpheum Theater",
  "holland performing arts center": "Holland Center",
  "holland center": "Holland Center",
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
  "omaha community playhouse": "Omaha Community Playhouse",
  "the rose theater": "The Rose Theater",
  "joslyn art museum": "Joslyn Art Museum",
  "kiewit luminarium": "Kiewit Luminarium",
  "lauritzen gardens": "Lauritzen Gardens",
  "the durham museum": "The Durham Museum",
  "kaneko": "KANEKO",
};

// ═══ AREA MAPPING ═══
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
};

// ═══ CATEGORY CLASSIFICATION ═══
const GENRE_TO_CAT = {
  "comedy": "comedy",
  "stand-up": "comedy",
  "improv": "comedy",
  "concert": "concerts",
  "music": "concerts",
  "rock": "concerts",
  "pop": "concerts",
  "jazz": "concerts",
  "blues": "concerts",
  "country": "concerts",
  "classical": "concerts",
  "hip-hop": "concerts",
  "r&b": "concerts",
  "alternative": "concerts",
  "folk": "concerts",
  "indie": "concerts",
  "electronic": "concerts",
  "latin": "concerts",
  "symphony": "concerts",
  "orchestra": "concerts",
  "sports": "sports",
  "basketball": "sports",
  "football": "sports",
  "hockey": "sports",
  "baseball": "sports",
  "soccer": "sports",
  "wrestling": "sports",
  "theatre": "arts",
  "theater": "arts",
  "play": "arts",
  "musical": "arts",
  "ballet": "arts",
  "dance": "arts",
  "opera": "arts",
  "drama": "arts",
  "art": "arts",
  "gallery": "arts",
  "exhibit": "arts",
  "film": "arts",
  "family": "family",
  "children": "family",
  "kids": "family",
  "festival": "festivals",
  "fair": "festivals",
  "gala": "festivals",
  "celebration": "festivals",
};

const TITLE_PATTERNS = {
  comedy:   /\b(comedy|comedian|stand.?up|improv|sketch|roast|funny)\b/i,
  sports:   /\b(basketball|football|soccer|hockey|baseball|volleyball|wrestling|boxing|mma|lancers|mavericks|storm chasers|union omaha)\b/i,
  concerts: /\b(concert|live music|band|singer|songwriter|dj|tour|acoustic|symphony|orchestra|jazz|blues|rock|country|hip.?hop|edm|folk|indie|pop)\b/i,
  family:   /\b(kids|children|family|sensory|storytime|puppet|magic show|camp|craft|workshop)\b/i,
  festivals:/\b(festival|fest|fiesta|fair|block party|celebration|parade|market|crawl|gala|fundraiser)\b/i,
  arts:     /\b(art|gallery|exhibit|theater|theatre|play|musical|ballet|dance|opera|film|cinema|reading|poetry|lecture)\b/i,
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

// ═══ FETCH WITH RETRY ═══
async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "GoGuideOmaha/1.0 (event aggregator; contact@goguideomaha.com)",
          "Accept": "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (i === retries) throw err;
      await sleep(2000);
    }
  }
}

// ═══ PARSE SITEMAP FOR EVENT URLS ═══
function extractEventUrls(sitemapXml) {
  const urls = [];
  // Sitemap is XML with <loc> tags: <loc>https://ticketomaha.com/events/slug</loc>
  const locRegex = /<loc>\s*(https?:\/\/ticketomaha\.com\/events\/([^<\s]+))\s*<\/loc>/gi;
  let match;
  while ((match = locRegex.exec(sitemapXml)) !== null) {
    const fullUrl = match[1];
    const slug = match[2];
    // Skip category/theme pages (e.g., /events/opera, /events?genres=...)
    // Valid event slugs have a short alphanumeric code suffix like "wicked-jhby"
    if (!slug.includes("?") && !slug.includes("#") && /^[a-z0-9-]+$/i.test(slug) && slug.includes("-")) {
      if (!urls.includes(fullUrl)) urls.push(fullUrl);
    }
  }
  return urls;
}

// ═══ EXTRACT JSON-LD FROM HTML ═══
function extractJsonLd(html) {
  const events = [];
  const scriptRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      // JSON-LD can be a single object or an array
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item["@type"] === "Event") {
          events.push(item);
        }
        // Some pages nest events inside @graph
        if (item["@graph"]) {
          for (const graphItem of item["@graph"]) {
            if (graphItem["@type"] === "Event") {
              events.push(graphItem);
            }
          }
        }
      }
    } catch {
      // Invalid JSON — skip
    }
  }
  return events;
}

// ═══ EXTRACT PRICE FROM PAGE TEXT ═══
function extractPrice(html) {
  // Look for "Tickets start at $X" or similar patterns
  const pricePatterns = [
    /tickets?\s+start(?:ing)?\s+at\s+\$(\d+(?:\.\d{2})?)/i,
    /starting\s+at\s+\$(\d+(?:\.\d{2})?)/i,
    /from\s+\$(\d+(?:\.\d{2})?)/i,
    /\$(\d+(?:\.\d{2})?)\s*[-–]\s*\$(\d+(?:\.\d{2})?)/i,
    /price[:\s]+\$(\d+(?:\.\d{2})?)/i,
  ];

  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match) {
      if (match[2]) {
        return `$${Math.floor(parseFloat(match[1]))}–$${Math.floor(parseFloat(match[2]))}`;
      }
      return `$${Math.floor(parseFloat(match[1]))}`;
    }
  }

  if (/\bfree\s*(admission|entry|event)?\b/i.test(html)) {
    return "Free";
  }

  return "TBD";
}

// ═══ EXTRACT GENRE/CATEGORY FROM PAGE ═══
function extractGenres(html) {
  const genres = [];
  // Look for genre links like <a href="/events?genres=...">Comedy</a>
  const genreRegex = /href=["']\/events\?genres=[^"']*["'][^>]*>([^<]+)<\/a>/gi;
  let match;
  while ((match = genreRegex.exec(html)) !== null) {
    genres.push(match[1].trim().toLowerCase());
  }
  return genres;
}

// ═══ CLASSIFY EVENT ═══
function classifyEvent(title, genres) {
  // Check genres from page first
  for (const genre of genres) {
    if (GENRE_TO_CAT[genre]) return GENRE_TO_CAT[genre];
  }

  // Fall back to title pattern matching
  for (const [cat, pattern] of Object.entries(TITLE_PATTERNS)) {
    if (pattern.test(title)) return cat;
  }

  return "arts"; // Default — Ticket Omaha is primarily performing arts
}

// ═══ NORMALIZE VENUE ═══
function normalizeVenue(venueName) {
  if (!venueName) return "TBD";
  const key = venueName.toLowerCase().trim();
  return VENUE_ALIASES[key] || venueName;
}

// ═══ MAP AREA FROM VENUE ADDRESS ═══
function mapArea(location) {
  if (!location) return "Omaha"; // Default for Ticket Omaha (Omaha-focused)

  const address = location.address;
  if (!address) return "Omaha";

  const city = (address.addressLocality || "").toLowerCase().trim();
  if (CITY_TO_AREA[city] !== undefined) return CITY_TO_AREA[city];

  // Check if city name contains a known metro city
  for (const [key, area] of Object.entries(CITY_TO_AREA)) {
    if (city.includes(key)) return area;
  }

  return "Omaha"; // Ticket Omaha is Omaha-focused, safe default
}

// ═══ FORMAT TIME ═══
function formatTime(isoDate) {
  if (!isoDate) return "TBD";
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return "TBD";
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  } catch {
    return "TBD";
  }
}

// ═══ CLEAN TITLE ═══
// Strip date suffixes: "Bob Dylan | Mar. 21, 2026" → "Bob Dylan"
// Also strips "| Orpheum Theater" venue suffixes
function cleanTitle(raw) {
  if (!raw) return raw;
  // Strip " | Mon. DD, YYYY" or " | Month DD, YYYY" date suffixes
  let t = raw.replace(/\s*\|\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s*\d{4}\s*$/i, "");
  // Strip " | Venue Name" suffixes (anything after last pipe that looks like a venue)
  // Only strip if the pipe-separated part matches a known venue
  const parts = t.split(/\s*\|\s*/);
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1].toLowerCase().trim();
    if (VENUE_ALIASES[lastPart]) {
      t = parts.slice(0, -1).join(" | ");
    }
  }
  return t.trim();
}

// ═══ MAP SINGLE JSON-LD EVENT ═══
function mapEvent(jsonLdEvent, pageUrl, pageHtml) {
  const title = cleanTitle(jsonLdEvent.name);
  if (!title) return null;

  // Date
  const startDate = jsonLdEvent.startDate;
  if (!startDate) return null;

  let localDate;
  try {
    const d = new Date(startDate);
    if (isNaN(d.getTime())) return null;
    localDate = d.toISOString().split("T")[0];
  } catch {
    return null;
  }

  // Filter by date range
  if (localDate < TODAY || localDate > END_DATE) return null;

  // Time
  const time = formatTime(startDate);

  // Venue
  const location = jsonLdEvent.location;
  const venueName = location?.name || "TBD";
  const venue = normalizeVenue(venueName);

  // Area
  const area = mapArea(location);

  // Price — try JSON-LD offers first, then page text
  let price = "TBD";
  const offers = jsonLdEvent.offers;
  if (offers) {
    const offerList = Array.isArray(offers) ? offers : [offers];
    const prices = offerList
      .map(o => parseFloat(o.price))
      .filter(p => !isNaN(p) && p >= 0);
    if (prices.length > 0) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (min === 0 && max === 0) price = "Free";
      else if (min !== max) price = `$${Math.floor(min)}–$${Math.floor(max)}`;
      else price = `$${Math.floor(min)}`;
    }
  }
  if (price === "TBD" && pageHtml) {
    price = extractPrice(pageHtml);
  }

  // Description
  let desc = jsonLdEvent.description || `${title} at ${venue}`;
  // Clean HTML tags from description
  desc = desc.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (desc.length > 200) desc = desc.slice(0, 197) + "...";

  // Image
  let image = null;
  if (jsonLdEvent.image) {
    if (typeof jsonLdEvent.image === "string") {
      image = jsonLdEvent.image;
    } else if (Array.isArray(jsonLdEvent.image)) {
      image = jsonLdEvent.image[0];
    } else if (jsonLdEvent.image.url) {
      image = jsonLdEvent.image.url;
    }
  }

  // Category
  const genres = pageHtml ? extractGenres(pageHtml) : [];
  const cat = classifyEvent(title, genres);

  return {
    title,
    venue,
    area,
    date: localDate,
    time,
    price,
    desc,
    url: pageUrl,
    image,
    cat,
    sourceId: "ticketomaha-api",
    sourcePriority: 3,
    urlValid: true,
  };
}

// ═══ MAIN EXPORT ═══
async function fetchTicketOmahaEvents() {
  console.log("\n═══════════════════════════════════════");
  console.log("  PHASE 2c: TICKET OMAHA (JSON-LD)");
  console.log("═══════════════════════════════════════");

  // Check cache
  const cached = readCache();
  if (cached) {
    console.log(`  📦 Using cached Ticket Omaha data (${cached.length} events)`);
    return cached;
  }

  console.log(`  🎟  Fetching event URLs from ${SITEMAP_URL}...`);

  let eventUrls;
  try {
    const sitemapHtml = await fetchWithRetry(SITEMAP_URL);
    eventUrls = extractEventUrls(sitemapHtml);
    console.log(`  Found ${eventUrls.length} event page URLs`);
  } catch (err) {
    console.error(`  ✗ Failed to fetch sitemap: ${err.message}`);
    console.error("    Pipeline will continue without Ticket Omaha.");
    return [];
  }

  if (eventUrls.length === 0) {
    console.log("  ⚠ No event URLs found in sitemap");
    return [];
  }

  console.log(`  Crawl delay: ${CRAWL_DELAY_MS / 1000}s between requests`);
  console.log(`  Estimated time: ~${Math.ceil(eventUrls.length * CRAWL_DELAY_MS / 60000)} minutes`);

  const events = [];
  let fetched = 0;
  let failed = 0;

  for (const url of eventUrls) {
    fetched++;
    try {
      const html = await fetchWithRetry(url, 1);
      const jsonLdEvents = extractJsonLd(html);

      for (const jsonLd of jsonLdEvents) {
        const mapped = mapEvent(jsonLd, url, html);
        if (mapped) events.push(mapped);
      }

      if (fetched % 20 === 0 || fetched === eventUrls.length) {
        console.log(`    ${fetched}/${eventUrls.length} pages fetched → ${events.length} events so far`);
      }
    } catch (err) {
      failed++;
      if (failed <= 5) {
        console.log(`    ⚠ Failed: ${url.split("/events/")[1] || url} — ${err.message}`);
      }
    }

    // Crawl delay between requests
    if (fetched < eventUrls.length) {
      await sleep(CRAWL_DELAY_MS);
    }
  }

  if (failed > 5) {
    console.log(`    ... and ${failed - 5} more failures`);
  }

  console.log(`\n  ✓ Ticket Omaha: ${events.length} events from ${fetched - failed} pages (${failed} failed)`);

  // Dedupe by title+date (multi-showtime pages can produce duplicates)
  const seen = new Set();
  const deduped = events.filter(e => {
    const key = `${e.title.toLowerCase().replace(/[^a-z0-9]/g, "")}|${e.date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (deduped.length < events.length) {
    console.log(`  Deduped: ${events.length} → ${deduped.length} (removed ${events.length - deduped.length} same-day duplicates)`);
  }

  // Cache results
  writeCache(deduped);
  console.log(`  ✓ Cached → ${CACHE_PATH}`);

  // Category breakdown
  const cats = {};
  deduped.forEach(e => { cats[e.cat] = (cats[e.cat] || 0) + 1; });
  console.log("  By category:");
  Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => console.log(`    ${c}: ${n}`));

  return deduped;
}

module.exports = { fetchTicketOmahaEvents };
