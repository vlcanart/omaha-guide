#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════
 *  GO: Guide to Omaha — Event Ingestion Pipeline v2
 * ═══════════════════════════════════════════════════════════
 *
 *  Production-grade pipeline: Jina scraping → Claude parsing →
 *  validation → dedup → URL checks → affiliate rewrite → save
 *
 *  Usage:
 *    ANTHROPIC_API_KEY=sk-ant-... node scripts/run-pipeline.js
 *
 *  Options:
 *    --source visitomaha    Only scrape specific source(s), comma-separated
 *    --area "Council Bluffs"  Only scrape sources in an area
 *    --tier 1               Only scrape tier 1 (primary venue) sources
 *    --dry-run              Print results without saving
 *    --skip-url-check       Skip URL validation (faster)
 *    --skip-scrape          Use cached content only (re-parse)
 *    --report               Print health report and exit
 *    --merge                Merge with existing events.json
 *    --concurrency 3        Scrape concurrency (default: 3)
 */

const fs = require("fs");
const path = require("path");
const { SOURCES } = require("./pipeline/config");
const { scrapeAll } = require("./pipeline/scraper");
const { parseBatch, classifyEvent } = require("./pipeline/parser");
const { validate } = require("./pipeline/validator");
const { recordRun, generateReport } = require("./pipeline/health");
const { evaluateAndAlert, alertCritical } = require("./pipeline/alerts");

const EVENTS_PATH = path.join(__dirname, "..", "data", "events.json");
const LOG_PATH = path.join(__dirname, "..", "data", "ingest-log.json");

// ═══ CLI ARGS ═══
const args = process.argv.slice(2);
const getArg = (flag) => { const i = args.indexOf(flag); return i !== -1 && args[i + 1] ? args[i + 1] : null; };
const hasFlag = (flag) => args.includes(flag);

const FILTER_SOURCE = getArg("--source");
const FILTER_AREA = getArg("--area");
const FILTER_TIER = getArg("--tier");
const DRY_RUN = hasFlag("--dry-run");
const SKIP_URL_CHECK = hasFlag("--skip-url-check");
const SKIP_SCRAPE = hasFlag("--skip-scrape");
const SHOW_REPORT = hasFlag("--report");
const MERGE = hasFlag("--merge");
const CONCURRENCY = parseInt(getArg("--concurrency") || "3", 10);

function dedupeKey(e) {
  return `${(e.title || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "")}|${e.date}`;
}

// ═══ MAIN ═══
async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  GO: Guide to Omaha — Event Ingestion Pipeline v2");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  ${new Date().toISOString()}`);

  // Health report mode
  if (SHOW_REPORT) {
    console.log(generateReport());
    return;
  }

  // Validate env
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("\n✗ Missing ANTHROPIC_API_KEY");
    console.error("  Run: ANTHROPIC_API_KEY=sk-ant-... node scripts/run-pipeline.js");
    process.exit(1);
  }

  const startTime = Date.now();

  // ── 1. Filter Sources ──
  let sources = [...SOURCES];
  if (FILTER_SOURCE) {
    const ids = FILTER_SOURCE.split(",").map(s => s.trim().toLowerCase());
    sources = sources.filter(s => ids.includes(s.id));
  }
  if (FILTER_AREA) {
    sources = sources.filter(s => s.area.toLowerCase().includes(FILTER_AREA.toLowerCase()));
  }
  if (FILTER_TIER) {
    sources = sources.filter(s => s.tier === parseInt(FILTER_TIER));
  }

  console.log(`\n  Sources: ${sources.length} of ${SOURCES.length}`);
  if (FILTER_SOURCE) console.log(`  Filter: ${FILTER_SOURCE}`);
  if (FILTER_AREA) console.log(`  Area: ${FILTER_AREA}`);
  if (FILTER_TIER) console.log(`  Tier: ${FILTER_TIER}`);
  console.log(`  Concurrency: ${CONCURRENCY}`);
  console.log(`  Merge: ${MERGE}`);

  // ── 2. Scrape ──
  console.log("\n═══════════════════════════════════════");
  console.log("  PHASE 1: SCRAPING");
  console.log("═══════════════════════════════════════");

  let scraped;
  if (SKIP_SCRAPE) {
    console.log("  ⏭ Skipping scrape (--skip-scrape), using cached content...");
    const { readCache } = require("./pipeline/scraper");
    scraped = sources.map(s => {
      const cached = readCache(s.id);
      return { source: s, content: cached?.content || null, method: cached ? "cache" : "none" };
    }).filter(s => s.content);
    console.log(`  📦 Loaded ${scraped.length} cached sources`);
  } else {
    scraped = await scrapeAll(sources, CONCURRENCY);
  }

  const successfulScrapes = scraped.filter(s => s.content);
  const failedScrapes = scraped.filter(s => !s.content);
  console.log(`\n  Scraped: ${successfulScrapes.length}/${sources.length} successful`);
  if (failedScrapes.length > 0) {
    console.log(`  Failed: ${failedScrapes.map(s => s.source?.id || s.sourceId).join(", ")}`);
  }

  if (successfulScrapes.length === 0) {
    console.error("\n✗ No sources scraped successfully. Check network and source URLs.");
    process.exit(1);
  }

  // ── 3. Parse ──
  console.log("\n═══════════════════════════════════════");
  console.log("  PHASE 2: PARSING (Claude AI)");
  console.log("═══════════════════════════════════════");

  const rawEvents = await parseBatch(successfulScrapes, sources);
  console.log(`\n  Raw events extracted: ${rawEvents.length}`);

  // Apply category classification
  rawEvents.forEach(e => {
    e.cat = classifyEvent(e);
  });

  // ── 4. Validate ──
  const validated = await validate(rawEvents, { skipUrlCheck: SKIP_URL_CHECK });

  // ── 5. Category & Area breakdown ──
  const catCounts = {};
  const areaCounts = {};
  validated.forEach(e => {
    catCounts[e.cat] = (catCounts[e.cat] || 0) + 1;
    areaCounts[e.area || "Unknown"] = (areaCounts[e.area || "Unknown"] || 0) + 1;
  });

  console.log("\n  By category:");
  Object.entries(catCounts).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => console.log(`    ${c}: ${n}`));
  console.log("\n  By area:");
  Object.entries(areaCounts).sort((a, b) => b[1] - a[1]).forEach(([a, n]) => console.log(`    ${a}: ${n}`));

  // ── 6. Save ──
  if (DRY_RUN) {
    console.log("\n  🏃 Dry run — not saving. Sample:");
    console.log(JSON.stringify(validated.slice(0, 3), null, 2));
  } else {
    // Ensure data directory
    const dataDir = path.dirname(EVENTS_PATH);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    let finalEvents = validated;
    if (MERGE && fs.existsSync(EVENTS_PATH)) {
      const existing = JSON.parse(fs.readFileSync(EVENTS_PATH, "utf8"));
      const existingKeys = new Set(existing.map(dedupeKey));
      const newOnly = validated.filter(e => !existingKeys.has(dedupeKey(e)));
      // Drop expired from existing
      const fresh = existing.filter(e => e.date >= new Date().toISOString().split("T")[0]);
      finalEvents = [...fresh, ...newOnly].sort((a, b) => a.date.localeCompare(b.date));
      console.log(`\n  Merge: ${fresh.length} existing + ${newOnly.length} new = ${finalEvents.length} total`);
    }

    fs.writeFileSync(EVENTS_PATH, JSON.stringify(finalEvents, null, 2));
    console.log(`\n  ✓ Saved ${finalEvents.length} events → ${EVENTS_PATH}`);

    // Save log
    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
    const log = {
      timestamp: new Date().toISOString(),
      durationSec: parseFloat(durationSec),
      sourcesTotal: sources.length,
      sourcesScraped: successfulScrapes.length,
      sourcesFailed: failedScrapes.length,
      rawEvents: rawEvents.length,
      finalEvents: finalEvents.length,
      categories: catCounts,
      areas: areaCounts,
      failedSources: failedScrapes.map(s => s.source?.id || s.sourceId),
    };
    fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
    console.log(`  ✓ Saved log → ${LOG_PATH}`);

    // Record health
    const runData = {
      totalSources: sources.length,
      sourcesScraped: successfulScrapes.length,
      sourcesFailed: failedScrapes.length,
      rawEvents: rawEvents.length,
      finalEvents: finalEvents.length,
      durationSec: parseFloat(durationSec),
      sourceResults: scraped.map(s => ({
        sourceId: s.source?.id || s.sourceId,
        tier: s.source?.tier,
        content: !!s.content,
        method: s.method,
        eventCount: rawEvents.filter(e => e.sourceId === (s.source?.id || s.sourceId)).length,
        errors: s.errors,
      })),
    };
    recordRun(runData);

    // Evaluate and send alerts
    await evaluateAndAlert(runData);

    // Run prebuild to generate JS module
    console.log("\n  📦 Running prebuild...");
    try {
      require("child_process").execSync("node scripts/prebuild-events.js", { cwd: path.join(__dirname, ".."), stdio: "inherit" });
    } catch (err) {
      console.log(`  ⚠ Prebuild error: ${err.message}`);
    }
  }

  // ── API cost estimate ──
  const claudeCalls = Math.ceil(successfulScrapes.length / 3) + (failedScrapes.length > 0 ? failedScrapes.length : 0);
  const estInputTokens = claudeCalls * 4000;
  const estOutputTokens = claudeCalls * 2000;
  const estCost = ((estInputTokens / 1000000) * 3 + (estOutputTokens / 1000000) * 15).toFixed(3);
  console.log(`\n  💲 Est. API cost this run: ~$${estCost} (${claudeCalls} Claude calls)`);
  console.log(`     Monthly @ 2x/day: ~$${(parseFloat(estCost) * 60).toFixed(2)}`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n═══════════════════════════════════════════════════════");
  console.log(`  ✅ Pipeline complete in ${elapsed}s`);
  console.log(`     ${validated.length} events from ${successfulScrapes.length} sources`);
  console.log("═══════════════════════════════════════════════════════\n");
}

main().catch(async (err) => {
  console.error("\n✗ Fatal error:", err.message);
  await alertCritical(err.message).catch(() => {});
  process.exit(1);
});
