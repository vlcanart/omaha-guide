#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════
 *  GO: Guide to Omaha — Event Ingestion Pipeline
 * ═══════════════════════════════════════════════════════════
 *
 *  Scans all 39 venues for upcoming events using Claude API
 *  with web search, normalizes results, deduplicates, and
 *  outputs events.json for the app to consume.
 *
 *  Usage:
 *    ANTHROPIC_API_KEY=sk-ant-... node scripts/ingest-events.js
 *
 *  Options:
 *    --venue "Slowdown"     Only scan a specific venue
 *    --type "Arena"         Only scan venues of a specific type
 *    --days 60              How far ahead to look (default: 60)
 *    --dry-run              Print results without saving
 *    --merge                Merge with existing events.json instead of replacing
 *
 * ═══════════════════════════════════════════════════════════
 */

const fs = require("fs");
const path = require("path");

// ── Config ──────────────────────────────────────────────────
const API_KEY = process.env.ANTHROPIC_API_KEY;
const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";
const EVENTS_PATH = path.join(__dirname, "..", "data", "events.json");
const LOG_PATH = path.join(__dirname, "..", "data", "ingest-log.json");

// ── CLI Args ────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
};
const hasFlag = (flag) => args.includes(flag);

const FILTER_VENUE = getArg("--venue");
const FILTER_TYPE = getArg("--type");
const LOOK_AHEAD_DAYS = parseInt(getArg("--days") || "60", 10);
const DRY_RUN = hasFlag("--dry-run");
const MERGE = hasFlag("--merge");

// ── Venue Database ──────────────────────────────────────────
// Mirrors what's in page.jsx — single source of truth for scraping
const VENUES = [
  // Arenas & Main Stages
  { name: "CHI Health Center", type: "Arena", url: "https://www.chihealthcenteromaha.com", ticketing: "Ticketmaster" },
  { name: "Baxter Arena", type: "Arena", url: "https://baxterarena.com", ticketing: "Ticketmaster" },
  { name: "Steelhouse Omaha", type: "Performing Arts", url: "https://steelhouseomaha.com", ticketing: "Ticketmaster" },
  { name: "The Astro", type: "Arena", url: "https://www.theastrotheater.com", ticketing: "Ticketmaster" },
  { name: "Orpheum Theater", type: "Performing Arts", url: "https://o-pa.org", ticketing: "Ticketmaster" },
  { name: "Holland PAC", type: "Performing Arts", url: "https://o-pa.org", ticketing: "Ticketmaster" },
  { name: "Liberty First Credit Union Arena", type: "Arena", url: "https://www.libertyfirstcreditunionarena.com", ticketing: "Ticketmaster" },
  { name: "Charles Schwab Field", type: "Arena", url: "https://www.charlesschwabfieldomaha.com", ticketing: "Ticketmaster" },
  { name: "Stir Concert Cove", type: "Outdoor", url: "https://www.stircove.com", ticketing: "Ticketmaster" },
  { name: "Werner Park", type: "Outdoor", url: "https://www.milb.com/omaha", ticketing: "MiLB" },
  // Performing Arts & Theater
  { name: "Omaha Community Playhouse", type: "Performing Arts", url: "https://www.omahaplayhouse.com", ticketing: "Direct" },
  { name: "BLUEBARN Theatre", type: "Performing Arts", url: "https://bluebarn.org", ticketing: "Direct" },
  { name: "The Rose Theater", type: "Performing Arts", url: "https://www.rosetheater.org", ticketing: "Direct" },
  { name: "Film Streams", type: "Performing Arts", url: "https://filmstreams.org", ticketing: "Direct" },
  // Indie / Club
  { name: "The Slowdown", type: "Indie / Club", url: "https://theslowdown.com", ticketing: "See Tickets" },
  { name: "The Waiting Room", type: "Indie / Club", url: "https://waitingroomlounge.com", ticketing: "Etix" },
  { name: "Reverb Lounge", type: "Indie / Club", url: "https://reverblounge.com", ticketing: "Etix" },
  { name: "The Admiral", type: "Indie / Club", url: "https://www.admiralomaha.com", ticketing: "Etix" },
  { name: "Barnato", type: "Indie / Club", url: "https://barnato.bar", ticketing: "Etix" },
  // Bars & Restaurants
  { name: "The Jewell", type: "Bar / Venue", url: "https://jewellomaha.com", ticketing: "Direct" },
  { name: "Noli's Pizzeria", type: "Bar / Venue", url: "https://nolispizzeria.com", ticketing: "None" },
  { name: "The Down Under Lounge", type: "Bar / Venue", url: "https://theduomaha.com", ticketing: "None" },
  { name: "Harney Street Tavern", type: "Bar / Venue", url: "https://harneystreettavern.com", ticketing: "None" },
  { name: "O'Leaver's", type: "Bar / Venue", url: "https://oleavers.com", ticketing: "None" },
  { name: "Bogie's West", type: "Bar / Venue", url: "https://bogiesbar.com", ticketing: "None" },
  { name: "The B. Bar", type: "Bar / Venue", url: "https://thebbaromaha.com", ticketing: "None" },
  { name: "Buck's Bar and Grill", type: "Bar / Venue", url: "https://bucksbarandgrill.com", ticketing: "None" },
  // Comedy Clubs
  { name: "Funny Bone Comedy Club", type: "Comedy Club", url: "https://omaha.funnybone.com", ticketing: "Etix" },
  { name: "The Backline Comedy Theatre", type: "Comedy Club", url: "https://backlinecomedy.com", ticketing: "Direct" },
  { name: "Big Canvas Comedy", type: "Comedy Club", url: "https://bigcanvascomedy.com", ticketing: "Direct" },
  { name: "The Dubliner Pub", type: "Comedy Club", url: "https://dublinerpubomaha.com", ticketing: "None" },
  // Museums & Attractions (seasonal/special events only)
  { name: "Henry Doorly Zoo", type: "Museum / Attraction", url: "https://www.omahazoo.com", ticketing: "Direct" },
  { name: "Kiewit Luminarium", type: "Museum / Attraction", url: "https://kiewitluminarium.org", ticketing: "Direct" },
  { name: "Joslyn Art Museum", type: "Museum / Attraction", url: "https://joslyn.org", ticketing: "Free" },
  { name: "The Durham Museum", type: "Museum / Attraction", url: "https://durhammuseum.org", ticketing: "Direct" },
  { name: "Lauritzen Gardens", type: "Museum / Attraction", url: "https://www.lauritzengardens.org", ticketing: "Direct" },
  { name: "Fontenelle Forest", type: "Museum / Attraction", url: "https://fontenelleforest.org", ticketing: "Direct" },
  { name: "SAC & Aerospace Museum", type: "Museum / Attraction", url: "https://sacmuseum.org", ticketing: "Direct" },
  { name: "Omaha Children's Museum", type: "Museum / Attraction", url: "https://ocm.org", ticketing: "Direct" },
  { name: "El Museo Latino", type: "Museum / Attraction", url: "https://elmuseolatino.org", ticketing: "Direct" },
];

// ── Category Mapping ────────────────────────────────────────
// Maps venue types + keywords to app categories
function classifyEvent(title, venueName, venueType) {
  const t = (title || "").toLowerCase();
  const v = (venueName || "").toLowerCase();

  // Comedy — venue type or keywords
  if (venueType === "Comedy Club" || /\b(comedy|comedian|stand-up|standup|improv|sketch comedy|open mic comedy|funny bone|backline|big canvas)\b/i.test(t))
    return "comedy";

  // Sports keywords
  if (/\b(basketball|football|soccer|hockey|baseball|volleyball|wrestling|mma|boxing|creighton|husker|maverick|storm chaser|union omaha|lancers)\b/i.test(t))
    return "sports";

  // Festival keywords
  if (/\b(festival|fest|fiesta|fair|block party|celebration|parade|cinco|oktoberfest|market|farmers)\b/i.test(t))
    return "festivals";

  // Family keywords
  if (/\b(kids|children|family|zoo|safari|easter|halloween|holiday|christmas|sensory|storytime)\b/i.test(t) || venueType === "Museum / Attraction")
    return "family";

  // Arts keywords
  if (/\b(art|gallery|exhibit|theater|theatre|play|musical|ballet|dance|opera|film|cinema|reading|poetry|lecture)\b/i.test(t))
    return "arts";

  // Default: concerts (most venue events are music)
  return "concerts";
}

// Map titles to genre tags
function inferTags(title, cat) {
  const t = (title || "").toLowerCase();
  const tags = [];

  if (cat === "concerts") {
    if (/country|nashville|honky/i.test(t)) tags.push("Country");
    if (/rock|punk|metal|hardcore|grunge/i.test(t)) tags.push("Rock");
    if (/jazz|blues|soul/i.test(t)) tags.push("Jazz");
    if (/edm|dj|electronic|dubstep|house|techno/i.test(t)) tags.push("EDM");
    if (/comedy|comedian|stand-up|standup|funny/i.test(t)) tags.push("Comedy");
    if (/hip.?hop|rap/i.test(t)) tags.push("Hip-Hop");
    if (/indie|alternative/i.test(t)) tags.push("Indie");
    if (/folk|acoustic|singer/i.test(t)) tags.push("Folk");
    if (/pop/i.test(t)) tags.push("Pop");
    if (/symphony|orchestra|classical/i.test(t)) tags.push("Orchestra");
    if (/tribute|cover/i.test(t)) tags.push("Tribute");
    if (tags.length === 0) tags.push("Live Music");
  }
  if (cat === "sports") {
    if (/basketball/i.test(t)) tags.push("Basketball");
    if (/football/i.test(t)) tags.push("Football");
    if (/soccer/i.test(t)) tags.push("Soccer");
    if (/hockey/i.test(t)) tags.push("Hockey");
    if (/baseball/i.test(t)) tags.push("Baseball");
    if (/volleyball/i.test(t)) tags.push("Volleyball");
  }
  if (/free|no cover|\$0/i.test(t)) tags.push("Free");

  return tags.length > 0 ? tags : ["Event"];
}

// ── API Call ────────────────────────────────────────────────
async function callClaude(systemPrompt, userPrompt, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
          tools: [{ type: "web_search_20250305", name: "web_search" }],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`API ${res.status}: ${err}`);
      }

      const data = await res.json();
      const text = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");

      return text;
    } catch (err) {
      console.error(`  ⚠ Attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await sleep(3000 * (attempt + 1));
    }
  }
}

// ── Helpers ─────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TODAY = new Date().toISOString().split("T")[0];
const END_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + LOOK_AHEAD_DAYS);
  return d.toISOString().split("T")[0];
})();

function dedupeKey(ev) {
  return `${(ev.title || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "")}|${ev.date}`;
}

// ── Batch Venues into Groups ────────────────────────────────
// Group venues for efficient API calls (3-5 venues per call)
function batchVenues(venues, batchSize = 4) {
  const batches = [];
  for (let i = 0; i < venues.length; i += batchSize) {
    batches.push(venues.slice(i, i + batchSize));
  }
  return batches;
}

// ── Main Ingestion ──────────────────────────────────────────
async function ingestBatch(venues, batchIndex, totalBatches) {
  const venueList = venues
    .map((v) => `• ${v.name} (${v.url}) — ${v.ticketing} ticketing`)
    .join("\n");

  const systemPrompt = `You are an event data researcher for Omaha, Nebraska. Today is ${TODAY}.
Your job is to find REAL upcoming events at specific venues using web search.

CRITICAL RULES:
- Only return events you find from actual web sources (venue websites, Ticketmaster, Etix, etc.)
- Do NOT invent or fabricate events
- Each event MUST have a real date in YYYY-MM-DD format between ${TODAY} and ${END_DATE}
- If you cannot find events for a venue, skip it — do not guess
- Search each venue's website or ticketing platform for their calendar/schedule

Return ONLY a JSON array. Each object:
{
  "title": "Artist/Event Name",
  "venue": "Exact Venue Name",
  "date": "YYYY-MM-DD",
  "time": "H:MM PM",
  "price": "$X–$Y or Free or TBD",
  "desc": "1-2 sentence description",
  "url": "direct ticket/event URL if available, or venue URL",
  "ytId": "YouTube video ID for the artist/act (11 chars from youtube.com/watch?v=XXXXXXXXXXX) or null if not found"
}

For ytId: search YouTube for the artist's most popular official music video or live performance. Extract just the video ID (the 11 characters after v= in a YouTube URL). If it's not a music/performance act (e.g. a sporting event), set ytId to null.

No markdown, no explanation — just the JSON array. If no events found, return [].`;

  const userPrompt = `Search for upcoming events at these Omaha venues from ${TODAY} to ${END_DATE}:

${venueList}

Search each venue's website and ticketing platform for their event calendar. Find all scheduled events with confirmed dates.`;

  console.log(
    `\n📡 Batch ${batchIndex + 1}/${totalBatches}: ${venues.map((v) => v.name).join(", ")}`
  );

  try {
    const text = await callClaude(systemPrompt, userPrompt);

    // Extract JSON array from response
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      console.log("  ⚠ No JSON array found in response");
      return [];
    }

    const raw = JSON.parse(match[0]);
    console.log(`  ✓ Found ${raw.length} raw events`);

    // Normalize each event
    const normalized = raw
      .filter((e) => e.title && e.date && e.venue)
      .map((e, i) => {
        const venue = venues.find(
          (v) =>
            v.name.toLowerCase() === (e.venue || "").toLowerCase() ||
            (e.venue || "").toLowerCase().includes(v.name.toLowerCase().split(" ")[0])
        );
        const venueType = venue?.type || "Indie / Club";
        const cat = classifyEvent(e.title, e.venue, venueType);

        return {
          id: Date.now() + batchIndex * 1000 + i,
          title: e.title.trim(),
          cat,
          venue: e.venue.trim(),
          date: e.date,
          time: e.time || "TBD",
          price: e.price || "TBD",
          url: e.url || venue?.url || "#",
          desc: (e.desc || `Live at ${e.venue}.`).trim(),
          tags: inferTags(e.title, cat),
          emoji: { concerts: "🎵", sports: "🏆", festivals: "🎉", family: "👨‍👩‍👧", arts: "🎨", comedy: "😂" }[cat] || "🎵",
          feat: false,
          ytId: e.ytId || null,
          source: "ingestion",
          ingested: new Date().toISOString(),
        };
      });

    return normalized;
  } catch (err) {
    console.error(`  ✗ Batch failed: ${err.message}`);
    return [];
  }
}

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  GO: Guide to Omaha — Event Ingestion Pipeline");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Date range: ${TODAY} → ${END_DATE} (${LOOK_AHEAD_DAYS} days)`);

  if (!API_KEY) {
    console.error("\n✗ Missing ANTHROPIC_API_KEY environment variable.");
    console.error("  Run: ANTHROPIC_API_KEY=sk-ant-... node scripts/ingest-events.js");
    process.exit(1);
  }

  // Filter venues if requested
  let venues = [...VENUES];
  if (FILTER_VENUE) {
    venues = venues.filter((v) =>
      v.name.toLowerCase().includes(FILTER_VENUE.toLowerCase())
    );
    console.log(`  Filter: venue matching "${FILTER_VENUE}" (${venues.length} found)`);
  }
  if (FILTER_TYPE) {
    venues = venues.filter((v) =>
      v.type.toLowerCase().includes(FILTER_TYPE.toLowerCase())
    );
    console.log(`  Filter: type matching "${FILTER_TYPE}" (${venues.length} found)`);
  }

  console.log(`  Scanning ${venues.length} venues...\n`);

  // Batch venues (4 per API call to stay focused)
  const batches = batchVenues(venues, 4);
  let allEvents = [];

  for (let i = 0; i < batches.length; i++) {
    const events = await ingestBatch(batches[i], i, batches.length);
    allEvents.push(...events);

    // Rate limiting: wait between batches
    if (i < batches.length - 1) {
      console.log("  ⏳ Waiting 2s before next batch...");
      await sleep(2000);
    }
  }

  // Deduplicate
  const seen = new Set();
  const deduped = allEvents.filter((e) => {
    const key = dedupeKey(e);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`\n──────────────────────────────────────────────────`);
  console.log(`  Raw events found:    ${allEvents.length}`);
  console.log(`  After dedup:         ${deduped.length}`);
  console.log(`  Duplicates removed:  ${allEvents.length - deduped.length}`);

  // Category breakdown
  const catCounts = {};
  deduped.forEach((e) => {
    catCounts[e.cat] = (catCounts[e.cat] || 0) + 1;
  });
  console.log(`\n  By category:`);
  Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, cnt]) => console.log(`    ${cat}: ${cnt}`));

  // Venue coverage
  const venueCoverage = new Set(deduped.map((e) => e.venue));
  console.log(`\n  Venues with events:  ${venueCoverage.size}/${venues.length}`);

  if (DRY_RUN) {
    console.log("\n  🏃 Dry run — not saving. Sample output:");
    console.log(JSON.stringify(deduped.slice(0, 3), null, 2));
    return;
  }

  // Ensure data directory exists
  const dataDir = path.dirname(EVENTS_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Merge with existing if requested
  let finalEvents = deduped;
  if (MERGE && fs.existsSync(EVENTS_PATH)) {
    const existing = JSON.parse(fs.readFileSync(EVENTS_PATH, "utf8"));
    const existingKeys = new Set(existing.map(dedupeKey));
    const newOnly = deduped.filter((e) => !existingKeys.has(dedupeKey(e)));

    // Also drop expired events from existing
    const todayStr = TODAY;
    const fresh = existing.filter((e) => e.date >= todayStr);

    finalEvents = [...fresh, ...newOnly];
    console.log(`\n  Existing events kept: ${fresh.length}`);
    console.log(`  New events added:    ${newOnly.length}`);
    console.log(`  Total:               ${finalEvents.length}`);
  }

  // Sort by date
  finalEvents.sort((a, b) => a.date.localeCompare(b.date));

  // Save events
  fs.writeFileSync(EVENTS_PATH, JSON.stringify(finalEvents, null, 2));
  console.log(`\n  ✓ Saved ${finalEvents.length} events → ${EVENTS_PATH}`);

  // Save ingestion log
  const log = {
    timestamp: new Date().toISOString(),
    venuesScanned: venues.length,
    batchesRun: batches.length,
    rawFound: allEvents.length,
    afterDedup: deduped.length,
    finalCount: finalEvents.length,
    categories: catCounts,
    venuesCovered: [...venueCoverage],
  };
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
  console.log(`  ✓ Saved ingestion log → ${LOG_PATH}`);

  console.log("\n══════════════════════════════════════════════════");
  console.log("  ✅ Ingestion complete! Next steps:");
  console.log("  1. Review: cat data/events.json");
  console.log("  2. Build:  npm run build");
  console.log("  3. Deploy: drag 'out' folder to Netlify");
  console.log("══════════════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("\n✗ Fatal error:", err.message);
  process.exit(1);
});
