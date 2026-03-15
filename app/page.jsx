"use client";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { TRAIL_MAP_DATA } from "./trail-data";
const TrailMap=dynamic(()=>import("./TrailMap"),{ssr:false,loading:()=>(
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"80vh",color:"rgba(242,239,233,.58)"}}>
    <div style={{textAlign:"center"}}>
      <div style={{width:32,height:32,border:"3px solid rgba(94,196,182,.3)",borderTop:"3px solid #5EC4B6",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 12px"}}/>
      <p style={{fontSize:12,letterSpacing:1}}>Loading trail map...</p>
    </div>
  </div>
)});
const EventDetail=dynamic(()=>import("./EventDetail"),{ssr:false,loading:()=>(
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"80vh",color:"rgba(242,239,233,.58)"}}>
    <div style={{textAlign:"center"}}>
      <div style={{width:32,height:32,border:"3px solid rgba(94,196,182,.3)",borderTop:"3px solid #5EC4B6",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 12px"}}/>
      <p style={{fontSize:12,letterSpacing:1}}>Loading event...</p>
    </div>
  </div>
)});
import { INGESTED_EVENTS } from "./events-data";

/* ═══════════════════════════════════════════════════════════
   GO: GUIDE TO OMAHA — DESIGN SYSTEM NOTES
   ═══════════════════════════════════════════════════════════

   HEADER / HERO SIZING
   ─────────────────────
   FULL HERO (50-55vh, 320-560px):
     Tabs: Today, Events
     Full animated skyline with sun/moon arc, stars, weather
     City filters, large "GO: Guide to Omaha" title (28-44px)
     All interactive elements (time slider, weather, city toggles)

   COMPACT HERO (95-135px) — ALL INTERIOR PAGES:
     Tabs: Explore, Saved, Venues, Neighborhoods — everything except Today/Events
     Shows only the bottom third of the skyline SVG
     The crop line should sit right above the church steeple —
       buildings, windows, and "GO: Guide to Omaha" text remain visible
     SVG uses preserveAspectRatio="xMidYMax slice" so YMax anchors
       to the bottom of the viewBox, naturally showing the base/buildings
     Skyline div fills 100% of compact height (vs 78% in full hero)
     "GO: Guide to Omaha" title shrinks to 16-20px, positioned at bottom
     No stars, sun/moon, horizon glow, or weather — just sky gradient + silhouettes
     Bottom gradient overlay reduced to 35px (vs 60px full)
     Smooth CSS transition between full ↔ compact on tab switch

     Heights by breakpoint:
       Desktop (≥960):  120px
       Tablet (600-959): 105px
       Mobile (<600):    95px

     This compact header is intentionally minimal — a brand-presence
     strip that keeps GO: visible without taking real estate from content.
     Content sections begin immediately below with their own headers.

   TYPOGRAPHY — "GO FONT" PATTERN
   ──────────────────────────────
     The "Guide to Omaha" text uses:  fontWeight 300, letterSpacing 1.5
     The "GO" wordmark uses:          fontWeight 800, letterSpacing 2-3
     The teal colon separator uses:   fontWeight 200, color T.accent

     This light/elegant type treatment is reused for:
     ✦ Neighborhood names on detail pages (fontWeight 300, letterSpacing 1.5)
     ✦ Directory section headers ("[Hood] Directory" — fontWeight 300)
     ✦ Any large decorative headline that should feel editorial, not UI

     Standard section headers (Head component) remain:
       fontSize 12, fontWeight 600, letterSpacing 2.5, uppercase, color T.textSec

   NEIGHBORHOOD PAGES
   ──────────────────
     Own hero image (220-280px) rendered below the compact skyline header
     Neighborhood name: fontWeight 300, letterSpacing 1.5
     — matches "Guide to Omaha" text treatment (light, open, elegant)
     Each neighborhood has a unique accent color used for tags, pills, CTAs
     Directory filterable by: Eat / Drink / Coffee & Sweets / Shop / Do

   ═══════════════════════════════════════════════════════════ */

const T = {
  bg: "#141618", surface: "#1B1D21",
  border: "rgba(255,255,255,0.08)", borderHi: "rgba(255,255,255,0.18)",
  text: "#F2EFE9", textHi: "#FFFFFF", textBody: "rgba(242,239,233,0.82)",
  textSec: "rgba(242,239,233,0.58)", textDim: "rgba(242,239,233,0.32)",
  venue: "rgba(242,239,233,0.72)", accent: "#5EC4B6",
  accentSoft: "rgba(94,196,182,0.10)", accentGlow: "rgba(94,196,182,0.30)",
  gold: "#D4AD65", green: "#7DD4A0", red: "#E8364F",
  sans: "'Inter',system-ui,-apple-system,sans-serif",
};
const CG = {
  concerts: "linear-gradient(135deg,#1A2E32 0%,#213740 60%,#1C3035 100%)",
  sports: "linear-gradient(135deg,#1A2430 0%,#21303E 60%,#1C2836 100%)",
  comedy: "linear-gradient(135deg,#2D2518 0%,#3A2F1E 60%,#332A1C 100%)",
  trail: "linear-gradient(135deg,#1A2B20 0%,#233D2A 60%,#1E3224 100%)",
  hood: "linear-gradient(135deg,#22201A 0%,#2E2A20 60%,#282418 100%)",
  sunset: "linear-gradient(135deg,#2A1E1A 0%,#3A2818 60%,#302216 100%)",
  park: "linear-gradient(135deg,#1C2E20 0%,#213828 60%,#1D3022 100%)",
  water: "linear-gradient(135deg,#1A2730 0%,#1E3038 60%,#1A2830 100%)",
  _: "linear-gradient(135deg,#1E2024 0%,#262A2E 60%,#202428 100%)",
};
const CA = { concerts:"#5EC4B6", sports:"#64B5F6", comedy:"#FFB74D", family:"#81C784", arts:"#CE93D8", festivals:"#FF8A65" };

/* ═══ COLOR MATH ═══ */
const h2r=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const r2h=([r,g,b])=>"#"+[r,g,b].map(c=>Math.round(Math.min(255,Math.max(0,c))).toString(16).padStart(2,"0")).join("");
const mc=(a,b,t)=>{const[r1,g1,b1]=h2r(a),[r2,g2,b2]=h2r(b);return r2h([r1+(r2-r1)*t,g1+(g2-g1)*t,b1+(b2-b1)*t])};
const mx=(a,b,t)=>a+(b-a)*t;

/* ═══ SKY STOPS ═══ */
const STOPS=[
  {t:0,  s1:"#4A7CB5",s2:"#D4956B",s3:"#F4C97E",bldg:"#000000",sunY:.74,sunC:"#FFD07A",sunSz:38,sunOp:1,  moonOp:0, starOp:0, winOp:0,  glow:"#FFD07A"},
  {t:25, s1:"#5B9BD5",s2:"#87CEEB",s3:"#B8DCF0",bldg:"#000000",sunY:.18,sunC:"#FFFBE8",sunSz:28,sunOp:.9,moonOp:0, starOp:0, winOp:0,  glow:"#FFFBE8"},
  {t:50, s1:"#C27840",s2:"#E6956B",s3:"#F0C27A",bldg:"#000000",sunY:.68,sunC:"#FF9944",sunSz:44,sunOp:1,  moonOp:0, starOp:0, winOp:0,  glow:"#FF9944"},
  {t:75, s1:"#2A1B4E",s2:"#5C3470",s3:"#C26848",bldg:"#000000",sunY:.92,sunC:"#D84420",sunSz:50,sunOp:.5,moonOp:.3,starOp:.2,winOp:.5,glow:"#D84420"},
  {t:90, s1:"#0C1628",s2:"#122240",s3:"#1A2A4A",bldg:"#000000",sunY:1.25,sunC:"#D84420",sunSz:50,sunOp:0,  moonOp:1, starOp:1, winOp:1,  glow:"#C8C0B0"},
  {t:100,s1:"#0C1628",s2:"#122240",s3:"#1A2A4A",bldg:"#000000",sunY:1.25,sunC:"#D84420",sunSz:50,sunOp:0,  moonOp:1, starOp:1, winOp:1,  glow:"#C8C0B0"},
];
function interp(v){
  let lo=STOPS[0],hi=STOPS[STOPS.length-1];
  for(let i=0;i<STOPS.length-1;i++){if(v>=STOPS[i].t&&v<=STOPS[i+1].t){lo=STOPS[i];hi=STOPS[i+1];break;}}
  const rng=hi.t-lo.t||1,t=(v-lo.t)/rng,r={};
  for(const k of Object.keys(lo)){if(k==="t")continue;if(typeof lo[k]==="string"&&lo[k].startsWith("#"))r[k]=mc(lo[k],hi[k],t);else if(typeof lo[k]==="number")r[k]=mx(lo[k],hi[k],t);}
  return r;
}
const STARS=Array.from({length:60},()=>({x:Math.random()*100,y:Math.random()*28,sz:Math.random()*2+.5,dl:Math.random()*3,dur:2+Math.random()*3}));

/* ═══ OMAHA SKYLINE — native SVG from skyline-4.svg ═══ */
function Skyline({color,winOp}){
  return(
    <svg viewBox="0 0 1625 540" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" style={{display:"block"}}>
      <g transform="translate(0,540) scale(0.1,-0.1)" fill={color} stroke="none">
        <path d="M7124 4759 c-12 -13 -14 -63 -14 -283 1 -187 -2 -272 -10 -281 -6 -8 -35 -15 -63 -17 l-52 -3 -3 -220 c-2 -219 -2 -219 -27 -245 l-25 -26 0 -872 0 -872 -68 0 c-90 0 -138 14 -146 43 -3 12 -6 131 -6 264 0 182 -3 244 -12 250 -7 4 -44 10 -83 13 l-70 5 -5 85 -5 85 -213 3 c-118 1 -229 -2 -247 -7 -33 -9 -34 -8 -42 27 -7 28 -15 37 -38 44 -36 9 -49 -2 -63 -54 -7 -24 -6 -40 0 -46 7 -7 7 -20 1 -39 -7 -19 -7 -33 0 -45 8 -13 5 -25 -17 -56 -24 -35 -26 -43 -15 -60 10 -16 10 -26 1 -47 -9 -20 -9 -30 0 -45 9 -15 9 -24 -1 -44 -12 -21 -12 -28 -1 -41 11 -13 11 -23 1 -51 -10 -27 -10 -38 -1 -49 10 -12 10 -22 0 -45 -10 -24 -10 -33 0 -45 10 -12 10 -21 0 -45 -10 -24 -10 -33 0 -45 10 -12 10 -24 1 -55 -9 -30 -9 -44 1 -59 9 -15 9 -28 0 -59 -10 -32 -10 -46 0 -67 9 -20 9 -36 0 -69 -8 -30 -8 -54 -2 -77 6 -19 10 -56 10 -84 l0 -50 -96 0 -96 0 7 55 c3 30 5 66 4 80 -1 14 -1 45 -1 70 0 25 0 56 0 70 -1 28 -1 85 0 115 1 11 1 36 0 55 0 19 0 44 1 55 0 11 -1 58 -3 105 -2 47 1 90 5 96 5 6 3 24 -3 42 -9 22 -9 37 -1 54 7 16 7 30 0 46 -7 15 -7 30 0 46 6 12 8 28 3 35 -4 7 -8 187 -9 399 -1 213 -5 390 -9 394 -4 4 -41 8 -82 10 l-75 3 -3 65 c-2 46 -7 69 -19 78 -21 15 -265 17 -294 2 -15 -9 -19 -22 -19 -69 0 -36 -5 -63 -13 -69 -7 -6 -44 -12 -82 -14 l-70 -3 -5 -250 c-3 -137 -7 -251 -8 -252 -1 -2 -76 -3 -166 -3 -121 0 -167 -3 -173 -12 -4 -7 -9 -47 -11 -88 -2 -41 -4 -76 -6 -77 -1 -1 -33 -5 -71 -9 -39 -4 -73 -12 -77 -18 -5 -6 -8 -249 -7 -541 l0 -530 -70 -3 -71 -3 0 51 c0 63 -10 82 -57 111 -21 13 -41 27 -44 32 -4 5 -218 10 -495 11 -269 2 -498 3 -509 4 -11 0 -119 0 -241 -1 -195 -2 -222 -4 -238 -19 -10 -10 -22 -18 -27 -18 -6 0 -28 -15 -49 -32 -32 -27 -37 -36 -28 -52 9 -16 8 -52 -3 -151 -1 -5 2 -28 5 -50 9 -55 -4 -73 -43 -59 -17 7 -33 8 -38 3 -16 -16 -77 33 -83 66 -3 18 -12 31 -24 33 -15 3 -17 -1 -12 -25 5 -23 1 -34 -18 -52 -13 -13 -34 -22 -48 -20 -12 1 -30 -1 -39 -5 -9 -4 -36 -6 -60 -4 l-44 3 -7 65 c-17 157 -30 904 -16 932 5 10 4 19 -2 23 -13 8 -13 52 -1 59 5 4 5 19 -2 36 -9 23 -9 35 1 50 7 12 8 21 2 25 -13 8 -13 52 -1 59 5 4 5 21 -2 41 -7 26 -7 39 0 46 8 8 8 18 1 35 -6 12 -7 31 -3 41 5 10 7 23 5 28 -1 6 -6 23 -9 39 -5 21 -14 32 -35 37 -40 11 -49 4 -67 -46 -14 -37 -14 -47 -3 -56 11 -9 11 -16 -2 -42 -15 -27 -15 -31 -1 -39 14 -7 14 -13 3 -40 -12 -27 -12 -34 0 -45 12 -12 11 -19 -2 -45 -14 -28 -15 -32 -1 -40 13 -7 14 -14 5 -38 -5 -17 -7 -38 -2 -48 4 -9 6 -21 4 -27 -1 -5 -4 -167 -6 -360 -2 -366 -7 -492 -26 -738 l-11 -147 -162 0 -162 0 -7 37 c-9 57 -7 148 4 177 6 18 5 37 -5 65 -10 29 -11 49 -3 78 6 24 6 58 1 89 -5 28 -5 68 0 93 8 38 6 45 -13 58 -16 12 -21 23 -18 45 3 16 1 31 -3 34 -5 3 -46 5 -91 6 -46 0 -89 5 -95 10 -18 14 -16 83 2 98 21 17 19 28 -7 35 -13 4 -37 13 -55 21 -29 13 -31 16 -22 47 12 43 12 47 -6 41 -8 -3 -124 -7 -257 -7 l-243 -2 -1 -36 c-1 -47 -10 -59 -39 -59 -32 0 -37 -11 -39 -89 l-1 -66 -92 1 c-93 1 -93 1 -93 -24 0 -14 -7 -33 -15 -41 -11 -13 -15 -69 -19 -279 -3 -145 -8 -267 -10 -271 -3 -4 0 -24 6 -44 9 -29 8 -42 -2 -62 -11 -21 -11 -29 0 -50 12 -22 12 -28 -3 -43 -14 -14 -21 -14 -37 -4 -14 8 -27 9 -45 2 -35 -13 -112 -13 -120 1 -4 6 -14 7 -24 3 -9 -5 -95 -11 -191 -14 l-175 -5 -3 -48 -3 -47 86 0 c136 0 125 27 125 -306 l0 -284 -30 -7 c-37 -7 -50 -28 -50 -82 l0 -41 -87 -1 c-49 -1 -94 -1 -100 0 -8 1 -13 -11 -13 -34 l0 -35 8111 0 8110 0 -3 33 -3 32 -105 1 c-103 1 -150 12 -150 36 0 6 -9 3 -20 -7 -20 -18 -20 -17 -20 33 0 39 4 52 15 52 8 0 31 11 51 25 20 14 47 25 59 25 26 0 39 13 66 67 20 40 26 93 9 93 -5 0 -16 12 -24 28 -39 70 -68 92 -138 104 -38 6 -68 14 -68 19 0 4 -15 25 -33 47 -19 22 -40 55 -47 73 -8 19 -39 68 -69 109 -222 303 -521 501 -869 575 -58 12 -108 28 -113 36 -5 8 -9 42 -9 75 0 47 -4 63 -16 68 -9 3 -91 6 -184 6 -125 0 -170 -3 -178 -13 -6 -7 -12 -44 -14 -82 l-3 -70 -65 -12 c-88 -16 -144 -30 -212 -54 -32 -11 -62 -17 -68 -14 -14 8 -14 1131 0 1140 20 12 10 45 -15 51 -14 4 -29 4 -32 1 -3 -4 -14 -2 -25 4 -16 9 -19 17 -14 47 4 21 7 46 9 57 2 20 -4 20 -793 20 l-795 0 3 -25 c2 -14 4 -41 5 -60 2 -34 1 -35 -40 -41 -54 -7 -58 -12 -44 -46 8 -20 11 -172 9 -538 l-3 -510 -77 -3 c-85 -3 -98 8 -58 48 24 24 25 49 6 75 -12 16 -29 20 -95 23 -90 5 -91 6 -91 82 0 19 -3 358 -6 753 l-6 717 -21 5 c-12 3 -69 6 -127 8 l-105 2 0 80 0 80 -52 3 c-28 2 -56 9 -62 16 -8 9 -11 91 -9 256 l3 242 44 15 c26 9 59 12 80 9 81 -14 76 -17 79 50 2 51 0 63 -18 79 -28 26 -120 27 -147 3 -11 -10 -32 -18 -46 -18 l-27 0 0 -315 c0 -357 6 -335 -86 -335 -45 0 -46 -1 -40 -27 11 -48 12 -117 3 -130 -7 -9 -44 -13 -123 -13 -90 0 -116 -3 -129 -16 -14 -14 -15 -104 -15 -916 1 -496 -2 -904 -7 -908 -4 -5 -39 -10 -78 -12 l-70 -3 -3 149 c-2 118 1 156 13 182 8 18 18 46 21 62 5 25 2 31 -15 37 -18 6 -21 14 -21 68 0 71 -4 78 -45 93 -26 9 -30 14 -27 43 1 20 -4 41 -14 52 -13 15 -15 41 -12 168 2 110 0 153 -10 163 -7 7 -12 41 -12 89 0 49 -5 87 -15 105 -8 16 -15 36 -15 44 -1 24 -22 54 -63 90 -35 30 -39 31 -60 17 -49 -33 -77 -67 -88 -111 -6 -26 -15 -49 -20 -52 -5 -3 -9 -41 -9 -85 0 -44 -5 -90 -12 -102 -8 -15 -11 -68 -9 -165 2 -104 -1 -147 -10 -158 -7 -8 -13 -31 -13 -51 -1 -32 -5 -37 -36 -48 l-35 -12 -3 -71 c-2 -61 -6 -72 -23 -77 -18 -6 -20 -12 -15 -41 4 -18 13 -45 21 -60 15 -30 10 -54 -12 -54 -9 0 -38 16 -64 35 -27 19 -58 35 -68 35 -24 0 -81 76 -81 107 0 18 -6 23 -25 23 -30 0 -105 69 -105 97 -1 10 -7 29 -15 43 -12 22 -11 27 2 42 20 22 13 52 -14 56 -25 4 -40 -28 -25 -54 14 -26 -12 -112 -45 -145 -15 -16 -43 -31 -60 -35 -26 -5 -33 -11 -33 -29 0 -13 -6 -30 -13 -37 -7 -7 -21 -25 -31 -40 -11 -16 -27 -28 -40 -28 -12 0 -33 -11 -47 -24 -15 -13 -42 -26 -60 -28 -39 -3 -39 0 -13 76 l17 48 -33 26 c-30 24 -32 28 -26 71 7 54 -1 69 -40 80 -26 7 -29 12 -26 43 1 22 -3 40 -13 48 -12 10 -15 41 -15 169 0 101 -4 161 -11 168 -6 6 -12 49 -14 96 -2 46 -8 93 -13 103 -6 10 -13 31 -16 45 -5 25 -29 54 -79 95 l-25 21 -46 -45 c-26 -25 -49 -56 -52 -71 -3 -14 -12 -40 -20 -58 -8 -17 -14 -63 -14 -105 0 -43 -5 -79 -12 -86 -8 -8 -11 -57 -9 -163 2 -122 -1 -154 -13 -167 -8 -10 -16 -35 -18 -57 -3 -34 -6 -40 -26 -40 -32 0 -42 -21 -42 -92 0 -53 -3 -63 -20 -68 -11 -3 -20 -15 -20 -25 0 -10 9 -39 20 -65 11 -26 20 -66 20 -90 l0 -43 -32 12 c-18 6 -44 17 -56 25 -13 7 -48 21 -77 31 l-53 18 -10 -31 c-7 -22 -10 189 -11 700 -1 486 2 734 9 738 17 11 0 25 -30 25 -57 0 -60 5 -60 97 0 46 4 92 10 102 8 17 -1 18 -127 24 -171 9 -540 9 -571 1 -17 -5 -21 -11 -15 -23 4 -9 9 -55 11 -103 l3 -87 -38 -6 c-62 -11 -65 -12 -53 -34 6 -13 10 -185 10 -496 0 -450 -1 -477 -17 -470 -28 10 -170 25 -245 25 l-68 0 0 850 0 850 -25 16 -25 16 -2 227 -3 226 -50 3 c-88 6 -86 -3 -85 305 1 148 -2 273 -7 278 -4 4 -100 9 -211 11 -177 3 -205 1 -218 -13z m-1054 -2144 c0 -6 -5 -16 -11 -22 -8 -8 -8 -17 0 -31 6 -11 11 -25 11 -31 0 -12 -29 -15 -31 -3 -4 34 -4 119 -1 126 6 10 32 -22 32 -39z m-5412 -1834 c7 -4 12 -12 11 -17 -1 -5 1 -22 6 -38 4 -16 3 -43 -3 -62 -7 -23 -7 -36 0 -40 6 -4 7 -24 4 -48 -3 -22 -5 -47 -5 -53 1 -34 1 -80 0 -98 0 -11 1 -60 3 -110 3 -62 -1 -101 -10 -124 -8 -18 -14 -53 -14 -78 l0 -44 -97 3 c-95 3 -98 4 -107 29 -6 19 -5 41 6 73 14 42 14 48 -3 75 -10 16 -28 35 -41 42 -13 7 -26 17 -30 23 -13 20 -9 451 4 464 14 14 255 17 276 3z m3830 -708 c-10 -2 -28 -2 -40 0 -13 2 -5 4 17 4 22 1 32 -1 23 -4z"/>
        <path d="M9415 2670 c-3 -5 -1 -10 4 -10 6 0 11 5 11 10 0 6 -2 10 -4 10 -3 0 -8 -4 -11 -10z"/>
        <path d="M0 224 c0 -79 2 -81 43 -46 9 8 17 26 17 39 0 24 -37 83 -52 83 -4 0 -8 -34 -8 -76z"/>
      </g>

      {/* Window lights — pixel-verified, varied by building */}
      <g fill="#FFE4AA" opacity={winOp}>
        {[[126,356],[82,394],[104,394],[1006,394],[126,432],[148,432],[1028,432],[1512,432],[126,470],[1006,470],[1556,470]].map(([x,y],i)=><rect key={`g0${i}`} x={x} y={y} width="2" height="3" rx=".5"/>)}
        {[[940,318],[940,356],[280,394],[302,394],[324,394],[368,394],[236,432],[302,432],[324,432],[346,432],[368,432],[940,432],[962,432],[258,470],[280,470],[302,470],[324,470],[346,470],[368,470],[940,470],[962,470]].map(([x,y],i)=><rect key={`g1${i}`} x={x} y={y} width="2.5" height="3.5" rx=".5"/>)}
        {[[522,242],[544,242],[522,280],[544,280],[478,318],[478,394],[544,394],[412,432],[434,432],[456,432],[500,432],[522,432],[412,470],[456,470],[478,470],[1204,470],[1226,470]].map(([x,y],i)=><rect key={`g2${i}`} x={x} y={y} width="3" height="4" rx=".5"/>)}
        {[[1248,318],[1336,318],[1380,318],[1292,356],[1314,356],[1358,356],[1380,356],[1248,394],[1270,394],[1358,394],[1380,394],[1270,432],[1292,432],[1314,432],[1358,432],[1380,432],[1402,432],[1424,432],[1446,432],[1468,432],[1270,470],[1292,470],[1336,470],[1358,470],[1424,470],[1446,470],[1468,470]].map(([x,y],i)=><rect key={`g3${i}`} x={x} y={y} width="3" height="4.5" rx=".5"/>)}
        {[[742,90],[720,128],[742,128],[742,204],[764,204],[720,242],[742,242],[764,242],[852,242],[874,242],[1182,242],[720,280],[742,280],[764,280],[1160,280],[720,318],[742,318],[764,318],[830,318],[852,318],[874,318],[1138,318],[1160,318],[1182,318],[654,356],[676,356],[698,356],[720,356],[742,356],[808,356],[852,356],[1072,356],[1138,356],[1182,356],[610,394],[654,394],[676,394],[698,394],[764,394],[786,394],[808,394],[874,394],[1072,394],[1160,394],[1182,394],[588,432],[610,432],[632,432],[654,432],[676,432],[720,432],[742,432],[764,432],[808,432],[874,432],[896,432],[1094,432],[1116,432],[1138,432],[1160,432],[1182,432],[588,470],[610,470],[676,470],[720,470],[764,470],[808,470],[852,470],[874,470],[1072,470],[1116,470],[1160,470]].map(([x,y],i)=><rect key={`g4${i}`} x={x} y={y} width="3.5" height="5" rx=".5"/>)}
      </g>
      {/* Antennas */}
      <g opacity={winOp*.8}>
        {[[725,63,2.5,2],[540,204,2,2.3],[1163,148,2,1.8],[845,221,2,2.6],[222,265,1.5,2.1]].map(([cx,cy,r,d],i)=><circle key={`a${i}`} cx={cx} cy={cy} r={r} fill="#FF3333"><animate attributeName="opacity" values="1;0.2;1" dur={`${d}s`} repeatCount="indefinite"/></circle>)}
      </g>
    </svg>
  );
}

/* ═══ ICONS ═══ */
const IC={
  trail:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19l4-12 4 8 4-4 4 8"/><circle cx="8" cy="7" r="1.5" fill={c} opacity=".3"/></svg>,
  walk:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="13" cy="4" r="2"/><path d="M10 10l2-1 2 1v5l-1 5"/><path d="M10 10l-2 8 3-1"/><path d="M14 15l2 5"/></svg>,
  sunset:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a5 5 0 00-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><polyline points="8 6 12 2 16 6"/></svg>,
  music:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  bike:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 100-2 1 1 0 000 2z" fill={c}/><path d="M12 17.5V14l-3-3 4-3 2 3h3"/></svg>,
  camera:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  food:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg>,
  heart:(c,s=16,f=false)=><svg width={s} height={s} viewBox="0 0 24 24" fill={f?c:"none"} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  chev:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  dir:(c,s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12"/></svg>,
  link:(c,s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  tree:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V8"/><path d="M5 12l7-10 7 10"/><path d="M7 16l5-6 5 6"/></svg>,
  today:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>,
  calendar:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="16" r="2"/></svg>,
  events:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="16" r="2"/></svg>,
  explore:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={c} opacity=".5"/></svg>,
  venues:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  saved:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>,
  fish:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 12c3-6 10-6 14-2-4 4-11 4-14-2z"/><path d="M6.5 12c-3-1-4.5-3-4.5-3s1.5-2 4.5-3"/><circle cx="16" cy="10" r="0.7" fill={c}/></svg>,
  kayak:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="14" rx="9" ry="3"/><path d="M12 3v8"/><path d="M8 5l4 3 4-3"/></svg>,
  tent:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M12 3l9 18H3L12 3z"/><path d="M12 21v-6"/></svg>,
  disc:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2a15 15 0 014 10"/><path d="M12 2a15 15 0 00-4 10"/></svg>,
  archery:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  horse:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 3c-1 0-2 .5-2.5 1.5l-1 2-.5 1-4 1-3 3 1 2 3-1 1 4v4h2v-5l3-2 1 3v4h2v-5l1-4c.8-1.5.5-3-.5-4l1.5-1.5z"/><circle cx="17" cy="5" r="1" fill={c}/></svg>,
  boat:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20c2-1 4-1 6 0s4 1 6 0 4-1 6 0"/><path d="M4 16l8-12 8 12"/><path d="M12 4v12"/></svg>,
  bird:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 008-8V7a4 4 0 00-8 0v1H9l-5.6 10z"/></svg>,
  info:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  phone:(c,s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  globe:(c,s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  clock:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  pin:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  share:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  check:(c,s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  x:(c,s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  splash:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6"/><path d="M8 4l4 4 4-4"/><path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>,
  flower:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7.5a4.5 4.5 0 11-4.5 4.5"/><path d="M12 7.5a4.5 4.5 0 104.5 4.5"/><circle cx="12" cy="12" r="3" fill={c} opacity=".3"/><path d="M12 2v5"/><path d="M12 22v-5"/></svg>,
};
const mapsDir=(lat,lng)=>`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
const u=id=>`https://images.unsplash.com/${id}?w=600&h=400&fit=crop&q=80`;

/* ═══ CONTENT DATA ═══ */
const TRAILS=[
  {id:"t1",name:"Keystone Trail",desc:"Omaha's backbone — 50+ miles of paved multi-use trail through the metro. Connects Keystone Lake to Walnut Creek, passing through neighborhoods, parks, and green corridors. The longest continuous trail in the metro area.",distance:"52 mi",difficulty:"Easy",surface:"Paved",lat:41.24,lng:-96.02,tags:["Cycling","Running"],img:"/images/trails/t1.jpg",elev:"Flat",icon:IC.bike,bestFor:"Road cycling and long-distance running",parkingNote:"Multiple trailheads — Keystone Lake and 108th & West Maple are popular starting points",highlights:["Longest paved trail in the Omaha metro","Connects to 10+ parks and neighborhoods","Flat terrain ideal for all fitness levels","Well-maintained year-round"]},
  {id:"t2",name:"Bob Kerrey Bridge Loop",desc:"Cross the Missouri River to Iowa and back. Best sunrise views in the city. The 3,000-foot pedestrian bridge connects Omaha's riverfront to Council Bluffs with stunning views of both skylines.",distance:"3.2 mi",difficulty:"Easy",surface:"Paved",lat:41.2575,lng:-95.9215,tags:["Walking","River"],img:"/images/trails/t2.jpg",elev:"Flat",icon:IC.walk,bestFor:"Sunrise walks and casual strolls",parkingNote:"Free parking at Gene Leahy Mall or Lewis & Clark Landing",highlights:["Walk across the Missouri River to Iowa","Stunning sunrise and sunset panoramas","Connects to both Omaha & Council Bluffs trail systems","LED lighting for evening walks"]},
  {id:"t3",name:"Fontenelle Forest",desc:"2,000 acres of old-growth forest with 17 miles of trails. Boardwalk canopy trail and raptor woodland give unique perspectives. Watch for bald eagles, deer, and over 200 bird species throughout the year.",distance:"17 mi trails",difficulty:"Moderate",surface:"Dirt / Boardwalk",lat:41.157,lng:-95.9,tags:["Forest","Birding"],img:"/images/trails/t3.jpg",elev:"+350 ft",url:"https://fontenelleforest.org",icon:IC.tree,bestFor:"Nature hiking and birdwatching",parkingNote:"Main parking lot at 1111 Bellevue Blvd N",highlights:["Elevated boardwalk through forest canopy","Over 200 bird species including bald eagles","Raptor Recovery center with live birds","Seasonal wildflower displays in spring"]},
  {id:"t4",name:"Wehrspann Lake Loop",desc:"8-mile loop at Chalco Hills Recreation Area. Packed gravel with gentle rolling hills and shaded sections along the lake. Nature center offers exhibits and programs for families.",distance:"8.1 mi",difficulty:"Easy–Mod",surface:"Gravel",lat:41.18,lng:-96.13,tags:["Lake","Loop"],img:"/images/trails/t4.jpg",elev:"+180 ft",icon:IC.trail,bestFor:"Trail running and moderate hiking",parkingNote:"Chalco Hills Nature Center parking lot off 154th St",highlights:["Scenic lake views throughout the loop","Chalco Hills Nature Center with exhibits","Rolling prairie hills with shaded sections","Popular fishing spots along the route"]},
  {id:"t5",name:"Zorinsky Lake Trail",desc:"Popular West Omaha loop with prairie views, fishing pier, and waterbird habitat. Paved and flat, perfect for families with strollers or casual walkers. Connects to Keystone Trail.",distance:"4.8 mi",difficulty:"Easy",surface:"Paved",lat:41.23,lng:-96.075,tags:["Lake","Family"],img:"/images/trails/t5.jpg",elev:"Flat",icon:IC.walk,bestFor:"Family walks and casual cycling",parkingNote:"Main lot off 156th & F St, additional lots on south side",highlights:["Fully paved and stroller-friendly","Great birdwatching at the waterbird habitat","Fishing pier open year-round","Connects to Keystone Trail network"]},
];
const WALKS=[
  {id:"w1",name:"Old Market Historic Walk",desc:"Cobblestone streets, 19th-century warehouses, galleries. Start at 10th & Howard.",time:"45 min",distance:"1.2 mi",lat:41.2555,lng:-95.932,tags:["History","Architecture"],icon:IC.camera},
  {id:"w2",name:"Benson Mainstreet",desc:"Omaha's most eclectic neighborhood. Vintage shops, murals, record stores, dive bars.",time:"1 hr",distance:"1.5 mi",lat:41.281,lng:-95.954,tags:["Music","Vintage"],icon:IC.walk},
  {id:"w3",name:"Blackstone to Dundee",desc:"Cocktail district to tree-lined neighborhood restaurants. Hit Crescent Moon and Pitch.",time:"1.5 hr",distance:"2.1 mi",lat:41.259,lng:-95.965,tags:["Dining","Cocktails"],icon:IC.food},
  {id:"w4",name:"North Omaha Murals",desc:"Street art celebrating Black history, jazz legends, and community resilience.",time:"1 hr",distance:"1.8 mi",lat:41.28,lng:-95.94,tags:["Art","Culture"],icon:IC.camera},
  {id:"w5",name:"RiverFront Trail",desc:"Gene Leahy Mall → Heartland of America Park → Lewis & Clark Landing.",time:"40 min",distance:"1.4 mi",lat:41.258,lng:-95.928,tags:["Riverfront","Family"],icon:IC.walk},
];
const DAYTIME=[
  {id:"d1",name:"Henry Doorly Zoo",desc:"Consistently ranked #1 zoo in the world by TripAdvisor. Home to the world's largest indoor desert (Desert Dome), largest indoor rainforest (Lied Jungle), and one of the largest aquariums in the country. Over 17,000 animals across 160 acres of exhibits.",price:"$26.95",time:"3–5 hrs",lat:41.226,lng:-95.9287,tags:["Zoo","Family"],icon:"🦁",url:"https://www.omahazoo.com",address:"3701 S 10th St, Omaha, NE 68107",highlights:["Desert Dome — world's largest indoor desert","Lied Jungle — 1.5 acre indoor rainforest","Scott Aquarium — shark tunnel and coral reef","Kingdoms of the Night — largest nocturnal exhibit","African Grasslands — giraffes, elephants, lions"]},
  {id:"d2",name:"Joslyn Art Museum",desc:"World-class art museum with a stunning Snøhetta-designed expansion that doubled gallery space. The permanent collection spans 5,000 years from ancient to contemporary, with strengths in European and American art. Always free admission.",price:"Free",time:"1.5–2 hrs",lat:41.2635,lng:-95.9394,tags:["Art","Free"],icon:"🎨",url:"https://joslyn.org",address:"2200 Dodge St, Omaha, NE 68102",highlights:["Snøhetta expansion with modern gallery spaces","European masters including Monet and El Greco","American Western art collection","Free admission — always","Sculpture garden and outdoor installations"]},
  {id:"d3",name:"Kiewit Luminarium",desc:"State-of-the-art interactive science center on Omaha's riverfront. Over 100 hands-on exhibits exploring science, technology, engineering, art, and math. Designed for all ages with immersive experiences that make learning feel like play.",price:"$24",time:"2–3 hrs",lat:41.2565,lng:-95.923,tags:["Science","Family"],icon:"🔬",url:"https://kiewitluminarium.org",address:"1111 S 2nd St, Omaha, NE 68108",highlights:["100+ hands-on interactive exhibits","Immersive STEAM learning experiences","Stunning riverfront architecture","Activities for all ages, toddler to adult"]},
  {id:"d4",name:"Lauritzen Gardens",desc:"100-acre botanical garden featuring themed gardens, a Victorian conservatory, seasonal model train displays, and one of the finest collections of trees and flowers in the Great Plains. Beautiful in every season.",price:"$14",time:"1.5–2 hrs",lat:41.2384,lng:-95.9158,tags:["Gardens"],icon:"🌺",url:"https://www.lauritzengardens.org",address:"100 Bancroft St, Omaha, NE 68108",highlights:["Victorian-era conservatory","Seasonal model train garden displays","Rose garden with 1,000+ bushes","Japanese garden with koi pond","Children's garden and nature play area"]},
  {id:"d5",name:"The Durham Museum",desc:"Housed in Omaha's stunning Art Deco Union Station, this museum brings the region's history to life. Walk through vintage Pullman train cars, sip a phosphate at the 1930s soda fountain, and explore exhibits spanning centuries of Plains history.",price:"$12",time:"1.5–2 hrs",lat:41.2553,lng:-95.931,tags:["History"],icon:"🚂",url:"https://durhammuseum.org",address:"801 S 10th St, Omaha, NE 68108",highlights:["Art Deco Union Station architecture","Vintage Pullman train car exhibits","Working 1930s soda fountain","Interactive regional history galleries","Rotating national traveling exhibitions"]},
];
const SUNSETS=[
  {id:"s1",name:"Bob Kerrey Bridge",desc:"Best sunset panorama in Omaha. Missouri River catches golden light with both skylines.",lat:41.2575,lng:-95.9215,icon:IC.sunset},
  {id:"s2",name:"Gene Leahy Mall",desc:"Free outdoor movies and performances against a downtown backdrop.",lat:41.258,lng:-95.93,icon:IC.sunset},
  {id:"s3",name:"Stir Concert Cove",desc:"Lakeside at Harrah's. Summer concerts as the sun drops behind the stage.",lat:41.233,lng:-95.854,icon:IC.music},
  {id:"s4",name:"Turner Park",desc:"Jazz on the Green in summer. Bring wine and a picnic. Arrive by 6 PM.",lat:41.255,lng:-95.96,icon:IC.music},
];
const PARKS=[
  {id:"cunningham-lake",name:"Cunningham Lake",nickname:"The C",tagline:"Omaha's Urban Oasis",
    desc:"A 390-acre lake surrounded by a 1,050-acre park in north central Omaha. Constructed by the U.S. Army Corps of Engineers for flood control and recreation, it opened in 1977. After a major renovation beginning in 2017, the park reopened in 2021 with upgraded trails, a renovated campground, new marina, disc golf course, and improved access.",
    address:"8965 State St, Omaha, NE 68122",lat:41.327,lng:-96.04,phone:"531-201-5754",website:"https://explorethec.com",
    hours:"5 AM – 11 PM Daily",admission:"Free",acreage:1050,color:"#5CA8D4",
    tags:["Lake","Trails","Fishing","Camping"],img:"/images/parks/cunningham-lake.jpg",icon:"🎣",
    lake:{acres:390,maxDepth:"23 ft",
      species:[{name:"Channel Catfish",note:"Regularly stocked, up to 13 lbs"},{name:"Largemouth Bass",note:"Developing fishery, good populations"},{name:"Bluegill",note:"Great for beginners & kids"},{name:"White Bass",note:"Stocked since 2020"},{name:"Crappie",note:"Popular panfish target"},{name:"Saugeye",note:"Stocked seasonally"}],
      license:"Required for ages 16+ — Nebraska sport fishing license",licenseUrl:"https://outdoornebraska.gov",
      spots:["Multiple fishing piers around lake","Shoreline access at various points","Entrance #4 (north side) popular for fishing"],
      rules:["No fishing near marina boat docks","Standard Nebraska regulations apply","Ice fishing at your own risk","No permanent ice shelters"]},
    trails:[
      {name:"The C Loop",distance:"6.2 mi",surface:"Concrete (8ft wide)",difficulty:"Easy",desc:"The main lake loop — flat, accessible, perfect for walking, running, or biking. Connects all park amenities.",features:["ADA Accessible","Water Stations","Year-Round"]},
      {name:"Nature Trails",distance:"~20 mi",surface:"Natural / Dirt",difficulty:"Moderate",desc:"Extensive multipurpose trail network north of Highway 36. Open for hiking, mountain biking, and horseback riding.",features:["Horseback Riding","Wildlife Viewing","Year-Round"]},
      {name:"Equestrian Trail",distance:"Varies",surface:"Natural",difficulty:"Moderate",desc:"Designated equestrian trails within the northern nature trail system. Riders must bring their own horses.",features:["Bring Your Own Horse","North Side Only"]}],
    activities:[
      {name:"Disc Golf",icon:"disc",desc:'18-hole "Lighthouse" course. Intermediate level, hilly. Free — bring your own discs.',season:"Year-round"},
      {name:"Kayak & SUP",icon:"kayak",desc:"Rentals available through Neighborhood Offshore. Accessible launch at Entrance #3.",season:"Apr–Oct"},
      {name:"Camping",icon:"tent",desc:"83 RV sites (42 full hookup, 41 electric). 7 tent sites. Showers, restrooms, snack bar.",season:"Spring–Nov"},
      {name:"Boating",icon:"boat",desc:"No-wake lake (5 mph max). Public boat ramp open during park hours. Marina available.",season:"Apr–Oct"},
      {name:"Archery",icon:"archery",desc:"9 stationary targets + 11-lane 3D range. Open year-round. Archery use only within range.",season:"Year-round"},
      {name:"Birding",icon:"bird",desc:"450+ acres of wildlife area north of HWY 36. Excellent habitat for migratory and resident species.",season:"Year-round"}],
    entrances:[{num:1,name:"State St (Main)",note:"Marina, main parking, trail access"},{num:2,name:"North Side",note:"Campground access (seasonal)"},{num:3,name:"South Side",note:"Kayak launch, shelters, scenic views"},{num:4,name:"North Lake",note:"Trails, fishing, lake overlook"}],
    amenities:["Picnic Shelters","Restrooms & Showers","Water Stations","Snack Bar","Playground","Marina","3 Parking Areas"],
    rules_allowed:["Pets on leash (6ft max)","Photography","Grills in designated areas","Geocaching (with permit)"],
    rules_prohibited:["Swimming (people & pets)","Fireworks","Firearms","Bounce houses","Sledding on dam","Camping outside campground"]},

  {id:"gene-leahy-mall",name:"Gene Leahy Mall",nickname:"The RiverFront",tagline:"Downtown's Living Room",
    desc:"Omaha's flagship urban park, transformed in a $290M renovation completed in 2022. The 72-acre RiverFront spans three connected parks with a performance pavilion, interactive playground, splash pad, slides, and sweeping green lawns against the downtown skyline.",
    address:"1001 Farnam St, Omaha, NE 68102",lat:41.258,lng:-95.93,phone:"402-444-5900",website:"https://theriverfrontomaha.com",
    hours:"6 AM – 11 PM Daily",admission:"Free",acreage:72,color:"#5EC4B6",
    tags:["Riverfront","Family","Free","Downtown"],img:"/images/parks/gene-leahy-mall.jpg",icon:"🏞️",
    trails:[
      {name:"RiverFront Promenade",distance:"1.5 mi",surface:"Paved",difficulty:"Easy",desc:"Paved path connecting Gene Leahy Mall, Heartland of America Park, and Lewis & Clark Landing along the river.",features:["ADA Accessible","Lit Path","River Views"]}],
    activities:[
      {name:"Splash Pad",icon:"splash",desc:"Interactive water jets and wading area for kids. Zero-depth entry.",season:"Memorial Day–Labor Day"},
      {name:"Playground",icon:"slide",desc:"Massive adventure playground with climbing structures, slides, and rope bridges.",season:"Year-round"},
      {name:"Performance Pavilion",icon:"music",desc:"Free outdoor concerts, movies, and cultural events throughout summer.",season:"May–Sep"},
      {name:"Kayaking",icon:"kayak",desc:"Kayak and paddleboard launch near Lewis & Clark Landing.",season:"May–Oct"}],
    amenities:["Restrooms","Food Trucks","Free Wi-Fi","ADA Accessible","Event Lawn","Dog-Friendly Areas"],
    rules_allowed:["Leashed dogs in designated areas","Picnics on the lawn","Photography","Biking on paths"],
    rules_prohibited:["Swimming in river","Glass containers","Amplified music without permit","Drone flying"]},

  {id:"zorinsky-lake",name:"Zorinsky Lake",nickname:"Zorinsky",tagline:"West Omaha's Favorite Loop",
    desc:"A 255-acre park centered around a 98-acre lake in West Omaha. The 4.8-mile paved loop is one of the most popular trails in the city, winding through prairie, past fishing piers, and alongside waterbird habitat.",
    address:"3808 S 156th St, Omaha, NE 68130",lat:41.23,lng:-96.075,phone:"402-444-5900",website:"https://parks.cityofomaha.org",
    hours:"5 AM – 11 PM Daily",admission:"Free",acreage:255,color:"#7DD4A0",
    tags:["Lake","Trails","Family","Free"],img:"/images/parks/zorinsky-lake.jpg",icon:"🚶",
    lake:{acres:98,maxDepth:"18 ft",
      species:[{name:"Largemouth Bass",note:"Catch and release encouraged"},{name:"Bluegill",note:"Abundant, great for families"},{name:"Channel Catfish",note:"Best in evening hours"},{name:"Crappie",note:"Spring spawning runs"}],
      license:"Required for ages 16+ — Nebraska permit",licenseUrl:"https://outdoornebraska.gov",
      spots:["Fishing pier on south shore","Multiple shoreline access points","North shore rocky bank"],
      rules:["No boats or flotation devices","Standard Nebraska regulations","No fishing near dam spillway"]},
    trails:[
      {name:"Lake Loop",distance:"4.8 mi",surface:"Paved (8ft wide)",difficulty:"Easy",desc:"The signature loop circling the entire lake. Flat, wide, and popular with walkers, runners, and cyclists.",features:["ADA Accessible","Water Stations","Restroom Access","Year-Round"]},
      {name:"Prairie Trail",distance:"1.2 mi",surface:"Natural",difficulty:"Easy",desc:"Short nature trail through restored prairie on the park's south side. Wildflowers in summer.",features:["Wildflowers","Bird Habitat"]}],
    activities:[
      {name:"Running & Walking",icon:"trail",desc:"One of the most popular running loops in Omaha. Wide paved path with distance markers.",season:"Year-round"},
      {name:"Birding",icon:"bird",desc:"Resident and migratory waterbirds including herons, pelicans, and bald eagles in winter.",season:"Year-round"},
      {name:"Disc Golf",icon:"disc",desc:"9-hole disc golf course on the park's west side. Free, bring your own discs.",season:"Year-round"}],
    amenities:["Restrooms","Parking (3 lots)","Fishing Piers","Picnic Shelters","Playground","Drinking Fountains"],
    rules_allowed:["Leashed dogs","Cycling on paved path","Fishing with license","Photography"],
    rules_prohibited:["Swimming","Boats or inflatables","Motorized vehicles on trail","Camping"]},

  {id:"standing-bear-lake",name:"Standing Bear Lake",nickname:"Standing Bear",tagline:"Northwest Omaha's Hidden Gem",
    desc:"A 135-acre lake surrounded by trails, a nature center, and one of the best kayak launches in the metro. Located in northwest Omaha, Standing Bear offers fishing, paddle sports, and a quieter alternative to the larger lakes.",
    address:"6404 N 132nd St, Omaha, NE 68164",lat:41.306,lng:-96.065,phone:"402-444-5900",website:"https://parks.cityofomaha.org",
    hours:"5 AM – 11 PM Daily",admission:"Free",acreage:220,color:"#4A90A4",
    tags:["Lake","Kayaking","Nature","Free"],img:"/images/parks/standing-bear-lake.jpg",icon:"🏞️",
    lake:{acres:135,maxDepth:"20 ft",
      species:[{name:"Largemouth Bass",note:"Good populations"},{name:"Channel Catfish",note:"Stocked regularly"},{name:"Bluegill",note:"Plentiful along shore"},{name:"Walleye",note:"Occasional catches"}],
      license:"Required for ages 16+ — Nebraska permit",licenseUrl:"https://outdoornebraska.gov",
      spots:["Fishing pier near main parking","Shoreline access north side","Bank fishing near dam"],
      rules:["Electric motors only","No swimming","Standard Nebraska regulations"]},
    trails:[
      {name:"Lake Trail",distance:"3.5 mi",surface:"Paved",difficulty:"Easy",desc:"Paved loop around the lake with gentle hills and tree-lined sections.",features:["ADA Accessible","Shaded Sections","Year-Round"]},
      {name:"Nature Center Trail",distance:"0.8 mi",surface:"Woodchip",difficulty:"Easy",desc:"Short interpretive loop near the Fontenelle Nature Center with native plantings.",features:["Educational Signs","Family-Friendly"]}],
    activities:[
      {name:"Kayak & SUP",icon:"kayak",desc:"Popular kayak and paddleboard spot. Public launch near main parking area.",season:"Apr–Oct"},
      {name:"Fishing",icon:"fish",desc:"Multiple access points around the lake. Pier and shoreline fishing.",season:"Year-round"},
      {name:"Birding",icon:"bird",desc:"Wooded shoreline attracts warblers, woodpeckers, and waterbirds.",season:"Year-round"}],
    amenities:["Restrooms","Kayak Launch","Fishing Pier","Playground","Nature Center","Parking"],
    rules_allowed:["Kayaks and canoes","Leashed dogs","Fishing with license","Electric boat motors"],
    rules_prohibited:["Gas-powered boats","Swimming","Jet skis","Camping"]},

  {id:"heartland-america",name:"Heartland of America Park",nickname:"Heartland Park",tagline:"Downtown's Waterfront Jewel",
    desc:"A downtown park featuring a scenic lake with a dramatic fountain, walking paths, and stunning skyline views. Part of the RiverFront revitalization, it connects to Gene Leahy Mall and Lewis & Clark Landing.",
    address:"800 S 10th St, Omaha, NE 68108",lat:41.254,lng:-95.922,phone:"402-444-5900",website:"https://theriverfrontomaha.com",
    hours:"6 AM – 11 PM Daily",admission:"Free",acreage:31,color:"#64B5F6",
    tags:["Downtown","Lake","Skyline","Free"],img:"/images/parks/heartland-america.jpg",icon:"⛲",
    trails:[
      {name:"Lakeside Path",distance:"0.6 mi",surface:"Paved",difficulty:"Easy",desc:"Walking path around the lake with fountain views and downtown skyline backdrop.",features:["ADA Accessible","Lit at Night","Photo Spots"]}],
    activities:[
      {name:"Fountain Show",icon:"splash",desc:"The park's signature fountain shoots water up to 300 feet. Lit at night with colored lights.",season:"Apr–Oct"},
      {name:"Walking",icon:"trail",desc:"Peaceful lakeside stroll with some of the best skyline views in the city.",season:"Year-round"}],
    amenities:["Restrooms","Benches","Lighting","ADA Paths","Public Art","Parking"],
    rules_allowed:["Photography","Leashed dogs","Cycling on paths"],
    rules_prohibited:["Swimming","Fishing","Motorized vehicles","Camping"]},

  {id:"fontenelle-forest",name:"Fontenelle Forest",nickname:"The Forest",tagline:"2,000 Acres of Old-Growth Wonder",
    desc:"A 2,000-acre nature preserve in Bellevue featuring old-growth forest, boardwalk canopy trails, and diverse wildlife. Home to TreeRush Adventures (aerial obstacle course) and a raptor rehabilitation center with live birds of prey.",
    address:"1111 Bellevue Blvd N, Bellevue, NE 68005",lat:41.157,lng:-95.9,phone:"402-731-3140",website:"https://fontenelleforest.org",
    hours:"8 AM – 5 PM Daily",admission:"$12 adults / $8 kids",acreage:2000,color:"#6BBF7A",
    tags:["Forest","Nature","Family","Adventure"],img:"/images/parks/fontenelle-forest.jpg",icon:"🌲",
    trails:[
      {name:"Boardwalk Trail",distance:"1.0 mi",surface:"Boardwalk",difficulty:"Easy",desc:"Elevated boardwalk through the forest canopy. Fully accessible with stunning tree-top views.",features:["ADA Accessible","Canopy Views","All Ages"]},
      {name:"Riverview Trail",distance:"2.5 mi",surface:"Natural",difficulty:"Moderate",desc:"Descends to the Missouri River floodplain through oak-hickory forest. Watch for deer and wild turkeys.",features:["River Views","Wildlife","Elevation Change"]},
      {name:"Stream Trail",distance:"1.8 mi",surface:"Natural",difficulty:"Moderate",desc:"Follows a wooded creek through ravines. Best for birding, especially in spring migration.",features:["Creek Crossings","Birding","Spring Wildflowers"]}],
    activities:[
      {name:"TreeRush Adventures",icon:"tree",desc:"Aerial obstacle course with zip lines and rope bridges through the forest canopy. Reservations recommended.",season:"Mar–Nov"},
      {name:"Raptor Woodland",icon:"bird",desc:"Live birds of prey including bald eagles, owls, and hawks in naturalistic enclosures. Included with admission.",season:"Year-round"},
      {name:"Nature Programs",icon:"info",desc:"Guided hikes, birding walks, and seasonal nature programs for all ages.",season:"Year-round"}],
    amenities:["Visitor Center","Gift Shop","Restrooms","Picnic Area","Nature Exhibits","Parking"],
    rules_allowed:["Hiking on marked trails","Photography","Binoculars and birding gear"],
    rules_prohibited:["Pets (no dogs)","Bikes on trails","Collecting plants or animals","Off-trail hiking"]},

  {id:"lauritzen-gardens",name:"Lauritzen Gardens",nickname:"The Gardens",tagline:"Omaha's Botanical Treasure",
    desc:"A 100-acre botanical garden and arboretum featuring themed garden rooms, a conservatory with tropical plants, seasonal model train displays, and the Marjorie K. Daugherty Conservatory. Beautiful in every season.",
    address:"100 Bancroft St, Omaha, NE 68108",lat:41.2384,lng:-95.9158,phone:"402-346-4002",website:"https://www.lauritzengardens.org",
    hours:"9 AM – 5 PM Daily",admission:"$14 adults / $7 kids",acreage:100,color:"#E88BD4",
    tags:["Gardens","Seasonal","Family"],img:"/images/parks/lauritzen-gardens.jpg",icon:"🌺",
    trails:[
      {name:"Garden Walk",distance:"1.5 mi",surface:"Paved",difficulty:"Easy",desc:"Winding paths through themed gardens including the Rose Garden, Victorian Garden, and Japanese Garden.",features:["ADA Accessible","Year-Round Beauty","Benches Throughout"]}],
    activities:[
      {name:"Seasonal Exhibits",icon:"flower",desc:"Spring tulips, summer roses, fall chrysanthemums, and holiday poinsettia shows. Model train display Nov–Jan.",season:"Year-round"},
      {name:"Conservatory",icon:"tree",desc:"The Marjorie K. Daugherty Conservatory houses tropical and desert plants year-round, even in winter.",season:"Year-round"},
      {name:"Photography",icon:"camera",desc:"Popular venue for wedding and portrait photography. Permit required for professional shoots.",season:"Year-round"}],
    amenities:["Visitor Center","Gift Shop","Restrooms","Café","Event Spaces","Wheelchair Access"],
    rules_allowed:["Amateur photography","Strollers","Wheelchairs","Sketching and painting"],
    rules_prohibited:["Pets","Picking flowers or plants","Drones","Running","Outside food"]},

  {id:"elmwood-park",name:"Elmwood Park",nickname:"Elmwood",tagline:"Dundee's Historic Heart",
    desc:"A 204-acre historic park in the heart of the Dundee neighborhood. Features a public golf course, tennis courts, disc golf, rose garden, and shaded trails through mature elm and oak trees. A beloved community gathering spot since 1890.",
    address:"802 S 60th St, Omaha, NE 68106",lat:41.252,lng:-95.971,phone:"402-444-5900",website:"https://parks.cityofomaha.org",
    hours:"5 AM – 11 PM Daily",admission:"Free",acreage:204,color:"#A8D5BA",
    tags:["Historic","Trails","Golf","Free"],img:"/images/parks/elmwood-park.jpg",icon:"🌳",
    trails:[
      {name:"Park Loop",distance:"2.0 mi",surface:"Paved / Gravel",difficulty:"Easy",desc:"Shaded loop through the park passing the rose garden, golf course, and picnic areas.",features:["Shaded","Historic Trees","Family-Friendly"]}],
    activities:[
      {name:"Golf",icon:"disc",desc:"Elmwood Park Golf Course — 18-hole public course. Tee times available online.",season:"Mar–Nov"},
      {name:"Disc Golf",icon:"disc",desc:"Free 9-hole disc golf course winding through the park's wooded areas.",season:"Year-round"},
      {name:"Tennis",icon:"disc",desc:"Multiple public tennis courts available first-come, first-served.",season:"Year-round"}],
    amenities:["Restrooms","Picnic Shelters","Rose Garden","Playground","Golf Course","Tennis Courts","Parking"],
    rules_allowed:["Leashed dogs","Cycling on paths","Picnics","Photography"],
    rules_prohibited:["Motorized vehicles","Camping","Swimming in creek","Amplified music"]},

  {id:"memorial-park",name:"Memorial Park",nickname:"Memorial",tagline:"Omaha's Concert Lawn",
    desc:"A sprawling 83-acre park in Central Omaha known for summer concerts, community events, and open green space. Home to large-scale events and a popular running loop. The park honors veterans with memorial installations.",
    address:"6005 Underwood Ave, Omaha, NE 68132",lat:41.262,lng:-95.975,phone:"402-444-5900",website:"https://parks.cityofomaha.org",
    hours:"5 AM – 11 PM Daily",admission:"Free",acreage:83,color:"#FFB74D",
    tags:["Concerts","Events","Free"],img:"/images/parks/memorial-park.jpg",icon:"🎶",
    trails:[
      {name:"Memorial Loop",distance:"1.5 mi",surface:"Paved",difficulty:"Easy",desc:"Paved loop around the park perimeter. Popular morning running route.",features:["Flat","Lit at Night","Year-Round"]}],
    activities:[
      {name:"Summer Concerts",icon:"music",desc:"Major concert events and festivals on the Great Lawn throughout summer.",season:"Jun–Sep"},
      {name:"Running",icon:"trail",desc:"One of Omaha's most popular running loops with a flat, paved 1.5-mile path.",season:"Year-round"},
      {name:"Open Space",icon:"sun",desc:"83 acres of open lawn perfect for frisbee, kite flying, picnics, and casual sports.",season:"Year-round"}],
    amenities:["Restrooms","Event Stage","Large Parking","Open Lawn","Veterans Memorials","Playground"],
    rules_allowed:["Leashed dogs","Picnics","Photography","Kites and sports"],
    rules_prohibited:["Glass containers during events","Motorized vehicles","Camping","Fireworks"]},

  {id:"chalco-hills",name:"Chalco Hills",nickname:"Chalco",tagline:"Prairie Trails & Nature Center",
    desc:"A 1,186-acre recreation area in southwest Omaha featuring Wehrspann Lake, restored prairie, and an excellent nature center. The 8-mile trail loop around the lake offers rolling hills and diverse habitats.",
    address:"8901 S 154th St, Omaha, NE 68138",lat:41.18,lng:-96.13,phone:"402-444-5900",website:"https://parks.cityofomaha.org",
    hours:"5 AM – 11 PM Daily",admission:"Free",acreage:1186,color:"#C49A6C",
    tags:["Prairie","Trails","Nature Center","Free"],img:"/images/parks/chalco-hills.jpg",icon:"🦅",
    lake:{acres:255,maxDepth:"15 ft",
      species:[{name:"Largemouth Bass",note:"Good populations"},{name:"Channel Catfish",note:"Stocked regularly"},{name:"Bluegill",note:"Excellent for families"},{name:"Wipers",note:"White bass hybrid — stocked"}],
      license:"Required for ages 16+ — Nebraska permit",licenseUrl:"https://outdoornebraska.gov",
      spots:["Fishing pier on east shore","Shoreline access around loop","Dam area (south)"],
      rules:["Electric and non-motorized boats only","Standard Nebraska regulations","No swimming"]},
    trails:[
      {name:"Wehrspann Lake Loop",distance:"8.1 mi",surface:"Gravel / Paved",difficulty:"Easy–Moderate",desc:"Full lake loop with gently rolling hills, prairie sections, and tree-lined stretches. Mixed surface.",features:["Water Stations","Rolling Hills","Mixed Surface","Year-Round"]},
      {name:"Prairie Trail",distance:"2.5 mi",surface:"Natural",difficulty:"Easy",desc:"Interpretive nature trail through restored tallgrass prairie with wildflowers in season.",features:["Educational Signs","Wildflowers","Birding"]}],
    activities:[
      {name:"Nature Center",icon:"info",desc:"Chalco Hills Nature Center with interactive exhibits, live animals, and nature programs.",season:"Year-round"},
      {name:"Birding",icon:"bird",desc:"Prairie and wetland habitats attract diverse species including hawks, herons, and migratory songbirds.",season:"Year-round"},
      {name:"Trail Running",icon:"trail",desc:"Popular with trail runners for the varied terrain and rolling hills around the lake.",season:"Year-round"}],
    amenities:["Nature Center","Restrooms","Parking","Picnic Shelters","Fishing Pier","Boat Ramp"],
    rules_allowed:["Leashed dogs","Non-motorized boats","Fishing with license","Cross-country skiing in winter"],
    rules_prohibited:["Gas-powered boats","Swimming","Motorized vehicles on trails","Camping"]},

  {id:"walnut-creek",name:"Walnut Creek Lake",nickname:"Walnut Creek",tagline:"Papillion's Lakeside Retreat",
    desc:"A 450-acre recreation area featuring a 105-acre lake, modern playground, and paved trails in Papillion. Great for fishing, kayaking, and family outings with newer facilities and easy highway access.",
    address:"14725 Hwy 370, Papillion, NE 68046",lat:41.168,lng:-96.02,phone:"402-444-5900",website:"https://parks.cityofomaha.org",
    hours:"5 AM – 11 PM Daily",admission:"Free",acreage:450,color:"#5DADE2",
    tags:["Lake","Family","Kayaking","Free"],img:"/images/parks/walnut-creek.jpg",icon:"🛶",
    lake:{acres:105,maxDepth:"16 ft",
      species:[{name:"Largemouth Bass",note:"Good numbers"},{name:"Channel Catfish",note:"Stocked annually"},{name:"Bluegill",note:"Abundant"},{name:"Crappie",note:"Spring runs"}],
      license:"Required for ages 16+ — Nebraska permit",licenseUrl:"https://outdoornebraska.gov",
      spots:["Fishing pier near parking","Multiple shoreline access points"],
      rules:["Electric motors only","No swimming","Standard Nebraska regulations"]},
    trails:[
      {name:"Lake Loop",distance:"3.7 mi",surface:"Paved",difficulty:"Easy",desc:"Flat paved loop around the lake with benches and lake views throughout.",features:["ADA Accessible","Family-Friendly","Flat","Year-Round"]}],
    activities:[
      {name:"Kayak & SUP",icon:"kayak",desc:"Public kayak launch with easy lake access. Calm waters ideal for beginners.",season:"Apr–Oct"},
      {name:"Playground",icon:"splash",desc:"Modern all-abilities playground near the main parking area.",season:"Year-round"},
      {name:"Fishing",icon:"fish",desc:"Well-stocked lake with pier and shoreline access. Popular family fishing spot.",season:"Year-round"}],
    amenities:["Restrooms","Modern Playground","Kayak Launch","Fishing Pier","Picnic Shelters","Parking"],
    rules_allowed:["Kayaks and canoes","Leashed dogs","Fishing with license","Electric motors"],
    rules_prohibited:["Gas-powered boats","Swimming","Jet skis","Camping"]},

  {id:"turner-park",name:"Turner Park",nickname:"Turner",tagline:"Midtown's Cultural Green",
    desc:"A beloved 10-acre urban park at Midtown Crossing, home to Jazz on the Green (free summer concert series), the Omaha Farmers Market winter location, and seasonal ice rink. Surrounded by restaurants and shops.",
    address:"3110 Farnam St, Omaha, NE 68131",lat:41.255,lng:-95.96,phone:"402-444-5900",website:"https://midtowncrossing.com",
    hours:"6 AM – 11 PM Daily",admission:"Free",acreage:10,color:"#D4AD65",
    tags:["Jazz","Events","Free","Dining"],img:"/images/parks/turner-park.jpg",icon:"🎵",
    activities:[
      {name:"Jazz on the Green",icon:"music",desc:"Free Thursday evening jazz concerts all summer. Bring wine, picnic blankets, and friends.",season:"Jun–Aug"},
      {name:"Ice Rink",icon:"splash",desc:"Outdoor ice skating rink at Midtown Crossing during winter months.",season:"Nov–Feb"},
      {name:"Farmers Market",icon:"food",desc:"Winter Omaha Farmers Market held at Midtown Crossing on Saturdays.",season:"Nov–Apr"}],
    amenities:["Restrooms (in Midtown Crossing)","Restaurants Nearby","Parking Garage","Event Lawn","Seating"],
    rules_allowed:["Wine and beer at events","Leashed dogs","Picnics on lawn","Photography"],
    rules_prohibited:["Glass containers during events","Amplified music without permit","Camping","Grills"]},
];
const HOODS=[
  {id:"old-market",name:"Old Market",sub:"Downtown",desc:"Cobblestone streets, galleries, chef-driven restaurants, and Omaha's best nightlife. The cultural heart of the city since the 1800s.",lat:41.2555,lng:-95.932,color:"#5EC4B6",
    imgs:["/images/hoods/old-market-1.jpg","/images/hoods/old-market-2.jpg","/images/hoods/old-market-3.jpg"],
    history:"The Old Market began as a wholesale fruit and vegetable market in the late 1800s. The brick warehouses along Howard and Jones streets housed produce dealers until the 1960s, when artists and entrepreneurs began converting the abandoned spaces into galleries and studios. A pivotal restoration movement in the 1970s preserved the cobblestone streets and iron facades that define the district today. The Passageway, M's Pub (before the 2015 fire), and the Artists Cooperative Gallery were early anchors that proved mixed-use urban revitalization could work.",
    walk:{name:"Old Market Loop",distance:"1.2 mi",time:"45 min",steps:["Start at 10th & Howard by the flower murals","Walk south on 10th — peek into Jackson Street galleries","Cut through The Passageway to Jones Street","West on Jones past Upstream Brewing and M's Pub site","South on 13th to the Bemis Center for Contemporary Arts","Circle back via Howard Street for restaurants and shops"]},
    spots:[
      /* ── Restaurants ── */
      {name:"Le Bouillon",type:"Restaurant",cat:"eat",desc:"Modern French farm-to-table. Attached wine shop & basement wine bar Mon Càve.",addr:"1017 Howard",price:"$$$",icon:"🇫🇷",known:"French onion soup, duck confit"},
      {name:"M's Pub",type:"Restaurant",cat:"eat",desc:"Old Market institution since 1973. Continental cuisine, legendary lavosh.",addr:"422 S 11th",price:"$$$",icon:"🍽️",url:"https://www.mspubomaha.com",known:"Lavosh, shrimp scampi"},
      {name:"Plank Seafood",type:"Restaurant",cat:"eat",desc:"Oyster bar and grilled seafood with a raw bar.",addr:"1111 Howard",price:"$$$",icon:"🦪",known:"Oysters, seafood platters"},
      {name:"Kitchen Table",type:"Restaurant",cat:"eat",desc:"Farm-to-table with an on-site hydroponic farm.",addr:"1415 Farnam",price:"$$$",icon:"🌿",known:"Seasonal menu, hydroponic farm"},
      {name:"Upstream Brewing",type:"Brewpub",cat:"eat",desc:"Award-winning craft beers and upscale pub fare since 1996.",addr:"514 S 11th",price:"$$",icon:"🍺",known:"House beers, thin-crust pizza"},
      {name:"Twisted Fork",type:"Restaurant",cat:"eat",desc:"Cowboy-inspired comfort food. Hearty portions.",addr:"1101 Jackson",price:"$$",icon:"🤠",known:"Chicken fried steak, smoked wings"},
      {name:"Jackson Street Tavern",type:"Restaurant",cat:"eat",desc:"American tapas and international small plates.",addr:"1125 Jackson",price:"$$",icon:"🍻",known:"Tapas, happy hour, patio"},
      {name:"Nicola's Italian",type:"Restaurant",cat:"eat",desc:"Intimate Italian with the best patio in the Market.",addr:"521 S 13th",price:"$$$",icon:"🍝",known:"Handmade pasta, patio"},
      {name:"Gather",type:"Restaurant",cat:"eat",desc:"Modern American with elegant open dining room.",addr:"1108 Howard",price:"$$$",icon:"🍷",known:"Prix fixe, cocktails, brunch"},
      {name:"Dolci",type:"Bakery",cat:"eat",desc:"European pastry shop — croissants, tarts, macarons.",addr:"1110 Howard",price:"$",icon:"🥐",known:"Croissants, French macarons"},
      /* ── Bars ── */
      {name:"Mr. Toad's Pub",type:"Bar",cat:"drink",desc:"Prime people-watching patio with string lights. An Old Market classic.",addr:"1022 Howard",price:"$$",icon:"🍺",known:"Outdoor patio, craft beer"},
      {name:"The Dubliner",type:"Irish Pub",cat:"drink",desc:"Feels like St. Patrick's Day every night. Live music weekends.",addr:"1205 Harney",price:"$$",icon:"🍀",known:"Irish whiskey, live music"},
      {name:"Brickway Brewery",type:"Brewery & Distillery",cat:"drink",desc:"Craft brewery and distillery. Tour the operation, taste the results.",addr:"1116 Jackson",price:"$$",icon:"🥃",known:"Craft beer, brewery tours"},
      {name:"Laka Lono Rum Club",type:"Tiki Bar",cat:"drink",desc:"Tropical tiki bar with flaming cocktails and Polynesian vibes.",addr:"1111 Howard",price:"$$",icon:"🌺",known:"Flaming drinks, rum cocktails"},
      /* ── Coffee & Sweets ── */
      {name:"Ted & Wally's",type:"Ice Cream",cat:"sweet",desc:"Scratch-made premium ice cream since 1984. Old Market original.",addr:"1120 Jackson",price:"$",icon:"🍦",known:"Handmade, seasonal flavors"},
      {name:"Old Market Candy Shop",type:"Candy",cat:"sweet",desc:"Handmade truffles, fudge, and the famous Mud Balls.",addr:"1019 Howard",price:"$",icon:"🍫",known:"Mud Balls, truffles"},
      {name:"Hollywood Candy",type:"Candy & Vintage",cat:"sweet",desc:"Massive retro candy warehouse with old-fashioned soda fountain.",addr:"1209 Jackson",price:"$",icon:"🍭",known:"Retro candy, soda fountain"},
      {name:"Table Coffee",type:"Coffee",cat:"sweet",desc:"Full-menu coffee shop with sandwiches and baked goods.",addr:"Old Market",price:"$",icon:"☕",known:"Espresso, pastries, lunch"},
      /* ── Shopping ── */
      {name:"Raygun",type:"Gift Shop",cat:"shop",desc:"Midwest pride in t-shirt form. Witty, irreverent, locally loved.",addr:"1108 Jackson",price:"$$",icon:"👕",known:"Omaha/Midwest shirts, stickers"},
      {name:"Goldsmith Silversmith",type:"Jewelry",cat:"shop",desc:"Custom handcrafted jewelry in the Old Market Passageway.",addr:"1026 Howard",price:"$$$",icon:"💎",known:"Custom rings, local artisans"},
      {name:"Made in Omaha",type:"Gift Shop",cat:"shop",desc:"All Omaha creators — apparel, art, food, and gifts.",addr:"Old Market",price:"$$",icon:"🎁",known:"Local makers, Omaha souvenirs"},
      {name:"Homer's Music",type:"Record Shop",cat:"shop",desc:"Vinyl paradise. New and used records since 1974.",addr:"1114 Howard",price:"$$",icon:"🎵",known:"Vinyl, CDs, local music"},
      {name:"Artists' Co-op Gallery",type:"Gallery",cat:"shop",desc:"Member-owned gallery showcasing local artists.",addr:"405 S 11th",price:"Free",icon:"🎨",known:"Local art, First Friday"},
      /* ── Entertainment ── */
      {name:"KANEKO",type:"Art & Culture",cat:"play",desc:"Unique creativity space — art, performances, installations.",addr:"1111 Jones",price:"Free",icon:"🏛️",known:"Interactive exhibits, events"},
      {name:"Bemis Center",type:"Contemporary Art",cat:"play",desc:"International contemporary art with rotating exhibitions.",addr:"724 S 12th",price:"Free",icon:"🎭",known:"Artist residencies, exhibitions"},
      {name:"Gene Leahy Mall",type:"Park",cat:"play",desc:"Downtown oasis — slides, splash pad, hammocks, performance lawn.",addr:"Riverfront",price:"Free",icon:"🌳",known:"Playground, events, river views"},
      {name:"Bob Kerrey Bridge",type:"Landmark",cat:"play",desc:"Pedestrian bridge to Iowa. Stand in two states at once.",addr:"Riverfront Dr",price:"Free",icon:"🌉",known:"Sunset walks, two-state photo"}
    ],
    events:[{name:"Omaha Farmers Market",when:"Saturdays, May–Oct",desc:"Local produce, baked goods, and crafts."},{name:"Holiday Lights Festival",when:"Nov–Jan",desc:"200,000+ lights along the streets and buildings."},{name:"Old Market Stroll",when:"First Fridays",desc:"Gallery openings, specials, and live music."}],
    tags:["Dining","Nightlife","Shopping","Galleries","History","Cobblestone"],
    vibe:"Historic & Walkable",bestFor:"First-time visitors, date nights, weekend strolls"},
  {id:"benson",name:"Benson",sub:"Maple Street",desc:"Omaha's most eclectic neighborhood. Dive bars, vinyl shops, murals, and the undisputed indie music capital of the city.",lat:41.281,lng:-95.954,color:"#CE93D8",
    imgs:["/images/hoods/benson-1.jpg","/images/hoods/benson-2.jpg","/images/hoods/benson-3.jpg"],
    history:"Originally an independent city founded in 1887 by Erastus Benson, a railroad executive. It was annexed into Omaha in 1917 but never lost its fiercely independent spirit. The main drag, Maple Street, went through cycles of boom and decline before a creative renaissance in the 2000s. The Waiting Room opened in 2007, anchoring what became a nationally recognized indie music corridor. Today Benson has more live music per block than anywhere in Nebraska.",
    walk:{name:"Benson Main Drag",distance:"1.5 mi",time:"1 hr",steps:["Start at The Waiting Room (6212 Maple)","Walk west past vinyl shops and vintage stores","Detour south on 60th for murals and street art","Continue west to Reverb Lounge and Beercade","Hit Benson Brewery and Jake's Cigars","End at The Sydney for cocktails or O'Leaver's for punk rock"]},
    spots:[
      /* ── Restaurants ── */
      {name:"Au Courant",type:"Restaurant",cat:"eat",desc:"European-inspired regional kitchen. Chef's tasting menu is a splurge.",addr:"6064 Maple",price:"$$$",icon:"🍽️",known:"Tasting menu, seasonal plates"},
      {name:"Yoshitomo",type:"Restaurant",cat:"eat",desc:"Creative sushi with a devoted following. Omakase available.",addr:"6009 Maple",price:"$$$",icon:"🍣",known:"Omakase, creative rolls"},
      {name:"Little Riot",type:"Pizzeria",cat:"eat",desc:"Wood-fired pizza with global mashups. Rooftop bar.",addr:"Maple St",price:"$$",icon:"🍕",known:"Creative pizzas, rooftop patio"},
      {name:"Benson Brewery",type:"Brewpub",cat:"eat",desc:"Microbrewery with gastropub fare. Great patio.",addr:"6059 Maple",price:"$$",icon:"🍺",url:"https://www.bensonbrewery.com",known:"House beers, pub food, patio"},
      {name:"Taco Co.",type:"Taqueria",cat:"eat",desc:"Puffy shell tacos that inspire devotion.",addr:"6108 Maple",price:"$",icon:"🌮",known:"Puffy shell tacos, frozen margs"},
      {name:"Ika Ramen",type:"Restaurant",cat:"eat",desc:"Cozy ramen spot with rich broths.",addr:"6109 Maple",price:"$$",icon:"🍜",known:"Tonkotsu ramen, gyoza"},
      {name:"Bärchen Beer Garden",type:"Beer Garden",cat:"eat",desc:"Outdoor German-style beer garden.",addr:"6014 Maple",price:"$$",icon:"🥨",known:"Bärchen burger, German bier"},
      {name:"Edge of the Universe",type:"Restaurant",cat:"eat",desc:"Eclectic fare with a cosmic theme.",addr:"Maple St",price:"$$",icon:"🌌",known:"Creative dishes, unique vibes"},
      {name:"Jojo's Diner",type:"Diner",cat:"eat",desc:"New-school diner with great breakfast.",addr:"6118 Military",price:"$",icon:"🥞",known:"Breakfast, diner classics"},
      {name:"Star Deli",type:"Deli",cat:"eat",desc:"Crave-worthy sandwiches just off the main strip.",addr:"6114 Military",price:"$",icon:"🥪",known:"Signature sandwiches"},
      /* ── Bars ── */
      {name:"Krug Park",type:"Bar",cat:"drink",desc:"Restored 1908 building. Superb cocktails and perfect music.",addr:"6205 Maple",price:"$$",icon:"🍸",known:"Craft cocktails, 1908 building"},
      {name:"The Sydney",type:"Bar",cat:"drink",desc:"Dark, stylish cocktail lounge. Great for dates.",addr:"6067 Maple",price:"$$",icon:"🍹",known:"Cocktails, intimate setting"},
      {name:"Beercade",type:"Arcade Bar",cat:"drink",desc:"Classic arcade games + pinball + huge beer selection.",addr:"6104 Maple",price:"$",icon:"🕹️",known:"Pac-Man, pinball, craft beer"},
      {name:"Infusion Brewing",type:"Brewery",cat:"drink",desc:"Local craft brewery with rotating taps.",addr:"6115 Maple",price:"$$",icon:"🍺",known:"Rotating taps, taproom"},
      {name:"Jake's Cigars & Spirits",type:"Bar",cat:"drink",desc:"Cigar lounge meets whiskey bar.",addr:"6206 Maple",price:"$$",icon:"🚬",known:"Cigars, bourbon selection"},
      /* ── Coffee & Sweets ── */
      {name:"Ted & Wally's Benson",type:"Ice Cream",cat:"sweet",desc:"Second location of Omaha's beloved scratch-made ice cream.",addr:"6023 Maple",price:"$",icon:"🍦",known:"Handmade, seasonal flavors"},
      {name:"Legend Comics & Coffee",type:"Coffee",cat:"sweet",desc:"Coffee shop meets comic book store.",addr:"5207 Leavenworth",price:"$",icon:"📚",known:"Comics, espresso"},
      /* ── Shopping ── */
      {name:"Homer's Music",type:"Record Shop",cat:"shop",desc:"Vinyl heaven. Crate-digging is a Benson ritual.",addr:"Maple St",price:"$$",icon:"🎵",known:"Vinyl, used records"},
      {name:"Five Nine",type:"Stationery",cat:"shop",desc:"Curated paper goods and gifts.",addr:"Maple St",price:"$$",icon:"✉️",known:"Cards, stationery"},
      {name:"Found Vintage Market",type:"Vintage",cat:"shop",desc:"Restored furniture and home décor.",addr:"Maple St",price:"$$",icon:"🪑",known:"Vintage furniture"},
      /* ── Entertainment ── */
      {name:"The Waiting Room",type:"Music Venue",cat:"play",desc:"Omaha's premier indie venue since 2007. National and local acts.",addr:"6212 Maple",price:"$15-40",icon:"🎤",known:"Indie concerts, intimate stage"},
      {name:"Reverb Lounge",type:"Music Venue",cat:"play",desc:"Intimate shows next to Waiting Room.",addr:"6121 Military",price:"$10-25",icon:"🎵",known:"Emerging artists, DJ nights"},
      {name:"Benson Theatre",type:"Historic Theater",cat:"play",desc:"1920s theater — live events and screenings.",addr:"6054 Maple",price:"Varies",icon:"🎬",known:"Historic venue, events"}
    ],
    events:[{name:"Benson First Friday",when:"First Fridays",desc:"Monthly art walk, gallery openings, food & drink specials."},{name:"Benson Beer Fest",when:"Summer",desc:"Street party with 50+ craft beers and live music."}],
    tags:["Music","Bars","Vintage","Murals","Indie","Record Shops"],
    vibe:"Eclectic & Creative",bestFor:"Music lovers, night owls, creatives"},
  {id:"dundee",name:"Dundee",sub:"Memorial Park Area",desc:"Tree-lined streets, walkable restaurants on Underwood Ave, and Elmwood Park trails. Classic Omaha at its most charming.",lat:41.262,lng:-95.975,color:"#81C784",
    imgs:["/images/hoods/dundee-1.jpg","/images/hoods/dundee-2.jpg","/images/hoods/dundee-3.jpg"],
    history:"Dundee was platted in 1880 and developed as one of Omaha's first streetcar suburbs. The name comes from Dundee, Scotland. Warren Buffett has lived in the same Dundee house since 1958, purchased for $31,500. Happy Hollow Country Club (1907) and the historic Dundee Theater (1925, now a Film Streams location) anchor the neighborhood's century-old identity. Underwood Avenue's restaurant boom in the 2010s transformed a quiet residential strip into one of Omaha's top dining destinations.",
    walk:{name:"Dundee to Elmwood",distance:"2.1 mi",time:"1 hr",steps:["Start at 50th & Underwood — the restaurant corridor","Walk west past Dario's, Dante, and Pitch Pizzeria","Turn south on 52nd toward Elmwood Park","Loop through Elmwood's shaded trails and bridge","Return via Happy Hollow Blvd past historic homes","End at Dundee Dell for a beer"]},
    spots:[
      /* ── Restaurants ── */
      {name:"Avoli Osteria",type:"Restaurant",cat:"eat",desc:"Northern Italian. Handmade pasta, wood-fired dishes, great wine list.",addr:"5013 Underwood",price:"$$$",icon:"🍝",url:"http://www.avoliosteria.com",known:"Porchetta, seasonal risotto"},
      {name:"Pitch Pizzeria",type:"Restaurant",cat:"eat",desc:"Coal-fired Neapolitan pizza, craft cocktails. Always packed for good reason.",addr:"5021 Underwood",price:"$$",icon:"🍕",url:"https://pitchpizzeria.com",known:"Margherita pizza, grilled artichoke"},
      {name:"Ooh De Lally",type:"Restaurant",cat:"eat",desc:"Nonprofit restaurant in the old Marks Bistro space. The legendary mac & cheese lives on.",addr:"4916 Underwood",price:"$$",icon:"🍽️",url:"https://www.oohdelally.org",known:"Marks signature mac & cheese, brunch"},
      {name:"Acadian Grille",type:"Restaurant",cat:"eat",desc:"Cajun and Southern comfort. Gumbo, po'boys, blackened catfish.",addr:"4814 Underwood",price:"$$",icon:"🦐",url:"https://www.opentable.com/r/acadian-grille-dundee-omaha",known:"Po'boy, crawfish etouffee"},
      {name:"Jaipur",type:"Restaurant",cat:"eat",desc:"Indian cuisine on Underwood. Tikka masala, biryani, fresh naan.",addr:"5018 Underwood",price:"$$",icon:"🍛",known:"Chicken tikka masala, garlic naan"},
      {name:"Goldbergs",type:"Restaurant",cat:"eat",desc:"Burgers, beers, and legendary Bloody Marys. Patio scene in summer.",addr:"5008 Dodge",price:"$$",icon:"🍔",url:"http://www.goldbergsindundee.com",known:"Goldberg Burger, Bloody Mary bar"},
      {name:"Amsterdam Falafel & Kabob",type:"Restaurant",cat:"eat",desc:"European-style street food. Build-your-own falafel with 20+ toppings.",addr:"620 N 50th",price:"$",icon:"🥙",url:"http://www.eatafk.com",known:"Spicy falafel bowl, curry fries"},
      {name:"Good Lookin'",type:"Restaurant",cat:"eat",desc:"All-day brunch and breakfast. Colorful, inventive, always a line.",addr:"4919 Underwood",price:"$$",icon:"🥞",url:"https://www.reallygoodlookin.com",known:"Biscuits & gravy, breakfast sandwich"},
      {name:"Ahmad's Persian Cuisine",type:"Restaurant",cat:"eat",desc:"Authentic Persian dishes — kabobs, stews, saffron rice.",addr:"4646 Dodge",price:"$$",icon:"🫓",known:"Lamb kabob, ghormeh sabzi"},
      {name:"The Hollows",type:"Restaurant",cat:"eat",desc:"Upscale New American with a chef's counter and seasonal tasting menus.",addr:"5019 Underwood",price:"$$$",icon:"🌿",url:"https://thehollowsdundee.com",known:"Tasting menu, foraged ingredients"},
      {name:"Lola's",type:"Restaurant",cat:"eat",desc:"Cafe and wine bar inside Film Streams. Mediterranean small plates evenings.",addr:"4952 Dodge",price:"$$",icon:"🍷",url:"https://lolasomaha.com",known:"Charcuterie boards, natural wine"},
      {name:"Great Harvest Bread",type:"Bakery",cat:"eat",desc:"Fresh-baked artisan breads and sandwiches. The honey wheat is iconic.",addr:"4910 Underwood",price:"$",icon:"🍞",url:"http://www.greatharvestbreadomaha.com",known:"Honey wheat bread, turkey pesto sandwich"},
      {name:"Le Quartier",type:"Bakery",cat:"eat",desc:"Fine French bakery — croissants, pain au chocolat, artisan cakes.",addr:"5026 Underwood",price:"$$",icon:"🥐",url:"http://lequartierbakingco.com",known:"Croissants, fruit tarts, petit fours"},
      {name:"Cupcake Omaha",type:"Bakery",cat:"eat",desc:"Gourmet cupcakes with rotating seasonal flavors.",addr:"107 N 50th",price:"$",icon:"🧁",url:"http://cupcakeomaha.net",known:"Red velvet, salted caramel"},
      /* ── Bars & Drinks ── */
      {name:"Dundee Dell",type:"Bar & Restaurant",cat:"drink",desc:"Omaha's oldest restaurant (est. 1915). Legendary fish & chips, 700+ scotch whiskies, The Pine Room.",addr:"5007 Underwood",price:"$$",icon:"🥃",url:"https://dundeedell.com",known:"Fish & chips, scotch collection, Pine Room"},
      {name:"Pageturners Lounge",type:"Bar",cat:"drink",desc:"Neighborhood cocktail bar with book-club energy. Trivia, live music, events.",addr:"5004 Dodge",price:"$$",icon:"📖",url:"https://www.pageturnersomaha.com",known:"Craft cocktails, trivia nights"},
      {name:"Underwood Bar",type:"Bar",cat:"drink",desc:"Low-key neighborhood hangout. Good beer selection, no pretension.",addr:"4918 Underwood",price:"$",icon:"🍺",known:"Local drafts, casual vibes"},
      {name:"Fox Den at Ooh De Lally",type:"Bar",cat:"drink",desc:"Intimate cocktail den upstairs at Ooh De Lally. Dark, moody, great drinks.",addr:"4916 Underwood",price:"$$",icon:"🍸",url:"https://www.oohdelally.org/fox-den",known:"Seasonal cocktails, intimate setting"},
      {name:"Dundee Cork & Bottle",type:"Wine Shop",cat:"drink",desc:"Curated wine shop with tastings and knowledgeable staff.",addr:"614 N 50th",price:"$$",icon:"🍷",known:"Wine tastings, local picks"},
      /* ── Coffee & Sweets ── */
      {name:"eCreamery",type:"Ice Cream",cat:"sweet",desc:"Gourmet ice cream. Oprah's favorite. Rumor has it Buffett & McCartney have been spotted here.",addr:"5001 Underwood",price:"$",icon:"🍦",url:"http://www.ecreamery.com",known:"Custom flavors, Shark Tank alum"},
      {name:"Blue Line Coffee",type:"Coffee",cat:"sweet",desc:"Specialty coffee roasted on-site. Clean, modern, plant-filled.",addr:"4924 Underwood",price:"$",icon:"☕",url:"http://www.bluelinecoffee.com",known:"Pour-over, cold brew, oat lattes"},
      {name:"Dundee Double Shot",type:"Coffee",cat:"sweet",desc:"Cozy indie coffee house. Espresso, pastries, neighborhood regulars.",addr:"118 N 50th",price:"$",icon:"☕",known:"Espresso, morning pastries"},
      {name:"Felius Cat Cafe",type:"Cafe & Cat Rescue",cat:"sweet",desc:"Nebraska's only cat cafe. Coffee, snacks, and adoptable cats roaming free. Saturday cat yoga.",addr:"5015 Dodge",price:"$",icon:"🐱",url:"https://felius.org",known:"Cat playroom ($10/30min), adoptions"},
      /* ── Shopping ── */
      {name:"Albany and Avers",type:"Vintage & Apparel",cat:"shop",desc:"Curated vintage, pre-owned, and new women's apparel. Hosts vinyl listening parties.",addr:"Underwood Ave",price:"$$",icon:"👗",known:"Vintage markets, Taylor Swift parties"},
      {name:"Exist Green",type:"Zero-Waste Boutique",cat:"shop",desc:"Omaha's only zero-waste store. Sustainable goods, refills, eco gifts.",addr:"Underwood Ave",price:"$$",icon:"♻️",known:"Refill station, eco lifestyle goods"},
      {name:"Dundee Candle Co.",type:"Candles & Gifts",cat:"shop",desc:"Pour your own custom candle. Unique scents and gift sets.",addr:"Underwood Ave",price:"$$",icon:"🕯️",known:"Custom candle pouring, gift sets"},
      {name:"Duck Duck Bottle Shop",type:"Bottle Shop",cat:"shop",desc:"Coming soon — curated natural wine and craft beer bottle shop.",addr:"4917 Underwood",price:"$$",icon:"🍾",known:"Natural wine, craft beer"},
      /* ── Entertainment ── */
      {name:"Film Streams Dundee",type:"Arthouse Cinema",cat:"play",desc:"Omaha's longest-running cinema (1925). Two screens: 300-seat Peggy Payne + 25-seat Microcinema. Katie's Video bookstore.",addr:"4952 Dodge",price:"$12",icon:"🎬",url:"https://filmstreams.org/dundee-theater",known:"Indie films, Dundee Hundee series"},
      {name:"Elmwood Park",type:"Park",cat:"play",desc:"Historic park with trails, disc golf, playground, and shaded picnic areas.",addr:"Dodge & 60th",price:"Free",icon:"🌳",known:"Trails, disc golf, playground"},
      {name:"Memorial Park",type:"Park",cat:"play",desc:"Omaha's premier green space. Running trails, concerts, July 4th fireworks.",addr:"63rd & Underwood",price:"Free",icon:"🏞️",known:"July 4th fireworks, running loop"},
    ],
    events:[{name:"Dundee Day",when:"September",desc:"Annual street festival with live music, food trucks, and family activities."},{name:"Memorial Park Fireworks",when:"July 4th",desc:"Omaha's biggest Independence Day celebration."}],
    tags:["Dining","Parks","Walking","Family","Film","Historic Homes"],
    vibe:"Charming & Walkable",bestFor:"Foodies, families, park lovers"},
  {id:"blackstone",name:"Blackstone",sub:"Farnam Street",desc:"Omaha's cocktail and culinary hub. Speakeasies, breweries, and chef-driven spots packed into a few electric blocks.",lat:41.259,lng:-95.965,color:"#FFB74D",
    imgs:["/images/hoods/blackstone-1.jpg","/images/hoods/blackstone-2.jpg","/images/hoods/blackstone-3.jpg"],
    history:"Named for the Blackstone Hotel (1916), this stretch of Farnam once housed Omaha's grandest lodging. The hotel hosted JFK, Nixon, and celebrities during its heyday. After decades of decline, a massive revitalization beginning around 2015 transformed the district into Omaha's premier cocktail and dining destination. The Blackstone Social, Scriptown Brewing, and a wave of chef-driven restaurants catalyzed the comeback. The historic hotel itself reopened as a Marriott Autograph Collection property.",
    walk:{name:"Blackstone Bar Hop",distance:"0.8 mi",time:"1.5 hrs",steps:["Start at Scriptown Brewing (38th & Farnam)","Walk east to Berry & Rye speakeasy","Cross to Nite Owl for craft cocktails","Hit Stirnella for dinner (or Yoshitomo for sushi)","End at Crescent Moon for Belgian ales"]},
    spots:[
      /* ── Restaurants ── */
      {name:"Crescent Moon",type:"Alehouse",cat:"eat",desc:"Home of Omaha's best Reuben — born here in the 1920s. Top beer bar nationally.",addr:"3578 Farnam",price:"$$",icon:"🥪",known:"Reuben, 600+ beers"},
      {name:"Early Bird",type:"Brunch",cat:"eat",desc:"Cereal pancakes, chicken & donuts. Omaha's most creative brunch.",addr:"3914 Farnam",price:"$$",icon:"🥞",known:"Fruity Pebble pancakes"},
      {name:"Noli's Pizzeria",type:"Pizzeria",cat:"eat",desc:"NY-style slices with specially-filtered water dough. Always a line.",addr:"4001 Farnam",price:"$",icon:"🍕",known:"Pizza by the slice"},
      {name:"Mula Mexican Kitchen",type:"Restaurant",cat:"eat",desc:"Trendy Mexican with a certified tequileria. Always packed.",addr:"3831 Farnam",price:"$$",icon:"🌮",known:"Tacos, tequila flights"},
      {name:"Koen Japanese BBQ",type:"Restaurant",cat:"eat",desc:"Tableside Japanese BBQ and izakaya.",addr:"Farnam St",price:"$$$",icon:"🔥",known:"Wagyu BBQ, izakaya plates"},
      {name:"HomeGrown",type:"Restaurant",cat:"eat",desc:"Locally sourced comfort food, seasonal menus.",addr:"3916 Farnam",price:"$$",icon:"🌿",known:"Farm-to-table bowls"},
      {name:"The Committee Chophouse",type:"Steakhouse",cat:"eat",desc:"Upscale chophouse with great steaks.",addr:"Farnam St",price:"$$$$",icon:"🥩",known:"Steaks, special occasions"},
      {name:"Cunningham's Pub",type:"Pub",cat:"eat",desc:"Classic pub food, solid beer list.",addr:"3903 Farnam",price:"$$",icon:"🍔",known:"Pub food, trivia nights"},
      /* ── Bars ── */
      {name:"Scriptown Brewing",type:"Brewery",cat:"drink",desc:"Craft beer brewed on-site in Blackstone.",addr:"3922 Farnam",price:"$$",icon:"🍺",known:"IPAs, seasonal brews"},
      {name:"Nite Owl",type:"Late Night Bar",cat:"drink",desc:"Retro-themed late-night spot. Creative bar food, movies on projectors.",addr:"3823 Farnam",price:"$$",icon:"🦉",known:"Tot-chos, late night"},
      {name:"Huber Haus",type:"Bier Hall",cat:"drink",desc:"German bier hall in the basement. Long tables, Das Boot.",addr:"3578 Farnam",price:"$$",icon:"🍻",known:"German beer, brats"},
      {name:"Little Ricky's",type:"Rooftop Bar",cat:"drink",desc:"One of Omaha's few rooftop bars.",addr:"Farnam St",price:"$$",icon:"🌇",known:"Rooftop patio, cocktails"},
      {name:"Corkscrew Wine",type:"Wine Bar",cat:"drink",desc:"Curated wine bar with cheese boards.",addr:"Farnam St",price:"$$",icon:"🍷",known:"Wine flights, cheese"},
      {name:"Red Lion Lounge",type:"Bar",cat:"drink",desc:"Laid-back. Cheap drinks, good conversation.",addr:"Farnam St",price:"$",icon:"🍺",known:"Dive vibes, chill"},
      {name:"Reno's Karaoke",type:"Karaoke",cat:"drink",desc:"Private karaoke rooms and full bar.",addr:"Farnam St",price:"$$",icon:"🎤",known:"Private rooms"},
      /* ── Coffee & Sweets ── */
      {name:"Coneflower Creamery",type:"Ice Cream",cat:"sweet",desc:"All made in-house, down to the sprinkles. Omaha's artisan ice cream.",addr:"4432 Leavenworth",price:"$",icon:"🍦",known:"Halva, honeycomb, cookie sandwiches"},
      {name:"Archetype Coffee",type:"Coffee",cat:"sweet",desc:"No-fuss specialty roaster. Simple, excellent.",addr:"3926 Farnam",price:"$",icon:"☕",known:"Single origin, espresso"},
      /* ── Entertainment ── */
      {name:"First Round",type:"Sports Bar",cat:"play",desc:"90s-themed, 30+ TVs, tons of GF options.",addr:"Farnam St",price:"$$",icon:"🏈",known:"Sports, retro, GF menu"},
      {name:"Cottonwood Hotel",type:"Boutique Hotel",cat:"play",desc:"Historic Blackstone Hotel (1916) reimagined. Beautiful lobby, Orleans Room.",addr:"302 S 36th",price:"$$$$",icon:"🏨",known:"Historic landmark, cocktails"}
    ],
    events:[{name:"Blackstone Block Party",when:"Summer",desc:"Street closures, live music, food vendors, and craft beer."}],
    tags:["Cocktails","Dining","Nightlife","Craft Beer","Speakeasy"],
    vibe:"Trendy & Buzzy",bestFor:"Date nights, cocktail enthusiasts, foodies"},
  {id:"north-downtown",name:"North Downtown",sub:"NoDo",desc:"The Slowdown, Film Streams, Steelhouse Omaha, and a growing creative corridor between downtown and the riverfront.",lat:41.2691,lng:-95.9251,color:"#64B5F6",
    imgs:["/images/hoods/north-downtown-1.jpg","/images/hoods/north-downtown-2.jpg","/images/hoods/north-downtown-3.jpg"],
    history:"Once warehouse district and rail yards, NoDo's transformation began with Saddle Creek Records relocating The Slowdown here in 2007. Film Streams' Ruth Sokolof Theater followed. The opening of Steelhouse Omaha (2024) and continued development around 14th and Webster have made this the live entertainment spine of the city. The area connects the Old Market to the north via a creative corridor that grows each year.",
    walk:{name:"NoDo Music Walk",distance:"1 mi",time:"40 min",steps:["Start at The Slowdown (14th & Mike Fahey)","Walk to Film Streams / Ruth Sokolof Theater","Continue south past Steelhouse Omaha","Detour east to the riverfront pedestrian bridge","Return via Capitol Avenue"]},
    spots:[
      {name:"Dolomiti Pizzeria",type:"Pizzeria",cat:"eat",desc:"Wood-fired sourdough pizza in Millwork Commons.",addr:"1125 N 13th",price:"$$",icon:"🍕",known:"Sourdough pizza, Italian wine"},
      {name:"Heirloom Fine Foods",type:"Market & Cafe",cat:"eat",desc:"Gourmet market, cafe, and prepared foods.",addr:"1210 Nicholas",price:"$$",icon:"🥗",known:"Prepared foods, gourmet market"},
      {name:"Trap Room",type:"Bar & Grill",cat:"eat",desc:"Neighborhood hangout near Slowdown.",addr:"N 14th St",price:"$$",icon:"🍔",known:"Burgers, cocktails"},
      {name:"Rally Coffee",type:"Coffee",cat:"sweet",desc:"Craft coffee in the Capitol District.",addr:"Capitol District",price:"$",icon:"☕",known:"Espresso, cold brew"},
      {name:"Coneflower Millwork",type:"Ice Cream",cat:"sweet",desc:"Second Coneflower with the cone window.",addr:"Millwork Commons",price:"$",icon:"🍦",known:"Artisan ice cream"},
      {name:"The Slowdown",type:"Music Venue",cat:"play",desc:"Omaha's flagship indie venue. Home of Saddle Creek Records.",addr:"729 N 14th",price:"$15-50",icon:"🎤",known:"Indie concerts, Saddle Creek"},
      {name:"Steelhouse Omaha",type:"Music Venue",cat:"play",desc:"Dynamic mid-size concert venue. Opened 2024.",addr:"NoDo",price:"$20-75",icon:"🎵",known:"National touring acts"},
      {name:"Film Streams Ruth Sokolof",type:"Cinema",cat:"play",desc:"Nonprofit arthouse cinema. Supported by Alexander Payne.",addr:"1340 Mike Fahey",price:"$12",icon:"🎬",known:"Art films, retrospectives"},
      {name:"Hot Shops Art Center",type:"Art Studios",cat:"play",desc:"Working artist studios — glassblowing, metalwork, galleries.",addr:"1301 Nicholas",price:"Free",icon:"🔥",known:"Open houses, demos"},
      {name:"CHI Health Center",type:"Arena",cat:"play",desc:"Major arena for concerts, sports, conventions.",addr:"455 N 10th",price:"Varies",icon:"🏟️",known:"Concerts, events"},
      {name:"Charles Schwab Field",type:"Ballpark",cat:"play",desc:"Home of NCAA College World Series.",addr:"1160 Mike Fahey",price:"Varies",icon:"⚾",known:"CWS, Creighton baseball"},
      {name:"The Fat Putter",type:"Mini Golf",cat:"play",desc:"Over-the-top themed mini golf.",addr:"NoDo",price:"$$",icon:"⛳",known:"Themed holes, family fun"}
    ],
    events:[{name:"Maha Music Festival",when:"August",desc:"Annual outdoor festival at Stinson Park featuring national acts."}],
    tags:["Music","Film","Arts","Venues","Live Shows"],
    vibe:"Creative & Up-and-Coming",bestFor:"Concertgoers, film buffs, night out"},
  {id:"little-italy",name:"Little Italy",sub:"South 10th Street",desc:"Historic neighborhood home to BLUEBARN Theatre, The Admiral, and authentic Italian spots. Gritty charm meets cultural depth.",lat:41.2543,lng:-95.9365,color:"#E8364F",
    imgs:["/images/hoods/little-italy-1.jpg","/images/hoods/little-italy-2.jpg","/images/hoods/little-italy-3.jpg"],
    history:"Italian immigrants began settling along South 10th Street in the 1890s, establishing bakeries, grocers, and social clubs. The Santa Lucia Festival (started 1925) is still celebrated annually. The former Sokol Auditorium, built by Czech immigrants, was reborn as The Admiral — now one of Omaha's best mid-size concert venues. BLUEBARN Theatre relocated here in 2016, adding contemporary theater to the neighborhood's cultural mix.",
    walk:{name:"Little Italy Heritage Walk",distance:"0.9 mi",time:"30 min",steps:["Start at Orsi's Italian Bakery (621 Pacific)","Walk south on 10th past historic storefronts","Visit the Sons of Italy Lodge marker","Continue to The Admiral / Sokol Auditorium","End at BLUEBARN Theatre"]},
    spots:[
      {name:"Orsi's Italian Bakery",type:"Bakery & Deli",cat:"eat",desc:"Family-run since 1919. Italian breads, sausages, groceries.",addr:"621 Pacific",price:"$",icon:"🍞",known:"Italian bread, sausage, cannoli"},
      {name:"La Casa",type:"Pizzeria",cat:"eat",desc:"Thin biscuity crust with Romano cheese. You either love it or you're wrong.",addr:"4432 Leavenworth",price:"$",icon:"🍕",known:"Thin-crust pizza, fried ravioli"},
      {name:"Salerno's II",type:"Restaurant",cat:"eat",desc:"Classic Italian-American. Red sauce, big portions.",addr:"S 10th St",price:"$$",icon:"🍝",known:"Pasta, family-style Italian"},
      {name:"The Underground Kitchen",type:"Supper Club",cat:"eat",desc:"Reservations-only. Intimate multi-course dinners.",addr:"S 13th St",price:"$$$$",icon:"🕯️",known:"Prix fixe, reservations only"},
      {name:"BLUEBARN Theatre",type:"Theater",cat:"play",desc:"Bold, intimate professional theater. Adventurous productions.",addr:"1106 S 10th",price:"$20-40",icon:"🎭",url:"https://bluebarn.org",known:"New plays, 100-seat space"},
      {name:"Sokol Auditorium",type:"Venue",cat:"play",desc:"Historic hall hosting punk, metal, indie, and community events.",addr:"S 13th St",price:"$10-30",icon:"🎸",known:"All-ages shows, punk/indie"},
      {name:"El Museo Latino",type:"Museum",cat:"play",desc:"Latino art and history museum.",addr:"4701 S 25th",price:"$5",icon:"🏛️",known:"Latino art, cultural exhibits"},
      {name:"St. Cecilia's Cathedral",type:"Landmark",cat:"play",desc:"Stunning Spanish Colonial Revival cathedral.",addr:"701 N 40th",price:"Free",icon:"⛪",known:"Architecture, stained glass"}
    ],
    events:[{name:"Santa Lucia Festival",when:"June",desc:"Annual celebration of Italian heritage with procession, food, and music since 1925."}],
    tags:["Theater","Music","Italian","Heritage","Bakeries"],
    vibe:"Historic & Authentic",bestFor:"Theater fans, history buffs, Italian food lovers"},
  {id:"aksarben",name:"Aksarben Village",sub:"67th & Center",desc:"Modern mixed-use with Stinson Park, restaurants, Baxter Arena, and year-round community events.",lat:41.244,lng:-95.96,color:"#B39DDB",
    imgs:["/images/hoods/aksarben-1.jpg","/images/hoods/aksarben-2.jpg","/images/hoods/aksarben-3.jpg"],
    history:"The name is 'Nebraska' spelled backward. The original Ak-Sar-Ben racetrack and coliseum (1919–1995) hosted horse racing, rodeos, and the famous Ak-Sar-Ben Ball. The 250-acre site was redeveloped starting in 2007 into a mixed-use village anchored by Stinson Park and Baxter Arena (home of UNO Mavericks). The development is considered one of the most successful urban revitalization projects in the Midwest.",
    spots:[
      {name:"Flagship Commons",type:"Food Hall",cat:"eat",desc:"Multi-vendor food hall. Something for everyone.",addr:"Aksarben Village",price:"$$",icon:"🍱",known:"Multiple vendors, communal tables"},
      {name:"Voodoo Taco",type:"Taqueria",cat:"eat",desc:"Creative tacos with wild toppings.",addr:"Aksarben Village",price:"$",icon:"🌮",url:"https://www.voodootaco.com",known:"Creative tacos, cocktails"},
      {name:"Spirit World",type:"Restaurant",cat:"eat",desc:"Global street food and encyclopedic cocktail program.",addr:"Aksarben Village",price:"$$",icon:"🌍",known:"Global bites, 300+ spirits"},
      {name:"Jones Bros. Cupcakes",type:"Bakery",cat:"sweet",desc:"Gourmet cupcakes in seasonal flavors.",addr:"Aksarben Village",price:"$",icon:"🧁",known:"Cupcakes, seasonal flavors"},
      {name:"Betty Rae's",type:"Ice Cream",cat:"sweet",desc:"KC-based artisan ice cream. First Nebraska location.",addr:"Near Aksarben",price:"$",icon:"🍦",known:"Artisan flavors"},
      {name:"DJ's Dugout",type:"Sports Bar",cat:"drink",desc:"Go-to sports bar with tons of TVs.",addr:"Aksarben Village",price:"$",icon:"🏈",known:"Game day, wings"},
      {name:"Stinson Park",type:"Park",cat:"play",desc:"Green heart of Aksarben. MAHA Festival, farmer's market.",addr:"Aksarben Village",price:"Free",icon:"🌳",known:"MAHA, farmer's market"},
      {name:"Baxter Arena",type:"Arena",cat:"play",desc:"UNO Mavericks home court. Concerts and events.",addr:"67th & Center",price:"Varies",icon:"🏟️",known:"UNO sports, concerts"},
      {name:"Farmer's Market",type:"Market",cat:"play",desc:"Saturday mornings May-Oct. Local produce, baked goods.",addr:"Aksarben Village",price:"Free",icon:"🥬",known:"Local produce, Saturdays"}
    ],
    events:[{name:"Aksarben Stock Show",when:"September",desc:"Agriculture expo, rodeo, and carnival."},{name:"Food Truck Fridays",when:"Summer Fridays",desc:"Rotating trucks at Stinson Park."}],
    tags:["Parks","Events","Dining","Family","Arena"],
    vibe:"Modern & Community",bestFor:"Families, UNO fans, festival-goers"},
  {id:"west-omaha",name:"West Omaha",sub:"144th to Elkhorn",desc:"Suburban dining, Barnato lounge, Zorinsky Lake, and family-friendly activities. Where Omaha spreads out.",lat:41.258,lng:-96.07,color:"#4DD0E1",
    imgs:["/images/hoods/west-omaha-1.jpg","/images/hoods/west-omaha-2.jpg","/images/hoods/west-omaha-3.jpg"],
    history:"West Omaha's rapid expansion began in the 1990s as families moved to newly developed subdivisions. Village Pointe shopping center, the Funny Bone comedy club, and Barnato (an art-deco music lounge attached to a Bentley dealership) represent the eclectic mix of suburban convenience and unexpected cultural offerings.",
    spots:[
      {name:"Barnato",type:"Lounge",cat:"eat",desc:"Art-deco cocktail lounge attached to the Bentley dealership. And it's great.",addr:"West Dodge",price:"$$$",icon:"🍸",known:"Craft cocktails, art-deco"},
      {name:"Mahogany Prime",type:"Steakhouse",cat:"eat",desc:"West Omaha's premier steakhouse.",addr:"West Dodge Rd",price:"$$$$",icon:"🥩",known:"Prime steaks, wine cellar"},
      {name:"Shucks Fish House",type:"Seafood",cat:"eat",desc:"Casual seafood with great oysters.",addr:"West Omaha",price:"$$",icon:"🦐",known:"Oysters, fish tacos"},
      {name:"Funny Bone",type:"Comedy Club",cat:"play",desc:"National touring comedians and local acts.",addr:"17305 Dayton Cir",price:"$20-50",icon:"😂",known:"Stand-up comedy, dinner shows"},
      {name:"Zorinsky Lake",type:"Park",cat:"play",desc:"360-acre lake with 6-mile trail loop.",addr:"156th & F St",price:"Free",icon:"🏞️",known:"Running/biking, fishing"},
      {name:"Village Pointe",type:"Shopping",cat:"shop",desc:"Open-air lifestyle center.",addr:"168th & Dodge",price:"Varies",icon:"🛍️",known:"Shopping, dining, events"},
      {name:"TopGolf",type:"Entertainment",cat:"play",desc:"High-tech driving range with food and drinks.",addr:"West Omaha",price:"$$",icon:"⛳",known:"Golf bays, food & drinks"}
    ],
    events:[{name:"Elkhorn Days",when:"August",desc:"Small-town festival with parade, carnival, and fireworks."}],
    tags:["Family","Dining","Parks","Comedy","Shopping"],
    vibe:"Suburban & Varied",bestFor:"Families, comedy fans, lake lovers"},
  {id:"south-omaha",name:"South Omaha",sub:"24th & L Street",desc:"Authentic taquerias, the Zoo, Lauritzen Gardens, and deep cultural roots. Omaha's most flavorful neighborhood.",lat:41.23,lng:-95.94,color:"#FF8A65",
    imgs:["/images/hoods/south-omaha-1.jpg","/images/hoods/south-omaha-2.jpg","/images/hoods/south-omaha-3.jpg"],
    history:"South Omaha was an independent city from 1886–1915, built around the Union Stockyards — once the world's largest livestock market. Waves of immigrants (Czech, Polish, Irish, Lithuanian, Mexican) came to work the yards. The stockyards closed in 1999, but the neighborhood's multicultural DNA endures. South 24th Street is now the heart of Omaha's vibrant Latino community, with some of the most authentic Mexican food between Chicago and Denver.",
    walk:{name:"South O Taco Trail",distance:"1.8 mi",time:"1 hr",steps:["Start at 24th & L Street","Walk south on 24th past taco trucks and taquerias","Stop at El Dorado for birria tacos","Continue to Jacobo's grocery for pan dulce","Detour east to the Golden Spike monument","End at Lauritzen Gardens or the Zoo"]},
    spots:[
      {name:"El Dorado",type:"Restaurant",cat:"eat",desc:"S. 24th Street icon. Parrilladas, ceviche, live mariachi weekends.",addr:"5025 S 24th",price:"$$",icon:"🇲🇽",known:"Seafood parrillada, mariachi"},
      {name:"Jacobo's Grocery",type:"Grocery & Taqueria",cat:"eat",desc:"Mexican grocery with incredible hot deli. Tamales, carnitas, tortas.",addr:"4621 S 24th",price:"$",icon:"🫔",known:"Tamales, carnitas, tortillas"},
      {name:"Johnny's Cafe",type:"Steakhouse",cat:"eat",desc:"Century-old steakhouse in the Stockyards. Family-run since 1922.",addr:"4702 S 27th",price:"$$$",icon:"🥩",known:"Prime rib, Stockyards history"},
      {name:"Taqueria Tijuana",type:"Taqueria",cat:"eat",desc:"Authentic street tacos — al pastor, lengua, cabeza.",addr:"S 24th St",price:"$",icon:"🌮",known:"Street tacos, al pastor"},
      {name:"La Herradura",type:"Restaurant",cat:"eat",desc:"Upscale Mexican seafood. Mariscos done right.",addr:"S 24th St",price:"$$",icon:"🦐",known:"Mariscos, aguachile"},
      {name:"Henry Doorly Zoo",type:"Zoo",cat:"play",desc:"World-class zoo. Indoor rainforest, desert dome, aquarium.",addr:"3701 S 10th",price:"$27",icon:"🦁",known:"Indoor jungle, desert dome"},
      {name:"Lauritzen Gardens",type:"Botanical Garden",cat:"play",desc:"100-acre garden with stunning conservatory.",addr:"100 Bancroft",price:"$14",icon:"🌺",known:"Rose garden, holiday displays"},
      {name:"El Museo Latino",type:"Museum",cat:"play",desc:"Latino art, history, and culture.",addr:"4701 S 25th",price:"$5",icon:"🏛️",known:"Heritage, art exhibits"},
      {name:"Mural Trail",type:"Public Art",cat:"play",desc:"Walking trail of murals celebrating immigrant heritage.",addr:"S 24th corridor",price:"Free",icon:"🎨",known:"Murals, heritage art"},
      {name:"Livestock Exchange",type:"Landmark",cat:"play",desc:"1926 Art Deco landmark. Once the world's largest stockyard nerve center.",addr:"4920 S 30th",price:"Free",icon:"🏛️",known:"Art Deco, Stockyards history"}
    ],
    events:[{name:"Cinco de Mayo",when:"May 5th",desc:"Mariachi, street food, folklorico dancing on 24th Street."},{name:"Dia de los Muertos",when:"November",desc:"Community altars, face painting, and celebration of life."}],
    tags:["Food","Culture","Zoo","Gardens","Latino","Tacos"],
    vibe:"Flavorful & Cultural",bestFor:"Foodies, culture seekers, families"},
  {id:"midtown",name:"Midtown Crossing",sub:"Turner Blvd",desc:"Turner Park, Mutual of Omaha campus, restaurants, and the summer home of Jazz on the Green.",lat:41.255,lng:-95.96,color:"#AED581",
    imgs:["/images/hoods/midtown-1.jpg","/images/hoods/midtown-2.jpg","/images/hoods/midtown-3.jpg"],
    history:"The Mutual of Omaha headquarters campus has anchored this area since 1957. Midtown Crossing, a mixed-use development opening in phases from 2009, brought residential towers, restaurants, and retail around Turner Park. Jazz on the Green (free outdoor concerts on Thursday evenings in summer) has been a beloved Omaha tradition since 1993.",
    spots:[
      {name:"Blue Sushi Sake Grill",type:"Restaurant",cat:"eat",desc:"Creative sushi and strong sake program.",addr:"Midtown Crossing",price:"$$",icon:"🍣",known:"Creative rolls, sake flights"},
      {name:"Taxi's Grille & Bar",type:"Restaurant",cat:"eat",desc:"Casual American dining with solid cocktails.",addr:"Midtown Crossing",price:"$$",icon:"🍗",known:"American classics, happy hour"},
      {name:"Pickleman's",type:"Cafe",cat:"eat",desc:"Gourmet sandwiches and salads. Quick lunch.",addr:"Midtown Crossing",price:"$",icon:"🥪",known:"Sandwiches, delivery"},
      {name:"The Jewell",type:"Jazz Club",cat:"drink",desc:"Intimate jazz lounge. Live performances Thu-Sat.",addr:"Midtown Crossing",price:"$$",icon:"🎷",known:"Live jazz, cocktails"},
      {name:"Kona Grill",type:"Bar & Restaurant",cat:"drink",desc:"Full bar, happy hour, global-inspired fare.",addr:"Midtown Crossing",price:"$$",icon:"🍹",known:"Happy hour, sushi"},
      {name:"Turner Park",type:"Park",cat:"play",desc:"Green heart of Midtown. Jazz on the Green free Thursdays all summer.",addr:"Midtown Crossing",price:"Free",icon:"🌳",known:"Jazz on the Green, events"},
      {name:"Mutual of Omaha HQ",type:"Landmark",cat:"play",desc:"Iconic mid-century tower (1957). The Indian Head logo building.",addr:"Dodge & 33rd",price:"Free",icon:"🏢",known:"Mid-century architecture"}
    ],
    events:[{name:"Jazz on the Green",when:"Thursdays, Jun–Aug",desc:"Free outdoor jazz concerts. Omaha's favorite summer tradition."}],
    tags:["Jazz","Dining","Events","Parks","Free"],
    vibe:"Relaxed & Musical",bestFor:"Jazz lovers, summer evenings, casual dining"},
];
const SEED_EVENTS=[
  {id:1,title:"Black Jacket Symphony",cat:"concerts",venue:"Steelhouse Omaha",city:"omaha",date:"Sat",time:"8 PM",price:"$35–65",emoji:"🎸",image:"/images/seeds/1.jpg",desc:"Pink Floyd's The Wall note-for-note with full visual production. Every song, every note — performed live with a full band, vocalists, and stunning visual effects that bring the album to life.",feat:true,doors:"6:30 PM",address:"1212 Douglas St, Omaha, NE 68102",venueType:"Performing Arts",capacity:"3,000",ageRestriction:"All Ages",url:"https://www.ticketmaster.com",tags:["Classic Rock","Live Music","Tribute","Arena Show"],lineup:[{name:"Black Jacket Symphony",role:"Headliner",time:"8:00 PM",img:"https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=200&h=200&fit=crop"},{name:"Local Opening Act",role:"Support",time:"7:00 PM",img:"https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&h=200&fit=crop"}],pricing:[{tier:"General Admission",price:"$35",note:"Standing room"},{tier:"Reserved Seating",price:"$55",note:"Balcony sections"},{tier:"VIP Experience",price:"$65",note:"Early entry + meet & greet"}]},
  {id:2,title:"Tig Notaro",cat:"comedy",venue:"Holland PAC",date:"Sat",time:"7:30 PM",price:"$45–85",emoji:"🎙️",image:"/images/seeds/2.jpg",desc:"Grammy-nominated deadpan comedy. Star of 'One Mississippi'.",feat:true},
  {id:3,title:"Creighton vs. DePaul",cat:"sports",venue:"CHI Health Center",city:"omaha",date:"Tue",time:"7 PM",price:"$25–90",emoji:"🏀",image:"/images/seeds/3.jpg",desc:"Big East basketball. Bluejays host DePaul at the CHI.",feat:true,broadcast:"FOX Sports",address:"455 N 10th St, Omaha, NE 68102",venueType:"Arena",capacity:"18,300",url:"https://www.ticketmaster.com",matchup:{home:{name:"Creighton",abbr:"CU",record:"22-5",rank:"#12",color:"#005CA9",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/156.png"},away:{name:"DePaul",abbr:"DPU",record:"11-16",color:"#005EB8",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/305.png"}},tags:["College Basketball","Big East","Rivalry"]},
  {id:4,title:"Nate Jackson Live",cat:"comedy",venue:"Steelhouse Omaha",city:"omaha",date:"Fri",time:"8 PM",price:"$40–80",emoji:"😂",image:"/images/seeds/4.jpg",desc:"Instagram-famous comedian with electric crowd work.",feat:true},
  {id:5,title:"Ethel Cain",cat:"concerts",venue:"The Astro",date:"Wed",time:"8 PM",price:"$40–75",emoji:"🕯️",image:"/images/seeds/5.jpg",desc:"Southern gothic sensation. 'Preacher's Daughter' live.",feat:true},
  {id:6,title:"LOVB Nebraska",cat:"sports",venue:"Baxter Arena",date:"Sat",time:"7 PM",price:"$20–50",emoji:"🏐",image:"/images/seeds/6.jpg",desc:"Pro volleyball. League One Volleyball's Nebraska franchise."},
  {id:7,title:"All Them Witches",cat:"concerts",venue:"The Slowdown",date:"Mon",time:"8 PM",price:"$25–35",emoji:"🎸",image:"/images/seeds/7.jpg",desc:"Heavy psychedelic rock double-header with King Buffalo."},
  {id:8,title:"Backline Improv",cat:"comedy",venue:"Backline Comedy",date:"Sat",time:"8 PM",price:"$10–15",emoji:"😂",image:"/images/seeds/8.jpg",desc:"House improv team takes audience suggestions and runs."},
  {id:9,title:"Storm Chasers Opener",cat:"sports",venue:"Werner Park",date:"Fri",time:"6:35 PM",price:"$12–45",emoji:"⚾",image:"/images/seeds/9.jpg",desc:"2026 MiLB season kickoff with postgame fireworks. The Omaha Storm Chasers, Triple-A affiliate of the Kansas City Royals, open the season with a Friday night fireworks spectacular.",feat:true,address:"12356 Ballpark Way, Papillion, NE 68046",venueType:"Ballpark",capacity:"9,023",url:"https://www.milb.com/omaha",tags:["Minor League Baseball","Fireworks","Family Night"],matchup:{home:{name:"Storm Chasers",abbr:"OMA",record:"",color:"#003DA5",logo:"https://www.milb.com/assets/images/logos/omaha.svg"},away:{name:"Iowa Cubs",abbr:"IOW",record:"",color:"#CC3433",logo:"https://www.milb.com/assets/images/logos/iowa.svg"}}},
  {id:10,title:"Pinewood Bowl Concert",cat:"concerts",venue:"Pinewood Bowl Theater",city:"lincoln",date:"Sat",time:"7 PM",price:"$25-55",emoji:"🎶",image:"/images/seeds/10.jpg",desc:"Outdoor amphitheater in Pioneers Park. Live music under the stars.",feat:false},
  {id:11,title:"Husker Volleyball",cat:"sports",venue:"Devaney Center",city:"lincoln",date:"Fri",time:"7 PM",price:"$15-40",emoji:"🏐",image:"/images/seeds/11.jpg",desc:"Nebraska volleyball at home. Electric atmosphere, sell-out crowd. The Huskers bring Big Ten volleyball action to Lincoln with one of the most passionate fanbases in all of college sports.",feat:true,broadcast:"Big Ten Network",address:"500 Stadium Dr, Lincoln, NE 68588",venueType:"Arena",capacity:"7,907",url:"https://huskers.com/tickets",tags:["College Volleyball","Big Ten","Nebraska"],matchup:{home:{name:"Nebraska",abbr:"NEB",record:"28-2",rank:"#2",color:"#E41C38",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/158.png"},away:{name:"Wisconsin",abbr:"WIS",record:"24-6",rank:"#7",color:"#C5050C",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/275.png"}}}
];
const EVENTS=[...SEED_EVENTS,...(INGESTED_EVENTS||[])];

/* ═══ VENUES ═══ */
const VENUES=[
  {id:1,name:"CHI Health Center",area:"North Downtown",cap:"18,300",type:"Arena",lat:41.2628,lng:-95.9257,desc:"Premier arena for the biggest global tours and Creighton Basketball.",url:"https://www.chihealthcenteromaha.com",img:"/images/venues/1.jpg",city:"omaha"},
  {id:2,name:"Baxter Arena",area:"Aksarben",cap:"7,898",type:"Arena",lat:41.2382,lng:-96.0115,desc:"UNO's multi-purpose venue hosting college sports, concerts, and community events.",url:"https://baxterarena.com",img:"/images/venues/2.jpg",city:"omaha"},
  {id:4,name:"Steelhouse Omaha",area:"North Downtown",cap:"3,000",type:"Performing Arts",lat:41.258,lng:-95.937,desc:"Modern, standing-room-heavy venue for large mid-tier touring bands.",url:"https://steelhouseomaha.com",img:"/images/venues/4.jpg",city:"omaha"},
  {id:5,name:"The Astro",area:"La Vista",cap:"2,500 / 5,500",type:"Arena",lat:41.2105,lng:-96.0475,desc:"Brand new dual-venue (indoor + amphitheater) for world-class acts.",url:"https://www.theastrotheater.com",img:"/images/venues/5.jpg",city:"omaha"},
  {id:6,name:"Orpheum Theater",area:"Downtown",cap:"2,600",type:"Performing Arts",lat:41.2582,lng:-95.9352,desc:"Historic 1927 theater hosting Broadway tours, comedians, and concerts.",url:"https://o-pa.org",img:"/images/venues/6.jpg",city:"omaha"},
  {id:7,name:"Holland PAC",area:"Downtown",cap:"2,000",type:"Performing Arts",lat:41.2606,lng:-95.9313,desc:"Acoustic marvel hosting the Omaha Symphony, jazz, and contemporary acts.",url:"https://o-pa.org",img:"/images/venues/7.jpg",city:"omaha"},
  {id:8,name:"The Slowdown",area:"North Downtown",cap:"500",type:"Indie / Club",lat:41.2691,lng:-95.9251,desc:"Iconic indie rock venue created by Saddle Creek Records.",url:"https://theslowdown.com",img:"/images/venues/8.jpg",city:"omaha"},
  {id:9,name:"The Waiting Room",area:"Benson",cap:"400",type:"Indie / Club",lat:41.281,lng:-95.954,desc:"Legendary heart of Omaha's alt/indie scene. A must-play for touring bands.",url:"https://waitingroomlounge.com",img:"/images/venues/9.jpg",city:"omaha"},
  {id:10,name:"Reverb Lounge",area:"Benson",cap:"150",type:"Indie / Club",lat:41.2808,lng:-95.9545,desc:"Sleek, mid-century modern listening room with great sound.",url:"https://reverblounge.com",img:"/images/venues/10.jpg",city:"omaha"},
  {id:11,name:"The Admiral",area:"Little Bohemia",cap:"1,500",type:"Indie / Club",lat:41.2525,lng:-95.9355,desc:"Formerly Sokol Auditorium — historic hall hosting punk, metal, hip-hop, EDM.",url:"https://www.admiralomaha.com",img:"/images/venues/11.jpg",city:"omaha"},
  {id:12,name:"Barnato",area:"West Omaha",cap:"600",type:"Indie / Club",lat:41.262,lng:-96.073,desc:"Upscale art-deco music lounge. Premium cocktails and vibes.",url:"https://barnato.bar",img:"/images/venues/12.jpg",city:"omaha"},
  {id:14,name:"Stir Concert Cove",area:"Council Bluffs",cap:"4,000",type:"Outdoor",lat:41.233,lng:-95.854,desc:"Lakeside outdoor amphitheater at Harrah's for summer concerts.",url:"https://www.stircove.com",img:"/images/venues/14.jpg",city:"cb"},
  {id:21,name:"Henry Doorly Zoo",area:"South Omaha",cap:"25,000+",type:"Museum / Attraction",lat:41.226,lng:-95.9287,desc:"World's best zoo. Desert Dome, Lied Jungle, and deep-sea aquarium.",url:"https://www.omahazoo.com",img:"/images/venues/21.jpg",city:"omaha"},
  {id:22,name:"Joslyn Art Museum",area:"Downtown",cap:"Varies",type:"Museum / Attraction",lat:41.2635,lng:-95.9394,desc:"World-class art museum with massive 42,000 sq ft expansion. Free admission.",url:"https://joslyn.org",img:"/images/venues/22.jpg",city:"omaha"},
  {id:23,name:"Film Streams",area:"North Downtown",cap:"285",type:"Performing Arts",lat:41.269,lng:-95.9255,desc:"Two-screen arthouse cinema. Curated indie and classic films.",url:"https://filmstreams.org",img:"/images/venues/23.jpg",city:"omaha"},
  {id:25,name:"Liberty First CU Arena",area:"Ralston",cap:"4,600",type:"Arena",lat:41.2033,lng:-96.0395,desc:"Large arena for country, rock, sports, and rodeos.",url:"https://www.libertyfirstcreditunionarena.com",img:"/images/venues/25.jpg",city:"omaha"},
  {id:30,name:"The Jewell",area:"Capitol District",cap:"Intimate",type:"Bar / Venue",lat:41.2577,lng:-95.9370,desc:"Omaha's premier jazz club. National and local jazz and blues.",url:"https://jewellomaha.com",img:"/images/venues/30.jpg",city:"omaha"},
  {id:38,name:"Kiewit Luminarium",area:"The RiverFront",cap:"Varies",type:"Museum / Attraction",lat:41.2565,lng:-95.9230,desc:"Interactive science center with 100+ hands-on exhibits.",url:"https://kiewitluminarium.org",img:"/images/venues/38.jpg",city:"omaha"},
  {id:40,name:"The Durham Museum",area:"Downtown",cap:"Varies",type:"Museum / Attraction",lat:41.2553,lng:-95.9310,desc:"Stunning 1931 art deco Union Station with train cars and soda fountain.",url:"https://durhammuseum.org",img:"/images/venues/40.jpg",city:"omaha"},
  {id:43,name:"Fontenelle Forest",area:"Bellevue",cap:"Varies",type:"Museum / Attraction",lat:41.1570,lng:-95.9000,desc:"2,000 acres of forest, wetlands, and boardwalk trails.",url:"https://fontenelleforest.org",img:"/images/venues/43.jpg",city:"omaha"},
  {id:50,name:"Funny Bone",area:"West Omaha",cap:"350",type:"Comedy Club",lat:41.2580,lng:-96.0700,desc:"Omaha's premier stand-up club for nationally touring comedians.",url:"https://omaha.funnybone.com",img:"/images/venues/50.jpg",city:"omaha"},
  {id:51,name:"Backline Comedy",area:"Downtown",cap:"150",type:"Comedy Club",lat:41.2555,lng:-95.9340,desc:"HQ for Omaha's local comedy. Improv, sketch, open mics, stand-up.",url:"https://backlinecomedy.com",img:"/images/venues/51.jpg",city:"omaha"},
  {id:60,name:"Pinewood Bowl Theater",area:"Pioneers Park",cap:"4,500",type:"Outdoor",lat:40.7885,lng:-96.7272,desc:"Lincoln's outdoor amphitheater in a wooded setting.",url:"https://pinewoodbowl.org",img:"/images/venues/60.jpg",city:"lincoln"},
  {id:61,name:"Bourbon Theatre",area:"Downtown Lincoln",cap:"800",type:"Indie / Club",lat:40.8136,lng:-96.7026,desc:"Lincoln's go-to live music venue for touring and local bands.",url:"https://bourbontheatre.com",img:"/images/venues/61.jpg",city:"lincoln"},
  {id:62,name:"Lied Center",area:"UNL Campus",cap:"2,200",type:"Performing Arts",lat:40.8206,lng:-96.7014,desc:"UNL's performing arts center. Broadway, dance, orchestra, comedy.",url:"https://liedcenter.org",img:"/images/venues/62.jpg",city:"lincoln"},
];
const VCATS=[{id:"all",label:"All"},{id:"Arena",label:"Arenas"},{id:"Performing Arts",label:"Performing Arts"},{id:"Indie / Club",label:"Indie / Club"},{id:"Comedy Club",label:"Comedy"},{id:"Bar / Venue",label:"Bars"},{id:"Museum / Attraction",label:"Museums"},{id:"Outdoor",label:"Outdoor"}];

/* ═══ EVENT FILTER CONSTANTS ═══ */
const ECATS=[{id:"all",label:"All",emoji:"📅"},{id:"concerts",label:"Concerts",emoji:"🎵"},{id:"sports",label:"Sports",emoji:"🏟️"},{id:"comedy",label:"Comedy",emoji:"😂"},{id:"family",label:"Family",emoji:"👨‍👩‍👧"},{id:"arts",label:"Arts",emoji:"🎭"},{id:"festivals",label:"Festivals",emoji:"🎪"}];
const ESUBS={concerts:["Rock","Country","Hip-Hop","Jazz","Electronic","Pop","Metal","Folk","R&B","Indie","Classical","Tribute","Live Music"],sports:["Basketball","Football","Baseball","Volleyball","Hockey","Soccer","Wrestling"],comedy:["Stand-Up","Improv","Open Mic"],family:["Museum","Zoo","Science","Outdoor","Workshop"],arts:["Theater","Musical","Dance","Orchestra","Film","Gallery","Opera"],festivals:["Food","Music","Cultural","Holiday"]};
const DATE_PRESETS=[{id:"all",label:"All Dates"},{id:"today",label:"Today"},{id:"week",label:"This Week"},{id:"month",label:"This Month"}];
function matchDate(ev,range){if(range==="all")return true;const d=ev.date?.match(/^\d{4}-\d{2}-\d{2}$/)?new Date(ev.date+"T12:00:00"):null;if(!d)return range==="today";const now=new Date();now.setHours(0,0,0,0);if(range==="today")return d.toDateString()===now.toDateString();if(range==="week"){const end=new Date(now);end.setDate(end.getDate()+7);return d>=now&&d<=end;}if(range==="month"){const end=new Date(now);end.setMonth(end.getMonth()+1);return d>=now&&d<=end;}return true;}
function matchSub(ev,sub){if(sub==="all")return true;const haystack=[...(ev.tags||[]),ev.title||"",ev.desc||""].join(" ").toLowerCase();return haystack.includes(sub.toLowerCase());}

/* ═══ REAL-TIME SUN POSITION ═══ */
const SUN_TABLE=[
  {sr:7.5,ss:17.2},{sr:7.1,ss:17.8},{sr:7.3,ss:19.3},{sr:6.5,ss:20},{sr:6,ss:20.5},
  {sr:5.8,ss:20.8},{sr:6,ss:20.7},{sr:6.4,ss:20.1},{sr:7,ss:19.3},{sr:7.4,ss:18.4},
  {sr:7,ss:17},{sr:7.4,ss:16.8}
];
function getNowTv(){
  const now=new Date(),mo=now.getMonth(),hr=now.getHours()+now.getMinutes()/60;
  const{sr,ss}=SUN_TABLE[mo];
  if(hr<=sr-1)return 95;if(hr<=sr)return 85+(sr-hr)*10;
  if(hr>=ss+1)return 95;if(hr>=ss)return 85+(hr-ss)*10;
  return 5+((hr-sr)/(ss-sr))*80;
}
const WX_ICONS={clear:"☀️",cloudy:"☁️",rainy:"🌧️",snowy:"❄️"};

/* ═══ APP ═══ */
export default function GOPrototype(){
  const[mounted,setMounted]=useState(false);
  const[nowTv,setNowTv]=useState(50);
  const[tv,setTv]=useState(50);
  const[isLive,setIsLive]=useState(true);
  const[drag,setDrag]=useState(false);
  const[weather,setWeather]=useState({temp:null,cond:"clear",icon:""});
  const[timeLabel,setTimeLabel]=useState("");
  const[cities,setCities]=useState(new Set(["omaha"]));
  const[venCat,setVenCat]=useState("all");
  const[spotCat,setSpotCat]=useState("all");
  const[parkTab,setParkTab]=useState("overview");
  const[w,setW]=useState(375);
  const[tab,setTab]=useState("today");
  const[prevTab,setPrevTab]=useState("today");
  const[favs,setFavs]=useState([]);
  const[evCat,setEvCat]=useState("all");
  const[evSub,setEvSub]=useState("all");
  const[dateRange,setDateRange]=useState("all");
  useEffect(()=>{setMounted(true);const nv=getNowTv();setNowTv(nv);setTv(nv);setW(window.innerWidth);const n=new Date(),h=n.getHours()%12||12,m=n.getMinutes();setTimeLabel(`${h}:${m<10?"0":""}${m} ${n.getHours()>=12?"PM":"AM"}`);},[]);
  useEffect(()=>{const h=()=>setW(window.innerWidth);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h)},[]);
  useEffect(()=>{const tick=()=>{const nv=getNowTv();setNowTv(nv);if(isLive)setTv(nv);const n=new Date(),h=n.getHours()%12||12,m=n.getMinutes();setTimeLabel(`${h}:${m<10?"0":""}${m} ${n.getHours()>=12?"PM":"AM"}`);};const id=setInterval(tick,60000);return()=>clearInterval(id);},[isLive]);
  useEffect(()=>{fetch("https://api.open-meteo.com/v1/forecast?latitude=41.26&longitude=-95.94&current=temperature_2m,weather_code&temperature_unit=fahrenheit").then(r=>r.json()).then(d=>{const t=Math.round(d.current.temperature_2m),wc=d.current.weather_code;const cond=wc<=1?"clear":wc<=48?"cloudy":wc<=67?"rainy":"snowy";setWeather({temp:t,cond,icon:WX_ICONS[cond]});}).catch(()=>{});},[]);
  const goLive=()=>{setIsLive(true);setTv(nowTv);};
  const togCity=(c)=>setCities(prev=>{const s=new Set(prev);if(s.has(c)){s.delete(c);if(s.size===0)s.add("omaha");}else s.add(c);return s;});
  const cityMatch=(ev)=>cities.size===3||!ev.city||cities.has(ev.city);

  const isM=w<600,isT=w>=600&&w<960,isD=w>=960;
  const mxW=isD?860:isT?680:600,px=isD?32:isT?24:16;
  const sec={maxWidth:mxW,margin:"0 auto",padding:`0 ${px}px`};
  const sk=useMemo(()=>interp(tv),[tv]);
  const tog=id=>setFavs(p=>p.includes(id)?p.filter(f=>f!==id):[...p,id]);
  const navigateToEvent=(id)=>{setPrevTab(tab);setTab("event:"+id);window.scrollTo(0,0);};
  const[evShow,setEvShow]=useState(30);
  useEffect(()=>{if(tab!=="events"){setEvCat("all");setEvSub("all");setDateRange("all");setEvShow(30);}},[tab]);
  useEffect(()=>{setEvShow(30);},[evCat,evSub,dateRange]);
  const filteredEvents=useMemo(()=>EVENTS.filter(e=>cityMatch(e)).filter(e=>evCat==="all"||e.cat===evCat).filter(e=>matchDate(e,dateRange)).filter(e=>matchSub(e,evSub)).sort((a,b)=>{const da=a.date?.match(/^\d{4}/)?a.date:"0000",db=b.date?.match(/^\d{4}/)?b.date:"0000";return da.localeCompare(db);}),[evCat,evSub,dateRange,cities]);
  const nb=Math.max(0,Math.min(1,(tv-50)/20));
  const isDay=tv<60,isNite=tv>=60;
  const mLabel=isDay?"Today":"Tonight";
  const nowHr=new Date().getHours()+new Date().getMinutes()/60;
  const getBadge=(ev)=>{
    if(!ev.time)return null;
    const m=ev.time.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
    if(!m)return null;
    let h=parseInt(m[1]);const min=parseInt(m[2]||"0"),ap=m[3].toUpperCase();
    if(ap==="PM"&&h!==12)h+=12;if(ap==="AM"&&h===12)h=0;
    const evHr=h+min/60,diff=evHr-nowHr;
    if(diff<-2)return{text:"Ended",color:T.textDim,bg:"rgba(255,255,255,.05)"};
    if(diff<0)return{text:"Live Now",color:"#7DD4A0",bg:"rgba(125,212,160,.12)"};
    if(diff<1)return{text:"< 1 hr",color:"#FFB74D",bg:"rgba(255,183,77,.12)"};
    if(diff<2)return{text:"Starts Soon",color:"#FFB74D",bg:"rgba(255,183,77,.1)"};
    return null;
  };
  const getVenueBadge=(name)=>{
    const h=new Date().getHours();
    if(name==="Henry Doorly Zoo")return h>=9&&h<17?{text:"Open Now",color:"#7DD4A0",bg:"rgba(125,212,160,.12)"}:{text:"Closed",color:T.textDim,bg:"rgba(255,255,255,.05)"};
    return null;
  };
  const mColor=isDay?"#81C784":T.accent;
  const sunX=12+(tv/100)*76;
  const tr=drag?"none":"all 0.4s ease";

  const Head=({text,count,mt=20,color})=>(
    <div style={{display:"flex",alignItems:"baseline",gap:10,margin:`${mt}px 0 10px`}}>
      <h2 style={{fontSize:12,fontWeight:600,color:color||T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:0}}>{text}</h2>
      {count!=null&&<span style={{fontSize:11,color:T.textDim,letterSpacing:1}}>{count}</span>}
    </div>
  );
  const tabsD=[{id:"today",icon:IC.today,label:"Today"},{id:"events",icon:IC.calendar,label:"Events"},{id:"explore",icon:IC.explore,label:"Explore"},{id:"saved",icon:IC.saved,label:"Saved"}];

  /* ── COMPACT HERO for interior pages ──
     fullHero = Today + Events only (full skyline with sun/moon/stars/weather)
     All other tabs get compact strip (95-135px) showing bottom third of skyline.
     SVG's xMidYMax slice anchors buildings at bottom; crops above church steeple.
     GO: title stays visible at reduced size. No celestial or weather elements. */
  const fullHero=tab==="today";
  const isTrailPage=tab.startsWith("trail:")||tab.startsWith("event:")||tab.startsWith("trailDetail:")||tab.startsWith("venue:")||tab.startsWith("walk:");
  const heroH=isTrailPage?"0px":fullHero?(isD?"55vh":isM?"50vh":"52vh"):(isD?"120px":isM?"95px":"105px");
  const heroMin=isTrailPage?0:fullHero?(isD?400:320):(isD?120:95);
  const heroMax=isTrailPage?0:fullHero?560:135;

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:T.sans,paddingBottom:130}}>
      {!mounted?<div style={{height:"100vh",background:T.bg}}/>:<>

      {/* ═══ HERO ═══ */}
      <div style={{position:"relative",height:heroH,minHeight:heroMin,maxHeight:heroMax,overflow:"hidden",transition:"height 0.5s ease, min-height 0.5s ease, max-height 0.5s ease"}}>
        {/* Sky */}
        <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg, ${sk.s1} 0%, ${sk.s2} 50%, ${sk.s3} 90%)`,transition:tr}}/>

        {/* Horizon glow — fades with sun */}
        {fullHero&&<div style={{position:"absolute",bottom:"28%",left:0,right:0,height:"30%",background:`radial-gradient(ellipse 70% 100% at ${sunX}% 100%, ${sk.glow}25 0%, transparent 70%)`,opacity:sk.sunOp,transition:tr,pointerEvents:"none"}}/>}

        {/* Stars */}
        {fullHero&&<div style={{position:"absolute",inset:0,opacity:sk.starOp,transition:tr,pointerEvents:"none"}}>
          {STARS.map((s,i)=><div key={i} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.sz,height:s.sz,borderRadius:"50%",background:"#fff",animation:`twinkle ${s.dur}s ${s.dl}s ease-in-out infinite`}}/>)}
        </div>}

        {/* Sun & Moon — same 180° arc, moon trails behind */}
        {fullHero&&(()=>{
          /* Shared arc function: progress 0→1 maps to left-horizon → peak → right-horizon */
          const arcTop = (p) => 82 - 68 * Math.sin(Math.PI * Math.max(0, Math.min(1, p)));
          const arcX = (p) => 12 + Math.max(0, Math.min(1, p)) * 76;
          /* Sun: slider 0→100 maps to full arc */
          const sunP = tv / 100;
          /* Moon: starts rising at tv≈60, so offset by ~60 ticks */
          const moonP = (tv - 60) / 100;
          return(<div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
            {/* Sun */}
            {sk.sunOp>0.01&&<div style={{position:"absolute",left:`${arcX(sunP)}%`,top:`${arcTop(sunP)}%`,transform:"translate(-50%,-50%)",zIndex:3,pointerEvents:"none",transition:tr}}>
              <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:sk.sunSz*3.5,height:sk.sunSz*3.5,borderRadius:"50%",background:`radial-gradient(circle, ${sk.glow}20 0%, transparent 70%)`,opacity:sk.sunOp,transition:tr}}/>
              <div style={{width:sk.sunSz,height:sk.sunSz,borderRadius:"50%",background:`radial-gradient(circle at 40% 40%, #fff 0%, ${sk.sunC} 30%, ${sk.sunC}AA 65%, transparent 100%)`,boxShadow:`0 0 ${sk.sunSz*.8}px ${sk.sunC}66`,opacity:sk.sunOp,transition:tr}}/>
            </div>}
            {/* Moon — same arc, delayed */}
            {sk.moonOp>0.01&&moonP>0&&<div style={{position:"absolute",left:`${arcX(moonP)}%`,top:`${arcTop(moonP)}%`,transform:"translate(-50%,-50%)",zIndex:3,pointerEvents:"none",transition:tr}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:"radial-gradient(circle at 35% 35%, #EBE7DB, #C8C0B0)",boxShadow:"0 0 25px rgba(200,192,176,0.25), 0 0 80px rgba(200,192,176,0.06)",opacity:sk.moonOp,transition:tr}}>
                <div style={{position:"absolute",top:"20%",left:"26%",width:7,height:7,borderRadius:"50%",background:"rgba(0,0,0,0.06)"}}/>
                <div style={{position:"absolute",top:"50%",left:"60%",width:5,height:5,borderRadius:"50%",background:"rgba(0,0,0,0.04)"}}/>
                <div style={{position:"absolute",top:"70%",left:"34%",width:3.5,height:3.5,borderRadius:"50%",background:"rgba(0,0,0,0.035)"}}/>
              </div>
            </div>}
          </div>);
        })()}

        {/* ★ SVG SKYLINE ★ */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:fullHero?"78%":"100%",zIndex:5,transition:tr}}>
          <Skyline color={sk.bldg} winOp={sk.winOp}/>
        </div>

        {/* Fade skyline base into bg */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:fullHero?60:35,zIndex:6,background:`linear-gradient(180deg,transparent,${T.bg})`}}/>

        {/* Hero text */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:10,padding:`0 ${px}px ${fullHero?(isD?30:22):(isD?10:7)}px`,maxWidth:mxW,margin:"0 auto"}}>
          <h1 style={{fontSize:fullHero?(isD?44:isT?36:28):(isD?20:isT?18:16),fontWeight:300,margin:0,color:T.text,letterSpacing:fullHero?1.5:1,lineHeight:1.1,textShadow:"0 2px 12px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.6), 0 0 60px rgba(0,0,0,0.4)",transition:"font-size 0.4s ease"}}>
            <span style={{fontWeight:800,letterSpacing:fullHero?3:2}}>GO</span>
            <span style={{color:T.accent,margin:"0 6px",fontWeight:200}}>:</span>
            <span style={{fontWeight:400}}>Guide to Omaha</span>
          </h1>
          {fullHero&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6}}>
            <div style={{display:"flex",gap:6,flexWrap:"nowrap"}}>
              {[["omaha","Omaha"],["cb","Council Bluffs"],["lincoln","Lincoln"]].map(([k,label])=><button key={k} onClick={()=>togCity(k)} style={{background:cities.has(k)?"rgba(230,149,107,.18)":"rgba(255,255,255,.06)",border:`1px solid ${cities.has(k)?"rgba(230,149,107,.4)":"rgba(255,255,255,.12)"}`,borderRadius:99,padding:"3px 10px",cursor:"pointer",backdropFilter:"blur(4px)",whiteSpace:"nowrap",flexShrink:0}}><span style={{fontSize:10,fontWeight:600,color:cities.has(k)?"#E6956B":"rgba(242,239,233,.7)",letterSpacing:1.5,textTransform:"uppercase",textShadow:"0 2px 8px rgba(0,0,0,0.6)"}}>{label}</span></button>)}
            </div>
            {weather.temp!==null&&<div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}><span style={{fontSize:14}}>{weather.icon}</span><span style={{fontSize:13,fontWeight:300,color:T.text,textShadow:"0 2px 8px rgba(0,0,0,0.8)"}}>{weather.temp}°F</span></div>}
          </div>}
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      {tab==="today"&&<div style={sec}>

        {isDay&&<div style={{opacity:Math.min(1,(1-nb)*1.3),transition:"opacity 0.5s"}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",margin:"16px 0 12px"}}><h2 style={{fontSize:14,fontWeight:700,color:mColor,letterSpacing:1,textTransform:"uppercase",margin:0}}>{mLabel}</h2><span style={{fontSize:10,color:T.textDim,letterSpacing:1}}>{timeLabel}</span></div>
          <Head text="Trails & Rides" count={TRAILS.length} mt={4} color="#81C784"/>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory"}}>
            {TRAILS.map(t=>(
              <div key={t.id} onClick={(e)=>{if(e.target.closest("a"))return;setPrevTab(tab);setTab("trailDetail:"+t.id);window.scrollTo(0,0);}} className="ecard" style={{background:CG.trail,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",width:isD?300:isM?258:275,minWidth:isD?300:isM?258:275,flexShrink:0,scrollSnapAlign:"start",cursor:"pointer"}}>
                <div style={{position:"relative",height:isD?125:105,overflow:"hidden"}}>
                  <img src={t.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.55}} onError={e=>{e.target.style.display="none"}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(20,22,24,.05) 0%,rgba(20,22,24,.85) 100%)"}}/>
                  <div style={{position:"absolute",top:10,left:10,display:"flex",gap:5}}>
                    <span style={{fontSize:9,padding:"3px 8px",borderRadius:99,background:"rgba(125,212,160,.15)",color:"#81C784",fontWeight:700}}>{t.difficulty}</span>
                    <span style={{fontSize:9,padding:"3px 8px",borderRadius:99,background:"rgba(255,255,255,.08)",color:T.textBody,fontWeight:600}}>{t.distance}</span>
                  </div>
                  <div style={{position:"absolute",bottom:10,left:12}}><h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>{t.name}</h3>{(()=>{const b=getVenueBadge(t.name);return b?<span style={{marginLeft:6,fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:99,background:b.bg,color:b.color,letterSpacing:.6,textTransform:"uppercase"}}>{b.text}</span>:null;})()}</div>
                </div>
                <div style={{padding:"10px 12px 12px"}}>
                  <p style={{margin:0,fontSize:12,color:T.textBody,lineHeight:1.45,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{t.desc}</p>
                  <div style={{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}}>{t.tags.map(tag=><span key={tag} style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:"rgba(255,255,255,.04)",color:T.textSec,fontWeight:500}}>{tag}</span>)}</div>
                  <div style={{fontSize:10,color:T.venue,marginTop:6}}>⛰ {t.elev} · {t.surface}</div>
                  <div style={{display:"flex",gap:6,marginTop:10}}>
                    <a href={mapsDir(t.lat,t.lng)} target="_blank" rel="noopener noreferrer" className="hbtn" style={{flex:1,padding:"8px 0",borderRadius:99,background:"rgba(125,212,160,.1)",border:"1px solid rgba(125,212,160,.2)",color:"#81C784",fontSize:10,fontWeight:600,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{IC.dir("#81C784",12)} Trail Map</a>
                    {t.url&&<a href={t.url} target="_blank" rel="noopener noreferrer" className="hbtn" style={{flex:1,padding:"8px 0",borderRadius:99,background:"rgba(255,255,255,.05)",border:`1px solid ${T.border}`,color:T.textBody,fontSize:10,fontWeight:600,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{IC.link(T.textBody,11)} Info</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Head text="Parks" count={6} color="#81C784"/>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory"}}>
            {PARKS.filter(p=>["gene-leahy-mall","heartland-america","elmwood-park","memorial-park","zorinsky-lake","cunningham-lake"].includes(p.id)).map(p=>(
              <div key={p.id} onClick={()=>{setParkTab("overview");setTab("park:"+p.id);window.scrollTo(0,0);}} className="ecard" style={{background:CG.park,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",width:isD?260:isM?220:240,minWidth:isD?260:isM?220:240,flexShrink:0,scrollSnapAlign:"start",cursor:"pointer"}}>
                <div style={{position:"relative",height:isD?110:90,overflow:"hidden"}}>
                  <img src={p.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.5}} onError={e=>{e.target.style.display="none"}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(20,22,24,.05) 0%,rgba(20,22,24,.85) 100%)"}}/>
                  <div style={{position:"absolute",top:8,left:10}}><span style={{fontSize:16}}>{p.icon}</span></div>
                  <div style={{position:"absolute",bottom:8,left:10}}><h3 style={{margin:0,fontSize:14,fontWeight:600,color:T.textHi}}>{p.name}</h3></div>
                </div>
                <div style={{padding:"8px 10px 10px"}}>
                  <p style={{margin:0,fontSize:11,color:T.textBody,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.tagline}</p>
                  <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>{p.tags.slice(0,3).map(tag=><span key={tag} style={{fontSize:8,padding:"2px 7px",borderRadius:99,background:"rgba(255,255,255,.04)",color:T.textSec,fontWeight:500}}>{tag}</span>)}</div>
                </div>
              </div>
            ))}
          </div>

          <Head text="Walking Tours" count={WALKS.length} color="#FFB74D"/>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory"}}>
            {WALKS.map(wk=>(
              <div key={wk.id} onClick={()=>{setPrevTab(tab);setTab("walk:"+wk.id);window.scrollTo(0,0);}} className="ecard" style={{background:CG.hood,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",width:isD?280:isM?240:260,minWidth:isD?280:isM?240:260,flexShrink:0,scrollSnapAlign:"start",cursor:"pointer"}}>
                <div style={{position:"relative",height:isD?100:80,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,183,77,.08)"}}>
                  {wk.icon("#FFB74D",36)}
                  <div style={{position:"absolute",bottom:8,left:10,right:10,display:"flex",gap:5}}>
                    <span style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:"rgba(255,183,77,.18)",color:"#FFB74D",fontWeight:600}}>{wk.distance}</span>
                    <span style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:"rgba(255,255,255,.08)",color:T.textBody,fontWeight:500}}>{wk.time}</span>
                  </div>
                </div>
                <div style={{padding:"10px 12px 12px"}}>
                  <h3 style={{margin:0,fontSize:14,fontWeight:600,color:T.textHi}}>{wk.name}</h3>
                  <p style={{margin:"4px 0 0",fontSize:11,color:T.textBody,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{wk.desc}</p>
                  <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>{wk.tags.map(tag=><span key={tag} style={{fontSize:8,padding:"2px 7px",borderRadius:99,background:"rgba(255,255,255,.04)",color:T.textSec,fontWeight:500}}>{tag}</span>)}</div>
                </div>
              </div>
            ))}
          </div>

          <Head text="Things To Do" count={DAYTIME.length} color={T.accent}/>
          {DAYTIME.map((a,i)=>(
            <div key={a.id} onClick={(e)=>{if(e.target.closest("a"))return;setPrevTab(tab);setTab("venue:"+a.id);window.scrollTo(0,0);}} className="ecard" style={{background:CG._,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"14px":"16px 20px",marginBottom:8,animation:`cardIn .3s ${i*.04}s both`,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{width:42,height:42,borderRadius:13,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{a.icon}</div>
                <div style={{flex:1}}>
                  <h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>{a.name}</h3>
                  <p style={{margin:"2px 0 0",fontSize:11,fontWeight:600,letterSpacing:1.4,color:T.accent}}>{a.time} · {a.price}</p>
                  <p style={{margin:"6px 0 0",fontSize:12,color:T.textBody,lineHeight:1.5}}>{a.desc}</p>
                  <div style={{display:"flex",gap:6,marginTop:10}}>
                    <a href={mapsDir(a.lat,a.lng)} target="_blank" rel="noopener noreferrer" className="hbtn" style={{padding:"7px 14px",borderRadius:99,background:"rgba(255,255,255,.05)",border:`1px solid ${T.border}`,color:T.textBody,fontSize:10,fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:4}}>{IC.dir(T.textBody,11)} Directions</a>
                    {a.url&&<a href={a.url} target="_blank" rel="noopener noreferrer" className="hbtn" style={{padding:"7px 14px",borderRadius:99,background:"rgba(94,196,182,.1)",border:"1px solid rgba(94,196,182,.2)",color:T.accent,fontSize:10,fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:4}}>{IC.link(T.accent,11)} Visit</a>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>}

        {false&&<div style={{marginTop:16}}>
          <Head text="Sunset Spots" count={SUNSETS.length} color="#FFB74D"/>
          <div style={{display:"grid",gridTemplateColumns:isD?"1fr 1fr":"1fr",gap:8}}>
            {SUNSETS.map((s,i)=>(
              <div key={s.id} className="ecard" style={{background:CG.sunset,borderRadius:18,border:`1px solid ${T.border}`,padding:"14px 16px",animation:`cardIn .3s ${i*.05}s both`}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:13,background:"rgba(255,183,77,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{s.icon("#FFB74D",20)}</div>
                  <div style={{flex:1}}>
                    <h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>{s.name}</h3>
                    <p style={{margin:"4px 0 0",fontSize:12,color:T.textBody,lineHeight:1.45}}>{s.desc}</p>
                    <a href={mapsDir(s.lat,s.lng)} target="_blank" rel="noopener noreferrer" className="hbtn" style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:8,padding:"6px 12px",borderRadius:99,background:"rgba(255,183,77,.1)",border:"1px solid rgba(255,183,77,.2)",color:"#FFB74D",fontSize:10,fontWeight:600,textDecoration:"none"}}>{IC.dir("#FFB74D",11)} Go</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>}

        {isNite&&<div style={{opacity:Math.min(1,nb*1.5),transition:"opacity 0.5s"}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",margin:"16px 0 12px"}}><h2 style={{fontSize:14,fontWeight:700,color:mColor,letterSpacing:1,textTransform:"uppercase",margin:0}}>{mLabel}</h2><span style={{fontSize:10,color:T.textDim,letterSpacing:1}}>{timeLabel}</span></div>
          <Head text={"Tonight's Events"} count={EVENTS.length} mt={4} color={T.accent}/>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory",marginBottom:10}}>
            {EVENTS.filter(e=>e.feat&&(cityMatch(e))).map(ev=>{const ac=CA[ev.cat]||T.accent,gr=CG[ev.cat]||CG._;return(
              <div key={ev.id} onClick={()=>navigateToEvent(ev.id)} className="ecard" style={{background:gr,borderRadius:18,border:`1px solid ${T.border}`,width:isD?340:isM?265:290,minWidth:isD?340:isM?265:290,flexShrink:0,scrollSnapAlign:"start",padding:"16px 16px 18px",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:42,height:42,borderRadius:13,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{ev.emoji}</div>
                  <div><div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><h3 style={{margin:0,fontSize:16,fontWeight:600,color:T.textHi}}>{ev.title}</h3>{(()=>{const b=getBadge(ev);return b?<span style={{fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:99,background:b.bg,color:b.color,letterSpacing:.6,textTransform:"uppercase"}}>{b.text}</span>:null;})()}</div><p style={{margin:"1px 0 0",fontSize:11,fontWeight:600,color:ac,letterSpacing:1.4,textTransform:"uppercase"}}>{ev.date} · {ev.time}</p></div>
                </div>
                <p style={{margin:"0 0 10px",fontSize:12,color:T.textBody,lineHeight:1.45}}>{ev.desc}</p>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:18,fontWeight:300,color:T.textHi}}>{ev.price}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <button onClick={(e)=>{e.stopPropagation();tog(ev.id);}} className="hbtn" style={{background:"rgba(255,255,255,.05)",border:"none",borderRadius:99,padding:"5px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:3,color:favs.includes(ev.id)?T.gold:T.textSec}}>{IC.heart(favs.includes(ev.id)?T.gold:T.textSec,13,favs.includes(ev.id))}</button>
                    <span style={{fontSize:10,color:T.venue,letterSpacing:1,fontWeight:500}}>{ev.venue}</span>
                  </div>
                </div>
              </div>
            )})}
          </div>
          {EVENTS.filter(e=>!e.feat).map((ev,i)=>{const ac=CA[ev.cat]||T.accent,gr=CG[ev.cat]||CG._;return(
            <div key={ev.id} onClick={()=>navigateToEvent(ev.id)} className="ecard" style={{background:gr,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"14px":"16px 20px",marginBottom:8,animation:`cardIn .3s ${i*.04}s both`,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{width:42,height:42,borderRadius:13,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{ev.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>{ev.title}</h3>{(()=>{const b=getBadge(ev);return b?<span style={{fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:99,background:b.bg,color:b.color,letterSpacing:.6,textTransform:"uppercase"}}>{b.text}</span>:null;})()}</div>
                  <p style={{margin:"2px 0 0",fontSize:11,fontWeight:600,color:ac,letterSpacing:1.4}}>{ev.date} · {ev.time}</p>
                  <p style={{margin:"6px 0 0",fontSize:12,color:T.textBody,lineHeight:1.5}}>{ev.desc}</p>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10}}>
                    <span style={{fontSize:17,fontWeight:300,color:T.textHi}}>{ev.price}</span>
                    <span style={{fontSize:11,color:T.venue,letterSpacing:1.2,textTransform:"uppercase",fontWeight:500}}>{ev.venue}</span>
                  </div>
                </div>
              </div>
            </div>
          )})}
        </div>}

        {isDay&&<div style={{textAlign:"center",padding:"20px 0",marginTop:8}}><p style={{fontSize:11,color:T.textDim,letterSpacing:.8}}>Slide forward to preview tonight →</p></div>}
      </div>}

      {/* ═══ EVENTS TAB ═══ */}
      {tab==="events"&&<div style={sec}>
        {/* City filter */}
        <div style={{display:"flex",gap:8,flexWrap:"nowrap",overflowX:"auto",paddingTop:16,paddingBottom:8,WebkitOverflowScrolling:"touch"}}>
          {[["omaha","Omaha"],["cb","Council Bluffs"],["lincoln","Lincoln"]].map(([k,label])=><button key={k} onClick={()=>togCity(k)} style={{background:cities.has(k)?`${T.accent}18`:"rgba(255,255,255,.06)",border:`1px solid ${cities.has(k)?T.accent+"40":T.border}`,borderRadius:99,padding:"8px 16px",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,minHeight:36}}><span style={{fontSize:11,fontWeight:600,color:cities.has(k)?T.accent:T.textSec,letterSpacing:1,textTransform:"uppercase"}}>{label}</span></button>)}
        </div>
        {/* Date presets */}
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,WebkitOverflowScrolling:"touch"}}>
          {DATE_PRESETS.map(dp=><button key={dp.id} onClick={()=>setDateRange(dp.id)} style={{background:dateRange===dp.id?`${T.accent}18`:"rgba(255,255,255,.06)",border:`1px solid ${dateRange===dp.id?T.accent+"40":T.border}`,borderRadius:99,padding:"8px 16px",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,minHeight:36}}><span style={{fontSize:11,fontWeight:600,color:dateRange===dp.id?T.accent:T.textSec,letterSpacing:.8}}>{dp.label}</span></button>)}
        </div>
        {/* Category pills */}
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,WebkitOverflowScrolling:"touch"}}>
          {ECATS.map(ec=>{const ac=CA[ec.id]||T.accent;return<button key={ec.id} onClick={()=>{setEvCat(ec.id);setEvSub("all");}} style={{background:evCat===ec.id?`${ac}18`:"rgba(255,255,255,.06)",border:`1px solid ${evCat===ec.id?ac+"40":T.border}`,borderRadius:99,padding:"8px 16px",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,display:"flex",alignItems:"center",gap:5,minHeight:36}}><span style={{fontSize:14}}>{ec.emoji}</span><span style={{fontSize:11,fontWeight:600,color:evCat===ec.id?ac:T.textSec,letterSpacing:.8}}>{ec.label}</span></button>;})}
        </div>
        {/* Subcategory pills */}
        {evCat!=="all"&&ESUBS[evCat]&&<div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:10,WebkitOverflowScrolling:"touch"}}>
          <button onClick={()=>setEvSub("all")} style={{background:evSub==="all"?`${CA[evCat]||T.accent}18`:"rgba(255,255,255,.06)",border:`1px solid ${evSub==="all"?(CA[evCat]||T.accent)+"40":T.border}`,borderRadius:99,padding:"7px 14px",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,minHeight:34}}><span style={{fontSize:10,fontWeight:600,color:evSub==="all"?CA[evCat]||T.accent:T.textSec,letterSpacing:.6}}>All</span></button>
          {ESUBS[evCat].map(s=><button key={s} onClick={()=>setEvSub(s)} style={{background:evSub===s?`${CA[evCat]||T.accent}18`:"rgba(255,255,255,.06)",border:`1px solid ${evSub===s?(CA[evCat]||T.accent)+"40":T.border}`,borderRadius:99,padding:"7px 14px",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,minHeight:34}}><span style={{fontSize:10,fontWeight:600,color:evSub===s?CA[evCat]||T.accent:T.textSec,letterSpacing:.6}}>{s}</span></button>)}
        </div>}
        {/* Events heading */}
        <Head text={evCat==="all"?"All Events":ECATS.find(c=>c.id===evCat)?.label||"Events"} count={filteredEvents.length} mt={4} color={CA[evCat]||T.accent}/>
        {/* Event cards — paginated for performance */}
        {filteredEvents.length===0?<div style={{textAlign:"center",padding:"40px 20px"}}><p style={{fontSize:14,color:T.textSec,marginBottom:12}}>No events match your filters</p><button onClick={()=>{setEvCat("all");setEvSub("all");setDateRange("all");}} className="hbtn" style={{background:`${T.accent}15`,border:`1px solid ${T.accent}33`,borderRadius:99,padding:"10px 24px",cursor:"pointer",color:T.accent,fontSize:13,fontWeight:600,minHeight:40}}>Clear Filters</button></div>:<>
        {filteredEvents.slice(0,evShow).map((ev,i)=>{const ac=CA[ev.cat]||T.accent,gr=CG[ev.cat]||CG._;return(
          <div key={ev.id} onClick={()=>navigateToEvent(ev.id)} className="ecard" style={{background:gr,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"14px":"16px 20px",marginBottom:8,animation:i<10?`cardIn .3s ${i*.04}s both`:"none",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <div style={{width:42,height:42,borderRadius:13,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{ev.emoji}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>{ev.title}</h3>{(()=>{const b=getBadge(ev);return b?<span style={{fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:99,background:b.bg,color:b.color,letterSpacing:.6,textTransform:"uppercase"}}>{b.text}</span>:null;})()}</div>
                <p style={{margin:"2px 0 0",fontSize:11,fontWeight:600,color:ac,letterSpacing:1.4}}>{ev.date} · {ev.time}</p>
                <p style={{margin:"6px 0 0",fontSize:12,color:T.textBody,lineHeight:1.5}}>{ev.desc}</p>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10}}>
                  <span style={{fontSize:17,fontWeight:300,color:T.textHi}}>{ev.price}</span>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {ev.city&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:99,background:"rgba(255,255,255,.05)",color:T.textSec,fontWeight:600,letterSpacing:.5,textTransform:"uppercase"}}>{ev.city==="cb"?"Council Bluffs":ev.city==="lincoln"?"Lincoln":"Omaha"}</span>}
                    <button onClick={(e)=>{e.stopPropagation();tog(ev.id);}} className="hbtn" style={{background:"rgba(255,255,255,.05)",border:"none",borderRadius:99,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:3,color:favs.includes(ev.id)?T.gold:T.textSec,minHeight:34}}>{IC.heart(favs.includes(ev.id)?T.gold:T.textSec,14,favs.includes(ev.id))}</button>
                    <span style={{fontSize:10,color:T.venue,letterSpacing:1,fontWeight:500}}>{ev.venue}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );})}
        {evShow<filteredEvents.length&&<div style={{textAlign:"center",padding:"16px 0 8px"}}><button onClick={()=>setEvShow(s=>s+30)} className="hbtn" style={{background:`${T.accent}12`,border:`1px solid ${T.accent}30`,borderRadius:99,padding:"12px 28px",cursor:"pointer",color:T.accent,fontSize:13,fontWeight:600,minHeight:44}}>Show More ({filteredEvents.length-evShow} remaining)</button></div>}
        </>}
      </div>}

      {/* ═══ EXPLORE TAB ═══ */}
      {tab==="explore"&&<div style={sec}>

        {/* ── Parks ── */}
        <Head text="Parks & Gardens" count={PARKS.length} mt={16} color="#81C784"/>
        <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory"}}>
          {PARKS.map(p=>(
            <div key={p.id} onClick={()=>{setParkTab("overview");setTab("park:"+p.id);window.scrollTo(0,0);}} className="ecard" style={{background:CG.park,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",width:isD?280:isM?240:260,minWidth:isD?280:isM?240:260,flexShrink:0,scrollSnapAlign:"start",cursor:"pointer"}}>
              <div style={{position:"relative",height:isD?120:100,overflow:"hidden"}}>
                <img src={p.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.5}} onError={e=>{e.target.style.display="none"}}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(20,22,24,.05) 0%,rgba(20,22,24,.85) 100%)"}}/>
                <div style={{position:"absolute",top:10,left:10}}><span style={{fontSize:18}}>{p.icon}</span></div>
                <div style={{position:"absolute",bottom:10,left:12}}><h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>{p.name}</h3></div>
              </div>
              <div style={{padding:"10px 12px 12px"}}>
                <p style={{margin:0,fontSize:12,color:T.textBody,lineHeight:1.45,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.desc}</p>
                <div style={{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}}>{p.tags.map(tag=><span key={tag} style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:"rgba(255,255,255,.04)",color:T.textSec,fontWeight:500}}>{tag}</span>)}</div>
                <div style={{display:"flex",gap:6,marginTop:10}}>
                  <a href={mapsDir(p.lat,p.lng)} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="hbtn" style={{flex:1,padding:"7px 0",borderRadius:99,background:`${p.color||"#81C784"}18`,border:`1px solid ${p.color||"#81C784"}33`,color:p.color||"#81C784",fontSize:10,fontWeight:600,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{IC.dir(p.color||"#81C784",11)} Directions</a>
                  <button onClick={e=>{e.stopPropagation();setParkTab("overview");setTab("park:"+p.id);window.scrollTo(0,0);}} className="hbtn" style={{flex:1,padding:"7px 0",borderRadius:99,background:"rgba(255,255,255,.05)",border:`1px solid ${T.border}`,color:T.textBody,fontSize:10,fontWeight:600,textAlign:"center",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{IC.chev(T.textBody,11)} Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Trails ── */}
        <Head text="Trails & Rides" count={TRAILS.length} color="#81C784"/>
        <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory"}}>
          {TRAILS.map(t=>(
            <div key={t.id} onClick={(e)=>{if(e.target.closest("a"))return;setPrevTab(tab);setTab("trailDetail:"+t.id);window.scrollTo(0,0);}} className="ecard" style={{background:CG.trail,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",width:isD?300:isM?258:275,minWidth:isD?300:isM?258:275,flexShrink:0,scrollSnapAlign:"start",cursor:"pointer"}}>
              <div style={{position:"relative",height:isD?125:105,overflow:"hidden"}}>
                <img src={t.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.55}} onError={e=>{e.target.style.display="none"}}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(20,22,24,.05) 0%,rgba(20,22,24,.85) 100%)"}}/>
                <div style={{position:"absolute",top:10,left:10,display:"flex",gap:5}}>
                  <span style={{fontSize:9,padding:"3px 8px",borderRadius:99,background:"rgba(125,212,160,.15)",color:"#81C784",fontWeight:700}}>{t.difficulty}</span>
                  <span style={{fontSize:9,padding:"3px 8px",borderRadius:99,background:"rgba(255,255,255,.08)",color:T.textBody,fontWeight:600}}>{t.distance}</span>
                </div>
                <div style={{position:"absolute",bottom:10,left:12}}><h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>{t.name}</h3></div>
              </div>
              <div style={{padding:"10px 12px 12px"}}>
                <p style={{margin:0,fontSize:12,color:T.textBody,lineHeight:1.45,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{t.desc}</p>
                <a href={mapsDir(t.lat,t.lng)} target="_blank" rel="noopener noreferrer" className="hbtn" style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:10,padding:"7px 14px",borderRadius:99,background:"rgba(125,212,160,.1)",border:"1px solid rgba(125,212,160,.2)",color:"#81C784",fontSize:10,fontWeight:600,textDecoration:"none"}}>{IC.dir("#81C784",11)} Trail Map</a>
              </div>
            </div>
          ))}
        </div>

        {/* ── Walking Tours ── */}
        <Head text="Walking Tours" count={WALKS.length} color="#FFB74D"/>
        <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory"}}>
          {WALKS.map(wk=>(
            <div key={wk.id} onClick={()=>{setPrevTab(tab);setTab("walk:"+wk.id);window.scrollTo(0,0);}} className="ecard" style={{background:CG.hood,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",width:isD?280:isM?240:260,minWidth:isD?280:isM?240:260,flexShrink:0,scrollSnapAlign:"start",cursor:"pointer"}}>
              <div style={{position:"relative",height:isD?100:80,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,183,77,.08)"}}>
                {wk.icon("#FFB74D",36)}
                <div style={{position:"absolute",bottom:8,left:10,right:10,display:"flex",gap:5}}>
                  <span style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:"rgba(255,183,77,.18)",color:"#FFB74D",fontWeight:600}}>{wk.distance}</span>
                  <span style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:"rgba(255,255,255,.08)",color:T.textBody,fontWeight:500}}>{wk.time}</span>
                </div>
              </div>
              <div style={{padding:"10px 12px 12px"}}>
                <h3 style={{margin:0,fontSize:14,fontWeight:600,color:T.textHi}}>{wk.name}</h3>
                <p style={{margin:"4px 0 0",fontSize:11,color:T.textBody,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{wk.desc}</p>
                <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>{wk.tags.map(tag=><span key={tag} style={{fontSize:8,padding:"2px 7px",borderRadius:99,background:"rgba(255,255,255,.04)",color:T.textSec,fontWeight:500}}>{tag}</span>)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Neighborhoods ── */}
        <Head text="Neighborhoods" count={HOODS.length} color="#CE93D8"/>
        <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory"}}>
          {HOODS.map(h=>(
            <div key={h.id} onClick={()=>{setSpotCat("all");setTab("hood:"+h.id);}} className="ecard" style={{background:CG._,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",width:isD?220:isM?180:200,minWidth:isD?220:isM?180:200,flexShrink:0,scrollSnapAlign:"start",cursor:"pointer"}}>
              <div style={{position:"relative",height:isD?130:110,overflow:"hidden"}}>
                <img src={h.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.45}} onError={e=>{e.target.style.display="none"}}/>
                <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,rgba(20,22,24,.1) 0%,rgba(20,22,24,.9) 100%)`}}/>
                <div style={{position:"absolute",top:10,left:10}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:h.color,boxShadow:`0 0 8px ${h.color}66`}}/>
                </div>
                <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 12px 10px"}}>
                  <h3 style={{margin:0,fontSize:15,fontWeight:700,color:T.textHi,letterSpacing:.3}}>{h.name}</h3>
                  <p style={{margin:"1px 0 0",fontSize:10,color:h.color,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>{h.sub}</p>
                </div>
              </div>
              <div style={{padding:"8px 12px 10px"}}>
                <p style={{margin:0,fontSize:11,color:T.textBody,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{h.desc}</p>
                <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>{h.tags.slice(0,3).map(tag=><span key={tag} style={{fontSize:8,padding:"2px 6px",borderRadius:99,background:"rgba(255,255,255,.04)",color:T.textDim,fontWeight:500}}>{tag}</span>)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Things To Do ── */}
        <Head text="Things To Do" count={DAYTIME.length} color={T.accent}/>
        {DAYTIME.map((a,i)=>(
          <div key={a.id} className="ecard" style={{background:CG._,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"14px":"16px 20px",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <div style={{width:42,height:42,borderRadius:13,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{a.icon}</div>
              <div style={{flex:1}}>
                <h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>{a.name}</h3>
                {a.url?<a href={a.url} target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:600,letterSpacing:1.4,color:T.accent,textDecoration:"none"}}>{a.time} · {a.price}</a>:<p style={{margin:"2px 0 0",fontSize:11,fontWeight:600,letterSpacing:1.4,color:T.accent}}>{a.time} · {a.price}</p>}
                <p style={{margin:"6px 0 0",fontSize:12,color:T.textBody,lineHeight:1.5}}>{a.desc}</p>
              </div>
            </div>
          </div>
        ))}

        {/* ── Venues (compact link to venues view) ── */}
        <div onClick={()=>setTab("venues")} className="ecard" style={{background:"linear-gradient(135deg,#1A2E32 0%,#213740 60%,#1C3035 100%)",borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"16px":"20px 24px",marginTop:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:48,height:48,borderRadius:14,background:"rgba(94,196,182,.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>{IC.venues(T.accent,24)}</div>
            <div>
              <h3 style={{margin:0,fontSize:16,fontWeight:700,color:T.textHi}}>Venues</h3>
              <p style={{margin:"2px 0 0",fontSize:11,color:T.textSec,letterSpacing:.5}}>{VENUES.length} venues · Arenas, clubs, theaters & more</p>
            </div>
          </div>
          <div style={{transform:"rotate(0)",flexShrink:0}}>{IC.chev(T.textSec,20)}</div>
        </div>

        <div style={{height:90}}/>
      </div>}

      {/* ═══ VENUES TAB (accessed from Explore) ═══ */}
      {tab==="venues"&&<div style={sec}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:16,marginBottom:12}}>
          <button onClick={()=>setTab("explore")} className="hbtn" style={{background:"rgba(255,255,255,.06)",border:`1px solid ${T.border}`,borderRadius:99,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <h2 style={{margin:0,fontSize:16,fontWeight:700,color:T.textHi,letterSpacing:.5}}>Venues</h2>
          <span style={{fontSize:11,color:T.textDim}}>{VENUES.filter(v=>cities.size===3||!v.city||cities.has(v.city)).filter(v=>venCat==="all"||v.type===venCat).length}</span>
        </div>
        <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch",marginBottom:8}}>
          {VCATS.map(c=>{const active=venCat===c.id;const cnt=c.id==="all"?VENUES.filter(v=>cities.size===3||!v.city||cities.has(v.city)).length:VENUES.filter(v=>(cities.size===3||!v.city||cities.has(v.city))&&v.type===c.id).length;return(
            <button key={c.id} onClick={()=>setVenCat(c.id)} className="pill" style={{padding:"5px 12px",borderRadius:99,background:active?`${T.accent}15`:"rgba(255,255,255,.06)",border:`1px solid ${active?T.accent+"44":T.border}`,color:active?T.accent:T.textSec,cursor:"pointer",fontSize:10,fontWeight:active?600:500,whiteSpace:"nowrap",letterSpacing:1,textTransform:"uppercase"}}>
              {c.label}<span style={{fontSize:9,color:active?T.accent:T.textDim,marginLeft:3}}>({cnt})</span>
            </button>);})}
        </div>
        {VENUES.filter(v=>cities.size===3||!v.city||cities.has(v.city)).filter(v=>venCat==="all"||v.type===venCat).map((v,i)=>(
          <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer" className="ecard" style={{display:"block",textDecoration:"none",color:"inherit",background:CG._,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",marginBottom:8,animation:`cardIn .3s ${i*.03}s both`}}>
            <div style={{position:"relative",height:isD?140:isM?100:115,overflow:"hidden"}}>
              <img src={v.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.5}} onError={e=>{e.target.style.display="none"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(20,22,24,.05) 0%,rgba(20,22,24,.85) 100%)"}}/>
              <div style={{position:"absolute",top:10,right:10,display:"flex",gap:5}}>
                <span style={{fontSize:9,padding:"3px 8px",borderRadius:99,background:"rgba(255,255,255,.08)",color:T.textBody,fontWeight:600}}>{v.type}</span>
                {v.city&&v.city!=="omaha"&&<span style={{fontSize:9,padding:"3px 8px",borderRadius:99,background:"rgba(230,149,107,.15)",color:"#E6956B",fontWeight:600}}>{v.city==="cb"?"CB":"Lincoln"}</span>}
              </div>
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 14px 10px"}}>
                <h3 style={{margin:0,fontSize:isD?17:15,fontWeight:600,color:T.textHi,letterSpacing:.5}}>{v.name}</h3>
                <p style={{margin:"2px 0 0",fontSize:10,color:T.venue,letterSpacing:1,fontWeight:500}}>{v.area} · {v.cap}</p>
              </div>
            </div>
            <div style={{padding:"10px 14px 12px"}}>
              <p style={{margin:0,fontSize:12,color:T.textBody,lineHeight:1.45}}>{v.desc}</p>
              {(()=>{const b=getVenueBadge(v.name);return b?<span style={{display:"inline-block",marginTop:6,fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:99,background:b.bg,color:b.color,letterSpacing:.6,textTransform:"uppercase"}}>{b.text}</span>:null;})()}
            </div>
          </a>
        ))}
        <div style={{height:90}}/>
      </div>}

      {/* ═══ NEIGHBORHOOD DETAIL (accessed from Explore) ═══ */}
      {tab.startsWith("hood:")&&(()=>{
        const hoodId=tab.split(":")[1];
        const hood=HOODS.find(h=>h.id===hoodId);
        if(!hood)return null;
        const hoodVenues=VENUES.filter(v=>{
          const areaMap={"old-market":["Old Market","Downtown"],"benson":["Benson"],"dundee":["Dundee","Memorial Park"],"blackstone":["Blackstone"],"north-downtown":["North Downtown"],"little-italy":["Little Italy","Little Bohemia"],"aksarben":["Aksarben"],"west-omaha":["West Omaha","La Vista"],"south-omaha":["South Omaha"],"midtown":["Central","Midtown","Capitol District"]};
          return (areaMap[hoodId]||[]).some(a=>v.area.includes(a));
        });
        const hoodEvents=EVENTS.filter(ev=>hoodVenues.some(v=>v.name===ev.venue));
        const hImgs=hood.imgs||[hood.img];
        return <div style={{maxWidth:mxW,margin:"0 auto"}}>

          {/* ── HERO IMAGE ── */}
          <div style={{position:"relative",height:isD?280:isM?220:250,overflow:"hidden",borderRadius:"0 0 24px 24px"}}>
            <img src={hImgs[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.45}}/>
            <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,rgba(20,22,24,.2) 0%,rgba(20,22,24,.95) 100%)`}}/>
            <button onClick={()=>setTab("explore")} className="hbtn" style={{position:"absolute",top:16,left:16,background:"rgba(20,22,24,.6)",backdropFilter:"blur(8px)",border:`1px solid ${T.border}`,borderRadius:99,padding:"8px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:T.textBody,fontSize:10,fontWeight:600,letterSpacing:.5}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg> Explore</button>
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:`0 ${px}px 20px`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:hood.color,boxShadow:`0 0 12px ${hood.color}`}}/>
                <span style={{fontSize:10,fontWeight:700,color:hood.color,letterSpacing:2,textTransform:"uppercase"}}>{hood.sub}</span>
              </div>
              <h1 style={{margin:0,fontSize:isD?32:26,fontWeight:300,color:T.textHi,letterSpacing:1.5,lineHeight:1.1}}>{hood.name}</h1>
              <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                {hood.vibe&&<span style={{fontSize:10,padding:"4px 10px",borderRadius:99,background:`${hood.color}18`,border:`1px solid ${hood.color}33`,color:hood.color,fontWeight:600,letterSpacing:.5}}>{hood.vibe}</span>}
                {hood.bestFor&&<span style={{fontSize:10,padding:"4px 10px",borderRadius:99,background:"rgba(255,255,255,.06)",border:`1px solid ${T.border}`,color:T.textSec,fontWeight:500}}>Best for: {hood.bestFor}</span>}
              </div>
            </div>
          </div>

          <div style={{padding:`0 ${px}px`}}>

          {/* ── ABOUT ── */}
          <p style={{fontSize:13,color:T.textBody,lineHeight:1.7,margin:"20px 0 0",letterSpacing:.3}}>{hood.desc}</p>

          {/* ── IMAGE CAROUSEL ── */}
          {hImgs.length>1&&<div style={{display:"flex",gap:8,overflowX:"auto",margin:"16px 0",paddingBottom:4,WebkitOverflowScrolling:"touch"}}>
            {hImgs.map((img,i)=><div key={i} style={{width:isD?200:isM?150:170,height:isD?130:isM?100:110,borderRadius:14,overflow:"hidden",flexShrink:0,border:`1px solid ${T.border}`}}>
              <img src={img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.65}}/>
            </div>)}
          </div>}

          {/* ── DIRECTIONS CTA ── */}
          <a href={mapsDir(hood.lat,hood.lng)} target="_blank" rel="noopener noreferrer" className="cta" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:"13px 0",borderRadius:99,background:hood.color,color:T.bg,fontSize:12,fontWeight:700,textAlign:"center",textDecoration:"none",letterSpacing:1.5,textTransform:"uppercase",marginTop:8}}>{IC.dir(T.bg,14)} Get Directions</a>

          {/* ── WALKING PATH ── */}
          {hood.walk&&<div style={{marginTop:24}}>
            <Head text={hood.walk.name} color={hood.color}/>
            <div style={{display:"flex",gap:12,marginBottom:12}}>
              <span style={{fontSize:10,padding:"3px 10px",borderRadius:99,background:"rgba(255,255,255,.06)",color:T.textSec,fontWeight:600}}>{hood.walk.distance}</span>
              <span style={{fontSize:10,padding:"3px 10px",borderRadius:99,background:"rgba(255,255,255,.06)",color:T.textSec,fontWeight:600}}>{hood.walk.time}</span>
            </div>
            <div style={{position:"relative",paddingLeft:20}}>
              <div style={{position:"absolute",left:6,top:4,bottom:4,width:2,background:`${hood.color}33`,borderRadius:2}}/>
              {hood.walk.steps.map((step,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:12,position:"relative"}}>
                <div style={{width:14,height:14,borderRadius:"50%",background:i===0||i===hood.walk.steps.length-1?hood.color:`${hood.color}44`,border:`2px solid ${hood.color}`,flexShrink:0,marginTop:1,position:"absolute",left:-7}}/>
                <p style={{margin:0,fontSize:12,color:i===0?T.textHi:T.textBody,lineHeight:1.5,paddingLeft:16,fontWeight:i===0?600:400}}>{step}</p>
              </div>)}
            </div>
          </div>}

          {/* ── DIRECTORY: restaurants, bars, shops, entertainment ── */}
          {hood.spots&&hood.spots.length>0&&(()=>{
            const SCATS=[{id:"all",label:"All",icon:"✦"},{id:"eat",label:"Eat",icon:"🍽️"},{id:"drink",label:"Drink",icon:"🍸"},{id:"sweet",label:"Coffee & Sweets",icon:"☕"},{id:"shop",label:"Shop",icon:"🛍️"},{id:"play",label:"Do",icon:"🎬"}];
            const filtered=spotCat==="all"?hood.spots:hood.spots.filter(s=>s.cat===spotCat);
            return <div style={{marginTop:24}}>
              <div style={{display:"flex",alignItems:"baseline",gap:10,margin:"0 0 10px"}}>
                <h2 style={{fontSize:isD?22:18,fontWeight:300,color:T.textHi,letterSpacing:1.5,margin:0}}>{hood.name} <span style={{color:hood.color,fontWeight:300}}>Directory</span></h2>
                <span style={{fontSize:11,color:T.textDim,letterSpacing:1}}>{filtered.length}</span>
              </div>
              <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:8,WebkitOverflowScrolling:"touch",marginBottom:4}}>
                {SCATS.map(c=>{const active=spotCat===c.id;const cnt=c.id==="all"?hood.spots.length:hood.spots.filter(s=>s.cat===c.id).length;if(cnt===0&&c.id!=="all")return null;return(
                  <button key={c.id} onClick={()=>setSpotCat(c.id)} className="pill" style={{padding:"6px 12px",borderRadius:99,background:active?`${hood.color}18`:"rgba(255,255,255,.05)",border:`1px solid ${active?hood.color+"44":T.border}`,color:active?hood.color:T.textSec,cursor:"pointer",fontSize:10,fontWeight:active?600:500,whiteSpace:"nowrap",letterSpacing:.8,textTransform:"uppercase",display:"flex",alignItems:"center",gap:4}}>
                    <span style={{fontSize:12}}>{c.icon}</span>{c.label}<span style={{fontSize:9,color:active?hood.color:T.textDim,marginLeft:2}}>({cnt})</span>
                  </button>);})}
              </div>
              <div style={{display:"grid",gridTemplateColumns:isD?"1fr 1fr":"1fr",gap:6}}>
                {filtered.map((spot,i)=>{
                  const card=<div key={i} className="ecard" style={{background:CG._,borderRadius:16,border:`1px solid ${T.border}`,padding:"14px 16px",display:"flex",flexDirection:"column",gap:4}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                      <div style={{width:40,height:40,borderRadius:11,background:"rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{spot.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                          <h4 style={{margin:0,fontSize:14,fontWeight:600,color:T.textHi}}>{spot.name}</h4>
                          {spot.price&&<span style={{fontSize:9,color:T.textDim,fontWeight:500}}>{spot.price}</span>}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                          <span style={{fontSize:9,padding:"1px 7px",borderRadius:99,background:`${hood.color}15`,color:hood.color,fontWeight:600,letterSpacing:.4,textTransform:"uppercase"}}>{spot.type}</span>
                          {spot.addr&&<span style={{fontSize:10,color:T.textDim,letterSpacing:.3}}>{spot.addr}</span>}
                        </div>
                        <p style={{margin:"5px 0 0",fontSize:12,color:T.textBody,lineHeight:1.45}}>{spot.desc}</p>
                        {spot.known&&<p style={{margin:"4px 0 0",fontSize:10,color:T.textSec,letterSpacing:.3,fontStyle:"italic"}}>Known for: {spot.known}</p>}
                      </div>
                    </div>
                  </div>;
                  return spot.url?<a key={i} href={spot.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",color:"inherit"}}>{card}</a>:card;
                })}
              </div>
            </div>;
          })()}

          {/* ── AREA EVENTS ── */}
          {hood.events&&hood.events.length>0&&<div style={{marginTop:24}}>
            <Head text="Events & Happenings" count={hood.events.length} color={hood.color}/>
            {hood.events.map((ev,i)=>(
              <div key={i} className="ecard" style={{background:CG._,borderRadius:16,border:`1px solid ${T.border}`,padding:"12px 16px",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <h4 style={{margin:0,fontSize:14,fontWeight:600,color:T.textHi}}>{ev.name}</h4>
                  <span style={{fontSize:9,padding:"3px 9px",borderRadius:99,background:`${hood.color}15`,border:`1px solid ${hood.color}33`,color:hood.color,fontWeight:600,letterSpacing:.5}}>{ev.when}</span>
                </div>
                <p style={{margin:"4px 0 0",fontSize:12,color:T.textBody,lineHeight:1.45}}>{ev.desc}</p>
              </div>
            ))}
            {hoodEvents.length>0&&hoodEvents.map((ev,i)=>{const ac=CA[ev.cat]||T.accent,gr=CG[ev.cat]||CG._;return(
              <div key={ev.id} className="ecard" style={{background:gr,borderRadius:16,border:`1px solid ${T.border}`,padding:"12px 16px",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16}}>{ev.emoji}</span>
                  <div style={{flex:1}}>
                    <h4 style={{margin:0,fontSize:13,fontWeight:600,color:T.textHi}}>{ev.title}</h4>
                    <p style={{margin:"1px 0 0",fontSize:10,fontWeight:600,color:ac,letterSpacing:1}}>{ev.date} \u00b7 {ev.time} \u00b7 {ev.price}</p>
                  </div>
                </div>
              </div>
            );})}
          </div>}

          {/* ── VENUES ── */}
          {hoodVenues.length>0&&<div style={{marginTop:24}}>
            <Head text={"Venues in "+hood.name} count={hoodVenues.length} color={hood.color}/>
            {hoodVenues.map((v,i)=>(
              <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer" className="ecard" style={{display:"flex",alignItems:"center",gap:12,textDecoration:"none",color:"inherit",background:CG._,borderRadius:16,border:`1px solid ${T.border}`,padding:"12px 14px",marginBottom:6}}>
                <div style={{width:48,height:48,borderRadius:14,overflow:"hidden",flexShrink:0,background:"rgba(255,255,255,.05)"}}>
                  <img src={v.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.6}} onError={e=>{e.target.style.display="none"}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <h4 style={{margin:0,fontSize:14,fontWeight:600,color:T.textHi}}>{v.name}</h4>
                  <p style={{margin:"1px 0 0",fontSize:10,color:T.textSec,letterSpacing:.5}}>{v.type} \u00b7 {v.cap}</p>
                </div>
                {IC.chev(T.textDim,16)}
              </a>
            ))}
          </div>}

          {/* ── HISTORY ── */}
          {hood.history&&<div style={{marginTop:24}}>
            <Head text="History" color={T.textSec}/>
            <div style={{background:CG._,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"14px 16px":"18px 22px"}}>
              <p style={{margin:0,fontSize:13,color:T.textBody,lineHeight:1.8,letterSpacing:.3}}>{hood.history}</p>
            </div>
          </div>}

          {/* ── TAGS ── */}
          <div style={{display:"flex",gap:5,marginTop:20,flexWrap:"wrap"}}>
            {hood.tags.map(tag=><span key={tag} style={{fontSize:9,padding:"4px 10px",borderRadius:99,background:`${hood.color}12`,border:`1px solid ${hood.color}25`,color:hood.color,fontWeight:600,letterSpacing:.5}}>{tag}</span>)}
          </div>

          <div style={{height:100}}/>
          </div>
        </div>;
      })()}

      {/* ═══ SAVED TAB ═══ */}
      {tab==="saved"&&<div style={sec}>
        <Head text="Saved Events" count={favs.length} mt={16} color={T.gold}/>
        {favs.length===0?<div style={{textAlign:"center",padding:"40px 0"}}><p style={{fontSize:13,color:T.textDim}}>No saved events yet. Tap the heart on any event to save it.</p></div>
        :EVENTS.filter(ev=>favs.includes(ev.id)).map((ev,i)=>{const ac=CA[ev.cat]||T.accent,gr=CG[ev.cat]||CG._;return(
          <div key={ev.id} onClick={()=>navigateToEvent(ev.id)} className="ecard" style={{background:gr,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"14px":"16px 20px",marginBottom:8,cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <div style={{width:42,height:42,borderRadius:13,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{ev.emoji}</div>
              <div style={{flex:1}}>
                <h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>{ev.title}</h3>
                <p style={{margin:"2px 0 0",fontSize:11,fontWeight:600,color:ac,letterSpacing:1.4}}>{ev.date} · {ev.time}</p>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10}}>
                  <span style={{fontSize:17,fontWeight:300,color:T.textHi}}>{ev.price}</span>
                  <button onClick={(e)=>{e.stopPropagation();tog(ev.id);}} className="hbtn" style={{background:"rgba(212,173,101,.1)",border:"1px solid rgba(212,173,101,.2)",borderRadius:99,padding:"5px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:T.gold,fontSize:10,fontWeight:600}}>{IC.heart(T.gold,12,true)} Saved</button>
                </div>
              </div>
            </div>
          </div>
        );})}
        <div style={{height:90}}/>
      </div>}

      {/* ═══ EVENT DETAIL ═══ */}
      {tab.startsWith("event:")&&(()=>{
        const eid=tab.split(":")[1];
        const ev=EVENTS.find(e=>String(e.id)===String(eid));
        if(!ev)return null;
        return <EventDetail event={ev} isSaved={favs.includes(ev.id)}
          onToggleSave={()=>tog(ev.id)}
          onBack={()=>{setTab(prevTab);window.scrollTo(0,0);}}
          isM={isM} isT={isT} isD={isD}/>;
      })()}

      {/* ═══ PARK DETAIL (accessed from Explore) ═══ */}
      {tab.startsWith("park:")&&(()=>{
        const parkId=tab.split(":")[1];
        const park=PARKS.find(p=>p.id===parkId);
        if(!park)return null;
        const pc=park.color||"#81C784";
        const PTABS=[{id:"overview",label:"Overview",icon:IC.explore},
          park.trails?.length&&{id:"trails",label:"Trails",icon:IC.trail},
          park.lake&&{id:"fishing",label:"Fishing",icon:IC.fish},
          park.activities?.length&&{id:"activities",label:"Activities",icon:IC.disc},
          {id:"info",label:"Info",icon:IC.info}].filter(Boolean);
        const mapsUrl=q=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

        return <div style={{maxWidth:mxW,margin:"0 auto"}}>

          {/* ── HERO IMAGE ── */}
          <div style={{position:"relative",height:isD?280:isM?220:250,overflow:"hidden",borderRadius:"0 0 24px 24px"}}>
            <img src={park.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.45}}/>
            <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,rgba(20,22,24,.2) 0%,rgba(20,22,24,.95) 100%)`}}/>
            <button onClick={()=>setTab("explore")} className="hbtn" style={{position:"absolute",top:16,left:16,background:"rgba(20,22,24,.6)",backdropFilter:"blur(8px)",border:`1px solid ${T.border}`,borderRadius:99,padding:"8px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:T.textBody,fontSize:10,fontWeight:600,letterSpacing:.5}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg> Explore</button>
            <div style={{position:"absolute",top:16,right:16,display:"flex",gap:8}}>
              <span style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",padding:"5px 14px",borderRadius:99,background:`${pc}22`,color:pc,border:`1px solid ${pc}33`,backdropFilter:"blur(12px)"}}>🌿 Park</span>
              {park.admission&&<span style={{fontSize:10,fontWeight:600,letterSpacing:1,textTransform:"uppercase",padding:"5px 14px",borderRadius:99,background:"rgba(20,22,24,.6)",color:T.text,border:"1px solid rgba(255,255,255,.12)",backdropFilter:"blur(12px)"}}>{park.admission}</span>}
            </div>
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:`0 ${px}px 20px`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:pc,boxShadow:`0 0 12px ${pc}`}}/>
                <span style={{fontSize:10,fontWeight:700,color:pc,letterSpacing:2,textTransform:"uppercase"}}>{park.tagline||""}</span>
              </div>
              <h1 style={{margin:0,fontSize:isD?32:26,fontWeight:300,color:T.textHi,letterSpacing:1.5,lineHeight:1.1}}>{park.name}</h1>
              {park.nickname&&<p style={{fontSize:13,color:"rgba(242,239,233,.6)",margin:"4px 0 0",fontStyle:"italic"}}>Locally known as &ldquo;{park.nickname}&rdquo;</p>}
              <div style={{display:"flex",flexWrap:"wrap",gap:isM?10:14,marginTop:10}}>
                {park.hours&&<span style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"rgba(242,239,233,.9)"}}>{IC.clock("rgba(242,239,233,.6)",13)} {park.hours}</span>}
                {park.address&&<span style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"rgba(242,239,233,.9)"}}>{IC.pin("rgba(242,239,233,.6)",13)} {park.address.split(",")[1]?.trim()||park.address}</span>}
              </div>
            </div>
          </div>

          <div style={{padding:`0 ${px}px`}}>

          {/* ── STAT PILLS ── */}
          <div style={{display:"flex",gap:8,margin:"20px 0 24px",overflowX:"auto",paddingBottom:2}}>
            {[park.acreage&&{label:"Acres",value:park.acreage.toLocaleString()},park.lake&&{label:"Lake",value:`${park.lake.acres} ac`},park.lake&&{label:"Depth",value:park.lake.maxDepth},park.trails?.length&&{label:"Trails",value:park.trails.length}].filter(Boolean).map((s,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"14px 10px",flex:1,minWidth:80,background:"rgba(255,255,255,.03)",borderRadius:14,border:`1px solid ${T.border}`}}>
                <span style={{fontSize:10,color:T.textDim,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>{s.label}</span>
                <span style={{fontSize:18,fontWeight:700,color:T.textHi}}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* ── TAB BAR ── */}
          <div style={{display:"flex",gap:4,marginBottom:24,overflowX:"auto",paddingBottom:2}}>
            {PTABS.map(t=>(
              <button key={t.id} onClick={()=>setParkTab(t.id)} className="hbtn" style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:99,cursor:"pointer",border:`1px solid ${parkTab===t.id?pc+"44":T.border}`,background:parkTab===t.id?`${pc}15`:"rgba(255,255,255,.02)",color:parkTab===t.id?pc:T.textSec,fontSize:12,fontWeight:600,letterSpacing:.5,whiteSpace:"nowrap",flexShrink:0}}>
                {t.icon(parkTab===t.id?pc:T.textSec,14)} {t.label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {parkTab==="overview"&&<div style={{animation:"cardIn 0.3s ease both"}}>
            <p style={{fontSize:13,color:T.textBody,lineHeight:1.7,margin:"0 0 20px",letterSpacing:.3}}>{park.desc}</p>

            {/* Directions CTA */}
            <a href={mapsUrl(park.address)} target="_blank" rel="noopener noreferrer" className="cta" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:"13px 0",borderRadius:99,background:pc,color:T.bg,fontSize:12,fontWeight:700,textAlign:"center",textDecoration:"none",letterSpacing:1.5,textTransform:"uppercase",marginBottom:16}}>{IC.dir(T.bg,14)} Get Directions</a>

            {/* Activities preview */}
            {park.activities?.length>0&&<>
              <Head text="Things to Do" count={park.activities.length} color={pc}/>
              <div style={{display:"grid",gridTemplateColumns:isD?"1fr 1fr":"1fr",gap:8,marginBottom:24}}>
                {park.activities.slice(0,4).map((a,i)=>{
                  const IconFn=IC[a.icon];
                  return <div key={i} className="ecard" style={{padding:"16px 14px",borderRadius:14,background:"rgba(255,255,255,.02)",border:`1px solid ${T.border}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                      <div style={{width:38,height:38,borderRadius:11,background:`${pc}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{IconFn?IconFn(pc,18):null}</div>
                      <div><p style={{fontSize:15,fontWeight:600,color:T.textHi,margin:0}}>{a.name}</p>{a.season&&<p style={{fontSize:10,color:T.textSec,margin:"2px 0 0",fontWeight:500}}>{a.season}</p>}</div>
                    </div>
                    <p style={{fontSize:12,color:T.textBody,lineHeight:1.6,margin:0}}>{a.desc}</p>
                  </div>;
                })}
              </div>
              {park.activities.length>4&&<button onClick={()=>setParkTab("activities")} className="hbtn" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",padding:"10px 0",borderRadius:99,background:"rgba(255,255,255,.04)",border:`1px solid ${T.border}`,color:pc,fontSize:11,fontWeight:600,letterSpacing:.8,cursor:"pointer",marginBottom:24}}>View All {park.activities.length} Activities {IC.chev(pc,12)}</button>}
            </>}

            {/* Trails preview */}
            {park.trails?.length>0&&<>
              <Head text="Trails" count={park.trails.length} color={pc}/>
              {park.trails.slice(0,2).map((t,i)=>{
                const dc=t.difficulty==="Easy"?pc:t.difficulty==="Moderate"?"#E8B54D":T.red;
                return <div key={i} className="ecard" style={{background:CG.park,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"18px 16px":"20px 18px",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                    <div>
                      <p style={{fontSize:16,fontWeight:700,color:T.textHi,margin:0}}>{t.name}</p>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:5}}>
                        <span style={{fontSize:11,color:pc,fontWeight:600}}>{t.distance}</span>
                        <span style={{color:T.textDim}}>·</span>
                        <span style={{fontSize:11,color:T.textSec}}>{t.surface}</span>
                      </div>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,color:dc,background:`${dc}18`,padding:"4px 12px",borderRadius:99,letterSpacing:.5,flexShrink:0}}>{t.difficulty}</span>
                  </div>
                  <p style={{fontSize:13,color:T.textBody,lineHeight:1.65,margin:0}}>{t.desc}</p>
                </div>;
              })}
              {park.trails.length>2&&<button onClick={()=>setParkTab("trails")} className="hbtn" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",padding:"10px 0",borderRadius:99,background:"rgba(255,255,255,.04)",border:`1px solid ${T.border}`,color:pc,fontSize:11,fontWeight:600,letterSpacing:.8,cursor:"pointer",marginBottom:16}}>View All {park.trails.length} Trails {IC.chev(pc,12)}</button>}
            </>}

            {/* Tags */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:12,marginBottom:24}}>
              {park.tags.map(tag=><span key={tag} style={{fontSize:10,padding:"5px 12px",borderRadius:99,background:`${pc}12`,border:`1px solid ${pc}25`,color:pc,fontWeight:600,letterSpacing:.5}}>{tag}</span>)}
            </div>
          </div>}

          {/* ── TRAILS TAB ── */}
          {parkTab==="trails"&&park.trails&&<div style={{animation:"cardIn 0.3s ease both"}}>
            <Head text="Trails" count={park.trails.length} color={pc}/>
            {park.trails.map((t,i)=>{
              const dc=t.difficulty==="Easy"?pc:t.difficulty==="Moderate"?"#E8B54D":T.red;
              const hasMap=!!TRAIL_MAP_DATA[parkId];
              return <div key={i} onClick={()=>{if(hasMap){setTab("trail:"+parkId+":"+i);window.scrollTo(0,0);}}} className="ecard" style={{background:CG.park,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"18px 16px":"20px 18px",marginBottom:12,cursor:hasMap?"pointer":"default"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                  <div>
                    <p style={{fontSize:16,fontWeight:700,color:T.textHi,margin:0}}>{t.name}</p>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:5}}>
                      <span style={{fontSize:11,color:pc,fontWeight:600}}>{t.distance}</span>
                      <span style={{color:T.textDim}}>·</span>
                      <span style={{fontSize:11,color:T.textSec}}>{t.surface}</span>
                    </div>
                  </div>
                  <span style={{fontSize:10,fontWeight:700,color:dc,background:`${dc}18`,padding:"4px 12px",borderRadius:99,letterSpacing:.5,flexShrink:0}}>{t.difficulty}</span>
                </div>
                <p style={{fontSize:13,color:T.textBody,lineHeight:1.65,margin:"0 0 12px"}}>{t.desc}</p>
                {t.features&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {t.features.map(f=><span key={f} style={{fontSize:10,padding:"4px 10px",borderRadius:99,background:`${pc}0D`,border:`1px solid ${pc}25`,color:pc,fontWeight:500}}>{f}</span>)}
                </div>}
                {hasMap&&<div style={{display:"flex",alignItems:"center",gap:6,marginTop:10}}>
                  <span style={{fontSize:11,color:pc,fontWeight:600,letterSpacing:.5}}>{IC.pin(pc,13)} View Interactive Map</span>
                  {IC.chev(pc,12)}
                </div>}
              </div>;
            })}
            <div style={{background:`${pc}08`,borderRadius:14,border:`1px solid ${pc}25`,padding:16,marginTop:16,marginBottom:24}}>
              <p style={{fontSize:11,fontWeight:700,color:pc,letterSpacing:1.5,textTransform:"uppercase",margin:"0 0 10px"}}>Trail Tips</p>
              <div style={{fontSize:13,color:T.textBody,lineHeight:1.7}}>
                <p style={{margin:"0 0 6px"}}>• Check trail conditions after rain — natural surface trails can be muddy</p>
                <p style={{margin:"0 0 6px"}}>• Bring water on longer loops — stations may be seasonal</p>
                <p style={{margin:0}}>• Dogs must be leashed on all trails (6ft max)</p>
              </div>
            </div>
          </div>}

          {/* ── FISHING TAB ── */}
          {parkTab==="fishing"&&park.lake&&<div style={{animation:"cardIn 0.3s ease both"}}>
            <Head text="Fishing" color="#5CA8D4"/>
            <div style={{background:CG.water,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"18px 14px":"20px 18px",marginBottom:16}}>
              <p style={{fontSize:10,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 14px"}}>Species in the Lake</p>
              {park.lake.species.map((sp,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,.02)",border:`1px solid ${T.border}`,marginBottom:8}}>
                  <span style={{fontSize:22,flexShrink:0}}>🐟</span>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:14,fontWeight:600,color:T.textHi,margin:0}}>{sp.name}</p>
                    <p style={{fontSize:11,color:T.textSec,margin:"2px 0 0"}}>{sp.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(92,168,212,.06)",borderRadius:14,border:"1px solid rgba(92,168,212,.18)",padding:16,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                {IC.info("#5CA8D4",16)}
                <p style={{fontSize:13,fontWeight:600,color:T.textHi,margin:0}}>License Required</p>
              </div>
              <p style={{fontSize:13,color:T.textBody,lineHeight:1.65,margin:"0 0 10px"}}>{park.lake.license}</p>
              {park.lake.licenseUrl&&<a href={park.lake.licenseUrl} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:"#5CA8D4",fontWeight:600,textDecoration:"none"}}>Get license at OutdoorNebraska.gov {IC.link("#5CA8D4",12)}</a>}
            </div>
            {park.lake.spots&&<div style={{marginBottom:16}}>
              <p style={{fontSize:10,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 12px"}}>Where to Fish</p>
              {park.lake.spots.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0"}}><div style={{width:6,height:6,borderRadius:99,background:"#5CA8D4",flexShrink:0}}/><span style={{fontSize:13,color:T.textBody}}>{s}</span></div>)}
            </div>}
            {park.lake.rules&&<div style={{marginBottom:24}}>
              <p style={{fontSize:10,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 12px"}}>Fishing Rules</p>
              {park.lake.rules.map((r,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0"}}>{IC.info(T.textDim,13)}<span style={{fontSize:13,color:T.textBody}}>{r}</span></div>)}
            </div>}
          </div>}

          {/* ── ACTIVITIES TAB ── */}
          {parkTab==="activities"&&park.activities&&<div style={{animation:"cardIn 0.3s ease both"}}>
            <Head text="Things to Do" count={park.activities.length} color={pc}/>
            <div style={{display:"grid",gridTemplateColumns:isD?"1fr 1fr":"1fr",gap:8,marginBottom:24}}>
              {park.activities.map((a,i)=>{
                const IconFn=IC[a.icon];
                return <div key={i} className="ecard" style={{padding:"16px 14px",borderRadius:14,background:"rgba(255,255,255,.02)",border:`1px solid ${T.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                    <div style={{width:38,height:38,borderRadius:11,background:`${pc}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{IconFn?IconFn(pc,18):null}</div>
                    <div><p style={{fontSize:15,fontWeight:600,color:T.textHi,margin:0}}>{a.name}</p>{a.season&&<p style={{fontSize:10,color:T.textSec,margin:"2px 0 0",fontWeight:500}}>{a.season}</p>}</div>
                  </div>
                  <p style={{fontSize:12,color:T.textBody,lineHeight:1.6,margin:0}}>{a.desc}</p>
                </div>;
              })}
            </div>
          </div>}

          {/* ── INFO TAB ── */}
          {parkTab==="info"&&<div style={{animation:"cardIn 0.3s ease both"}}>
            <Head text="Park Details" color={T.textHi}/>
            <div style={{marginBottom:24}}>
              {park.hours&&<div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
                <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:`${pc}12`,display:"flex",alignItems:"center",justifyContent:"center"}}>{IC.clock(pc,16)}</div>
                <div><p style={{fontSize:10,color:T.textDim,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",margin:"0 0 3px"}}>Hours</p><p style={{fontSize:14,color:T.textHi,fontWeight:500,margin:0}}>{park.hours}</p></div>
              </div>}
              {park.address&&<div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
                <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:`${pc}12`,display:"flex",alignItems:"center",justifyContent:"center"}}>{IC.pin(pc,16)}</div>
                <div><p style={{fontSize:10,color:T.textDim,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",margin:"0 0 3px"}}>Address</p><p style={{fontSize:14,color:T.textHi,fontWeight:500,margin:0}}>{park.address}</p></div>
              </div>}
              {park.phone&&<div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
                <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:`${pc}12`,display:"flex",alignItems:"center",justifyContent:"center"}}>{IC.phone(pc,14)}</div>
                <div><p style={{fontSize:10,color:T.textDim,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",margin:"0 0 3px"}}>Phone</p><p style={{fontSize:14,color:T.textHi,fontWeight:500,margin:0}}>{park.phone}</p></div>
              </div>}
              {park.website&&<a href={park.website} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",display:"flex",alignItems:"flex-start",gap:12,padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
                <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:`${pc}12`,display:"flex",alignItems:"center",justifyContent:"center"}}>{IC.globe(pc,14)}</div>
                <div style={{flex:1}}><p style={{fontSize:10,color:T.textDim,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",margin:"0 0 3px"}}>Website</p><p style={{fontSize:14,color:T.textHi,fontWeight:500,margin:0}}>{park.website.replace("https://","")}</p></div>
                {IC.link(T.textDim,12)}
              </a>}
            </div>

            {/* Entrances */}
            {park.entrances&&<div style={{marginBottom:24}}>
              <p style={{fontSize:10,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 12px"}}>Park Entrances</p>
              {park.entrances.map((e,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{width:30,height:30,borderRadius:99,background:`${pc}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:13,fontWeight:700,color:pc}}>{e.num}</span>
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:14,fontWeight:600,color:T.textHi,margin:0}}>{e.name}</p>
                    <p style={{fontSize:11,color:T.textSec,margin:"2px 0 0"}}>{e.note}</p>
                  </div>
                </div>
              ))}
            </div>}

            {/* Amenities */}
            {park.amenities&&<div style={{marginBottom:24}}>
              <p style={{fontSize:10,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 12px"}}>Amenities</p>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {park.amenities.map(a=><span key={a} style={{fontSize:11,padding:"6px 13px",borderRadius:99,background:"rgba(255,255,255,.03)",border:`1px solid ${T.border}`,color:T.textBody,fontWeight:500}}>{a}</span>)}
              </div>
            </div>}

            {/* Rules */}
            {(park.rules_allowed||park.rules_prohibited)&&<div style={{marginBottom:24}}>
              <p style={{fontSize:10,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 8px"}}>Park Rules</p>
              {park.rules_allowed?.map(r=><div key={r} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0"}}>
                <div style={{width:22,height:22,borderRadius:99,flexShrink:0,background:"rgba(107,191,122,.12)",display:"flex",alignItems:"center",justifyContent:"center"}}>{IC.check("#7DD4A0",12)}</div>
                <span style={{fontSize:13,color:T.textBody}}>{r}</span>
              </div>)}
              {park.rules_prohibited?.map(r=><div key={r} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0"}}>
                <div style={{width:22,height:22,borderRadius:99,flexShrink:0,background:"rgba(232,54,79,.12)",display:"flex",alignItems:"center",justifyContent:"center"}}>{IC.x(T.red,12)}</div>
                <span style={{fontSize:13,color:T.textBody}}>{r}</span>
              </div>)}
            </div>}
          </div>}

          {/* ── CTAs ── */}
          <a href={mapsUrl(park.address)} target="_blank" rel="noopener noreferrer" className="cta" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",padding:"16px 0",borderRadius:99,textDecoration:"none",background:`linear-gradient(135deg,${pc},${pc}dd)`,color:T.bg,fontSize:13,fontWeight:700,letterSpacing:2,textTransform:"uppercase",boxShadow:`0 4px 24px ${pc}33`,marginBottom:12}}>{IC.pin(T.bg,16)} Get Directions</a>
          <div style={{display:"flex",gap:8,marginBottom:32}}>
            {park.website&&<a href={park.website} target="_blank" rel="noopener noreferrer" className="hbtn" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"13px 0",borderRadius:99,background:"rgba(255,255,255,.04)",border:`1px solid ${T.border}`,color:T.text,fontSize:11,fontWeight:600,letterSpacing:1.2,textTransform:"uppercase",textDecoration:"none"}}>{IC.globe(T.textSec,13)} Website</a>}
            <button onClick={()=>{if(navigator.share)navigator.share({title:park.name,url:window.location.href}).catch(()=>{});else navigator.clipboard?.writeText(window.location.href);}} className="hbtn" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"13px 0",borderRadius:99,background:"rgba(255,255,255,.04)",border:`1px solid ${T.border}`,color:T.text,fontSize:11,fontWeight:600,letterSpacing:1.2,textTransform:"uppercase",cursor:"pointer"}}>{IC.share(T.textSec,13)} Share</button>
          </div>

          <div style={{textAlign:"center",paddingBottom:32,borderTop:`1px solid ${T.border}`,paddingTop:20}}>
            <p style={{fontSize:10,color:T.textDim,letterSpacing:.6,margin:"0 0 4px"}}>Park info subject to change · Verify details at venue websites</p>
            <p style={{fontSize:9,color:"rgba(235,230,220,.2)",letterSpacing:.4,margin:0}}>&copy; 2026 GO: Guide to Omaha</p>
          </div>

          <div style={{height:100}}/>
          </div>
        </div>;
      })()}

      {/* ═══ TRAIL DETAIL PAGE ═══ */}
      {tab.startsWith("trailDetail:")&&(()=>{
        const trailId=tab.split(":")[1];
        const trail=TRAILS.find(t=>t.id===trailId);
        if(!trail)return null;
        return(<div style={{...sec,paddingTop:0}}>
          <div style={{position:"relative",height:isD?320:260,overflow:"hidden",borderRadius:"0 0 24px 24px",margin:"0 -16px"}}>
            <img src={trail.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(20,22,24,.2) 0%,rgba(20,22,24,.85) 100%)"}}/>
            <button onClick={()=>{setTab(prevTab||"today");window.scrollTo(0,0);}} className="hbtn" style={{position:"absolute",top:16,left:16,background:"rgba(0,0,0,.5)",border:"none",borderRadius:99,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",backdropFilter:"blur(8px)"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
            <div style={{position:"absolute",bottom:20,left:20,right:20}}>
              <div style={{display:"flex",gap:6,marginBottom:8}}>
                <span style={{fontSize:9,padding:"3px 10px",borderRadius:99,background:"rgba(125,212,160,.2)",color:"#81C784",fontWeight:700}}>{trail.difficulty}</span>
                <span style={{fontSize:9,padding:"3px 10px",borderRadius:99,background:"rgba(255,255,255,.12)",color:T.textBody,fontWeight:600}}>{trail.distance}</span>
              </div>
              <h1 style={{margin:0,fontSize:isD?28:24,fontWeight:300,color:T.textHi,letterSpacing:1}}>{trail.name}</h1>
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:20}}>
            {[{label:"Distance",value:trail.distance},{label:"Elevation",value:trail.elev},{label:"Surface",value:trail.surface},{label:"Difficulty",value:trail.difficulty}].map(s=>(
              <div key={s.label} style={{background:"rgba(255,255,255,.04)",border:`1px solid ${T.border}`,borderRadius:12,padding:"8px 14px",textAlign:"center"}}>
                <div style={{fontSize:9,color:T.textDim,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>{s.label}</div>
                <div style={{fontSize:13,fontWeight:600,color:T.textHi}}>{s.value}</div>
              </div>
            ))}
          </div>
          {trail.bestFor&&<p style={{margin:"16px 0 0",fontSize:12,color:"#81C784",fontWeight:500}}>{trail.bestFor}</p>}
          <p style={{margin:"12px 0 0",fontSize:14,color:T.textBody,lineHeight:1.7}}>{trail.desc}</p>
          {trail.highlights&&<div style={{marginTop:20}}>
            <h3 style={{fontSize:12,fontWeight:600,color:T.textSec,letterSpacing:2,textTransform:"uppercase",margin:"0 0 12px"}}>Highlights</h3>
            {trail.highlights.map((h,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"#81C784",marginTop:6,flexShrink:0}}/>
                <span style={{fontSize:13,color:T.textBody,lineHeight:1.5}}>{h}</span>
              </div>
            ))}
          </div>}
          {trail.parkingNote&&<div style={{marginTop:16,padding:"12px 16px",background:"rgba(255,255,255,.03)",border:`1px solid ${T.border}`,borderRadius:14}}>
            <div style={{fontSize:10,color:T.textDim,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Parking</div>
            <div style={{fontSize:12,color:T.textBody,lineHeight:1.5}}>{trail.parkingNote}</div>
          </div>}
          <div style={{display:"flex",gap:5,marginTop:16,flexWrap:"wrap"}}>{trail.tags.map(tag=><span key={tag} style={{fontSize:10,padding:"4px 12px",borderRadius:99,background:"rgba(255,255,255,.05)",color:T.textSec,fontWeight:500}}>{tag}</span>)}</div>
          <div style={{display:"flex",gap:8,marginTop:20}}>
            <a href={mapsDir(trail.lat,trail.lng)} target="_blank" rel="noopener noreferrer" className="hbtn" style={{flex:1,padding:"14px 0",borderRadius:99,background:"rgba(125,212,160,.12)",border:"1px solid rgba(125,212,160,.25)",color:"#81C784",fontSize:13,fontWeight:600,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,minHeight:48}}>{IC.dir("#81C784",14)} Directions</a>
            {trail.url&&<a href={trail.url} target="_blank" rel="noopener noreferrer" className="hbtn" style={{flex:1,padding:"14px 0",borderRadius:99,background:"rgba(255,255,255,.05)",border:`1px solid ${T.border}`,color:T.textBody,fontSize:13,fontWeight:600,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,minHeight:48}}>{IC.link(T.textBody,13)} Info</a>}
          </div>
          <div style={{height:120}}/>
        </div>);
      })()}

      {/* ═══ VENUE DETAIL PAGE ═══ */}
      {tab.startsWith("venue:")&&(()=>{
        const venueId=tab.split(":")[1];
        const venue=DAYTIME.find(a=>a.id===venueId);
        if(!venue)return null;
        const venueEvents=EVENTS.filter(e=>e.venue&&venue.name&&(e.venue.toLowerCase().includes(venue.name.split(" ")[0].toLowerCase())||venue.name.toLowerCase().includes(e.venue.split(" ")[0].toLowerCase()))).slice(0,5);
        return(<div style={{...sec,paddingTop:0}}>
          <div style={{position:"relative",height:isD?320:260,overflow:"hidden",borderRadius:"0 0 24px 24px",margin:"0 -16px"}}>
            {venue.img?<img src={venue.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none"}}/>:<div style={{width:"100%",height:"100%",background:CG._}}/>}
            <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(20,22,24,.2) 0%,rgba(20,22,24,.85) 100%)"}}/>
            <button onClick={()=>{setTab(prevTab||"today");window.scrollTo(0,0);}} className="hbtn" style={{position:"absolute",top:16,left:16,background:"rgba(0,0,0,.5)",border:"none",borderRadius:99,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",backdropFilter:"blur(8px)"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
            <div style={{position:"absolute",bottom:20,left:20,right:20}}>
              <span style={{fontSize:36,marginBottom:8,display:"block"}}>{venue.icon}</span>
              <h1 style={{margin:0,fontSize:isD?28:24,fontWeight:300,color:T.textHi,letterSpacing:1}}>{venue.name}</h1>
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:20}}>
            <div style={{background:`${T.accent}15`,border:`1px solid ${T.accent}30`,borderRadius:12,padding:"8px 14px",textAlign:"center"}}>
              <div style={{fontSize:9,color:T.textDim,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>Admission</div>
              <div style={{fontSize:13,fontWeight:600,color:T.accent}}>{venue.price}</div>
            </div>
            <div style={{background:"rgba(255,255,255,.04)",border:`1px solid ${T.border}`,borderRadius:12,padding:"8px 14px",textAlign:"center"}}>
              <div style={{fontSize:9,color:T.textDim,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>Time</div>
              <div style={{fontSize:13,fontWeight:600,color:T.textHi}}>{venue.time}</div>
            </div>
          </div>
          <p style={{margin:"16px 0 0",fontSize:14,color:T.textBody,lineHeight:1.7}}>{venue.desc}</p>
          {venue.highlights&&<div style={{marginTop:24}}>
            <h3 style={{fontSize:12,fontWeight:600,color:T.textSec,letterSpacing:2,textTransform:"uppercase",margin:"0 0 12px"}}>Highlights</h3>
            <div style={{display:"grid",gridTemplateColumns:isD?"1fr 1fr":"1fr",gap:8}}>
              {venue.highlights.map((h,i)=>(
                <div key={i} style={{padding:"12px 16px",background:"rgba(255,255,255,.03)",border:`1px solid ${T.border}`,borderRadius:14,display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:T.accent,flexShrink:0}}/>
                  <span style={{fontSize:13,color:T.textBody}}>{h}</span>
                </div>
              ))}
            </div>
          </div>}
          {venue.address&&<div style={{marginTop:16,padding:"12px 16px",background:"rgba(255,255,255,.03)",border:`1px solid ${T.border}`,borderRadius:14}}>
            <div style={{fontSize:10,color:T.textDim,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Address</div>
            <div style={{fontSize:12,color:T.textBody}}>{venue.address}</div>
          </div>}
          <div style={{display:"flex",gap:5,marginTop:16,flexWrap:"wrap"}}>{venue.tags.map(tag=><span key={tag} style={{fontSize:10,padding:"4px 12px",borderRadius:99,background:"rgba(255,255,255,.05)",color:T.textSec,fontWeight:500}}>{tag}</span>)}</div>
          {venueEvents.length>0&&<div style={{marginTop:24}}>
            <h3 style={{fontSize:12,fontWeight:600,color:T.textSec,letterSpacing:2,textTransform:"uppercase",margin:"0 0 12px"}}>Upcoming Events</h3>
            {venueEvents.map(ev=>{const ac=CA[ev.cat]||T.accent,gr=CG[ev.cat]||CG._;return(
              <div key={ev.id} onClick={()=>navigateToEvent(ev.id)} className="ecard" style={{background:gr,borderRadius:14,border:`1px solid ${T.border}`,padding:"12px 16px",marginBottom:8,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:18}}>{ev.emoji}</span>
                  <div style={{flex:1}}>
                    <h4 style={{margin:0,fontSize:13,fontWeight:600,color:T.textHi}}>{ev.title}</h4>
                    <p style={{margin:"2px 0 0",fontSize:11,color:ac,fontWeight:500}}>{ev.date} · {ev.time}</p>
                  </div>
                  <span style={{fontSize:12,color:T.textDim}}>{ev.price}</span>
                </div>
              </div>
            );})}
          </div>}
          <div style={{display:"flex",gap:8,marginTop:20}}>
            <a href={mapsDir(venue.lat,venue.lng)} target="_blank" rel="noopener noreferrer" className="hbtn" style={{flex:1,padding:"14px 0",borderRadius:99,background:"rgba(255,255,255,.06)",border:`1px solid ${T.border}`,color:T.textBody,fontSize:13,fontWeight:600,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,minHeight:48}}>{IC.dir(T.textBody,14)} Directions</a>
            {venue.url&&<a href={venue.url} target="_blank" rel="noopener noreferrer" className="hbtn" style={{flex:1,padding:"14px 0",borderRadius:99,background:`${T.accent}15`,border:`1px solid ${T.accent}30`,color:T.accent,fontSize:13,fontWeight:600,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,minHeight:48}}>{IC.link(T.accent,13)} Visit Website</a>}
          </div>
          <div style={{height:120}}/>
        </div>);
      })()}

      {/* ═══ WALK DETAIL PAGE ═══ */}
      {tab.startsWith("walk:")&&(()=>{
        const walkId=tab.split(":")[1];
        const walk=WALKS.find(w=>w.id===walkId);
        if(!walk)return null;
        return(<div style={{...sec,paddingTop:0}}>
          <div style={{position:"relative",height:isD?280:220,overflow:"hidden",borderRadius:"0 0 24px 24px",margin:"0 -16px"}}>
            <div style={{width:"100%",height:"100%",background:CG.hood}}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{walk.icon("#FFB74D",64)}</div>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(20,22,24,.1) 0%,rgba(20,22,24,.8) 100%)"}}/>
            <button onClick={()=>{setTab(prevTab||"today");window.scrollTo(0,0);}} className="hbtn" style={{position:"absolute",top:16,left:16,background:"rgba(0,0,0,.5)",border:"none",borderRadius:99,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",backdropFilter:"blur(8px)"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
            <div style={{position:"absolute",bottom:20,left:20,right:20}}>
              <h1 style={{margin:0,fontSize:isD?28:24,fontWeight:300,color:T.textHi,letterSpacing:1}}>{walk.name}</h1>
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:20}}>
            <div style={{background:"rgba(255,183,77,.12)",border:"1px solid rgba(255,183,77,.25)",borderRadius:12,padding:"8px 14px",textAlign:"center"}}>
              <div style={{fontSize:9,color:T.textDim,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>Distance</div>
              <div style={{fontSize:13,fontWeight:600,color:"#FFB74D"}}>{walk.distance}</div>
            </div>
            <div style={{background:"rgba(255,183,77,.12)",border:"1px solid rgba(255,183,77,.25)",borderRadius:12,padding:"8px 14px",textAlign:"center"}}>
              <div style={{fontSize:9,color:T.textDim,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>Time</div>
              <div style={{fontSize:13,fontWeight:600,color:"#FFB74D"}}>{walk.time}</div>
            </div>
          </div>
          <p style={{margin:"16px 0 0",fontSize:14,color:T.textBody,lineHeight:1.7}}>{walk.desc}</p>
          <div style={{display:"flex",gap:5,marginTop:16,flexWrap:"wrap"}}>{walk.tags.map(tag=><span key={tag} style={{fontSize:10,padding:"4px 12px",borderRadius:99,background:"rgba(255,255,255,.05)",color:T.textSec,fontWeight:500}}>{tag}</span>)}</div>
          <div style={{display:"flex",gap:8,marginTop:24}}>
            <a href={mapsDir(walk.lat,walk.lng)} target="_blank" rel="noopener noreferrer" className="hbtn" style={{flex:1,padding:"14px 0",borderRadius:99,background:"rgba(255,183,77,.12)",border:"1px solid rgba(255,183,77,.25)",color:"#FFB74D",fontSize:13,fontWeight:600,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,minHeight:48}}>{IC.dir("#FFB74D",14)} Get Directions</a>
          </div>
          <div style={{height:120}}/>
        </div>);
      })()}

      {/* ═══ TRAIL MAP (accessed from Park Detail) ═══ */}
      {tab.startsWith("trail:")&&(()=>{
        const parts=tab.split(":");
        const tParkId=parts[1];
        const trailIdx=parseInt(parts[2]||"0",10);
        const tPark=PARKS.find(p=>p.id===tParkId);
        if(!tPark)return null;
        const tData=TRAIL_MAP_DATA[tParkId];
        if(!tData)return null;
        return <TrailMap parkId={tParkId} parkName={tPark.name}
          parkColor={tPark.color||"#81C784"} initialTrailIndex={trailIdx}
          trailMapData={tData}
          onBack={()=>{setParkTab("trails");setTab("park:"+tParkId);window.scrollTo(0,0);}}/>;
      })()}

      {/* ═══ BOTTOM SLIDER + NAV ═══ */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,display:"flex",flexDirection:"column",background:"#000"}}>
        {tab==="today"&&<div style={{width:"100%",maxWidth:isD?560:isT?480:9999,padding:"8px 14px 4px",background:"rgba(32,34,38,.98)",backdropFilter:"blur(22px)",borderTop:`1px solid rgba(255,255,255,.1)`,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,maxWidth:440,margin:"0 auto"}}>
            <span style={{fontSize:16,opacity:.7,flexShrink:0}}>☀️</span>
            <div style={{flex:1,position:"relative",height:36,borderRadius:99,background:"rgba(255,255,255,.06)",border:`1px solid ${T.border}`,overflow:"hidden",cursor:"pointer"}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${Math.max(4,Math.min(96,tv))}%`,borderRadius:99,background:"linear-gradient(90deg,#F4C97E 0%,#87CEEB 22%,#E6956B 52%,#5C3470 78%,#1A2444 100%)",opacity:.35,transition:drag?"none":"width .4s ease"}}/>
              {!isLive&&<div style={{position:"absolute",left:`${Math.max(2,Math.min(98,nowTv))}%`,top:4,bottom:4,width:2,background:"rgba(255,255,255,.3)",borderRadius:1,transform:"translateX(-1px)",zIndex:1}}/>}
              <div style={{position:"absolute",left:`clamp(18px, ${tv}%, calc(100% - 18px))`,top:"50%",transform:"translate(-50%,-50%)",width:drag?30:26,height:drag?30:26,borderRadius:"50%",background:mColor,border:"2.5px solid rgba(255,255,255,.9)",boxShadow:`0 0 10px ${mColor}55`,transition:drag?"none":"all .25s ease",pointerEvents:"none",zIndex:3}}/>
              <input type="range" min="0" max="100" value={tv} onChange={e=>{setTv(Number(e.target.value));setIsLive(false);}} onMouseDown={()=>setDrag(true)} onMouseUp={()=>setDrag(false)} onTouchStart={()=>setDrag(true)} onTouchEnd={()=>setDrag(false)} style={{position:"absolute",width:"100%",height:"100%",opacity:0,cursor:"pointer",zIndex:4,margin:0}}/>
            </div>
            <span style={{fontSize:14,opacity:.7,flexShrink:0}}>🌙</span>
          </div>
          <div style={{display:"flex",justifyContent:"center",padding:"4px 0 0"}}>
            <button onClick={goLive} style={{background:isLive?`${T.accent}15`:"rgba(255,255,255,.06)",border:`1px solid ${isLive?T.accent+"33":T.border}`,borderRadius:99,padding:"2px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
              {isLive&&<div style={{width:5,height:5,borderRadius:"50%",background:T.accent,animation:"twinkle 1.5s ease-in-out infinite"}}/>}
              <span style={{fontSize:9,fontWeight:600,color:isLive?T.accent:T.textSec,letterSpacing:.6}}>{timeLabel}</span>
            </button>
          </div>
        </div>}
        <div style={{background:"rgba(38,40,46,.98)",backdropFilter:"blur(22px)",borderTop:`1px solid rgba(255,255,255,.12)`,display:"flex",justifyContent:"space-around",padding:`6px 4px ${Math.max(8,parseInt("env(safe-area-inset-bottom)")||8)}px`,paddingBottom:"max(8px, env(safe-area-inset-bottom))",width:"100%"}}>
          {tabsD.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:(tab===t.id||(t.id==="explore"&&(tab==="venues"||tab.startsWith("hood:")||tab.startsWith("park:")||tab.startsWith("trail:")||tab.startsWith("trailDetail:")||tab.startsWith("venue:")||tab.startsWith("walk:")))||(tab.startsWith("event:")&&prevTab===t.id))?"rgba(94,196,182,.1)":"transparent",border:"none",cursor:"pointer",padding:isD?"10px 24px":"10px 16px",borderRadius:11,minWidth:isD?80:isT?68:60,minHeight:48,color:(tab===t.id||(t.id==="explore"&&(tab==="venues"||tab.startsWith("hood:")||tab.startsWith("park:")||tab.startsWith("trail:")||tab.startsWith("trailDetail:")||tab.startsWith("venue:")||tab.startsWith("walk:")))||(tab.startsWith("event:")&&prevTab===t.id))?T.accent:"rgba(242,239,233,.55)",transition:"all .2s"}}>
              <span style={{position:"relative"}}>{t.icon((tab===t.id||(t.id==="explore"&&(tab==="venues"||tab.startsWith("hood:")||tab.startsWith("park:")||tab.startsWith("trail:")||tab.startsWith("trailDetail:")||tab.startsWith("venue:")||tab.startsWith("walk:")))||(tab.startsWith("event:")&&prevTab===t.id))?T.accent:"rgba(242,239,233,.55)",isD?24:22)}{t.id==="saved"&&favs.length>0&&<span style={{position:"absolute",top:-4,right:-8,background:T.accent,color:T.bg,fontSize:8,fontWeight:700,borderRadius:99,padding:"1px 4px",minWidth:12,textAlign:"center"}}>{favs.length}</span>}</span>
              <span style={{fontSize:isD?11:10,fontWeight:(tab===t.id||(t.id==="explore"&&(tab==="venues"||tab.startsWith("hood:")||tab.startsWith("park:")||tab.startsWith("trail:")||tab.startsWith("trailDetail:")||tab.startsWith("venue:")||tab.startsWith("walk:")))||(tab.startsWith("event:")&&prevTab===t.id))?600:500,letterSpacing:.8,textTransform:"uppercase"}}>{t.label}</span>
            </button>
          ))}
        </div>
        <div style={{background:"#000",width:"100%",height:"env(safe-area-inset-bottom,0px)"}}/>
      </div>

      <style>{`
        @keyframes twinkle{0%,100%{opacity:.3}50%{opacity:1}}
        @keyframes cardIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        input[type="range"]{-webkit-appearance:none;appearance:none}
        input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:40px;height:40px}
        .ecard{transition:all .22s cubic-bezier(.25,.8,.25,1)}.ecard:hover{transform:translateY(-1px);border-color:rgba(255,255,255,.18)!important}
        .hbtn{transition:all .18s ease}.hbtn:hover{color:#fff!important;background:rgba(255,255,255,.1)!important}.hbtn:active{transform:scale(.96)}
      `}</style>
      </>}
    </div>
  );
}
