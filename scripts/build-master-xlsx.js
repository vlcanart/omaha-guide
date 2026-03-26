// build-master-xlsx.js — Writes enriched JSON for Python to build XLSX
const fs = require('fs');
const data = require('../app/events-data.js');
const events = data.INGESTED_EVENTS || data.events || data;

const start = new Date('2026-03-23');
const end = new Date('2026-04-22');
const filtered = events.filter(e => new Date(e.date) >= start && new Date(e.date) <= end);
filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

// ═══════════════════════════════════════════════════════════════
// ARTIST ENRICHMENT DATABASE
// ═══════════════════════════════════════════════════════════════
const artistDB = {
  'YOUNG DUBLINERS': {
    subcategory: 'Celtic Rock',
    bio: 'Irish-American rock band formed in Santa Monica in 1988, blending original rock with Irish folk songs.',
    song1: 'https://www.youtube.com/results?search_query=Young+Dubliners+Foggy+Dew',
    song2: 'https://www.youtube.com/results?search_query=Young+Dubliners+Rocky+Road+to+Dublin',
    song3: 'https://www.youtube.com/results?search_query=Young+Dubliners+Breathe',
    bestVideo: 'https://www.youtube.com/results?search_query=Young+Dubliners+live+concert',
    spotify: 'https://open.spotify.com/artist/0dEvJpkqhrcn64d3kYSJqx',
  },
  'The Happy Fits': {
    subcategory: 'Indie Pop',
    bio: 'Indie rock trio from New Jersey featuring cello-driven pop, formed in 2016.',
    song1: 'https://www.youtube.com/results?search_query=The+Happy+Fits+Dirty+Imbecile+official',
    song2: 'https://www.youtube.com/results?search_query=The+Happy+Fits+So+Alright+Cool+Whatever',
    song3: 'https://www.youtube.com/results?search_query=The+Happy+Fits+Hold+Me+Down',
    bestVideo: 'https://www.youtube.com/results?search_query=The+Happy+Fits+She+Wants+Me+music+video',
    spotify: 'https://open.spotify.com/artist/73rPcaYEhBd0UuVZBqqyQJ',
  },
  'OMAR AHMAD': {
    subcategory: 'Jazz',
    bio: 'Jazz artist performing at Bemis Center\'s LIVE @ LOW END series in Omaha.',
    song1: '', song2: '', song3: '',
    bestVideo: 'https://www.youtube.com/results?search_query=Omar+Ahmad+jazz+performance',
    spotify: '',
  },
  'HOT WHEELS SUITE': {
    subcategory: 'Jazz',
    bio: 'Jazz ensemble performing at Bemis Center\'s LIVE @ LOW END series.',
    song1: '', song2: '', song3: '',
    bestVideo: '',
    spotify: '',
  },
  'Clarence Tilton': {
    subcategory: 'Americana / Alt-Country',
    bio: 'Omaha-based Americana band formed in 2014, blending country rock with Heartland storytelling. Collaborated with Marty Stuart.',
    song1: 'https://www.youtube.com/results?search_query=Clarence+Tilton+band+music',
    song2: 'https://www.youtube.com/results?search_query=Clarence+Tilton+Queen+of+the+Brawl',
    song3: 'https://www.youtube.com/results?search_query=Clarence+Tilton+Freds+Colt+Marty+Stuart',
    bestVideo: 'https://www.youtube.com/results?search_query=Clarence+Tilton+band+live',
    spotify: 'https://open.spotify.com/artist/0O2UiRmMnoDWFfRcBlHIgv',
  },
  'BINGO LOCO': {
    subcategory: 'Dance Party / Entertainment',
    bio: 'Immersive bingo rave experience combining live music, comedy, dance-offs and confetti cannons. Born in Dublin.',
    song1: '', song2: '', song3: '',
    bestVideo: 'https://www.youtube.com/results?search_query=Bingo+Loco+experience+highlight',
    spotify: '',
  },
  'bbno$': {
    subcategory: 'Hip-Hop / Pop',
    bio: 'Canadian rapper and singer known for viral hits and playful delivery. "Lalala" hit 1B+ streams worldwide.',
    song1: 'https://www.youtube.com/results?search_query=bbno$+Y2K+Lalala+official+music+video',
    song2: 'https://www.youtube.com/results?search_query=bbno$+Rich+Brian+Edamame+official+video',
    song3: 'https://www.youtube.com/results?search_query=bbno$+Yung+Gravy+Whip+A+Tesla',
    bestVideo: 'https://www.youtube.com/results?search_query=bbno$+Lalala+official+music+video',
    spotify: 'https://open.spotify.com/artist/41X1TR6hrK8Q2ZCpp2EqCz',
  },
  'runo plum': {
    subcategory: 'Indie',
    bio: 'Indie artist performing at The Slowdown in Omaha.',
    song1: '', song2: '', song3: '',
    bestVideo: 'https://www.youtube.com/results?search_query=runo+plum+music',
    spotify: '',
  },
  'Clarion': {
    subcategory: 'Indie',
    bio: 'Indie band performing at The Admiral in Omaha.',
    song1: '', song2: '', song3: '',
    bestVideo: '',
    spotify: '',
  },
  'Devil in the Details': {
    subcategory: 'Indie Rock',
    bio: 'Indie rock act performing at The Admiral in Omaha.',
    song1: '', song2: '', song3: '',
    bestVideo: '',
    spotify: '',
  },
  'TIFFANY': {
    subcategory: 'Pop / 80s',
    bio: '80s pop icon known for mall tour fame. "I Think We\'re Alone Now" spent two weeks at #1 on Billboard Hot 100.',
    song1: 'https://www.youtube.com/results?search_query=Tiffany+I+Think+Were+Alone+Now+official+video',
    song2: 'https://www.youtube.com/results?search_query=Tiffany+Could+Have+Been+official+video',
    song3: 'https://www.youtube.com/results?search_query=Tiffany+All+This+Time+2026',
    bestVideo: 'https://www.youtube.com/results?search_query=Tiffany+I+Think+Were+Alone+Now+official+music+video+1987',
    spotify: 'https://open.spotify.com/artist/0fA0jqZBwBm4rRDOSMsMzQ',
  },
  'THE DROPTINES': {
    subcategory: 'Country / Americana',
    bio: 'Country/Americana act performing at The Admiral in Omaha.',
    song1: 'https://www.youtube.com/results?search_query=The+Droptines+band+music',
    song2: '', song3: '',
    bestVideo: 'https://www.youtube.com/results?search_query=The+Droptines+live',
    spotify: '',
  },
  'EL KHAT': {
    subcategory: 'World / Experimental',
    bio: 'Yemenite-Israeli band blending Middle Eastern folk with DIY instruments and experimental sounds.',
    song1: 'https://www.youtube.com/results?search_query=El+Khat+band+music+video',
    song2: 'https://www.youtube.com/results?search_query=El+Khat+Saadia+Jefferson',
    song3: '',
    bestVideo: 'https://www.youtube.com/results?search_query=El+Khat+live+performance',
    spotify: 'https://open.spotify.com/artist/5s3MHjWeKhYEQyFkaAuLaR',
  },
  'Fuel': {
    subcategory: 'Alternative Rock',
    bio: 'American post-grunge band. "Hemorrhage" was #1 for 12 weeks on Modern Rock. "Shimmer" peaked at #2.',
    song1: 'https://www.youtube.com/results?search_query=Fuel+Hemorrhage+In+My+Hands+official+video',
    song2: 'https://www.youtube.com/results?search_query=Fuel+Shimmer+official+music+video',
    song3: 'https://www.youtube.com/results?search_query=Fuel+Bad+Day+official+video',
    bestVideo: 'https://www.youtube.com/results?search_query=Fuel+Hemorrhage+In+My+Hands+official+music+video+HD',
    spotify: 'https://open.spotify.com/artist/687cZJR45JO7bkoog48aUg',
  },
  'Brandon Lake': {
    subcategory: 'Christian / Worship',
    bio: 'Worship leader with Bethel Music. "Gratitude" hit #1 on Hot Christian Songs. ASCAP Songwriter of the Year.',
    song1: 'https://www.youtube.com/results?search_query=Brandon+Lake+Gratitude+official+video',
    song2: 'https://www.youtube.com/results?search_query=Brandon+Lake+Hard+Fought+Hallelujah+Jelly+Roll',
    song3: 'https://www.youtube.com/results?search_query=Brandon+Lake+Praise+official+video',
    bestVideo: 'https://www.youtube.com/results?search_query=Brandon+Lake+Gratitude+music+video',
    spotify: 'https://open.spotify.com/artist/5p3BFMGFBsXoKBz1JMbUtj',
  },
  'GOOD NEIGHBOURS': {
    subcategory: 'Pop',
    bio: 'British pop duo whose debut "Home" became the most-streamed debut single globally by a new artist in 2024. Certified Platinum.',
    song1: 'https://www.youtube.com/results?search_query=Good+Neighbours+Home+official+video',
    song2: 'https://www.youtube.com/results?search_query=Good+Neighbours+Daisies+official+video',
    song3: 'https://www.youtube.com/results?search_query=Good+Neighbours+Ripple+official',
    bestVideo: 'https://www.youtube.com/results?search_query=Good+Neighbours+Home+official+music+video',
    spotify: 'https://open.spotify.com/artist/52N3KGrTWDRhdQJrgBTofE',
  },
  'INSANE CLOWN POSSE': {
    subcategory: 'Hip-Hop / Horrorcore',
    bio: 'Detroit hip-hop duo known for face paint, Faygo showers, and the devoted Juggalo fanbase since 1989.',
    song1: 'https://www.youtube.com/results?search_query=Insane+Clown+Posse+Hokus+Pokus+official',
    song2: 'https://www.youtube.com/results?search_query=Insane+Clown+Posse+Halls+of+Illusions+video',
    song3: 'https://www.youtube.com/results?search_query=Insane+Clown+Posse+Boogie+Woogie+Wu',
    bestVideo: 'https://www.youtube.com/results?search_query=Insane+Clown+Posse+Miracles+official+video',
    spotify: 'https://open.spotify.com/artist/4xtWjIlVuZwTCeqVAsgEXy',
  },
  'Dance With The Dead': {
    subcategory: 'Synthwave / Metal',
    bio: 'California synthwave/metal duo blending horror-inspired synths with heavy guitars. Formed 2013.',
    song1: 'https://www.youtube.com/results?search_query=Dance+With+The+Dead+Robeast',
    song2: 'https://www.youtube.com/results?search_query=Dance+With+The+Dead+Andromeda',
    song3: 'https://www.youtube.com/results?search_query=Dance+With+The+Dead+Blind',
    bestVideo: 'https://www.youtube.com/results?search_query=Dance+With+The+Dead+Whispers+End+Kat+Von+D+video',
    spotify: 'https://open.spotify.com/artist/0HLcxSKJabFeqPH79o56jN',
  },
  'Stomach Book': {
    subcategory: 'Experimental',
    bio: 'Experimental music act performing at The Slowdown in Omaha.',
    song1: '', song2: '', song3: '',
    bestVideo: '',
    spotify: '',
  },
  'RILEY MULHERKAR': {
    subcategory: 'Jazz / Trumpet',
    bio: 'Juilliard-trained trumpeter, Lincoln Center Emerging Artist Award recipient. Leader of The Westerlies brass quartet.',
    song1: 'https://www.youtube.com/results?search_query=Riley+Mulherkar+trumpet+jazz',
    song2: 'https://www.youtube.com/results?search_query=The+Westerlies+brass+quartet',
    song3: '',
    bestVideo: 'https://www.youtube.com/results?search_query=Riley+Mulherkar+trumpet+performance',
    spotify: 'https://open.spotify.com/artist/6Xsz36MkORJCBaGpgv5RiG',
  },
  'Ned LeDoux': {
    subcategory: 'Country',
    bio: 'Wyoming country singer carrying on his father Chris LeDoux\'s legacy. "Forever a Cowboy" is a fan favorite.',
    song1: 'https://www.youtube.com/results?search_query=Ned+LeDoux+Forever+A+Cowboy+official',
    song2: 'https://www.youtube.com/results?search_query=Ned+LeDoux+A+Lot+More+Free',
    song3: 'https://www.youtube.com/results?search_query=Ned+LeDoux+This+Cowboys+Hat',
    bestVideo: 'https://www.youtube.com/results?search_query=Ned+LeDoux+Forever+A+Cowboy+music+video',
    spotify: 'https://open.spotify.com/artist/5oaIvILfMnmI2gG9bDyqka',
  },
  'William Basinski': {
    subcategory: 'Ambient / Experimental',
    bio: 'Ambient composer known for "The Disintegration Loops," named 3rd best ambient record of all time by Pitchfork.',
    song1: 'https://www.youtube.com/results?search_query=William+Basinski+Disintegration+Loops+dlp+1.1',
    song2: 'https://www.youtube.com/results?search_query=William+Basinski+Watermusic',
    song3: 'https://www.youtube.com/results?search_query=William+Basinski+Lamentations',
    bestVideo: 'https://www.youtube.com/results?search_query=William+Basinski+Disintegration+Loops+full',
    spotify: 'https://open.spotify.com/artist/4MKfIxBRh56fMqVMjT5UNQ',
  },
  'Max McNown': {
    subcategory: 'Country',
    bio: 'Nashville-based singer-songwriter. Gold-certified "Better Me For You (Brown Eyes)" hit #1 on iTunes Country.',
    song1: 'https://www.youtube.com/results?search_query=Max+McNown+A+Lot+More+Free+official+video',
    song2: 'https://www.youtube.com/results?search_query=Max+McNown+Better+Me+For+You+Brown+Eyes',
    song3: 'https://www.youtube.com/results?search_query=Max+McNown+Turned+Into+Missing+You',
    bestVideo: 'https://www.youtube.com/results?search_query=Max+McNown+A+Lot+More+Free+music+video',
    spotify: 'https://open.spotify.com/artist/340PS4ZcZ4UCBgyrXzEjcp',
  },
  'Hank Azaria': {
    subcategory: 'Comedy Rock / Bruce Springsteen Tribute',
    bio: 'Emmy-winning actor performs as Bruce Springsteen in this loving tribute show. Six months of vocal training for the role.',
    song1: 'https://www.youtube.com/results?search_query=Hank+Azaria+EZ+Street+Band+Springsteen',
    song2: 'https://www.youtube.com/results?search_query=Bruce+Springsteen+Born+to+Run+official',
    song3: 'https://www.youtube.com/results?search_query=Bruce+Springsteen+Thunder+Road',
    bestVideo: 'https://www.youtube.com/results?search_query=Hank+Azaria+EZ+Street+Band+live+performance',
    spotify: '',
  },
  'Lorna Shore': {
    subcategory: 'Deathcore / Metal',
    bio: 'New Jersey symphonic deathcore band. "To the Hellfire" went viral with 18M+ YouTube views. Voted Best Song of 2021.',
    song1: 'https://www.youtube.com/results?search_query=Lorna+Shore+To+The+Hellfire+official+video',
    song2: 'https://www.youtube.com/results?search_query=Lorna+Shore+Sun+Eater+official+video',
    song3: 'https://www.youtube.com/results?search_query=Lorna+Shore+Pain+Remains+official+video',
    bestVideo: 'https://www.youtube.com/results?search_query=Lorna+Shore+To+The+Hellfire+official+music+video',
    spotify: 'https://open.spotify.com/artist/7sQxDqSFREHdSMSmybk2mD',
  },
  'Thursday': {
    subcategory: 'Post-Hardcore',
    bio: 'Pioneering post-hardcore band. "Full Collapse" (2001) helped define the genre. Known for "Understanding in a Car Crash."',
    song1: 'https://www.youtube.com/results?search_query=Thursday+Understanding+in+a+Car+Crash+official',
    song2: 'https://www.youtube.com/results?search_query=Thursday+Cross+Out+The+Eyes+official+video',
    song3: 'https://www.youtube.com/results?search_query=Thursday+Signals+Over+The+Air',
    bestVideo: 'https://www.youtube.com/results?search_query=Thursday+Understanding+in+a+Car+Crash+music+video',
    spotify: 'https://open.spotify.com/artist/61awhbNK16ku1uQyXRsQj5',
  },
  'Stephen Wilson Jr': {
    subcategory: 'Country / Americana',
    bio: 'Indiana-born artist blending Americana with grunge and indie rock. 2023 CMA New Artist of the Year nominee.',
    song1: 'https://www.youtube.com/results?search_query=Stephen+Wilson+Jr+Stand+By+Me+official',
    song2: 'https://www.youtube.com/results?search_query=Stephen+Wilson+Jr+Gary+official+video',
    song3: 'https://www.youtube.com/results?search_query=Stephen+Wilson+Jr+Father+Son+official',
    bestVideo: 'https://www.youtube.com/results?search_query=Stephen+Wilson+Jr+Stand+By+Me+music+video',
    spotify: 'https://open.spotify.com/artist/4DSDa4HvAWqvb3dMHUOAfd',
  },
  'PAUL GILBERT': {
    subcategory: 'Rock / Guitar Virtuoso',
    bio: 'Co-founder of Mr. Big, one of the world\'s fastest guitarists. Known for "Technical Difficulties" and Mr. Big\'s "To Be With You."',
    song1: 'https://www.youtube.com/results?search_query=Paul+Gilbert+Technical+Difficulties+guitar',
    song2: 'https://www.youtube.com/results?search_query=Mr+Big+To+Be+With+You+official+video',
    song3: 'https://www.youtube.com/results?search_query=Paul+Gilbert+Scarified+Racer+X',
    bestVideo: 'https://www.youtube.com/results?search_query=Paul+Gilbert+guitar+clinic+live',
    spotify: 'https://open.spotify.com/artist/19sJfp2FK2evlsw46WVhPG',
  },
  // COMEDY
  'Whitney Cummings': {
    subcategory: 'Stand-up Comedy',
    bio: 'Comedian, actress, and writer. Latest special "Mouthy" streams on YouTube. Creator of NBC\'s "Whitney."',
    song1: 'https://www.youtube.com/results?search_query=Whitney+Cummings+Mouthy+standup+special',
    song2: 'https://www.youtube.com/results?search_query=Whitney+Cummings+Netflix+Can+I+Touch+It',
    song3: 'https://www.youtube.com/results?search_query=Whitney+Cummings+standup+best+bits',
    bestVideo: 'https://www.youtube.com/results?search_query=Whitney+Cummings+Mouthy+full+special+YouTube',
    spotify: '',
  },
  'GenX Takeover': {
    subcategory: 'Stand-up Comedy',
    bio: 'Comedy tour featuring Gen X comedians with nostalgic humor.',
    song1: '', song2: '', song3: '',
    bestVideo: 'https://www.youtube.com/results?search_query=GenX+Takeover+Comedy+Tour',
    spotify: '',
  },
  // ARTS PERFORMERS
  'Pat Metheny': {
    subcategory: 'Jazz Guitar',
    bio: '20-time Grammy winner, the only artist to win in 10 categories. Jazz guitar legend since the 1970s.',
    song1: 'https://www.youtube.com/results?search_query=Pat+Metheny+Phase+Dance+official',
    song2: 'https://www.youtube.com/results?search_query=Pat+Metheny+Last+Train+Home',
    song3: 'https://www.youtube.com/results?search_query=Pat+Metheny+First+Circle',
    bestVideo: 'https://www.youtube.com/results?search_query=Pat+Metheny+Group+live+concert',
    spotify: 'https://open.spotify.com/artist/2UJqCVJuBfOagb4kNNjWqw',
  },
  'Vanessa Collier': {
    subcategory: 'Blues / Saxophone',
    bio: 'Berklee-trained blues saxophonist and singer. 3x Blues Music Award winner for Horn Player of the Year.',
    song1: 'https://www.youtube.com/results?search_query=Vanessa+Collier+blues+saxophone+performance',
    song2: 'https://www.youtube.com/results?search_query=Vanessa+Collier+Heart+Soul+Saxophone',
    song3: 'https://www.youtube.com/results?search_query=Vanessa+Collier+live+blues',
    bestVideo: 'https://www.youtube.com/results?search_query=Vanessa+Collier+live+saxophone+blues',
    spotify: 'https://open.spotify.com/artist/3AKBgmzXDcMJoL2F2WaQY7',
  },
  'Jo Koy': {
    subcategory: 'Stand-up Comedy',
    bio: 'Filipino-American comedian with multiple Netflix specials. 2018 Stand-Up Comedian of the Year at Just for Laughs.',
    song1: 'https://www.youtube.com/results?search_query=Jo+Koy+Netflix+standup+best+moments',
    song2: 'https://www.youtube.com/results?search_query=Jo+Koy+Comin+In+Hot+standup',
    song3: 'https://www.youtube.com/results?search_query=Jo+Koy+Filipino+jokes+standup',
    bestVideo: 'https://www.youtube.com/results?search_query=Jo+Koy+Netflix+standup+special+best',
    spotify: '',
  },
  'Bit Brigade': {
    subcategory: 'Video Game Rock',
    bio: 'Rock band that performs NES game soundtracks live while a speedrunner beats the game on stage. Founded 2004.',
    song1: 'https://www.youtube.com/results?search_query=Bit+Brigade+Mega+Man+2+live+MAGFest',
    song2: 'https://www.youtube.com/results?search_query=Bit+Brigade+Mega+Man+X+live',
    song3: '',
    bestVideo: 'https://www.youtube.com/results?search_query=Bit+Brigade+Mega+Man+2+MAGFest+live+speedrun',
    spotify: 'https://open.spotify.com/artist/1v5v5OoSBQVVmGFjwJkpGu',
  },
  'Hip Hop Lab': {
    subcategory: 'Hip-Hop',
    bio: 'Block party event celebrating hip-hop culture with local and regional artists.',
    song1: '', song2: '', song3: '',
    bestVideo: '',
    spotify: '',
  },
};

// ═══════════════════════════════════════════════════════════════
// SUBCATEGORY MAPPING (for non-artist events)
// ═══════════════════════════════════════════════════════════════
const subcatMap = {
  'LOVB VOLLEYBALL': 'Volleyball',
  'Six (Touring)': 'Musical', 'SIX': 'Musical',
  'Tristan und Isolde': 'Opera (Film)',
  'Disaster!': 'Musical',
  'Hoff Fourth Friday': 'Visual Art',
  'OPEN HOUSE': 'Visual Art',
  'VOLUMES PERFORMANCE': 'Visual Art / Performance',
  'Clara Schumann': 'Classical Music',
  'Seussical': 'Musical (Youth)',
  'KAMBUI OLUJIMI': 'Visual Art / Talk',
  'Miles Davis': 'Jazz / Lecture',
  'Double Feature': 'Film / Talk',
  'Breakdancing': 'Dance / Workshop',
  'Broadway Audition': 'Theater / Workshop',
  "Let's Groove Tonight": 'Dance / Performance',
  'Unlimited Miles': 'Jazz / Dance',
  'Dr. Seuss': 'Theater (Youth)',
  'CURATOR-LED TOUR': 'Visual Art / Tour',
  'Midsummer Night': 'Ballet / Dance',
  'American Midwest Ballet': 'Ballet / Dance',
  'Dial': 'Theater / Mystery',
  'Infinite Belonging': 'Dance / Performance',
  'Mozart': 'Classical Music',
  'Psychology of Serial Killers': 'Lecture / True Crime',
  'Pickle Party': 'Community Event',
  'Choreography Workshop': 'Dance / Workshop',
  'Broadway Camp': 'Theater / Workshop',
  'Accessible Theater': 'Theater / Workshop',
  'Spring Fling': 'Market',
  'Party for the Planet': 'Conservation / Family',
  'Mini Masquerade': 'Dance / Family',
  'Tattoo Arts': 'Tattoo Convention',
  'Springfest': 'Community Festival',
  'Pre-Show Happy Hour': 'Social / Happy Hour',
};

// ═══════════════════════════════════════════════════════════════
// VENUE DATABASE
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// APPLY ENRICHMENT
// ═══════════════════════════════════════════════════════════════
for (const e of filtered) {
  // Find matching artist
  let matched = null;
  for (const [key, data] of Object.entries(artistDB)) {
    if (e.title.includes(key)) {
      matched = data;
      break;
    }
  }

  if (matched) {
    e.subcategory = matched.subcategory;
    e.artistBio = matched.bio;
    e.song1 = matched.song1;
    e.song2 = matched.song2;
    e.song3 = matched.song3;
    e.bestVideo = matched.bestVideo;
    e.spotifyUrl = matched.spotify;
  } else {
    // Try subcatMap for non-artist events
    e.subcategory = '';
    for (const [key, val] of Object.entries(subcatMap)) {
      if (e.title.includes(key)) { e.subcategory = val; break; }
    }
    e.artistBio = '';
    e.song1 = ''; e.song2 = ''; e.song3 = '';
    e.bestVideo = ''; e.spotifyUrl = '';
  }

  // Sports fallback subcategory
  if (e.cat === 'sports' && !e.subcategory) {
    if (e.title.match(/Baseball|Bluejays/i)) e.subcategory = 'Baseball';
    else if (e.title.match(/Softball/i)) e.subcategory = 'Softball';
    else if (e.title.match(/Lancers/i)) e.subcategory = 'Hockey';
    else if (e.title.match(/Soccer|Kings/i)) e.subcategory = 'Indoor Soccer';
    else if (e.title.match(/Storm/i)) e.subcategory = 'Baseball (MiLB)';
    else if (e.title.match(/Supernovas/i)) e.subcategory = 'Volleyball (Pro)';
    else if (e.title.match(/Volleyball/i)) e.subcategory = 'Volleyball';
    else if (e.title.match(/Duals|Wrestling/i)) e.subcategory = 'Wrestling';
  }
  // Concerts that are really sports
  if (e.cat === 'concerts' && e.title.match(/\bvs\.?\s/i)) {
    if (e.title.match(/Baseball/i)) e.subcategory = 'Baseball';
    else if (e.title.match(/Softball/i)) e.subcategory = 'Softball';
    else if (e.title.match(/Volleyball/i)) e.subcategory = 'Volleyball';
    e.artistBio = ''; e.song1 = ''; e.song2 = ''; e.song3 = '';
    e.bestVideo = ''; e.spotifyUrl = '';
  }

  // Venue info
  const vi = venueInfo[e.venue];
  e.venueAddress = vi ? vi.address : '';
  e.ageRestriction = vi ? vi.age : '';
}

// Stats
const withSubcat = filtered.filter(e => e.subcategory).length;
const withBio = filtered.filter(e => e.artistBio).length;
const withSongs = filtered.filter(e => e.song1).length;
const withVideo = filtered.filter(e => e.bestVideo).length;
const withSpotify = filtered.filter(e => e.spotifyUrl).length;
const withAddr = filtered.filter(e => e.venueAddress).length;

console.log(`\n=== ENRICHMENT STATS ===`);
console.log(`Total events: ${filtered.length}`);
console.log(`Subcategories: ${withSubcat}/${filtered.length}`);
console.log(`Artist bios: ${withBio}/${filtered.length}`);
console.log(`Song URLs (at least 1): ${withSongs}/${filtered.length}`);
console.log(`Best video: ${withVideo}/${filtered.length}`);
console.log(`Spotify URLs: ${withSpotify}/${filtered.length}`);
console.log(`Venue addresses: ${withAddr}/${filtered.length}`);

fs.writeFileSync('omaha_master_enriched.json', JSON.stringify(filtered, null, 2), 'utf8');
console.log('\nSaved omaha_master_enriched.json');
