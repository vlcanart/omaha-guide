#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════
 *  GO: Guide to Omaha — Sitemap Generator
 * ═══════════════════════════════════════════════════════════
 *
 *  Generates sitemap.xml and robots.txt for search engine crawling.
 *  Enumerates all entity pages (events, neighborhoods, parks, galleries, venues).
 *  Run as part of the build process.
 */

const fs = require("fs");
const path = require("path");

const DOMAIN = process.env.SITE_URL || "https://goguideomaha.com";
const OUT_DIR = path.join(__dirname, "..", "public");
const DATA_DIR = path.join(__dirname, "..", "data");

// Slugify function (matches app/lib/helpers.js)
function slugify(title, id) {
  const base = (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return `${base}-${id}`;
}

// Load data files (CommonJS compatible)
function loadData() {
  // Load ingested events from data/events.json
  let ingested = [];
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, "events.json"), "utf8");
    ingested = JSON.parse(raw);
  } catch (e) {
    console.log("  (no ingested events found)");
  }

  // Load seed events by evaluating the ESM module content
  // We parse the data files manually since they use ESM exports
  const seedFile = fs.readFileSync(path.join(__dirname, "..", "app", "data", "events.js"), "utf8");
  const seedMatch = seedFile.match(/export const SEED_EVENTS\s*=\s*(\[[\s\S]*?\]);/);
  let seeds = [];
  if (seedMatch) {
    try { seeds = eval(seedMatch[1]); } catch(e) {}
  }

  // Parse hoods
  const hoodsFile = fs.readFileSync(path.join(__dirname, "..", "app", "data", "hoods.js"), "utf8");
  const hoodsIds = [...hoodsFile.matchAll(/id:\s*"([^"]+)"/g)].map(m => m[1]);

  // Parse parks
  const parksFile = fs.readFileSync(path.join(__dirname, "..", "app", "data", "parks.js"), "utf8");
  const parksIds = [...parksFile.matchAll(/id:\s*"([^"]+)"/g)].map(m => m[1]);

  // Parse galleries
  const galFile = fs.readFileSync(path.join(__dirname, "..", "app", "data", "galleries.js"), "utf8");
  const galIds = [...galFile.matchAll(/id:\s*"([^"]+)"/g)].map(m => m[1]);

  // Parse venues — numeric ids
  const venFile = fs.readFileSync(path.join(__dirname, "..", "app", "data", "venues.js"), "utf8");
  const venIds = [...venFile.matchAll(/\{id:(\d+),/g)].map(m => m[1]);

  return { seeds, ingested, hoodsIds, parksIds, galIds, venIds };
}

// Generate sitemap.xml
function generateSitemap() {
  const now = new Date().toISOString().split("T")[0];
  const { seeds, ingested, hoodsIds, parksIds, galIds, venIds } = loadData();

  const urls = [
    // Root
    { loc: "/", changefreq: "daily", priority: "1.0" },

    // Events
    ...seeds.map(ev => ({
      loc: `/events/${slugify(ev.title, ev.id)}/`,
      changefreq: "weekly",
      priority: "0.8",
    })),
    ...ingested.map(ev => ({
      loc: `/events/${slugify(ev.title, ev.id)}/`,
      changefreq: "weekly",
      priority: "0.8",
    })),

    // Neighborhoods
    ...hoodsIds.map(id => ({
      loc: `/neighborhoods/${id}/`,
      changefreq: "monthly",
      priority: "0.7",
    })),

    // Parks
    ...parksIds.map(id => ({
      loc: `/parks/${id}/`,
      changefreq: "monthly",
      priority: "0.7",
    })),

    // Galleries & Museums
    ...galIds.map(id => ({
      loc: `/galleries/${id}/`,
      changefreq: "monthly",
      priority: "0.6",
    })),

    // Venues
    ...venIds.map(id => ({
      loc: `/venues/${id}/`,
      changefreq: "monthly",
      priority: "0.6",
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${DOMAIN}${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  fs.writeFileSync(path.join(OUT_DIR, "sitemap.xml"), xml);
  console.log(`✓ Generated sitemap.xml (${urls.length} URLs)`);
}

// Generate robots.txt
function generateRobots() {
  const robots = `# GO: Guide to Omaha
User-agent: *
Allow: /
Sitemap: ${DOMAIN}/sitemap.xml

# Crawl-delay for politeness
Crawl-delay: 1
`;
  fs.writeFileSync(path.join(OUT_DIR, "robots.txt"), robots);
  console.log("✓ Generated robots.txt");
}

generateSitemap();
generateRobots();
