#!/usr/bin/env node
/**
 * Quick diagnostic: check data quality in events-data.js after prebuild
 */
const fs = require("fs");
const path = require("path");

const raw = fs.readFileSync(path.join(__dirname, "..", "app", "events-data.js"), "utf8");
const match = raw.match(/export const INGESTED_EVENTS = (\[[\s\S]*?\]);/);
if (!match) { console.log("Could not parse events-data.js"); process.exit(1); }
const events = JSON.parse(match[1]);

const total = events.length;
const withImage = events.filter(e => e.image).length;
const withUrl = events.filter(e => e.url).length;
const withBoth = events.filter(e => e.image && e.url).length;
const noImgNoUrl = events.filter(e => !e.image && !e.url).length;
const priceTbd = events.filter(e => !e.price || e.price === "TBD").length;
const tmEvents = events.filter(e => e.sourceId === "ticketmaster-api").length;
const scrapedEvents = events.filter(e => e.sourceId !== "ticketmaster-api").length;

console.log("=== Post-Dedup Data Quality ===");
console.log(`Total events: ${total}`);
console.log(`With image:   ${withImage} (${Math.round(100*withImage/total)}%)`);
console.log(`With URL:     ${withUrl} (${Math.round(100*withUrl/total)}%)`);
console.log(`With BOTH:    ${withBoth} (${Math.round(100*withBoth/total)}%)`);
console.log(`No img+url:   ${noImgNoUrl}`);
console.log(`Price TBD:    ${priceTbd}`);
console.log(`TM events:    ${tmEvents}`);
console.log(`Scraped:      ${scrapedEvents}`);

// Check for remaining near-dupes
const titleDateMap = {};
for (const e of events) {
  const key = `${(e.title || "").toLowerCase().replace(/[^a-z0-9]/g, "")}|${e.date}`;
  if (!titleDateMap[key]) titleDateMap[key] = [];
  titleDateMap[key].push(e);
}
const exactDupes = Object.values(titleDateMap).filter(g => g.length > 1);
console.log(`Exact dupes:  ${exactDupes.length} groups`);

// Check travel.ticketmaster URLs
const travelUrls = events.filter(e => e.url && e.url.includes("travel.ticketmaster"));
console.log(`travel.tm:    ${travelUrls.length} remaining`);

// Check &amp in URLs
const ampUrls = events.filter(e => e.url && (e.url.includes("&amp") || e.url.includes("&amp%3B")));
console.log(`&amp URLs:    ${ampUrls.length} remaining`);

// Check RETINA_PORTRAIT images
const retinaImgs = events.filter(e => e.image && /RETINA_PORTRAIT/i.test(e.image));
console.log(`Placeholder:  ${retinaImgs.length} RETINA_PORTRAIT images remaining`);
