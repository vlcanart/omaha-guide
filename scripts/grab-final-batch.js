/**
 * Final batch: Use Wikipedia API with better article matching,
 * plus fallback to wikimedia file search with simpler terms
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public', 'images', 'content');
let downloaded = 0;

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'GO-Guide-Omaha/1.0 (event-app)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJSON(res.headers.location).then(resolve).catch(reject);
      }
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

function downloadImg(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) { resolve('exists'); return; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const proto = url.startsWith('https') ? https : require('http');
    proto.get(url, { headers: { 'User-Agent': 'GO-Guide-Omaha/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImg(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { reject(new Error('HTTP ' + res.statusCode)); return; }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (buf.length < 2000) { reject(new Error('too small')); return; }
        fs.writeFileSync(dest, buf);
        resolve('downloaded');
      });
    }).on('error', reject);
  });
}

const delay = ms => new Promise(ok => setTimeout(ok, ms));

// Search Wikipedia, get first matching article's main image
async function wikiSearch(query, folder) {
  try {
    const q = encodeURIComponent(query);
    // Step 1: Search for the article
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&srlimit=1&format=json`;
    const searchData = await fetchJSON(searchUrl);
    if (!searchData.query?.search?.length) return false;

    const pageTitle = searchData.query.search[0].title;

    // Step 2: Get the page image
    const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&pithumbsize=800&format=json`;
    const imgData = await fetchJSON(imgUrl);
    const pages = Object.values(imgData.query?.pages || {});
    if (!pages.length || !pages[0].thumbnail?.source) return false;

    const src = pages[0].thumbnail.source;
    const ext = src.match(/\.png/i) ? '.png' : '.jpg';
    const dest = path.join(BASE, folder, 'hero' + ext);
    const r = await downloadImg(src, dest);
    if (r === 'downloaded') { downloaded++; console.log('  OK ' + folder + ' (wiki: ' + pageTitle + ')'); return true; }
    if (r === 'exists') return true;
  } catch (e) { /* */ }
  return false;
}

async function main() {
  console.log('Final batch image grab via Wikipedia search\n');

  const targets = [
    { query: 'bbno$ rapper', folder: 'artists/bbno-dollar' },
    { query: 'Bingo Loco entertainment', folder: 'artists/bingo-loco' },
    { query: 'Good Neighbours band Home', folder: 'artists/good-neighbours' },
    { query: 'Insane Clown Posse band', folder: 'artists/insane-clown-posse' },
    { query: 'Lorna Shore deathcore band', folder: 'artists/lorna-shore' },
    { query: 'William Basinski ambient', folder: 'artists/william-basinski' },
    { query: 'Hank Azaria actor', folder: 'artists/hank-azaria' },
    { query: 'El Khat Yemenite band', folder: 'artists/el-khat' },
    { query: 'Young Dubliners Irish rock band', folder: 'artists/young-dubliners' },
    { query: 'Council Bluffs Iowa city', folder: 'neighborhoods/council-bluffs' },
    { query: 'Woodmen Tower Omaha', folder: 'landmarks/woodmen-tower' },
    { query: 'Omaha Lancers hockey', folder: 'teams/omaha-lancers' },
  ];

  for (const t of targets) {
    const ok = await wikiSearch(t.query, t.folder);
    if (!ok) console.log('  MISS ' + t.folder);
    await delay(600);
  }

  console.log('\nDOWNLOADED: ' + downloaded);
}

main().catch(console.error);
