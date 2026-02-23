/**
 * ═══════════════════════════════════════════════════════════
 *  GO: Guide to Omaha — Pipeline Health Monitor
 * ═══════════════════════════════════════════════════════════
 */

const fs = require("fs");
const path = require("path");

const HEALTH_PATH = path.join(__dirname, "..", "..", "data", "health.json");
const MAX_HISTORY = 30; // keep last 30 runs per source

function loadHealth() {
  if (fs.existsSync(HEALTH_PATH)) {
    try { return JSON.parse(fs.readFileSync(HEALTH_PATH, "utf8")); }
    catch { return { sources: {}, runs: [] }; }
  }
  return { sources: {}, runs: [] };
}

function saveHealth(health) {
  fs.writeFileSync(HEALTH_PATH, JSON.stringify(health, null, 2));
}

function recordRun(runResult) {
  const health = loadHealth();
  const timestamp = new Date().toISOString();

  // Record per-source stats
  for (const result of runResult.sourceResults || []) {
    const sid = result.sourceId || result.source?.id;
    if (!sid) continue;
    if (!health.sources[sid]) health.sources[sid] = { history: [], totalRuns: 0, totalEvents: 0, failures: 0 };
    const entry = {
      timestamp,
      success: !!result.content,
      method: result.method,
      events: result.eventCount || 0,
      errors: result.errors || [],
    };
    health.sources[sid].history.unshift(entry);
    health.sources[sid].history = health.sources[sid].history.slice(0, MAX_HISTORY);
    health.sources[sid].totalRuns++;
    health.sources[sid].totalEvents += entry.events;
    if (!entry.success) health.sources[sid].failures++;
  }

  // Record overall run
  health.runs.unshift({
    timestamp,
    totalSources: runResult.totalSources,
    sourcesScraped: runResult.sourcesScraped,
    sourcesFailed: runResult.sourcesFailed,
    rawEvents: runResult.rawEvents,
    finalEvents: runResult.finalEvents,
    durationSec: runResult.durationSec,
  });
  health.runs = health.runs.slice(0, MAX_HISTORY);

  saveHealth(health);
  return health;
}

function generateReport() {
  const health = loadHealth();
  const report = [];
  report.push("═══════════════════════════════════════");
  report.push("  PIPELINE HEALTH REPORT");
  report.push("═══════════════════════════════════════\n");

  // Overall stats
  if (health.runs.length > 0) {
    const last = health.runs[0];
    const avg = health.runs.reduce((s, r) => s + r.finalEvents, 0) / health.runs.length;
    report.push(`Last run: ${last.timestamp}`);
    report.push(`  Sources: ${last.sourcesScraped}/${last.totalSources} scraped, ${last.sourcesFailed} failed`);
    report.push(`  Events: ${last.rawEvents} raw → ${last.finalEvents} final`);
    report.push(`  Duration: ${last.durationSec}s`);
    report.push(`  Avg events per run: ${avg.toFixed(0)}\n`);
  }

  // Source reliability
  report.push("Source Reliability (last 30 runs):");
  report.push("─────────────────────────────────────");
  const entries = Object.entries(health.sources).sort((a, b) => {
    const rateA = a[1].failures / Math.max(a[1].totalRuns, 1);
    const rateB = b[1].failures / Math.max(b[1].totalRuns, 1);
    return rateB - rateA; // worst first
  });

  for (const [sid, data] of entries) {
    const rate = ((1 - data.failures / Math.max(data.totalRuns, 1)) * 100).toFixed(0);
    const avgEvents = (data.totalEvents / Math.max(data.totalRuns, 1)).toFixed(1);
    const status = rate >= 90 ? "🟢" : rate >= 70 ? "🟡" : "🔴";
    report.push(`  ${status} ${sid}: ${rate}% success, ~${avgEvents} events/run (${data.totalRuns} runs)`);
  }

  // Alerts: sources that failed last run
  const lastRun = health.runs[0];
  if (lastRun) {
    const failedSources = Object.entries(health.sources).filter(([_, d]) => {
      const last = d.history[0];
      return last && !last.success;
    });
    if (failedSources.length > 0) {
      report.push("\n⚠️ FAILED LAST RUN:");
      failedSources.forEach(([sid, d]) => {
        const last = d.history[0];
        report.push(`  ${sid}: ${last.errors?.[0]?.error || "unknown error"}`);
      });
    }

    // Sources with declining reliability
    const declining = Object.entries(health.sources).filter(([_, d]) => {
      if (d.history.length < 5) return false;
      const recent5 = d.history.slice(0, 5).filter(h => !h.success).length;
      return recent5 >= 3;
    });
    if (declining.length > 0) {
      report.push("\n⚠️ DECLINING RELIABILITY (3+ failures in last 5 runs):");
      declining.forEach(([sid]) => report.push(`  ${sid}`));
    }
  }

  return report.join("\n");
}

module.exports = { recordRun, generateReport, loadHealth };
