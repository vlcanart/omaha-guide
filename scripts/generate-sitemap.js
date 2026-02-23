#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════
 *  GO: Guide to Omaha — Sitemap Generator
 * ═══════════════════════════════════════════════════════════
 *
 *  Generates sitemap.xml and robots.txt for search engine crawling.
 *  Run as part of the build process.
 */

const fs = require("fs");
const path = require("path");

const DOMAIN = process.env.SITE_URL || "https://goguideomaha.com";
const OUT_DIR = path.join(__dirname, "..", "public");

// Generate sitemap.xml
function generateSitemap() {
  const now = new Date().toISOString().split("T")[0];

  const urls = [
    { loc: "/", changefreq: "daily", priority: "1.0" },
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
