/**
 * grab-all-images.js — First pass image grab for ALL empty folders
 * Uses Spotify embeds for artists, og:image for venues/landmarks,
 * and Visit Omaha for neighborhoods.
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public', 'images', 'content');
let downloaded = 0;
let failed = 0;

function fetchPage(url, timeout = 12000) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', Accept: 'text/html,application/xhtml+xml' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) { const u = new URL(url); loc = u.protocol + '//' + u.host + loc; }
        return fetchPage(loc, timeout).then(resolve).catch(reject);
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', c => data += c);
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
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', Accept: 'image/*' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImg(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { reject(new Error('HTTP ' + res.statusCode)); return; }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve('downloaded'); });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function extractOgImage(html) {
  let m = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (!m) m = html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);
  if (m) return m[1];
  m = html.match(/<meta\s+(?:property|name)=["']twitter:image["']\s+content=["']([^"']+)["']/i);
  if (!m) m = html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']twitter:image["']/i);
  return m ? m[1] : null;
}

const delay = ms => new Promise(ok => setTimeout(ok, ms));

async function grabFromUrl(url, folder, filename) {
  try {
    const html = await fetchPage(url);
    let imgUrl = extractOgImage(html);
    if (!imgUrl) {
      // Try to find any large image in the page
      const imgs = html.match(/https?:\/\/[^"'\s]+\.(jpg|jpeg|png|webp)[^"'\s]*/gi) || [];
      const big = imgs.find(u => u.match(/hero|banner|header|feature|main|og|share|social|1200|large|full/i));
      imgUrl = big || imgs[0];
    }
    if (!imgUrl) return false;
    if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
    const ext = imgUrl.match(/\.png/i) ? '.png' : '.jpg';
    const dest = path.join(BASE, folder, filename.replace(/\.\w+$/, ext));
    const r = await downloadImg(imgUrl, dest);
    if (r === 'downloaded') { downloaded++; console.log('  OK ' + folder); return true; }
    if (r === 'exists') { console.log('  -- ' + folder + ' (exists)'); return true; }
  } catch (e) { /* silent */ }
  return false;
}

async function grabSpotifyArtist(spotifyUrl, folder) {
  if (!spotifyUrl) return false;
  try {
    // Spotify open.spotify.com pages have og:image with the artist photo
    const html = await fetchPage(spotifyUrl);
    let imgUrl = extractOgImage(html);
    if (!imgUrl) return false;
    if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
    const dest = path.join(BASE, folder, 'hero.jpg');
    const r = await downloadImg(imgUrl, dest);
    if (r === 'downloaded') { downloaded++; console.log('  OK ' + folder + ' (spotify)'); return true; }
    if (r === 'exists') { console.log('  -- ' + folder + ' (exists)'); return true; }
  } catch (e) { /* silent */ }
  return false;
}

async function main() {
  console.log('GO: Guide to Omaha — Mass Image Grab\n');

  // ═══════════════════════════════════════════════════════
  // ARTISTS — Spotify og:image + artist websites
  // ═══════════════════════════════════════════════════════
  console.log('ARTISTS (33)');
  const artists = [
    { folder: 'artists/young-dubliners', spotify: 'https://open.spotify.com/artist/0dEvJpkqhrcn64d3kYSJqx', web: 'https://youngdubliners.com/' },
    { folder: 'artists/the-happy-fits', spotify: 'https://open.spotify.com/artist/73rPcaYEhBd0UuVZBqqyQJ', web: 'https://thehappyfits.com/' },
    { folder: 'artists/whitney-cummings', spotify: '', web: 'https://www.whitneycummings.com/' },
    { folder: 'artists/bbno-dollar', spotify: 'https://open.spotify.com/artist/41X1TR6hrK8Q2ZCpp2EqCz', web: '' },
    { folder: 'artists/lorna-shore', spotify: 'https://open.spotify.com/artist/7sQxDqSFREHdSMSmybk2mD', web: '' },
    { folder: 'artists/thursday', spotify: 'https://open.spotify.com/artist/61awhbNK16ku1uQyXRsQj5', web: '' },
    { folder: 'artists/fuel', spotify: 'https://open.spotify.com/artist/687cZJR45JO7bkoog48aUg', web: 'https://www.fuel-official.com/' },
    { folder: 'artists/brandon-lake', spotify: 'https://open.spotify.com/artist/5p3BFMGFBsXoKBz1JMbUtj', web: 'https://brandonlake.co/' },
    { folder: 'artists/good-neighbours', spotify: 'https://open.spotify.com/artist/52N3KGrTWDRhdQJrgBTofE', web: '' },
    { folder: 'artists/insane-clown-posse', spotify: 'https://open.spotify.com/artist/4xtWjIlVuZwTCeqVAsgEXy', web: '' },
    { folder: 'artists/dance-with-the-dead', spotify: 'https://open.spotify.com/artist/0HLcxSKJabFeqPH79o56jN', web: '' },
    { folder: 'artists/tiffany', spotify: 'https://open.spotify.com/artist/0fA0jqZBwBm4rRDOSMsMzQ', web: '' },
    { folder: 'artists/ned-ledoux', spotify: 'https://open.spotify.com/artist/5oaIvILfMnmI2gG9bDyqka', web: 'https://nedledoux.com/' },
    { folder: 'artists/stephen-wilson-jr', spotify: 'https://open.spotify.com/artist/4DSDa4HvAWqvb3dMHUOAfd', web: 'https://stephenwilsonjr.com/' },
    { folder: 'artists/paul-gilbert', spotify: 'https://open.spotify.com/artist/19sJfp2FK2evlsw46WVhPG', web: 'http://www.paulgilbert.com/' },
    { folder: 'artists/max-mcnown', spotify: 'https://open.spotify.com/artist/340PS4ZcZ4UCBgyrXzEjcp', web: 'https://www.maxmcnown.com/' },
    { folder: 'artists/william-basinski', spotify: 'https://open.spotify.com/artist/4MKfIxBRh56fMqVMjT5UNQ', web: '' },
    { folder: 'artists/hank-azaria', spotify: '', web: 'https://www.ezstreetnyc.com/' },
    { folder: 'artists/clarence-tilton', spotify: 'https://open.spotify.com/artist/0O2UiRmMnoDWFfRcBlHIgv', web: 'https://www.clarencetilton.com/' },
    { folder: 'artists/vanessa-collier', spotify: 'https://open.spotify.com/artist/3AKBgmzXDcMJoL2F2WaQY7', web: 'https://www.vanessacollier.com/' },
    { folder: 'artists/pat-metheny', spotify: 'https://open.spotify.com/artist/2UJqCVJuBfOagb4kNNjWqw', web: 'https://www.patmetheny.com/' },
    { folder: 'artists/jo-koy', spotify: '', web: 'https://jokoy.com/' },
    { folder: 'artists/bit-brigade', spotify: 'https://open.spotify.com/artist/1v5v5OoSBQVVmGFjwJkpGu', web: '' },
    { folder: 'artists/riley-mulherkar', spotify: 'https://open.spotify.com/artist/6Xsz36MkORJCBaGpgv5RiG', web: 'https://www.rileymulherkar.com/' },
    { folder: 'artists/el-khat', spotify: 'https://open.spotify.com/artist/5s3MHjWeKhYEQyFkaAuLaR', web: '' },
    { folder: 'artists/the-droptines', spotify: '', web: '' },
    { folder: 'artists/runo-plum', spotify: '', web: '' },
    { folder: 'artists/hot-wheels-suite', spotify: '', web: '' },
    { folder: 'artists/clarion', spotify: '', web: '' },
    { folder: 'artists/stomach-book', spotify: '', web: '' },
    { folder: 'artists/devil-in-the-details', spotify: '', web: '' },
    { folder: 'artists/bingo-loco', spotify: '', web: 'https://www.bfrb.co/bingo-loco' },
    { folder: 'artists/hip-hop-lab', spotify: '', web: '' },
  ];

  for (const a of artists) {
    let ok = false;
    // Try Spotify first
    if (a.spotify) { ok = await grabSpotifyArtist(a.spotify, a.folder); await delay(800); }
    // Try artist website
    if (!ok && a.web) { ok = await grabFromUrl(a.web, a.folder, 'hero.jpg'); await delay(800); }
    if (!ok) { failed++; console.log('  MISS ' + a.folder); }
  }

  // ═══════════════════════════════════════════════════════
  // REMAINING VENUES
  // ═══════════════════════════════════════════════════════
  console.log('\nVENUES (empty ones)');
  const venues = [
    { folder: 'venues/blackstone-district', url: 'https://www.visitomaha.com/things-to-do/neighborhoods/blackstone-district/' },
    { folder: 'venues/midtown-crossing', url: 'https://www.midtowncrossing.com/' },
    { folder: 'venues/culxr-house', url: 'https://www.instagram.com/culxrhouse/' },
    { folder: 'venues/holland-music-club', url: 'https://www.hollandmusicclub.com/' },
    { folder: 'venues/north-omaha-music-arts', url: 'https://www.facebook.com/NorthOmahaMusicAndArts/' },
    { folder: 'venues/tom-hanafan-park', url: 'https://www.visitomaha.com/listing/tom-hanafan-rivers-edge-park/34660/' },
    { folder: 'venues/tenaska-center', url: 'https://www.creighton.edu/ccas/music' },
    { folder: 'venues/ryan-center-sokol-arena', url: 'https://gocreighton.com/facilities/d-j-sokol-arena/1' },
    { folder: 'venues/connie-claussen-field', url: 'https://omavs.com/facilities/connie-claussen-field/1' },
    { folder: 'venues/tal-anderson-field', url: 'https://omavs.com/facilities/tal-anderson-field/1' },
    { folder: 'venues/creighton-softball-stadium', url: 'https://gocreighton.com/facilities/' },
  ];
  for (const v of venues) {
    const ok = await grabFromUrl(v.url, v.folder, 'hero.jpg');
    if (!ok) { failed++; console.log('  MISS ' + v.folder); }
    await delay(800);
  }

  // ═══════════════════════════════════════════════════════
  // REMAINING TEAMS
  // ═══════════════════════════════════════════════════════
  console.log('\nTEAMS (remaining)');
  const teams = [
    { folder: 'teams/omaha-lancers', url: 'https://www.omahalancers.com/' },
    { folder: 'teams/omaha-kings-queens', url: 'https://www.facebook.com/OmahaKingsQueens/' },
  ];
  for (const t of teams) {
    const ok = await grabFromUrl(t.url, t.folder, 'logo.jpg');
    if (!ok) { failed++; console.log('  MISS ' + t.folder); }
    await delay(800);
  }

  // ═══════════════════════════════════════════════════════
  // NEIGHBORHOODS — Visit Omaha + other sources
  // ═══════════════════════════════════════════════════════
  console.log('\nNEIGHBORHOODS (remaining empty)');
  const hoods = [
    { folder: 'neighborhoods/blackstone', url: 'https://www.visitomaha.com/things-to-do/neighborhoods/blackstone-district/' },
    { folder: 'neighborhoods/dundee', url: 'https://www.visitomaha.com/things-to-do/neighborhoods/dundee-happy-hollow/' },
    { folder: 'neighborhoods/midtown', url: 'https://www.visitomaha.com/things-to-do/neighborhoods/midtown/' },
    { folder: 'neighborhoods/downtown', url: 'https://www.visitomaha.com/things-to-do/neighborhoods/downtown/' },
    { folder: 'neighborhoods/council-bluffs', url: 'https://www.unleashcouncilbluffs.com/' },
    { folder: 'neighborhoods/la-vista-papillion', url: 'https://www.visitomaha.com/things-to-do/neighborhoods/la-vista/' },
    { folder: 'neighborhoods/florence', url: 'https://www.visitomaha.com/things-to-do/neighborhoods/north-omaha/' },
    { folder: 'neighborhoods/elkhorn', url: 'https://www.visitomaha.com/things-to-do/neighborhoods/west-omaha/' },
    { folder: 'neighborhoods/west-omaha', url: 'https://www.visitomaha.com/things-to-do/neighborhoods/west-omaha/' },
    { folder: 'neighborhoods/little-italy', url: 'https://www.visitomaha.com/things-to-do/neighborhoods/south-omaha/' },
  ];
  for (const h of hoods) {
    const ok = await grabFromUrl(h.url, h.folder, 'hero.jpg');
    if (!ok) { failed++; console.log('  MISS ' + h.folder); }
    await delay(800);
  }

  // ═══════════════════════════════════════════════════════
  // LANDMARKS
  // ═══════════════════════════════════════════════════════
  console.log('\nLANDMARKS');
  const landmarks = [
    { folder: 'landmarks/bob-kerrey-pedestrian-bridge', url: 'https://www.visitomaha.com/listing/bob-kerrey-pedestrian-bridge/27138/' },
    { folder: 'landmarks/gene-leahy-mall', url: 'https://www.visitomaha.com/listing/gene-leahy-mall-at-the-riverfront/49924/' },
    { folder: 'landmarks/lauritzen-gardens', url: 'https://www.lauritzengardens.org/' },
    { folder: 'landmarks/heartland-of-america-park', url: 'https://www.visitomaha.com/listing/heartland-of-america-park-at-the-riverfront/49926/' },
    { folder: 'landmarks/kenefick-park', url: 'https://www.visitomaha.com/listing/kenefick-park/27166/' },
    { folder: 'landmarks/freedom-park', url: 'https://www.visitomaha.com/listing/freedom-park/27149/' },
    { folder: 'landmarks/lewis-and-clark-landing', url: 'https://www.visitomaha.com/listing/lewis-clark-landing-at-the-riverfront/49928/' },
    { folder: 'landmarks/union-station', url: 'https://www.durhammuseum.org/' },
    { folder: 'landmarks/first-national-tower', url: 'https://www.visitomaha.com/things-to-do/neighborhoods/downtown/' },
    { folder: 'landmarks/woodmen-tower', url: 'https://www.mutualofomaha.com/' },
    { folder: 'landmarks/mutual-of-omaha-dome', url: 'https://www.mutualofomaha.com/' },
    { folder: 'landmarks/td-ameritrade-park', url: 'https://www.visitomaha.com/listing/charles-schwab-field-omaha/27134/' },
    { folder: 'landmarks/el-museo-latino', url: 'https://www.elmuseolatino.org/' },
    { folder: 'landmarks/great-plains-black-history-museum', url: 'https://gpblackhistorymuseum.org/' },
  ];
  for (const l of landmarks) {
    const ok = await grabFromUrl(l.url, l.folder, 'hero.jpg');
    if (!ok) { failed++; console.log('  MISS ' + l.folder); }
    await delay(800);
  }

  // ═══════════════════════════════════════════════════════
  // CATEGORY HEROES — copy best venue images
  // ═══════════════════════════════════════════════════════
  console.log('\nCATEGORY HEROES');
  const catCopies = [
    { src: 'venues/the-slowdown/the-slowdown.jpg', dest: 'categories/concerts/hero.jpg' },
    { src: 'venues/charles-schwab-field/charles-schwab-field.jpg', dest: 'categories/sports/hero.jpg' },
    { src: 'venues/the-astro/the-astro.jpg', dest: 'categories/comedy/hero.jpg' },
    { src: 'venues/orpheum-theater/orpheum-theater.jpg', dest: 'categories/arts/hero.jpg' },
    { src: 'venues/henry-doorly-zoo/henry-doorly-zoo.jpg', dest: 'categories/family/hero.jpg' },
    { src: 'venues/chi-health-center/chi-health-center.jpg', dest: 'categories/festivals/hero.jpg' },
  ];
  for (const c of catCopies) {
    const srcPath = path.join(BASE, c.src);
    const destPath = path.join(BASE, c.dest);
    if (fs.existsSync(srcPath)) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
      console.log('  OK ' + c.dest);
      downloaded++;
    } else {
      console.log('  MISS ' + c.src + ' (source not found)');
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('DOWNLOADED: ' + downloaded);
  console.log('FAILED: ' + failed);
  console.log('═══════════════════════════════════════');
}

main().catch(console.error);
