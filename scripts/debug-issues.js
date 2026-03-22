const events = require("../data/events.json");

// ISSUE 1: Do scraped events and TM events for the same real-world event both appear?
// The dedupeKey strips non-alphanumeric, but titles may still differ enough
console.log("=== POTENTIAL DUPLICATE REAL-WORLD EVENTS ===");
const today = events.filter(e => e.date === "2026-02-26");
console.log("Today's events by source:");
today.forEach(e => {
  console.log(`  [${e.sourceId}] ${e.title} @ ${e.venue} | url: ${e.url ? "YES" : "NO"} | image: ${e.image ? "YES" : "NO"}`);
});

// Check fuzzy matches — same venue+date, different titles
console.log("\n=== SAME VENUE+DATE PAIRS (potential dupes) ===");
const byVenueDate = {};
events.forEach(e => {
  const key = (e.venue || "").toLowerCase().replace(/[^a-z0-9]/g, "") + "|" + e.date;
  if (!byVenueDate[key]) byVenueDate[key] = [];
  byVenueDate[key].push(e);
});

Object.entries(byVenueDate)
  .filter(([k, v]) => v.length > 1 && v.some(e => e.sourceId === "ticketmaster-api") && v.some(e => e.sourceId !== "ticketmaster-api"))
  .slice(0, 10)
  .forEach(([key, entries]) => {
    console.log("  Venue+Date:", key);
    entries.forEach(e => {
      console.log(`    [${e.sourceId}] "${e.title}" | url: ${e.url ? "YES" : "NO"} | image: ${e.image ? "YES" : "NO"}`);
    });
  });

// ISSUE 2: What does dedupeKey produce for potential dupes?
console.log("\n=== DEDUPEKEY COMPARISON FOR KNOWN DUPES ===");
const dedupeKey = (e) => `${(e.title || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "")}|${e.date}`;

// Check Supernovas specifically
const novas = events.filter(e => e.title.toLowerCase().includes("supernova"));
console.log("Supernovas events:");
novas.forEach(e => {
  console.log(`  "${e.title}" | key: ${dedupeKey(e)} | src: ${e.sourceId} | url: ${e.url ? "YES" : "NO"}`);
});

const dropkick = events.filter(e => e.title.toLowerCase().includes("dropkick"));
console.log("\nDropkick events:");
dropkick.forEach(e => {
  console.log(`  "${e.title}" | key: ${dedupeKey(e)} | src: ${e.sourceId} | url: ${e.url ? "YES" : "NO"}`);
});

// Count: how many scraped events appear alongside a TM event for same venue+date?
let overlapCount = 0;
Object.values(byVenueDate).forEach(group => {
  const hasTM = group.some(e => e.sourceId === "ticketmaster-api");
  const hasScraped = group.some(e => e.sourceId !== "ticketmaster-api");
  if (hasTM && hasScraped) overlapCount += group.filter(e => e.sourceId !== "ticketmaster-api").length;
});
console.log("\n=== SUMMARY ===");
console.log("Scraped events that overlap with a TM event (same venue+date):", overlapCount);
console.log("These scraped events have NO url and NO image, while the TM version does.");
