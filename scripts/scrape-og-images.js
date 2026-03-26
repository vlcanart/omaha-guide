/**
 * Scrape og:image meta tags from venue/landmark websites
 * to get their official hero images.
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public', 'images', 'content');

function fetchPage(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) {
          const u = new URL(url);
          loc = u.protocol + '//' + u.host + loc;
        }
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

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) { resolve('exists'); return; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
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
  // Try og:image first
  let m = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i);
  if (!m) m = html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:image"/i);
  if (m) return m[1];
  // Try twitter:image
  m = html.match(/<meta\s+(?:property|name)="twitter:image"\s+content="([^"]+)"/i);
  if (!m) m = html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="twitter:image"/i);
  return m ? m[1] : null;
}

const delay = ms => new Promise(ok => setTimeout(ok, ms));

async function main() {
  console.log('Scraping og:image from venue & landmark websites...\n');
  let downloaded = 0;

  // Sites to scrape for og:image
  const targets = [
    // Venues without images
    { url: 'https://culxrhouse.org/', folder: 'venues/culxr-house', name: 'og-image.jpg' },
    { url: 'https://www.nfrec.org/', folder: 'venues/north-omaha-music-arts', name: 'og-image.jpg' },
    { url: 'https://www.creighton.edu/athletics/facilities', folder: 'venues/ryan-center-sokol-arena', name: 'og-image.jpg' },
    { url: 'https://www.creighton.edu/athletics/softball', folder: 'venues/creighton-softball-stadium', name: 'og-image.jpg' },
    { url: 'https://midtowncrossing.com/', folder: 'venues/midtown-crossing', name: 'og-image.jpg' },
    { url: 'https://www.creighton.edu/ccas/music/tenaska-center', folder: 'venues/tenaska-center', name: 'og-image.jpg' },

    // Landmarks
    { url: 'https://www.joslyn.org/', folder: 'landmarks/joslyn-art-museum', name: 'og-image.jpg' },
    { url: 'https://www.durhammuseum.org/', folder: 'landmarks/durham-museum', name: 'og-image.jpg' },
    { url: 'https://www.lauritzengardens.org/', folder: 'landmarks/lauritzen-gardens', name: 'og-image.jpg' },
    { url: 'https://www.omahazoo.com/', folder: 'landmarks/kenefick-park', name: 'og-image.jpg' },

    // Tourism / neighborhoods
    { url: 'https://www.visitomaha.com/things-to-do/neighborhoods/old-market/', folder: 'neighborhoods/old-market', name: 'og-image.jpg' },
    { url: 'https://www.visitomaha.com/things-to-do/neighborhoods/benson/', folder: 'neighborhoods/benson', name: 'og-image.jpg' },
    { url: 'https://www.visitomaha.com/things-to-do/neighborhoods/blackstone-district/', folder: 'neighborhoods/blackstone', name: 'og-image.jpg' },
    { url: 'https://www.visitomaha.com/things-to-do/neighborhoods/dundee-happy-hollow/', folder: 'neighborhoods/dundee', name: 'og-image.jpg' },
    { url: 'https://www.visitomaha.com/things-to-do/neighborhoods/aksarben-village/', folder: 'neighborhoods/aksarben', name: 'og-image.jpg' },
    { url: 'https://www.visitomaha.com/things-to-do/neighborhoods/midtown/', folder: 'neighborhoods/midtown', name: 'og-image.jpg' },
    { url: 'https://www.visitomaha.com/things-to-do/neighborhoods/downtown/', folder: 'neighborhoods/downtown', name: 'og-image.jpg' },
    { url: 'https://www.visitomaha.com/things-to-do/neighborhoods/south-omaha/', folder: 'neighborhoods/south-omaha', name: 'og-image.jpg' },
    { url: 'https://www.visitomaha.com/things-to-do/neighborhoods/north-omaha/', folder: 'neighborhoods/north-omaha', name: 'og-image.jpg' },
    { url: 'https://www.visitomaha.com/', folder: 'hero', name: 'visit-omaha-hero.jpg' },

    // Teams
    { url: 'https://www.omahalancers.com/', folder: 'teams/omaha-lancers', name: 'og-image.jpg' },
    { url: 'https://www.milb.com/omaha', folder: 'teams/omaha-storm-chasers', name: 'og-image.jpg' },
    { url: 'https://lovb.com/', folder: 'teams/omaha-supernovas', name: 'og-image.jpg' },
  ];

  for (const t of targets) {
    try {
      console.log('  Fetching ' + t.url.substring(0, 50) + '...');
      const html = await fetchPage(t.url);
      const ogImg = extractOgImage(html);
      if (ogImg) {
        let imgUrl = ogImg;
        if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
        if (imgUrl.startsWith('/')) {
          const u = new URL(t.url);
          imgUrl = u.protocol + '//' + u.host + imgUrl;
        }
        const ext = imgUrl.match(/\.png/i) ? '.png' : '.jpg';
        const dest = path.join(BASE, t.folder, t.name.replace(/\.\w+$/, ext));
        const result = await downloadFile(imgUrl, dest);
        console.log('    -> ' + result + ': ' + t.folder + '/' + path.basename(dest));
        if (result === 'downloaded') downloaded++;
      } else {
        console.log('    -> no og:image found');
      }
    } catch (e) {
      console.log('    -> error: ' + e.message);
    }
    await delay(1000);
  }

  console.log('\nDownloaded ' + downloaded + ' new images from og:image tags');
}

main().catch(console.error);
