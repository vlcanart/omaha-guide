"use client";
import { useState, useEffect } from "react";
import { Music, Trophy, Laugh, Users, Drama, PartyPopper, CalendarDays } from "lucide-react";

/* ═══ DESIGN TOKENS ═══ */
const T={
  bg:"#141618",surface:"#1B1D21",card:"#1F2227",
  border:"rgba(255,255,255,0.08)",borderHi:"rgba(255,255,255,0.18)",
  text:"#F2EFE9",textHi:"#FFFFFF",textBody:"rgba(242,239,233,0.82)",
  textSec:"rgba(242,239,233,0.58)",textDim:"rgba(242,239,233,0.32)",
  venue:"rgba(242,239,233,0.72)",accent:"#5EC4B6",
  accentSoft:"rgba(94,196,182,0.10)",accentGlow:"rgba(94,196,182,0.30)",
  gold:"#D4AD65",green:"#7DD4A0",red:"#E8364F",
  sans:"'Inter',system-ui,-apple-system,sans-serif",
};
function isDisplayablePrice(p){if(!p)return false;const s=p.trim().toLowerCase();if(s==="free")return true;return/^\$\d/.test(p.trim());}
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
const CAT_LABEL={concerts:"Concert",sports:"Sports",festivals:"Festival",family:"Family",arts:"Arts",comedy:"Comedy"};
const CAT_ICON={concerts:Music,sports:Trophy,comedy:Laugh,family:Users,arts:Drama,festivals:PartyPopper};
function CatIcon({cat,size=20,color}){const Icon=CAT_ICON[cat]||CalendarDays;return <Icon size={size} color={color||CA[cat]||T.accent} strokeWidth={1.8}/>;}

/* ═══ SVG ICONS ═══ */
const I={
  back:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  cal:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  clock:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  pin:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  ticket:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><circle cx="8" cy="14" r="1" fill={c}/></svg>,
  heart:(c,s=18,fill=false)=><svg width={s} height={s} viewBox="0 0 24 24" fill={fill?c:"none"} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  share:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  play:(c,s=22)=><svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke="none"><polygon points="6,3 20,12 6,21"/></svg>,
  ext:(c,s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  spotify:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>,
  users:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  tv:(c,s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>,
};

/* ═══ KNOWN TEAMS (for auto-enrichment) ═══ */
const TEAMS={
  // Match longer/more specific keys FIRST — order matters for the find() loop
  "omaha lancers":{name:"Omaha Lancers",abbr:"OL",color:"#00843D",logo:"/images/content/teams/omaha-lancers/hero.jpg"},
  "omaha supernovas":{name:"Omaha Supernovas",abbr:"SUP",color:"#FFD700",logo:"/images/content/teams/omaha-supernovas/og-image.png"},
  "omaha storm chasers":{name:"Omaha Storm Chasers",abbr:"OMA",color:"#003DA5",logo:"/images/content/teams/omaha-storm-chasers/og-image.jpg"},
  "omaha kings":{name:"Omaha Kings & Queens",abbr:"OKQ",color:"#C41E3A",logo:"/images/content/teams/omaha-kings-queens/hero.jpg"},
  "storm chasers":{name:"Omaha Storm Chasers",abbr:"OMA",color:"#003DA5",logo:"/images/content/teams/omaha-storm-chasers/og-image.jpg"},
  "union omaha":{name:"Union Omaha",abbr:"UO",color:"#1C2B39",logo:""},
  "lancers":{name:"Omaha Lancers",abbr:"OL",color:"#00843D",logo:"/images/content/teams/omaha-lancers/hero.jpg"},
  "supernovas":{name:"Omaha Supernovas",abbr:"SUP",color:"#FFD700",logo:"/images/content/teams/omaha-supernovas/og-image.png"},
  "creighton":{name:"Creighton Bluejays",abbr:"CU",color:"#005CA9",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/156.png"},
  "bluejays":{name:"Creighton Bluejays",abbr:"CU",color:"#005CA9",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/156.png"},
  "nebraska":{name:"Nebraska Huskers",abbr:"NEB",color:"#E41C38",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/158.png"},
  "huskers":{name:"Nebraska Huskers",abbr:"NEB",color:"#E41C38",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/158.png"},
  "omaha mavericks":{name:"Omaha Mavericks",abbr:"UNO",color:"#000000",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2437.png"},
  "mavericks":{name:"Omaha Mavericks",abbr:"UNO",color:"#000000",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2437.png"},
  "sioux falls":{name:"Sioux Falls Stampede",abbr:"SF",color:"#003DA5",logo:""},
  "lincoln stars":{name:"Lincoln Stars",abbr:"LS",color:"#FFD700",logo:""},
  "sioux city":{name:"Sioux City Musketeers",abbr:"SC",color:"#003366",logo:""},
  "stampede":{name:"Sioux Falls Stampede",abbr:"SF",color:"#003DA5",logo:""},
  "musketeers":{name:"Sioux City Musketeers",abbr:"SC",color:"#003366",logo:""},
  "buffalo":{name:"Buffalo Bisons",abbr:"BUF",color:"#003DA5",logo:""},
  "indianapolis":{name:"Indianapolis Indians",abbr:"IND",color:"#C8102E",logo:""},
  "grand rapids":{name:"Grand Rapids Rise",abbr:"GR",color:"#00843D",logo:""},
  "dallas pulse":{name:"Dallas Pulse",abbr:"DAL",color:"#003DA5",logo:""},
  "indy ignite":{name:"Indy Ignite",abbr:"IND",color:"#FF6B00",logo:""},
  "iowa":{name:"Iowa",abbr:"IOW",color:"#FFCD00",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2294.png"},
  "kansas":{name:"Kansas",abbr:"KU",color:"#0051BA",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png"},
  "villanova":{name:"Villanova",abbr:"NOVA",color:"#00205B",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/222.png"},
  "marquette":{name:"Marquette",abbr:"MARQ",color:"#003366",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/269.png"},
  "xavier":{name:"Xavier",abbr:"XAV",color:"#0C2340",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2752.png"},
  "uconn":{name:"UConn",abbr:"UCONN",color:"#000E2F",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/41.png"},
  "butler":{name:"Butler",abbr:"BUT",color:"#13294B",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2166.png"},
  "depaul":{name:"DePaul",abbr:"DPU",color:"#005EB8",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/305.png"},
  "seton hall":{name:"Seton Hall",abbr:"SHU",color:"#004488",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2550.png"},
  "st. john":{name:"St. John's",abbr:"SJU",color:"#C8102E",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2599.png"},
  "georgetown":{name:"Georgetown",abbr:"GTOWN",color:"#041E42",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/46.png"},
  "providence":{name:"Providence",abbr:"PROV",color:"#000000",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2507.png"},
  "wisconsin":{name:"Wisconsin",abbr:"WIS",color:"#C5050C",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/275.png"},
  "minnesota":{name:"Minnesota",abbr:"MINN",color:"#7A0019",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/135.png"},
  "michigan":{name:"Michigan",abbr:"MICH",color:"#00274C",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/130.png"},
  "ohio state":{name:"Ohio State",abbr:"OSU",color:"#BB0000",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/194.png"},
  "penn state":{name:"Penn State",abbr:"PSU",color:"#041E42",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/213.png"},
};

function autoEnrichSports(ev){
  if(ev.cat!=="sports"||ev.matchup)return ev;
  const t=ev.title.toLowerCase();
  const enriched={...ev};

  // Try to parse "Team A v Team B" or "Team A vs Team B" or "Team A vs. Team B"
  const vsMatch=t.match(/^(.+?)\s+(?:v\.?\s*|vs\.?\s+)(.+?)(?:\s+at\s+|\s*$)/i);
  if(vsMatch){
    const find=(str)=>{
      const s=str.trim().toLowerCase();
      // Sort keys by length descending so "omaha lancers" matches before "omaha"
      const sortedKeys=Object.keys(TEAMS).sort((a,b)=>b.length-a.length);
      for(const k of sortedKeys){if(s.includes(k))return TEAMS[k];}
      // Fallback: use the name parts
      const words=str.trim().split(/\s+/);
      const abbr=words.map(w=>w[0]).join("").toUpperCase().slice(0,4);
      return{name:str.trim(),abbr,color:"#64B5F6",logo:""};
    };
    const away=find(vsMatch[1]);
    const home=find(vsMatch[2]);
    // Determine which is home based on venue keywords
    const venL=ev.venue?.toLowerCase()||"";
    const homeIsFirst=venL.includes("baxter")||venL.includes("morrison")||t.includes("omaha")||t.includes("creighton")||t.includes("husker")||t.includes("nebraska");
    enriched.matchup={home:homeIsFirst?away:home,away:homeIsFirst?home:away};
  }

  // Detect sport type
  const venL=(ev.venue||"").toLowerCase();
  let sport="Sports";
  if(t.includes("basketball")||venL.includes("chi health center")||venL.includes("baxter arena"))sport="Basketball";
  else if(t.includes("baseball")||venL.includes("schwab")||venL.includes("werner"))sport="Baseball";
  else if(t.includes("volleyball")||venL.includes("devaney"))sport="Volleyball";
  else if(t.includes("football")||venL.includes("memorial stadium"))sport="Football";
  else if(t.includes("hockey")||venL.includes("ice"))sport="Hockey";
  else if(t.includes("soccer")||venL.includes("caniglia")||t.includes("union omaha"))sport="Soccer";
  else if(t.includes("wrestling"))sport="Wrestling";
  else if(t.includes("tennis"))sport="Tennis";
  else if(t.includes("golf"))sport="Golf";
  enriched.sportType=enriched.sportType||sport;

  // Add sport type to matchup for display
  if(enriched.matchup)enriched.matchup.sportType=enriched.sportType;

  // Auto-generate tags
  if(!enriched.tags||enriched.tags.length===0){
    const tags=[sport];

    // Detect college / pro
    if(t.includes("bluejay")||t.includes("creighton"))tags.push("Big East","Creighton");
    else if(t.includes("husker")||t.includes("nebraska"))tags.push("Big Ten","Nebraska");
    else if(t.includes("maverick")||t.includes("uno")||t.includes("omaha mav"))tags.push("Summit League","UNO");
    else if(t.includes("storm chaser"))tags.push("Minor League Baseball","Triple-A");
    else if(t.includes("union omaha"))tags.push("USL League One");

    tags.push("Live Sports");
    enriched.tags=tags;
  }

  // Auto-generate pricing tiers if none exist and there's a price
  if(!enriched.pricing&&enriched.price){
    const priceMatch=enriched.price.match(/\$(\d+)/);
    if(priceMatch){
      const base=parseInt(priceMatch[0].replace("$",""));
      enriched.pricing=[
        {tier:"Upper Level",price:`$${base}`,note:"General seating"},
        {tier:"Lower Level",price:`$${Math.round(base*1.8)}`,note:"Closer to the action"},
        {tier:"Premium Seats",price:`$${Math.round(base*3)}`,note:"Best views"},
      ];
    }
  }

  // Detect sport from venue for better desc
  if(enriched.desc&&enriched.desc.length<60){
    const venL=(ev.venue||"").toLowerCase();
    if(venL.includes("schwab"))enriched.venueType=enriched.venueType||"Ballpark";
    else if(venL.includes("chi health")||venL.includes("baxter")||venL.includes("devaney"))enriched.venueType=enriched.venueType||"Arena";
    else if(venL.includes("werner"))enriched.venueType=enriched.venueType||"Ballpark";
    else if(venL.includes("morrison"))enriched.venueType=enriched.venueType||"Stadium";
  }

  return enriched;
}

/* ═══ HELPERS ═══ */
function fmtDate(d){
  if(!d)return"";
  if(d.match(/^\d{4}-\d{2}-\d{2}/))return new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  return d;
}
function fmtShort(d){
  if(!d)return"";
  if(d.match(/^\d{4}-\d{2}-\d{2}/))return new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
  return d;
}
function daysUntil(d){
  if(!d||!d.match(/^\d{4}-\d{2}-\d{2}/))return null;
  const diff=Math.ceil((new Date(d+"T12:00:00")-new Date())/864e5);
  if(diff===0)return"Today";
  if(diff===1)return"Tomorrow";
  if(diff<0)return"Past Event";
  return`${diff} days away`;
}
function doShare(title){if(navigator.share)navigator.share({title,url:window.location.href}).catch(()=>{});else navigator.clipboard?.writeText(window.location.href);}
function mapsUrl(q){return`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;}

/* ═══ SUB-COMPONENTS ═══ */

function VideoEmbed({ytId,label,h}){
  const[on,setOn]=useState(false);
  const thumb=`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return(
    <div style={{position:"relative",borderRadius:16,overflow:"hidden",height:h,background:"#0a0a0a",border:`1px solid ${T.border}`}}>
      {!on?<>
        <img src={thumb} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.75}} loading="lazy"/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.55) 100%)"}}/>
        <button onClick={()=>setOn(true)} className="hbtn" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:64,height:64,borderRadius:99,border:"2px solid rgba(255,255,255,0.25)",background:"rgba(0,0,0,0.45)",backdropFilter:"blur(12px)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",paddingLeft:3}}>
          {I.play("#fff",24)}
        </button>
        <div style={{position:"absolute",bottom:14,left:16,display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:7,height:7,borderRadius:99,background:T.red}}/>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.7)",fontWeight:500}}>{label}</span>
        </div>
      </>:
      <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`} title="Video" style={{width:"100%",height:"100%",border:"none"}} allow="autoplay;encrypted-media" allowFullScreen/>}
    </div>
  );
}

function SpotifyEmbed({trackId,spotifyUrl}){
  const[expanded,setExpanded]=useState(false);
  return(
    <div style={{marginBottom:24}}>
      <p style={{fontSize:11,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 12px"}}>Listen on Spotify</p>
      <div style={{borderRadius:14,overflow:"hidden",border:`1px solid ${T.border}`,background:"rgba(0,0,0,0.3)"}}>
        <iframe src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`} width="100%" height={expanded?352:80} frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={{borderRadius:14,display:"block"}}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10}}>
        <button onClick={()=>setExpanded(!expanded)} className="hbtn" style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:99,background:"rgba(30,215,96,0.08)",border:"1px solid rgba(30,215,96,0.2)",color:"#1DB954",fontSize:11,fontWeight:600,letterSpacing:0.5,cursor:"pointer"}}>
          {I.spotify("#1DB954",14)} {expanded?"Compact View":"Full Player"}
        </button>
        {spotifyUrl&&<a href={spotifyUrl} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:99,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border}`,color:T.textSec,fontSize:11,fontWeight:600,letterSpacing:0.5,textDecoration:"none"}}>
          {I.ext(T.textSec,12)} Open in Spotify
        </a>}
      </div>
    </div>
  );
}

function MatchupCard({matchup}){
  const Team=({t})=>(
    <div style={{textAlign:"center",flex:1}}>
      <div style={{width:88,height:88,borderRadius:99,margin:"0 auto 12px",background:`linear-gradient(135deg,${t.color}33,${t.color}11)`,border:`3px solid ${t.color}55`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",boxShadow:`0 4px 20px ${t.color}22`}}>
        {t.logo?<img src={t.logo} alt={t.name} style={{width:62,height:62,objectFit:"contain"}} loading="lazy"/>
        :<span style={{fontSize:28,fontWeight:800,color:"#fff",letterSpacing:-1}}>{t.abbr}</span>}
      </div>
      <p style={{fontSize:16,fontWeight:700,color:T.textHi,margin:"0 0 2px"}}>{t.name}</p>
      {t.record&&<p style={{fontSize:12,color:T.textSec,margin:"0 0 6px"}}>{t.record}</p>}
      {t.rank&&<span style={{fontSize:10,fontWeight:700,color:CA.sports,background:"rgba(100,181,246,0.12)",padding:"3px 10px",borderRadius:99}}>{t.rank}</span>}
    </div>
  );
  const SPORT_ICONS={Basketball:"\u{1F3C0}",Baseball:"\u26BE",Volleyball:"\u{1F3D0}",Football:"\u{1F3C8}",Hockey:"\u{1F3D2}",Soccer:"\u26BD",Wrestling:"\u{1F93C}",Tennis:"\u{1F3BE}",Golf:"\u26F3",Sports:"\u{1F3DF}\uFE0F"};
  const sportIcon=SPORT_ICONS[matchup.sportType]||"\u{1F3DF}\uFE0F";
  return(
    <div style={{background:CG.sports,borderRadius:18,border:`1px solid ${T.border}`,padding:"24px 20px",marginBottom:16}}>
      {/* Sport type badge */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:16}}>
        <span style={{fontSize:16}}>{sportIcon}</span>
        <span style={{fontSize:11,fontWeight:700,color:CA.sports,letterSpacing:2.5,textTransform:"uppercase"}}>{matchup.sportType||"Sports"}</span>
      </div>
      <p style={{fontSize:10,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 20px",textAlign:"center"}}>Matchup Preview</p>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
        <Team t={matchup.home}/>
        <div style={{width:44,height:44,borderRadius:99,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`}}>
          <span style={{fontSize:14,fontWeight:300,color:T.textDim,letterSpacing:2}}>vs</span>
        </div>
        <Team t={matchup.away}/>
      </div>
    </div>
  );
}

function LineupCard({lineup,isM}){
  return(
    <div style={{background:CG.concerts,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"20px 16px":"22px 18px",marginBottom:16}}>
      <p style={{fontSize:10,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 14px"}}>Artist Lineup</p>
      {lineup.map((a,i)=>(
        <div key={a.name} className="ecard" style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:14,marginBottom:i<lineup.length-1?10:0,background:i===0?"rgba(94,196,182,0.06)":"rgba(255,255,255,0.03)",border:`1px solid ${i===0?"rgba(94,196,182,0.15)":T.border}`}}>
          {a.img&&<div style={{width:52,height:52,borderRadius:99,overflow:"hidden",flexShrink:0,border:`2px solid ${i===0?T.accent+"44":T.border}`,background:"rgba(255,255,255,0.04)"}}>
            <img src={a.img} alt={a.name} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/>
          </div>}
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:15,fontWeight:600,color:T.textHi,margin:0}}>{a.name}</p>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3}}>
              <span style={{fontSize:11,color:i===0?T.accent:T.textSec,fontWeight:500}}>{a.role}</span>
              {a.time&&<><span style={{color:T.textDim}}>·</span><span style={{fontSize:11,color:T.textDim}}>{a.time}</span></>}
            </div>
          </div>
          {i===0&&<span style={{fontSize:9,fontWeight:700,color:T.accent,background:T.accentSoft,padding:"3px 10px",borderRadius:99,letterSpacing:1,textTransform:"uppercase",flexShrink:0}}>Headliner</span>}
        </div>
      ))}
    </div>
  );
}

function PricingTable({pricing,accent}){
  const[sel,setSel]=useState(0);
  return(
    <div style={{marginBottom:16}}>
      <p style={{fontSize:10,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 12px"}}>Select Tickets</p>
      {pricing.map((p,i)=>(
        <button key={p.tier} onClick={()=>setSel(i)} className="ecard" style={{display:"flex",alignItems:"center",width:"100%",textAlign:"left",padding:"14px 16px",borderRadius:14,cursor:"pointer",marginBottom:8,background:sel===i?`${accent}11`:"rgba(255,255,255,0.02)",border:`1.5px solid ${sel===i?accent+"44":T.border}`,transition:"all 0.2s"}}>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:14,fontWeight:600,color:T.textHi,margin:0}}>{p.tier}</p>
            {p.note&&<p style={{fontSize:11,color:T.textSec,margin:"3px 0 0"}}>{p.note}</p>}
          </div>
          <p style={{fontSize:20,fontWeight:300,color:T.textHi,margin:0,flexShrink:0,marginLeft:12}}>{p.price}</p>
          <div style={{width:20,height:20,borderRadius:99,marginLeft:12,flexShrink:0,border:`2px solid ${sel===i?accent:T.textDim}`,background:sel===i?accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
            {sel===i&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.bg} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
        </button>
      ))}
    </div>
  );
}

function InfoRow({icon,label,value,accent}){
  return(
    <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
      <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:`${accent}12`,display:"flex",alignItems:"center",justifyContent:"center"}}>{icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontSize:10,color:T.textDim,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",margin:"0 0 3px"}}>{label}</p>
        <p style={{fontSize:14,color:T.textHi,fontWeight:500,margin:0}}>{value}</p>
      </div>
    </div>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function EventDetail({event:rawEv,isSaved,onToggleSave,onBack,isM,isT,isD}){
  const ev=autoEnrichSports(rawEv);
  // Auto-generate pricing tiers for any event with a price but no pricing array
  if(!ev.pricing&&ev.price){
    const m=ev.price.match(/\$(\d+(?:\.\d+)?)/);
    if(m){
      const base=Math.round(parseFloat(m[1]));
      if(ev.cat==="sports"){
        ev.pricing=[{tier:"Upper Level",price:`$${base}`,note:"General seating"},{tier:"Lower Level",price:`$${Math.round(base*1.8)}`,note:"Closer to the action"},{tier:"Premium",price:`$${Math.round(base*3)}`,note:"Best views"}];
      }else if(ev.cat==="concerts"){
        ev.pricing=[{tier:"General Admission",price:`$${base}`,note:"Standing/open seating"},{tier:"Reserved",price:`$${Math.round(base*1.5)}`,note:"Assigned seats"},{tier:"VIP",price:`$${Math.round(base*2.5)}`,note:"Premium experience"}];
      }else{
        ev.pricing=[{tier:"Standard",price:`$${base}`,note:"General admission"},{tier:"Premium",price:`$${Math.round(base*2)}`,note:"Best available"}];
      }
    }
  }
  const[scrollY,setScrollY]=useState(0);
  const[imgErr,setImgErr]=useState(false);

  const mx=isD?680:isT?580:600;
  const px=isD?32:isT?24:16;
  const ac=CA[ev.cat]||T.accent;
  const heroH=isD?480:isT?420:360;
  const hasImg=ev.image&&!imgErr;
  const heroGrad=CG[ev.cat]||CG._;
  const catLabel=CAT_LABEL[ev.cat]||"Event";
  const countdown=daysUntil(ev.date);

  useEffect(()=>{
    const h=()=>setScrollY(window.scrollY);
    window.addEventListener("scroll",h,{passive:true});
    return()=>window.removeEventListener("scroll",h);
  },[]);

  const hOp=Math.min(scrollY/(heroH*0.5),1);

  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:T.sans,color:T.text}}>

      {/* ── STICKY HEADER ── */}
      <div style={{
        position:"fixed",top:0,left:0,right:0,zIndex:150,
        background:`rgba(20,22,24,${0.97*hOp})`,
        backdropFilter:hOp>0.4?"blur(20px)":"none",
        borderBottom:hOp>0.5?`1px solid ${T.border}`:"1px solid transparent",
        padding:`10px ${px}px`,
        opacity:hOp>0.5?1:0,pointerEvents:hOp>0.5?"auto":"none",
        transition:"opacity 0.15s,transform 0.15s",
        transform:`translateY(${hOp>0.5?0:-8}px)`,
      }}>
        <div style={{maxWidth:mx,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
            <button onClick={onBack} className="hbtn" style={{width:34,height:34,borderRadius:99,background:"rgba(255,255,255,0.06)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
              {I.back(T.text,18)}
            </button>
            <div style={{width:6,height:6,borderRadius:99,background:ac,flexShrink:0}}/>
            <p style={{fontSize:13,fontWeight:600,color:T.textHi,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.title}</p>
          </div>
          {ev.url&&<a href={ev.url} target="_blank" rel="noopener noreferrer" className="cta" style={{padding:"6px 16px",borderRadius:99,background:ac,color:T.bg,fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",textDecoration:"none",flexShrink:0}}>Tickets</a>}
        </div>
      </div>

      {/* ── HERO ── */}
      <div style={{position:"relative",height:heroH,overflow:"hidden",background:heroGrad}}>
        {hasImg&&<img src={ev.image} alt={ev.title} onError={()=>setImgErr(true)} style={{width:"100%",height:"130%",objectFit:"cover",objectPosition:"center 30%",transform:`translateY(${scrollY*0.2}px)`,opacity:0.55,position:"absolute",top:0,left:0}} loading="eager"/>}
        <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,rgba(20,22,24,0.1) 0%,rgba(20,22,24,0.25) 40%,rgba(20,22,24,0.7) 75%,${T.bg} 100%)`}}/>
        <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${ac}08 0%,transparent 60%)`,mixBlendMode:"screen"}}/>

        {/* Category + countdown badges */}
        <div style={{position:"absolute",top:16,left:px,display:"flex",gap:8,zIndex:2}}>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",padding:"5px 14px",borderRadius:99,background:`${ac}22`,color:ac,border:`1px solid ${ac}33`,backdropFilter:"blur(12px)",display:"inline-flex",alignItems:"center",gap:5}}>
            <CatIcon cat={ev.cat} size={12} color={ac}/> {catLabel}
          </span>
          {countdown&&<span style={{fontSize:10,fontWeight:600,letterSpacing:1,textTransform:"uppercase",padding:"5px 14px",borderRadius:99,background:"rgba(20,22,24,0.6)",color:T.text,border:"1px solid rgba(255,255,255,0.12)",backdropFilter:"blur(12px)"}}>
            {countdown}
          </span>}
        </div>

        {/* Back button */}
        <button onClick={onBack} className="hbtn" style={{position:"absolute",top:16,left:px,width:42,height:42,borderRadius:99,background:"rgba(20,22,24,0.5)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:3,opacity:hOp>0.5?0:1,transition:"opacity 0.15s",pointerEvents:hOp>0.5?"none":"auto"}}>
          {I.back(T.text,20)}
        </button>

        {/* Save + Share */}
        <div style={{position:"absolute",top:16,right:px,display:"flex",gap:8,zIndex:2}}>
          <button onClick={onToggleSave} className="hbtn" style={{width:42,height:42,borderRadius:99,background:"rgba(20,22,24,0.5)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            {I.heart(isSaved?T.gold:"rgba(242,239,233,0.8)",18,isSaved)}
          </button>
          <button onClick={()=>doShare(ev.title)} className="hbtn" style={{width:42,height:42,borderRadius:99,background:"rgba(20,22,24,0.5)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            {I.share("rgba(242,239,233,0.8)",18)}
          </button>
        </div>

        {/* Title block */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:`0 ${px}px 28px`,maxWidth:mx,margin:"0 auto",animation:"cardIn 0.6s ease both"}}>
          {ev.subtitle&&<p style={{fontSize:11,fontWeight:600,color:ac,letterSpacing:2,textTransform:"uppercase",margin:"0 0 8px"}}>{ev.subtitle}</p>}
          <h1 style={{fontSize:isD?32:isT?28:26,fontWeight:700,color:T.textHi,margin:"0 0 14px",letterSpacing:-0.3,lineHeight:1.15,textShadow:"0 2px 24px rgba(0,0,0,0.6)"}}>{ev.title}</h1>
          <div style={{display:"flex",flexWrap:"wrap",gap:isM?10:14}}>
            <span style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"rgba(242,239,233,0.9)"}}>{I.cal("rgba(242,239,233,0.6)",13)} {fmtShort(ev.date)}</span>
            {ev.time&&<span style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"rgba(242,239,233,0.9)"}}>{I.clock("rgba(242,239,233,0.6)",13)} {ev.time}</span>}
            <span style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"rgba(242,239,233,0.9)"}}>{I.pin("rgba(242,239,233,0.6)",13)} {ev.venue}</span>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{maxWidth:mx,margin:"0 auto",padding:`0 ${px}px`,animation:"cardIn 0.5s ease 0.15s both"}}>

        {/* Quick info pills */}
        <div style={{display:"flex",gap:8,margin:"20px 0 24px",overflowX:"auto",paddingBottom:2}}>
          {[
            isDisplayablePrice(ev.price)&&{label:ev.price.startsWith("$")?`From ${ev.price}`:ev.price,bold:true,icon:I.ticket(ac,13)},
            ev.doors&&{label:`Doors ${ev.doors}`,icon:I.clock(T.textSec,13)},
            ev.capacity&&{label:ev.capacity+" cap",icon:I.users(T.textSec,13)},
            ev.broadcast&&{label:ev.broadcast,icon:I.tv(T.textSec,13)},
            ev.ageRestriction&&{label:ev.ageRestriction},
          ].filter(Boolean).map((q,i)=>(
            <div key={i} style={{flexShrink:0,padding:"7px 13px",borderRadius:99,background:q.bold?`${ac}10`:"rgba(255,255,255,0.03)",border:`1px solid ${q.bold?ac+"33":T.border}`,display:"flex",alignItems:"center",gap:6,fontSize:11,color:q.bold?ac:T.textSec,fontWeight:q.bold?600:500,whiteSpace:"nowrap"}}>
              {q.icon} {q.label}
            </div>
          ))}
        </div>

        {/* Context card — sports matchup or concert lineup */}
        {ev.matchup&&<MatchupCard matchup={ev.matchup}/>}
        {ev.lineup?.length>0&&<LineupCard lineup={ev.lineup} isM={isM}/>}

        {/* About */}
        {ev.desc&&<div style={{marginBottom:24}}>
          <p style={{fontSize:isM?11:12,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 12px"}}>About This Event</p>
          <p style={{fontSize:14,color:T.textBody,lineHeight:1.75,letterSpacing:0.3,margin:0}}>{ev.desc}</p>
          {ev.artistBio&&<p style={{fontSize:13,color:T.textSec,lineHeight:1.7,margin:"10px 0 0",fontStyle:"italic"}}>{ev.artistBio}</p>}
        </div>}

        {/* Subcategory / Genre badge */}
        {ev.subcategory&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
          <span style={{fontSize:10,fontWeight:700,color:ac,letterSpacing:1.5,textTransform:"uppercase",padding:"5px 14px",borderRadius:99,background:`${ac}12`,border:`1px solid ${ac}25`}}>{ev.subcategory}</span>
          {ev.ageRestriction&&ev.ageRestriction!=="All Ages"&&<span style={{fontSize:10,fontWeight:600,color:T.textSec,padding:"5px 12px",borderRadius:99,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`}}>{ev.ageRestriction}</span>}
        </div>}

        {/* YouTube Songs — enriched */}
        {(ev.song1||ev.song2||ev.song3)&&<div style={{marginBottom:24}}>
          <p style={{fontSize:isM?11:12,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 12px"}}>Listen</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[ev.song1,ev.song2,ev.song3].filter(Boolean).map((url,i)=>(
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="hbtn" style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:99,background:"rgba(255,0,0,0.06)",border:"1px solid rgba(255,0,0,0.15)",color:"#ff4444",fontSize:11,fontWeight:600,textDecoration:"none"}}>
                {I.play("#ff4444",12)} Song {i+1}
              </a>
            ))}
          </div>
        </div>}

        {/* Best Video — enriched */}
        {ev.bestVideo&&!ev.ytId&&<div style={{marginBottom:24}}>
          <a href={ev.bestVideo} target="_blank" rel="noopener noreferrer" className="hbtn" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:99,background:"rgba(255,0,0,0.08)",border:"1px solid rgba(255,0,0,0.18)",color:"#ff4444",fontSize:12,fontWeight:600,textDecoration:"none"}}>
            {I.play("#ff4444",14)} Watch on YouTube
          </a>
        </div>}

        {/* Spotify link — enriched */}
        {ev.spotifyUrl&&!ev.spotifyTrackId&&<div style={{marginBottom:24}}>
          <a href={ev.spotifyUrl} target="_blank" rel="noopener noreferrer" className="hbtn" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:99,background:"rgba(30,215,96,0.08)",border:"1px solid rgba(30,215,96,0.18)",color:"#1DB954",fontSize:12,fontWeight:600,textDecoration:"none"}}>
            {I.spotify("#1DB954",14)} Listen on Spotify
          </a>
        </div>}

        {/* Spotify embed */}
        {ev.spotifyTrackId&&<SpotifyEmbed trackId={ev.spotifyTrackId} spotifyUrl={ev.spotifyUrl}/>}

        {/* YouTube embed */}
        {ev.ytId&&<div style={{marginBottom:24}}>
          <p style={{fontSize:isM?11:12,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 12px"}}>{ev.cat==="concerts"?"Watch & Listen":"Highlights"}</p>
          <VideoEmbed ytId={ev.ytId} label={ev.cat==="concerts"?"Watch Live Performance":"Watch Highlights"} h={isM?200:isT?260:300}/>
        </div>}

        {/* Event details */}
        <div style={{marginBottom:24}}>
          <p style={{fontSize:isM?11:12,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 4px"}}>Event Details</p>
          <InfoRow icon={I.cal(ac,16)} label="Date" value={fmtDate(ev.date)} accent={ac}/>
          {ev.time&&<InfoRow icon={I.clock(ac,16)} label="Time" value={`${ev.time}${ev.doors?` · Doors at ${ev.doors}`:""}`} accent={ac}/>}
          <InfoRow icon={I.pin(ac,16)} label="Venue" value={`${ev.venue}${ev.venueType?` · ${ev.venueType}`:""}`} accent={ac}/>
          {(ev.address||ev.venueAddress)&&<InfoRow icon={I.pin(ac,14)} label="Address" value={ev.address||ev.venueAddress} accent={ac}/>}
          {(!ev.address&&!ev.venueAddress&&ev.area)&&<InfoRow icon={I.pin(ac,14)} label="Area" value={ev.area} accent={ac}/>}
          {ev.ageRestriction&&<InfoRow icon={I.users(ac,14)} label="Age" value={ev.ageRestriction} accent={ac}/>}
          {ev.broadcast&&<InfoRow icon={I.tv(ac,14)} label="Broadcast" value={ev.broadcast} accent={ac}/>}
        </div>

        {/* Tags */}
        {ev.tags?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:28}}>
          {ev.tags.map(t=><span key={t} style={{fontSize:10,padding:"5px 13px",borderRadius:99,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,color:T.textSec,fontWeight:500,letterSpacing:0.5}}>{t}</span>)}
        </div>}

        {/* Pricing table (if enriched) or simple price */}
        {ev.pricing?.length>0&&<PricingTable pricing={ev.pricing} accent={ac}/>}

        {/* Primary CTA */}
        {ev.url?<a href={ev.url} target="_blank" rel="noopener noreferrer" className="cta" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",padding:"16px 0",borderRadius:99,textDecoration:"none",background:`linear-gradient(135deg,${ac},${ac}dd)`,color:T.bg,fontSize:13,fontWeight:700,letterSpacing:2,textTransform:"uppercase",boxShadow:`0 4px 24px ${ac}33`,marginBottom:12}}>
          {I.ticket(T.bg,16)} Get Tickets
        </a>
        :<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",padding:"16px 0",borderRadius:99,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,color:T.textSec,fontSize:13,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>
          {I.ticket(T.textSec,16)} Tickets Coming Soon
        </div>}

        {/* Secondary CTAs */}
        <div style={{display:"flex",gap:8,marginBottom:32}}>
          <a href={mapsUrl(ev.address||ev.venueAddress||ev.venue)} target="_blank" rel="noopener noreferrer" className="hbtn" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"13px 0",borderRadius:99,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,color:T.text,fontSize:11,fontWeight:600,letterSpacing:1.2,textTransform:"uppercase",textDecoration:"none"}}>
            {I.pin(T.textSec,13)} Directions
          </a>
          {ev.date&&ev.date.match(/^\d{4}-\d{2}-\d{2}/)&&<a href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${ev.date.replace(/-/g,"")}/${ev.date.replace(/-/g,"")}&details=${encodeURIComponent((ev.venue||"")+" "+(ev.address||""))}&location=${encodeURIComponent(ev.address||ev.venue||"")}`} target="_blank" rel="noopener noreferrer" className="hbtn" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"13px 0",borderRadius:99,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,color:T.text,fontSize:11,fontWeight:600,letterSpacing:1.2,textTransform:"uppercase",textDecoration:"none"}}>
            {I.cal(T.textSec,13)} Calendar
          </a>}
          <button onClick={()=>doShare(ev.title)} className="hbtn" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"13px 0",borderRadius:99,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,color:T.text,fontSize:11,fontWeight:600,letterSpacing:1.2,textTransform:"uppercase",cursor:"pointer"}}>
            {I.share(T.textSec,13)} Share
          </button>
        </div>

        {/* Venue card */}
        <div className="ecard" style={{background:CG[ev.cat]||CG._,borderRadius:18,border:`1px solid ${T.border}`,padding:"20px 18px",marginBottom:32}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:8}}>
            <div style={{width:44,height:44,borderRadius:13,background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{I.pin(ac,20)}</div>
            <div style={{minWidth:0}}>
              <p style={{fontSize:15,fontWeight:600,color:T.textHi,margin:0}}>{ev.venue}</p>
              <p style={{fontSize:12,color:T.textSec,margin:"2px 0 0"}}>{[ev.venueType,ev.address||ev.venueAddress||ev.area].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
          <a href={mapsUrl(ev.address||ev.venueAddress||ev.venue)} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:10,fontSize:12,color:ac,fontWeight:500,textDecoration:"none"}}>
            Open in Google Maps {I.ext(ac,12)}
          </a>
        </div>

        {/* Footer */}
        <div style={{textAlign:"center",paddingBottom:32,borderTop:`1px solid ${T.border}`,paddingTop:20}}>
          <p style={{fontSize:10,color:T.textDim,letterSpacing:0.6,margin:"0 0 4px"}}>Prices subject to change · Some links may earn a small commission</p>
          <p style={{fontSize:9,color:"rgba(235,230,220,0.2)",letterSpacing:0.4,margin:0}}>© 2026 GO: Guide to Omaha</p>
        </div>
      </div>
    </div>
  );
}
