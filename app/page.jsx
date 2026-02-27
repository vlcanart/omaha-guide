"use client";
import { useState, useEffect, useCallback } from "react";
import { INGESTED_EVENTS, BUILD_META, dedupeKey } from "./events-data";

/* ═══ DESIGN TOKENS — lighter palette ═══ */
const T={
  bg:"#141618",
  surface:"#1B1D21",
  card:"#1F2227",
  border:"rgba(255,255,255,0.08)",
  borderHi:"rgba(255,255,255,0.18)",
  text:"#F2EFE9",
  textHi:"#FFFFFF",
  textBody:"rgba(242,239,233,0.82)",
  textSec:"rgba(242,239,233,0.58)",
  textDim:"rgba(242,239,233,0.32)",
  venue:"rgba(242,239,233,0.72)",
  accent:"#5EC4B6",
  accentSoft:"rgba(94,196,182,0.10)",
  accentGlow:"rgba(94,196,182,0.30)",
  gold:"#D4AD65",
  green:"#7DD4A0",
  red:"#E8364F",
  sans:"'Inter',system-ui,-apple-system,sans-serif",
};
const CG={
  concerts:"linear-gradient(135deg,#1A2E32 0%,#213740 60%,#1C3035 100%)",
  sports:"linear-gradient(135deg,#1A2430 0%,#21303E 60%,#1C2836 100%)",
  festivals:"linear-gradient(135deg,#2A1F34 0%,#34263E 60%,#2C2138 100%)",
  family:"linear-gradient(135deg,#1C2A1F 0%,#253628 60%,#1F2E22 100%)",
  arts:"linear-gradient(135deg,#271F30 0%,#30263A 60%,#292134 100%)",
  comedy:"linear-gradient(135deg,#2D2518 0%,#3A2F1E 60%,#332A1C 100%)",
  _:"linear-gradient(135deg,#1E2024 0%,#262A2E 60%,#202428 100%)",
};
const CA={concerts:"#5EC4B6",sports:"#64B5F6",festivals:"#CE93D8",family:"#81C784",arts:"#B39DDB",comedy:"#FFB74D"};

/* ═══ SVG ICONS ═══ */
const I={
  events:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="16" r="2"/></svg>,
  explore:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={c} opacity="0.15"/></svg>,
  venues:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  saved:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>,
  music:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  trophy:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 19.24 7 20h10c0-.76-.85-1.25-2.03-1.79C14.47 17.98 14 17.55 14 17v-2.34"/><path d="M18 2H6v7a6 6 0 1012 0V2z"/></svg>,
  festival:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  family:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M17 14h1a3 3 0 013 3v4"/></svg>,
  art:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17" cy="15" r="1.5"/><circle cx="8.5" cy="12.5" r="1.5"/><circle cx="6" cy="18" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
  dir:(c,s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" opacity="0"/><path d="M5 12h14"/><path d="M12 5v14"/><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12"/></svg>,
  link:(c,s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  chev:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  chevDown:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  heart:(c,s=16,fill=false)=><svg width={s} height={s} viewBox="0 0 24 24" fill={fill?c:"none"} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  search:(c,s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  refresh:(c,s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  comedy:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  play:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke="none"><polygon points="5,3 19,12 5,21"/></svg>,
  playCircle:(c,s=24)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16" fill={c}/></svg>,
  share:(c,s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
};

const CATICON={concerts:I.music,sports:I.trophy,festivals:I.festival,family:I.family,arts:I.art,comedy:I.comedy};

function useW(){const[w,s]=useState(typeof window!=="undefined"?window.innerWidth:375);useEffect(()=>{const h=()=>s(window.innerWidth);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);return w;}

/* ═══ IMAGES ═══ */
const u=id=>`https://images.unsplash.com/${id}?w=600&h=400&fit=crop&q=80`;
const IMG={rock:u("photo-1470229722913-7c0e2dbbafd3"),concert:u("photo-1501386761578-eac5c94b800a"),acoustic:u("photo-1511671782779-c97d3d27a1d4"),comedy:u("photo-1585699324551-f6c309eedeca"),edm:u("photo-1574391884720-bbc3740c59d1"),metal:u("photo-1508854710579-5cecc3a9ff17"),folk:u("photo-1510915361894-db8b60106cb1"),indie:u("photo-1459749411175-04bf5292ceea"),jazz:u("photo-1415201364774-f6f0bb35f28f"),orchestra:u("photo-1465847899084-d164df4dedc6"),basketball:u("photo-1546519638-68e109498ffc"),football:u("photo-1508098682722-e99c43a406b2"),baseball:u("photo-1529768167801-9173d94c2a42"),soccer:u("photo-1553778263-73a83bab9b0c"),hockey:u("photo-1580692475446-c2fabbbbf835"),volleyball:u("photo-1612872087720-bb876e2e67d1"),food:u("photo-1555939594-58d7cb561ad1"),festival:u("photo-1533174072545-7a4b6ad7a6c3"),zoo:u("photo-1534567153574-2b12153a87f0"),running:u("photo-1552674605-db6ffd4facb5"),art:u("photo-1531243269054-5ebf6f34081e"),theater:u("photo-1503095396549-807759245b35"),film:u("photo-1489599849927-2ee91cede3ba"),books:u("photo-1481627834876-b7833e8f5570"),gaming:u("photo-1542751371-adc38448a05e"),country:u("photo-1506157786151-b8491531f063"),emo:u("photo-1524368535928-5b5e00ddc76b"),gothic:u("photo-1518834107812-67b0b7c58434"),sports:u("photo-1461896836934-bd45ba8ac53e"),family:u("photo-1511895426328-dc8714191300"),default:u("photo-1492684223066-81342ee5ff30")};
const EV_IMG={1:u("photo-1493225457124-a3eb161ffa5f"),2:u("photo-1585699324551-f6c309eedeca"),4:u("photo-1470229722913-7c0e2dbbafd3"),6:u("photo-1603190287605-e6ade32fa852"),7:u("photo-1542751371-adc38448a05e"),16:u("photo-1518834107812-67b0b7c58434"),101:u("photo-1546519638-68e109498ffc"),106:u("photo-1529768167801-9173d94c2a42"),107:u("photo-1508098682722-e99c43a406b2"),203:u("photo-1555939594-58d7cb561ad1")};

function pickImg(ev){
  if(ev.image)return ev.image;
  if(EV_IMG[ev.id])return EV_IMG[ev.id];
  const ti=(ev.title||"").toLowerCase(),tags=(ev.tags||[]).map(t=>t.toLowerCase());
  for(const[k,v]of Object.entries(IMG)){if(tags.includes(k))return v;}
  const R=[[["symphony","playstation"],IMG.orchestra],[["comedy","notaro","nate jackson"],IMG.comedy],[["country","fisher","farr","thorogood"],IMG.country],[["metal","lorna","nihil"],IMG.metal],[["edm","wooli","inzo"],IMG.edm],[["folk","jurado"],IMG.folk],[["punk","hawthorne","yellowcard"],IMG.emo],[["gothic","ethel cain"],IMG.gothic],[["indie","heat wave"],IMG.indie],[["rock","hexum","witches"],IMG.rock],[["jazz","noma"],IMG.jazz],[["basketball","creighton"],IMG.basketball],[["football","husker"],IMG.football],[["baseball","storm"],IMG.baseball],[["soccer","union omaha"],IMG.soccer],[["hockey","lancer","maverick"],IMG.hockey],[["volleyball","lovb"],IMG.volleyball],[["zoo"],IMG.zoo],[["run"],IMG.running],[["food","cinco"],IMG.food],[["film","a24"],IMG.film],[["theater","theatre","bluebarn"],IMG.theater],[["art","joslyn"],IMG.art],[["book","lit"],IMG.books]];
  for(const[keys,url]of R){for(const k of keys){if(ti.includes(k))return url;}}
  return IMG[ev.cat]||IMG.default;
}

/* ═══ DATA ═══ */
const VENUES=[
  /* ── Arenas & Main Stages ── */
  {id:1,name:"CHI Health Center",area:"North Downtown",cap:"18,300",type:"Arena",lat:41.2628,lng:-95.9257,desc:"The premier arena for the biggest global stadium tours and Creighton Men's Basketball.",url:"https://www.chihealthcenteromaha.com",img:u("photo-1540039155733-5bb30b53aa14")},
  {id:2,name:"Baxter Arena",area:"Aksarben",cap:"7,898",type:"Arena",lat:41.2382,lng:-96.0115,desc:"UNO's multi-purpose venue hosting college sports, concerts, and community events.",url:"https://baxterarena.com",img:u("photo-1547347298-4074fc3086f0")},
  {id:4,name:"Steelhouse Omaha",area:"North Downtown",cap:"3,000",type:"Performing Arts",lat:41.258,lng:-95.937,desc:"Modern, standing-room-heavy venue built to attract large mid-tier touring bands.",url:"https://steelhouseomaha.com",img:u("photo-1501386761578-eac5c94b800a")},
  {id:5,name:"The Astro",area:"La Vista",cap:"2,500 / 5,500",type:"Arena",lat:41.2105,lng:-96.0475,desc:"Brand new dual-venue (indoor + amphitheater) bringing world-class rock, pop, and country.",url:"https://www.theastrotheater.com",img:u("photo-1470229722913-7c0e2dbbafd3")},
  {id:6,name:"Orpheum Theater",area:"Downtown",cap:"2,600",type:"Performing Arts",lat:41.2582,lng:-95.9352,desc:"Historic, ornate 1927 theater hosting Broadway tours, comedians, and major concerts.",url:"https://o-pa.org",img:u("photo-1503095396549-807759245b35")},
  {id:7,name:"Holland PAC",area:"Downtown",cap:"2,000",type:"Performing Arts",lat:41.2606,lng:-95.9313,desc:"Modern acoustic marvel hosting the Omaha Symphony, jazz, and contemporary acts.",url:"https://o-pa.org",img:u("photo-1465847899084-d164df4dedc6")},
  {id:25,name:"Liberty First Credit Union Arena",area:"Ralston",cap:"4,600",type:"Arena",lat:41.2033,lng:-96.0395,desc:"Large arena for mid-to-large tier country, rock, sports, and rodeos.",url:"https://www.libertyfirstcreditunionarena.com",img:u("photo-1540039155733-5bb30b53aa14")},
  {id:26,name:"Charles Schwab Field",area:"North Downtown",cap:"24,000+",type:"Arena",lat:41.2565,lng:-95.9497,desc:"Home of the College World Series; occasionally hosts massive stadium concerts.",url:"https://www.charlesschwabfieldomaha.com",img:u("photo-1567459169668-95d355decb6d")},
  {id:14,name:"Stir Concert Cove",area:"Council Bluffs",cap:"4,000",type:"Outdoor",lat:41.233,lng:-95.854,desc:"Massive outdoor summer concert series right across the river at Harrah's Casino.",url:"https://www.stircove.com",img:u("photo-1506157786151-b8491531f063")},
  {id:17,name:"Werner Park",area:"Papillion",cap:"9,023",type:"Outdoor",lat:41.1183,lng:-96.0945,desc:"Minor league ballpark with fireworks nights. Home of the Storm Chasers.",url:"#",img:u("photo-1529768167801-9173d94c2a42")},
  /* ── Performing Arts & Theater ── */
  {id:27,name:"Omaha Community Playhouse",area:"Central (Cass St)",cap:"Varies",type:"Performing Arts",lat:41.2562,lng:-95.9580,desc:"The largest community theater in the U.S., putting on high-quality plays and musicals.",url:"https://www.omahaplayhouse.com",img:u("photo-1503095396549-807759245b35")},
  {id:28,name:"BLUEBARN Theatre",area:"Little Italy",cap:"Intimate",type:"Performing Arts",lat:41.2543,lng:-95.9365,desc:"Intimate, contemporary theater known for daring and innovative professional productions.",url:"https://bluebarn.org",img:u("photo-1503095396549-807759245b35")},
  {id:29,name:"The Rose Theater",area:"Downtown",cap:"Varies",type:"Performing Arts",lat:41.2610,lng:-95.9372,desc:"Historic theater dedicated to high-production children's and family stage shows.",url:"https://www.rosetheater.org",img:u("photo-1503095396549-807759245b35")},
  /* ── Indie / Club ── */
  {id:8,name:"The Slowdown",area:"North Downtown",cap:"500",type:"Indie / Club",lat:41.2691,lng:-95.9251,desc:"Iconic indie rock venue created by Saddle Creek Records. Main stage and front room.",url:"https://theslowdown.com",img:u("photo-1459749411175-04bf5292ceea")},
  {id:9,name:"The Waiting Room",area:"Benson",cap:"400",type:"Indie / Club",lat:41.281,lng:-95.954,desc:"The legendary heart of Omaha's alt/indie scene. A must-play for touring bands on the rise.",url:"https://waitingroomlounge.com",img:u("photo-1511671782779-c97d3d27a1d4")},
  {id:10,name:"Reverb Lounge",area:"Benson",cap:"150",type:"Indie / Club",lat:41.2808,lng:-95.9545,desc:"Sleek, mid-century modern listening room with great sound. Steps from The Waiting Room.",url:"https://reverblounge.com",img:u("photo-1508854710579-5cecc3a9ff17")},
  {id:11,name:"The Admiral",area:"Little Bohemia",cap:"1,500",type:"Indie / Club",lat:41.2525,lng:-95.9355,desc:"Formerly Sokol Auditorium — historic large hall hosting punk, metal, hip-hop, and EDM.",url:"https://www.admiralomaha.com",img:u("photo-1574391884720-bbc3740c59d1")},
  {id:12,name:"Barnato",area:"West Omaha",cap:"600",type:"Indie / Club",lat:41.262,lng:-96.073,desc:"Upscale art-deco music lounge next to a Bentley dealership. Premium cocktails and vibes.",url:"https://barnato.bar",img:u("photo-1511671782779-c97d3d27a1d4")},
  /* ── Bar / Restaurant Venues ── */
  {id:30,name:"The Jewell",area:"Capitol District",cap:"Intimate",type:"Bar / Venue",lat:41.2577,lng:-95.9370,desc:"Omaha's premier jazz club. Upscale dining and cocktails with national/local jazz and blues.",url:"https://jewellomaha.com",img:u("photo-1415201364774-f6f0bb35f28f")},
  {id:31,name:"Noli's Pizzeria",area:"Blackstone",cap:"Patio",type:"Bar / Venue",lat:41.2590,lng:-95.9650,desc:"Authentic NY-style pizza with regular live music on the patio.",url:"https://nolispizzeria.com",img:u("photo-1555939594-58d7cb561ad1")},
  {id:32,name:"The Down Under Lounge",area:"Leavenworth",cap:"Small",type:"Bar / Venue",lat:41.2520,lng:-95.9430,desc:"Quirky, beloved neighborhood bar with local indie bands, open mics, and art on the walls.",url:"https://theduomaha.com",img:u("photo-1459749411175-04bf5292ceea")},
  {id:33,name:"Harney Street Tavern",area:"Old Market",cap:"Small",type:"Bar / Venue",lat:41.2555,lng:-95.9330,desc:"Cozy tavern with great drinks and a small stage for acoustic, rock, and blues musicians.",url:"https://harneystreettavern.com",img:u("photo-1511671782779-c97d3d27a1d4")},
  {id:34,name:"O'Leaver's",area:"Saddle Creek",cap:"Small",type:"Bar / Venue",lat:41.2680,lng:-95.9620,desc:"Legendary dive bar hosting loud underground punk/indie. Massive outdoor sand volleyball area.",url:"https://oleavers.com",img:u("photo-1508854710579-5cecc3a9ff17")},
  {id:35,name:"Bogie's West",area:"West Omaha",cap:"Small",type:"Bar / Venue",lat:41.2600,lng:-96.0500,desc:"Laid-back sports bar known for hosting live local jazz, blues, and classic rock.",url:"https://bogiesbar.com",img:u("photo-1415201364774-f6f0bb35f28f")},
  {id:36,name:"The B. Bar",area:"Central Omaha",cap:"Small",type:"Bar / Venue",lat:41.2580,lng:-95.9500,desc:"Community-focused bar hosting diverse local and national acts. Shows almost every night.",url:"https://thebbaromaha.com",img:u("photo-1459749411175-04bf5292ceea")},
  {id:37,name:"Buck's Bar and Grill",area:"Venice (West)",cap:"Small",type:"Bar / Venue",lat:41.2700,lng:-96.1000,desc:"Country-leaning local gem famous for prime rib dinners and regular live music.",url:"https://bucksbarandgrill.com",img:u("photo-1506157786151-b8491531f063")},
  /* ── Comedy Clubs ── */
  {id:50,name:"Funny Bone Comedy Club",area:"West Omaha",cap:"350",type:"Comedy Club",lat:41.2580,lng:-96.0700,desc:"Omaha's premier stand-up club for nationally touring comedians. 21+ with 2-item minimum.",url:"https://omaha.funnybone.com",img:u("photo-1585699324551-f6c309eedeca")},
  {id:51,name:"The Backline Comedy Theatre",area:"Downtown",cap:"150",type:"Comedy Club",lat:41.2555,lng:-95.9340,desc:"Headquarters for Omaha's local comedy scene. Improv, sketch, open mics, stand-up, and a training center.",url:"https://backlinecomedy.com",img:u("photo-1585699324551-f6c309eedeca")},
  {id:52,name:"Big Canvas Comedy",area:"Blackstone",cap:"100",type:"Comedy Club",lat:41.2590,lng:-95.9650,desc:"Nonprofit comedy theater focused on short-form improv, stand-up, and family-friendly comedy classes.",url:"https://bigcanvascomedy.com",img:u("photo-1585699324551-f6c309eedeca")},
  {id:53,name:"The Dubliner Pub",area:"Old Market",cap:"Small",type:"Comedy Club",lat:41.2555,lng:-95.9320,desc:"Classic below-street-level Irish pub hosting a popular long-running Monday night Comedy Open Mic.",url:"https://dublinerpubomaha.com",img:u("photo-1585699324551-f6c309eedeca")},
  /* ── Museums & Attractions ── */
  {id:21,name:"Henry Doorly Zoo",area:"South Omaha",cap:"25,000+",type:"Museum / Attraction",lat:41.226,lng:-95.9287,desc:"Consistently ranked among the world's best zoos. Desert Dome, Lied Jungle, and deep-sea aquarium.",url:"https://www.omahazoo.com",img:u("photo-1534567153574-2b12153a87f0")},
  {id:38,name:"Kiewit Luminarium",area:"The RiverFront",cap:"Varies",type:"Museum / Attraction",lat:41.2565,lng:-95.9230,desc:"State-of-the-art interactive science and perception center with 100+ hands-on exhibits.",url:"https://kiewitluminarium.org",img:u("photo-1531243269054-5ebf6f34081e")},
  {id:39,name:"Omaha Children's Museum",area:"Downtown",cap:"Varies",type:"Museum / Attraction",lat:41.2600,lng:-95.9340,desc:"Hands-on learning museum with Imagination Playground, water tables, and a science center.",url:"https://ocm.org",img:u("photo-1511895426328-dc8714191300")},
  {id:40,name:"The Durham Museum",area:"Downtown",cap:"Varies",type:"Museum / Attraction",lat:41.2553,lng:-95.9310,desc:"Stunning 1931 art deco Union Station. Walk-through historic train cars and a 1930s soda fountain.",url:"https://durhammuseum.org",img:u("photo-1503095396549-807759245b35")},
  {id:22,name:"Joslyn Art Museum",area:"Downtown",cap:"Varies",type:"Museum / Attraction",lat:41.2635,lng:-95.9394,desc:"World-class art museum with a massive 42,000 sq ft Snøhetta expansion. Free general admission.",url:"https://joslyn.org",img:u("photo-1531243269054-5ebf6f34081e")},
  {id:41,name:"SAC & Aerospace Museum",area:"Ashland",cap:"Varies",type:"Museum / Attraction",lat:41.0350,lng:-96.3000,desc:"Massive facility housing Cold War aircraft, spacecraft, and a Children's Learning Center.",url:"https://sacmuseum.org",img:u("photo-1540039155733-5bb30b53aa14")},
  {id:42,name:"Lauritzen Gardens",area:"South Omaha",cap:"Varies",type:"Museum / Attraction",lat:41.2384,lng:-95.9158,desc:"100-acre botanical garden with indoor conservatory and popular seasonal model train displays.",url:"https://www.lauritzengardens.org",img:u("photo-1534567153574-2b12153a87f0")},
  {id:43,name:"Fontenelle Forest",area:"Bellevue",cap:"Varies",type:"Museum / Attraction",lat:41.1570,lng:-95.9000,desc:"One of the largest private nature centers in the nation. 17 miles of trails and boardwalk.",url:"https://fontenelleforest.org",img:u("photo-1552674605-db6ffd4facb5")},
  {id:44,name:"El Museo Latino",area:"South Omaha",cap:"Varies",type:"Museum / Attraction",lat:41.2380,lng:-95.9400,desc:"Showcases traditional and contemporary artwork from local and global Latin American artists.",url:"https://elmuseolatino.org",img:u("photo-1531243269054-5ebf6f34081e")},
  {id:45,name:"Wildlife Safari Park",area:"Ashland",cap:"Varies",type:"Museum / Attraction",lat:41.0400,lng:-96.3100,desc:"4-mile drive-through park with bison, elk, wolves, and bears. Affiliated with Omaha's Zoo.",url:"https://wildlifesafaripark.com",img:u("photo-1534567153574-2b12153a87f0")},
  {id:46,name:"Union Pacific Railroad Museum",area:"Council Bluffs, IA",cap:"Varies",type:"Museum / Attraction",lat:41.2614,lng:-95.8512,desc:"Hands-on history of the transcontinental railroad. Free admission.",url:"https://uprrmuseum.org",img:u("photo-1503095396549-807759245b35")},
  {id:23,name:"Film Streams",area:"North Downtown",cap:"285",type:"Performing Arts",lat:41.269,lng:-95.9255,desc:"Two-screen arthouse cinema. Curated indie and classic films at Ruth Sokolof Theater.",url:"https://filmstreams.org",img:u("photo-1489599849927-2ee91cede3ba")},
];

/* ═══ EXPLORE: expandable sections with real listings ═══ */
const EXPLORE=[
  {id:"hoods",title:"Neighborhoods",icon:"◈",items:[
    {name:"Old Market",desc:"Cobblestone streets, galleries, restaurants, and nightlife.",lat:41.2555,lng:-95.9320,url:"https://oldmarket.com",tags:["Dining","Nightlife","Shopping"]},
    {name:"Benson",desc:"Eclectic live music, dive bars, vintage shops, and local eats.",lat:41.2810,lng:-95.9540,url:"#",tags:["Music","Bars","Vintage"]},
    {name:"Dundee–Memorial Park",desc:"Tree-lined streets, Elmwood Park trails, neighborhood restaurants.",lat:41.2620,lng:-95.9750,url:"#",tags:["Dining","Parks","Walking"]},
    {name:"Blackstone District",desc:"Omaha's cocktail and culinary hub. Speakeasies and breweries.",lat:41.2590,lng:-95.9650,url:"#",tags:["Cocktails","Dining","Nightlife"]},
    {name:"Aksarben Village",desc:"Modern mixed-use with Stinson Park, restaurants, and events.",lat:41.2440,lng:-95.9600,url:"#",tags:["Parks","Events","Dining"]},
    {name:"North Downtown",desc:"The Slowdown, Film Streams, and a growing creative corridor.",lat:41.2691,lng:-95.9251,url:"#",tags:["Music","Film","Arts"]},
  ]},
  {id:"parks",title:"Parks & Gardens",icon:"🌿",items:[
    {name:"Lauritzen Gardens",desc:"100-acre botanical oasis with seasonal exhibits and events.",lat:41.2384,lng:-95.9158,url:"https://www.lauritzengardens.org",tags:["Gardens","Seasonal"]},
    {name:"Gene Leahy Mall",desc:"Riverfront park with splash pad, playground, amphitheater, and green space.",lat:41.2580,lng:-95.9300,url:"#",tags:["Riverfront","Family"]},
    {name:"Heartland of America Park",desc:"Downtown lake with fountain, walking paths, and city skyline views.",lat:41.2540,lng:-95.9220,url:"#",tags:["Lake","Walking"]},
    {name:"Zorinsky Lake",desc:"Popular 255-acre park with trails, fishing, and picnic areas in West Omaha.",lat:41.2300,lng:-96.0750,url:"#",tags:["Trails","Fishing"]},
    {name:"Elmwood Park",desc:"Historic park with trails, golf course, and playground in the Dundee area.",lat:41.2520,lng:-95.9710,url:"#",tags:["Trails","Historic"]},
    {name:"Standing Bear Lake",desc:"Northwest Omaha park with 135-acre lake, trails, and nature center.",lat:41.3060,lng:-96.0650,url:"#",tags:["Lake","Nature"]},
  ]},
  {id:"trails",title:"Trails & Running",icon:"🏃",items:[
    {name:"Bob Kerrey Pedestrian Bridge",desc:"3,000-ft bridge connecting Nebraska and Iowa across the Missouri River.",lat:41.2575,lng:-95.9215,url:"#",tags:["Bridge","River"]},
    {name:"Keystone Trail",desc:"50+ mile paved trail system spanning the Omaha metro area.",lat:41.2400,lng:-96.0200,url:"#",tags:["Cycling","Running"]},
    {name:"Wehrspann Lake Trail",desc:"8-mile loop around Wehrspann Lake at Chalco Hills Recreation Area.",lat:41.1800,lng:-96.1300,url:"#",tags:["Lake","Loop"]},
    {name:"Big Papio Trail",desc:"Paved trail along Big Papillion Creek. Great for cycling and running.",lat:41.2100,lng:-96.0500,url:"#",tags:["Creek","Cycling"]},
    {name:"Fontenelle Forest",desc:"2,000 acres of forest, wetlands, and boardwalk trails in Bellevue.",lat:41.1570,lng:-95.9000,url:"https://fontenelleforest.org",tags:["Forest","Nature"]},
  ]},
  {id:"food",title:"Food & Drink",icon:"🍽️",items:[
    {name:"South O Taco Trail",desc:"Authentic taquerias and Mexican restaurants along South 24th Street.",lat:41.2300,lng:-95.9400,url:"#",tags:["Tacos","Authentic"]},
    {name:"Blackstone Cocktail Crawl",desc:"Walk between craft cocktail bars in the Blackstone entertainment district.",lat:41.2590,lng:-95.9650,url:"#",tags:["Cocktails","Nightlife"]},
    {name:"Omaha Farmers Market",desc:"Saturday mornings in the Old Market. Local produce, baked goods, and crafts.",lat:41.2520,lng:-95.9340,url:"https://omahafarmersmarket.com",tags:["Market","Local"]},
    {name:"Benson First Friday",desc:"Monthly art walk with open galleries, food specials, and live music.",lat:41.2810,lng:-95.9540,url:"#",tags:["Art","Monthly"]},
    {name:"Dundee Restaurant Row",desc:"Walkable stretch of chef-driven restaurants along Underwood Avenue.",lat:41.2625,lng:-95.9750,url:"#",tags:["Fine Dining","Walkable"]},
  ]},
  {id:"outdoor",title:"Outdoor Venues",icon:"🎪",items:[
    {name:"Stir Concert Cove",desc:"Lakeside outdoor amphitheater at Harrah's for summer concerts.",lat:41.233,lng:-95.854,url:"#",tags:["Concerts","Summer"]},
    {name:"Stinson Park",desc:"Aksarben Village green hosting festivals, food trucks, and community events.",lat:41.253,lng:-95.921,url:"#",tags:["Festivals","Community"]},
    {name:"Gene Leahy Mall Amphitheater",desc:"Riverfront stage for free outdoor performances and movie nights.",lat:41.258,lng:-95.930,url:"#",tags:["Free","Movies"]},
    {name:"Turner Park",desc:"Midtown park hosting Omaha's Jazz on the Green and outdoor concerts.",lat:41.255,lng:-95.960,url:"#",tags:["Jazz","Free"]},
    {name:"SumTur Amphitheater",desc:"Intimate outdoor venue in Papillion for concerts and events.",lat:41.152,lng:-96.044,url:"#",tags:["Concerts","Papillion"]},
  ]},
  {id:"tours",title:"Walking Tours",icon:"🚶",items:[
    {name:"Old Market Historic Walk",desc:"Self-guided tour through cobblestone streets and 19th-century warehouses.",lat:41.2555,lng:-95.9320,url:"#",tags:["History","Self-Guided"]},
    {name:"North Omaha Murals",desc:"Street art tour featuring murals celebrating community and culture.",lat:41.2800,lng:-95.9400,url:"#",tags:["Art","Culture"]},
    {name:"Benson Bar Crawl",desc:"Walk Maple Street's eclectic mix of dive bars, cocktail spots, and breweries.",lat:41.2810,lng:-95.9540,url:"#",tags:["Bars","Nightlife"]},
    {name:"Downtown Architecture Tour",desc:"Art Deco gems, the Woodmen Tower, First National, and Union Station.",lat:41.2580,lng:-95.9350,url:"#",tags:["Architecture","History"]},
  ]},
];

/* ═══ EVENTS ═══ */
const EV=[
  {id:1,title:"Bryce Vine",cat:"concerts",venue:"The Waiting Room",date:"2026-02-20",time:"8 PM",price:"$20–30",url:"https://waitingroomlounge.com",emoji:"🎤",desc:"Infectious pop-rap energy. Known for 'Drew Barrymore' and viral TikTok hits.",tags:["Pop","Rap"],ytId:"XGjAKhcVjbg"},
  {id:2,title:"Nate Jackson Live",cat:"concerts",venue:"Steelhouse Omaha",date:"2026-02-21",time:"8 PM",price:"$40–80",url:"https://steelhouseomaha.com",emoji:"😂",feat:true,desc:"Instagram-famous comedian brings electric stand-up and crowd work to Steelhouse.",tags:["Comedy"]},
  {id:3,title:"Creed Fisher",cat:"concerts",venue:"Barnato",date:"2026-02-21",time:"8 PM",price:"$25–45",url:"#",emoji:"🤠",desc:"Outlaw country grit in Barnato's art deco speakeasy.",tags:["Country"],ytId:"HD3NVukAzMw"},
  {id:4,title:"Black Jacket Symphony",cat:"concerts",venue:"Steelhouse Omaha",date:"2026-02-22",time:"8 PM",price:"$35–65",url:"https://steelhouseomaha.com",emoji:"🎸",feat:true,desc:"Pink Floyd's The Wall performed note-for-note with full visual production.",tags:["Rock","Tribute"],ytId:"5Hbiac8sEYg"},
  {id:5,title:"Rivers of Nihil",cat:"concerts",venue:"Reverb Lounge",date:"2026-02-22",time:"7 PM",price:"$18–25",url:"https://reverblounge.com",emoji:"🤘",desc:"Progressive death metal with saxophone passages. Atmospheric and heavy.",tags:["Metal"]},
  {id:6,title:"Tig Notaro",cat:"concerts",venue:"Holland PAC",date:"2026-02-22",time:"7:30 PM",price:"$45–85",url:"https://ticketomaha.com",emoji:"🎙️",feat:true,desc:"Grammy-nominated deadpan comedy. Star of 'One Mississippi'.",tags:["Comedy"],ytId:"aMRxDTR0FeA"},
  {id:7,title:"Playstation The Concert",cat:"concerts",venue:"Orpheum Theater",date:"2026-02-25",time:"7 PM",price:"$50–120",url:"https://ticketomaha.com",emoji:"🎮",feat:true,desc:"God of War, Last of Us — iconic soundtracks performed live by orchestra.",tags:["Gaming","Orchestra"]},
  {id:8,title:"Wooli: Synapse",cat:"concerts",venue:"Steelhouse Omaha",date:"2026-02-25",time:"8 PM",price:"$35–55",url:"https://steelhouseomaha.com",emoji:"🎧",desc:"Dinosaur-themed dubstep meets melodic production.",tags:["EDM"]},
  {id:9,title:"Damien Jurado",cat:"concerts",venue:"Reverb Lounge",date:"2026-02-24",time:"8 PM",price:"$20–30",url:"https://reverblounge.com",emoji:"🎵",desc:"20+ albums of raw, poetic Americana folk.",tags:["Folk"]},
  {id:10,title:"All Them Witches",cat:"concerts",venue:"The Slowdown",date:"2026-03-03",time:"8 PM",price:"$25–35",url:"https://theslowdown.com",emoji:"🎸",desc:"Heavy psychedelic rock double-header with King Buffalo.",tags:["Rock"],ytId:"LYMhUwSzrMo"},
  {id:11,title:"Tyler Farr — Acoustic",cat:"concerts",venue:"Barnato",date:"2026-03-06",time:"8 PM",price:"$30–55",url:"#",emoji:"🎶",desc:"Stripped-down country from the 'Redneck Crazy' hitmaker.",tags:["Country","Acoustic"]},
  {id:12,title:"Hawthorne Heights",cat:"concerts",venue:"The Slowdown",date:"2026-03-11",time:"7 PM",price:"$25–40",url:"https://theslowdown.com",emoji:"🖤",desc:"Emo icons. 'Ohio Is For Lovers' and 2000s nostalgia.",tags:["Emo"],ytId:"hA5ezR0KfSM"},
  {id:13,title:"Inzo: Mirrorverse Tour",cat:"concerts",venue:"The Admiral",date:"2026-03-22",time:"8 PM",price:"$25–40",url:"#",emoji:"🪩",desc:"Visual-heavy electronic immersion. 500M+ streams.",tags:["Electronic"]},
  {id:14,title:"Hot Flash Heat Wave",cat:"concerts",venue:"The Slowdown",date:"2026-03-23",time:"8 PM",price:"$20–30",url:"https://theslowdown.com",emoji:"🌊",desc:"Dreamy indie pop from San Francisco.",tags:["Indie Pop"]},
  {id:15,title:"Nick Hexum of 311",cat:"concerts",venue:"The Waiting Room",date:"2026-03-25",time:"8 PM",price:"$25–40",url:"https://waitingroomlounge.com",emoji:"🎤",desc:"311 frontman goes solo acoustic. Omaha hometown hero.",tags:["Rock","Acoustic"],ytId:"SUFSB2plwzA"},
  {id:16,title:"Ethel Cain",cat:"concerts",venue:"The Astro",date:"2026-04-23",time:"8 PM",price:"$40–75",url:"https://ticketmaster.com",emoji:"🕯️",feat:true,desc:"Southern gothic sensation. 'Preacher's Daughter' live.",tags:["Gothic","Alt"],ytId:"1Gac9fDP_Hg"},
  {id:17,title:"Lorna Shore",cat:"concerts",venue:"Steelhouse Omaha",date:"2026-04-20",time:"7:30 PM",price:"$35–55",url:"https://steelhouseomaha.com",emoji:"🔥",desc:"Deathcore's biggest band. Earth-shattering live show.",tags:["Metal"],ytId:"qyYmS_iBcy4"},
  {id:18,title:"Yellowcard",cat:"concerts",venue:"Stir Concert Cove",date:"2026-05-19",time:"7 PM",price:"$40–65",url:"https://ticketmaster.com",emoji:"🎸",desc:"Pop-punk legends. 'Ocean Avenue' outdoors.",tags:["Emo"],ytId:"X9fLbfzCqWw"},
  {id:19,title:"George Thorogood",cat:"concerts",venue:"The Astro",date:"2026-05-17",time:"8 PM",price:"$45–85",url:"https://ticketmaster.com",emoji:"🎸",desc:"'Bad to the Bone' — The Baddest Show On Earth Tour.",tags:["Rock"],ytId:"X9jlqrJvuKs"},
  {id:20,title:"NOMA Underground",cat:"concerts",venue:"North Omaha Music & Arts",date:"2026-02-21",time:"7 PM",price:"Free",url:"#",emoji:"🎷",desc:"Free community music night in North Omaha.",tags:["Jazz","Free"]},
  {id:101,title:"Creighton vs. DePaul",cat:"sports",venue:"CHI Health Center",date:"2026-02-25",time:"7 PM",price:"$25–90",url:"https://ticketmaster.com",emoji:"🏀",feat:true,desc:"Big East basketball. Bluejays host DePaul at the CHI.",tags:["Basketball"]},
  {id:102,title:"LOVB Nebraska vs. Madison",cat:"sports",venue:"Baxter Arena",date:"2026-02-22",time:"7 PM",price:"$20–50",url:"https://ticketmaster.com",emoji:"🏐",desc:"Pro volleyball. League One Volleyball's Nebraska franchise.",tags:["Volleyball"]},
  {id:103,title:"Lancers vs. Waterloo",cat:"sports",venue:"Liberty First CU Arena",date:"2026-02-22",time:"6:05 PM",price:"$10–20",url:"#",emoji:"🏒",desc:"USHL junior hockey. Fast-paced action in Ralston.",tags:["Hockey"]},
  {id:104,title:"UNO Mavericks Hockey",cat:"sports",venue:"Baxter Arena",date:"2026-03-06",time:"7:07 PM",price:"$10–30",url:"https://ticketmaster.com",emoji:"🏒",desc:"UNO NCHC conference matchup. Division I college hockey.",tags:["Hockey"]},
  {id:105,title:"Union Omaha vs. Boise",cat:"sports",venue:"Morrison Stadium",date:"2026-03-22",time:"7 PM",price:"$15–35",url:"#",emoji:"⚽",desc:"USL League One under the lights.",tags:["Soccer"]},
  {id:106,title:"Storm Chasers Opening Night",cat:"sports",venue:"Werner Park",date:"2026-04-04",time:"6:35 PM",price:"$12–45",url:"#",emoji:"⚾",feat:true,desc:"2026 MiLB season kickoff with postgame fireworks.",tags:["Baseball"]},
  {id:107,title:"Huskers Spring Game",cat:"sports",venue:"Memorial Stadium",date:"2026-04-18",time:"1 PM",price:"Free",url:"#",emoji:"🏈",feat:true,desc:"86,000 fans for the first look at 2026 Huskers.",tags:["Football","Free"]},
  {id:201,title:"Omaha Lit Fest",cat:"festivals",venue:"Stinson Park",date:"2026-04-18",time:"10 AM",price:"Free",url:"#",emoji:"📚",desc:"Literature, spoken word, and author readings.",tags:["Literary","Free"]},
  {id:202,title:"Cinco de Mayo Fiesta",cat:"festivals",venue:"Stinson Park",date:"2026-05-05",time:"12 PM",price:"Free",url:"#",emoji:"🎉",desc:"Mariachi, street food, folklorico dancing.",tags:["Cultural","Free"]},
  {id:203,title:"Food Truck Festival",cat:"festivals",venue:"Stinson Park",date:"2026-05-09",time:"11 AM",price:"Free Entry",url:"#",emoji:"🍔",feat:true,desc:"40+ food trucks, live music, craft beverages.",tags:["Food"]},
  {id:204,title:"Zoo After Dark",cat:"family",venue:"Henry Doorly Zoo",date:"2026-03-21",time:"6 PM",price:"$20–35",url:"https://www.omahazoo.com/special-events",emoji:"🦁",desc:"The zoo at night. Animal encounters and light installations.",tags:["Zoo"]},
  {id:205,title:"Spring Family Fun Run",cat:"family",venue:"Elmwood Park",date:"2026-04-12",time:"9 AM",price:"$10–25",url:"#",emoji:"🏃",desc:"5K through Elmwood Park. Finisher medals for all.",tags:["Running"]},
  {id:301,title:"Joslyn First Friday",cat:"arts",venue:"Joslyn Art Museum",date:"2026-03-06",time:"5 PM",price:"Free",url:"https://joslyn.org/calendar",emoji:"🎨",desc:"Free first Friday with music, tours, and art-making.",tags:["Art","Free"]},
  {id:302,title:"BLUEBARN: Curious Incident",cat:"arts",venue:"The Rose Theater",date:"2026-03-13",time:"7:30 PM",price:"$25–45",url:"https://bluebarn.org/plays-events/",emoji:"🎭",desc:"Award-winning contemporary theater from BLUEBARN.",tags:["Theater"]},
  {id:303,title:"Film Streams: A24 Showcase",cat:"arts",venue:"Film Streams",date:"2026-03-08",time:"7 PM",price:"$12",url:"https://filmstreams.org/films",emoji:"🎬",desc:"Curated A24 double feature at Ruth Sokolof Theater.",tags:["Film"]},
  /* ── Comedy ── */
  {id:401,title:"Monday Open Mic Comedy",cat:"comedy",venue:"The Dubliner Pub",date:"2026-02-23",time:"8 PM",price:"Free",url:"https://dublinerpubomaha.com",emoji:"🎤",desc:"Omaha's longest-running comedy open mic. Below-street-level Irish pub vibes. Every Monday.",tags:["Open Mic","Free"]},
  {id:402,title:"Backline Improv Showcase",cat:"comedy",venue:"The Backline Comedy Theatre",date:"2026-02-21",time:"8 PM",price:"$10–15",url:"https://backlinecomedy.com",emoji:"😂",desc:"The house improv team takes audience suggestions and runs with them. Cheap drinks, big laughs.",tags:["Improv"]},
  {id:403,title:"Big Canvas Family Improv",cat:"comedy",venue:"Big Canvas Comedy",date:"2026-02-22",time:"2 PM",price:"$8–12",url:"https://bigcanvascomedy.com",emoji:"😄",desc:"Family-friendly short-form improv show in the Blackstone. All ages welcome.",tags:["Improv","Family"]},
  {id:404,title:"Funny Bone: National Headliner",cat:"comedy",venue:"Funny Bone Comedy Club",date:"2026-02-27",time:"7:30 PM",price:"$25–55",url:"https://omaha.funnybone.com",emoji:"🎙️",feat:true,desc:"Nationally touring comedian at Omaha's premier stand-up club. 21+ with 2-item minimum.",tags:["Stand-Up"]},
  {id:405,title:"Monday Open Mic Comedy",cat:"comedy",venue:"The Dubliner Pub",date:"2026-03-02",time:"8 PM",price:"Free",url:"https://dublinerpubomaha.com",emoji:"🎤",desc:"Weekly Monday night comedy open mic. Underground Irish pub in the Old Market.",tags:["Open Mic","Free"]},
  {id:406,title:"Backline Stand-Up Showcase",cat:"comedy",venue:"The Backline Comedy Theatre",date:"2026-02-28",time:"9 PM",price:"$10–15",url:"https://backlinecomedy.com",emoji:"😂",desc:"Local and regional stand-up comedians take the stage downtown.",tags:["Stand-Up"]},
];

const MO=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DN=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const fmt=ds=>{const d=new Date(ds+"T00:00:00");return`${MO[d.getMonth()]} ${d.getDate()}`;};
const fmtFull=ds=>{const d=new Date(ds+"T00:00:00");return`${DAYS[d.getDay()]}, ${MO[d.getMonth()]} ${d.getDate()}`;};
const toDS=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const CATS=[{id:"all",label:"All",dot:null},{id:"concerts",label:"Concerts",dot:"#5EC4B6"},{id:"sports",label:"Sports",dot:"#64B5F6"},{id:"comedy",label:"Comedy",dot:"#FFB74D"},{id:"festivals",label:"Festivals",dot:"#CE93D8"},{id:"family",label:"Family",dot:"#81C784"},{id:"arts",label:"Arts",dot:"#B39DDB"}];
const mapsDir=(lat,lng)=>`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
const mapsSearch=q=>`https://www.google.com/maps/search/${encodeURIComponent(q+' Omaha NE')}`;

/* ═══ HOOKS-SAFE COMPONENTS ═══ */
function ImgCard({src,children,h=130,grad}){
  const[ok,setOk]=useState(false);
  return(<div style={{position:"relative",height:h,background:grad||CG._,overflow:"hidden"}}>
    <img src={src} alt="" referrerPolicy="no-referrer" onLoad={()=>setOk(true)} onError={()=>{}} style={{width:"100%",height:"100%",objectFit:"cover",opacity:ok?0.55:0,transition:"opacity 0.5s"}}/>
    <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(20,22,24,0.05) 0%,rgba(20,22,24,0.88) 100%)"}}/>
    {children}
  </div>);
}

function FeatSlide({ev,isD,isT,favs,tog,setSel,playVideo}){
  const fav=favs.includes(ev.id);const accent=CA[ev.cat]||T.accent;const grad=CG[ev.cat]||CG._;
  return(
    <div onClick={()=>setSel(ev)} className="ecard" style={{background:grad,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",width:isD?360:isT?320:275,minWidth:isD?360:isT?320:275,flexShrink:0,cursor:"pointer",scrollSnapAlign:"start"}}>
      <ImgCard src={pickImg(ev)} h={isD?170:isT?150:130} grad={grad}>
        <div style={{position:"absolute",top:10,left:10,padding:"3px 10px",borderRadius:99,background:"rgba(20,22,24,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",gap:4}}>
          <div style={{width:5,height:5,borderRadius:99,background:accent}}/><span style={{fontSize:9,fontWeight:700,letterSpacing:1.5,color:accent,textTransform:"uppercase"}}>{fmtFull(ev.date).split(",")[0]}</span>
        </div>
        <button onClick={e=>{e.stopPropagation();tog(ev.id);}} className="hbtn" style={{position:"absolute",top:10,right:10,width:32,height:32,borderRadius:99,background:"rgba(20,22,24,0.5)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:fav?T.gold:T.textDim}}>{I.heart(fav?T.gold:T.textDim,16,fav)}</button>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 14px 12px"}}>
          <h3 style={{margin:0,fontSize:isD?18:16,fontWeight:600,color:T.textHi,letterSpacing:0.5,lineHeight:1.2}}>{ev.title}</h3>
        </div>
      </ImgCard>
      <div style={{padding:"12px 14px 14px"}}>
        <p style={{margin:0,fontSize:12,color:T.textBody,letterSpacing:0.4,lineHeight:1.45,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{ev.desc}</p>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10}}>
          <span style={{fontSize:17,fontWeight:300,color:T.textHi,letterSpacing:0.7}}>{ev.price==="TBD"&&ev.url&&ev.url!=="#"?"See Tickets →":ev.price}</span>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {ev.ytId&&<button onClick={e=>{e.stopPropagation();playVideo(ev);}} className="hbtn" style={{background:"rgba(232,54,79,0.15)",border:"none",borderRadius:99,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{I.play("#E8364F",10)}</button>}
            <span style={{fontSize:11,color:T.venue,letterSpacing:1}}>{ev.time}</span>
          </div>
        </div>
        <p style={{margin:"6px 0 0",fontSize:11,color:T.venue,letterSpacing:1.1,fontWeight:500}}>{ev.venue}</p>
      </div>
    </div>
  );
}

function VenueCard({v,cnt,isD,isT,i=0}){
  return(
    <div className="ecard" style={{background:CG._,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",marginBottom:10,animation:`cardIn 0.3s ${i*0.04}s both`}}>
      <ImgCard src={v.img} h={isD?155:isT?135:115} grad={CG._}>
        {cnt>0&&<div style={{position:"absolute",top:10,right:10,padding:"3px 11px",borderRadius:99,background:"rgba(94,196,182,0.15)",border:"1px solid rgba(94,196,182,0.2)"}}>
          <span style={{fontSize:10,fontWeight:700,color:T.accent,letterSpacing:0.8}}>{cnt} event{cnt>1?"s":""}</span>
        </div>}
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 14px 12px"}}>
          <h3 style={{margin:0,fontSize:isD?19:16,fontWeight:600,color:T.textHi,letterSpacing:0.5}}>{v.name}</h3>
          <p style={{margin:"2px 0 0",fontSize:11,color:T.venue,letterSpacing:1,fontWeight:500}}>{v.area} · {v.cap}{v.type?` · ${v.type}`:""}</p>
        </div>
      </ImgCard>
      <div style={{padding:"12px 14px 14px"}}>
        <p style={{margin:0,fontSize:12,color:T.textBody,letterSpacing:0.3,lineHeight:1.5}}>{v.desc}</p>
        <div style={{display:"flex",gap:7,marginTop:12}}>
          {v.url&&v.url!=="#"&&<a href={v.url} target="_blank" rel="noopener noreferrer" className="hbtn" style={{flex:1,padding:"9px 0",borderRadius:99,background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border}`,color:T.accent,fontSize:11,fontWeight:600,letterSpacing:1,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>{I.link(T.accent,12)} Website</a>}
          <a href={mapsDir(v.lat,v.lng)} target="_blank" rel="noopener noreferrer" className="hbtn" style={{flex:1,padding:"9px 0",borderRadius:99,background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border}`,color:T.textBody,fontSize:11,fontWeight:600,letterSpacing:1,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>{I.dir(T.textBody,12)} Directions</a>
        </div>
      </div>
    </div>
  );
}

/* ═══ EXPANDABLE EXPLORE SECTION ═══ */
function ExploreSection({section,isD,isM}){
  const[open,setOpen]=useState(false);
  return(
    <div style={{marginBottom:10,borderRadius:18,border:`1px solid ${T.border}`,background:CG._,overflow:"hidden"}}>
      <button onClick={()=>setOpen(!open)} className="ecard" style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"16px 16px",background:"transparent",border:"none",cursor:"pointer",color:T.text}}>
        <span style={{fontSize:20}}>{section.icon}</span>
        <div style={{flex:1,textAlign:"left"}}>
          <h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi,letterSpacing:0.6}}>{section.title}</h3>
          <p style={{margin:"2px 0 0",fontSize:11,color:T.textSec,letterSpacing:0.5}}>{section.items.length} places</p>
        </div>
        <div style={{transform:open?"rotate(90deg)":"rotate(0)",transition:"transform 0.25s"}}>{I.chev(T.textDim,18)}</div>
      </button>
      {open&&<div style={{padding:"0 12px 12px"}}>
        {section.items.map((item,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"13px 10px",borderRadius:14,background:i%2===0?"rgba(255,255,255,0.02)":"transparent",marginBottom:2}}>
            <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{section.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <h4 style={{margin:0,fontSize:14,fontWeight:600,color:T.textHi,letterSpacing:0.5}}>{item.name}</h4>
              <p style={{margin:"3px 0 0",fontSize:12,color:T.textBody,letterSpacing:0.3,lineHeight:1.4}}>{item.desc}</p>
              <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap"}}>
                {(item.tags||[]).map(t=><span key={t} style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:"rgba(255,255,255,0.04)",color:T.textSec,fontWeight:500,letterSpacing:0.5}}>{t}</span>)}
              </div>
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <a href={mapsDir(item.lat,item.lng)} target="_blank" rel="noopener noreferrer" className="hbtn" style={{padding:"5px 12px",borderRadius:99,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,color:T.textBody,fontSize:10,fontWeight:600,letterSpacing:0.8,textDecoration:"none",display:"flex",alignItems:"center",gap:4}}>{I.dir(T.textBody,11)} Directions</a>
                {item.url&&item.url!=="#"&&<a href={item.url} target="_blank" rel="noopener noreferrer" className="hbtn" style={{padding:"5px 12px",borderRadius:99,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,color:T.accent,fontSize:10,fontWeight:600,letterSpacing:0.8,textDecoration:"none",display:"flex",alignItems:"center",gap:4}}>{I.link(T.accent,11)} Info</a>}
              </div>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

/* ═══ VIDEO FACADE — lightweight thumbnail, loads iframe on play ═══ */
function VideoFacade({ytId,onPlay,h=200}){
  const thumb=`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return(
    <div onClick={onPlay} style={{position:"relative",width:"100%",height:h,borderRadius:14,overflow:"hidden",cursor:"pointer",background:"#000"}}>
      <img src={thumb} alt="" crossOrigin="anonymous" referrerPolicy="no-referrer" style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.85}} onError={e=>{e.target.style.display="none";}}/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at center,rgba(0,0,0,0.2) 0%,rgba(0,0,0,0.5) 100%)"}}/>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:56,height:56,borderRadius:99,background:"rgba(232,54,79,0.95)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(232,54,79,0.4)",transition:"transform 0.2s"}} className="hbtn">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" stroke="none"><polygon points="8,5 20,12 8,19"/></svg>
      </div>
      <div style={{position:"absolute",bottom:8,left:10,display:"flex",alignItems:"center",gap:5}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z" fill="#FF0000"/><polygon points="9.75,15.02 15.5,11.75 9.75,8.48" fill="#fff"/></svg>
        <span style={{fontSize:10,color:"rgba(255,255,255,0.75)",fontWeight:500,letterSpacing:0.5}}>Preview</span>
      </div>
    </div>
  );
}

/* ═══ STICKY MINI-PLAYER — docks to top when video is playing ═══ */
function StickyPlayer({video,onClose,isD,isT}){
  if(!video)return null;
  const mx=isD?860:isT?680:600;
  return(
    <div style={{position:"sticky",top:0,zIndex:90,background:"#0A0B0C",borderBottom:`1px solid ${T.border}`,animation:"fadeIn 0.25s"}}>
      <div style={{maxWidth:mx,margin:"0 auto",padding:isD?"0 32px":"0"}}>
        <div style={{position:"relative",width:"100%",aspectRatio:"16/9",maxHeight:isD?320:isT?260:220,background:"#000"}}>
          <iframe
            src={`https://www.youtube.com/embed/${video.ytId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{width:"100%",height:"100%",border:"none"}}
          />
          <button onClick={onClose} className="hbtn" style={{position:"absolute",top:8,right:8,width:36,height:36,borderRadius:99,background:"rgba(10,11,12,0.8)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(242,239,233,0.9)",fontSize:16,fontWeight:300,zIndex:2}}>✕</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px 10px"}}>
          <div style={{flex:1,minWidth:0}}>
            <p style={{margin:0,fontSize:13,fontWeight:600,color:T.textHi,letterSpacing:0.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{video.title}</p>
            <p style={{margin:"1px 0 0",fontSize:10,color:T.textSec,letterSpacing:0.8,fontWeight:500}}>{video.venue}{video.date?` · ${fmt(video.date)}`:""}</p>
          </div>
          <button onClick={onClose} className="hbtn" style={{padding:"5px 12px",borderRadius:99,background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border}`,color:T.textSec,cursor:"pointer",fontSize:10,fontWeight:600,letterSpacing:0.8}}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════ APP ════════════════════════════ */
export default function App(){
  const w=useW();const isM=w<600;const isT=w>=600&&w<960;const isD=w>=960;
  const[aiEvents,setAiEvents]=useState([]);
  const[tab,setTab]=useState("events");
  const[cat,setCat]=useState("all");
  const[subTag,setSubTag]=useState(null);
  const[sel,setSel]=useState(null);
  const[favs,setFavs]=useState([]);
  const[q,setQ]=useState("");
  const[selDays,setSelDays]=useState(()=>{const t=new Date();t.setHours(0,0,0,0);return[toDS(t)];});
  const[preset,setPreset]=useState("today");
  const[refreshing,setRefreshing]=useState(false);
  const[rStatus,setRStatus]=useState(null);
  const[lastRefresh,setLastRefresh]=useState(null);
  const[exploreQ,setExploreQ]=useState("");
  const[shareMsg,setShareMsg]=useState(false);
  const[venCat,setVenCat]=useState("all");
  const[activeVideo,setActiveVideo]=useState(null); // {ytId, title, venue, date}
  const playVideo=(ev)=>{if(ev.ytId)setActiveVideo({ytId:ev.ytId,title:ev.title,venue:ev.venue,date:ev.date});};

  const tog=id=>setFavs(p=>p.includes(id)?p.filter(f=>f!==id):[...p,id]);
  const today=new Date();today.setHours(0,0,0,0);
  /* Merge seed + ingested + AI-refreshed events, deduplicate */
  const seedKeys=new Set(EV.map(dedupeKey));
  const mergedIngested=INGESTED_EVENTS.filter(e=>!seedKeys.has(dedupeKey(e)));
  const all=[...EV,...mergedIngested,...aiEvents].filter(e=>new Date(e.date+"T23:59:59")>=today);
  const dateDays=Array.from({length:30},(_,i)=>{const d=new Date(today);d.setDate(d.getDate()+i);return d;});

  /* Preset handlers */
  const applyPreset=(p)=>{
    setPreset(p);setSubTag(null);
    if(p==="today"){setSelDays([toDS(today)]);}
    else if(p==="week"){setSelDays(dateDays.slice(0,7).map(d=>toDS(d)));}
    else if(p==="month"){setSelDays(dateDays.map(d=>toDS(d)));}
    else{setSelDays([toDS(today)]);}
  };

  const toggleDay=ds=>{
    setPreset(null);setSubTag(null);
    setSelDays(prev=>{if(prev.includes(ds)){const n=prev.filter(d=>d!==ds);return n.length?n:[ds];}return[...prev,ds];});
  };

  const dayFiltered=all.filter(e=>selDays.includes(e.date));
  const catFiltered=dayFiltered.filter(e=>cat==="all"||e.cat===cat);
  const tagFiltered=catFiltered.filter(e=>!subTag||(e.tags||[]).includes(subTag));
  const filtered=tagFiltered.filter(e=>!q||(e.title+e.venue+(e.tags||[]).join("")).toLowerCase().includes(q.toLowerCase()));
  const featured=dayFiltered.filter(e=>e.feat);
  const availTags=cat!=="all"?[...new Set(dayFiltered.filter(e=>e.cat===cat).flatMap(e=>e.tags||[]).filter(t=>t!=="Free"))]:[];
  const allCatTags=cat!=="all"?[...new Set(all.filter(e=>e.cat===cat).flatMap(e=>e.tags||[]).filter(t=>t!=="Free"))]:[];
  const dayCnts={};all.forEach(e=>{dayCnts[e.date]=(dayCnts[e.date]||0)+1;});
  const vCnt={};all.forEach(e=>{vCnt[e.venue]=(vCnt[e.venue]||0)+1;});

  const refresh=useCallback(async()=>{
    setRefreshing(true);setRStatus("Searching for new events...");
    try{const ds=new Date().toISOString().split("T")[0];
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:`Find upcoming events in Omaha NE. Today is ${ds}. Return ONLY a JSON array. Each: {"title":"...","cat":"sports|concerts|festivals|family|arts","venue":"...","date":"YYYY-MM-DD","time":"H:MM PM","price":"$X–$Y or Free","desc":"2 sentences","tags":["tag1"],"emoji":"emoji"}. 8-12 events. No markdown.`,messages:[{role:"user",content:`Find upcoming Omaha NE events next 2 months from ${ds}. All categories.`}],tools:[{type:"web_search_20250305",name:"web_search"}]})});
      const data=await r.json();const text=data.content?.map(i=>i.text||"").filter(Boolean).join("\n")||"";
      const jm=text.match(/\[[\s\S]*\]/);
      if(jm){const parsed=JSON.parse(jm[0]);const ek=new Set(all.map(e=>`${e.title.toLowerCase().trim()}|${e.date}`));
        const ne=parsed.filter(e=>!ek.has(`${(e.title||"").toLowerCase().trim()}|${e.date}`)).map((e,i)=>({...e,id:9000+Date.now()+i,url:"#",feat:false,tags:e.tags||[]}));
        setAiEvents(prev=>[...prev.filter(e=>new Date(e.date+"T23:59:59")>=today),...ne]);setRStatus(`Found ${ne.length} new events`);}
      else setRStatus("Everything up to date");setLastRefresh(new Date());
    }catch{setRStatus("Could not refresh");}
    setRefreshing(false);setTimeout(()=>setRStatus(null),4000);
  },[]);

  const fmtRel=d=>{if(!d)return"";const s=Math.floor((Date.now()-d.getTime())/1000);if(s<60)return"just now";if(s<3600)return`${Math.floor(s/60)}m ago`;return`${Math.floor(s/3600)}h ago`;};
  const mx=isD?860:isT?680:600;const px=isD?32:isT?24:16;const sec={maxWidth:mx,margin:"0 auto",padding:`0 ${px}px`};
  const Head=({text,count,mt=24})=>(<div style={{display:"flex",alignItems:"baseline",gap:10,margin:`${mt}px 0 10px`}}><h2 style={{fontSize:isD?13:12,fontWeight:600,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:0}}>{text}</h2>{count!=null&&<span style={{fontSize:11,color:T.textDim,letterSpacing:1}}>{count}</span>}</div>);

  const showPrice=(ev)=>ev.price==="TBD"&&ev.url&&ev.url!=="#"?"See Tickets →":ev.price;

  const EventCard=({ev,i=0})=>{
    const fav=favs.includes(ev.id),free=ev.price?.includes("Free"),accent=CA[ev.cat]||T.accent,grad=CG[ev.cat]||CG._,icon=CATICON[ev.cat];
    return(
      <div onClick={()=>setSel(ev)} className="ecard" style={{background:grad,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"14px 14px 16px":"16px 20px 18px",marginBottom:8,cursor:"pointer",animation:`cardIn 0.3s ${i*0.03}s both`}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:isM?11:13}}>
          <div style={{width:isM?40:44,height:isM?40:44,borderRadius:13,background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{icon?icon(accent,isM?18:20):<span style={{fontSize:isM?18:20}}>{ev.emoji}</span>}</div>
          <div style={{flex:1,minWidth:0}}>
            <h3 style={{margin:0,fontSize:isD?17:15,fontWeight:600,color:T.textHi,letterSpacing:0.5,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.title}</h3>
            <p style={{margin:"2px 0 0",fontSize:11,fontWeight:600,letterSpacing:1.6,textTransform:"uppercase",color:accent}}>{fmtFull(ev.date).split(",")[0]} · {ev.time}</p>
          </div>
          {I.chev(T.textDim,18)}
        </div>
        <div style={{marginTop:9,marginLeft:isM?51:57}}>
          <p style={{margin:0,fontSize:13,color:T.textBody,letterSpacing:0.3,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{ev.desc}</p>
          <div style={{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}}>
            {(ev.tags||[]).slice(0,3).map(t=><span key={t} style={{fontSize:9,padding:"3px 9px",borderRadius:99,background:"rgba(255,255,255,0.05)",color:T.textSec,fontWeight:500,letterSpacing:0.6}}>{t}</span>)}
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:isD?21:17,fontWeight:300,color:T.textHi,letterSpacing:0.7}}>{showPrice(ev)}</span>
              {free&&<span style={{fontSize:9,fontWeight:700,letterSpacing:1.5,color:T.green,background:"rgba(125,212,160,0.1)",padding:"2px 8px",borderRadius:99}}>FREE</span>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              {ev.ytId&&<button onClick={e=>{e.stopPropagation();playVideo(ev);}} className="hbtn" style={{background:"rgba(232,54,79,0.12)",border:"1px solid rgba(232,54,79,0.25)",borderRadius:99,padding:"5px 11px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:"#E8364F"}}>
                {I.play("#E8364F",10)}<span style={{fontSize:10,letterSpacing:0.6,fontWeight:600}}>Play</span>
              </button>}
              <button onClick={e=>{e.stopPropagation();tog(ev.id);}} className="hbtn" style={{background:"rgba(255,255,255,0.05)",border:"none",borderRadius:99,padding:"5px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:fav?T.gold:T.textSec}}>
                {I.heart(fav?T.gold:T.textSec,13,fav)}<span style={{fontSize:10,letterSpacing:0.6,fontWeight:500}}>{fav?"Saved":"Save"}</span>
              </button>
            </div>
          </div>
          <p style={{margin:"6px 0 0",fontSize:11,color:T.venue,letterSpacing:1.2,textTransform:"uppercase",fontWeight:500}}>{ev.venue}</p>
        </div>
      </div>
    );
  };

  const tabs=[{id:"events",icon:I.events,label:"Events"},{id:"explore",icon:I.explore,label:"Explore"},{id:"venues",icon:I.venues,label:"Venues"},{id:"saved",icon:I.saved,label:"Saved"}];

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:T.sans,paddingBottom:isD?40:96}}>


      {/* HERO — parallax skyline */}
      <div style={{position:"relative",height:isD?280:isT?250:220,overflow:"hidden",background:"linear-gradient(135deg,#1a1510,#1e1c18 40%,#1a1814 70%,#161412)"}}>
        <div style={{position:"absolute",inset:0,top:"-20%",height:"140%",willChange:"transform"}}>
          <img src="/skyline.jpg" alt="Omaha skyline at sunset" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"left 40%",filter:"brightness(0.5) saturate(0.85)",transform:"scale(1.05)"}} onError={e=>{e.target.style.display="none";}}/>
        </div>
        <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,rgba(20,22,24,0.05) 0%,rgba(20,22,24,0.35) 40%,rgba(20,22,24,0.85) 75%,${T.bg} 100%)`,zIndex:1}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(20,22,24,0.3) 0%,transparent 60%)",zIndex:1}}/>
        <div style={{position:"relative",zIndex:2,height:"100%",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:`0 ${px}px ${isD?24:18}px`,maxWidth:mx,margin:"0 auto"}}>
          <p style={{margin:"0 0 5px",fontSize:10,fontWeight:600,color:T.accent,letterSpacing:3.5,textTransform:"uppercase"}}>Omaha · Council Bluffs</p>
          <h1 style={{fontSize:isD?42:isT?36:28,fontWeight:300,margin:0,color:T.text,letterSpacing:1.5,lineHeight:1.1}}>
            <span style={{fontWeight:700,letterSpacing:3}}>GO</span><span style={{color:T.accent,margin:"0 6px",fontWeight:200}}>:</span><span style={{fontWeight:300}}>Guide to Omaha</span>
          </h1>
          {lastRefresh&&<p style={{fontSize:11,color:T.textDim,margin:"6px 0 0",letterSpacing:0.6}}>Updated {fmtRel(lastRefresh)}</p>}
        </div>
      </div>

      {/* ═══ STICKY VIDEO PLAYER ═══ */}
      <StickyPlayer video={activeVideo} onClose={()=>setActiveVideo(null)} isD={isD} isT={isT}/>

      {/* ═══ PRESET BUTTONS + DATE SLIDER ═══ */}
      <div style={{...sec,marginTop:10}}>
        {/* Presets: Today / This Week / This Month / Clear */}
        <div style={{display:"flex",gap:6,marginBottom:16}}>
          {[{id:"today",label:"Today"},{id:"week",label:"This Week"},{id:"month",label:"This Month"},{id:"clear",label:"Clear"}].map(p=>{
            const active=preset===p.id||(p.id==="clear"&&!preset&&selDays.length===1&&selDays[0]===toDS(today));
            return(<button key={p.id} onClick={()=>applyPreset(p.id==="clear"?"today":p.id)} className="pill" style={{
              padding:"7px 16px",borderRadius:99,border:active?`1px solid ${T.accent}`:"1px solid rgba(235,230,220,0.25)",
              background:active?"rgba(94,196,182,0.15)":"rgba(235,230,220,0.12)",
              color:active?T.accent:"rgba(235,230,220,0.85)",cursor:"pointer",fontSize:11,fontWeight:active?600:500,letterSpacing:1,
            }}>{p.label}</button>);
          })}
        </div>
        {/* Date strip */}
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:6,position:"relative",scrollbarWidth:"none",msOverflowStyle:"none"}}>
          {dateDays.map(d=>{
            const ds=toDS(d);const isTd=d.getTime()===today.getTime();const active=selDays.includes(ds);const cnt=dayCnts[ds]||0;
            return(<button key={ds} onClick={()=>toggleDay(ds)} className="daybtn" style={{
              padding:"7px 0",borderRadius:12,display:"flex",flexDirection:"column",alignItems:"center",gap:1,
              minWidth:isD?54:isT?50:46,cursor:"pointer",position:"relative",
              background:active?"rgba(94,196,182,0.12)":"rgba(255,255,255,0.02)",
              boxShadow:active?`0 0 14px ${T.accentGlow}`:"none",
              border:active?`1.5px solid rgba(94,196,182,0.45)`:`1px solid ${isTd?T.borderHi:T.border}`,
              outline:"none",transition:"all 0.2s",
            }}>
              <span style={{fontSize:9,fontWeight:600,letterSpacing:1.2,textTransform:"uppercase",color:active?T.accent:isTd?T.textBody:T.textDim}}>{DN[d.getDay()]}</span>
              <span style={{fontSize:isD?18:16,fontWeight:active?600:300,color:active?T.textHi:isTd?T.text:T.textSec,lineHeight:1.3}}>{d.getDate()}</span>
              {cnt>0&&<div style={{width:4,height:4,borderRadius:99,background:active?T.accent:T.textDim,marginTop:1}}/>}
            </button>);
          })}
        </div>
        {selDays.length>1&&<p style={{fontSize:10,color:T.accent,letterSpacing:0.8,marginTop:3,fontWeight:500}}>{selDays.length} days selected · {dayFiltered.length} events</p>}
      </div>

      {rStatus&&<div style={sec}><div style={{marginTop:8,padding:"9px 14px",borderRadius:12,background:T.accentSoft,border:"1px solid rgba(94,196,182,0.15)",fontSize:12,fontWeight:500,color:T.accent,letterSpacing:0.6,display:"flex",alignItems:"center",gap:7}}>{refreshing&&<span style={{display:"inline-block",width:12,height:12,border:"2px solid transparent",borderTop:`2px solid ${T.accent}`,borderRadius:99,animation:"spin 0.8s linear infinite"}}/>}{rStatus}</div></div>}

      {/* ═══ EVENTS TAB ═══ */}
      {tab==="events"&&<div style={sec}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,marginTop:8}}>
          {I.search(T.textDim,14)}
          <input type="text" placeholder="Search events..." value={q} onChange={e=>setQ(e.target.value)} style={{background:"transparent",border:"none",outline:"none",color:T.text,fontSize:13,fontFamily:T.sans,width:"100%",letterSpacing:0.5}}/>
          {q&&<button onClick={()=>setQ("")} className="hbtn" style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:99,width:20,height:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:T.textSec}}>✕</button>}
        </div>

        {/* Category pills with icons */}
        <div style={{display:"flex",gap:5,overflowX:"auto",marginTop:8,paddingBottom:2,position:"relative",scrollbarWidth:"none",msOverflowStyle:"none"}}>
          {CATS.map(c=>{const active=cat===c.id;const cnt=dayFiltered.filter(e=>c.id==="all"||e.cat===c.id).length;const icon=CATICON[c.id];return(
            <button key={c.id} onClick={()=>{setCat(c.id);setSubTag(null);}} className="pill" style={{padding:"6px 13px",borderRadius:99,display:"flex",alignItems:"center",gap:5,background:active?"rgba(94,196,182,0.15)":"rgba(235,230,220,0.12)",border:active?`1px solid ${T.accent}`:"1px solid rgba(235,230,220,0.25)",color:active?T.accent:"rgba(235,230,220,0.85)",cursor:"pointer",fontSize:11,fontWeight:active?600:500,whiteSpace:"nowrap",letterSpacing:1.2,textTransform:"uppercase"}}>
              {icon?icon(active?c.dot||T.accent:"rgba(235,230,220,0.6)",13):null}{c.label}<span style={{fontSize:10,color:active?T.accent:"rgba(235,230,220,0.5)",fontWeight:400}}>({cnt})</span>
            </button>);})}
        </div>

        {/* Sub-tags */}
        {cat!=="all"&&allCatTags.length>0&&<div style={{display:"flex",gap:4,overflowX:"auto",marginTop:6,position:"relative",scrollbarWidth:"none",msOverflowStyle:"none"}}>
          <button onClick={()=>setSubTag(null)} className="pill" style={{padding:"4px 10px",borderRadius:99,background:!subTag?"rgba(94,196,182,0.15)":"rgba(235,230,220,0.10)",border:!subTag?`1px solid ${T.accent}`:"1px solid rgba(235,230,220,0.2)",color:!subTag?T.accent:"rgba(235,230,220,0.7)",cursor:"pointer",fontSize:10,fontWeight:!subTag?600:500,letterSpacing:0.8,whiteSpace:"nowrap"}}>All</button>
          {allCatTags.map(tag=>{const avail=availTags.includes(tag);const active=subTag===tag;return(<button key={tag} onClick={()=>avail&&setSubTag(active?null:tag)} className="pill" style={{padding:"4px 10px",borderRadius:99,background:active?"rgba(94,196,182,0.15)":"rgba(235,230,220,0.10)",border:active?`1px solid ${T.accent}`:"1px solid rgba(235,230,220,0.2)",color:active?T.accent:avail?"rgba(235,230,220,0.7)":"rgba(235,230,220,0.15)",cursor:avail?"pointer":"default",opacity:avail?1:0.5,fontSize:10,fontWeight:active?600:500,letterSpacing:0.8,whiteSpace:"nowrap"}}>{tag}</button>);})}
        </div>}

        {!q&&featured.length>0&&cat==="all"&&!subTag&&<>
          <Head text="Featured" count={featured.length} mt={16}/>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,position:"relative",scrollbarWidth:"none",msOverflowStyle:"none",scrollSnapType:"x mandatory"}}>
            {featured.map(ev=><FeatSlide key={ev.id} ev={ev} isD={isD} isT={isT} favs={favs} tog={tog} setSel={setSel} playVideo={playVideo}/>)}
          </div>
        </>}

        <Head text={cat==="all"?(q?"Results":"Events"):CATS.find(c=>c.id===cat)?.label+(subTag?` · ${subTag}`:"")} count={filtered.length} mt={16}/>
        {filtered.length===0&&<div style={{textAlign:"center",padding:"36px 0"}}><p style={{fontSize:28,marginBottom:6,opacity:0.12}}>{I.search(T.textDim,28)}</p><p style={{fontSize:12,color:T.textDim,letterSpacing:1}}>No events found</p></div>}
        {filtered.map((e,i)=><EventCard key={e.id} ev={e} i={i}/>)}

        <div style={{marginTop:16,padding:"13px 14px",borderRadius:16,background:CG._,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center"}}>{I.refresh(T.accent,16)}</div>
          <div style={{flex:1}}><p style={{margin:0,fontSize:13,fontWeight:500,color:T.text,letterSpacing:0.5}}>Nightly Refresh</p><p style={{margin:"2px 0 0",fontSize:10,color:T.textDim,letterSpacing:0.8}}>Auto-updates at 11 PM</p></div>
          <button onClick={()=>refresh()} disabled={refreshing} className="hbtn" style={{padding:"7px 14px",borderRadius:99,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,color:T.accent,cursor:refreshing?"wait":"pointer",fontSize:11,fontWeight:600,letterSpacing:1}}>{refreshing?"···":"Refresh"}</button>
        </div>
      </div>}

      {/* ═══ EXPLORE TAB ═══ */}
      {tab==="explore"&&<div style={sec}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,marginTop:12}}>
          {I.search(T.textDim,14)}
          <input type="text" placeholder="Search places, activities..." value={exploreQ} onChange={e=>setExploreQ(e.target.value)} style={{background:"transparent",border:"none",outline:"none",color:T.text,fontSize:13,fontFamily:T.sans,width:"100%",letterSpacing:0.5}}/>
        </div>
        <Head text="Explore Omaha" mt={16}/>
        {EXPLORE.filter(s=>!exploreQ||s.title.toLowerCase().includes(exploreQ.toLowerCase())||s.items.some(i=>i.name.toLowerCase().includes(exploreQ.toLowerCase()))).map(s=>
          <ExploreSection key={s.id} section={exploreQ?{...s,items:s.items.filter(i=>i.name.toLowerCase().includes(exploreQ.toLowerCase())||i.desc.toLowerCase().includes(exploreQ.toLowerCase())||!exploreQ)}:s} isD={isD} isM={isM}/>
        )}
      </div>}

      {/* ═══ VENUES TAB ═══ */}
      {tab==="venues"&&<div style={sec}>
        {/* Venue category filters */}
        {(()=>{const VCATS=[{id:"all",label:"All"},{id:"Arena",label:"Arenas"},{id:"Performing Arts",label:"Performing Arts"},{id:"Indie / Club",label:"Indie / Club"},{id:"Comedy Club",label:"Comedy"},{id:"Bar / Venue",label:"Bars & Restaurants"},{id:"Museum / Attraction",label:"Museums"},{id:"Outdoor",label:"Outdoor"}];
        const fv=venCat==="all"?VENUES:VENUES.filter(v=>v.type===venCat);
        return(<>
          <div style={{display:"flex",gap:5,overflowX:"auto",marginTop:12,paddingBottom:2,WebkitOverflowScrolling:"touch"}}>
            {VCATS.map(c=>{const active=venCat===c.id;const cnt=c.id==="all"?VENUES.length:VENUES.filter(v=>v.type===c.id).length;return(
              <button key={c.id} onClick={()=>setVenCat(c.id)} className="pill" style={{padding:"6px 13px",borderRadius:99,background:active?"rgba(94,196,182,0.15)":"rgba(235,230,220,0.12)",border:active?`1px solid ${T.accent}`:"1px solid rgba(235,230,220,0.25)",color:active?T.accent:"rgba(235,230,220,0.85)",cursor:"pointer",fontSize:11,fontWeight:active?600:500,whiteSpace:"nowrap",letterSpacing:1.2,textTransform:"uppercase"}}>
                {c.label}<span style={{fontSize:10,color:active?T.accent:"rgba(235,230,220,0.5)",fontWeight:400,marginLeft:4}}>({cnt})</span>
              </button>);})}
          </div>
          <Head text={venCat==="all"?"Venues":VCATS.find(c=>c.id===venCat)?.label||"Venues"} count={fv.length} mt={14}/>
          {isD?<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{fv.map((v,i)=><VenueCard key={v.id} v={v} cnt={vCnt[v.name]||0} isD={isD} isT={isT} i={i}/>)}</div>
            :fv.map((v,i)=><VenueCard key={v.id} v={v} cnt={vCnt[v.name]||0} isD={isD} isT={isT} i={i}/>)}
        </>);})()}
      </div>}

      {/* ═══ SAVED TAB ═══ */}
      {tab==="saved"&&<div style={sec}>
        <Head text="Saved" count={favs.length} mt={12}/>
        {favs.length===0?(<div style={{textAlign:"center",padding:"44px 0"}}>{I.heart(T.textDim,32)}<p style={{fontSize:12,color:T.textDim,letterSpacing:1,marginTop:10}}>Nothing saved yet</p><button onClick={()=>setTab("events")} className="hbtn" style={{marginTop:14,padding:"9px 22px",borderRadius:99,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,color:T.accent,cursor:"pointer",fontSize:11,fontWeight:600,letterSpacing:1}}>BROWSE EVENTS</button></div>)
          :(all.filter(e=>favs.includes(e.id)).sort((a,b)=>new Date(a.date)-new Date(b.date)).map((e,i)=><EventCard key={e.id} ev={e} i={i}/>))}
      </div>}

      {/* ═══ DETAIL MODAL ═══ */}
      {sel&&(<div onClick={()=>setSel(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(12px)",zIndex:100,display:"flex",alignItems:isD?"center":"flex-end",justifyContent:"center",animation:"fadeIn 0.2s"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:T.surface,borderRadius:isD?22:"22px 22px 0 0",maxWidth:isD?500:560,width:"100%",maxHeight:isD?"85vh":"92vh",overflow:"auto",animation:isD?"zoomIn 0.3s cubic-bezier(0.16,1,0.3,1)":"sheetUp 0.4s cubic-bezier(0.16,1,0.3,1)",margin:isD?"0 20px":0}}>
          {!isD&&<div style={{width:32,height:3,borderRadius:99,background:T.textDim,margin:"10px auto 4px"}}/>}
          <div style={{position:"relative",margin:isD?"12px 16px 0":"6px 12px 0",borderRadius:16,overflow:"hidden",height:isD?230:isT?200:170,background:CG[sel.cat]||CG._}}>
            <img src={pickImg(sel)} alt="" referrerPolicy="no-referrer" onError={e=>{e.target.style.display="none";}} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(20,22,24,0.1) 0%,rgba(20,22,24,0.9) 100%)"}}/>
            <button onClick={()=>setSel(null)} className="hbtn" style={{position:"absolute",top:12,right:12,width:42,height:42,borderRadius:99,background:"rgba(30,32,36,0.7)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.15)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(242,239,233,0.85)",zIndex:2,fontSize:18,fontWeight:300}}>✕</button>
            <div style={{position:"absolute",top:12,left:12,display:"flex",gap:8,zIndex:2}}>
              <button onClick={()=>tog(sel.id)} className="hbtn" style={{width:42,height:42,borderRadius:99,background:"rgba(30,32,36,0.7)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.15)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{I.heart(favs.includes(sel.id)?T.gold:"rgba(242,239,233,0.85)",20,favs.includes(sel.id))}</button>
              <button onClick={()=>{const txt=`${sel.title}\n${fmtFull(sel.date)} · ${sel.time}\n${sel.venue}\n${sel.price}\n\n${sel.desc}${sel.url&&sel.url!=="#"?"\n\n"+sel.url:""}`;if(navigator.share){navigator.share({title:sel.title,text:txt}).catch(()=>{});}else{navigator.clipboard?.writeText(txt);setShareMsg(true);setTimeout(()=>setShareMsg(false),2000);}}} className="hbtn" style={{width:42,height:42,borderRadius:99,background:"rgba(30,32,36,0.7)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.15)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{I.share("rgba(242,239,233,0.85)",20)}</button>
            </div>
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 18px 14px"}}>
              <p style={{margin:"0 0 3px",fontSize:10,fontWeight:700,color:CA[sel.cat]||T.accent,letterSpacing:2.5,textTransform:"uppercase"}}>{sel.cat}</p>
              <h2 style={{fontSize:isD?24:20,fontWeight:600,margin:0,color:T.textHi,letterSpacing:0.5,lineHeight:1.2}}>{sel.title}</h2>
            </div>
          </div>
          <div style={{padding:isD?"18px 22px 24px":"14px 18px 24px"}}>
            <p style={{fontSize:14,color:T.textBody,lineHeight:1.7,margin:"0 0 16px",letterSpacing:0.3}}>{sel.desc}</p>
            {sel.ytId&&<div style={{marginBottom:16}}>
              <VideoFacade ytId={sel.ytId} h={isD?220:isT?190:160} onPlay={()=>{playVideo(sel);setSel(null);}}/>
            </div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:16}}>
              {[{l:"Date",v:fmtFull(sel.date)},{l:"Time",v:sel.time},{l:"Venue",v:sel.venue},{l:"Price",v:showPrice(sel)}].map(r=>(
                <div key={r.l} style={{padding:"10px 12px",borderRadius:12,background:CG._,border:`1px solid ${T.border}`}}>
                  <p style={{margin:0,fontSize:9,color:T.textDim,fontWeight:600,letterSpacing:1.8,textTransform:"uppercase"}}>{r.l}</p>
                  <p style={{margin:"4px 0 0",fontSize:13,fontWeight:500,color:T.textHi,letterSpacing:0.3}}>{r.v}</p>
                </div>))}
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:20}}>
              {(sel.tags||[]).map(t=><span key={t} style={{fontSize:10,padding:"4px 12px",borderRadius:99,background:"rgba(255,255,255,0.05)",color:T.textSec,fontWeight:500,letterSpacing:0.6}}>{t}</span>)}
            </div>
            {sel.url&&sel.url!=="#"&&<a href={sel.url} target="_blank" rel="noopener noreferrer" className="cta" style={{display:"block",width:"100%",padding:"14px 0",borderRadius:99,background:T.accent,color:T.bg,fontSize:13,fontWeight:700,textAlign:"center",textDecoration:"none",letterSpacing:1.8,textTransform:"uppercase"}}>{sel.url.includes("/event")||sel.url.includes("/ticket")||sel.url.includes("ticketmaster")||sel.url.includes("etix.com")||sel.url.includes("axs.com")||sel.url.includes("eventbrite")?"Get Tickets":"Visit Venue"}</a>}
            {shareMsg&&<p style={{textAlign:"center",marginTop:8,fontSize:11,color:T.accent,letterSpacing:1,fontWeight:500,animation:"fadeIn 0.2s"}}>Event info copied to clipboard!</p>}
          </div>
        </div>
      </div>)}

      {/* ═══ FOOTER ═══ */}
      <div style={{maxWidth:mx,margin:"32px auto 100px",padding:`0 ${px}px`,textAlign:"center"}}>
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:16}}>
          <p style={{fontSize:10,color:T.textDim,letterSpacing:0.6,lineHeight:1.7,margin:"0 0 8px"}}>
            {all.length} events across {new Set(all.map(e=>e.venue)).size} venues · Updated {BUILD_META.lastPipeline?new Date(BUILD_META.lastPipeline).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}):"recently"}
            {lastRefresh&&` · Live refresh ${fmtRel(lastRefresh)}`}
          </p>
          <p style={{fontSize:9,color:"rgba(235,230,220,0.25)",letterSpacing:0.5,lineHeight:1.6,margin:0}}>
            Some ticket links may earn a small commission at no extra cost to you.
          </p>
          <p style={{fontSize:9,color:"rgba(235,230,220,0.2)",letterSpacing:0.4,margin:"6px 0 0"}}>
            © {new Date().getFullYear()} GO: Guide to Omaha
          </p>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,padding:"0 14px max(8px, env(safe-area-inset-bottom))",display:"flex",justifyContent:"center"}}>
        <div style={{background:"rgba(27,29,33,0.93)",backdropFilter:"blur(22px)",borderRadius:16,display:"flex",justifyContent:"space-around",padding:"4px 2px",width:"100%",maxWidth:isD?480:isT?400:360,border:`1px solid ${T.border}`}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:tab===t.id?"rgba(94,196,182,0.08)":"transparent",border:"none",cursor:"pointer",padding:isD?"8px 22px":"7px 10px",borderRadius:11,minWidth:isD?76:isT?58:48,color:tab===t.id?T.accent:T.textDim,transition:"all 0.2s"}}>
              <span style={{position:"relative"}}>{t.icon(tab===t.id?T.accent:T.textDim,isD?20:17)}{t.id==="saved"&&favs.length>0&&<span style={{position:"absolute",top:-4,right:-8,background:T.accent,color:T.bg,fontSize:8,fontWeight:700,borderRadius:99,padding:"1px 4px",minWidth:12,textAlign:"center"}}>{favs.length}</span>}</span>
              <span style={{fontSize:isD?10:9,fontWeight:tab===t.id?600:400,letterSpacing:0.8,textTransform:"uppercase"}}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
