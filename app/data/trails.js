const t = (slug) => `/images/content/trails/${slug}/${slug}-1.jpg`;

export const TRAILS=[
  {id:"t1",name:"Keystone Trail",desc:"Omaha's backbone — 50+ miles of paved multi-use trail through the metro.",distance:"52 mi",difficulty:"Easy",surface:"Paved",lat:41.24,lng:-96.02,tags:["Cycling","Running"],img:t("keystone-trail"),elev:"Flat",icon:"bike"},
  {id:"t2",name:"Bob Kerrey Bridge Loop",desc:"Cross the Missouri River to Iowa and back. Best sunrise views in the city.",distance:"3.2 mi",difficulty:"Easy",surface:"Paved",lat:41.2575,lng:-95.9215,tags:["Walking","River"],img:t("bob-kerrey-bridge-trail"),elev:"Flat",icon:"walk"},
  {id:"t3",name:"Fontenelle Forest",desc:"2,000 acres of old-growth forest. Boardwalk canopy trail. Watch for bald eagles.",distance:"17 mi trails",difficulty:"Moderate",surface:"Dirt / Boardwalk",lat:41.157,lng:-95.9,tags:["Forest","Birding"],img:t("fontenelle-forest-trails"),elev:"+350 ft",url:"https://fontenelleforest.org",icon:"tree"},
  {id:"t4",name:"Wehrspann Lake Loop",desc:"8-mile loop at Chalco Hills. Packed gravel, gentle rolling hills, shaded sections.",distance:"8.1 mi",difficulty:"Easy\u2013Mod",surface:"Gravel",lat:41.18,lng:-96.13,tags:["Lake","Loop"],img:"/images/content/parks/chalco-hills/chalco-hills-1.jpg",elev:"+180 ft",icon:"trail"},
  {id:"t5",name:"Zorinsky Lake Trail",desc:"Popular West Omaha loop with prairie views, fishing pier, and waterbird habitat.",distance:"4.8 mi",difficulty:"Easy",surface:"Paved",lat:41.23,lng:-96.075,tags:["Lake","Family"],img:"/images/content/parks/zorinsky-lake/zorinsky-lake-1.jpg",elev:"Flat",icon:"walk"},
];

export const WALKS=[
  {
    id:"w1",neighborhood:"old-market",name:"Old Market Historic Walk",
    desc:"Cobblestone streets, 19th-century warehouses, galleries. Start at 10th & Howard.",
    longDesc:"Walk through Omaha's oldest commercial district where 1880s warehouses have been transformed into galleries, boutiques, restaurants, and live music venues. The cobblestone streets and iron-facade buildings make this the most photographed neighborhood in Nebraska. Start at 10th & Howard and wind south through the Passageway to Jackson Street.",
    time:"45 min",distance:"1.2 mi",difficulty:"Easy",lat:41.2555,lng:-95.932,
    startPoint:"10th & Howard St, Omaha, NE 68102",
    tags:["History","Architecture"],iconKey:"camera",
    img:"/images/content/neighborhoods/old-market/old-market-1.jpg",
    stops:[
      {name:"Old Market Passageway",desc:"Hidden alley of artist studios, galleries, and Garden of the Zodiac sculpture garden.",icon:"\uD83C\uDFA8",lat:41.2558,lng:-95.9325,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"Jackson Street Cobblestones",desc:"Original 1880s Belgian block cobblestones. Best-preserved historic streetscape in Omaha.",icon:"\uD83E\uDDF1",lat:41.2545,lng:-95.9330,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"Ted & Wally's Ice Cream",desc:"Homemade ice cream churned in-house since 1984. Try the cinnamon or Dutch chocolate.",icon:"\uD83C\uDF66",lat:41.2552,lng:-95.9318,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"Homer's Music",desc:"Omaha's legendary independent record store since 1974. Vinyl, CDs, and local music.",icon:"\uD83C\uDFB5",lat:41.2560,lng:-95.9335,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"The Durham Museum",desc:"Stunning 1931 Art Deco Union Station with vintage train cars and working soda fountain.",icon:"\uD83D\uDE82",lat:41.2553,lng:-95.9310,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
    ],
    highlights:["Original 1880s Belgian block cobblestone streets","Hidden Passageway with artist studios and galleries","James Beard-nominated restaurants","Live music at The Slowdown and Barnato nearby"],
    tips:[
      {icon:"\uD83D\uDCF8",title:"Best Photo Spots",text:"The Passageway alley, cobblestone intersections at 11th & Howard, and the iron facade buildings on Howard Street."},
      {icon:"\u2615",title:"Coffee First",text:"Start at Archetype Coffee (1419 Farnam) or Hardy Coffee Co. for fuel before the walk."},
      {icon:"\uD83C\uDF19",title:"Evening Magic",text:"The Old Market comes alive after dark with string lights, live music, and restaurant patios."},
    ],
  },
  {
    id:"w2",neighborhood:"benson",name:"Benson Mainstreet",
    desc:"Omaha's most eclectic neighborhood. Vintage shops, murals, record stores, dive bars.",
    longDesc:"Benson is Omaha's creative heartbeat \u2014 a walkable stretch of Maple Street packed with vintage shops, dive bars, record stores, and some of the city's best murals. Once a separate town annexed in 1917, it retains a fiercely independent spirit. First Friday art walks draw thousands, and the live music scene rivals neighborhoods ten times its size.",
    time:"1 hr",distance:"1.5 mi",difficulty:"Easy",lat:41.281,lng:-95.954,
    startPoint:"60th & Maple St, Omaha, NE 68104",
    tags:["Music","Vintage","Murals"],iconKey:"walk",
    img:"/images/content/neighborhoods/old-market/old-market-1.jpg",
    stops:[
      {name:"The Waiting Room",desc:"Legendary 400-cap indie venue. The heart of Omaha's alt/indie touring scene since 2007.",icon:"\uD83C\uDFB8",lat:41.2810,lng:-95.9540,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"Reverb Lounge",desc:"Sleek mid-century modern 150-cap listening room with outstanding sound quality.",icon:"\uD83C\uDFA4",lat:41.2808,lng:-95.9545,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"Almost Music",desc:"Beloved record store with deep vinyl selection, local releases, and knowledgeable staff.",icon:"\uD83D\uDCBF",lat:41.2812,lng:-95.9538,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"Benson Murals",desc:"Vibrant street art on nearly every block. New pieces appear regularly from local and touring artists.",icon:"\uD83C\uDFA8",lat:41.2815,lng:-95.9530,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"Beercade",desc:"Retro arcade bar with 40+ classic games, craft beer, and free play. A Benson institution.",icon:"\uD83C\uDFAE",lat:41.2808,lng:-95.9535,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
    ],
    highlights:["First Friday art walks draw thousands monthly","Two legendary live music venues within 100 yards","Omaha's densest concentration of murals and street art","Independent shops and restaurants with zero chains"],
    tips:[
      {icon:"\uD83C\uDF1F",title:"First Friday",text:"Visit the first Friday of any month for the Benson art walk \u2014 galleries open late, street performers, food trucks."},
      {icon:"\uD83C\uDF7A",title:"Bar Hopping",text:"Benson has 15+ bars in 4 blocks. Start at Jake's Cigars, hit Beercade, end at The Sydney."},
      {icon:"\uD83C\uDFB6",title:"Live Music",text:"Check The Waiting Room and Reverb Lounge calendars \u2014 most shows are $10-20 and world-class."},
    ],
  },
  {
    id:"w3",neighborhood:"blackstone",name:"Blackstone to Dundee",
    desc:"Cocktail district to tree-lined neighborhood restaurants. Hit Crescent Moon and Pitch.",
    longDesc:"Start in the revitalized Blackstone District \u2014 Omaha's cocktail and dining destination \u2014 and walk west through Dundee's tree-lined streets to some of the city's best neighborhood restaurants. This route connects two of Omaha's most walkable, vibrant neighborhoods with beautiful early-1900s architecture throughout.",
    time:"1.5 hr",distance:"2.1 mi",difficulty:"Easy",lat:41.259,lng:-95.965,
    startPoint:"3924 Farnam St (Blackstone District), Omaha, NE 68131",
    tags:["Dining","Cocktails","Architecture"],iconKey:"food",
    img:"/images/content/neighborhoods/old-market/old-market-1.jpg",
    stops:[
      {name:"Blackstone District",desc:"Omaha's cocktail district. James Beard nominees, craft cocktail bars, and rooftop patios.",icon:"\uD83C\uDF78",lat:41.2590,lng:-95.9650,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"Crescent Moon",desc:"Omaha's best beer bar with 60+ taps and the legendary Reuben sandwich.",icon:"\uD83C\uDF1D",lat:41.2592,lng:-95.9670,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"Dundee Memorial Park",desc:"Beautiful green space perfect for a mid-walk rest. Mature trees and walking paths.",icon:"\uD83C\uDF33",lat:41.2610,lng:-95.9750,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"Pitch Pizzeria",desc:"Coal-fired Neapolitan pizza in a converted Dundee gas station. James Beard semifinalist.",icon:"\uD83C\uDF55",lat:41.2620,lng:-95.9800,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"Dundee Merchants",desc:"Charming stretch of Underwood Ave with boutiques, coffee shops, and the beloved eCreamery.",icon:"\uD83D\uDED2",lat:41.2625,lng:-95.9810,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
    ],
    highlights:["Two James Beard-recognized dining districts","Early 1900s Craftsman and Tudor architecture","Omaha's best cocktail bars within walking distance","Tree-canopied residential streets between neighborhoods"],
    tips:[
      {icon:"\uD83C\uDF74",title:"Dinner Walk",text:"Do this walk at 5-6 PM \u2014 start with cocktails at Blackstone, end with dinner in Dundee."},
      {icon:"\uD83D\uDEB6",title:"Pace Yourself",text:"At 2.1 miles this is the longest walk. Dundee Memorial Park is a great halfway rest."},
      {icon:"\uD83C\uDFE0",title:"Architecture",text:"Look up \u2014 the residential blocks between Blackstone and Dundee have stunning Craftsman homes."},
    ],
  },
  {
    id:"w4",neighborhood:"north-omaha",name:"North Omaha Murals",
    desc:"Street art celebrating Black history, jazz legends, and community resilience.",
    longDesc:"Discover the vibrant public art of North Omaha's historic 24th & Lake corridor. This walk takes you through one of America's most significant Black cultural districts, where murals celebrate jazz legends, civil rights leaders, and community resilience. The area was once known as the 'Crossroads of the Nation' for its thriving jazz and blues scene.",
    time:"1 hr",distance:"1.8 mi",difficulty:"Easy",lat:41.28,lng:-95.94,
    startPoint:"24th & Lake St, Omaha, NE 68110",
    tags:["Art","Culture","History"],iconKey:"camera",
    img:"/images/content/neighborhoods/old-market/old-market-1.jpg",
    stops:[
      {name:"Love's Jazz & Arts Center",desc:"Community arts center honoring Omaha's deep jazz heritage. Named for Preston Love Sr.",icon:"\uD83C\uDFB7",lat:41.2800,lng:-95.9400,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"24th & Lake Murals",desc:"Large-scale murals depicting jazz musicians, civil rights leaders, and community stories.",icon:"\uD83C\uDFA8",lat:41.2805,lng:-95.9405,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"The Union for Contemporary Art",desc:"Community-powered arts center with exhibitions, co-op studios, and artist fellowships.",icon:"\uD83D\uDD8C\uFE0F",lat:41.2810,lng:-95.9410,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"Historic Dreamland Ballroom Site",desc:"Where Duke Ellington, Count Basie, and Nat King Cole performed in the 1930s-50s.",icon:"\uD83C\uDFB6",lat:41.2815,lng:-95.9395,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"Malcolm X Birth Site",desc:"Historical marker at 3448 Pinkney St where Malcolm X was born in 1925.",icon:"\u2B50",lat:41.2830,lng:-95.9420,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
    ],
    highlights:["Historic 'Crossroads of the Nation' jazz district","Large-scale murals celebrating Black culture and history","Malcolm X birthplace historical marker","Active community arts organizations and galleries"],
    tips:[
      {icon:"\uD83D\uDCDA",title:"Know the History",text:"This was one of America's premier jazz corridors. Read about Preston Love Sr. and the Dreamland Ballroom before visiting."},
      {icon:"\uD83D\uDCF7",title:"Photography",text:"The murals are best photographed in morning light (east-facing walls) or late afternoon."},
      {icon:"\uD83E\uDD1D",title:"Support Local",text:"Visit The Union's exhibitions (free) and check their events calendar for openings and performances."},
    ],
  },
  {
    id:"w5",neighborhood:"downtown",name:"RiverFront Trail",
    desc:"Gene Leahy Mall \u2192 Heartland of America Park \u2192 Lewis & Clark Landing.",
    longDesc:"Walk Omaha's transformed riverfront \u2014 the $290M RiverFront revitalization turned old highways into one of the best urban parks in the Midwest. Start at Gene Leahy Mall's splash pad and slides, cross through Heartland of America Park's lake and fountains, and finish at Lewis & Clark Landing overlooking the Missouri River and Bob Kerrey Bridge.",
    time:"40 min",distance:"1.4 mi",difficulty:"Easy",lat:41.258,lng:-95.928,
    startPoint:"Gene Leahy Mall, 1302 Farnam St, Omaha, NE 68102",
    tags:["Riverfront","Family","Free"],iconKey:"walk",
    img:"/images/content/neighborhoods/old-market/old-market-1.jpg",
    stops:[
      {name:"Gene Leahy Mall",desc:"The crown jewel \u2014 $290M urban park with splash pad, slides, amphitheater, and Kiewit Luminarium.",icon:"\uD83C\uDFDE\uFE0F",lat:41.2580,lng:-95.9280,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"The Luminarium",desc:"82,000 sq ft interactive science center right on the mall. 125+ hands-on exhibits.",icon:"\uD83D\uDD2C",lat:41.2565,lng:-95.9230,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"Heartland of America Park",desc:"8-acre park with a large lake, lighted fountain, and walking paths.",icon:"\u26F2",lat:41.2555,lng:-95.9250,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"Lewis & Clark Landing",desc:"Riverfront plaza with Missouri River overlook, public art, and seasonal events.",icon:"\u2693",lat:41.2575,lng:-95.9215,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
      {name:"Bob Kerrey Pedestrian Bridge",desc:"3,000-foot bridge crossing the Missouri to Iowa. Best sunset views in Omaha.",icon:"\uD83C\uDF05",lat:41.2575,lng:-95.9210,img:"/images/content/neighborhoods/old-market/old-market-1.jpg"},
    ],
    highlights:["$290M RiverFront revitalization \u2014 Omaha's signature public space","Free splash pad, slides, and playground for kids","Bob Kerrey Bridge sunset views are unmissable","Kiewit Luminarium science center right on the route"],
    tips:[
      {icon:"\uD83D\uDCA6",title:"Splash Pad",text:"Open Memorial Day \u2013 Labor Day. Bring swimsuits and towels for the kids \u2014 it's free."},
      {icon:"\uD83C\uDF05",title:"Sunset Walk",text:"Time your walk to end at Bob Kerrey Bridge at sunset. The Missouri River catches golden light perfectly."},
      {icon:"\uD83C\uDF7D\uFE0F",title:"Dining Nearby",text:"The Boiler Room and Upstream Brewing are both within a block of Gene Leahy Mall."},
    ],
  },
];

export const SUNSETS=[
  {id:"s1",name:"Bob Kerrey Bridge",desc:"Best sunset panorama in Omaha. Missouri River catches golden light with both skylines.",lat:41.2575,lng:-95.9215,icon:"sunset"},
  {id:"s2",name:"Gene Leahy Mall",desc:"Free outdoor movies and performances against a downtown backdrop.",lat:41.258,lng:-95.93,icon:"sunset"},
  {id:"s3",name:"Stir Concert Cove",desc:"Lakeside at Harrah's. Summer concerts as the sun drops behind the stage.",lat:41.233,lng:-95.854,icon:"music"},
  {id:"s4",name:"Turner Park",desc:"Jazz on the Green in summer. Bring wine and a picnic. Arrive by 6 PM.",lat:41.255,lng:-95.96,icon:"music"},
];
