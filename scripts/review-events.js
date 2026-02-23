#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════
 *  GO: Guide to Omaha — Event Quality Review Tool
 * ═══════════════════════════════════════════════════════════
 *
 *  Usage:
 *    node scripts/review-events.js               Show all events, sorted by confidence
 *    node scripts/review-events.js --low          Show only low-confidence events (<0.8)
 *    node scripts/review-events.js --dupes        Show potential duplicates
 *    node scripts/review-events.js --stats        Category/source/date breakdown
 *    node scripts/review-events.js --remove <id>  Remove event by id
 *    node scripts/review-events.js --prune        Remove all events below confidence threshold
 *    node scripts/review-events.js --expired      Show and remove expired events
 */

const fs = require("fs");
const path = require("path");

const EVENTS_PATH = path.join(__dirname, "..", "data", "events.json");
const args = process.argv.slice(2);
const hasFlag = (f) => args.includes(f);
const getArg = (f) => { const i = args.indexOf(f); return i !== -1 && args[i + 1] ? args[i + 1] : null; };

const TODAY = new Date().toISOString().split("T")[0];

function loadEvents() {
  if (!fs.existsSync(EVENTS_PATH)) {
    console.log("No events file found. Run the pipeline first.");
    process.exit(0);
  }
  return JSON.parse(fs.readFileSync(EVENTS_PATH, "utf8"));
}

function saveEvents(events) {
  fs.writeFileSync(EVENTS_PATH, JSON.stringify(events, null, 2));
  console.log(`\n✓ Saved ${events.length} events`);
}

// ═══ STATS ═══
if (hasFlag("--stats")) {
  const events = loadEvents();
  const cats = {}, sources = {}, dates = {}, venues = {};

  events.forEach(e => {
    cats[e.cat] = (cats[e.cat] || 0) + 1;
    sources[e.source || "seed"] = (sources[e.source || "seed"] || 0) + 1;
    const week = e.date?.slice(0, 7); // YYYY-MM
    if (week) dates[week] = (dates[week] || 0) + 1;
    venues[e.venue] = (venues[e.venue] || 0) + 1;
  });

  const expired = events.filter(e => e.date < TODAY).length;
  const withVideo = events.filter(e => e.ytId).length;
  const withUrl = events.filter(e => e.url && e.url !== "#").length;
  const avgConf = events.filter(e => e.confidence).reduce((s, e) => s + e.confidence, 0) / Math.max(events.filter(e => e.confidence).length, 1);

  console.log("═══════════════════════════════════════");
  console.log("  EVENT QUALITY DASHBOARD");
  console.log("═══════════════════════════════════════\n");
  console.log(`Total events:     ${events.length}`);
  console.log(`Expired:          ${expired}`);
  console.log(`With ticket URL:  ${withUrl} (${(withUrl / events.length * 100).toFixed(0)}%)`);
  console.log(`With video:       ${withVideo} (${(withVideo / events.length * 100).toFixed(0)}%)`);
  console.log(`Avg confidence:   ${avgConf.toFixed(2)}`);

  console.log("\nBy category:");
  Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => console.log(`  ${c}: ${n}`));

  console.log("\nBy month:");
  Object.entries(dates).sort().forEach(([m, n]) => console.log(`  ${m}: ${n}`));

  console.log("\nTop sources:");
  Object.entries(sources).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([s, n]) => console.log(`  ${s}: ${n}`));

  console.log("\nTop venues:");
  Object.entries(venues).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([v, n]) => console.log(`  ${v}: ${n}`));

  process.exit(0);
}

// ═══ LOW CONFIDENCE ═══
if (hasFlag("--low")) {
  const events = loadEvents();
  const threshold = parseFloat(getArg("--threshold") || "0.8");
  const low = events.filter(e => e.confidence && e.confidence < threshold);

  console.log(`\n⚠️ Low confidence events (< ${threshold}):\n`);
  if (low.length === 0) {
    console.log("  None! All events look good.");
  } else {
    low.sort((a, b) => (a.confidence || 0) - (b.confidence || 0)).forEach(e => {
      console.log(`  [${(e.confidence || 0).toFixed(2)}] ${e.title}`);
      console.log(`         ${e.date} @ ${e.venue} | ${e.source || "seed"}`);
      console.log(`         id: ${e.id}`);
    });
    console.log(`\n  Total: ${low.length} low-confidence events`);
    console.log(`  To remove all: node scripts/review-events.js --prune --threshold ${threshold}`);
  }
  process.exit(0);
}

// ═══ DUPLICATES ═══
if (hasFlag("--dupes")) {
  const events = loadEvents();
  const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();

  const groups = {};
  events.forEach(e => {
    const key = `${norm(e.title).slice(0, 20)}|${e.date}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });

  const dupes = Object.values(groups).filter(g => g.length > 1);

  console.log(`\n🔄 Potential duplicates:\n`);
  if (dupes.length === 0) {
    console.log("  None found!");
  } else {
    dupes.forEach(group => {
      console.log(`  "${group[0].title}" on ${group[0].date}:`);
      group.forEach(e => {
        console.log(`    id:${e.id} | ${e.venue} | ${e.source || "seed"} | conf:${(e.confidence || "?")}`);
      });
    });
    console.log(`\n  ${dupes.length} duplicate groups found`);
  }
  process.exit(0);
}

// ═══ EXPIRED ═══
if (hasFlag("--expired")) {
  const events = loadEvents();
  const expired = events.filter(e => e.date < TODAY);
  const fresh = events.filter(e => e.date >= TODAY);

  console.log(`\n🗑️ Expired events: ${expired.length}`);
  expired.forEach(e => console.log(`  ${e.date} | ${e.title} | ${e.venue}`));

  if (expired.length > 0) {
    saveEvents(fresh);
    console.log(`  Removed ${expired.length} expired events`);
  }
  process.exit(0);
}

// ═══ REMOVE BY ID ═══
const removeId = getArg("--remove");
if (removeId) {
  const events = loadEvents();
  const id = parseInt(removeId, 10);
  const before = events.length;
  const filtered = events.filter(e => e.id !== id);
  if (filtered.length === before) {
    console.log(`  Event id ${id} not found`);
  } else {
    const removed = events.find(e => e.id === id);
    console.log(`  Removed: "${removed.title}" (${removed.date} @ ${removed.venue})`);
    saveEvents(filtered);
  }
  process.exit(0);
}

// ═══ PRUNE LOW CONFIDENCE ═══
if (hasFlag("--prune")) {
  const events = loadEvents();
  const threshold = parseFloat(getArg("--threshold") || "0.6");
  const before = events.length;
  const kept = events.filter(e => !e.confidence || e.confidence >= threshold);
  const pruned = before - kept.length;

  console.log(`\n✂️ Pruned ${pruned} events below confidence ${threshold}`);
  if (pruned > 0) saveEvents(kept);
  process.exit(0);
}

// ═══ DEFAULT: LIST ALL ═══
const events = loadEvents();
console.log(`\n📋 All events (${events.length} total):\n`);

events.sort((a, b) => a.date.localeCompare(b.date)).forEach(e => {
  const conf = e.confidence ? ` [${e.confidence.toFixed(2)}]` : "";
  const video = e.ytId ? " 🎥" : "";
  const url = e.url && e.url !== "#" ? " 🔗" : "";
  const expired = e.date < TODAY ? " ⏰" : "";
  console.log(`  ${e.date} | ${e.cat.padEnd(8)} | ${e.title.slice(0, 40).padEnd(40)} | ${e.venue.slice(0, 25).padEnd(25)}${conf}${video}${url}${expired}`);
});
