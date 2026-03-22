const events = require("../data/events.json");

// Check for duplicates — same title+date with different sourceIds
const byKey = {};
events.forEach(e => {
  const key = (e.title||"").toLowerCase().trim().replace(/\s+/g," ") + "|" + e.date;
  if (!byKey[key]) byKey[key] = [];
  byKey[key].push({ sourceId: e.sourceId, url: e.url ? "YES" : "NO", image: e.image ? "YES" : "NO", title: e.title });
});

const dups = Object.entries(byKey).filter(([k, v]) => v.length > 1);
console.log("Duplicate events (same title+date, different sources):", dups.length);
dups.slice(0, 15).forEach(([key, entries]) => {
  console.log("  Key:", key.substring(0, 70));
  entries.forEach(e => console.log("    src:", e.sourceId, "| url:", e.url, "| img:", e.image));
});

// Check how dedup works in events-data.js
console.log("\n=== Order in events.json ===");
console.log("First 5 events sourceIds:", events.slice(0, 5).map(e => e.sourceId));
console.log("Last 5 events sourceIds:", events.slice(-5).map(e => e.sourceId));

// Where do TM events sit in the array?
let firstTM = -1, lastTM = -1;
events.forEach((e, i) => {
  if (e.sourceId === "ticketmaster-api") {
    if (firstTM === -1) firstTM = i;
    lastTM = i;
  }
});
console.log("TM events range: index", firstTM, "to", lastTM, "of", events.length);

// Check how many scraped events have the SAME title+date as a TM event
const tmKeys = new Set();
events.filter(e => e.sourceId === "ticketmaster-api").forEach(e => {
  tmKeys.add((e.title||"").toLowerCase().trim().replace(/\s+/g," ") + "|" + e.date);
});

const scrapedDupOfTM = events.filter(e => {
  if (e.sourceId === "ticketmaster-api") return false;
  const key = (e.title||"").toLowerCase().trim().replace(/\s+/g," ") + "|" + e.date;
  return tmKeys.has(key);
});
console.log("\nScraped events that duplicate a TM event:", scrapedDupOfTM.length);
scrapedDupOfTM.forEach(e => console.log("  ", e.title, "|", e.date, "| src:", e.sourceId, "| url:", e.url));
