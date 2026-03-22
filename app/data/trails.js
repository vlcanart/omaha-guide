import { u } from '../lib/helpers';

export const TRAILS=[
  {id:"t1",name:"Keystone Trail",desc:"Omaha's backbone — 50+ miles of paved multi-use trail through the metro.",distance:"52 mi",difficulty:"Easy",surface:"Paved",lat:41.24,lng:-96.02,tags:["Cycling","Running"],img:u("photo-1552674605-db6ffd4facb5"),elev:"Flat",icon:"bike"},
  {id:"t2",name:"Bob Kerrey Bridge Loop",desc:"Cross the Missouri River to Iowa and back. Best sunrise views in the city.",distance:"3.2 mi",difficulty:"Easy",surface:"Paved",lat:41.2575,lng:-95.9215,tags:["Walking","River"],img:u("photo-1506157786151-b8491531f063"),elev:"Flat",icon:"walk"},
  {id:"t3",name:"Fontenelle Forest",desc:"2,000 acres of old-growth forest. Boardwalk canopy trail. Watch for bald eagles.",distance:"17 mi trails",difficulty:"Moderate",surface:"Dirt / Boardwalk",lat:41.157,lng:-95.9,tags:["Forest","Birding"],img:u("photo-1448375240586-882707db888b"),elev:"+350 ft",url:"https://fontenelleforest.org",icon:"tree"},
  {id:"t4",name:"Wehrspann Lake Loop",desc:"8-mile loop at Chalco Hills. Packed gravel, gentle rolling hills, shaded sections.",distance:"8.1 mi",difficulty:"Easy–Mod",surface:"Gravel",lat:41.18,lng:-96.13,tags:["Lake","Loop"],img:u("photo-1500534314263-0869cef27f7d"),elev:"+180 ft",icon:"trail"},
  {id:"t5",name:"Zorinsky Lake Trail",desc:"Popular West Omaha loop with prairie views, fishing pier, and waterbird habitat.",distance:"4.8 mi",difficulty:"Easy",surface:"Paved",lat:41.23,lng:-96.075,tags:["Lake","Family"],img:u("photo-1441974231531-c6227db76b6e"),elev:"Flat",icon:"walk"},
];

export const WALKS=[
  {id:"w1",name:"Old Market Historic Walk",desc:"Cobblestone streets, 19th-century warehouses, galleries. Start at 10th & Howard.",time:"45 min",distance:"1.2 mi",lat:41.2555,lng:-95.932,tags:["History","Architecture"],icon:"camera"},
  {id:"w2",name:"Benson Mainstreet",desc:"Omaha's most eclectic neighborhood. Vintage shops, murals, record stores, dive bars.",time:"1 hr",distance:"1.5 mi",lat:41.281,lng:-95.954,tags:["Music","Vintage"],icon:"walk"},
  {id:"w3",name:"Blackstone to Dundee",desc:"Cocktail district to tree-lined neighborhood restaurants. Hit Crescent Moon and Pitch.",time:"1.5 hr",distance:"2.1 mi",lat:41.259,lng:-95.965,tags:["Dining","Cocktails"],icon:"food"},
  {id:"w4",name:"North Omaha Murals",desc:"Street art celebrating Black history, jazz legends, and community resilience.",time:"1 hr",distance:"1.8 mi",lat:41.28,lng:-95.94,tags:["Art","Culture"],icon:"camera"},
  {id:"w5",name:"RiverFront Trail",desc:"Gene Leahy Mall → Heartland of America Park → Lewis & Clark Landing.",time:"40 min",distance:"1.4 mi",lat:41.258,lng:-95.928,tags:["Riverfront","Family"],icon:"walk"},
];

export const SUNSETS=[
  {id:"s1",name:"Bob Kerrey Bridge",desc:"Best sunset panorama in Omaha. Missouri River catches golden light with both skylines.",lat:41.2575,lng:-95.9215,icon:"sunset"},
  {id:"s2",name:"Gene Leahy Mall",desc:"Free outdoor movies and performances against a downtown backdrop.",lat:41.258,lng:-95.93,icon:"sunset"},
  {id:"s3",name:"Stir Concert Cove",desc:"Lakeside at Harrah's. Summer concerts as the sun drops behind the stage.",lat:41.233,lng:-95.854,icon:"music"},
  {id:"s4",name:"Turner Park",desc:"Jazz on the Green in summer. Bring wine and a picnic. Arrive by 6 PM.",lat:41.255,lng:-95.96,icon:"music"},
];
