const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('app/data/venues.js', 'utf8');

// Map venue names to content folder slugs
const venueToSlug = {
  'CHI Health Center': 'chi-health-center',
  'Baxter Arena': 'baxter-arena',
  'Steelhouse Omaha': 'steelhouse-omaha',
  'The Astro': 'the-astro',
  'Orpheum Theater': 'orpheum-theater',
  'Holland PAC': 'holland-center',
  'The Slowdown': 'the-slowdown',
  'The Admiral': 'the-admiral',
  'Barnato': 'barnato',
  'Werner Park': 'werner-park',
  'Henry Doorly Zoo': 'henry-doorly-zoo',
  'Film Streams': 'film-streams',
  'Liberty First CU Arena': 'liberty-first-credit-union-arena',
  'Hoff Family Arts': 'hoff-family-arts-center',
  'Omaha Community Playhouse': 'omaha-community-playhouse',
  'Mid-America Center': 'mid-america-center',
  'Bemis Center': 'bemis-center',
  'Whiskey Roadhouse': 'whiskey-roadhouse',
  'Witherspoon Concert Hall': 'witherspoon-theater',
};

const contentBase = path.join('public', 'images', 'content', 'venues');
let count = 0;

for (const [venueName, slug] of Object.entries(venueToSlug)) {
  const dir = path.join(contentBase, slug);
  if (!fs.existsSync(dir)) continue;
  const imgs = fs.readdirSync(dir).filter(f => f.match(/\.(jpg|jpeg|png)$/i));
  if (!imgs.length) continue;

  const imgPath = `/images/content/venues/${slug}/${imgs[0]}`;

  // Find the venue in the data and replace its img
  const nameIdx = content.indexOf(`name:"${venueName}"`);
  if (nameIdx === -1) continue;

  const imgIdx = content.indexOf('img:u(', nameIdx);
  if (imgIdx === -1 || imgIdx > nameIdx + 500) continue;

  const closeIdx = content.indexOf(')', imgIdx);
  if (closeIdx === -1) continue;

  const before = content.slice(0, imgIdx);
  const after = content.slice(closeIdx + 1);
  content = before + `img:"${imgPath}"` + after;
  count++;
}

fs.writeFileSync('app/data/venues.js', content);
console.log(`Updated ${count} venues with content library images`);
