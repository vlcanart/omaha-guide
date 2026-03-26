/**
 * Grab remaining missing images using broader extraction patterns
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public', 'images', 'content');
let downloaded = 0;

function fetchPage(url, timeout = 12000) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', Accept: 'text/html,application/xhtml+xml,*/*' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) { const u = new URL(url); loc = u.protocol + '//' + u.host + loc; }
        return fetchPage(loc, timeout).then(resolve).catch(reject);
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', c => { data += c; if (data.length > 500000) { res.destroy(); resolve(data); } });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(timeout, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function downloadImg(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) { resolve('exists'); return; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', Accept: 'image/*,*/*' }
    }, (res) => {
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
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

const delay = ms => new Promise(ok => setTimeout(ok, ms));

// Extract ALL image URLs from HTML, score them, return best
function findBestImage(html, baseUrl) {
  const imgs = [];

  // og:image / twitter:image
  let m;
  m = html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (!m) m = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i);
  if (m) imgs.push({ url: m[1], score: 100 });

  m = html.match(/<meta[^>]+(?:property|name)=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  if (!m) m = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']twitter:image["']/i);
  if (m) imgs.push({ url: m[1], score: 90 });

  // Image tags with likely hero/profile images
  const imgTags = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*/gi);
  for (const match of imgTags) {
    const src = match[0];
    const url = match[1];
    if (!url.match(/\.(jpg|jpeg|png|webp)/i)) continue;
    if (url.match(/logo|icon|favicon|sprite|pixel|tracking|ad[s]?[_-]/i)) continue;

    let score = 10;
    if (src.match(/hero|banner|header|feature|main|press|profile|artist|photo/i)) score += 40;
    if (src.match(/width=["']?\d{3,}/i) || src.match(/1200|800|1000|large|full/i)) score += 20;
    if (src.match(/class=["'][^"']*hero|class=["'][^"']*banner|class=["'][^"']*feature/i)) score += 30;
    imgs.push({ url, score });
  }

  // Background images in CSS
  const bgImgs = html.matchAll(/background(?:-image)?:\s*url\(["']?([^)"']+)["']?\)/gi);
  for (const match of bgImgs) {
    const url = match[1];
    if (!url.match(/\.(jpg|jpeg|png|webp)/i)) continue;
    imgs.push({ url, score: 25 });
  }

  // Sort by score, return best
  imgs.sort((a, b) => b.score - a.score);
  if (!imgs.length) return null;

  let bestUrl = imgs[0].url;
  if (bestUrl.startsWith('//')) bestUrl = 'https:' + bestUrl;
  if (bestUrl.startsWith('/') && baseUrl) {
    const u = new URL(baseUrl);
    bestUrl = u.protocol + '//' + u.host + bestUrl;
  }
  return bestUrl;
}

async function grabImage(folder, urls, filename = 'hero.jpg') {
  for (const url of urls) {
    try {
      const html = await fetchPage(url);
      const imgUrl = findBestImage(html, url);
      if (imgUrl) {
        const ext = imgUrl.match(/\.png(\?|$)/i) ? '.png' : '.jpg';
        const dest = path.join(BASE, folder, filename.replace(/\.\w+$/, ext));
        const r = await downloadImg(imgUrl, dest);
        if (r === 'downloaded') { downloaded++; console.log('  OK ' + folder); return true; }
        if (r === 'exists') { console.log('  -- ' + folder + ' (exists)'); return true; }
      }
    } catch (e) { /* continue to next URL */ }
    await delay(500);
  }
  console.log('  MISS ' + folder);
  return false;
}

async function main() {
  console.log('Grabbing remaining missing images...\n');

  // ═══ ARTISTS ═══
  console.log('ARTISTS:');
  const artists = [
    ['artists/young-dubliners', ['https://youngdubliners.com/', 'https://www.youngdubliners.com/band/']],
    ['artists/bbno-dollar', ['https://www.bfrb.co/bbnodollar', 'https://bfrb.co/bbnodollar']],
    ['artists/lorna-shore', ['https://www.lornashore.com/', 'https://www.nuclearblast.de/en/artists/lorna-shore']],
    ['artists/thursday', ['https://www.thursdayband.com/', 'https://thursdayband.bandcamp.com/']],
    ['artists/good-neighbours', ['https://www.goodneighboursmusic.com/', 'https://good-neighbours.co.uk/']],
    ['artists/insane-clown-posse', ['https://www.insaneclownposse.com/', 'https://psychopathicrecords.com/']],
    ['artists/dance-with-the-dead', ['https://www.dancewiththedead.com/', 'https://dancewiththedead.bandcamp.com/']],
    ['artists/tiffany', ['https://tiffanyofficial.com/', 'https://www.tiffanytour.com/']],
    ['artists/ned-ledoux', ['https://nedledoux.com/', 'https://www.nedledoux.com/']],
    ['artists/pat-metheny', ['https://www.patmetheny.com/']],
    ['artists/william-basinski', ['https://www.mmlxii.com/']],
    ['artists/hank-azaria', ['https://www.ezstreetnyc.com/']],
    ['artists/el-khat', ['https://glitterbeatrecords.com/artists/el-khat/']],
    ['artists/bingo-loco', ['https://www.bingoloco.com/', 'https://bfrb.co/bingo-loco']],
    ['artists/bit-brigade', ['https://bitbrigade.bandcamp.com/']],
    ['artists/the-droptines', ['https://www.thedroptines.com/']],
    ['artists/runo-plum', ['https://runoplum.bandcamp.com/']],
    ['artists/hot-wheels-suite', ['https://www.bemiscenter.org/']],
    ['artists/clarion', ['https://www.theadmiralom.com/']],
    ['artists/stomach-book', ['https://stomachbook.bandcamp.com/']],
    ['artists/devil-in-the-details', ['https://www.theadmiralom.com/']],
    ['artists/hip-hop-lab', ['https://www.bemiscenter.org/']],
  ];
  for (const [folder, urls] of artists) {
    await grabImage(folder, urls);
    await delay(600);
  }

  // ═══ REMAINING VENUES ═══
  console.log('\nVENUES:');
  const venues = [
    ['venues/holland-music-club', ['https://www.hollandmusicclub.com/', 'https://www.facebook.com/HollandMusicClub/']],
    ['venues/north-omaha-music-arts', ['https://www.facebook.com/NorthOmahaMusicAndArts/']],
    ['venues/connie-claussen-field', ['https://omavs.com/']],
    ['venues/tal-anderson-field', ['https://omavs.com/']],
    ['venues/tenaska-center', ['https://www.creighton.edu/']],
  ];
  for (const [folder, urls] of venues) {
    await grabImage(folder, urls);
    await delay(600);
  }

  // ═══ REMAINING MISC ═══
  console.log('\nOTHER:');
  await grabImage('neighborhoods/council-bluffs', ['https://www.unleashcouncilbluffs.com/', 'https://www.councilbluffs-ia.gov/']);
  await delay(600);
  await grabImage('teams/omaha-lancers', ['https://www.omahalancers.com/', 'https://www.ushl.com/view#/team/11']);
  await delay(600);
  await grabImage('teams/omaha-kings-queens', ['https://www.masl2.com/']);
  await delay(600);
  await grabImage('landmarks/woodmen-tower', ['https://www.mutualofomaha.com/about-us']);
  await delay(600);
  await grabImage('landmarks/mutual-of-omaha-dome', ['https://www.mutualofomaha.com/']);

  console.log('\nDOWNLOADED: ' + downloaded);
}

main().catch(console.error);
