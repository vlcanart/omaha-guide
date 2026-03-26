const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', 'public', 'images', 'content');

const structure = {
  artists: [
    'young-dubliners', 'the-happy-fits', 'whitney-cummings', 'bbno-dollar',
    'lorna-shore', 'thursday', 'fuel', 'brandon-lake', 'good-neighbours',
    'insane-clown-posse', 'dance-with-the-dead', 'tiffany', 'ned-ledoux',
    'stephen-wilson-jr', 'paul-gilbert', 'max-mcnown', 'william-basinski',
    'hank-azaria', 'clarence-tilton', 'vanessa-collier', 'pat-metheny',
    'jo-koy', 'bit-brigade', 'riley-mulherkar', 'el-khat', 'the-droptines',
    'runo-plum', 'hot-wheels-suite', 'clarion', 'stomach-book',
    'devil-in-the-details', 'bingo-loco', 'hip-hop-lab',
  ],
  venues: [
    'chi-health-center', 'orpheum-theater', 'the-slowdown', 'bemis-center',
    'charles-schwab-field', 'baxter-arena', 'the-astro', 'the-admiral',
    'holland-center', 'werner-park', 'steelhouse-omaha',
    'liberty-first-credit-union-arena', 'barnato', 'film-streams',
    'omaha-community-playhouse', 'mid-america-center',
    'hoff-family-arts-center', 'whiskey-roadhouse',
    'north-omaha-music-arts', 'holland-music-club', 'culxr-house',
    'henry-doorly-zoo', 'witherspoon-theater', 'ryan-center-sokol-arena',
    'tom-hanafan-park', 'blackstone-district', 'midtown-crossing',
    'connie-claussen-field', 'creighton-softball-stadium',
    'tal-anderson-field', 'tenaska-center',
  ],
  teams: [
    'creighton-bluejays', 'omaha-mavericks', 'omaha-lancers',
    'nebraska-cornhuskers', 'omaha-storm-chasers', 'omaha-supernovas',
    'omaha-kings-queens',
  ],
  neighborhoods: [
    'old-market', 'benson', 'blackstone', 'dundee', 'midtown',
    'aksarben', 'north-omaha', 'south-omaha', 'council-bluffs',
    'la-vista-papillion', 'downtown', 'little-italy', 'florence',
    'west-omaha', 'elkhorn',
  ],
  landmarks: [
    'bob-kerrey-pedestrian-bridge', 'heartland-of-america-park',
    'gene-leahy-mall', 'lauritzen-gardens', 'joslyn-art-museum',
    'durham-museum', 'el-museo-latino', 'great-plains-black-history-museum',
    'freedom-park', 'lewis-and-clark-landing', 'td-ameritrade-park',
    'mutual-of-omaha-dome', 'woodmen-tower', 'first-national-tower',
    'kenefick-park', 'union-station',
  ],
  categories: [
    'concerts', 'sports', 'comedy', 'arts', 'family', 'festivals',
  ],
  hero: [],
};

let count = 0;
for (const [group, folders] of Object.entries(structure)) {
  const groupDir = path.join(base, group);
  fs.mkdirSync(groupDir, { recursive: true });
  count++;
  if (folders.length === 0) continue;
  for (const folder of folders) {
    fs.mkdirSync(path.join(groupDir, folder), { recursive: true });
    count++;
  }
}

// Create README in each top-level folder
const readmes = {
  artists: `# Artist Images
Each subfolder = one artist/performer.
Files: hero.jpg (press photo), thumb.jpg (200x200), banner.jpg (1200x400)
Source priority: Official press kit > Spotify > Wikimedia Commons`,
  venues: `# Venue Images
Each subfolder = one venue.
Files: exterior.jpg, interior.jpg, thumb.jpg (200x200), banner.jpg (1200x400)
Source priority: Venue website > Google Places > Wikimedia > Visit Omaha`,
  teams: `# Team Images
Each subfolder = one team.
Files: logo.png (transparent), logo-dark.png, action.jpg, banner.jpg
Source priority: ESPN CDN > Team website > League media`,
  neighborhoods: `# Neighborhood Images
Each subfolder = one Omaha neighborhood/district.
Files: hero.jpg, street.jpg, thumb.jpg, map.jpg
Source priority: Visit Omaha > City of Omaha > Wikimedia > Flickr CC`,
  landmarks: `# Landmark Images
Each subfolder = one landmark/park/museum.
Files: hero.jpg, thumb.jpg, interior.jpg (if applicable)
Source priority: Official website > Visit Omaha > Wikimedia Commons`,
  categories: `# Category Hero Images
One folder per event category.
Files: hero.jpg (1200x600), thumb.jpg (400x300), banner.jpg (1200x200)
Use real Omaha venue/event photos, not stock.`,
  hero: `# Site Hero Images
Top-level hero/banner images for the site.
Files: skyline.jpg, skyline-night.jpg, downtown.jpg, omaha-aerial.jpg`,
};

for (const [folder, content] of Object.entries(readmes)) {
  fs.writeFileSync(path.join(base, folder, 'README.md'), content);
}

// Create master image manifest
const manifest = {
  generated: new Date().toISOString(),
  totalFolders: count,
  structure: {},
};
for (const [group, folders] of Object.entries(structure)) {
  manifest.structure[group] = {
    count: folders.length || 1,
    folders: folders,
  };
}
fs.writeFileSync(path.join(base, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log(`Created ${count} folders under public/images/content/`);
console.log(`Groups: ${Object.keys(structure).join(', ')}`);
console.log(`Artists: ${structure.artists.length}`);
console.log(`Venues: ${structure.venues.length}`);
console.log(`Teams: ${structure.teams.length}`);
console.log(`Neighborhoods: ${structure.neighborhoods.length}`);
console.log(`Landmarks: ${structure.landmarks.length}`);
