/**
 * ═══════════════════════════════════════════════════════════
 *  GO: Guide to Omaha — Scraper (Jina + Fallback)
 * ═══════════════════════════════════════════════════════════
 *
 *  Strategy:
 *    1. Jina Reader API (r.jina.ai) — renders JS, returns clean markdown
 *    2. Fallback: direct fetch with HTML→text extraction
 *    3. Cache: stale-while-revalidate (serve cached on failure)
 */

const fs = require("fs");
const path = require("path");

const JINA_KEY = process.env.JINA_API_KEY || ""; // optional, raises rate limits
const CACHE_DIR = path.join(__dirname, "..", "..", "data", "cache");
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours — serve stale on failure

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Ensure cache dir exists
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

// ═══ CACHE HELPERS ═══
function cacheKey(sourceId) {
  return path.join(CACHE_DIR, `${sourceId}.json`);
}

function readCache(sourceId) {
  const fp = cacheKey(sourceId);
  if (!fs.existsSync(fp)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(fp, "utf8"));
    return data;
  } catch { return null; }
}

function writeCache(sourceId, content, url) {
  const fp = cacheKey(sourceId);
  fs.writeFileSync(fp, JSON.stringify({
    sourceId, url, content,
    cachedAt: new Date().toISOString(),
    byteLength: Buffer.byteLength(content, "utf8"),
  }, null, 2));
}

function isCacheFresh(sourceId) {
  const cached = readCache(sourceId);
  if (!cached) return false;
  return (Date.now() - new Date(cached.cachedAt).getTime()) < CACHE_TTL_MS;
}

// ═══ JINA READER ═══
async function fetchViaJina(url, retries = 2) {
  const jinaUrl = `https://r.jina.ai/${url}`;
  const headers = {
    "Accept": "text/plain",
    "X-Return-Format": "text",
    "X-Timeout": "30",
  };
  if (JINA_KEY) headers["Authorization"] = `Bearer ${JINA_KEY}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(jinaUrl, { headers, signal: AbortSignal.timeout(35000) });
      if (res.status === 429) {
        const wait = Math.min(10000, 2000 * (attempt + 1));
        console.log(`    ⏳ Jina rate limited, waiting ${wait / 1000}s...`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) throw new Error(`Jina ${res.status}`);
      const text = await res.text();
      if (text.length < 100) throw new Error("Jina returned too little content");
      return { content: text, method: "jina", bytes: Buffer.byteLength(text) };
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(1500 * (attempt + 1));
    }
  }
}

// ═══ DIRECT FETCH FALLBACK ═══
async function fetchDirect(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; GOGuideBot/1.0; +https://theomahaguide.com)",
          "Accept": "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(20000),
        redirect: "follow",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      // Strip HTML tags, scripts, styles → plain text
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<nav[\s\S]*?<\/nav>/gi, "")
        .replace(/<footer[\s\S]*?<\/footer>/gi, "")
        .replace(/<header[\s\S]*?<\/header>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&#\d+;/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (text.length < 50) throw new Error("Direct fetch returned too little content");
      return { content: text, method: "direct", bytes: Buffer.byteLength(text) };
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(1500 * (attempt + 1));
    }
  }
}

// ═══ MAIN SCRAPE FUNCTION ═══
async function scrapeSource(source) {
  const { id, url, strategy } = source;

  // Check if cache is fresh enough to skip entirely
  if (isCacheFresh(id)) {
    const cached = readCache(id);
    return { ...cached, method: "cache (fresh)", skipped: true };
  }

  let result = null;
  let errors = [];

  // Strategy 1: Jina Reader
  if (strategy === "jina" || !strategy) {
    try {
      result = await fetchViaJina(url);
    } catch (err) {
      errors.push({ method: "jina", error: err.message });
    }
  }

  // Strategy 2: Direct fetch fallback
  if (!result) {
    try {
      result = await fetchDirect(url);
    } catch (err) {
      errors.push({ method: "direct", error: err.message });
    }
  }

  // Strategy 3: Serve stale cache
  if (!result) {
    const cached = readCache(id);
    if (cached) {
      console.log(`    📦 Using stale cache for ${id} (${errors.length} errors)`);
      return { ...cached, method: "cache (stale)", errors };
    }
    // Total failure
    return { sourceId: id, content: null, method: "failed", errors };
  }

  // Write to cache
  writeCache(id, result.content, url);
  return { sourceId: id, url, ...result, errors: errors.length ? errors : undefined };
}

// ═══ BATCH SCRAPER ═══
async function scrapeAll(sources, concurrency = 3, delayMs = 1500) {
  const results = [];
  const batches = [];

  // Group into concurrent batches
  for (let i = 0; i < sources.length; i += concurrency) {
    batches.push(sources.slice(i, i + concurrency));
  }

  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi];
    console.log(`\n📡 Scrape batch ${bi + 1}/${batches.length}: ${batch.map(s => s.id).join(", ")}`);

    const batchResults = await Promise.allSettled(
      batch.map(async (source) => {
        const start = Date.now();
        const result = await scrapeSource(source);
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        const status = result.content ? "✓" : "✗";
        const method = result.method || "unknown";
        const bytes = result.bytes ? `${(result.bytes / 1024).toFixed(1)}KB` : "0KB";
        console.log(`  ${status} ${source.id} (${method}, ${bytes}, ${elapsed}s)`);
        return { source, ...result };
      })
    );

    batchResults.forEach((r) => {
      if (r.status === "fulfilled") results.push(r.value);
      else results.push({ source: batch[0], content: null, method: "error", error: r.reason?.message });
    });

    // Rate limiting between batches
    if (bi < batches.length - 1) await sleep(delayMs);
  }

  return results;
}

module.exports = { scrapeSource, scrapeAll, readCache, writeCache };
