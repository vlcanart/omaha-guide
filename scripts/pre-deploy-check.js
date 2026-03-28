#!/usr/bin/env node
/**
 * Pre-deploy verification checklist.
 * Run after `npm run build` and before `netlify deploy`.
 * Catches broken links, missing images, wrong categories, and regressions.
 */

const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "out");
const CONTENT = path.join(__dirname, "..", "public", "images", "content");
let errors = 0;
let warnings = 0;

function fail(msg) { console.log(`  ❌ ${msg}`); errors++; }
function warn(msg) { console.log(`  ⚠️  ${msg}`); warnings++; }
function pass(msg) { console.log(`  ✅ ${msg}`); }

console.log("\n🔍 GO: Omaha Pre-Deploy Checklist\n");

// 1. Check out/ exists and has index.html
console.log("1. Build output");
if (!fs.existsSync(path.join(OUT, "index.html"))) {
  fail("out/index.html missing — did you run `npm run build`?");
} else {
  pass("out/index.html exists");
}

// 2. Event pages count
console.log("\n2. Event pages");
const eventDirs = fs.existsSync(path.join(OUT, "events"))
  ? fs.readdirSync(path.join(OUT, "events")).filter(d => fs.statSync(path.join(OUT, "events", d)).isDirectory())
  : [];
const eventsData = require(path.join(__dirname, "..", "app", "events-data.js"));
const totalEvents = (eventsData.INGESTED_EVENTS || []).length;
if (eventDirs.length === 0) {
  fail("No event pages generated");
} else if (eventDirs.length < totalEvents * 0.9) {
  warn(`Only ${eventDirs.length}/${totalEvents} event pages generated (${Math.round(eventDirs.length/totalEvents*100)}%)`);
} else {
  pass(`${eventDirs.length}/${totalEvents} event pages generated`);
}

// 3. Venue pages — should be SEO slugs not numbers
console.log("\n3. Venue pages");
const venueDirs = fs.existsSync(path.join(OUT, "venues"))
  ? fs.readdirSync(path.join(OUT, "venues")).filter(d => fs.statSync(path.join(OUT, "venues", d)).isDirectory())
  : [];
const numericVenues = venueDirs.filter(d => /^\d+$/.test(d));
if (numericVenues.length > 0) {
  fail(`${numericVenues.length} venue pages still use numeric IDs: ${numericVenues.join(", ")}`);
} else if (venueDirs.length === 0) {
  fail("No venue pages generated");
} else {
  pass(`${venueDirs.length} venue pages with SEO slugs`);
}

// 4. Custom venue pages
console.log("\n4. Custom venue pages");
const customPages = ["zoo", "joslyn", "lauritzen", "durham", "luminarium"];
for (const p of customPages) {
  if (fs.existsSync(path.join(OUT, p, "index.html"))) {
    pass(`/${p}/ exists`);
  } else {
    fail(`/${p}/ missing`);
  }
}

// 5. Neighborhood pages
console.log("\n5. Neighborhood pages");
const hoodDirs = fs.existsSync(path.join(OUT, "neighborhoods"))
  ? fs.readdirSync(path.join(OUT, "neighborhoods")).filter(d => fs.statSync(path.join(OUT, "neighborhoods", d)).isDirectory())
  : [];
if (hoodDirs.length < 8) {
  fail(`Only ${hoodDirs.length} neighborhood pages (expected 10+)`);
} else {
  pass(`${hoodDirs.length} neighborhood pages`);
}

// 6. Gallery pages
console.log("\n6. Gallery pages");
const galDirs = fs.existsSync(path.join(OUT, "galleries"))
  ? fs.readdirSync(path.join(OUT, "galleries")).filter(d => fs.statSync(path.join(OUT, "galleries", d)).isDirectory())
  : [];
if (galDirs.length < 10) {
  warn(`Only ${galDirs.length} gallery pages`);
} else {
  pass(`${galDirs.length} gallery pages`);
}

// 7. Category distribution (catch miscategorization)
console.log("\n7. Event categories");
const events = eventsData.INGESTED_EVENTS || [];
const cats = {};
for (const e of events) { cats[e.cat] = (cats[e.cat] || 0) + 1; }
for (const [cat, count] of Object.entries(cats).sort((a,b) => b[1] - a[1])) {
  console.log(`     ${cat}: ${count}`);
}
if ((cats.concerts || 0) > totalEvents * 0.7) {
  warn(`Concerts are ${Math.round((cats.concerts/totalEvents)*100)}% of events — likely miscategorization`);
}
if ((cats.sports || 0) < 10) {
  warn(`Only ${cats.sports || 0} sports events — check categorization`);
}

// 8. No Unsplash URLs in data files
console.log("\n8. Unsplash references");
const dataFiles = [
  "app/data/venues.js", "app/data/hoods.js", "app/data/galleries.js",
  "app/data/parks.js", "app/data/trails.js", "app/data/zoo.js",
  "app/joslyn/JoslynClient.jsx", "app/lauritzen/LauritzenClient.jsx",
  "app/durham/DurhamClient.jsx", "app/luminarium/LuminariumClient.jsx",
  "app/zoo/ZooClient.jsx",
];
let unsplashCount = 0;
for (const f of dataFiles) {
  const fp = path.join(__dirname, "..", f);
  if (!fs.existsSync(fp)) continue;
  const content = fs.readFileSync(fp, "utf8");
  const matches = content.match(/unsplash\.com/g);
  if (matches) { unsplashCount += matches.length; warn(`${f} has ${matches.length} Unsplash reference(s)`); }
}
if (unsplashCount === 0) {
  pass("No Unsplash URLs in data/template files");
}

// 9. Content image folders have files
console.log("\n9. Content image coverage");
const imgCats = ["neighborhoods", "venues", "artists", "teams", "landmarks", "parks", "trails"];
for (const cat of imgCats) {
  const catDir = path.join(CONTENT, cat);
  if (!fs.existsSync(catDir)) { warn(`Missing content/${cat}/ folder`); continue; }
  const folders = fs.readdirSync(catDir).filter(d => fs.statSync(path.join(catDir, d)).isDirectory());
  const empty = folders.filter(f => fs.readdirSync(path.join(catDir, f)).filter(x => /\.(jpg|png|webp)$/i.test(x)).length === 0);
  if (empty.length > 0) {
    warn(`${cat}: ${empty.length} empty folders (${empty.slice(0,3).join(", ")}${empty.length > 3 ? "..." : ""})`);
  } else {
    pass(`${cat}: ${folders.length} folders, all have images`);
  }
}

// 10. Slug consistency check — event links should match built pages
console.log("\n10. Event slug consistency");
function eventSlug(ev) {
  return [ev.title, ev.venue, ev.date].filter(Boolean).join(" ").toLowerCase().replace(/['']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
const builtSlugs = new Set(eventDirs);
let missingPages = 0;
for (const ev of events.slice(0, 50)) { // spot check first 50
  if (!builtSlugs.has(eventSlug(ev))) missingPages++;
}
if (missingPages > 0) {
  fail(`${missingPages}/50 sampled events have no matching page`);
} else {
  pass("All sampled event slugs match built pages");
}

// Summary
console.log("\n" + "═".repeat(50));
if (errors > 0) {
  console.log(`\n🚫 ${errors} error(s), ${warnings} warning(s) — FIX BEFORE DEPLOYING\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\n⚠️  ${warnings} warning(s), 0 errors — OK to deploy but review warnings\n`);
} else {
  console.log(`\n✅ All checks passed — safe to deploy!\n`);
}
