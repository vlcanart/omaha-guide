"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ═══ DESIGN TOKENS ═══ */
const T={
  bg:"#141618",surface:"#1B1D21",card:"#1F2227",
  border:"rgba(255,255,255,0.08)",borderHi:"rgba(255,255,255,0.18)",
  text:"#F2EFE9",textHi:"#FFFFFF",textBody:"rgba(242,239,233,0.82)",
  textSec:"rgba(242,239,233,0.58)",textDim:"rgba(242,239,233,0.32)",
  sans:"'Inter',system-ui,-apple-system,sans-serif",
};

/* ═══ TILE LAYERS ═══ */
const TILES={
  outdoor:{url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",attr:'&copy; <a href="https://openstreetmap.org">OSM</a>',label:"Map"},
  satellite:{url:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",attr:"&copy; Esri",label:"Satellite"},
  topo:{url:"https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",attr:'&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',label:"Topo"},
};

/* ═══ POI ICON BUILDER ═══ */
function poiIcon(type){
  const icons={
    parking:{bg:"#3B82F6",svg:'<path d="M9 18h1v-2h2.5A2.5 2.5 0 0015 13.5 2.5 2.5 0 0012.5 11H9v7zm1-3v-3h2.5a1.5 1.5 0 010 3H10z" fill="white"/>'},
    trailhead:{bg:"#6BBF7A",svg:'<path d="M12 2L4 12h3v8h4v-5h2v5h4v-8h3L12 2z" fill="white"/>'},
    water:{bg:"#5CA8D4",svg:'<path d="M12 2c-5 6-7 9-7 12a7 7 0 0014 0c0-3-2-6-7-12z" fill="white"/>'},
    restroom:{bg:"#8B5CF6",svg:'<circle cx="9" cy="5" r="2" fill="white"/><path d="M7 9h4v4H9v5H7v-9zm6 0h4l-2 9h-2l1-5h-1V9z" fill="white"/>'},
    fishing:{bg:"#5CA8D4",svg:'<path d="M12 6c3-4 8-2 8 2s-5 5-8 3c-3 2-8 1-8-3s5-6 8-2z" fill="white"/>'},
    shelter:{bg:"#C49A6C",svg:'<path d="M12 3L4 10h2v8h12v-8h2L12 3zm0 3l5 5v6H7v-6l5-5z" fill="white"/>'},
    activity:{bg:"#E8B54D",svg:'<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 3l5 8H7l5-8z" fill="white"/>'},
    photo:{bg:"#EC4899",svg:'<rect x="4" y="6" width="16" height="12" rx="2" fill="white"/><circle cx="12" cy="12" r="3" fill="#EC4899"/>'},
  };
  const ic=icons[type]||icons.activity;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="${ic.bg}" stroke="white" stroke-width="1.5"/>${ic.svg}</svg>`;
  return L.divIcon({html:svg,className:"",iconSize:[28,28],iconAnchor:[14,14],popupAnchor:[0,-16]});
}

/* ═══ USE ICONS ═══ */
const useIcons={walking:"\u{1F6B6}",running:"\u{1F3C3}",biking:"\u{1F6B4}",wheelchair:"\u267F",stroller:"\u{1F476}",ebiking:"\u26A1",dog:"\u{1F415}",hiking:"\u{1F97E}",horseback:"\u{1F434}"};

/* ═══ HELPERS ═══ */
const diffColor=d=>d==="Easy"?"#6BBF7A":d==="Moderate"?"#E8B54D":"#E8364F";
const condColor=c=>({"excellent":"#6BBF7A","good":"#7DD4A0","fair":"#E8B54D","poor":"#E8364F","closed":"#666"}[c]||T.textSec);
const condLabel=c=>({"excellent":"Excellent","good":"Good","fair":"Fair","poor":"Poor","closed":"Closed"}[c]||c);

/* ═══ GPS LOCATION ═══ */
function UserLocation(){
  const[pos,setPos]=useState(null);
  useEffect(()=>{
    if(!navigator.geolocation)return;
    const wid=navigator.geolocation.watchPosition(p=>setPos([p.coords.latitude,p.coords.longitude]),()=>{},{enableHighAccuracy:true,maximumAge:5000});
    return()=>navigator.geolocation.clearWatch(wid);
  },[]);
  if(!pos)return null;
  return<><CircleMarker center={pos} radius={6} pathOptions={{color:"#fff",fillColor:"#4285F4",fillOpacity:1,weight:2}}/><CircleMarker center={pos} radius={18} pathOptions={{color:"transparent",fillColor:"#4285F4",fillOpacity:0.15,weight:0}}/></>;
}

/* ═══ FIT BOUNDS ═══ */
function FitTrail({coords}){
  const map=useMap();
  useEffect(()=>{
    if(coords&&coords.length>1){map.fitBounds(L.latLngBounds(coords),{padding:[40,40],maxZoom:15});}
  },[coords,map]);
  return null;
}

/* ═══ STARS ═══ */
function Stars({rating,size=12}){
  return<span style={{display:"inline-flex",gap:1}}>{[1,2,3,4,5].map(i=><svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i<=Math.round(rating)?"#E8B54D":"rgba(255,255,255,0.12)"} stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}</span>;
}

/* ═══ ELEVATION CHART ═══ */
function ElevationProfile({data,color,hoverMile,onHover}){
  const canvasRef=useRef(null);const containerRef=useRef(null);
  useEffect(()=>{
    if(!data||!canvasRef.current||!containerRef.current)return;
    const canvas=canvasRef.current;const container=containerRef.current;
    const dpr=window.devicePixelRatio||1;const w=container.offsetWidth;const h=120;
    canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+"px";canvas.style.height=h+"px";
    const ctx=canvas.getContext("2d");ctx.scale(dpr,dpr);
    const minE=Math.min(...data.map(d=>d[1]))-5;const maxE=Math.max(...data.map(d=>d[1]))+5;
    const maxD=data[data.length-1][0];const pad={l:36,r:12,t:8,b:24};const pw=w-pad.l-pad.r;const ph=h-pad.t-pad.b;
    const x=d=>pad.l+(d/maxD)*pw;const y=e=>pad.t+ph-((e-minE)/(maxE-minE))*ph;
    ctx.strokeStyle="rgba(255,255,255,0.05)";ctx.lineWidth=0.5;
    for(let e=Math.ceil(minE/10)*10;e<=maxE;e+=10){ctx.beginPath();ctx.moveTo(pad.l,y(e));ctx.lineTo(w-pad.r,y(e));ctx.stroke();}
    ctx.beginPath();ctx.moveTo(x(data[0][0]),y(data[0][1]));data.forEach(d=>ctx.lineTo(x(d[0]),y(d[1])));
    ctx.lineTo(x(data[data.length-1][0]),h-pad.b);ctx.lineTo(x(data[0][0]),h-pad.b);ctx.closePath();
    const grad=ctx.createLinearGradient(0,pad.t,0,h-pad.b);grad.addColorStop(0,color+"30");grad.addColorStop(1,color+"05");
    ctx.fillStyle=grad;ctx.fill();
    ctx.beginPath();ctx.moveTo(x(data[0][0]),y(data[0][1]));data.forEach(d=>ctx.lineTo(x(d[0]),y(d[1])));
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
    data.forEach(d=>{ctx.beginPath();ctx.arc(x(d[0]),y(d[1]),2,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();});
    ctx.fillStyle=T.textDim;ctx.font="9px Inter, system-ui";ctx.textAlign="right";
    for(let e=Math.ceil(minE/20)*20;e<=maxE;e+=20){ctx.fillText(e+"'",pad.l-4,y(e)+3);}
    ctx.textAlign="center";ctx.fillStyle=T.textDim;
    for(let d=0;d<=maxD;d+=Math.max(1,Math.round(maxD/6))){ctx.fillText(d+" mi",x(d),h-6);}
    if(hoverMile!==null&&hoverMile!==undefined){
      const hx=x(hoverMile);ctx.strokeStyle="rgba(255,255,255,0.3)";ctx.lineWidth=1;ctx.setLineDash([3,3]);
      ctx.beginPath();ctx.moveTo(hx,pad.t);ctx.lineTo(hx,h-pad.b);ctx.stroke();ctx.setLineDash([]);
      let closest=data[0];data.forEach(d=>{if(Math.abs(d[0]-hoverMile)<Math.abs(closest[0]-hoverMile))closest=d;});
      ctx.beginPath();ctx.arc(hx,y(closest[1]),5,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
      ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle=T.textHi;ctx.font="bold 10px Inter, system-ui";ctx.textAlign="center";
      ctx.fillText(closest[1]+" ft",hx,y(closest[1])-10);
    }
  },[data,color,hoverMile]);
  const handleMove=useCallback(e=>{
    if(!data||!containerRef.current)return;const rect=containerRef.current.getBoundingClientRect();
    const xp=e.clientX-rect.left;const pad={l:36,r:12};const pw=rect.width-pad.l-pad.r;
    const ratio=Math.max(0,Math.min(1,(xp-pad.l)/pw));const maxD=data[data.length-1][0];
    onHover?.(ratio*maxD);
  },[data,onHover]);
  return<div ref={containerRef} style={{position:"relative",width:"100%"}} onMouseMove={handleMove} onMouseLeave={()=>onHover?.(null)} onTouchMove={e=>handleMove(e.touches[0])}><canvas ref={canvasRef} style={{display:"block",borderRadius:8}}/></div>;
}

/* ═══ POI TYPES ═══ */
const POI_TYPES=[
  {key:"parking",label:"Parking",emoji:"\u{1F17F}\uFE0F"},
  {key:"trailhead",label:"Trailheads",emoji:"\u{1F97E}"},
  {key:"water",label:"Water",emoji:"\u{1F4A7}"},
  {key:"restroom",label:"Restrooms",emoji:"\u{1F6BB}"},
  {key:"fishing",label:"Fishing",emoji:"\u{1F3A3}"},
  {key:"shelter",label:"Shelters",emoji:"\u26FA"},
  {key:"activity",label:"Activities",emoji:"\u2B50"},
  {key:"photo",label:"Photo Spots",emoji:"\u{1F4F8}"},
];

/* ═══════════════════════════════════════
   MAIN TRAIL MAP COMPONENT
   ═══════════════════════════════════════ */
export default function TrailMap({parkId,parkName,parkColor,initialTrailIndex=0,trailMapData,onBack}){
  const[activeTrail,setActiveTrail]=useState(initialTrailIndex);
  const[tileLayer,setTileLayer]=useState("outdoor");
  const[showPOI,setShowPOI]=useState({parking:true,trailhead:true,water:true,restroom:true,fishing:false,shelter:false,activity:false,photo:false});
  const[showMiles,setShowMiles]=useState(true);
  const[hoverMile,setHoverMile]=useState(null);
  const[expandedPanel,setExpandedPanel]=useState("overview");
  const[mapExpanded,setMapExpanded]=useState(false);
  const[isM,setIsM]=useState(false);

  useEffect(()=>{const h=()=>setIsM(window.innerWidth<640);h();window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);

  const{trails,pois,reviews,conditions,mapCenter,mapZoom}=trailMapData;
  const trail=trails[activeTrail]||trails[0];
  const trailCoords=trail.coords;
  const elevData=trail.elevation;
  const trailReviews=reviews.filter(r=>r.trail===trail.id);
  const trailConditions=conditions.filter(c=>c.trail===trail.id);
  const latestCondition=trailConditions[0];
  const activePOIs=pois.filter(p=>showPOI[p.type]);
  const mapH=mapExpanded?(isM?"70vh":"65vh"):(isM?"52vh":"50vh");
  const pc=parkColor||"#81C784";

  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:T.sans,color:T.text}}>

      {/* ── HEADER ── */}
      <div style={{position:"sticky",top:0,zIndex:200,background:"rgba(20,22,24,0.92)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`,padding:"10px 16px"}}>
        <div style={{maxWidth:720,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={onBack} style={{width:34,height:34,borderRadius:99,background:"rgba(255,255,255,0.06)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.text,fontSize:16}}>{"\u2190"}</button>
            <div>
              <p style={{fontSize:14,fontWeight:700,color:T.textHi,margin:0}}>Trail Map</p>
              <p style={{fontSize:10,color:pc,margin:0}}>{parkName}</p>
            </div>
          </div>
          <button onClick={()=>setMapExpanded(!mapExpanded)} style={{padding:"6px 12px",borderRadius:99,background:mapExpanded?`${pc}15`:"rgba(255,255,255,0.04)",border:`1px solid ${mapExpanded?pc+"40":T.border}`,color:mapExpanded?pc:T.textSec,fontSize:11,fontWeight:600,cursor:"pointer",letterSpacing:0.5}}>
            {mapExpanded?"\u25BC Collapse":"\u25B2 Expand"} Map
          </button>
        </div>
      </div>

      {/* ── MAP ── */}
      <div style={{height:mapH,transition:"height 0.3s ease",position:"relative"}}>
        <MapContainer center={mapCenter} zoom={mapZoom} style={{height:"100%",width:"100%"}} zoomControl={false} attributionControl={true}>
          <TileLayer url={TILES[tileLayer].url} attribution={TILES[tileLayer].attr}/>
          {trails.map((t,i)=>{
            const isActive=i===activeTrail;
            return<Polyline key={t.id} positions={t.coords} pathOptions={{color:isActive?t.color:t.colorFaded,weight:isActive?4:2,opacity:isActive?1:0.6,dashArray:t.type==="equestrian"?"8 6":t.type==="natural"?"4 4":undefined}} eventHandlers={{click:()=>setActiveTrail(i)}}/>;
          })}
          {showMiles&&trail.mileMarkers&&trail.mileMarkers.map(m=>
            <Marker key={m.mi} position={[m.lat,m.lng]} icon={L.divIcon({html:`<div style="background:rgba(20,22,24,.75);backdrop-filter:blur(8px);border:1.5px solid ${trail.color}66;border-radius:99px;color:${trail.color};font-size:9px;font-weight:700;padding:2px 6px;font-family:${T.sans};letter-spacing:.5px;white-space:nowrap">${m.mi}</div>`,className:"",iconSize:[32,18],iconAnchor:[16,9]})}/>
          )}
          {activePOIs.map(p=>
            <Marker key={p.id} position={[p.lat,p.lng]} icon={poiIcon(p.type)}><Popup><b>{p.name}</b><br/>{p.desc}</Popup></Marker>
          )}
          <UserLocation/>
          <FitTrail coords={trailCoords}/>
        </MapContainer>

        {/* Tile layer toggle */}
        <div style={{position:"absolute",top:12,right:12,zIndex:500,display:"flex",gap:4,background:"rgba(20,22,24,0.85)",backdropFilter:"blur(12px)",borderRadius:10,padding:3,border:`1px solid ${T.border}`}}>
          {Object.entries(TILES).map(([key,tile])=>
            <button key={key} onClick={()=>setTileLayer(key)} style={{padding:"5px 10px",borderRadius:8,background:tileLayer===key?"rgba(255,255,255,0.12)":"transparent",border:"none",color:tileLayer===key?T.textHi:T.textSec,fontSize:11,fontWeight:600,cursor:"pointer"}}>{tile.label}</button>
          )}
        </div>

        {/* Trail legend */}
        {trails.length>1&&<div style={{position:"absolute",bottom:16,left:12,zIndex:500,background:"rgba(20,22,24,0.88)",backdropFilter:"blur(12px)",borderRadius:12,padding:"8px 12px",border:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:4}}>
          {trails.map((t,i)=>
            <button key={t.id} onClick={()=>setActiveTrail(i)} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",padding:"2px 0",opacity:activeTrail===i?1:0.5}}>
              <div style={{width:16,height:3,borderRadius:2,background:t.color,borderTop:t.type!=="paved"?`1px dashed ${t.color}`:"none"}}/>
              <span style={{fontSize:10,color:activeTrail===i?T.textHi:T.textSec,fontWeight:activeTrail===i?600:400}}>{t.name}</span>
            </button>
          )}
        </div>}
      </div>

      {/* ── CONTENT ── */}
      <div style={{maxWidth:720,margin:"0 auto",padding:"0 16px"}}>

        {/* Trail selector pills */}
        <div style={{display:"flex",gap:6,padding:"16px 0 12px",overflowX:"auto"}}>
          {trails.map((t,i)=>
            <button key={t.id} onClick={()=>setActiveTrail(i)} style={{display:"flex",alignItems:"center",gap:8,padding:"12px 20px",borderRadius:14,background:activeTrail===i?`${t.color}15`:"rgba(255,255,255,0.03)",border:`1.5px solid ${activeTrail===i?t.color+"40":"rgba(255,255,255,0.10)"}`,cursor:"pointer",flexShrink:0,transition:"all 0.2s"}}>
              <div style={{width:8,height:8,borderRadius:99,background:t.color,flexShrink:0}}/>
              <div style={{textAlign:"left"}}>
                <p style={{fontSize:14,fontWeight:600,color:activeTrail===i?T.textHi:T.textSec,margin:0,whiteSpace:"nowrap"}}>{t.name}</p>
                <p style={{fontSize:10,color:T.textDim,margin:"2px 0 0"}}>{t.distance} \u00b7 {t.difficulty}</p>
              </div>
            </button>
          )}
        </div>

        {/* Quick stats */}
        <div style={{display:"flex",gap:1,borderRadius:14,overflow:"hidden",margin:"0 0 16px",border:`1px solid ${T.border}`}}>
          {[{label:"Distance",value:trail.distance},{label:"Gain",value:trail.elevGain},{label:"Time",value:trail.avgTime},{label:"Difficulty",value:trail.difficulty,color:diffColor(trail.difficulty)}].map((s,i)=>
            <div key={i} style={{flex:1,padding:"12px 8px",background:"rgba(255,255,255,0.02)",textAlign:"center",borderRight:i<3?`1px solid ${T.border}`:"none"}}>
              <p style={{fontSize:9,color:T.textDim,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",margin:"0 0 4px"}}>{s.label}</p>
              <p style={{fontSize:15,fontWeight:700,color:s.color||T.textHi,margin:0}}>{s.value}</p>
            </div>
          )}
        </div>

        {/* Rating & status */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 0 16px",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Stars rating={trail.rating} size={14}/>
            <span style={{fontSize:13,fontWeight:600,color:T.textHi}}>{trail.rating}</span>
            <span style={{fontSize:11,color:T.textSec}}>({trail.reviewCount} reviews)</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:8,height:8,borderRadius:99,background:trail.status==="open"?"#6BBF7A":"#E8364F"}}/>
            <span style={{fontSize:12,fontWeight:600,color:trail.status==="open"?"#6BBF7A":"#E8364F"}}>{trail.status==="open"?"Open":"Closed"}</span>
            <span style={{fontSize:11,color:T.textDim}}>{"\u00b7"} Updated {trail.lastUpdated}</span>
          </div>
        </div>

        {/* Condition banner */}
        {latestCondition&&<div style={{background:`${condColor(latestCondition.condition)}10`,border:`1px solid ${condColor(latestCondition.condition)}25`,borderRadius:14,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"flex-start",gap:12}}>
          <div style={{width:32,height:32,borderRadius:10,background:`${condColor(latestCondition.condition)}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14}}>
            {latestCondition.condition==="excellent"?"\u2713":latestCondition.condition==="fair"?"\u26A0":"\u2139"}
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
              <span style={{fontSize:11,fontWeight:700,color:condColor(latestCondition.condition),letterSpacing:0.5}}>{condLabel(latestCondition.condition).toUpperCase()}</span>
              <span style={{fontSize:10,color:T.textDim}}>{"\u00b7"} {latestCondition.date} {"\u00b7"} {latestCondition.reporter}</span>
            </div>
            <p style={{fontSize:12,color:T.textBody,lineHeight:1.5,margin:0}}>{latestCondition.note}</p>
          </div>
        </div>}

        {/* Allowed uses */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          {trail.allowedUses.map(u=>
            <span key={u} style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border}`,color:T.textBody}}>
              {useIcons[u]} {u.charAt(0).toUpperCase()+u.slice(1)}
            </span>
          )}
        </div>

        {/* Elevation profile */}
        {elevData&&<div style={{background:T.card,borderRadius:18,border:`1px solid ${T.border}`,padding:"16px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <p style={{fontSize:10,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:0}}>Elevation Profile</p>
            <div style={{display:"flex",gap:12}}>
              <span style={{fontSize:10,color:T.textDim}}>{"\u2191"} {trail.elevGain} gain</span>
              <span style={{fontSize:10,color:T.textDim}}>{"\u22A5"} {Math.min(...elevData.map(d=>d[1]))}&ndash;{Math.max(...elevData.map(d=>d[1]))} ft</span>
            </div>
          </div>
          <ElevationProfile data={elevData} color={trail.color} hoverMile={hoverMile} onHover={setHoverMile}/>
        </div>}

        {/* POI toggles */}
        <div style={{background:T.card,borderRadius:18,border:`1px solid ${T.border}`,padding:"14px 16px",marginBottom:16}}>
          <p style={{fontSize:10,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 10px"}}>Show on Map</p>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {POI_TYPES.map(pt=>
              <button key={pt.key} onClick={()=>setShowPOI(prev=>({...prev,[pt.key]:!prev[pt.key]}))} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:99,cursor:"pointer",background:showPOI[pt.key]?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${showPOI[pt.key]?T.borderHi:T.border}`,color:showPOI[pt.key]?T.textHi:T.textSec,fontSize:12,fontWeight:500,transition:"all 0.15s"}}>
                <span style={{fontSize:12}}>{pt.emoji}</span> {pt.label}
              </button>
            )}
            <button onClick={()=>setShowMiles(!showMiles)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:99,cursor:"pointer",background:showMiles?`${trail.color}10`:"rgba(255,255,255,0.02)",border:`1px solid ${showMiles?trail.color+"30":T.border}`,color:showMiles?trail.color:T.textSec,fontSize:12,fontWeight:500,transition:"all 0.15s"}}>
              {"\u{1F4CD}"} Mile Markers
            </button>
          </div>
        </div>

        {/* Section tabs */}
        <div style={{display:"flex",gap:4,marginBottom:16,overflowX:"auto"}}>
          {[{id:"overview",label:"Overview"},{id:"conditions",label:"Conditions"},{id:"reviews",label:`Reviews (${trailReviews.length})`},{id:"nearby",label:"Nearby"}].map(tab=>
            <button key={tab.id} onClick={()=>setExpandedPanel(tab.id)} style={{padding:"11px 20px",borderRadius:99,cursor:"pointer",background:expandedPanel===tab.id?"rgba(255,255,255,0.08)":"transparent",border:`1px solid ${expandedPanel===tab.id?T.borderHi:"transparent"}`,color:expandedPanel===tab.id?T.textHi:T.textSec,fontSize:14,fontWeight:600,whiteSpace:"nowrap"}}>{tab.label}</button>
          )}
        </div>

        {/* ═══ OVERVIEW ═══ */}
        {expandedPanel==="overview"&&<div>
          <div style={{background:`${trail.color}08`,borderRadius:16,border:`1px solid ${trail.color}20`,padding:"16px",marginBottom:12}}>
            <p style={{fontSize:10,fontWeight:700,color:trail.color,letterSpacing:2,textTransform:"uppercase",margin:"0 0 10px"}}>Highlights</p>
            {trail.highlights.map((h,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"5px 0"}}><span style={{color:trail.color,fontSize:12,flexShrink:0}}>{"\u2726"}</span><span style={{fontSize:13,color:T.textBody,lineHeight:1.5}}>{h}</span></div>)}
          </div>
          <div style={{background:"rgba(232,181,77,0.05)",borderRadius:16,border:"1px solid rgba(232,181,77,0.15)",padding:"16px",marginBottom:12}}>
            <p style={{fontSize:10,fontWeight:700,color:"#E8B54D",letterSpacing:2,textTransform:"uppercase",margin:"0 0 10px"}}>Heads Up</p>
            {trail.cautions.map((c,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"5px 0"}}><span style={{color:"#E8B54D",fontSize:12,flexShrink:0,marginTop:1}}>{"\u26A0"}</span><span style={{fontSize:13,color:T.textBody,lineHeight:1.5}}>{c}</span></div>)}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:isM?"wrap":"nowrap"}}>
            <div style={{flex:1,padding:"14px",borderRadius:14,background:"rgba(255,255,255,0.02)",border:`1px solid ${T.border}`,minWidth:isM?"100%":0}}>
              <p style={{fontSize:9,fontWeight:700,color:T.textDim,letterSpacing:1.5,textTransform:"uppercase",margin:"0 0 6px"}}>Best For</p>
              <p style={{fontSize:13,color:T.textBody,margin:0,lineHeight:1.5}}>{trail.bestFor}</p>
            </div>
            <div style={{flex:1,padding:"14px",borderRadius:14,background:"rgba(255,255,255,0.02)",border:`1px solid ${T.border}`,minWidth:isM?"100%":0}}>
              <p style={{fontSize:9,fontWeight:700,color:T.textDim,letterSpacing:1.5,textTransform:"uppercase",margin:"0 0 6px"}}>Season</p>
              <p style={{fontSize:13,color:T.textBody,margin:0,lineHeight:1.5}}>{trail.seasonalNote}</p>
            </div>
          </div>
          <div style={{padding:"14px 16px",borderRadius:14,background:"rgba(255,255,255,0.02)",border:`1px solid ${T.border}`,marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:42,height:42,borderRadius:12,background:`${trail.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
              {trail.type==="paved"?"\u{1F6E4}\uFE0F":trail.type==="natural"?"\u{1F33F}":"\u{1F434}"}
            </div>
            <div>
              <p style={{fontSize:13,fontWeight:600,color:T.textHi,margin:0}}>Surface: {trail.surface}</p>
              <p style={{fontSize:11,color:T.textSec,margin:"3px 0 0"}}>
                {trail.type==="paved"?"Smooth concrete \u2014 suitable for wheelchairs, strollers, rollerblades":trail.type==="natural"?"Dirt & natural surface \u2014 trail shoes recommended":"Natural terrain \u2014 equestrian & hiking only"}
              </p>
            </div>
          </div>
        </div>}

        {/* ═══ CONDITIONS ═══ */}
        {expandedPanel==="conditions"&&<div>
          {trailConditions.length===0?<p style={{fontSize:13,color:T.textSec,textAlign:"center",padding:"32px 0"}}>No condition reports for this trail yet</p>:
          trailConditions.map((c,i)=>
            <div key={i} style={{padding:"14px 16px",borderRadius:14,background:"rgba(255,255,255,0.02)",border:`1px solid ${T.border}`,marginBottom:8,display:"flex",gap:14}}>
              <div style={{width:10,height:10,borderRadius:99,background:condColor(c.condition),flexShrink:0,marginTop:4}}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:600,color:condColor(c.condition)}}>{condLabel(c.condition)}</span>
                  <span style={{fontSize:10,color:T.textDim}}>{c.date}</span>
                  <span style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:"rgba(255,255,255,0.04)",color:T.textDim}}>{c.reporter}</span>
                </div>
                <p style={{fontSize:13,color:T.textBody,lineHeight:1.5,margin:0}}>{c.note}</p>
              </div>
            </div>
          )}
        </div>}

        {/* ═══ REVIEWS ═══ */}
        {expandedPanel==="reviews"&&<div>
          {trailReviews.length===0?<p style={{fontSize:13,color:T.textSec,textAlign:"center",padding:"32px 0"}}>No reviews for this trail yet</p>:
          trailReviews.map(r=>
            <div key={r.id} style={{padding:"16px",borderRadius:14,background:"rgba(255,255,255,0.02)",border:`1px solid ${T.border}`,marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:32,height:32,borderRadius:99,background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:T.textSec}}>{r.user[0]}</div>
                  <div>
                    <p style={{fontSize:13,fontWeight:600,color:T.textHi,margin:0}}>{r.user}</p>
                    <p style={{fontSize:10,color:T.textDim,margin:"1px 0 0"}}>{r.date}</p>
                  </div>
                </div>
                <Stars rating={r.rating} size={11}/>
              </div>
              <p style={{fontSize:13,color:T.textBody,lineHeight:1.6,margin:0}}>{r.text}</p>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:10}}>
                <button style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:99,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border}`,color:T.textSec,fontSize:10,cursor:"pointer"}}>{"\u{1F44D}"} Helpful ({r.helpful})</button>
              </div>
            </div>
          )}
        </div>}

        {/* ═══ NEARBY ═══ */}
        {expandedPanel==="nearby"&&<div>
          <p style={{fontSize:10,fontWeight:700,color:T.textSec,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 12px"}}>Nearby Trails in Omaha</p>
          {[
            {name:"Keystone Trail",dist:"Connects to multiple parks",mi:"14.4 mi",diff:"Easy",surface:"Paved"},
            {name:"West Papio Trail",dist:"South Omaha corridor",mi:"22.3 mi",diff:"Easy",surface:"Paved"},
            {name:"Big Papio Trail",dist:"East metro connector",mi:"12.8 mi",diff:"Easy",surface:"Paved"},
            {name:"MoPac Trail",dist:"East of downtown",mi:"8.5 mi",diff:"Easy",surface:"Paved/Crushed limestone"},
          ].map((t,i)=>
            <div key={i} style={{padding:"14px 16px",borderRadius:14,background:"rgba(255,255,255,0.02)",border:`1px solid ${T.border}`,marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <p style={{fontSize:14,fontWeight:600,color:T.textHi,margin:0}}>{t.name}</p>
                  <p style={{fontSize:11,color:T.textSec,margin:"3px 0 0"}}>{t.dist}</p>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:12,fontWeight:600,color:"#6BBF7A",margin:0}}>{t.mi}</p>
                  <p style={{fontSize:10,color:T.textDim,margin:"2px 0 0"}}>{t.diff} {"\u00b7"} {t.surface}</p>
                </div>
              </div>
            </div>
          )}
        </div>}

        {/* Action buttons */}
        <div style={{display:"flex",gap:8,margin:"24px 0 16px"}}>
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${trail.coords[0][0]},${trail.coords[0][1]}`} target="_blank" rel="noopener noreferrer" style={{flex:1,padding:"14px",borderRadius:99,background:`linear-gradient(135deg,${trail.color},${trail.color}cc)`,border:"none",color:T.bg,fontSize:12,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer",textAlign:"center",textDecoration:"none",display:"block"}}>
            {"\u{1F9ED}"} Navigate to Trailhead
          </a>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:32}}>
          <button onClick={()=>{if(navigator.share)navigator.share({title:`${trail.name} - ${parkName}`,url:window.location.href});}} style={{flex:1,padding:"12px",borderRadius:99,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border}`,color:T.textSec,fontSize:11,fontWeight:500,cursor:"pointer"}}>
            {"\u{1F4E4}"} Share
          </button>
          <button onClick={onBack} style={{flex:1,padding:"12px",borderRadius:99,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border}`,color:T.textSec,fontSize:11,fontWeight:500,cursor:"pointer"}}>
            {"\u2190"} Back to Park
          </button>
        </div>

        {/* Footer */}
        <div style={{textAlign:"center",paddingBottom:32,borderTop:`1px solid ${T.border}`,paddingTop:20}}>
          <p style={{fontSize:10,color:T.textDim,letterSpacing:0.6,margin:"0 0 4px"}}>Trail data: OpenStreetMap {"\u00b7"} Map tiles: &copy; OSM contributors</p>
          <p style={{fontSize:9,color:"rgba(235,230,220,0.2)",letterSpacing:0.4,margin:0}}>&copy; 2026 GO: Guide to Omaha</p>
        </div>
      </div>
    </div>
  );
}
