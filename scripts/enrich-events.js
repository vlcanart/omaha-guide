const fs = require('fs');
const path = require('path');
const data = require('../app/events-data.js');
const events = data.INGESTED_EVENTS || data.events || data;

const start = new Date('2026-03-23');
const end = new Date('2026-04-22');
const filtered = events.filter(e => new Date(e.date) >= start && new Date(e.date) <= end);
filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

// ── Subcategory / Genre Mapping ──────────────────────────────────────
const subcatMap = {
  'YOUNG DUBLINERS': 'Celtic Rock',
  'The Happy Fits': 'Indie Pop',
  'OMAR AHMAD': 'Jazz',
  'HOT WHEELS SUITE': 'Jazz',
  'Clarence Tilton': 'Indie Folk',
  'BINGO LOCO': 'Dance Party',
  'bbno$': 'Hip-Hop / Pop',
  'runo plum': 'Indie',
  'Clarion': 'Indie',
  'Devil in the Details': 'Indie Rock',
  'THE DROPTINES': 'Country / Americana',
  'EL KHAT': 'World / Experimental',
  'Fuel (USA)': 'Alternative Rock',
  'Fuel': 'Alternative Rock',
  'Brandon Lake': 'Christian / Worship',
  'GOOD NEIGHBOURS': 'Pop',
  'Hip Hop Lab': 'Hip-Hop',
  'INSANE CLOWN POSSE': 'Hip-Hop / Horrorcore',
  'Dance With The Dead': 'Synthwave / Metal',
  'Magic Sword': 'Synthwave',
  'Stomach Book': 'Experimental',
  'RILEY MULHERKAR': 'Jazz / Trumpet',
  'Ned LeDoux': 'Country',
  'William Basinski': 'Ambient / Experimental',
  'Max McNown': 'Country',
  'Hank Azaria': 'Comedy Rock',
  'Lorna Shore': 'Deathcore / Metal',
  'Thursday w/': 'Post-Hardcore',
  'Stephen Wilson Jr': 'Country / Americana',
  'PAUL GILBERT': 'Rock / Guitar Virtuoso',
  'TIFFANY': 'Pop / 80s',
  'LOVB VOLLEYBALL': 'Volleyball',
  // ARTS
  'Six (Touring)': 'Musical',
  'SIX': 'Musical',
  'Tristan und Isolde': 'Opera (Film)',
  'Disaster!': 'Musical',
  'Hoff Fourth Friday': 'Visual Art',
  'OPEN HOUSE': 'Visual Art',
  'VOLUMES PERFORMANCE': 'Visual Art / Performance',
  'Clara Schumann': 'Classical Music',
  'Seussical': 'Musical (Youth)',
  'KAMBUI OLUJIMI': 'Visual Art / Talk',
  'Pat Metheny': 'Jazz Guitar',
  'Miles Davis': 'Jazz / Lecture',
  'Vanessa Collier': 'Blues / Saxophone',
  'Double Feature': 'Film / Talk',
  'Breakdancing': 'Dance / Workshop',
  'Broadway Audition': 'Theater / Workshop',
  "Let's Groove Tonight": 'Dance / Performance',
  'Unlimited Miles': 'Jazz / Dance',
  'Dr. Seuss': 'Theater (Youth)',
  'Bit Brigade': 'Video Game Rock',
  'CURATOR-LED TOUR': 'Visual Art / Tour',
  'Midsummer Night': 'Ballet / Dance',
  'American Midwest Ballet': 'Ballet / Dance',
  'Dial': 'Theater / Mystery',
  'Infinite Belonging': 'Dance / Performance',
  'Jo Koy': 'Stand-up Comedy',
  'Mozart': 'Classical Music',
  'Psychology of Serial Killers': 'Lecture / True Crime',
  // COMEDY
  'Whitney Cummings': 'Stand-up Comedy',
  'GenX Takeover': 'Stand-up Comedy',
  // FAMILY
  'Pickle Party': 'Community Event',
  'Choreography Workshop': 'Dance / Workshop',
  'Broadway Camp': 'Theater / Workshop',
  'Accessible Theater': 'Theater / Workshop',
  'Spring Fling': 'Market',
  'Party for the Planet': 'Conservation / Family',
  'Mini Masquerade': 'Dance / Family',
  // FESTIVALS
  'Tattoo Arts': 'Tattoo Convention',
  'Springfest': 'Community Festival',
  'Pre-Show Happy Hour': 'Social / Happy Hour',
};

// ── Venue Info ──────────────────────────────────────────────────────
const venueInfo = {
  'Charles Schwab Field': { address: '1200 Mike Fahey St, Omaha, NE 68102', age: 'All Ages' },
  'Barnato': { address: '1209 Harney St, Omaha, NE 68102', age: '21+' },
  'Connie Claussen Field': { address: '6705 Dodge St, Omaha, NE 68182', age: 'All Ages' },
  'Orpheum Theater - Omaha': { address: '409 S 16th St, Omaha, NE 68102', age: 'All Ages' },
  'Orpheum Theater': { address: '409 S 16th St, Omaha, NE 68102', age: 'All Ages' },
  'Film Streams': { address: '1340 Mike Fahey St, Omaha, NE 68102', age: 'All Ages' },
  'Liberty First Credit Union Arena': { address: '7300 Q St, Ralston, NE 68127', age: 'All Ages' },
  'The Slowdown': { address: '729 N 14th St, Omaha, NE 68102', age: '18+ (varies)' },
  'Bemis Center': { address: '724 S 12th St, Omaha, NE 68102', age: 'All Ages' },
  'Omaha Community Playhouse': { address: '6915 Cass St, Omaha, NE 68132', age: 'All Ages' },
  'CHI Health Center': { address: '455 N 10th St, Omaha, NE 68102', age: 'All Ages' },
  'Baxter Arena': { address: '2425 S 67th St, Omaha, NE 68106', age: 'All Ages' },
  'The Astro': { address: '8701 Starboard Dr, La Vista, NE 68128', age: 'Varies' },
  'Mid-America Center': { address: '1 Arena Way, Council Bluffs, IA 51501', age: 'All Ages' },
  'Hoff Family Arts & Culture Center': { address: '1001 S 6th St, Council Bluffs, IA 51501', age: 'All Ages' },
  'The Admiral': { address: '1007 Howard St, Omaha, NE 68102', age: '21+' },
  'Holland Center': { address: '1200 Douglas St, Omaha, NE 68102', age: 'All Ages' },
  'Werner Park': { address: '12356 Ballpark Way, Papillion, NE 68046', age: 'All Ages' },
  'Steelhouse Omaha': { address: '1228 Harney St, Omaha, NE 68102', age: '18+' },
  'Whiskey Roadhouse-Horseshoe Council Bluffs Casino': { address: '2701 23rd Ave, Council Bluffs, IA 51501', age: '21+' },
  'North Omaha Music and Arts': { address: '4820 N 24th St, Omaha, NE 68110', age: 'All Ages' },
  'Holland Music Club': { address: '1209 Harney St, Omaha, NE 68102', age: '21+' },
  'Culxr House': { address: '3017 N 24th St, Omaha, NE 68110', age: 'All Ages' },
  'Tal Anderson Field': { address: '6705 Dodge St, Omaha, NE 68182', age: 'All Ages' },
  'Creighton Softball Stadium': { address: '702 N 17th St, Omaha, NE 68102', age: 'All Ages' },
  'Ryan Center/DJ Sokol Arena': { address: '2500 California Plaza, Omaha, NE 68178', age: 'All Ages' },
  'Henry Doorly Zoo': { address: '3701 S 10th St, Omaha, NE 68107', age: 'All Ages' },
  'Witherspoon Theater': { address: '3215 California St, Omaha, NE 68131', age: 'All Ages' },
  'The Blackstone District': { address: '36th & Farnam, Omaha, NE 68131', age: 'All Ages' },
  'Participating Midtown Crossing Establishments': { address: '3201 Farnam St, Omaha, NE 68131', age: 'All Ages' },
  "Tom Hanafan River's Edge Park": { address: '101 Avenue A, Council Bluffs, IA 51501', age: 'All Ages' },
  'Ticket Omaha': { address: 'Online', age: 'Varies' },
  'Tenaska Center': { address: '2500 California Plaza, Omaha, NE 68178', age: 'All Ages' },
  'Tenaska Ctr-Hamann Family Hall': { address: '2500 California Plaza, Omaha, NE 68178', age: 'All Ages' },
  'Tenaska Ctr - Rehearsal Hall C': { address: '2500 California Plaza, Omaha, NE 68178', age: 'All Ages' },
  'Tenaska Ctr - Schott Classroom': { address: '2500 California Plaza, Omaha, NE 68178', age: 'All Ages' },
};

// Apply subcategories and venue info
for (const e of filtered) {
  // Subcategory
  e.subcategory = '';
  for (const [key, val] of Object.entries(subcatMap)) {
    if (e.title.includes(key)) {
      e.subcategory = val;
      break;
    }
  }
  // Sports fallback
  if (e.cat === 'sports' && !e.subcategory) {
    if (e.title.match(/Baseball|Bluejays/i)) e.subcategory = 'Baseball';
    else if (e.title.match(/Softball/i)) e.subcategory = 'Softball';
    else if (e.title.match(/Lancers/i)) e.subcategory = 'Hockey';
    else if (e.title.match(/Soccer|Kings/i)) e.subcategory = 'Indoor Soccer';
    else if (e.title.match(/Storm/i)) e.subcategory = 'Baseball (MiLB)';
    else if (e.title.match(/Supernovas/i)) e.subcategory = 'Volleyball (Pro)';
    else if (e.title.match(/Volleyball/i)) e.subcategory = 'Volleyball';
    else if (e.title.match(/Duals|Wrestling/i)) e.subcategory = 'Wrestling';
    else e.subcategory = 'Sports';
  }
  // Concerts miscategorized as sports
  if (e.cat === 'concerts' && e.title.match(/\bvs\.?\s/i)) {
    if (e.title.match(/Baseball/i)) e.subcategory = 'Baseball';
    else if (e.title.match(/Softball/i)) e.subcategory = 'Softball';
    else if (e.title.match(/Volleyball/i)) e.subcategory = 'Volleyball';
  }

  // Venue info
  const vi = venueInfo[e.venue];
  e.venueAddress = vi ? vi.address : '';
  e.ageRestriction = vi ? vi.age : '';

  // Initialize YouTube fields
  e.song1 = '';
  e.song2 = '';
  e.song3 = '';
  e.bestVideo = '';
  e.spotifyUrl = '';
  e.artistBio = '';
}

// Count
const assigned = filtered.filter(e => e.subcategory).length;
console.log(`Subcategories assigned: ${assigned}/${filtered.length}`);
console.log(`Venue addresses: ${filtered.filter(e => e.venueAddress).length}/${filtered.length}`);

// Extract unique searchable artists
const searchable = [];
const seen = new Set();
for (const e of filtered) {
  let artist = '';
  const title = e.title;

  if (e.cat === 'concerts') {
    if (title.match(/\bvs\.?\s/i)) continue; // skip sports
    if (title.includes('LOVB')) continue;
    if (title.includes('BINGO LOCO')) continue;
    artist = title
      .replace(/\s*[-–|].*(Tour|Ticket|Hotel|Block Party).*$/i, '')
      .replace(/\s*[-–|]\s*The\s.*$/i, '')
      .replace(/\s*\|.*$/, '')
      .replace(/\s*w\/.*$/, '')
      .trim();
  } else if (e.cat === 'comedy') {
    artist = title.replace(/\s*[-–:|].*$/, '').trim();
  } else if (e.cat === 'arts') {
    // Known musical/performance artists in arts
    const knownArtists = ['Pat Metheny', 'Vanessa Collier', 'Jo Koy', 'Bit Brigade'];
    for (const ka of knownArtists) {
      if (title.includes(ka)) { artist = ka; break; }
    }
  }

  if (artist && artist.length > 2 && !seen.has(artist)) {
    seen.add(artist);
    searchable.push({ artist, cat: e.cat, subcategory: e.subcategory || '' });
  }
}

console.log(`\nSearchable artists (${searchable.length}):`);
for (const s of searchable) {
  console.log(`  [${s.cat}] ${s.artist} (${s.subcategory})`);
}

// Save
fs.writeFileSync('omaha_events_enriched.json', JSON.stringify(filtered, null, 2), 'utf8');
fs.writeFileSync('omaha_artists_to_search.json', JSON.stringify(searchable, null, 2), 'utf8');
console.log('\nSaved omaha_events_enriched.json and omaha_artists_to_search.json');
