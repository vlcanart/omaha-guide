const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public', 'images', 'content');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) { resolve('exists'); return; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const proto = url.startsWith('https') ? https : require('http');
    proto.get(url, { headers: { 'User-Agent': 'GO-Guide-Omaha/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve('downloaded'); });
    }).on('error', reject).setTimeout(15000, function() { this.destroy(); reject(new Error('timeout')); });
  });
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'GO-Guide-Omaha/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJSON(res.headers.location).then(resolve).catch(reject);
      }
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

const delay = ms => new Promise(ok => setTimeout(ok, ms));

// ═══════════════════════════════════════════════════════════
// Wikimedia Commons — search FILES (not articles)
// ═══════════════════════════════════════════════════════════
async function wikimediaFile(query, folder, filename = 'hero.jpg') {
  try {
    const q = encodeURIComponent(query);
    // Use list=search in File namespace (ns=6)
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${q}&srnamespace=6&srlimit=5&format=json`;
    const data = await fetchJSON(url);
    if (!data.query?.search?.length) return null;

    for (const result of data.query.search) {
      const title = result.title;
      if (!title.match(/\.(jpg|jpeg|png)$/i)) continue;

      // Get image URL
      const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1200&format=json`;
      const info = await fetchJSON(infoUrl);
      const pages = Object.values(info.query?.pages || {});
      if (!pages.length || !pages[0].imageinfo) continue;

      const ii = pages[0].imageinfo[0];
      if (ii.size < 5000) continue;
      const imgUrl = ii.thumburl || ii.url;
      const ext = ii.mime?.includes('png') ? '.png' : '.jpg';
      const dest = path.join(BASE, folder, filename.replace(/\.\w+$/, ext));
      const r = await download(imgUrl, dest);
      return { source: 'wikimedia', title, result: r, dest };
    }
    return null;
  } catch (e) { return null; }
}

// ═══════════════════════════════════════════════════════════
// Copy existing pipeline venue images
// ═══════════════════════════════════════════════════════════
function copyPipelineVenueImages() {
  const src = path.join(__dirname, '..', 'public', 'images', 'venues');
  if (!fs.existsSync(src)) return 0;

  const venueMap = {
    'chi-health-center': 'chi-health-center',
    'orpheum': 'orpheum-theater',
    'slowdown': 'the-slowdown',
    'bemis': 'bemis-center',
    'schwab': 'charles-schwab-field',
    'baxter': 'baxter-arena',
    'astro': 'the-astro',
    'admiral': 'the-admiral',
    'holland': 'holland-center',
    'werner': 'werner-park',
    'steelhouse': 'steelhouse-omaha',
    'liberty': 'liberty-first-credit-union-arena',
    'barnato': 'barnato',
    'film-stream': 'film-streams',
    'playhouse': 'omaha-community-playhouse',
    'mid-america': 'mid-america-center',
    'hoff': 'hoff-family-arts-center',
    'whiskey': 'whiskey-roadhouse',
    'north-omaha': 'north-omaha-music-arts',
    'culxr': 'culxr-house',
    'zoo': 'henry-doorly-zoo',
    'witherspoon': 'witherspoon-theater',
    'sokol': 'ryan-center-sokol-arena',
    'blackstone': 'blackstone-district',
    'tenaska': 'tenaska-center',
  };

  let count = 0;
  const files = fs.readdirSync(src);
  for (const file of files) {
    const lower = file.toLowerCase();
    for (const [key, folder] of Object.entries(venueMap)) {
      if (lower.includes(key)) {
        const dest = path.join(BASE, 'venues', folder, `venue-${count}.jpg`);
        if (!fs.existsSync(dest)) {
          fs.copyFileSync(path.join(src, file), dest);
          count++;
          console.log(`  ✓ Copied ${file} → venues/${folder}/`);
        }
        break;
      }
    }
  }
  return count;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  GO: Guide to Omaha — Image Population v2');
  console.log('═══════════════════════════════════════\n');
  let total = 0;

  // ── ESPN Logos ─────────────────────────────────────
  console.log('📦 ESPN Team Logos');
  const espn = {
    'creighton-bluejays': 156,
    'omaha-mavericks': 2437,
    'nebraska-cornhuskers': 158,
  };
  for (const [team, id] of Object.entries(espn)) {
    try {
      const r = await download(`https://a.espncdn.com/i/teamlogos/ncaa/500/${id}.png`, path.join(BASE, 'teams', team, 'logo.png'));
      console.log(`  ✓ ${team}: ${r}`); total++;
    } catch(e) { console.log(`  ✗ ${team}: ${e.message}`); }
  }
  // Storm Chasers and others from MiLB/LOVB
  try {
    const r = await download('https://www.milb.com/d3/blt-teams/omaha-storm-chasers-logo-3x.png', path.join(BASE, 'teams', 'omaha-storm-chasers', 'logo.png'));
    console.log(`  ✓ omaha-storm-chasers: ${r}`); total++;
  } catch(e) {}

  // ── Pipeline venue images ─────────────────────────
  console.log('\n📦 Pipeline Venue Images (existing)');
  total += copyPipelineVenueImages();

  // ── Wikimedia Venues ──────────────────────────────
  console.log('\n📦 Wikimedia Commons — Venues');
  const venueWiki = [
    ['"CHI Health Center" Omaha arena', 'venues/chi-health-center'],
    ['"Orpheum Theater" Omaha', 'venues/orpheum-theater'],
    ['"TD Ameritrade Park" OR "Charles Schwab Field" Omaha', 'venues/charles-schwab-field'],
    ['"Baxter Arena" Omaha', 'venues/baxter-arena'],
    ['"Werner Park" Papillion', 'venues/werner-park'],
    ['"Holland Performing Arts Center" Omaha', 'venues/holland-center'],
    ['"Henry Doorly Zoo" Omaha', 'venues/henry-doorly-zoo'],
    ['"Omaha Community Playhouse"', 'venues/omaha-community-playhouse'],
    ['"Joslyn Art Museum" Omaha', 'venues/henry-doorly-zoo'], // Also gets landmark
  ];
  for (const [q, folder] of venueWiki) {
    const r = await wikimediaFile(q, folder);
    if (r) { console.log(`  ✓ ${q.substring(0,40)}: ${r.result} (${r.title})`); total++; }
    else console.log(`  · ${q.substring(0,40)}: no result`);
    await delay(600);
  }

  // ── Wikimedia Landmarks ───────────────────────────
  console.log('\n📦 Wikimedia Commons — Landmarks');
  const landmarkWiki = [
    ['"Bob Kerrey Pedestrian Bridge" Omaha', 'landmarks/bob-kerrey-pedestrian-bridge'],
    ['"Gene Leahy Mall" Omaha', 'landmarks/gene-leahy-mall'],
    ['"Lauritzen Gardens" Omaha', 'landmarks/lauritzen-gardens'],
    ['"Joslyn Art Museum" Omaha', 'landmarks/joslyn-art-museum'],
    ['"Durham Museum" Omaha', 'landmarks/durham-museum'],
    ['Omaha Nebraska skyline', 'landmarks/kenefick-park', 'skyline.jpg'],
    ['"First National Bank" tower Omaha', 'landmarks/first-national-tower'],
    ['"Woodmen Tower" Omaha OR "Mutual of Omaha"', 'landmarks/woodmen-tower'],
  ];
  for (const [q, folder, file] of landmarkWiki) {
    const r = await wikimediaFile(q, folder, file || 'hero.jpg');
    if (r) { console.log(`  ✓ ${q.substring(0,40)}: ${r.result} (${r.title})`); total++; }
    else console.log(`  · ${q.substring(0,40)}: no result`);
    await delay(600);
  }

  // ── Wikimedia Neighborhoods ───────────────────────
  console.log('\n📦 Wikimedia Commons — Neighborhoods');
  const hoodWiki = [
    ['"Old Market" Omaha Nebraska', 'neighborhoods/old-market'],
    ['Benson Omaha neighborhood', 'neighborhoods/benson'],
    ['Dundee Omaha Nebraska', 'neighborhoods/dundee'],
    ['Aksarben Village Omaha', 'neighborhoods/aksarben'],
    ['North Omaha Nebraska', 'neighborhoods/north-omaha'],
    ['South Omaha Nebraska', 'neighborhoods/south-omaha'],
    ['Downtown Omaha Nebraska', 'neighborhoods/downtown'],
    ['Council Bluffs Iowa', 'neighborhoods/council-bluffs'],
  ];
  for (const [q, folder] of hoodWiki) {
    const r = await wikimediaFile(q, folder);
    if (r) { console.log(`  ✓ ${q.substring(0,40)}: ${r.result} (${r.title})`); total++; }
    else console.log(`  · ${q.substring(0,40)}: no result`);
    await delay(600);
  }

  // ── Wikimedia Hero/Skyline ────────────────────────
  console.log('\n📦 Wikimedia Commons — Hero Images');
  const heroWiki = [
    ['Omaha Nebraska skyline panorama', 'hero', 'skyline.jpg'],
    ['Omaha Nebraska downtown aerial', 'hero', 'downtown.jpg'],
  ];
  for (const [q, folder, file] of heroWiki) {
    const r = await wikimediaFile(q, folder, file);
    if (r) { console.log(`  ✓ ${q.substring(0,40)}: ${r.result} (${r.title})`); total++; }
    else console.log(`  · ${q.substring(0,40)}: no result`);
    await delay(600);
  }

  // ── Summary ───────────────────────────────────────
  // Count total files across all folders
  let totalFiles = 0;
  function countFiles(dir) {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir)) {
      const fp = path.join(dir, f);
      if (fs.statSync(fp).isDirectory()) countFiles(fp);
      else if (f.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) totalFiles++;
    }
  }
  countFiles(BASE);

  console.log('\n═══════════════════════════════════════');
  console.log(`  NEW DOWNLOADS THIS RUN: ${total}`);
  console.log(`  TOTAL IMAGE FILES IN CONTENT: ${totalFiles}`);
  console.log('═══════════════════════════════════════');
}

main().catch(console.error);
