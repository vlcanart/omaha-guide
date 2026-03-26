/**
 * Grab artist/venue images from Wikipedia (CC-licensed)
 * Uses the Wikipedia API to find article images
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public', 'images', 'content');
let downloaded = 0;

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'GO-Guide-Omaha/1.0 (omaha-guide; contact@example.com)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJSON(res.headers.location).then(resolve).catch(reject);
      }
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { reject(new Error('Parse error: ' + d.substring(0,100))); } });
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

async function getWikiImage(title, folder) {
  try {
    // Get page image from Wikipedia
    const t = encodeURIComponent(title);
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${t}&prop=pageimages&pithumbsize=800&format=json`;
    const data = await fetchJSON(url);
    const pages = Object.values(data.query?.pages || {});
    if (!pages.length) return false;

    const page = pages[0];
    if (page.thumbnail?.source) {
      const imgUrl = page.thumbnail.source;
      const ext = imgUrl.match(/\.png/i) ? '.png' : '.jpg';
      const dest = path.join(BASE, folder, 'hero' + ext);
      const r = await downloadImg(imgUrl, dest);
      if (r === 'downloaded') { downloaded++; console.log('  OK ' + folder + ' (' + title + ')'); return true; }
      if (r === 'exists') { console.log('  -- ' + folder + ' (exists)'); return true; }
    }
    return false;
  } catch (e) {
    return false;
  }
}

async function main() {
  console.log('Wikipedia Image Grab\n');

  // Artists
  console.log('ARTISTS:');
  const artists = [
    ['Bbno$', 'artists/bbno-dollar'],
    ['Bingo Loco', 'artists/bingo-loco'],
    ['Good Neighbours (band)', 'artists/good-neighbours'],
    ['Insane Clown Posse', 'artists/insane-clown-posse'],
    ['Lorna Shore', 'artists/lorna-shore'],
    ['William Basinski', 'artists/william-basinski'],
    ['Hank Azaria', 'artists/hank-azaria'],
    ['El Khat', 'artists/el-khat'],
    ['Young Dubliners', 'artists/young-dubliners'],
  ];
  for (const [title, folder] of artists) {
    const ok = await getWikiImage(title, folder);
    if (!ok) console.log('  MISS ' + folder);
    await delay(500);
  }

  // Remaining venues
  console.log('\nVENUES:');
  const venues = [
    ['Council Bluffs, Iowa', 'neighborhoods/council-bluffs'],
    ['Woodmen Tower', 'landmarks/woodmen-tower'],
    ['Omaha Lancers', 'teams/omaha-lancers'],
  ];
  for (const [title, folder] of venues) {
    const ok = await getWikiImage(title, folder);
    if (!ok) console.log('  MISS ' + folder);
    await delay(500);
  }

  console.log('\nDOWNLOADED: ' + downloaded);
}

main().catch(console.error);
