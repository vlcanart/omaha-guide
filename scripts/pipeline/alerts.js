/**
 * ═══════════════════════════════════════════════════════════
 *  GO: Guide to Omaha — Pipeline Alert System
 * ═══════════════════════════════════════════════════════════
 *
 *  Sends alerts via Slack or Discord webhooks when:
 *    - Source failure rate exceeds threshold
 *    - A tier-1 source fails
 *    - Event count drops significantly
 *    - Pipeline itself errors out
 *
 *  Set SLACK_WEBHOOK_URL or DISCORD_WEBHOOK_URL in env.
 */

const { loadHealth } = require("./health");

const SLACK_URL = process.env.SLACK_WEBHOOK_URL || null;
const DISCORD_URL = process.env.DISCORD_WEBHOOK_URL || null;
const FAILURE_THRESHOLD = 0.2; // Alert if >20% sources fail
const MIN_EVENTS_THRESHOLD = 10; // Alert if fewer events than this

async function sendWebhook(url, payload) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.log(`  ⚠ Webhook returned ${res.status}`);
  } catch (err) {
    console.log(`  ⚠ Webhook failed: ${err.message}`);
  }
}

function formatSlackMessage(alerts) {
  return {
    text: `🚨 GO Guide Pipeline Alert`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: "🚨 GO Guide Pipeline Alert" } },
      { type: "section", text: { type: "mrkdwn", text: alerts.join("\n") } },
      { type: "context", elements: [{ type: "mrkdwn", text: `_${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })} CT_` }] },
    ],
  };
}

function formatDiscordMessage(alerts) {
  return {
    content: null,
    embeds: [{
      title: "🚨 GO Guide Pipeline Alert",
      description: alerts.join("\n"),
      color: 15158332, // red
      timestamp: new Date().toISOString(),
    }],
  };
}

/**
 * Evaluate pipeline results and send alerts if needed.
 * Call this at the end of each pipeline run.
 */
async function evaluateAndAlert(runResult) {
  if (!SLACK_URL && !DISCORD_URL) return; // No webhook configured

  const alerts = [];
  const { totalSources, sourcesScraped, sourcesFailed, finalEvents, sourceResults } = runResult;

  // Check failure rate
  const failureRate = sourcesFailed / Math.max(totalSources, 1);
  if (failureRate > FAILURE_THRESHOLD) {
    alerts.push(`⚠️ **High failure rate:** ${sourcesFailed}/${totalSources} sources failed (${(failureRate * 100).toFixed(0)}%)`);
  }

  // Check for tier-1 failures
  const tier1Failures = (sourceResults || [])
    .filter(r => !r.content && r.tier === 1)
    .map(r => r.sourceId);
  if (tier1Failures.length > 0) {
    alerts.push(`🔴 **Tier-1 sources down:** ${tier1Failures.join(", ")}`);
  }

  // Check event count drop
  const health = loadHealth();
  if (health.runs.length >= 2) {
    const prevEvents = health.runs[1]?.finalEvents || 0;
    if (prevEvents > 0 && finalEvents < prevEvents * 0.5) {
      alerts.push(`📉 **Event count dropped:** ${prevEvents} → ${finalEvents} (${((1 - finalEvents / prevEvents) * 100).toFixed(0)}% decrease)`);
    }
  }

  if (finalEvents < MIN_EVENTS_THRESHOLD) {
    alerts.push(`📭 **Very few events:** only ${finalEvents} events found`);
  }

  // Check for sources with recurring failures
  const chronicallyFailing = Object.entries(health.sources || {}).filter(([_, d]) => {
    if (d.history.length < 5) return false;
    const recent = d.history.slice(0, 5);
    return recent.filter(h => !h.success).length >= 4;
  }).map(([sid]) => sid);

  if (chronicallyFailing.length > 0) {
    alerts.push(`🔧 **Chronically failing sources** (4+ fails in last 5 runs): ${chronicallyFailing.join(", ")}`);
  }

  // Send alerts if any
  if (alerts.length === 0) return;

  console.log(`\n🚨 Sending ${alerts.length} alert(s)...`);
  alerts.forEach(a => console.log(`  ${a}`));

  if (SLACK_URL) {
    await sendWebhook(SLACK_URL, formatSlackMessage(alerts));
    console.log("  ✓ Slack alert sent");
  }
  if (DISCORD_URL) {
    await sendWebhook(DISCORD_URL, formatDiscordMessage(alerts));
    console.log("  ✓ Discord alert sent");
  }
}

/**
 * Send a critical error alert (pipeline crash).
 */
async function alertCritical(errorMessage) {
  const alerts = [`💥 **Pipeline crashed:** ${errorMessage}`];

  if (SLACK_URL) await sendWebhook(SLACK_URL, formatSlackMessage(alerts));
  if (DISCORD_URL) await sendWebhook(DISCORD_URL, formatDiscordMessage(alerts));
}

module.exports = { evaluateAndAlert, alertCritical };
