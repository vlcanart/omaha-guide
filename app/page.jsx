"use client";
import { useState, useEffect, useMemo } from "react";

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
  _: "linear-gradient(135deg,#1E2024 0%,#262A2E 60%,#202428 100%)",
};
const CA = { concerts:"#5EC4B6", sports:"#64B5F6", comedy:"#FFB74D" };

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
  events:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="16" r="2"/></svg>,
  explore:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={c} opacity=".15"/></svg>,
  venues:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  saved:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>,
};
const mapsDir=(lat,lng)=>`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
const u=id=>`https://images.unsplash.com/${id}?w=600&h=400&fit=crop&q=80`;

/* ═══ CONTENT DATA ═══ */
const TRAILS=[
  {id:"t1",name:"Keystone Trail",desc:"Omaha's backbone — 50+ miles of paved multi-use trail through the metro.",distance:"52 mi",difficulty:"Easy",surface:"Paved",lat:41.24,lng:-96.02,tags:["Cycling","Running"],img:u("photo-1552674605-db6ffd4facb5"),elev:"Flat",icon:IC.bike},
  {id:"t2",name:"Bob Kerrey Bridge Loop",desc:"Cross the Missouri River to Iowa and back. Best sunrise views in the city.",distance:"3.2 mi",difficulty:"Easy",surface:"Paved",lat:41.2575,lng:-95.9215,tags:["Walking","River"],img:u("photo-1506157786151-b8491531f063"),elev:"Flat",icon:IC.walk},
  {id:"t3",name:"Fontenelle Forest",desc:"2,000 acres of old-growth forest. Boardwalk canopy trail. Watch for bald eagles.",distance:"17 mi trails",difficulty:"Moderate",surface:"Dirt / Boardwalk",lat:41.157,lng:-95.9,tags:["Forest","Birding"],img:u("photo-1448375240586-882707db888b"),elev:"+350 ft",url:"https://fontenelleforest.org",icon:IC.tree},
  {id:"t4",name:"Wehrspann Lake Loop",desc:"8-mile loop at Chalco Hills. Packed gravel, gentle rolling hills, shaded sections.",distance:"8.1 mi",difficulty:"Easy–Mod",surface:"Gravel",lat:41.18,lng:-96.13,tags:["Lake","Loop"],img:u("photo-1500534314263-0869cef27f7d"),elev:"+180 ft",icon:IC.trail},
  {id:"t5",name:"Zorinsky Lake Trail",desc:"Popular West Omaha loop with prairie views, fishing pier, and waterbird habitat.",distance:"4.8 mi",difficulty:"Easy",surface:"Paved",lat:41.23,lng:-96.075,tags:["Lake","Family"],img:u("photo-1441974231531-c6227db76b6e"),elev:"Flat",icon:IC.walk},
];
const WALKS=[
  {id:"w1",name:"Old Market Historic Walk",desc:"Cobblestone streets, 19th-century warehouses, galleries. Start at 10th & Howard.",time:"45 min",distance:"1.2 mi",lat:41.2555,lng:-95.932,tags:["History","Architecture"],icon:IC.camera},
  {id:"w2",name:"Benson Mainstreet",desc:"Omaha's most eclectic neighborhood. Vintage shops, murals, record stores, dive bars.",time:"1 hr",distance:"1.5 mi",lat:41.281,lng:-95.954,tags:["Music","Vintage"],icon:IC.walk},
  {id:"w3",name:"Blackstone to Dundee",desc:"Cocktail district to tree-lined neighborhood restaurants. Hit Crescent Moon and Pitch.",time:"1.5 hr",distance:"2.1 mi",lat:41.259,lng:-95.965,tags:["Dining","Cocktails"],icon:IC.food},
  {id:"w4",name:"North Omaha Murals",desc:"Street art celebrating Black history, jazz legends, and community resilience.",time:"1 hr",distance:"1.8 mi",lat:41.28,lng:-95.94,tags:["Art","Culture"],icon:IC.camera},
  {id:"w5",name:"RiverFront Trail",desc:"Gene Leahy Mall to Heartland of America Park to Lewis & Clark Landing.",time:"40 min",distance:"1.4 mi",lat:41.258,lng:-95.928,tags:["Riverfront","Family"],icon:IC.walk},
];
const DAYTIME=[
  {id:"d1",name:"Henry Doorly Zoo",desc:"Consistently ranked #1 zoo in the world. Desert Dome, Lied Jungle, and Scott Aquarium.",price:"$26.95",time:"3-5 hrs",lat:41.226,lng:-95.9287,tags:["Zoo","Family"],icon:"\u{1F981}",url:"https://www.omahazoo.com"},
  {id:"d2",name:"Joslyn Art Museum",desc:"World-class collection with massive expansion. Free admission.",price:"Free",time:"1.5-2 hrs",lat:41.2635,lng:-95.9394,tags:["Art","Free"],icon:"\u{1F3A8}",url:"https://joslyn.org"},
  {id:"d3",name:"Kiewit Luminarium",desc:"Interactive science center on the riverfront. 100+ hands-on exhibits.",price:"$24",time:"2-3 hrs",lat:41.2565,lng:-95.923,tags:["Science","Family"],icon:"\u{1F52C}",url:"https://kiewitluminarium.org"},
  {id:"d4",name:"Lauritzen Gardens",desc:"100-acre botanical garden with seasonal model trains and conservatory.",price:"$14",time:"1.5-2 hrs",lat:41.2384,lng:-95.9158,tags:["Gardens"],icon:"\u{1F33A}",url:"https://www.lauritzengardens.org"},
  {id:"d5",name:"The Durham Museum",desc:"Art Deco Union Station turned museum. Vintage train cars and 1930s soda fountain.",price:"$12",time:"1.5-2 hrs",lat:41.2553,lng:-95.931,tags:["History"],icon:"\u{1F682}",url:"https://durhammuseum.org"},
];
const SUNSETS=[
  {id:"s1",name:"Bob Kerrey Bridge",desc:"Best sunset panorama in Omaha. Missouri River catches golden light with both skylines.",lat:41.2575,lng:-95.9215,icon:IC.sunset},
  {id:"s2",name:"Gene Leahy Mall",desc:"Free outdoor movies and performances against a downtown backdrop.",lat:41.258,lng:-95.93,icon:IC.sunset},
  {id:"s3",name:"Stir Concert Cove",desc:"Lakeside summer concerts as the sun drops behind the stage.",lat:41.233,lng:-95.854,icon:IC.music},
  {id:"s4",name:"Turner Park",desc:"Jazz on the Green in summer. Bring wine and a picnic. Arrive by 6 PM.",lat:41.255,lng:-95.96,icon:IC.music},
];
const EVENTS=[
  {id:1,title:"Black Jacket Symphony",cat:"concerts",venue:"Steelhouse Omaha",date:"Sat",time:"8 PM",price:"$35-65",emoji:"\u{1F3B8}",desc:"Pink Floyd's The Wall note-for-note with full visual production.",feat:true},
  {id:2,title:"Tig Notaro",cat:"comedy",venue:"Holland PAC",date:"Sat",time:"7:30 PM",price:"$45-85",emoji:"\u{1F399}\uFE0F",desc:"Grammy-nominated deadpan comedy.",feat:true},
  {id:3,title:"Creighton vs. DePaul",cat:"sports",venue:"CHI Health Center",date:"Tue",time:"7 PM",price:"$25-90",emoji:"\u{1F3C0}",desc:"Big East basketball. Bluejays host DePaul at the CHI.",feat:true},
  {id:4,title:"Nate Jackson Live",cat:"comedy",venue:"Steelhouse Omaha",date:"Fri",time:"8 PM",price:"$40-80",emoji:"\u{1F602}",desc:"Instagram-famous comedian with electric crowd work.",feat:true},
  {id:5,title:"Ethel Cain",cat:"concerts",venue:"The Astro",date:"Wed",time:"8 PM",price:"$40-75",emoji:"\u{1F56F}\uFE0F",desc:"Southern gothic sensation live.",feat:true},
  {id:6,title:"LOVB Nebraska",cat:"sports",venue:"Baxter Arena",date:"Sat",time:"7 PM",price:"$20-50",emoji:"\u{1F3D0}",desc:"Pro volleyball. League One Volleyball's Nebraska franchise."},
  {id:7,title:"All Them Witches",cat:"concerts",venue:"The Slowdown",date:"Mon",time:"8 PM",price:"$25-35",emoji:"\u{1F3B8}",desc:"Heavy psychedelic rock double-header with King Buffalo."},
  {id:8,title:"Backline Improv",cat:"comedy",venue:"Backline Comedy",date:"Sat",time:"8 PM",price:"$10-15",emoji:"\u{1F602}",desc:"House improv team takes audience suggestions and runs."},
  {id:9,title:"Storm Chasers Opener",cat:"sports",venue:"Werner Park",date:"Fri",time:"6:35 PM",price:"$12-45",emoji:"\u26BE",desc:"2026 MiLB season kickoff with postgame fireworks.",feat:true},
];

/* ═══ APP ═══ */
export default function GOPrototype(){
  const[tv,setTv]=useState(50);
  const[drag,setDrag]=useState(false);
  const[w,setW]=useState(typeof window!=="undefined"?window.innerWidth:375);
  const[tab,setTab]=useState("home");
  const[favs,setFavs]=useState([]);
  useEffect(()=>{const h=()=>setW(window.innerWidth);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h)},[]);

  const isM=w<600,isT=w>=600&&w<960,isD=w>=960;
  const mxW=isD?860:isT?680:600,px=isD?32:isT?24:16;
  const sec={maxWidth:mxW,margin:"0 auto",padding:`0 ${px}px`};
  const sk=useMemo(()=>interp(tv),[tv]);
  const tog=id=>setFavs(p=>p.includes(id)?p.filter(f=>f!==id):[...p,id]);
  const nb=Math.max(0,Math.min(1,(tv-40)/45));
  const isDay=tv<45,isGold=tv>=45&&tv<68,isNite=tv>=68;
  const mLabel=isDay?"Daytime":isGold?"Golden Hour":"Tonight";
  const mColor=isDay?"#81C784":isGold?"#FFB74D":T.accent;
  const sunX=12+(tv/100)*76;
  const tr=drag?"none":"all 0.4s ease";

  const Head=({text,count,mt=20,color})=>(
    <div style={{display:"flex",alignItems:"baseline",gap:10,margin:`${mt}px 0 10px`}}>
      <h2 style={{fontSize:12,fontWeight:600,color:color||T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:0}}>{text}</h2>
      {count!=null&&<span style={{fontSize:11,color:T.textDim,letterSpacing:1}}>{count}</span>}
    </div>
  );
  const tabsD=[{id:"home",icon:IC.events,label:"Home"},{id:"explore",icon:IC.explore,label:"Explore"},{id:"venues",icon:IC.venues,label:"Venues"},{id:"saved",icon:IC.saved,label:"Saved"}];

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:T.sans,paddingBottom:130}}>

      {/* ═══ HERO ═══ */}
      <div style={{position:"relative",height:isD?"55vh":isM?"50vh":"52vh",minHeight:isD?400:320,maxHeight:560,overflow:"hidden"}}>
        {/* Sky */}
        <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg, ${sk.s1} 0%, ${sk.s2} 50%, ${sk.s3} 90%)`,transition:tr}}/>

        {/* Horizon glow — fades with sun */}
        <div style={{position:"absolute",bottom:"28%",left:0,right:0,height:"30%",background:`radial-gradient(ellipse 70% 100% at ${sunX}% 100%, ${sk.glow}25 0%, transparent 70%)`,opacity:sk.sunOp,transition:tr,pointerEvents:"none"}}/>

        {/* Stars */}
        <div style={{position:"absolute",inset:0,opacity:sk.starOp,transition:tr,pointerEvents:"none"}}>
          {STARS.map((s,i)=><div key={i} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.sz,height:s.sz,borderRadius:"50%",background:"#fff",animation:`twinkle ${s.dur}s ${s.dl}s ease-in-out infinite`}}/>)}
        </div>

        {/* Sun & Moon — same 180 arc, moon trails behind */}
        {(()=>{
          const arcTop = (p) => 82 - 68 * Math.sin(Math.PI * Math.max(0, Math.min(1, p)));
          const arcX = (p) => 12 + Math.max(0, Math.min(1, p)) * 76;
          const sunP = tv / 100;
          const moonP = (tv - 60) / 100;
          return(<div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
            {sk.sunOp>0.01&&<div style={{position:"absolute",left:`${arcX(sunP)}%`,top:`${arcTop(sunP)}%`,transform:"translate(-50%,-50%)",zIndex:3,pointerEvents:"none",transition:tr}}>
              <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:sk.sunSz*3.5,height:sk.sunSz*3.5,borderRadius:"50%",background:`radial-gradient(circle, ${sk.glow}20 0%, transparent 70%)`,opacity:sk.sunOp,transition:tr}}/>
              <div style={{width:sk.sunSz,height:sk.sunSz,borderRadius:"50%",background:`radial-gradient(circle at 40% 40%, #fff 0%, ${sk.sunC} 30%, ${sk.sunC}AA 65%, transparent 100%)`,boxShadow:`0 0 ${sk.sunSz*.8}px ${sk.sunC}66`,opacity:sk.sunOp,transition:tr}}/>
            </div>}
            {sk.moonOp>0.01&&moonP>0&&<div style={{position:"absolute",left:`${arcX(moonP)}%`,top:`${arcTop(moonP)}%`,transform:"translate(-50%,-50%)",zIndex:3,pointerEvents:"none",transition:tr}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:"radial-gradient(circle at 35% 35%, #EBE7DB, #C8C0B0)",boxShadow:"0 0 25px rgba(200,192,176,0.25), 0 0 80px rgba(200,192,176,0.06)",opacity:sk.moonOp,transition:tr}}>
                <div style={{position:"absolute",top:"20%",left:"26%",width:7,height:7,borderRadius:"50%",background:"rgba(0,0,0,0.06)"}}/>
                <div style={{position:"absolute",top:"50%",left:"60%",width:5,height:5,borderRadius:"50%",background:"rgba(0,0,0,0.04)"}}/>
                <div style={{position:"absolute",top:"70%",left:"34%",width:3.5,height:3.5,borderRadius:"50%",background:"rgba(0,0,0,0.035)"}}/>
              </div>
            </div>}
          </div>);
        })()}

        {/* SVG SKYLINE */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"78%",zIndex:5,transition:tr}}>
          <Skyline color={sk.bldg} winOp={sk.winOp}/>
        </div>

        {/* Fade skyline base into bg */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:60,zIndex:6,background:`linear-gradient(180deg,transparent,${T.bg})`}}/>

        {/* Hero text */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:10,padding:`0 ${px}px ${isD?30:22}px`,maxWidth:mxW,margin:"0 auto"}}>
          <h1 style={{fontSize:isD?44:isT?36:28,fontWeight:300,margin:0,color:T.text,letterSpacing:1.5,lineHeight:1.1,textShadow:"0 2px 12px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.6), 0 0 60px rgba(0,0,0,0.4)"}}>
            <span style={{fontWeight:800,letterSpacing:3}}>GO</span>
            <span style={{color:T.accent,margin:"0 6px",fontWeight:200}}>:</span>
            <span style={{fontWeight:400}}>Guide to Omaha</span>
          </h1>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6}}>
            <p style={{margin:0,fontSize:13,fontWeight:600,color:"#E6956B",letterSpacing:3.5,textTransform:"uppercase",textShadow:"0 2px 12px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.5)"}}>Omaha &middot; Council Bluffs</p>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px 4px 8px",borderRadius:99,background:"rgba(20,22,24,0.55)",backdropFilter:"blur(8px)",border:`1px solid ${T.border}`}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:mColor,boxShadow:`0 0 8px ${mColor}66`}}/>
              <span style={{fontSize:10,fontWeight:600,color:mColor,letterSpacing:1.2,textTransform:"uppercase"}}>{mLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      {tab==="home"&&<div style={sec}>

        {(isDay||isGold)&&<div style={{opacity:Math.min(1,(1-nb)*1.3),transition:"opacity 0.5s"}}>
          <Head text="Trails & Rides" count={TRAILS.length} mt={16} color="#81C784"/>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory"}}>
            {TRAILS.map(t=>(
              <div key={t.id} className="ecard" style={{background:CG.trail,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",width:isD?300:isM?258:275,minWidth:isD?300:isM?258:275,flexShrink:0,scrollSnapAlign:"start"}}>
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
                  <div style={{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}}>{t.tags.map(tag=><span key={tag} style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:"rgba(255,255,255,.04)",color:T.textSec,fontWeight:500}}>{tag}</span>)}</div>
                  <div style={{fontSize:10,color:T.venue,marginTop:6}}>{t.elev} &middot; {t.surface}</div>
                  <div style={{display:"flex",gap:6,marginTop:10}}>
                    <a href={mapsDir(t.lat,t.lng)} target="_blank" rel="noopener noreferrer" className="hbtn" style={{flex:1,padding:"8px 0",borderRadius:99,background:"rgba(125,212,160,.1)",border:"1px solid rgba(125,212,160,.2)",color:"#81C784",fontSize:10,fontWeight:600,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{IC.dir("#81C784",12)} Trail Map</a>
                    {t.url&&<a href={t.url} target="_blank" rel="noopener noreferrer" className="hbtn" style={{flex:1,padding:"8px 0",borderRadius:99,background:"rgba(255,255,255,.05)",border:`1px solid ${T.border}`,color:T.textBody,fontSize:10,fontWeight:600,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{IC.link(T.textBody,11)} Info</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Head text="Walking Tours" count={WALKS.length} color="#FFB74D"/>
          {WALKS.map((wk,i)=>(
            <div key={wk.id} className="ecard" style={{background:CG.hood,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"14px":"16px 20px",marginBottom:8,animation:`cardIn .3s ${i*.04}s both`}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{width:42,height:42,borderRadius:13,background:"rgba(255,183,77,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{wk.icon("#FFB74D",20)}</div>
                <div style={{flex:1}}>
                  <h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>{wk.name}</h3>
                  <p style={{margin:"2px 0 0",fontSize:11,fontWeight:600,letterSpacing:1.4,color:"#FFB74D"}}>{wk.distance} &middot; {wk.time}</p>
                  <p style={{margin:"6px 0 0",fontSize:12,color:T.textBody,lineHeight:1.5}}>{wk.desc}</p>
                  <div style={{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}}>{wk.tags.map(tag=><span key={tag} style={{fontSize:9,padding:"3px 9px",borderRadius:99,background:"rgba(255,255,255,.05)",color:T.textSec,fontWeight:500}}>{tag}</span>)}</div>
                  <a href={mapsDir(wk.lat,wk.lng)} target="_blank" rel="noopener noreferrer" className="hbtn" style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:10,padding:"7px 14px",borderRadius:99,background:"rgba(255,183,77,.1)",border:"1px solid rgba(255,183,77,.2)",color:"#FFB74D",fontSize:10,fontWeight:600,textDecoration:"none"}}>{IC.dir("#FFB74D",11)} Start Walk</a>
                </div>
              </div>
            </div>
          ))}

          <Head text="Things To Do" count={DAYTIME.length} color={T.accent}/>
          {DAYTIME.map((a,i)=>(
            <div key={a.id} className="ecard" style={{background:CG._,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"14px":"16px 20px",marginBottom:8,animation:`cardIn .3s ${i*.04}s both`}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{width:42,height:42,borderRadius:13,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{a.icon}</div>
                <div style={{flex:1}}>
                  <h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>{a.name}</h3>
                  <p style={{margin:"2px 0 0",fontSize:11,fontWeight:600,letterSpacing:1.4,color:T.accent}}>{a.time} &middot; {a.price}</p>
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

        {isGold&&<div style={{marginTop:16}}>
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

        {(isGold||isNite)&&<div style={{opacity:Math.min(1,nb*1.5),transition:"opacity 0.5s"}}>
          <Head text={isGold?"Starting Soon":"Tonight's Events"} count={EVENTS.length} mt={isGold?20:16} color={T.accent}/>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory",marginBottom:10}}>
            {EVENTS.filter(e=>e.feat).map(ev=>{const ac=CA[ev.cat]||T.accent,gr=CG[ev.cat]||CG._;return(
              <div key={ev.id} className="ecard" style={{background:gr,borderRadius:18,border:`1px solid ${T.border}`,width:isD?340:isM?265:290,minWidth:isD?340:isM?265:290,flexShrink:0,scrollSnapAlign:"start",padding:"16px 16px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:42,height:42,borderRadius:13,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{ev.emoji}</div>
                  <div><h3 style={{margin:0,fontSize:16,fontWeight:600,color:T.textHi}}>{ev.title}</h3><p style={{margin:"1px 0 0",fontSize:11,fontWeight:600,color:ac,letterSpacing:1.4,textTransform:"uppercase"}}>{ev.date} &middot; {ev.time}</p></div>
                </div>
                <p style={{margin:"0 0 10px",fontSize:12,color:T.textBody,lineHeight:1.45}}>{ev.desc}</p>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:18,fontWeight:300,color:T.textHi}}>{ev.price}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <button onClick={()=>tog(ev.id)} className="hbtn" style={{background:"rgba(255,255,255,.05)",border:"none",borderRadius:99,padding:"5px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:3,color:favs.includes(ev.id)?T.gold:T.textSec}}>{IC.heart(favs.includes(ev.id)?T.gold:T.textSec,13,favs.includes(ev.id))}</button>
                    <span style={{fontSize:10,color:T.venue,letterSpacing:1,fontWeight:500}}>{ev.venue}</span>
                  </div>
                </div>
              </div>
            )})}
          </div>
          {EVENTS.filter(e=>!e.feat).map((ev,i)=>{const ac=CA[ev.cat]||T.accent,gr=CG[ev.cat]||CG._;return(
            <div key={ev.id} className="ecard" style={{background:gr,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"14px":"16px 20px",marginBottom:8,animation:`cardIn .3s ${i*.04}s both`}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{width:42,height:42,borderRadius:13,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{ev.emoji}</div>
                <div style={{flex:1}}>
                  <h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>{ev.title}</h3>
                  <p style={{margin:"2px 0 0",fontSize:11,fontWeight:600,color:ac,letterSpacing:1.4}}>{ev.date} &middot; {ev.time}</p>
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

        {isDay&&<div style={{textAlign:"center",padding:"20px 0",marginTop:8}}><p style={{fontSize:11,color:T.textDim,letterSpacing:.8}}>Slide to evening to see tonight&apos;s events</p></div>}
      </div>}

      {/* ═══ BOTTOM SLIDER + NAV ═══ */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,padding:"0 14px max(4px,env(safe-area-inset-bottom))",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{width:"100%",maxWidth:isD?480:isT?400:360,padding:"10px 16px 6px",background:"rgba(20,22,24,.95)",backdropFilter:"blur(22px)",borderRadius:"14px 14px 0 0",borderTop:`1px solid ${T.border}`,borderLeft:`1px solid ${T.border}`,borderRight:`1px solid ${T.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:22,flexShrink:0}}>{"\u2600\uFE0F"}</span>
            <div style={{flex:1,position:"relative",height:40,display:"flex",alignItems:"center"}}>
              <div style={{position:"absolute",left:0,right:0,height:5,borderRadius:99,background:"linear-gradient(90deg,#F4C97E 0%,#87CEEB 20%,#E6956B 50%,#5C3470 75%,#111828 100%)",opacity:.5}}/>
              <div style={{position:"absolute",left:0,width:`${tv}%`,height:5,borderRadius:99,background:"linear-gradient(90deg,#F4C97E 0%,#87CEEB 30%,#E6956B 60%,#5C3470 85%,#111828 100%)",opacity:.85}}/>
              <input type="range" min="0" max="100" value={tv} onChange={e=>setTv(Number(e.target.value))} onMouseDown={()=>setDrag(true)} onMouseUp={()=>setDrag(false)} onTouchStart={()=>setDrag(true)} onTouchEnd={()=>setDrag(false)} style={{position:"absolute",width:"100%",height:40,opacity:0,cursor:"pointer",zIndex:2,margin:0}}/>
              <div style={{position:"absolute",left:`${tv}%`,top:"50%",transform:"translate(-50%,-50%)",width:drag?26:20,height:drag?26:20,borderRadius:"50%",background:mColor,border:"2.5px solid #fff",boxShadow:`0 0 12px ${mColor}66`,transition:drag?"none":"all .15s",pointerEvents:"none"}}/>
            </div>
            <span style={{fontSize:20,flexShrink:0}}>{"\u{1F319}"}</span>
          </div>
        </div>
        <div style={{background:"rgba(27,29,33,.93)",backdropFilter:"blur(22px)",borderRadius:"0 0 16px 16px",display:"flex",justifyContent:"space-around",padding:"4px 2px 6px",width:"100%",maxWidth:isD?480:isT?400:360,border:`1px solid ${T.border}`,borderTop:"none"}}>
          {tabsD.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:tab===t.id?"rgba(94,196,182,.08)":"transparent",border:"none",cursor:"pointer",padding:isD?"8px 22px":"7px 10px",borderRadius:11,minWidth:isD?76:isT?58:48,color:tab===t.id?T.accent:T.textDim,transition:"all .2s"}}>
              <span style={{position:"relative"}}>{t.icon(tab===t.id?T.accent:T.textDim,isD?20:17)}{t.id==="saved"&&favs.length>0&&<span style={{position:"absolute",top:-4,right:-8,background:T.accent,color:T.bg,fontSize:8,fontWeight:700,borderRadius:99,padding:"1px 4px",minWidth:12,textAlign:"center"}}>{favs.length}</span>}</span>
              <span style={{fontSize:isD?10:9,fontWeight:tab===t.id?600:400,letterSpacing:.8,textTransform:"uppercase"}}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes twinkle{0%,100%{opacity:.3}50%{opacity:1}}
        @keyframes cardIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        input[type="range"]{-webkit-appearance:none;appearance:none}
        input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:40px;height:40px}
        .ecard{transition:all .22s cubic-bezier(.25,.8,.25,1)}.ecard:hover{transform:translateY(-1px);border-color:rgba(255,255,255,.18)!important}
        .hbtn{transition:all .18s ease}.hbtn:hover{color:#fff!important;background:rgba(255,255,255,.1)!important}.hbtn:active{transform:scale(.96)}
      `}</style>
    </div>
  );
}
