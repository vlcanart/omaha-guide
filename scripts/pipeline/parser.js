/**
 * ═══════════════════════════════════════════════════════════
 *  GO: Guide to Omaha — Claude Parser
 * ═══════════════════════════════════════════════════════════
 *
 *  Sends scraped content to Claude for structured extraction.
 *  Batches multiple sources into single API calls for efficiency.
 */

const { CATEGORY_KEYWORDS } = require("./config");

const API_KEY = process.env.ANTHROPIC_API_KEY;
const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = new Date().toISOString().split("T")[0];
const END_DATE = (() => { const d = new Date(); d.setDate(d.getDate() + 90); return d.toISOString().split("T")[0]; })();

// ═══ CALL CLAUDE ═══
async function callClaude(system, user, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: MODEL, max_tokens: 4096, system, messages: [{ role: "user", content: user }] }),
      });
      if (res.status === 429) {
        await sleep(5000 * (attempt + 1));
        continue;
      }
      if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
      const data = await res.json();
      return (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(3000 * (attempt + 1));
    }
  }
}

// ═══ TRUNCATE CONTENT ═══
// Claude context is limited — keep most relevant portions
function truncate(text, maxChars = 12000) {
  if (!text || text.length <= maxChars) return text;
  // Keep first 80% and last 20% to capture top events + footer links
  const head = Math.floor(maxChars * 0.8);
  const tail = maxChars - head;
  return text.slice(0, head) + "\n\n[...content truncated...]\n\n" + text.slice(-tail);
}

// ═══ PARSE SINGLE SOURCE ═══
async function parseSource(scrapedContent, source) {
  if (!scrapedContent || scrapedContent.length < 50) return [];

  const truncated = truncate(scrapedContent);
  const venueHint = source.venue ? `\nThe venue for all events on this page is "${source.venue}".` : "";
  const catHint = source.cats?.length ? `\nCategory hints: ${source.cats.join(", ")}` : "";

  const system = `You are an expert event data extractor for Omaha, Nebraska. Today is ${TODAY}.

RULES:
- Extract ONLY real events with confirmed dates between ${TODAY} and ${END_DATE}
- Each event MUST have: title, date (YYYY-MM-DD format), venue name, and area/neighborhood
- Do NOT invent events — only extract what's clearly in the text
- If a URL for the specific event/ticket is visible, include it
- If time or price isn't clear, use "TBD"
- For recurring events (weekly shows, etc.), include the next 4 occurrences
- Skip past events, closed registrations, and general descriptions
- Omaha area includes: Omaha, Council Bluffs, Papillion, La Vista, Bellevue, Ralston, Gretna, Elkhorn${venueHint}${catHint}

Return ONLY a JSON array. Each object:
{
  "title": "Event Name",
  "venue": "Venue Name",
  "area": "Neighborhood or City",
  "date": "YYYY-MM-DD",
  "time": "H:MM AM/PM or TBD",
  "price": "$X–$Y or Free or TBD",
  "desc": "1-2 sentence description",
  "url": "direct event/ticket URL if found, or null",
  "cat": "concerts|comedy|sports|festivals|family|arts"
}

If no events found, return [].`;

  const user = `Extract upcoming events from this ${source.name} page content:\n\n${truncated}`;

  try {
    const text = await callClaude(system, user);
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const events = JSON.parse(match[0]);
    return events.filter(e => e.title && e.date).map(e => ({ ...e, sourceId: source.id, sourcePriority: source.priority }));
  } catch (err) {
    console.error(`  ✗ Parse error for ${source.id}: ${err.message}`);
    return [];
  }
}

// ═══ BATCH PARSE — groups of 2-3 small sources per API call ═══
async function parseBatch(scraped, sources) {
  const results = [];

  // Sort sources: large/important ones get solo calls, small ones get batched
  const solo = [];
  const batchable = [];

  scraped.forEach(s => {
    if (!s.content) return;
    const bytes = Buffer.byteLength(s.content, "utf8");
    // Tier 1 or large content = solo; small sources batch together
    if (s.source.tier === 1 || bytes > 8000) solo.push(s);
    else batchable.push(s);
  });

  // Solo calls for important sources
  for (let i = 0; i < solo.length; i++) {
    const s = solo[i];
    console.log(`  🧠 Parsing ${s.source.id} (solo, ${(Buffer.byteLength(s.content) / 1024).toFixed(1)}KB)...`);
    const events = await parseSource(s.content, s.source);
    console.log(`    → ${events.length} events`);
    results.push(...events);
    if (i < solo.length - 1) await sleep(1500); // rate limit
  }

  // Batch small sources (2-3 per call)
  const batches = [];
  for (let i = 0; i < batchable.length; i += 2) {
    batches.push(batchable.slice(i, i + 2));
  }

  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi];
    console.log(`  🧠 Parsing batch: ${batch.map(s => s.source.id).join(" + ")}...`);

    // Combine content with clear separators
    const combined = batch.map(s =>
      `=== SOURCE: ${s.source.name} (${s.source.url}) ===\n${truncate(s.content, 6000)}`
    ).join("\n\n");

    // Use first source as template but tell Claude there are multiple
    const system = `You are an expert event data extractor for Omaha, Nebraska. Today is ${TODAY}.
Multiple event sources are provided below, separated by === SOURCE: ... === headers.
Extract events from ALL sources. Rules:
- Only real events with dates between ${TODAY} and ${END_DATE}
- Each must have: title, date (YYYY-MM-DD), venue, area
- Return a single JSON array combining events from all sources
- If no events, return []

Each object: {"title":"...","venue":"...","area":"...","date":"YYYY-MM-DD","time":"...","price":"...","desc":"...","url":"ticket/event URL or null","cat":"concerts|comedy|sports|festivals|family|arts"}`;

    try {
      const text = await callClaude(system, combined);
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        const events = JSON.parse(match[0]).filter(e => e.title && e.date);
        events.forEach(e => {
          // Try to attribute to correct source
          const matchedSource = batch.find(s =>
            s.source.venue && e.venue?.toLowerCase().includes(s.source.venue.toLowerCase().split(" ")[0])
          ) || batch[0];
          e.sourceId = matchedSource.source.id;
          e.sourcePriority = matchedSource.source.priority;
        });
        console.log(`    → ${events.length} events`);
        results.push(...events);
      }
    } catch (err) {
      console.error(`    ✗ Batch parse error: ${err.message}`);
    }
    if (bi < batches.length - 1) await sleep(1500);
  }

  return results;
}

// ═══ CLASSIFY (fallback if Claude didn't set category) ═══
function classifyEvent(event) {
  if (event.cat && event.cat !== "all") return event.cat;
  const text = `${event.title} ${event.desc || ""} ${event.venue || ""}`;
  for (const [cat, regex] of Object.entries(CATEGORY_KEYWORDS)) {
    if (regex.test(text)) return cat;
  }
  return "concerts"; // default
}

module.exports = { parseSource, parseBatch, classifyEvent, callClaude };
