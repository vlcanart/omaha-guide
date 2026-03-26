"use client";
import { useState } from "react";
import Link from "next/link";
import { T, CG, CA } from "../../lib/design-tokens";
import { IC } from "../../lib/icons";
import { mapsDir } from "../../lib/helpers";
import { useResponsive } from "../../components/ResponsiveProvider";
import { CompactHero } from "../../components/CompactHero";
import { VENUES } from "../../data/venues";
import { SEED_EVENTS } from "../../data/events";
import { INGESTED_EVENTS } from "../../events-data";

const EVENTS = [...SEED_EVENTS, ...(INGESTED_EVENTS || [])];

const Head = ({ text, count, mt = 20, color }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: `${mt}px 0 10px` }}>
    <h2 style={{ fontSize: 12, fontWeight: 600, color: color || T.textSec, letterSpacing: 2.5, textTransform: "uppercase", margin: 0 }}>{text}</h2>
    {count != null && <span style={{ fontSize: 11, color: T.textDim, letterSpacing: 1 }}>{count}</span>}
  </div>
);

export function NeighborhoodClient({ hood }) {
  const { isM, isT, isD } = useResponsive();
  const [spotCat, setSpotCat] = useState("all");

  const mxW = isD ? 860 : isT ? 680 : 600;
  const px = isD ? 32 : isT ? 24 : 16;

  const areaMap = {
    "old-market": ["Old Market", "Downtown"],
    "benson": ["Benson"],
    "dundee": ["Dundee", "Memorial Park"],
    "blackstone": ["Blackstone"],
    "north-downtown": ["North Downtown"],
    "little-italy": ["Little Italy", "Little Bohemia"],
    "aksarben": ["Aksarben"],
    "west-omaha": ["West Omaha", "La Vista"],
    "south-omaha": ["South Omaha"],
    "midtown": ["Central", "Midtown", "Capitol District"],
  };
  const hoodVenues = VENUES.filter(v => (areaMap[hood.id] || []).some(a => v.area.includes(a)));
  const hoodEvents = EVENTS.filter(ev => hoodVenues.some(v => v.name === ev.venue));
  const hImgs = hood.imgs || [hood.img];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans }}>
      <CompactHero />
      <div style={{ maxWidth: mxW, margin: "0 auto" }}>

        {/* -- HERO IMAGE -- */}
        <div style={{ position: "relative", height: isD ? 280 : isM ? 220 : 250, overflow: "hidden", borderRadius: "0 0 24px 24px" }}>
          <img loading="lazy" src={hImgs[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .45 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(20,22,24,.2) 0%,rgba(20,22,24,.95) 100%)" }} />
          <Link href="/" className="hbtn" style={{ position: "absolute", top: 16, left: 16, background: "rgba(20,22,24,.6)", backdropFilter: "blur(8px)", border: `1px solid ${T.border}`, borderRadius: 99, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: T.textBody, fontSize: 10, fontWeight: 600, letterSpacing: .5, textDecoration: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> Explore
          </Link>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: `0 ${px}px 20px` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: hood.color, boxShadow: `0 0 12px ${hood.color}` }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: hood.color, letterSpacing: 2, textTransform: "uppercase" }}>{hood.sub}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: isD ? 32 : 26, fontWeight: 300, color: T.textHi, letterSpacing: 1.5, lineHeight: 1.1 }}>{hood.name}</h1>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {hood.vibe && <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 99, background: `${hood.color}18`, border: `1px solid ${hood.color}33`, color: hood.color, fontWeight: 600, letterSpacing: .5 }}>{hood.vibe}</span>}
              {hood.bestFor && <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 99, background: "rgba(255,255,255,.06)", border: `1px solid ${T.border}`, color: T.textSec, fontWeight: 500 }}>Best for: {hood.bestFor}</span>}
            </div>
          </div>
        </div>

        <div style={{ padding: `0 ${px}px` }}>

          {/* -- ABOUT -- */}
          <p style={{ fontSize: 13, color: T.textBody, lineHeight: 1.7, margin: "20px 0 0", letterSpacing: .3 }}>{hood.desc}</p>

          {/* -- IMAGE CAROUSEL -- */}
          {hImgs.length > 1 && <div style={{ display: "flex", gap: 8, overflowX: "auto", margin: "16px 0", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
            {hImgs.map((img, i) => <div key={i} style={{ width: isD ? 200 : isM ? 150 : 170, height: isD ? 130 : isM ? 100 : 110, borderRadius: 14, overflow: "hidden", flexShrink: 0, border: `1px solid ${T.border}` }}>
              <img loading="lazy" src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .65 }} />
            </div>)}
          </div>}

          {/* -- DIRECTIONS CTA -- */}
          <a href={mapsDir(hood.lat, hood.lng)} target="_blank" rel="noopener noreferrer" className="cta" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "13px 0", borderRadius: 99, background: hood.color, color: T.bg, fontSize: 12, fontWeight: 700, textAlign: "center", textDecoration: "none", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 8 }}>{IC.dir(T.bg, 14)} Get Directions</a>

          {/* -- WALKING PATH -- */}
          {hood.walk && <div style={{ marginTop: 24 }}>
            <Head text={hood.walk.name} color={hood.color} />
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,.06)", color: T.textSec, fontWeight: 600 }}>{hood.walk.distance}</span>
              <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,.06)", color: T.textSec, fontWeight: 600 }}>{hood.walk.time}</span>
            </div>
            <div style={{ position: "relative", paddingLeft: 20 }}>
              <div style={{ position: "absolute", left: 6, top: 4, bottom: 4, width: 2, background: `${hood.color}33`, borderRadius: 2 }} />
              {hood.walk.steps.map((step, i) => <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, position: "relative" }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: i === 0 || i === hood.walk.steps.length - 1 ? hood.color : `${hood.color}44`, border: `2px solid ${hood.color}`, flexShrink: 0, marginTop: 1, position: "absolute", left: -7 }} />
                <p style={{ margin: 0, fontSize: 12, color: i === 0 ? T.textHi : T.textBody, lineHeight: 1.5, paddingLeft: 16, fontWeight: i === 0 ? 600 : 400 }}>{step}</p>
              </div>)}
            </div>
          </div>}

          {/* -- DIRECTORY: restaurants, bars, shops, entertainment -- */}
          {hood.spots && hood.spots.length > 0 && (() => {
            const SCATS = [{ id: "all", label: "All", icon: "\u2726" }, { id: "eat", label: "Eat", icon: "\uD83C\uDF7D\uFE0F" }, { id: "drink", label: "Drink", icon: "\uD83C\uDF78" }, { id: "sweet", label: "Coffee & Sweets", icon: "\u2615" }, { id: "shop", label: "Shop", icon: "\uD83D\uDECD\uFE0F" }, { id: "play", label: "Do", icon: "\uD83C\uDFAC" }];
            const filtered = spotCat === "all" ? hood.spots : hood.spots.filter(s => s.cat === spotCat);
            return <div style={{ marginTop: 24 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "0 0 10px" }}>
                <h2 style={{ fontSize: isD ? 22 : 18, fontWeight: 300, color: T.textHi, letterSpacing: 1.5, margin: 0 }}>{hood.name} <span style={{ color: hood.color, fontWeight: 300 }}>Directory</span></h2>
                <span style={{ fontSize: 11, color: T.textDim, letterSpacing: 1 }}>{filtered.length}</span>
              </div>
              <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch", marginBottom: 4 }}>
                {SCATS.map(c => { const active = spotCat === c.id; const cnt = c.id === "all" ? hood.spots.length : hood.spots.filter(s => s.cat === c.id).length; if (cnt === 0 && c.id !== "all") return null; return (
                  <button key={c.id} onClick={() => setSpotCat(c.id)} className="pill" style={{ padding: "6px 12px", borderRadius: 99, background: active ? `${hood.color}18` : "rgba(255,255,255,.05)", border: `1px solid ${active ? hood.color + "44" : T.border}`, color: active ? hood.color : T.textSec, cursor: "pointer", fontSize: 10, fontWeight: active ? 600 : 500, whiteSpace: "nowrap", letterSpacing: .8, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 12 }}>{c.icon}</span>{c.label}<span style={{ fontSize: 9, color: active ? hood.color : T.textDim, marginLeft: 2 }}>({cnt})</span>
                  </button>); })}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isD ? "1fr 1fr" : "1fr", gap: 6 }}>
                {filtered.map((spot, i) => {
                  const card = <div key={i} className="ecard" style={{ background: CG._, borderRadius: 16, border: `1px solid ${T.border}`, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{spot.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.textHi }}>{spot.name}</h4>
                          {spot.price && <span style={{ fontSize: 9, color: T.textDim, fontWeight: 500 }}>{spot.price}</span>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                          <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 99, background: `${hood.color}15`, color: hood.color, fontWeight: 600, letterSpacing: .4, textTransform: "uppercase" }}>{spot.type}</span>
                          {spot.addr && <span style={{ fontSize: 10, color: T.textDim, letterSpacing: .3 }}>{spot.addr}</span>}
                        </div>
                        <p style={{ margin: "5px 0 0", fontSize: 12, color: T.textBody, lineHeight: 1.45 }}>{spot.desc}</p>
                        {spot.known && <p style={{ margin: "4px 0 0", fontSize: 10, color: T.textSec, letterSpacing: .3, fontStyle: "italic" }}>Known for: {spot.known}</p>}
                      </div>
                    </div>
                  </div>;
                  return spot.url ? <a key={i} href={spot.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>{card}</a> : card;
                })}
              </div>
            </div>;
          })()}

          {/* -- VENUES -- */}
          {hoodVenues.length > 0 && <div style={{ marginTop: 24 }}>
            <Head text={"Venues in " + hood.name} count={hoodVenues.length} color={hood.color} />
            {hoodVenues.map((v, i) => (
              <Link key={v.id} href={"/venues/" + v.id + "/"} className="ecard" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit", background: CG._, borderRadius: 16, border: `1px solid ${T.border}`, padding: "12px 14px", marginBottom: 6 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,.05)" }}>
                  <img loading="lazy" src={v.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .6 }} onError={e => { e.target.style.display = "none" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.textHi }}>{v.name}</h4>
                  <p style={{ margin: "1px 0 0", fontSize: 10, color: T.textSec, letterSpacing: .5 }}>{v.type} {"\u00b7"} {v.cap}</p>
                </div>
                {IC.chev(T.textDim, 16)}
              </Link>
            ))}
          </div>}

          {/* -- HISTORY -- */}
          {hood.history && <div style={{ marginTop: 24 }}>
            <Head text="History" color={T.textSec} />
            <div style={{ background: CG._, borderRadius: 18, border: `1px solid ${T.border}`, padding: isM ? "14px 16px" : "18px 22px" }}>
              <p style={{ margin: 0, fontSize: 13, color: T.textBody, lineHeight: 1.8, letterSpacing: .3 }}>{hood.history}</p>
            </div>
          </div>}

          {/* -- TAGS -- */}
          <div style={{ display: "flex", gap: 5, marginTop: 20, flexWrap: "wrap" }}>
            {hood.tags.map(tag => <span key={tag} style={{ fontSize: 9, padding: "4px 10px", borderRadius: 99, background: `${hood.color}12`, border: `1px solid ${hood.color}25`, color: hood.color, fontWeight: 600, letterSpacing: .5 }}>{tag}</span>)}
          </div>

          <div style={{ height: 100 }} />
        </div>
      </div>
    </div>
  );
}
