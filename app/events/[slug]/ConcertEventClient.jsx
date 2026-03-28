"use client";
// Install: app/events/[slug]/ConcertEventClient.jsx
import { useState, useEffect } from "react";
import { DetailPageScroll } from "../../components/DetailPageScroll";
import { BottomNav } from "../../components/BottomNav";

var T = {
  bg:"#141618",surface:"#1B1D21",card:"#1F2227",
  border:"rgba(255,255,255,0.08)",borderHi:"rgba(255,255,255,0.18)",
  text:"#F2EFE9",textHi:"#FFFFFF",textBody:"rgba(242,239,233,0.82)",
  textSec:"rgba(242,239,233,0.58)",textDim:"rgba(242,239,233,0.32)",
  accent:"#5EC4B6",accentSoft:"rgba(94,196,182,0.10)",accentGlow:"rgba(94,196,182,0.30)",
  gold:"#D4AD65",green:"#7DD4A0",red:"#E8364F",
  sans:"'Inter',system-ui,-apple-system,sans-serif",
};
var CA={concerts:"#5EC4B6",sports:"#64B5F6",festivals:"#CE93D8",family:"#81C784",arts:"#B39DDB",comedy:"#FFB74D"};
var PROVS={
  ticketmaster:{name:"Ticketmaster",short:"TM",c:"#009CDE",bg:"rgba(0,156,222,0.10)",bdr:"rgba(0,156,222,0.25)"},
  stubhub:{name:"StubHub",short:"SH",c:"#A78BFA",bg:"rgba(100,70,180,0.10)",bdr:"rgba(100,70,180,0.25)"},
  seatgeek:{name:"SeatGeek",short:"SG",c:"#FF5B49",bg:"rgba(255,91,73,0.10)",bdr:"rgba(255,91,73,0.25)"},
  venuedirect:{name:"Box Office",short:"BO",c:"#5EC4B6",bg:"rgba(94,196,182,0.10)",bdr:"rgba(94,196,182,0.25)"},
};

var IMG_MAP=[
  [["gothic","ethel cain"],"photo-1518834107812-67b0b7c58434"],
  [["rock","guitar","symphony","tribute","classic"],"photo-1470229722913-7c0e2dbbafd3"],
  [["acoustic","311","hexum","folk","jurado"],"photo-1510915361894-db8b60106cb1"],
  [["comedy","notaro","nate jackson"],"photo-1585699324551-f6c309eedeca"],
  [["country","fisher","farr","thorogood"],"photo-1506157786151-b8491531f063"],
  [["metal","lorna","nihil"],"photo-1508854710579-5cecc3a9ff17"],
  [["edm","electronic","wooli","inzo"],"photo-1574391884720-bbc3740c59d1"],
  [["punk","hawthorne","yellowcard","emo"],"photo-1524368535928-5b5e00ddc76b"],
  [["indie","heat wave","hot flash"],"photo-1459749411175-04bf5292ceea"],
  [["jazz","noma"],"photo-1415201364774-f6f0bb35f28f"],
  [["orchestra","playstation"],"photo-1465847899084-d164df4dedc6"],
  [["pop","rap","vine"],"photo-1493225457124-a3eb161ffa5f"],
  [["basketball","creighton","bluejay","depaul"],"photo-1546519638-68e109498ffc"],
  [["football","husker","spring game"],"photo-1508098682722-e99c43a406b2"],
  [["baseball","storm chaser"],"photo-1529768167801-9173d94c2a42"],
  [["soccer","union omaha"],"photo-1553778263-73a83bab9b0c"],
  [["hockey","maverick","lancer"],"photo-1580692475446-c2fabbbbf835"],
  [["volleyball","lovb"],"photo-1612872087720-bb876e2e67d1"],
];

function uImg(id){return "https://images.unsplash.com/"+id+"?w=480&q=70&auto=format";}
function pickImg(ev){var ti=(ev.title||"").toLowerCase();var tags=(ev.tags||[]).map(function(t){return t.toLowerCase();});for(var k=0;k<IMG_MAP.length;k++){var keys=IMG_MAP[k][0];var img=IMG_MAP[k][1];for(var j=0;j<keys.length;j++){if(ti.indexOf(keys[j])!==-1||tags.indexOf(keys[j])!==-1)return uImg(img);}}return uImg("photo-1501386761578-eac5c94b800a");}
function fmtDate(d){if(!d)return"";return new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});}
function fmtShort(d){if(!d)return"";return new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});}
function daysUntil(d){if(!d)return null;var n=new Date();n.setHours(0,0,0,0);var e=new Date(d+"T12:00:00");e.setHours(0,0,0,0);return Math.ceil((e-n)/86400000);}
function lowestPrice(tix){if(!tix||!tix.length)return null;return Math.min.apply(null,tix.map(function(s){return s.total;}));}
function calUrl(ev){var s=ev.date?ev.date.replace(/-/g,""):"20260101";return "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent(ev.title+" at "+ev.venue)+"&dates="+s+"T200000/"+s+"T230000&location="+encodeURIComponent((ev.venueAddr||ev.venue)+", Omaha NE")+"&details="+encodeURIComponent(ev.desc||"");}

function YTMusicIcon(props){var s=props.size||22;return(<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11.5" fill="#FF0000"/><circle cx="12" cy="12" r="7.5" fill="none" stroke="#fff" strokeWidth="1.2"/><polygon points="10.5,8 16.5,12 10.5,16" fill="#fff"/></svg>);}

var SPORT_ICONS={Basketball:"\uD83C\uDFC0",Baseball:"\u26BE",Volleyball:"\uD83C\uDFD0",Football:"\uD83C\uDFC8",Hockey:"\uD83C\uDFD2",Soccer:"\u26BD",Wrestling:"\uD83E\uDD3C",Tennis:"\uD83C\uDFBE",Golf:"\u26F3",Sports:"\uD83C\uDFDF\uFE0F"};

function MatchupCard(props){
  var m=props.matchup;if(!m||!m.home||!m.away)return null;
  var sportIcon=SPORT_ICONS[m.sportType]||"\uD83C\uDFDF\uFE0F";
  function Team(p){var t=p.t;return(
    <div style={{textAlign:"center",flex:1}}>
      <div style={{width:88,height:88,borderRadius:99,margin:"0 auto 12px",background:"linear-gradient(135deg,"+t.color+"33,"+t.color+"11)",border:"3px solid "+t.color+"55",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",boxShadow:"0 4px 20px "+t.color+"22"}}>
        {t.logo?<img loading="lazy" src={t.logo} alt={t.name} style={{width:62,height:62,objectFit:"contain"}}/>
        :<span style={{fontSize:28,fontWeight:800,color:"#fff",letterSpacing:-1}}>{t.abbr}</span>}
      </div>
      <p style={{fontSize:16,fontWeight:700,color:T.textHi,margin:"0 0 2px"}}>{t.name}</p>
      {t.record&&<p style={{fontSize:12,color:T.textSec,margin:"0 0 6px"}}>{t.record}</p>}
      {t.rank&&<span style={{fontSize:10,fontWeight:700,color:CA.sports,background:"rgba(100,181,246,0.12)",padding:"3px 10px",borderRadius:99}}>{t.rank}</span>}
    </div>
  );}
  return(
    <div style={{background:"linear-gradient(135deg,#1A2430 0%,#21303E 60%,#1C2836 100%)",borderRadius:18,border:"1px solid "+T.border,padding:"24px 20px",marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:16}}>
        <span style={{fontSize:16}}>{sportIcon}</span>
        <span style={{fontSize:11,fontWeight:700,color:CA.sports,letterSpacing:2.5,textTransform:"uppercase"}}>{m.sportType||"Sports"}</span>
      </div>
      <p style={{fontSize:10,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 20px",textAlign:"center"}}>Matchup Preview</p>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
        <Team t={m.home}/>
        <div style={{width:44,height:44,borderRadius:99,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.04)",border:"1px solid "+T.border}}>
          <span style={{fontSize:14,fontWeight:300,color:T.textDim,letterSpacing:2}}>vs</span>
        </div>
        <Team t={m.away}/>
      </div>
    </div>
  );
}

function ArtistLineup(props){
  var lineup=props.lineup;if(!lineup||!lineup.length)return null;
  return(<div style={{marginBottom:24}}>
    <p style={{fontSize:12,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 14px"}}>Artist Lineup</p>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {lineup.map(function(a,i){return(
        <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:16,background:"rgba(255,255,255,0.02)",border:"1px solid "+T.border}}>
          <div style={{width:56,height:56,borderRadius:14,overflow:"hidden",flexShrink:0,border:"2px solid rgba(94,196,182,0.2)"}}><img loading="lazy" src={a.img} alt={a.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
          <div style={{flex:1,minWidth:0}}><p style={{fontSize:15,fontWeight:700,color:T.textHi,margin:0}}>{a.name}</p><p style={{fontSize:11,color:T.accent,margin:"3px 0 0",fontWeight:500}}>{a.role}{a.setTime?" \u00B7 "+a.setTime:""}</p></div>
          {i===0&&<span style={{fontSize:9,fontWeight:700,letterSpacing:1,textTransform:"uppercase",padding:"3px 10px",borderRadius:99,background:"rgba(94,196,182,0.10)",color:T.accent,border:"1px solid rgba(94,196,182,0.2)"}}>Headliner</span>}
        </div>);})}
    </div>
  </div>);
}

function TopSongs(props){
  var songs=props.songs;var ytMusicArtist=props.ytMusicArtist;
  var _p=useState(null);var playing=_p[0];var setPlaying=_p[1];
  if(!songs||!songs.length)return null;
  return(<div style={{marginBottom:24}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
      <p style={{fontSize:12,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:0}}>Listen</p>
      {ytMusicArtist&&<a href={ytMusicArtist} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,textDecoration:"none"}}><YTMusicIcon size={22}/><span style={{fontSize:15,fontWeight:700,color:T.textHi,letterSpacing:-0.3}}>Music</span></a>}
    </div>
    <div style={{borderRadius:16,overflow:"hidden",border:"1px solid "+T.border,background:"rgba(255,255,255,0.02)"}}>
      {songs.map(function(song,i){
        var isP=playing===i;var ytUrl="https://music.youtube.com/watch?v="+song.ytMusicId;
        return(<div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderTop:i>0?"1px solid rgba(255,255,255,0.04)":"none",background:isP?"rgba(255,255,255,0.03)":"transparent"}}>
          <div onClick={function(){setPlaying(isP?null:i);}} style={{width:32,height:32,borderRadius:8,flexShrink:0,cursor:"pointer",background:isP?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.04)",border:isP?"1px solid rgba(255,255,255,0.15)":"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {isP?<svg width={12} height={12} viewBox="0 0 24 24" fill={T.textHi} stroke="none"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>:<svg width={12} height={12} viewBox="0 0 24 24" fill={T.textSec} stroke="none"><polygon points="8,5 20,12 8,19"/></svg>}
          </div>
          <div style={{flex:1,minWidth:0}}><p style={{fontSize:13,fontWeight:600,color:T.textHi,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{song.title}</p><p style={{fontSize:10,color:T.textDim,margin:"2px 0 0"}}>{song.note?song.note+" \u00B7 ":""}{song.plays+" plays"}</p></div>
          <span style={{fontSize:11,color:T.textDim,fontWeight:500,flexShrink:0,marginRight:4}}>{song.duration}</span>
          <a href={ytUrl} target="_blank" rel="noopener noreferrer" onClick={function(e){e.stopPropagation();}} style={{width:28,height:28,borderRadius:99,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none"}}><YTMusicIcon size={22}/></a>
        </div>);})}
    </div>
    {playing!==null&&(<div style={{marginTop:8,padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid "+T.border,display:"flex",alignItems:"center",gap:10}}>
      <div onClick={function(){setPlaying(null);}} style={{width:28,height:28,borderRadius:99,flexShrink:0,cursor:"pointer",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width={10} height={10} viewBox="0 0 24 24" fill={T.textHi} stroke="none"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg></div>
      <div style={{flex:1,minWidth:0}}><p style={{fontSize:11,fontWeight:600,color:T.textHi,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{songs[playing].title}</p><div style={{marginTop:4,height:3,borderRadius:2,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}><div style={{width:"35%",height:"100%",borderRadius:2,background:T.accent}}/></div></div>
      <a href={"https://music.youtube.com/watch?v="+songs[playing].ytMusicId} target="_blank" rel="noopener noreferrer" style={{flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none"}}><YTMusicIcon size={26}/></a>
    </div>)}
  </div>);
}

function TicketSelect(props){
  var tix=props.tickets;var isM=props.isM;
  var _sel=useState(0);var selIdx=_sel[0];var setSelIdx=_sel[1];
  if(!tix||!tix.length)return null;
  var selected=tix[selIdx];var lowest=lowestPrice(tix);
  return(<div style={{marginBottom:28}}>
    <p style={{fontSize:12,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 14px"}}>Select Tickets</p>
    <div style={{display:"flex",alignItems:"center",padding:"0 18px 8px",gap:10}}>
      <div style={{flex:1}}><span style={{fontSize:9,fontWeight:700,color:T.textDim,letterSpacing:1.5,textTransform:"uppercase"}}>Section</span></div>
      <div style={{width:isM?70:90,textAlign:"center"}}><span style={{fontSize:9,fontWeight:700,color:T.textDim,letterSpacing:1.5,textTransform:"uppercase"}}>Vendor</span></div>
      <div style={{width:isM?55:65,textAlign:"right"}}><span style={{fontSize:9,fontWeight:700,color:T.textDim,letterSpacing:1.5,textTransform:"uppercase"}}>Price</span></div>
      <div style={{width:28}}></div>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {tix.map(function(sec,i){var act=i===selIdx;var prov=PROVS[sec.prov||"venuedirect"];var isLow=sec.total===lowest;
        return(<div key={i} onClick={function(){setSelIdx(i);}} style={{display:"flex",alignItems:"center",gap:10,padding:isM?"14px 14px":"16px 18px",borderRadius:16,cursor:"pointer",background:act?"rgba(94,196,182,0.05)":"rgba(255,255,255,0.02)",border:act?"1px solid rgba(94,196,182,0.3)":"1px solid "+T.border,transition:"all 0.2s"}}>
          <div style={{flex:1,minWidth:0}}><p style={{fontSize:14,fontWeight:700,color:T.textHi,margin:0}}>{sec.name}</p>{sec.sub&&<p style={{fontSize:10,color:T.textDim,margin:"2px 0 0"}}>{sec.sub}</p>}</div>
          <div style={{width:isM?70:90,display:"flex",justifyContent:"center",flexShrink:0}}><div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 8px",borderRadius:8,background:prov.bg,border:"1px solid "+prov.bdr}}><div style={{width:16,height:16,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:900,color:prov.c}}>{prov.short}</div>{!isM&&<span style={{fontSize:9,fontWeight:600,color:prov.c}}>{prov.name}</span>}{isM&&<span style={{fontSize:9,fontWeight:600,color:prov.c}}>{prov.short}</span>}</div></div>
          <div style={{width:isM?55:65,textAlign:"right",flexShrink:0}}><p style={{fontSize:20,fontWeight:300,margin:0,letterSpacing:-0.5,color:isLow&&act?T.green:T.textHi}}>{"$"+sec.total}</p></div>
          <div style={{width:28,display:"flex",justifyContent:"center",flexShrink:0}}><div style={{width:24,height:24,borderRadius:99,border:act?"2px solid "+T.accent:"2px solid rgba(255,255,255,0.18)",background:act?T.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>{act&&<svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={T.bg} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}</div></div>
        </div>);})}
    </div>
    <a href={selected.url} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",padding:"16px 0",borderRadius:99,textDecoration:"none",marginTop:14,background:"linear-gradient(135deg,#5EC4B6,#4db8a9)",color:T.bg,fontSize:13,fontWeight:700,letterSpacing:2,textTransform:"uppercase",boxShadow:"0 4px 24px "+T.accentGlow}}>
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="3"/><line x1="1" y1="10" x2="23" y2="10"/></svg>Get Tickets
    </a>
    <div style={{marginTop:12,padding:"12px 14px",borderRadius:12,background:"rgba(94,196,182,0.03)",border:"1px solid rgba(94,196,182,0.10)",display:"flex",alignItems:"center",gap:10}}>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
      <p style={{fontSize:10,color:T.textSec,margin:0,lineHeight:1.4}}>We compare real-time prices across Ticketmaster, StubHub, SeatGeek & more to find you the best deal on every section.</p>
    </div>
    <p style={{fontSize:8,color:T.textDim,margin:"6px 0 0",textAlign:"center"}}>Prices include estimated fees. GO Omaha may earn a commission.</p>
  </div>);
}

export default function ConcertEventClient(props){
  var ev=props.event;var venue=props.venue;var slug=props.slug;
  var isSports=ev.cat==="sports";
  var catColor=CA[ev.cat]||T.accent;
  var _s=useState(false);var saved=_s[0];var setSaved=_s[1];
  var _y=useState(false);var showYt=_y[0];var setShowYt=_y[1];
  var _sh=useState(false);var shared=_sh[0];var setShared=_sh[1];
  var _w=useState(600);var w=_w[0];var setW=_w[1];
  useEffect(function(){setW(window.innerWidth);function h(){setW(window.innerWidth);}window.addEventListener("resize",h);return function(){window.removeEventListener("resize",h);};},[]);
  var isM=w<600;var px=isM?16:24;
  var days=daysUntil(ev.date);var past=days!==null&&days<0;var daysAbs=days!==null?Math.abs(days):null;
  var heroImg=pickImg(ev);
  var venueUrl=(venue&&venue.url)||ev.venueUrl||"#";
  var venueAddr=(venue&&venue.addr)||ev.venueAddr||"";
  var venueType=(venue&&venue.type)||ev.venueType||"";
  var mapsUrl="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(venueAddr||ev.venue+", Omaha NE");
  var shareUrl="https://go-omaha.com/events/"+slug;
  var ytThumb=ev.ytId?"https://img.youtube.com/vi/"+ev.ytId+"/hqdefault.jpg":null;
  var ytEmbed=ev.ytId?"https://www.youtube.com/embed/"+ev.ytId+"?autoplay=1&rel=0":null;
  // Auto-generate ticket tiers from price + url if no tickets array
  var tickets=ev.tickets;
  if((!tickets||!tickets.length)&&ev.url&&ev.url!=="&num;"){
    var prov=ev.affiliatePlatform||"ticketmaster";
    var nums=(ev.price||"").match(/\d+\.?\d*/g);
    if(nums&&nums.length>=2){
      var lo=Math.round(parseFloat(nums[0]));var hi=Math.round(parseFloat(nums[nums.length-1]));
      var mid=Math.round((lo+hi)/2);
      tickets=[
        {name:"Upper Level",sub:"Best value",total:lo,prov:prov,url:ev.url},
        {name:"Mid Level",sub:"Great view",total:mid,prov:prov,url:ev.url},
        {name:"Floor / Premium",sub:"Closest to stage",total:hi,prov:prov,url:ev.url}
      ];
    } else if(nums&&nums.length===1){
      var base=Math.round(parseFloat(nums[0]));
      tickets=[
        {name:"General Admission",sub:"Standard entry",total:base,prov:prov,url:ev.url}
      ];
    } else {
      tickets=[{name:"General Admission",sub:"See event page for pricing",total:0,prov:prov,url:ev.url}];
    }
  }
  var low=lowestPrice(tickets);

  // Build internal venue page URL
  var venueSlug=(ev.venue||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  var VENUE_PAGE_MAP={"chi-health-center":1,"orpheum-theater":2,"orpheum-theater-omaha":2,"the-slowdown":3,"charles-schwab-field":4,"baxter-arena":5,"the-astro":6,"steelhouse-omaha":7,"the-admiral":8,"werner-park":9,"liberty-first-credit-union-arena":10,"barnato":11,"holland-center":12,"bemis-center":13,"mid-america-center":14,"omaha-community-playhouse":15,"film-streams":16,"henry-doorly-zoo":17};
  var venuePageId=VENUE_PAGE_MAP[venueSlug];
  var internalVenueUrl=venuePageId?"/venues/"+venuePageId+"/":null;

  function handleShare(){if(navigator.share){try{navigator.share({title:ev.title,text:ev.title+" at "+ev.venue,url:shareUrl});}catch(e){}}else{try{navigator.clipboard.writeText(shareUrl);}catch(e){}}setShared(true);setTimeout(function(){setShared(false);},2000);}

  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:T.sans,color:T.text,paddingBottom:80}}>
      <DetailPageScroll />
      {/* HERO */}
      <div style={{position:"relative",height:isM?380:460,overflow:"hidden"}}>
        <img loading="lazy" src={heroImg} alt={ev.title} style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.5}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(20,22,24,0.05) 0%,rgba(20,22,24,0.15) 25%,rgba(20,22,24,0.75) 65%,#141618 100%)"}}/>

        <a href="/" style={{position:"absolute",top:16,left:px,zIndex:2,display:"flex",alignItems:"center",gap:6,padding:"8px 16px 8px 12px",borderRadius:99,background:"rgba(20,22,24,0.75)",border:"1px solid rgba(255,255,255,0.2)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",textDecoration:"none",color:T.text,fontSize:12,fontWeight:600}}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>Back
        </a>
        {ev.tickets&&ev.tickets[0]&&<a href={ev.tickets[0].url} target="_blank" rel="noopener noreferrer" style={{position:"absolute",top:16,right:px,zIndex:2,padding:"8px 18px",borderRadius:99,background:T.accent,color:T.bg,fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",textDecoration:"none"}}>Tickets</a>}

        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 "+px+"px 28px"}}>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",padding:"4px 12px",borderRadius:99,background:catColor+"22",color:catColor,border:"1px solid "+catColor+"44"}}>{isSports?"\uD83C\uDFC6 Sports":"\uD83C\uDFB5 Concert"}</span>
            {daysAbs!==null&&!past&&<span style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",padding:"4px 12px",borderRadius:99,background:"rgba(255,255,255,0.06)",color:T.textSec,border:"1px solid "+T.border}}>{daysAbs===0?"Today":daysAbs===1?"Tomorrow":daysAbs+" days away"}</span>}
            {past&&<span style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",padding:"4px 12px",borderRadius:99,background:"rgba(255,255,255,0.06)",color:T.textDim,border:"1px solid "+T.border}}>Past Event</span>}
          </div>
          {ev.subtitle&&<p style={{fontSize:12,color:T.textSec,margin:"0 0 6px",fontWeight:500}}>{ev.subtitle}</p>}
          <h1 style={{fontSize:isM?28:36,fontWeight:700,color:T.textHi,margin:"0 0 12px",lineHeight:1.1}}>{ev.title}</h1>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:isM?8:14,alignItems:"center"}}>
              <span style={{fontSize:13,color:"rgba(242,239,233,0.9)"}}>{fmtShort(ev.date)}</span>
              <span style={{fontSize:13,color:"rgba(242,239,233,0.9)"}}>{ev.time}</span>
              <a href={venueUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:13,color:catColor,fontWeight:600,textDecoration:"none"}}>{ev.venue}</a>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0,marginLeft:12}}>
              <button onClick={function(){setSaved(!saved);}} style={{width:36,height:36,borderRadius:99,cursor:"pointer",background:saved?"rgba(212,173,101,0.12)":"rgba(20,22,24,0.5)",border:saved?"1px solid rgba(212,173,101,0.3)":"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}><svg width={15} height={15} viewBox="0 0 24 24" fill={saved?T.gold:"none"} stroke={saved?T.gold:"rgba(242,239,233,0.8)"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></button>
              <button onClick={handleShare} style={{width:36,height:36,borderRadius:99,cursor:"pointer",background:"rgba(20,22,24,0.5)",border:"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)",color:shared?T.green:T.text}}>{shared?<svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>:<svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>}</button>
            </div>
          </div>
          <div style={{display:"flex",gap:12,marginTop:14,flexWrap:"wrap"}}>
            {low&&<span style={{fontSize:12,color:T.textHi,fontWeight:600}}>{"From $"+low}</span>}
            <span style={{fontSize:12,color:T.textSec}}>{"Doors "+(ev.doors||ev.time)}</span>
            {venue&&venue.cap&&<span style={{fontSize:12,color:T.textSec}}>{venue.cap+" cap"}</span>}
            {ev.ageReq&&<span style={{fontSize:12,color:T.textSec}}>{ev.ageReq}</span>}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:660,margin:"0 auto",padding:"0 "+px+"px"}}>
        <div style={{marginTop:24}}/>

        {/* Artist Lineup (concerts only) */}
        {!isSports&&<ArtistLineup lineup={ev.lineup}/>}

        {/* Matchup Card (sports only) */}
        {isSports&&ev.matchup&&<MatchupCard matchup={ev.matchup}/>}

        {/* About */}
        {ev.desc&&<div style={{marginBottom:24}}><p style={{fontSize:12,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 10px"}}>{isSports?"About This Game":"About This Event"}</p><p style={{fontSize:15,color:T.textBody,lineHeight:1.75,margin:0}}>{ev.desc}</p></div>}

        {/* Top Songs (concerts only) */}
        {!isSports&&<TopSongs songs={ev.songs} ytMusicArtist={ev.ytMusicArtist}/>}

        {/* Spotify (concerts only) */}
        {!isSports&&ev.spotifyUrl&&(<div style={{marginBottom:24}}><a href={ev.spotifyUrl} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:16,textDecoration:"none",background:"rgba(30,215,96,0.06)",border:"1px solid rgba(30,215,96,0.15)"}}>
          <div style={{width:36,height:36,borderRadius:10,background:"#1DB954",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width={18} height={18} viewBox="0 0 24 24" fill="#fff"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg></div>
          <div style={{flex:1}}><p style={{fontSize:13,fontWeight:600,color:T.textHi,margin:0}}>Listen on Spotify</p><p style={{fontSize:10,color:T.textSec,margin:"2px 0 0"}}>Open in Spotify</p></div>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a></div>)}

        {/* YouTube */}
        {ev.ytId&&(<div style={{marginBottom:24}}>
          <p style={{fontSize:12,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 10px"}}>{isSports?"Highlights":"Watch & Listen"}</p>
          {!showYt?(<div onClick={function(){setShowYt(true);}} style={{position:"relative",borderRadius:16,overflow:"hidden",cursor:"pointer",border:"1px solid "+T.border,aspectRatio:"16/9"}}>
            <img loading="lazy" src={ytThumb} alt="Preview" style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.7}}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.3)"}}><div style={{width:60,height:60,borderRadius:99,background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255,255,255,0.2)"}}><svg width={24} height={24} viewBox="0 0 24 24" fill="#fff" stroke="none"><polygon points="8,5 20,12 8,19"/></svg></div></div>
            <div style={{position:"absolute",bottom:10,left:12,display:"flex",alignItems:"center",gap:6}}><svg width={12} height={12} viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)" stroke="none"><polygon points="5,3 19,12 5,21"/></svg><span style={{fontSize:10,color:"rgba(255,255,255,0.6)",fontWeight:600}}>{isSports?"Watch Highlights":"Watch Live Performance"}</span></div>
          </div>):(<div style={{borderRadius:16,overflow:"hidden",border:"1px solid "+T.border,aspectRatio:"16/9"}}><iframe src={ytEmbed} title={ev.title} style={{width:"100%",height:"100%",border:"none"}} allow="autoplay; encrypted-media" allowFullScreen/></div>)}
        </div>)}

        {/* Event Details - icon rows */}
        <div style={{marginBottom:24}}>
          <p style={{fontSize:12,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 14px"}}>Event Details</p>
          <div style={{borderRadius:18,overflow:"hidden",border:"1px solid "+T.border,background:"rgba(255,255,255,0.02)"}}>
            {[
              {label:"Date",value:fmtDate(ev.date),icon:"\uD83D\uDCC5"},
              {label:"Time",value:ev.time+" \u00B7 Doors at "+(ev.doors||ev.time),icon:"\uD83D\uDD52"},
              {label:"Venue",value:ev.venue+(venueType?" \u00B7 "+venueType:""),icon:"\uD83C\uDFE0",link:venueUrl},
              venueAddr?{label:"Address",value:venueAddr,icon:"\uD83D\uDCCD"}:null,
              isSports&&ev.homeTeam?{label:"Home",value:ev.homeTeam,icon:"\uD83C\uDFE0"}:null,
              isSports&&ev.awayTeam?{label:"Away",value:ev.awayTeam,icon:"\u2708\uFE0F"}:null,
            ].filter(Boolean).map(function(r,i){return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",borderTop:i>0?"1px solid rgba(255,255,255,0.05)":"none"}}>
                <span style={{fontSize:16,width:24,textAlign:"center",flexShrink:0}}>{r.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:10,color:T.textDim,fontWeight:600,letterSpacing:1,textTransform:"uppercase",margin:"0 0 2px"}}>{r.label}</p>
                  {r.link?<a href={r.link} target="_blank" rel="noopener noreferrer" style={{fontSize:14,color:catColor,fontWeight:500,textDecoration:"none",margin:0}}>{r.value}</a>:<p style={{fontSize:14,color:T.textHi,fontWeight:500,margin:0}}>{r.value}</p>}
                </div>
              </div>);})
            }
          </div>
        </div>

        {/* Tags */}
        {ev.tags&&ev.tags.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:24}}>{ev.tags.map(function(t){return <span key={t} style={{fontSize:10,padding:"5px 13px",borderRadius:99,background:"rgba(255,255,255,0.04)",border:"1px solid "+T.border,color:T.textSec,fontWeight:500}}>{t}</span>;})}</div>}

        {/* Tickets */}
        <TicketSelect tickets={tickets} isM={isM}/>

        {/* Directions / Calendar / Share */}
        <div style={{display:"flex",gap:8,marginBottom:28}}>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"14px 0",borderRadius:99,textDecoration:"none",background:"rgba(255,255,255,0.04)",border:"1px solid "+T.border,color:T.text,fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"/><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/></svg>Directions
          </a>
          <a href={calUrl(ev)} target="_blank" rel="noopener noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"14px 0",borderRadius:99,textDecoration:"none",background:"rgba(255,255,255,0.04)",border:"1px solid "+T.border,color:T.text,fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Calendar
          </a>
          <button onClick={handleShare} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"14px 0",borderRadius:99,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid "+T.border,color:T.text,fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>{shared?"Copied!":"Share"}
          </button>
        </div>

        {/* Venue card */}
        <a href={internalVenueUrl||venueUrl} target={internalVenueUrl?undefined:"_blank"} rel={internalVenueUrl?undefined:"noopener noreferrer"} style={{display:"block",textDecoration:"none",borderRadius:18,border:"1px solid "+T.border,padding:"20px 18px",marginBottom:28,background:"rgba(255,255,255,0.02)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <p style={{fontSize:16,fontWeight:600,color:T.textHi,margin:"0 0 4px"}}>{ev.venue}</p>
              <p style={{fontSize:12,color:T.textSec,margin:"0 0 8px"}}>{venueType+(venueAddr?" \u00B7 "+venueAddr:"")}</p>
              <span style={{fontSize:11,color:catColor,fontWeight:600}}>{internalVenueUrl?"View Venue & Upcoming Events \u2192":"Visit Venue Website"}</span>
            </div>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </a>

        <p style={{fontSize:9,color:T.textDim,textAlign:"center",marginBottom:20}}>Prices subject to change {"\u00B7"} Some links may earn a small commission</p>
        <div style={{textAlign:"center",paddingBottom:20,borderTop:"1px solid "+T.border,paddingTop:16}}><p style={{fontSize:10,color:"rgba(235,230,220,0.25)",margin:0}}>{"\u00A9"} 2026 GO: Guide to Omaha</p></div>
      </div>
      <BottomNav active="events" />
    </div>
  );
}
