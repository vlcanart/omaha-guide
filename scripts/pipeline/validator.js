/**
 * ═══════════════════════════════════════════════════════════
 *  GO: Guide to Omaha — Validator & Enricher
 * ═══════════════════════════════════════════════════════════
 *
 *  1. Date validation (real dates, within range, not past)
 *  2. Deduplication (title+date fuzzy match, priority-based winner)
 *  3. URL validation (HEAD check for ticket links, removes dead URLs)
 *  4. Affiliate URL rewriting
 *  5. Tag inference
 */

const { AFFILIATE_CONFIG, CATEGORY_KEYWORDS } = require("./config");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = new Date().toISOString().split("T")[0];
const END_DATE = (() => { const d = new Date(); d.setDate(d.getDate() + 90); return d.toISOString().split("T")[0]; })();

// ═══ DATE VALIDATION ═══
function isValidDate(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return false;
  // Must be today or future, and within 90-day window
  return dateStr >= TODAY && dateStr <= END_DATE;
}

function validateDates(events) {
  const valid = [];
  const rejected = { past: 0, malformed: 0, tooFar: 0 };
  for (const e of events) {
    if (!e.date || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) { rejected.malformed++; continue; }
    if (e.date < TODAY) { rejected.past++; continue; }
    if (e.date > END_DATE) { rejected.tooFar++; continue; }
    valid.push(e);
  }
  return { valid, rejected };
}

// ═══ DEDUPLICATION ═══
function normalizeTitle(t) {
  return (t || "").toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Fuzzy match: titles >80% similar on same date = duplicate
function similarity(a, b) {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  // Simple containment check
  if (longer.includes(shorter)) return shorter.length / longer.length;
  // Levenshtein would be ideal, but for speed we use token overlap
  const ta = new Set(a.split(" "));
  const tb = new Set(b.split(" "));
  const intersection = [...ta].filter(x => tb.has(x)).length;
  const union = new Set([...ta, ...tb]).size;
  return intersection / union; // Jaccard
}

function deduplicate(events) {
  // Sort by priority (lower = better) so best sources win
  const sorted = [...events].sort((a, b) => (a.sourcePriority || 5) - (b.sourcePriority || 5));
  const kept = [];
  const seen = []; // {normTitle, date}
  const seenTmIds = new Set(); // exact-match dedup for Ticketmaster API events

  for (const e of sorted) {
    // Exact-match dedup on tmEventId (prevents TM API duplicates)
    if (e.tmEventId) {
      if (seenTmIds.has(e.tmEventId)) continue;
      seenTmIds.add(e.tmEventId);
    }

    const norm = normalizeTitle(e.title);
    const isDupe = seen.some(s =>
      s.date === e.date && similarity(s.normTitle, norm) > 0.7
    );
    if (isDupe) continue;
    seen.push({ normTitle: norm, date: e.date });
    kept.push(e);
  }

  return { kept, dupsRemoved: events.length - kept.length };
}

// ═══ URL VALIDATION ═══
// HEAD-check ticket URLs to verify they're live (not 404/redirected to homepage)
async function validateUrl(url, timeout = 8000) {
  if (!url || url === "#" || url === "null") return { valid: false, reason: "empty" };
  try {
    new URL(url); // syntax check
  } catch { return { valid: false, reason: "malformed" }; }

  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GOGuideBot/1.0)" },
      redirect: "follow",
      signal: AbortSignal.timeout(timeout),
    });
    const finalUrl = res.url || url;
    // Check if we were redirected to a generic homepage (common for expired events)
    const origPath = new URL(url).pathname;
    const finalPath = new URL(finalUrl).pathname;
    const redirectedToHome = finalPath === "/" && origPath !== "/" && origPath.length > 5;
    return {
      valid: res.ok && !redirectedToHome,
      status: res.status,
      finalUrl,
      redirectedToHome,
      reason: !res.ok ? `HTTP ${res.status}` : redirectedToHome ? "redirected to homepage" : "ok",
    };
  } catch (err) {
    return { valid: false, reason: err.message };
  }
}

async function validateUrls(events, concurrency = 5) {
  console.log(`\n🔗 Validating ${events.length} event URLs (${concurrency} concurrent)...`);
  let validated = 0;
  let fixed = 0;
  let failed = 0;

  // Only validate events that have real ticket URLs (not venue homepages)
  const toValidate = events.filter(e => e.url && e.url !== "#" && e.url.includes("/"));

  const batches = [];
  for (let i = 0; i < toValidate.length; i += concurrency) {
    batches.push(toValidate.slice(i, i + concurrency));
  }

  for (const batch of batches) {
    const results = await Promise.allSettled(
      batch.map(async (e) => {
        const result = await validateUrl(e.url);
        if (!result.valid) {
          // Try the source venue URL as fallback
          if (e.venueUrl && e.venueUrl !== e.url) {
            e.url = e.venueUrl;
            fixed++;
          } else {
            e.urlValid = false;
            failed++;
          }
        } else {
          e.urlValid = true;
          validated++;
        }
      })
    );
    await sleep(200); // gentle rate limit
  }

  console.log(`  ✓ Valid: ${validated}  🔧 Fixed: ${fixed}  ✗ Failed: ${failed}`);
  return events;
}

// ═══ AFFILIATE URL REWRITING ═══
function rewriteAffiliateUrls(events) {
  let rewritten = 0;
  for (const e of events) {
    if (!e.url || e.url === "#") continue;
    try {
      const hostname = new URL(e.url).hostname.toLowerCase();
      for (const [platform, config] of Object.entries(AFFILIATE_CONFIG)) {
        if (config.domains.some(d => hostname.includes(d)) && config.affiliateId) {
          e.url = config.rewriteUrl(e.url, config.affiliateId);
          e.affiliatePlatform = platform;
          rewritten++;
          break;
        }
      }
    } catch { /* skip malformed URLs */ }
  }
  console.log(`\n💰 Affiliate URLs rewritten: ${rewritten}`);
  return events;
}

// ═══ TAG INFERENCE ═══
function inferTags(title, cat) {
  const t = (title || "").toLowerCase();
  const tags = [];
  if (cat === "concerts") {
    if (/country|nashville/i.test(t)) tags.push("Country");
    if (/rock|punk|metal|hardcore/i.test(t)) tags.push("Rock");
    if (/jazz|blues|soul/i.test(t)) tags.push("Jazz");
    if (/edm|dj|electronic/i.test(t)) tags.push("EDM");
    if (/hip.?hop|rap/i.test(t)) tags.push("Hip-Hop");
    if (/indie|alternative/i.test(t)) tags.push("Indie");
    if (/folk|acoustic|singer/i.test(t)) tags.push("Folk");
    if (/pop/i.test(t)) tags.push("Pop");
    if (/symphony|orchestra|classical/i.test(t)) tags.push("Orchestra");
    if (/tribute|cover/i.test(t)) tags.push("Tribute");
    if (tags.length === 0) tags.push("Live Music");
  }
  if (cat === "comedy") {
    if (/improv/i.test(t)) tags.push("Improv");
    if (/stand.?up/i.test(t)) tags.push("Stand-Up");
    if (/open mic/i.test(t)) tags.push("Open Mic");
    if (tags.length === 0) tags.push("Comedy");
  }
  if (cat === "sports") {
    if (/basketball/i.test(t)) tags.push("Basketball");
    if (/football/i.test(t)) tags.push("Football");
    if (/soccer/i.test(t)) tags.push("Soccer");
    if (/hockey/i.test(t)) tags.push("Hockey");
    if (/baseball/i.test(t)) tags.push("Baseball");
    if (/volleyball/i.test(t)) tags.push("Volleyball");
  }
  if (/free|no cover|\$0/i.test(t)) tags.push("Free");
  return tags.length > 0 ? tags : ["Event"];
}

// ═══ EMOJI MAP ═══
function catEmoji(cat) {
  return { concerts:"🎵", comedy:"😂", sports:"🏆", festivals:"🎉", family:"👨‍👩‍👧", arts:"🎨" }[cat] || "🎵";
}

// ═══ FULL VALIDATION PIPELINE ═══
async function validate(rawEvents, options = {}) {
  console.log("\n═══════════════════════════════════════");
  console.log("  VALIDATION PIPELINE");
  console.log("═══════════════════════════════════════");
  console.log(`  Input: ${rawEvents.length} raw events`);

  // 1. Date validation
  const { valid: dateValid, rejected } = validateDates(rawEvents);
  console.log(`\n📅 Date validation: ${dateValid.length} valid, ${rejected.past} past, ${rejected.malformed} malformed, ${rejected.tooFar} too far`);

  // 2. Deduplication
  const { kept, dupsRemoved } = deduplicate(dateValid);
  console.log(`🔄 Dedup: ${kept.length} kept, ${dupsRemoved} duplicates removed`);

  // 3. Enrich with tags/emoji/category
  kept.forEach(e => {
    e.tags = inferTags(e.title, e.cat);
    e.emoji = catEmoji(e.cat);
    e.id = e.id || Date.now() + Math.floor(Math.random() * 10000);
    e.status = e.status || "active";
  });

  // 4. URL validation (optional, slow — skip in dry-run)
  let validated = kept;
  if (!options.skipUrlCheck) {
    validated = await validateUrls(kept);
  } else {
    console.log("\n🔗 URL validation: skipped (--skip-url-check)");
  }

  // 5. Affiliate URL rewriting
  validated = rewriteAffiliateUrls(validated);

  // 6. Ensure every event has a URL (fallback to venue calendar URL)
  let urlFallbacks = 0;
  validated.forEach(e => {
    if (!e.url || e.url === "#" || e.url === "null") {
      if (e.venueUrl) {
        e.url = e.venueUrl;
        urlFallbacks++;
      }
    }
  });
  if (urlFallbacks > 0) {
    console.log(`\n🔗 URL fallbacks: ${urlFallbacks} events assigned venue URL`);
  }

  // 7. Sort by date
  validated.sort((a, b) => a.date.localeCompare(b.date));

  console.log(`\n  ✅ Final: ${validated.length} validated events`);
  return validated;
}

module.exports = { validate, validateDates, deduplicate, validateUrls, rewriteAffiliateUrls, inferTags, isValidDate };
