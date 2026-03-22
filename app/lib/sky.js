/* ═══ SKY ENGINE ═══ */

/* ── Color math ── */
const h2r=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const r2h=([r,g,b])=>"#"+[r,g,b].map(c=>Math.round(Math.min(255,Math.max(0,c))).toString(16).padStart(2,"0")).join("");
const mc=(a,b,t)=>{const[r1,g1,b1]=h2r(a),[r2,g2,b2]=h2r(b);return r2h([r1+(r2-r1)*t,g1+(g2-g1)*t,b1+(b2-b1)*t])};
const mx=(a,b,t)=>a+(b-a)*t;

/* ── Sky gradient stops ── */
export const STOPS=[
  {t:0,  s1:"#4A7CB5",s2:"#D4956B",s3:"#F4C97E",bldg:"#000000",sunY:.74,sunC:"#FFD07A",sunSz:38,sunOp:1,  moonOp:0, starOp:0, winOp:0,  glow:"#FFD07A"},
  {t:25, s1:"#5B9BD5",s2:"#87CEEB",s3:"#B8DCF0",bldg:"#000000",sunY:.18,sunC:"#FFFBE8",sunSz:28,sunOp:.9,moonOp:0, starOp:0, winOp:0,  glow:"#FFFBE8"},
  {t:50, s1:"#C27840",s2:"#E6956B",s3:"#F0C27A",bldg:"#000000",sunY:.68,sunC:"#FF9944",sunSz:44,sunOp:1,  moonOp:0, starOp:0, winOp:0,  glow:"#FF9944"},
  {t:75, s1:"#2A1B4E",s2:"#5C3470",s3:"#C26848",bldg:"#000000",sunY:.92,sunC:"#D84420",sunSz:50,sunOp:.5,moonOp:.3,starOp:.2,winOp:.5,glow:"#D84420"},
  {t:90, s1:"#0C1628",s2:"#122240",s3:"#1A2A4A",bldg:"#000000",sunY:1.25,sunC:"#D84420",sunSz:50,sunOp:0,  moonOp:1, starOp:1, winOp:1,  glow:"#C8C0B0"},
  {t:100,s1:"#0C1628",s2:"#122240",s3:"#1A2A4A",bldg:"#000000",sunY:1.25,sunC:"#D84420",sunSz:50,sunOp:0,  moonOp:1, starOp:1, winOp:1,  glow:"#C8C0B0"},
];

/* ── Interpolate between stops ── */
export function interp(v){
  let lo=STOPS[0],hi=STOPS[STOPS.length-1];
  for(let i=0;i<STOPS.length-1;i++){if(v>=STOPS[i].t&&v<=STOPS[i+1].t){lo=STOPS[i];hi=STOPS[i+1];break;}}
  const rng=hi.t-lo.t||1,t=(v-lo.t)/rng,r={};
  for(const k of Object.keys(lo)){if(k==="t")continue;if(typeof lo[k]==="string"&&lo[k].startsWith("#"))r[k]=mc(lo[k],hi[k],t);else if(typeof lo[k]==="number")r[k]=mx(lo[k],hi[k],t);}
  return r;
}

/* ── Pre-generated star positions ── */
export const STARS=Array.from({length:60},()=>({x:Math.random()*100,y:Math.random()*28,sz:Math.random()*2+.5,dl:Math.random()*3,dur:2+Math.random()*3}));

/* ── Sunrise/sunset table (Omaha, one entry per month) ── */
export const SUN_TABLE=[
  {sr:7.5,ss:17.2},{sr:7.1,ss:17.8},{sr:7.3,ss:19.3},{sr:6.5,ss:20},{sr:6,ss:20.5},
  {sr:5.8,ss:20.8},{sr:6,ss:20.7},{sr:6.4,ss:20.1},{sr:7,ss:19.3},{sr:7.4,ss:18.4},
  {sr:7,ss:17},{sr:7.4,ss:16.8}
];

/* ── Map current time to sky slider value (0-100) ── */
export function getNowTv(){
  const now=new Date(),mo=now.getMonth(),hr=now.getHours()+now.getMinutes()/60;
  const{sr,ss}=SUN_TABLE[mo];
  if(hr<=sr-1)return 95;if(hr<=sr)return 85+(sr-hr)*10;
  if(hr>=ss+1)return 95;if(hr>=ss)return 85+(hr-ss)*10;
  return 5+((hr-sr)/(ss-sr))*80;
}

/* ── Weather condition icons ── */
export const WX_ICONS={clear:"\u2600\uFE0F",cloudy:"\u2601\uFE0F",rainy:"\uD83C\uDF27\uFE0F",snowy:"\u2744\uFE0F"};
