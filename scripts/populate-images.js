/**
 * populate-images.js
 * Downloads real, high-quality images from legitimate free sources.
 *
 * SOURCE PRIORITY (no Unsplash):
 *
 * 1. WIKIMEDIA COMMONS — CC-licensed, high-res photos of venues, landmarks, neighborhoods
 *    API: https://commons.wikimedia.org/w/api.php
 *
 * 2. ESPN CDN — Official team logos (public CDN, widely used)
 *    URL pattern: https://a.espncdn.com/i/teamlogos/...
 *
 * 3. SPOTIFY CDN — Artist images from public API embeds
 *    (Already have Spotify URLs, can derive image URLs)
 *
 * 4. TICKETMASTER — Event images already cached from pipeline
 *    Path: public/images/events/ (already downloaded)
 *
 * 5. VENUE WEBSITES — Og:image meta tags from venue homepages
 *    (Scrape og:image from venue URLs already in config)
 *
 * 6. VISIT OMAHA / CITY — Tourism board media libraries
 *    visitomaha.com has a media center with downloadable photos
 *
 * 7. FLICKR CC — Creative Commons search for Omaha locations
 *    API: flickr.photos.search with license=1,2,3,4,5,6
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public', 'images', 'content');

// ═══════════════════════════════════════════════════════════
// UTILITY: Download a file from URL
// ═══════════════════════════════════════════════════════════
function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) { resolve('exists'); return; }
    const dir = path.dirname(dest);
    fs.mkdirSync(dir, { recursive: true });

    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { headers: { 'User-Agent': 'GO-Guide-Omaha/1.0 (event-discovery-app)' } }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode} for ${url}`)); return; }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve('downloaded'); });
      file.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// ═══════════════════════════════════════════════════════════
// UTILITY: Fetch JSON
// ═══════════════════════════════════════════════════════════
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, { headers: { 'User-Agent': 'GO-Guide-Omaha/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchJSON(res.headers.location).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// ═══════════════════════════════════════════════════════════
// SOURCE 1: Wikimedia Commons
// ═══════════════════════════════════════════════════════════
async function wikimediaSearch(query, folder, filename = 'hero.jpg') {
  try {
    const q = encodeURIComponent(query);
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrlimit=3&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1200&format=json`;
    const data = await fetchJSON(url);

    if (!data.query || !data.query.pages) return null;

    const pages = Object.values(data.query.pages);
    // Find first JPEG/PNG image
    for (const page of pages) {
      if (!page.imageinfo) continue;
      const info = page.imageinfo[0];
      if (!info.mime || !info.mime.match(/jpeg|png/)) continue;
      if (info.size < 10000) continue; // skip tiny images

      const imgUrl = info.thumburl || info.url;
      const ext = info.mime.includes('png') ? '.png' : '.jpg';
      const dest = path.join(BASE, folder, filename.replace(/\.\w+$/, ext));

      const result = await download(imgUrl, dest);
      return { source: 'wikimedia', url: imgUrl, dest, result };
    }
    return null;
  } catch (e) {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// SOURCE 2: ESPN CDN Team Logos
// ═══════════════════════════════════════════════════════════
const espnLogos = {
  'creighton-bluejays': { id: 156, type: 'ncaa' },
  'omaha-mavericks': { id: 2437, type: 'ncaa' },
  'nebraska-cornhuskers': { id: 158, type: 'ncaa' },
  'omaha-storm-chasers': { id: null, type: 'milb' },
};

async function downloadESPNLogos() {
  const results = [];
  for (const [team, info] of Object.entries(espnLogos)) {
    if (!info.id) continue;
    const url = `https://a.espncdn.com/i/teamlogos/${info.type}/500/${info.id}.png`;
    const dest = path.join(BASE, 'teams', team, 'logo.png');
    try {
      const result = await download(url, dest);
      results.push({ team, result });
      console.log(`  ✓ ${team} logo: ${result}`);
    } catch (e) {
      console.log(`  ✗ ${team} logo: ${e.message}`);
    }
  }
  return results;
}

// ═══════════════════════════════════════════════════════════
// SOURCE 3: Existing pipeline images (copy/link)
// ═══════════════════════════════════════════════════════════
function linkPipelineImages() {
  const eventsDir = path.join(__dirname, '..', 'public', 'images', 'events');
  const venuesDir = path.join(__dirname, '..', 'public', 'images', 'venues');
  let count = 0;

  // Check what we already have from the pipeline
  if (fs.existsSync(eventsDir)) {
    const files = fs.readdirSync(eventsDir);
    console.log(`  Found ${files.length} existing event images in pipeline cache`);
    count += files.length;
  }
  if (fs.existsSync(venuesDir)) {
    const files = fs.readdirSync(venuesDir);
    console.log(`  Found ${files.length} existing venue images in pipeline cache`);
    count += files.length;
  }
  return count;
}

// ═══════════════════════════════════════════════════════════
// MAIN: Run all image population
// ═══════════════════════════════════════════════════════════
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  GO: Guide to Omaha — Image Population');
  console.log('═══════════════════════════════════════\n');

  let total = 0;

  // ── Step 1: ESPN Team Logos ────────────────────────────
  console.log('📦 Step 1: ESPN Team Logos');
  const logos = await downloadESPNLogos();
  total += logos.filter(l => l.result !== 'failed').length;

  // ── Step 2: Wikimedia Commons — Venues ─────────────────
  console.log('\n📦 Step 2: Wikimedia Commons — Venues');
  const venueSearches = [
    ['CHI Health Center Omaha', 'venues/chi-health-center'],
    ['Orpheum Theater Omaha Nebraska', 'venues/orpheum-theater'],
    ['TD Ameritrade Park Omaha', 'venues/charles-schwab-field'],
    ['Baxter Arena Omaha', 'venues/baxter-arena'],
    ['Werner Park Papillion Nebraska', 'venues/werner-park'],
    ['Holland Performing Arts Center Omaha', 'venues/holland-center'],
    ['Henry Doorly Zoo Omaha', 'venues/henry-doorly-zoo'],
    ['Bemis Center for Contemporary Arts Omaha', 'venues/bemis-center'],
    ['Film Streams Omaha', 'venues/film-streams'],
    ['Omaha Community Playhouse', 'venues/omaha-community-playhouse'],
    ['Liberty First Credit Union Arena Ralston', 'venues/liberty-first-credit-union-arena'],
    ['Mid-America Center Council Bluffs', 'venues/mid-america-center'],
  ];
  for (const [query, folder] of venueSearches) {
    const r = await wikimediaSearch(query, folder);
    if (r) { console.log(`  ✓ ${query}: ${r.result}`); total++; }
    else console.log(`  · ${query}: no result`);
    await new Promise(ok => setTimeout(ok, 500)); // rate limit
  }

  // ── Step 3: Wikimedia Commons — Landmarks ──────────────
  console.log('\n📦 Step 3: Wikimedia Commons — Landmarks');
  const landmarkSearches = [
    ['Bob Kerrey Pedestrian Bridge Omaha', 'landmarks/bob-kerrey-pedestrian-bridge'],
    ['Gene Leahy Mall Omaha', 'landmarks/gene-leahy-mall'],
    ['Heartland of America Park Omaha', 'landmarks/heartland-of-america-park'],
    ['Lauritzen Gardens Omaha', 'landmarks/lauritzen-gardens'],
    ['Joslyn Art Museum Omaha', 'landmarks/joslyn-art-museum'],
    ['Durham Museum Omaha', 'landmarks/durham-museum'],
    ['Freedom Park Naval Station Omaha', 'landmarks/freedom-park'],
    ['Lewis and Clark Landing Omaha', 'landmarks/lewis-and-clark-landing'],
    ['Union Station Omaha Nebraska', 'landmarks/union-station'],
    ['Kenefick Park Omaha', 'landmarks/kenefick-park'],
    ['Woodmen Tower Omaha', 'landmarks/woodmen-tower'],
  ];
  for (const [query, folder] of landmarkSearches) {
    const r = await wikimediaSearch(query, folder);
    if (r) { console.log(`  ✓ ${query}: ${r.result}`); total++; }
    else console.log(`  · ${query}: no result`);
    await new Promise(ok => setTimeout(ok, 500));
  }

  // ── Step 4: Wikimedia Commons — Neighborhoods ──────────
  console.log('\n📦 Step 4: Wikimedia Commons — Neighborhoods');
  const neighborhoodSearches = [
    ['Old Market Omaha Nebraska', 'neighborhoods/old-market'],
    ['Benson neighborhood Omaha', 'neighborhoods/benson'],
    ['Blackstone District Omaha', 'neighborhoods/blackstone'],
    ['Dundee neighborhood Omaha', 'neighborhoods/dundee'],
    ['Aksarben Village Omaha', 'neighborhoods/aksarben'],
    ['North Omaha Nebraska', 'neighborhoods/north-omaha'],
    ['South Omaha Nebraska', 'neighborhoods/south-omaha'],
    ['Downtown Omaha Nebraska skyline', 'neighborhoods/downtown'],
    ['Council Bluffs Iowa downtown', 'neighborhoods/council-bluffs'],
    ['Florence Nebraska neighborhood', 'neighborhoods/florence'],
  ];
  for (const [query, folder] of neighborhoodSearches) {
    const r = await wikimediaSearch(query, folder);
    if (r) { console.log(`  ✓ ${query}: ${r.result}`); total++; }
    else console.log(`  · ${query}: no result`);
    await new Promise(ok => setTimeout(ok, 500));
  }

  // ── Step 5: Wikimedia — Omaha Skyline/Hero ─────────────
  console.log('\n📦 Step 5: Wikimedia Commons — Hero/Skyline');
  const heroSearches = [
    ['Omaha Nebraska skyline', 'hero', 'skyline.jpg'],
    ['Omaha Nebraska downtown night', 'hero', 'skyline-night.jpg'],
    ['Omaha Nebraska aerial', 'hero', 'aerial.jpg'],
  ];
  for (const [query, folder, file] of heroSearches) {
    const r = await wikimediaSearch(query, folder, file);
    if (r) { console.log(`  ✓ ${query}: ${r.result}`); total++; }
    else console.log(`  · ${query}: no result`);
    await new Promise(ok => setTimeout(ok, 500));
  }

  // ── Step 6: Check existing pipeline images ─────────────
  console.log('\n📦 Step 6: Existing Pipeline Images');
  const pipelineCount = linkPipelineImages();

  // ── Summary ────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log(`  TOTAL NEW IMAGES DOWNLOADED: ${total}`);
  console.log(`  EXISTING PIPELINE IMAGES: ${pipelineCount}`);
  console.log('═══════════════════════════════════════');
}

main().catch(console.error);
