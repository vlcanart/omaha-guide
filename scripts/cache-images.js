#!/usr/bin/env node
/**
 * cache-images.js — Downloads and optimizes static images from the manifest.
 *
 * Reads scripts/image-manifest.json and for each entity:
 *   1. Checks public/images/manual/{category}/{id}.jpg (highest priority)
 *   2. Checks if already cached in public/images/{category}/{id}.jpg
 *   3. Downloads from Unsplash (or direct URL) → resizes to 600×400 JPEG q80
 *
 * Idempotent: skips existing files. Run with --force to re-download all.
 * Rate-limited: 1s delay between Unsplash downloads.
 *
 * Usage:
 *   node scripts/cache-images.js          # download missing images
 *   node scripts/cache-images.js --force  # re-download everything
 *   node scripts/cache-images.js --dry    # preview without downloading
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const MANIFEST_PATH = path.join(__dirname, "image-manifest.json");
const PUBLIC_DIR = path.join(__dirname, "..", "public", "images");
const MANUAL_DIR = path.join(PUBLIC_DIR, "manual");

const FORCE = process.argv.includes("--force");
const DRY = process.argv.includes("--dry");
const WIDTH = 600;
const HEIGHT = 400;
const QUALITY = 80;

// ═══ HELPERS ═══

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function unsplashUrl(photoId) {
  // Unsplash CDN requires ixlib param for resized images
  return `https://images.unsplash.com/${photoId}?ixlib=rb-4.0.3&w=${WIDTH}&h=${HEIGHT}&fit=crop&q=${QUALITY}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function download(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    proto
      .get(url, { timeout: 15000 }, (res) => {
        // Follow redirects
        if (
          [301, 302, 303, 307, 308].includes(res.statusCode) &&
          res.headers.location &&
          maxRedirects > 0
        ) {
          let redirectUrl = res.headers.location;
          if (redirectUrl.startsWith("/")) {
            const u = new URL(url);
            redirectUrl = `${u.protocol}//${u.host}${redirectUrl}`;
          }
          return download(redirectUrl, maxRedirects - 1).then(resolve, reject);
        }

        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          res.resume();
          return;
        }

        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject)
      .on("timeout", () => reject(new Error(`Timeout: ${url}`)));
  });
}

async function processImage(buf) {
  // Try to use sharp for resize/optimize
  try {
    const sharp = require("sharp");
    return await sharp(buf)
      .resize(WIDTH, HEIGHT, { fit: "cover", position: "center" })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toBuffer();
  } catch (e) {
    // sharp not installed — use raw download (already sized via URL params)
    console.warn(
      "  ⚠ sharp not installed — using raw download (install sharp for better optimization)"
    );
    return buf;
  }
}

// ═══ MAIN ═══

async function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`❌ Manifest not found: ${MANIFEST_PATH}`);
    console.error("   Create scripts/image-manifest.json first.");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const categories = ["parks", "venues", "hoods", "trails", "seeds"];

  let downloaded = 0;
  let skipped = 0;
  let manualOverrides = 0;
  let errors = 0;
  let totalBytes = 0;

  for (const cat of categories) {
    const entries = manifest[cat];
    if (!entries) continue;

    const catDir = path.join(PUBLIC_DIR, cat);
    const manualCatDir = path.join(MANUAL_DIR, cat);
    ensureDir(catDir);

    console.log(`\n📁 ${cat.toUpperCase()} (${Object.keys(entries).length} entries)`);

    for (const [id, entry] of Object.entries(entries)) {
      // Determine output filename(s)
      const isMulti = Array.isArray(entry.imgs || entry.unsplash);

      if (isMulti) {
        // Neighborhoods have multiple images: id-1.jpg, id-2.jpg, id-3.jpg
        const imgs = entry.imgs || entry.unsplash;
        for (let i = 0; i < imgs.length; i++) {
          const filename = `${id}-${i + 1}.jpg`;
          const outPath = path.join(catDir, filename);
          const manualPath = path.join(manualCatDir, filename);

          // Check manual override
          if (fs.existsSync(manualPath)) {
            console.log(`  ✦ ${cat}/${filename} — manual override`);
            // Copy manual file to main location
            if (!DRY) {
              fs.copyFileSync(manualPath, outPath);
            }
            manualOverrides++;
            continue;
          }

          // Check if already cached
          if (fs.existsSync(outPath) && !FORCE) {
            const size = fs.statSync(outPath).size;
            console.log(
              `  ⏭ ${cat}/${filename} — cached (${(size / 1024).toFixed(0)}KB)`
            );
            skipped++;
            continue;
          }

          // Download
          const photoId = imgs[i];
          const url = photoId.startsWith("http")
            ? photoId
            : unsplashUrl(photoId);

          if (DRY) {
            console.log(`  🔍 ${cat}/${filename} — would download from ${url}`);
            continue;
          }

          try {
            const buf = await download(url);
            const optimized = await processImage(buf);
            fs.writeFileSync(outPath, optimized);
            const kb = (optimized.length / 1024).toFixed(0);
            totalBytes += optimized.length;
            console.log(`  ✓ ${cat}/${filename} (${kb}KB)`);
            downloaded++;
            await sleep(1000); // Rate limit
          } catch (err) {
            console.error(`  ✗ ${cat}/${filename} — ${err.message}`);
            errors++;
          }
        }
      } else {
        // Single image: id.jpg
        const filename = `${id}.jpg`;
        const outPath = path.join(catDir, filename);
        const manualPath = path.join(manualCatDir, filename);

        // Check manual override
        if (fs.existsSync(manualPath)) {
          console.log(`  ✦ ${cat}/${filename} — manual override`);
          if (!DRY) {
            fs.copyFileSync(manualPath, outPath);
          }
          manualOverrides++;
          continue;
        }

        // Check if already cached
        if (fs.existsSync(outPath) && !FORCE) {
          const size = fs.statSync(outPath).size;
          console.log(
            `  ⏭ ${cat}/${filename} — cached (${(size / 1024).toFixed(0)}KB)`
          );
          skipped++;
          continue;
        }

        // Determine URL
        const photoId = entry.unsplash || entry.url;
        if (!photoId) {
          console.log(`  ⚠ ${cat}/${filename} — no source defined, skipping`);
          continue;
        }

        let url;
        if (photoId.startsWith("http")) {
          url = photoId;
        } else if (photoId.startsWith("photo-")) {
          url = unsplashUrl(photoId);
        } else {
          url = await resolveUnsplashId(photoId);
        }

        if (DRY) {
          console.log(`  🔍 ${cat}/${filename} — would download from ${url}`);
          continue;
        }

        try {
          const buf = await download(url);
          const optimized = await processImage(buf);
          fs.writeFileSync(outPath, optimized);
          const kb = (optimized.length / 1024).toFixed(0);
          totalBytes += optimized.length;
          console.log(`  ✓ ${cat}/${filename} (${kb}KB)`);
          downloaded++;
          await sleep(1000); // Rate limit
        } catch (err) {
          console.error(`  ✗ ${cat}/${filename} — ${err.message}`);
          errors++;
        }
      }
    }
  }

  console.log(`\n════════════════════════════════`);
  console.log(`📊 Image Cache Summary`);
  console.log(`   Downloaded: ${downloaded}`);
  console.log(`   Skipped:    ${skipped} (already cached)`);
  console.log(`   Manual:     ${manualOverrides} (overrides)`);
  console.log(`   Errors:     ${errors}`);
  if (totalBytes > 0) {
    console.log(
      `   Size:       ${(totalBytes / 1024 / 1024).toFixed(1)}MB total`
    );
  }
  console.log(`════════════════════════════════\n`);

  if (errors > 0) {
    console.log(
      "💡 Tip: Drop your own images in public/images/manual/{category}/{id}.jpg"
    );
    console.log("   to override any failed downloads.\n");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
