const events = require("../data/events.json");
const tm = events.filter(e => e.sourceId === "ticketmaster-api");
const withUrl = tm.filter(e => e.url && e.url !== "#");
const noUrl = tm.filter(e => !e.url || e.url === "#");

console.log("TM events total:", tm.length);
console.log("With URL:", withUrl.length);
console.log("Without URL:", noUrl.length);
console.log("\nSample WITHOUT URL:");
noUrl.slice(0, 8).forEach(e => console.log("  ", e.title, "| tmId:", e.tmEventId));
console.log("\nSample WITH URL:");
withUrl.slice(0, 3).forEach(e => console.log("  ", e.title, "\n    URL:", e.url));
