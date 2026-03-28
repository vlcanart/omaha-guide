"use client";
import { useState, useEffect, useMemo, useRef } from "react";
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

import { T, CG, CA } from "./lib/design-tokens";
import { STOPS, interp, STARS, SUN_TABLE, getNowTv, WX_ICONS } from "./lib/sky";
import { Skyline } from "./lib/skyline";
import { IC } from "./lib/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopNav } from "./components/TopNav";
import { mapsDir, u, slugify } from "./lib/helpers";
import { TRAILS, WALKS, SUNSETS } from "./data/trails";
import { DAYTIME, GALLERIES, GAL_FILTERS, GAL_HOODS } from "./data/galleries";
import { PARKS } from "./data/parks";
import { HOODS } from "./data/hoods";
import { SEED_EVENTS, ECATS, ESUBS, DATE_PRESETS, matchDate as _matchDate, matchSub } from "./data/events";
import { VENUES, VCATS } from "./data/venues";

/* Icon resolver — data files store icon keys as strings, IC holds the render functions */
const resolveIcon = (key) => typeof key === 'function' ? key : (typeof key === 'string' && IC[key]) ? IC[key] : null;

// Seed events only show if no ingested events exist (first-run fallback)
const EVENTS=(INGESTED_EVENTS&&INGESTED_EVENTS.length>0)?INGESTED_EVENTS:[...SEED_EVENTS];

/* ═══ DATE / CALENDAR HELPERS ═══ */
function getCalDates(n){const days=[];const now=new Date();for(let i=0;i<n;i++){const d=new Date(now);d.setDate(d.getDate()+i);const iso=d.toISOString().slice(0,10);const wd=d.toLocaleDateString("en-US",{weekday:"short"});const dn=d.getDate();const mn=d.toLocaleDateString("en-US",{month:"short"});days.push({iso,wd:i===0?"Today":i===1?"Tmrw":wd,dn,mn});}return days;}
const CAL_DATES=getCalDates(30);
function selectDateRange(clickedIso,current){const t=CAL_DATES[0].iso;if(clickedIso===t&&current.size<=1)return new Set([t]);const sorted=[...current].sort();if(sorted[sorted.length-1]===clickedIso&&current.size>1)return new Set([t]);const dates=new Set();for(const cd of CAL_DATES){dates.add(cd.iso);if(cd.iso===clickedIso)break;}return dates;}
function getWeekDates(){const dates=new Set();const now=new Date();for(let i=0;i<7;i++){const d=new Date(now);d.setDate(d.getDate()+i);dates.add(d.toISOString().slice(0,10));if(d.getDay()===0&&i>0)break;}return dates;}
function getWeekendDates(){const dates=new Set();const now=new Date();const dow=now.getDay();if(dow===0||dow===6){for(let i=0;i<7;i++){const d=new Date(now);d.setDate(d.getDate()+i);if(d.getDay()===6||d.getDay()===0)dates.add(d.toISOString().slice(0,10));else if(dates.size>0)break;}}else{const daysToSat=6-dow;for(let i=daysToSat;i<=daysToSat+1;i++){const d=new Date(now);d.setDate(d.getDate()+i);dates.add(d.toISOString().slice(0,10));}}return dates;}
function getMonthDates(){const dates=new Set();const now=new Date();for(let i=0;i<30;i++){const d=new Date(now);d.setDate(d.getDate()+i);dates.add(d.toISOString().slice(0,10));}return dates;}
function setsEqual(a,b){if(a.size!==b.size)return false;for(const v of a)if(!b.has(v))return false;return true;}
function matchDate(ev,dates){if(!dates||dates.size===0)return true;return dates.has(ev.date);}

/* ═══ APP ═══ */
export default function GOPrototype(){
  const router=useRouter();
  const[mounted,setMounted]=useState(false);
  const contentRef=useRef(null);
  const scrollTop=()=>{if(contentRef.current)contentRef.current.scrollTo(0,0);window.scrollTo(0,0);};
  useEffect(()=>{scrollTop();},[tab]);
  const[nowTv,setNowTv]=useState(50);
  const[tv,setTv]=useState(50);
  const[isLive,setIsLive]=useState(true);
  const[drag,setDrag]=useState(false);
  const[weather,setWeather]=useState({temp:null,cond:"clear",icon:""});
  const[timeLabel,setTimeLabel]=useState("");
  const[cities,setCities]=useState(new Set(["omaha"]));
  const[venCat,setVenCat]=useState("all");
  const[spotCat,setSpotCat]=useState("all");
  const[galFilter,setGalFilter]=useState("All");
  const[galHood,setGalHood]=useState("All");
  const[galExpanded,setGalExpanded]=useState(null);
  const[parkTab,setParkTab]=useState("overview");
  const[w,setW]=useState(375);
  const[tab,setTab]=useState("today");
  const[prevTab,setPrevTab]=useState("today");
  const[favs,setFavs]=useState([]);
  const[evCat,setEvCat]=useState("concerts");
  const[evSub,setEvSub]=useState("all");
  const[selectedDates,setSelectedDates]=useState(new Set([CAL_DATES[0].iso]));
  const[showSubs,setShowSubs]=useState(false);
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
  const eventSlugFn=(ev)=>[ev.title,ev.venue,ev.date].filter(Boolean).join(" ").toLowerCase().replace(/['']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const navigateToEvent=(id)=>{const ev=EVENTS.find(e=>e.id===id);if(ev){router.push("/events/"+eventSlugFn(ev)+"/");}else{setPrevTab(tab);setTab("event:"+id);window.scrollTo(0,0);}};
  const[evShow,setEvShow]=useState(30);
  useEffect(()=>{if(tab!=="events"){setEvCat("concerts");setEvSub("all");setSelectedDates(new Set([CAL_DATES[0].iso]));setShowSubs(false);setEvShow(30);}},[tab]);
  useEffect(()=>{setEvShow(30);},[evCat,evSub,selectedDates]);
  const filteredEvents=useMemo(()=>EVENTS.filter(e=>cityMatch(e)).filter(e=>e.cat===evCat).filter(e=>matchDate(e,selectedDates)).filter(e=>matchSub(e,evSub)).sort((a,b)=>{const da=a.date?.match(/^\d{4}/)?a.date:"0000",db=b.date?.match(/^\d{4}/)?b.date:"0000";return da.localeCompare(db);}),[evCat,evSub,selectedDates,cities]);
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
  const fullHero=tab==="today"||tab==="events";
  const isTrailPage=tab.startsWith("trail:")||tab.startsWith("event:")||tab.startsWith("trailDetail:")||tab.startsWith("venue:")||tab.startsWith("walk:");
  const heroH=isTrailPage?"0px":fullHero?(isD?"55vh":isM?"50vh":"52vh"):(isD?"120px":isM?"95px":"105px");
  const heroMin=isTrailPage?0:fullHero?(isD?400:320):(isD?120:95);
  const heroMax=isTrailPage?0:fullHero?560:135;

  const showExploreSub=tab==="explore"||tab==="venues"||tab==="museums"||tab.startsWith("hood:")||tab.startsWith("park:")||tab.startsWith("trail:")||tab.startsWith("trailDetail:")||tab.startsWith("walk:");
  const topNavH=isD?(showExploreSub?96:56):(isT?44:0);

  return (
    <div id="app-shell" style={{background:T.bg,color:T.text,fontFamily:T.sans}}>
      {!mounted?<div style={{height:"100vh",background:T.bg}}/>:<>
      <TopNav activeTab={tab} onTabChange={setTab} savedCount={favs.length} />
      <div id="app-content" ref={contentRef} style={{paddingTop:topNavH}}>

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
              <div key={t.id} onClick={(e)=>{if(e.target.closest("a"))return;setPrevTab(tab);setTab("trailDetail:"+t.id);scrollTop();}} className="ecard" style={{background:CG.trail,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",width:isD?300:isM?258:275,minWidth:isD?300:isM?258:275,flexShrink:0,scrollSnapAlign:"start",cursor:"pointer"}}>
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

          <Head text="Walking Tours" count={WALKS.length} color="#FFB74D"/>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory"}}>
            {WALKS.map(wk=>(
              <div key={wk.id} onClick={()=>{setPrevTab(tab);setTab("walk:"+wk.id);scrollTop();}} className="ecard" style={{background:CG.hood,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",width:isD?280:isM?240:260,minWidth:isD?280:isM?240:260,flexShrink:0,scrollSnapAlign:"start",cursor:"pointer"}}>
                <div style={{position:"relative",height:isD?100:80,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,183,77,.08)"}}>
                  {typeof wk.icon==="function"?wk.icon("#FFB74D",36):resolveIcon(wk.icon)?.("#FFB74D",36)||<span style={{fontSize:28}}>{wk.icon==="walk"?"🚶":wk.icon==="camera"?"📸":wk.icon==="food"?"🍽️":"🗺️"}</span>}
                  <div style={{position:"absolute",bottom:8,left:10,right:10,display:"flex",gap:5}}>
                    <span style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:"rgba(255,183,77,.18)",color:"#FFB74D",fontWeight:600}}>{wk.distance}</span>
                    <span style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:"rgba(255,255,255,.08)",color:T.textBody,fontWeight:500}}>{wk.time}</span>
                  </div>
                </div>
                <div style={{padding:"10px 12px 12px"}}>
                  <h3 style={{margin:0,fontSize:14,fontWeight:600,color:T.textHi}}>{wk.name}</h3>
                  <p style={{margin:"4px 0 0",fontSize:11,color:T.textBody,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{wk.desc}</p>
                  <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap",alignItems:"center"}}>
                    {wk.neighborhood&&<span style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:"rgba(94,196,182,.12)",color:"#5EC4B6",fontWeight:600}}>{wk.neighborhood.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</span>}
                    {wk.tags.map(tag=><span key={tag} style={{fontSize:8,padding:"2px 7px",borderRadius:99,background:"rgba(255,255,255,.04)",color:T.textSec,fontWeight:500}}>{tag}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Head text="Things To Do" count={DAYTIME.length} color={T.accent}/>
          {DAYTIME.map((a,i)=>(
            <div key={a.id} onClick={(e)=>{if(e.target.closest("a"))return;router.push({"d1":"/zoo/","d2":"/joslyn/","d3":"/luminarium/","d4":"/lauritzen/","d5":"/durham/"}[a.id]||"/galleries/"+a.id+"/");}} className="ecard" style={{background:CG._,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"14px":"16px 20px",marginBottom:8,animation:`cardIn .3s ${i*.04}s both`,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{width:42,height:42,borderRadius:13,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{a.icon}</div>
                <div style={{flex:1}}>
                  <h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>{a.name}</h3>
                  <p style={{margin:"2px 0 0",fontSize:11,fontWeight:600,letterSpacing:1.4,color:T.accent}}>{a.time} · {a.price}</p>
                  <p style={{margin:"6px 0 0",fontSize:12,color:T.textBody,lineHeight:1.5}}>{a.desc}</p>
                  <div style={{display:"flex",gap:6,marginTop:10}}>
                    <a href={mapsDir(a.lat,a.lng)} target="_blank" rel="noopener noreferrer" className="hbtn" style={{padding:"7px 14px",borderRadius:99,background:"rgba(255,255,255,.05)",border:`1px solid ${T.border}`,color:T.textBody,fontSize:10,fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:4}}>{IC.dir(T.textBody,11)} Directions</a>
                    <span onClick={(e)=>{e.stopPropagation();router.push({"d1":"/zoo/","d2":"/joslyn/","d3":"/luminarium/","d4":"/lauritzen/","d5":"/durham/"}[a.id]||"/galleries/"+a.id+"/");}} className="hbtn" style={{padding:"7px 14px",borderRadius:99,background:"rgba(94,196,182,.1)",border:"1px solid rgba(94,196,182,.2)",color:T.accent,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>Details →</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Museums & Galleries CTA */}
          <div onClick={()=>{setPrevTab("today");setTab("museums");}} className="ecard" style={{background:"linear-gradient(135deg,#271F30 0%,#30263A 60%,#292134 100%)",borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"14px":"16px 20px",marginBottom:8,cursor:"pointer",animation:"cardIn .3s .2s both"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:42,height:42,borderRadius:13,background:"rgba(179,157,219,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🖼️</div>
              <div style={{flex:1}}>
                <h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>Museums & Galleries</h3>
                <p style={{margin:"2px 0 0",fontSize:11,fontWeight:600,letterSpacing:1.4,color:"#B39DDB"}}>{GALLERIES.length} venues · Mostly Free</p>
                <p style={{margin:"6px 0 0",fontSize:12,color:T.textBody,lineHeight:1.5}}>Joslyn Art Museum, Bemis Center, Hot Shops & more. Explore Omaha's art scene.</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>

          {/* Kids & Family Highlights */}
          <Head text="Kids & Family" count={GALLERIES.filter(v=>v.type==="Kids").length} color="#FFB74D"/>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory"}}>
            {GALLERIES.filter(v=>v.type==="Kids").map(v=>(
              <Link key={v.id} href={v.id==="zoo"?"/zoo/":"/galleries/"+v.id+"/"} className="ecard" style={{background:CG._,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",width:isD?280:isM?240:260,minWidth:isD?280:isM?240:260,flexShrink:0,scrollSnapAlign:"start",cursor:"pointer",textDecoration:"none",color:"inherit"}}>
                <div style={{position:"relative",height:isD?130:110,overflow:"hidden"}}>
                  <img src={v.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.5}} onError={e=>{e.target.style.display="none"}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(20,22,24,.1) 0%,rgba(20,22,24,.9) 100%)"}}/>
                  <div style={{position:"absolute",top:10,left:10,display:"flex",gap:5}}>
                    {v.badge&&<span style={{fontSize:8,fontWeight:700,letterSpacing:1,textTransform:"uppercase",padding:"3px 8px",borderRadius:99,background:"rgba(212,173,101,.15)",color:T.gold,border:"1px solid rgba(212,173,101,.25)"}}>{v.badge}</span>}
                    {!v.admissionFree&&<span style={{fontSize:8,fontWeight:600,padding:"3px 8px",borderRadius:99,background:"rgba(255,183,77,.12)",color:"#FFB74D"}}>{v.admission.split(",")[0]}</span>}
                  </div>
                  <div style={{position:"absolute",bottom:10,left:12,right:12}}>
                    <h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>{v.name}</h3>
                  </div>
                </div>
                <div style={{padding:"10px 12px 12px"}}>
                  <p style={{margin:0,fontSize:12,color:T.textBody,lineHeight:1.45,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{v.blurb}</p>
                  <div style={{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}}>
                    <span style={{fontSize:9,padding:"3px 8px",borderRadius:99,background:"rgba(255,183,77,.08)",color:"#FFB74D",fontWeight:600}}>{v.neighborhood}</span>
                    {v.highlights?.slice(0,2).map((h,i)=><span key={i} style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:"rgba(255,255,255,.04)",color:T.textSec,fontWeight:500}}>{h.length>30?h.slice(0,28)+"…":h}</span>)}
                  </div>
                  <span style={{display:"inline-block",marginTop:8,fontSize:10,padding:"5px 12px",borderRadius:99,background:"rgba(255,183,77,.08)",border:"1px solid rgba(255,183,77,.15)",color:"#FFB74D",fontWeight:600}}>Details →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>}

        {false&&<div style={{marginTop:16}}>
          <Head text="Sunset Spots" count={SUNSETS.length} color="#FFB74D"/>
          <div style={{display:"grid",gridTemplateColumns:isD?"1fr 1fr":"1fr",gap:8}}>
            {SUNSETS.map((s,i)=>(
              <div key={s.id} className="ecard" style={{background:CG.sunset,borderRadius:18,border:`1px solid ${T.border}`,padding:"14px 16px",animation:`cardIn .3s ${i*.05}s both`}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:13,background:"rgba(255,183,77,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{resolveIcon(s.icon)?.("#FFB74D",20)}</div>
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
          {(()=>{const now=new Date();const todayISO=now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");const todayEvs=EVENTS.filter(e=>e.date===todayISO&&cityMatch(e));const upcomingEvs=EVENTS.filter(e=>e.date>=todayISO&&cityMatch(e)).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,15);const topEvs=todayEvs.length>0?todayEvs:upcomingEvs;return(<>
          <Head text={todayEvs.length>0?(mLabel+"'s Events"):"Upcoming Events"} count={topEvs.length} mt={4} color={T.accent}/>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory",marginBottom:10}}>
            {topEvs.slice(0,6).map(ev=>{const ac=CA[ev.cat]||T.accent,gr=CG[ev.cat]||CG._;return(
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
          {topEvs.slice(6).map((ev,i)=>{const ac=CA[ev.cat]||T.accent,gr=CG[ev.cat]||CG._;return(
            <div key={ev.id} onClick={()=>navigateToEvent(ev.id)} className="ecard" style={{background:gr,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"14px":"16px 20px",marginBottom:8,animation:`cardIn .3s ${i*.04}s both`,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                {(ev.contentImage||ev.image)?<div style={{width:48,height:48,borderRadius:12,overflow:"hidden",flexShrink:0,background:"rgba(255,255,255,.06)"}}><img loading="lazy" src={ev.contentImage||ev.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.parentElement.innerHTML=`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:20">${ev.emoji||"📅"}</div>`;}} /></div>:<div style={{width:48,height:48,borderRadius:12,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{ev.emoji}</div>}
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>{ev.title}</h3>{(()=>{const b=getBadge(ev);return b?<span style={{fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:99,background:b.bg,color:b.color,letterSpacing:.6,textTransform:"uppercase"}}>{b.text}</span>:null;})()}{ev.subcategory&&<span style={{fontSize:8,fontWeight:600,padding:"2px 7px",borderRadius:99,background:`${ac}15`,color:ac,letterSpacing:.5}}>{ev.subcategory}</span>}</div>
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
          </>);})()}
        </div>}

        {isDay&&<div style={{textAlign:"center",padding:"20px 0",marginTop:8}}><p style={{fontSize:11,color:T.textDim,letterSpacing:.8}}>Slide forward to preview tonight →</p></div>}
      </div>}

      {/* ═══ EVENTS TAB ═══ */}
      {tab==="events"&&<div style={sec}>
        {/* Calendar date scroller */}
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingTop:16,paddingBottom:8,WebkitOverflowScrolling:"touch"}}>
          {CAL_DATES.map(cd=>{const sel=selectedDates.has(cd.iso);return(
            <button key={cd.iso} onClick={()=>setSelectedDates(prev=>selectDateRange(cd.iso,prev))} className="daybtn" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:sel?T.accent:"rgba(255,255,255,.06)",border:`1px solid ${sel?T.accent:T.border}`,borderRadius:14,padding:"8px 10px",cursor:"pointer",flexShrink:0,minWidth:52,minHeight:62}}>
              <span style={{fontSize:9,fontWeight:600,color:sel?"#000":T.textSec,letterSpacing:.8,textTransform:"uppercase"}}>{cd.wd}</span>
              <span style={{fontSize:20,fontWeight:700,color:sel?"#000":T.text,lineHeight:1.1}}>{cd.dn}</span>
              <span style={{fontSize:8,fontWeight:600,color:sel?"#000":T.textDim,letterSpacing:.5,textTransform:"uppercase"}}>{cd.mn}</span>
            </button>);
          })}
        </div>
        {/* Quick date presets */}
        {(()=>{const wk=getWeekDates(),we=getWeekendDates(),mo=getMonthDates();return(
        <div style={{display:"flex",gap:8,paddingBottom:10,WebkitOverflowScrolling:"touch"}}>
          {[{label:"This Week",dates:wk},{label:"Weekend",dates:we},{label:"This Month",dates:mo}].map(p=>{const active=setsEqual(selectedDates,p.dates);return(
            <button key={p.label} onClick={()=>setSelectedDates(active?new Set([CAL_DATES[0].iso]):p.dates)} style={{background:active?`${T.accent}18`:"rgba(255,255,255,.06)",border:`1px solid ${active?T.accent+"40":T.border}`,borderRadius:99,padding:"7px 14px",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,minHeight:34}}>
              <span style={{fontSize:10,fontWeight:600,color:active?T.accent:T.textSec,letterSpacing:.6}}>{p.label}</span>
            </button>);})}
        </div>);})()}
        {/* Category pills */}
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,WebkitOverflowScrolling:"touch"}}>
          {ECATS.map(ec=>{const ac=CA[ec.id]||T.accent;return<button key={ec.id} onClick={()=>{setEvCat(ec.id);setEvSub("all");setShowSubs(true);}} style={{background:evCat===ec.id?`${ac}18`:"rgba(255,255,255,.06)",border:`1px solid ${evCat===ec.id?ac+"40":T.border}`,borderRadius:99,padding:"8px 16px",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,display:"flex",alignItems:"center",gap:5,minHeight:36}}><span style={{fontSize:14}}>{ec.emoji}</span><span style={{fontSize:11,fontWeight:600,color:evCat===ec.id?ac:T.textSec,letterSpacing:.8}}>{ec.label}</span></button>;})}
        </div>
        {/* Subcategory pills — hidden until category tapped */}
        {showSubs&&ESUBS[evCat]&&<div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:10,WebkitOverflowScrolling:"touch"}}>
          <button onClick={()=>setEvSub("all")} style={{background:evSub==="all"?`${CA[evCat]||T.accent}18`:"rgba(255,255,255,.06)",border:`1px solid ${evSub==="all"?(CA[evCat]||T.accent)+"40":T.border}`,borderRadius:99,padding:"7px 14px",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,minHeight:34}}><span style={{fontSize:10,fontWeight:600,color:evSub==="all"?CA[evCat]||T.accent:T.textSec,letterSpacing:.6}}>All</span></button>
          {ESUBS[evCat].map(s=><button key={s} onClick={()=>setEvSub(s)} style={{background:evSub===s?`${CA[evCat]||T.accent}18`:"rgba(255,255,255,.06)",border:`1px solid ${evSub===s?(CA[evCat]||T.accent)+"40":T.border}`,borderRadius:99,padding:"7px 14px",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,minHeight:34}}><span style={{fontSize:10,fontWeight:600,color:evSub===s?CA[evCat]||T.accent:T.textSec,letterSpacing:.6}}>{s}</span></button>)}
        </div>}
        {/* Events heading */}
        <Head text={ECATS.find(c=>c.id===evCat)?.label||"Events"} count={filteredEvents.length} mt={4} color={CA[evCat]||T.accent}/>
        {/* Event cards — paginated for performance */}
        {filteredEvents.length===0?<div style={{textAlign:"center",padding:"40px 20px"}}><p style={{fontSize:14,color:T.textSec,marginBottom:12}}>No events match your filters</p><button onClick={()=>{setEvSub("all");setSelectedDates(new Set([CAL_DATES[0].iso]));setShowSubs(false);}} className="hbtn" style={{background:`${T.accent}15`,border:`1px solid ${T.accent}33`,borderRadius:99,padding:"10px 24px",cursor:"pointer",color:T.accent,fontSize:13,fontWeight:600,minHeight:40}}>Clear Filters</button></div>:<>
        {filteredEvents.slice(0,evShow).map((ev,i)=>{const ac=CA[ev.cat]||T.accent,gr=CG[ev.cat]||CG._;return(
          <div key={ev.id} onClick={()=>navigateToEvent(ev.id)} className="ecard" style={{background:gr,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"14px":"16px 20px",marginBottom:8,animation:i<10?`cardIn .3s ${i*.04}s both`:"none",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              {(ev.contentImage||ev.image)?<div style={{width:52,height:52,borderRadius:14,overflow:"hidden",flexShrink:0,background:"rgba(255,255,255,.06)"}}><img loading="lazy" src={ev.contentImage||ev.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.parentElement.innerHTML=`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:22">${ev.emoji||"📅"}</div>`;}} /></div>:<div style={{width:52,height:52,borderRadius:14,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{ev.emoji}</div>}
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>{ev.title}</h3>{(()=>{const b=getBadge(ev);return b?<span style={{fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:99,background:b.bg,color:b.color,letterSpacing:.6,textTransform:"uppercase"}}>{b.text}</span>:null;})()}{ev.subcategory&&<span style={{fontSize:8,fontWeight:600,padding:"2px 7px",borderRadius:99,background:`${ac}15`,color:ac,letterSpacing:.5}}>{ev.subcategory}</span>}</div>
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
            <Link key={p.id} href={"/parks/"+p.id+"/"} className="ecard" style={{background:CG.park,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",width:isD?280:isM?240:260,minWidth:isD?280:isM?240:260,flexShrink:0,scrollSnapAlign:"start",cursor:"pointer",textDecoration:"none",color:"inherit"}}>
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
                  <span className="hbtn" style={{flex:1,padding:"7px 0",borderRadius:99,background:"rgba(255,255,255,.05)",border:`1px solid ${T.border}`,color:T.textBody,fontSize:10,fontWeight:600,textAlign:"center",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{IC.chev(T.textBody,11)} Details</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Trails ── */}
        <Head text="Trails & Rides" count={TRAILS.length} color="#81C784"/>
        <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory"}}>
          {TRAILS.map(t=>(
            <div key={t.id} onClick={(e)=>{if(e.target.closest("a"))return;setPrevTab(tab);setTab("trailDetail:"+t.id);scrollTop();}} className="ecard" style={{background:CG.trail,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",width:isD?300:isM?258:275,minWidth:isD?300:isM?258:275,flexShrink:0,scrollSnapAlign:"start",cursor:"pointer"}}>
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

        {/* ── Neighborhoods ── */}
        <Head text="Neighborhoods" count={HOODS.length} color="#CE93D8"/>
        <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory"}}>
          {HOODS.map(h=>(
            <Link key={h.id} href={"/neighborhoods/"+h.id+"/"} onClick={()=>setSpotCat("all")} className="ecard" style={{background:CG._,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",width:isD?220:isM?180:200,minWidth:isD?220:isM?180:200,flexShrink:0,scrollSnapAlign:"start",cursor:"pointer",textDecoration:"none",color:"inherit"}}>
              <div style={{position:"relative",height:isD?130:110,overflow:"hidden"}}>
                <img src={(h.imgs||[])[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.45}} onError={e=>{e.target.style.display="none"}}/>
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
            </Link>
          ))}
        </div>

        {/* ── Things To Do ── */}
        <Head text="Things To Do" count={DAYTIME.length} color={T.accent}/>
        {DAYTIME.map((a,i)=>(
          <div key={a.id} onClick={(e)=>{if(e.target.closest("a"))return;router.push({"d1":"/zoo/","d2":"/joslyn/","d3":"/luminarium/","d4":"/lauritzen/","d5":"/durham/"}[a.id]||"/galleries/"+a.id+"/");}} className="ecard" style={{background:CG._,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"14px":"16px 20px",marginBottom:8,cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <div style={{width:42,height:42,borderRadius:13,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{a.icon}</div>
              <div style={{flex:1}}>
                <h3 style={{margin:0,fontSize:15,fontWeight:600,color:T.textHi}}>{a.name}</h3>
                <p style={{margin:"2px 0 0",fontSize:11,fontWeight:600,letterSpacing:1.4,color:T.accent}}>{a.time} · {a.price}</p>
                <p style={{margin:"6px 0 0",fontSize:12,color:T.textBody,lineHeight:1.5}}>{a.desc}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:4}}><polyline points="9 18 15 12 9 6"/></svg>
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

        {/* ── Museums & Galleries (compact link) ── */}
        <div onClick={()=>{setPrevTab("explore");setTab("museums");}} className="ecard" style={{background:"linear-gradient(135deg,#271F30 0%,#30263A 60%,#292134 100%)",borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"16px":"20px 24px",marginTop:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:48,height:48,borderRadius:14,background:"rgba(179,157,219,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🖼️</div>
            <div>
              <h3 style={{margin:0,fontSize:16,fontWeight:700,color:T.textHi}}>Museums & Galleries</h3>
              <p style={{margin:"2px 0 0",fontSize:11,color:T.textSec,letterSpacing:.5}}>{GALLERIES.length} venues · Joslyn, Bemis, Hot Shops & more</p>
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
          <Link key={v.id} href={"/venues/"+v.id+"/"} className="ecard" style={{display:"block",textDecoration:"none",color:"inherit",background:CG._,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",marginBottom:8,animation:`cardIn .3s ${i*.03}s both`,cursor:"pointer"}}>
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
          </Link>
        ))}
        <div style={{height:90}}/>
      </div>}

      {/* ═══ MUSEUMS & GALLERIES (accessed from Explore / Today) ═══ */}
      {tab==="museums"&&<div style={sec}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:16,marginBottom:12}}>
          <button onClick={()=>setTab(prevTab==="museums"?"explore":prevTab)} className="hbtn" style={{background:"rgba(255,255,255,.06)",border:`1px solid ${T.border}`,borderRadius:99,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <h2 style={{margin:0,fontSize:16,fontWeight:700,color:T.textHi,letterSpacing:.5}}>Museums & Galleries</h2>
          <span style={{fontSize:11,color:T.textDim}}>{GALLERIES.filter(v=>(galFilter==="All"||v.type===galFilter)&&(galHood==="All"||v.neighborhood===galHood)).length}</span>
        </div>

        {/* Quick stats */}
        <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch"}}>
          {[{val:GALLERIES.filter(v=>v.admissionFree).length,label:"Free venues"},{val:GALLERIES.filter(v=>v.type==="Museum").length,label:"Museums"},{val:GALLERIES.filter(v=>v.type==="Gallery").length,label:"Galleries"},{val:GALLERIES.filter(v=>v.type==="Kids").length,label:"Kids & Family"}].map((s,i)=>(
            <div key={i} style={{flexShrink:0,padding:"10px 16px",borderRadius:14,textAlign:"center",background:CG._,border:`1px solid ${T.border}`,minWidth:80}}>
              <p style={{fontSize:20,fontWeight:700,color:"#B39DDB",margin:"0 0 2px"}}>{s.val}</p>
              <p style={{fontSize:9,color:T.textSec,fontWeight:600,letterSpacing:1,textTransform:"uppercase",margin:0}}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Type filter */}
        <div style={{display:"flex",gap:6,marginBottom:8,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          {GAL_FILTERS.map(f=>{const active=galFilter===f;return(
            <button key={f} onClick={()=>setGalFilter(f)} className="pill" style={{padding:"6px 14px",borderRadius:99,background:active?"rgba(179,157,219,.12)":"rgba(255,255,255,.04)",border:`1px solid ${active?"rgba(179,157,219,.35)":T.border}`,color:active?"#B39DDB":T.textSec,cursor:"pointer",fontSize:10,fontWeight:active?700:500,letterSpacing:1,textTransform:"uppercase",whiteSpace:"nowrap",flexShrink:0}}>
              {f==="All"?`All (${GALLERIES.length})`:`${f} (${GALLERIES.filter(v=>v.type===f).length})`}
            </button>);})}
        </div>

        {/* Neighborhood filter */}
        <div style={{display:"flex",gap:5,marginBottom:20,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch"}}>
          {GAL_HOODS.map(n=>{const active=galHood===n;return(
            <button key={n} onClick={()=>setGalHood(n)} className="pill" style={{padding:"5px 11px",borderRadius:99,background:active?"rgba(255,255,255,.06)":"transparent",border:`1px solid ${active?T.borderHi:"transparent"}`,color:active?T.textHi:T.textDim,cursor:"pointer",fontSize:10,fontWeight:active?600:400,whiteSpace:"nowrap",flexShrink:0}}>
              {n}
            </button>);})}
        </div>

        {/* Venue cards */}
        {(()=>{const galFiltered=GALLERIES.filter(v=>(galFilter==="All"||v.type===galFilter)&&(galHood==="All"||v.neighborhood===galHood));const today=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];const ac="#B39DDB";const artGrad="linear-gradient(135deg,#271F30 0%,#30263A 60%,#292134 100%)";return galFiltered.length===0?(
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <p style={{fontSize:14,color:T.textSec}}>No venues match those filters.</p>
            <button onClick={()=>{setGalFilter("All");setGalHood("All");}} className="hbtn" style={{marginTop:12,padding:"10px 20px",borderRadius:99,cursor:"pointer",background:"rgba(255,255,255,.04)",border:`1px solid ${T.border}`,color:T.text,fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>Reset Filters</button>
          </div>
        ):galFiltered.map(v=>{const open=galExpanded===v.id;const todayH=v.hours?.find(h=>h.day===today);const isOpen=todayH&&!todayH.closed;const isLateNight=todayH?.late;return(
          <div key={v.id} style={{marginBottom:12}}>
            {/* Card header */}
            <div onClick={()=>setGalExpanded(open?null:v.id)} style={{borderRadius:open?"18px 18px 0 0":18,background:artGrad,overflow:"hidden",border:`1px solid ${open?ac+"44":T.border}`,borderBottom:open?`1px solid ${T.border}`:undefined,cursor:"pointer"}}>
              <div style={{position:"relative",height:open?160:120,overflow:"hidden"}}>
                <img src={v.img} alt={v.name} style={{width:"100%",height:"100%",objectFit:"cover",opacity:.55}}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(39,31,48,.2) 0%,rgba(39,31,48,.85) 100%)"}}/>
                <div style={{position:"absolute",top:10,left:12,display:"flex",gap:6}}>
                  <span style={{fontSize:8,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",padding:"3px 9px",borderRadius:99,background:`${ac}25`,color:ac,border:`1px solid ${ac}40`}}>{v.type}</span>
                  {v.admissionFree&&<span style={{fontSize:8,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",padding:"3px 9px",borderRadius:99,background:"rgba(125,212,160,.15)",color:T.green,border:"1px solid rgba(125,212,160,.25)"}}>Free</span>}
                  {v.badge&&<span style={{fontSize:8,fontWeight:700,letterSpacing:1,textTransform:"uppercase",padding:"3px 9px",borderRadius:99,background:"rgba(212,173,101,.15)",color:T.gold,border:"1px solid rgba(212,173,101,.25)"}}>{v.badge}</span>}
                </div>
                <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 14px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{flex:1,minWidth:0}}>
                      <h3 style={{fontSize:16,fontWeight:700,color:T.textHi,margin:"0 0 4px",lineHeight:1.2}}>{v.name}</h3>
                      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                        <span style={{fontSize:11,color:T.venue}}>{v.neighborhood}</span>
                        {todayH&&<span style={{fontSize:9,fontWeight:600,color:isOpen?T.green:T.red}}>{isOpen?`Open today ${todayH.hours}`:"Closed today"}{isLateNight?" \u2022 Late night":""}</span>}
                      </div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform:open?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s",flexShrink:0}}><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded detail */}
            {open&&<div style={{background:artGrad,borderRadius:"0 0 18px 18px",border:`1px solid ${ac}44`,borderTop:"none",padding:"16px 16px 20px"}}>
              <p style={{fontSize:13,color:T.textBody,lineHeight:1.7,margin:"0 0 18px"}}>{v.blurb}</p>

              {/* Address + contact */}
              <div style={{padding:"14px",borderRadius:14,marginBottom:16,background:"rgba(255,255,255,.02)",border:`1px solid ${T.border}`}}>
                <p style={{fontSize:12,color:T.textHi,margin:"0 0 4px",fontWeight:600}}>{v.address}</p>
                {v.phone&&<p style={{fontSize:11,color:T.textSec,margin:"0 0 2px"}}>{v.phone}</p>}
                <p style={{fontSize:11,color:ac,margin:0}}>{v.admission}</p>
              </div>

              {/* Hours */}
              {v.hours&&<div style={{marginBottom:16}}>
                <p style={{fontSize:10,fontWeight:700,color:T.textSec,letterSpacing:2,textTransform:"uppercase",margin:"0 0 8px"}}>Hours</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {v.hours.map((h,i)=>{const isTd=h.day===today;return(
                    <div key={i} style={{padding:"6px 10px",borderRadius:10,flex:"0 0 auto",minWidth:isM?"calc(50% - 3px)":"auto",background:isTd?`${T.green}10`:"rgba(255,255,255,.02)",border:`1px solid ${isTd?T.green+"30":"rgba(255,255,255,.04)"}`}}>
                      <span style={{fontSize:10,fontWeight:700,color:isTd?T.green:T.textDim,marginRight:6}}>{h.day}</span>
                      <span style={{fontSize:11,color:h.closed?T.textDim:T.textBody}}>{h.hours}</span>
                      {h.late&&<span style={{fontSize:8,color:ac,marginLeft:4}}>{"\u2605"}</span>}
                    </div>);})}
                </div>
              </div>}

              {/* Exhibitions */}
              {v.exhibitions&&<div style={{marginBottom:16}}>
                <p style={{fontSize:10,fontWeight:700,color:T.textSec,letterSpacing:2,textTransform:"uppercase",margin:"0 0 8px"}}>Exhibitions</p>
                {v.exhibitions.map((exh,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderTop:i>0?"1px solid rgba(255,255,255,.04)":"none"}}>
                    <span style={{fontSize:7,fontWeight:700,letterSpacing:1,textTransform:"uppercase",padding:"2px 7px",borderRadius:99,flexShrink:0,background:exh.tag==="Now"?`${T.green}18`:`${ac}18`,color:exh.tag==="Now"?T.green:ac}}>{exh.tag}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:12,fontWeight:600,color:T.textHi,margin:0}}>{exh.title}</p>
                      <p style={{fontSize:10,color:T.textDim,margin:"2px 0 0"}}>{exh.dates}</p>
                    </div>
                  </div>))}
              </div>}

              {/* Highlights */}
              {v.highlights&&<div style={{marginBottom:16}}>
                <p style={{fontSize:10,fontWeight:700,color:T.textSec,letterSpacing:2,textTransform:"uppercase",margin:"0 0 8px"}}>Highlights</p>
                {v.highlights.map((h,i)=>(
                  <div key={i} style={{display:"flex",gap:8,padding:"5px 0"}}>
                    <span style={{width:5,height:5,borderRadius:99,background:ac,flexShrink:0,marginTop:6,opacity:.5}}/>
                    <p style={{fontSize:12,color:T.textBody,margin:0,lineHeight:1.5}}>{h}</p>
                  </div>))}
              </div>}

              {/* Programs */}
              {v.programs&&<div style={{marginBottom:16}}>
                <p style={{fontSize:10,fontWeight:700,color:T.textSec,letterSpacing:2,textTransform:"uppercase",margin:"0 0 8px"}}>Programs & Events</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {v.programs.map((p,i)=>(
                    <span key={i} style={{fontSize:10,padding:"5px 11px",borderRadius:99,background:`${ac}08`,border:`1px solid ${ac}22`,color:T.textBody,fontWeight:500}}>{p}</span>))}
                </div>
              </div>}

              {/* Notice */}
              {v.notice&&<div style={{padding:"10px 14px",borderRadius:12,marginBottom:16,background:"rgba(232,54,79,.06)",border:"1px solid rgba(232,54,79,.12)"}}>
                <p style={{fontSize:11,color:T.textBody,margin:0,lineHeight:1.5}}>
                  <span style={{color:T.red,fontWeight:700,fontSize:9,letterSpacing:1,textTransform:"uppercase"}}>Notice: </span>{v.notice}
                </p>
              </div>}

              {/* Action buttons */}
              {v.id==="zoo"&&<Link href="/zoo/" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",padding:"12px 0",borderRadius:99,textDecoration:"none",background:"linear-gradient(135deg,rgba(255,183,77,.15),rgba(255,183,77,.08))",border:"1px solid rgba(255,183,77,.3)",color:"#FFB74D",fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>View Full Zoo Page →</Link>}
              <div style={{display:"flex",gap:8}}>
                <a href={v.web} target="_blank" rel="noopener noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"12px 0",borderRadius:99,textDecoration:"none",background:`linear-gradient(135deg, ${T.accent}, ${T.accent}dd)`,color:T.bg,fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"}}>Visit Website</a>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.name+" "+v.address)}`} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"12px 20px",borderRadius:99,textDecoration:"none",background:"rgba(255,255,255,.04)",border:`1px solid ${T.border}`,color:T.text,fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>Map</a>
              </div>
            </div>}
          </div>);})})()}

        {/* First Friday callout */}
        <div style={{marginTop:28,padding:"20px 18px",borderRadius:18,background:CG._,border:`1px solid ${T.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <span style={{fontSize:28}}>{"\u{1F3A8}"}</span>
            <div>
              <p style={{fontSize:15,fontWeight:700,color:T.textHi,margin:0}}>First Friday Art Walk</p>
              <p style={{fontSize:11,color:"#B39DDB",margin:"3px 0 0",fontWeight:500}}>First Friday of Every Month</p>
            </div>
          </div>
          <p style={{fontSize:13,color:T.textBody,lineHeight:1.7,margin:"0 0 12px"}}>Omaha's monthly celebration of arts & culture. Galleries across the city open their doors with new exhibitions, live music, refreshments, and artist meet-and-greets. Benson, the Old Market, and Midtown are the main hubs. Most events run 6-9 PM.</p>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["Benson","Old Market","Midtown","North Omaha","Free"].map(t=>(
              <span key={t} style={{fontSize:9,padding:"4px 10px",borderRadius:99,background:"rgba(255,255,255,.04)",border:`1px solid ${T.border}`,color:T.textSec,fontWeight:500}}>{t}</span>))}
          </div>
        </div>

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
          onBack={()=>{setTab(prevTab);scrollTop();}}
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
              return <div key={i} onClick={()=>{if(hasMap){setTab("trail:"+parkId+":"+i);scrollTop();}}} className="ecard" style={{background:CG.park,borderRadius:18,border:`1px solid ${T.border}`,padding:isM?"18px 16px":"20px 18px",marginBottom:12,cursor:hasMap?"pointer":"default"}}>
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
        const trailDataMap={t1:"keystone-trail",t2:"bob-kerrey-bridge",t3:"fontenelle-forest",t4:"chalco-hills",t5:"zorinsky-lake"};
        const dataKey=trailDataMap[trailId];
        const tData=dataKey?TRAIL_MAP_DATA[dataKey]:null;
        if(!tData)return null;
        return <TrailMap parkId={dataKey} parkName={TRAILS.find(t=>t.id===trailId)?.name||"Trail"}
          parkColor={tData.trails[0]?.color||"#81C784"} initialTrailIndex={0}
          trailMapData={tData}
          onBack={()=>{setTab(prevTab||"today");scrollTop();}}/>;
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
            <button onClick={()=>{setTab(prevTab||"today");scrollTop();}} className="hbtn" style={{position:"absolute",top:16,left:16,background:"rgba(0,0,0,.5)",border:"none",borderRadius:99,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",backdropFilter:"blur(8px)"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
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

      {/* ═══ VENUE PAGE (from VENUES tab) ═══ */}
      {tab.startsWith("venuepage:")&&(()=>{
        const vid=parseInt(tab.split(":")[1]);
        const v=VENUES.find(x=>x.id===vid);
        if(!v)return null;
        const venueEvents=EVENTS.filter(e=>{const vl=(e.venue||"").toLowerCase(),nl=(v.name||"").toLowerCase();return vl.includes(nl.split(" ")[0])||nl.includes(vl.split(" ")[0]);}).sort((a,b)=>(a.date||"").localeCompare(b.date||"")).slice(0,20);
        return(<div style={{...sec,paddingTop:0}}>
          <div style={{position:"relative",height:isD?320:260,overflow:"hidden",borderRadius:"0 0 24px 24px",margin:"0 -16px"}}>
            {v.img?<img src={v.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none"}}/>:<div style={{width:"100%",height:"100%",background:CG._}}/>}
            <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(20,22,24,.2) 0%,rgba(20,22,24,.85) 100%)"}}/>
            <button onClick={()=>{setTab(prevTab||"venues");scrollTop();}} className="hbtn" style={{position:"absolute",top:16,left:16,background:"rgba(0,0,0,.5)",border:"none",borderRadius:99,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",backdropFilter:"blur(8px)"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
            <div style={{position:"absolute",bottom:20,left:20,right:20}}>
              <h1 style={{margin:0,fontSize:isD?28:24,fontWeight:300,color:T.textHi,letterSpacing:1}}>{v.name}</h1>
              <p style={{margin:"4px 0 0",fontSize:12,color:T.venue}}>{v.area} · {v.cap} capacity · {v.type}</p>
            </div>
          </div>
          <p style={{margin:"16px 0",fontSize:14,color:T.textBody,lineHeight:1.7}}>{v.desc}</p>
          {venueEvents.length>0&&<div style={{marginTop:20}}>
            <h3 style={{fontSize:12,fontWeight:600,color:T.textSec,letterSpacing:2,textTransform:"uppercase",margin:"0 0 12px"}}>Upcoming Events ({venueEvents.length})</h3>
            {venueEvents.map(ev=>{const ac=CA[ev.cat]||T.accent,gr=CG[ev.cat]||CG._;return(
              <div key={ev.id} onClick={()=>navigateToEvent(ev.id)} className="ecard" style={{background:gr,borderRadius:14,border:`1px solid ${T.border}`,padding:"12px 16px",marginBottom:8,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  {(ev.contentImage||ev.image)?<img loading="lazy" src={ev.contentImage||ev.image} alt="" style={{width:40,height:40,borderRadius:10,objectFit:"cover"}} onError={e=>{e.target.style.display="none"}}/>:<span style={{fontSize:18}}>{ev.emoji}</span>}
                  <div style={{flex:1}}>
                    <h4 style={{margin:0,fontSize:13,fontWeight:600,color:T.textHi}}>{ev.title}</h4>
                    <p style={{margin:"2px 0 0",fontSize:11,color:ac,fontWeight:500}}>{ev.date} · {ev.time}{ev.subcategory?` · ${ev.subcategory}`:""}</p>
                  </div>
                  <span style={{fontSize:13,fontWeight:300,color:T.textHi}}>{ev.price}</span>
                </div>
              </div>
            );})}
          </div>}
          <div style={{display:"flex",gap:8,marginTop:20}}>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.name+" Omaha NE")}`} target="_blank" rel="noopener noreferrer" className="hbtn" style={{flex:1,padding:"14px 0",borderRadius:99,background:"rgba(255,255,255,.06)",border:`1px solid ${T.border}`,color:T.textBody,fontSize:13,fontWeight:600,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,minHeight:48}}>{IC.dir(T.textBody,14)} Directions</a>
            {v.url&&<a href={v.url} target="_blank" rel="noopener noreferrer" className="hbtn" style={{flex:1,padding:"14px 0",borderRadius:99,background:`${T.accent}15`,border:`1px solid ${T.accent}30`,color:T.accent,fontSize:13,fontWeight:600,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,minHeight:48}}>{IC.link(T.accent,13)} Website</a>}
          </div>
          <div style={{height:120}}/>
        </div>);
      })()}

      {/* ═══ WALK DETAIL PAGE ═══ */}
      {tab.startsWith("walk:")&&(()=>{
        const walkId=tab.split(":")[1];
        const walk=WALKS.find(w=>w.id===walkId);
        if(!walk)return null;
        const wAc="#FFB74D";const wSoft="rgba(255,183,77,.12)";const wBdr="rgba(255,183,77,.25)";
        const mapQ=encodeURIComponent(walk.startPoint||walk.name+", Omaha NE");
        return(<div style={{...sec,paddingTop:0}}>
          <div style={{position:"relative",height:isD?320:isM?260:280,overflow:"hidden",borderRadius:"0 0 24px 24px",margin:`0 -${px}px`}}>
            {walk.img?<img loading="lazy" src={walk.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.45}}/>:<div style={{width:"100%",height:"100%",background:CG.hood}}/>}
            <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(20,22,24,.15) 0%,rgba(20,22,24,.95) 100%)"}}/>
            <button onClick={()=>{setTab(prevTab||"today");scrollTop();}} className="hbtn" style={{position:"absolute",top:16,left:16,background:"rgba(0,0,0,.5)",border:"none",borderRadius:99,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",backdropFilter:"blur(8px)"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:`0 ${px}px 20px`}}>
              <div style={{display:"flex",gap:6,marginBottom:8}}><span style={{fontSize:8,fontWeight:700,letterSpacing:1,textTransform:"uppercase",padding:"4px 10px",borderRadius:99,background:wSoft,color:wAc,border:`1px solid ${wBdr}`}}>Walking Tour</span>{walk.neighborhood&&<span style={{fontSize:8,fontWeight:700,letterSpacing:1,textTransform:"uppercase",padding:"4px 10px",borderRadius:99,background:"rgba(255,255,255,.06)",color:T.textSec}}>{walk.neighborhood.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</span>}</div>
              <h1 style={{margin:0,fontSize:isD?30:isM?24:27,fontWeight:700,color:T.textHi,lineHeight:1.15}}>{walk.name}</h1>
              <p style={{margin:"6px 0 0",fontSize:11,color:T.textSec}}>{walk.distance} · {walk.time} · {walk.stops?walk.stops.length:0} stops</p>
            </div>
          </div>
          <div style={{display:"flex",gap:8,margin:"16px 0",overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch"}}>
            {[{val:walk.distance,unit:"Distance",icon:"📏"},{val:walk.time,unit:"Time",icon:"⏱️"},{val:walk.difficulty||"Easy",unit:"Difficulty",icon:"🦶"},{val:String(walk.stops?walk.stops.length:0),unit:"Stops",icon:"📍"}].map((s,i)=>(<div key={i} style={{flexShrink:0,padding:"12px 16px",borderRadius:14,textAlign:"center",background:"rgba(255,255,255,.03)",border:`1px solid ${T.border}`,minWidth:80}}><span style={{fontSize:14}}>{s.icon}</span><p style={{fontSize:16,fontWeight:700,color:wAc,margin:"2px 0 0"}}>{s.val}</p><p style={{fontSize:9,color:T.textSec,fontWeight:600,letterSpacing:1,textTransform:"uppercase",margin:0}}>{s.unit}</p></div>))}
          </div>
          <p style={{fontSize:14,color:T.textBody,lineHeight:1.7,margin:"0 0 8px"}}>{walk.longDesc||walk.desc}</p>
          {walk.startPoint&&<p style={{fontSize:11,color:wAc,fontWeight:600,margin:"0 0 16px",letterSpacing:.3}}>{"🚶 Start: "+walk.startPoint}</p>}
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:20}}>{walk.tags.map(tag=><span key={tag} style={{fontSize:10,padding:"4px 12px",borderRadius:99,background:"rgba(255,255,255,.05)",color:T.textSec,fontWeight:500}}>{tag}</span>)}</div>
          <div style={{marginBottom:24}}>
            <h2 style={{fontSize:12,fontWeight:600,color:wAc,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 12px"}}>Route Map</h2>
            <div style={{borderRadius:16,overflow:"hidden",border:`1px solid ${T.border}`,height:isD?280:200}}>
              <iframe title="Walk Map" width="100%" height="100%" style={{border:"none",filter:"invert(90%) hue-rotate(180deg)"}} loading="lazy" src={"https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q="+mapQ+"&zoom=15&maptype=roadmap"}/>
            </div>
          </div>
          {walk.stops&&walk.stops.length>0&&<div style={{marginBottom:24}}>
            <h2 style={{fontSize:12,fontWeight:600,color:wAc,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 12px"}}>Stops Along the Way <span style={{color:T.textDim,fontSize:11,letterSpacing:1}}>({walk.stops.length})</span></h2>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {walk.stops.map((stop,i)=>(
                <div key={i} style={{display:"flex",gap:14,padding:"16px",borderRadius:16,background:"rgba(255,255,255,.02)",border:`1px solid ${T.border}`}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flexShrink:0}}>
                    <div style={{width:36,height:36,borderRadius:99,background:wSoft,border:`1px solid ${wBdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:wAc}}>{i+1}</div>
                    {stop.img&&<div style={{width:56,height:56,borderRadius:12,overflow:"hidden",border:`1px solid ${T.border}`}}><img loading="lazy" src={stop.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.75}}/></div>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                      <span style={{fontSize:16}}>{stop.icon}</span>
                      <h3 style={{margin:0,fontSize:14,fontWeight:600,color:T.textHi}}>{stop.name}</h3>
                    </div>
                    <p style={{margin:"0 0 8px",fontSize:12,color:T.textBody,lineHeight:1.5}}>{stop.desc}</p>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${stop.lat},${stop.lng}`} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:wAc,fontWeight:600,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:4}}>{IC.pin(wAc,12)} Open in Maps</a>
                  </div>
                </div>
              ))}
            </div>
          </div>}
          {walk.highlights&&<div style={{marginBottom:24}}>
            <h2 style={{fontSize:12,fontWeight:600,color:wAc,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 12px"}}>Highlights</h2>
            <div style={{borderRadius:16,background:"rgba(255,255,255,.02)",border:`1px solid ${T.border}`,padding:"14px 16px"}}>
              {walk.highlights.map((h,i)=>(<div key={i} style={{display:"flex",gap:8,padding:"6px 0"}}><span style={{width:4,height:4,borderRadius:99,background:wAc,flexShrink:0,marginTop:7,opacity:.6}}/><p style={{margin:0,fontSize:12,color:T.textBody,lineHeight:1.5}}>{h}</p></div>))}
            </div>
          </div>}
          {walk.tips&&<div style={{marginBottom:24}}>
            <h2 style={{fontSize:12,fontWeight:600,color:wAc,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 12px"}}>Tips</h2>
            <div style={{display:"grid",gridTemplateColumns:isD?"1fr 1fr":"1fr",gap:8}}>
              {walk.tips.map((tip,i)=>(<div key={i} style={{background:"rgba(255,255,255,.02)",borderRadius:16,border:`1px solid ${T.border}`,padding:"14px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <span style={{fontSize:20,flexShrink:0}}>{tip.icon}</span>
                  <div><h4 style={{margin:0,fontSize:13,fontWeight:600,color:T.textHi}}>{tip.title}</h4><p style={{margin:"4px 0 0",fontSize:12,color:T.textBody,lineHeight:1.5}}>{tip.text}</p></div>
                </div>
              </div>))}
            </div>
          </div>}
          <div style={{display:"flex",gap:8,marginBottom:28}}>
            <a href={mapsDir(walk.lat,walk.lng)} target="_blank" rel="noopener noreferrer" className="cta" style={{flex:1,padding:"14px 0",borderRadius:99,background:`linear-gradient(135deg,${wAc},${wAc}dd)`,color:T.bg,fontSize:12,fontWeight:700,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8,letterSpacing:1.5,textTransform:"uppercase"}}>{IC.dir(T.bg,14)} Start Walk</a>
            <button onClick={()=>{if(navigator.share)navigator.share({title:walk.name,url:window.location.href}).catch(()=>{});else navigator.clipboard?.writeText(window.location.href);}} className="hbtn" style={{padding:"14px 20px",borderRadius:99,background:"rgba(255,255,255,.04)",border:`1px solid ${T.border}`,color:T.text,fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>{IC.share(T.textSec,13)} Share</button>
          </div>
          <div style={{height:80}}/>
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
          onBack={()=>{setParkTab("trails");setTab("park:"+tParkId);scrollTop();}}/>;
      })()}

      </div>{/* end #app-content */}

      {/* ═══ BOTTOM SLIDER + NAV ═══ */}
      {!isD&&<div id="app-nav" style={{display:"flex",flexDirection:"column",background:"#000"}}>
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
        <div style={{background:"rgba(38,40,46,.98)",backdropFilter:"blur(22px)",borderTop:`1px solid rgba(255,255,255,.12)`,display:"flex",justifyContent:"space-around",padding:"6px 4px 8px",paddingBottom:"max(8px, env(safe-area-inset-bottom, 8px))",width:"100%"}}>
          {tabsD.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:(tab===t.id||(t.id==="explore"&&(tab==="venues"||tab.startsWith("hood:")||tab.startsWith("park:")||tab.startsWith("trail:")||tab.startsWith("trailDetail:")||tab.startsWith("venue:")||tab.startsWith("walk:")))||(tab.startsWith("event:")&&prevTab===t.id))?"rgba(94,196,182,.1)":"transparent",border:"none",cursor:"pointer",padding:isD?"10px 24px":"10px 16px",borderRadius:11,minWidth:isD?80:isT?68:60,minHeight:48,color:(tab===t.id||(t.id==="explore"&&(tab==="venues"||tab.startsWith("hood:")||tab.startsWith("park:")||tab.startsWith("trail:")||tab.startsWith("trailDetail:")||tab.startsWith("venue:")||tab.startsWith("walk:")))||(tab.startsWith("event:")&&prevTab===t.id))?T.accent:"rgba(242,239,233,.55)",transition:"all .2s"}}>
              <span style={{position:"relative"}}>{t.icon((tab===t.id||(t.id==="explore"&&(tab==="venues"||tab.startsWith("hood:")||tab.startsWith("park:")||tab.startsWith("trail:")||tab.startsWith("trailDetail:")||tab.startsWith("venue:")||tab.startsWith("walk:")))||(tab.startsWith("event:")&&prevTab===t.id))?T.accent:"rgba(242,239,233,.55)",isD?24:22)}{t.id==="saved"&&favs.length>0&&<span style={{position:"absolute",top:-4,right:-8,background:T.accent,color:T.bg,fontSize:8,fontWeight:700,borderRadius:99,padding:"1px 4px",minWidth:12,textAlign:"center"}}>{favs.length}</span>}</span>
              <span style={{fontSize:isD?11:10,fontWeight:(tab===t.id||(t.id==="explore"&&(tab==="venues"||tab.startsWith("hood:")||tab.startsWith("park:")||tab.startsWith("trail:")||tab.startsWith("trailDetail:")||tab.startsWith("venue:")||tab.startsWith("walk:")))||(tab.startsWith("event:")&&prevTab===t.id))?600:500,letterSpacing:.8,textTransform:"uppercase"}}>{t.label}</span>
            </button>
          ))}
        </div>
        <div style={{background:"#000",width:"100%",minHeight:"max(env(safe-area-inset-bottom, 0px), 8px)"}}/>
      </div>}

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
