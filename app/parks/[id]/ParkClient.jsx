"use client";
import { useState } from "react";
import Link from "next/link";
import { T, CG } from "../../lib/design-tokens";
import { IC } from "../../lib/icons";
import { useResponsive } from "../../components/ResponsiveProvider";

export function ParkClient({ park }) {
  const { isM, isT, isD } = useResponsive();
  const [parkTab, setParkTab] = useState("overview");

  const mxW = isD ? 860 : isT ? 680 : 600;
  const px = isD ? 32 : isT ? 24 : 16;
  const pc = park.color || "#81C784";
  const mapsUrl = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

  const PTABS = [
    { id: "overview", label: "Overview", icon: IC.explore },
    park.trails?.length && { id: "trails", label: "Trails", icon: IC.trail },
    park.lake && { id: "fishing", label: "Fishing", icon: IC.fish },
    park.activities?.length && { id: "activities", label: "Activities", icon: IC.disc },
    { id: "info", label: "Info", icon: IC.info },
  ].filter(Boolean);

  const Head = ({ text, count, mt = 20, color }) => (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: `${mt}px 0 10px` }}>
      <h2 style={{ fontSize: 12, fontWeight: 600, color: color || T.textSec, letterSpacing: 2.5, textTransform: "uppercase", margin: 0 }}>{text}</h2>
      {count != null && <span style={{ fontSize: 11, color: T.textDim, letterSpacing: 1 }}>{count}</span>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans }}>
      <div style={{ maxWidth: mxW, margin: "0 auto" }}>

        {/* HERO IMAGE */}
        <div style={{ position: "relative", height: isD ? 280 : isM ? 220 : 250, overflow: "hidden", borderRadius: "0 0 24px 24px" }}>
          <img loading="lazy" src={park.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .45 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(20,22,24,.2) 0%,rgba(20,22,24,.95) 100%)" }} />
          <Link href="/" className="hbtn" style={{ position: "absolute", top: 16, left: 16, background: "rgba(20,22,24,.6)", backdropFilter: "blur(8px)", border: `1px solid ${T.border}`, borderRadius: 99, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: T.textBody, fontSize: 10, fontWeight: 600, letterSpacing: .5, textDecoration: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> Explore
          </Link>
          <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "5px 14px", borderRadius: 99, background: `${pc}22`, color: pc, border: `1px solid ${pc}33`, backdropFilter: "blur(12px)" }}>{"\uD83C\uDF3F"} Park</span>
            {park.admission && <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "5px 14px", borderRadius: 99, background: "rgba(20,22,24,.6)", color: T.text, border: "1px solid rgba(255,255,255,.12)", backdropFilter: "blur(12px)" }}>{park.admission}</span>}
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: `0 ${px}px 20px` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: pc, boxShadow: `0 0 12px ${pc}` }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: pc, letterSpacing: 2, textTransform: "uppercase" }}>{park.tagline || ""}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: isD ? 32 : 26, fontWeight: 300, color: T.textHi, letterSpacing: 1.5, lineHeight: 1.1 }}>{park.name}</h1>
            {park.nickname && <p style={{ fontSize: 13, color: "rgba(242,239,233,.6)", margin: "4px 0 0", fontStyle: "italic" }}>Locally known as &ldquo;{park.nickname}&rdquo;</p>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: isM ? 10 : 14, marginTop: 10 }}>
              {park.hours && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(242,239,233,.9)" }}>{IC.clock("rgba(242,239,233,.6)", 13)} {park.hours}</span>}
              {park.address && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(242,239,233,.9)" }}>{IC.pin("rgba(242,239,233,.6)", 13)} {park.address.split(",")[1]?.trim() || park.address}</span>}
            </div>
          </div>
        </div>

        <div style={{ padding: `0 ${px}px` }}>

          {/* STAT PILLS */}
          <div style={{ display: "flex", gap: 8, margin: "20px 0 24px", overflowX: "auto", paddingBottom: 2 }}>
            {[park.acreage && { label: "Acres", value: park.acreage.toLocaleString() }, park.lake && { label: "Lake", value: `${park.lake.acres} ac` }, park.lake && { label: "Depth", value: park.lake.maxDepth }, park.trails?.length && { label: "Trails", value: park.trails.length }].filter(Boolean).map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "14px 10px", flex: 1, minWidth: 80, background: "rgba(255,255,255,.03)", borderRadius: 14, border: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 10, color: T.textDim, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{s.label}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: T.textHi }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* TAB BAR */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24, overflowX: "auto", paddingBottom: 2 }}>
            {PTABS.map(t => (
              <button key={t.id} onClick={() => setParkTab(t.id)} className="hbtn" style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 99, cursor: "pointer", border: `1px solid ${parkTab === t.id ? pc + "44" : T.border}`, background: parkTab === t.id ? `${pc}15` : "rgba(255,255,255,.02)", color: parkTab === t.id ? pc : T.textSec, fontSize: 12, fontWeight: 600, letterSpacing: .5, whiteSpace: "nowrap", flexShrink: 0 }}>
                {t.icon(parkTab === t.id ? pc : T.textSec, 14)} {t.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {parkTab === "overview" && <div style={{ animation: "cardIn 0.3s ease both" }}>
            <p style={{ fontSize: 13, color: T.textBody, lineHeight: 1.7, margin: "0 0 20px", letterSpacing: .3 }}>{park.desc}</p>

            {/* Directions CTA */}
            <a href={mapsUrl(park.address)} target="_blank" rel="noopener noreferrer" className="cta" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "13px 0", borderRadius: 99, background: pc, color: T.bg, fontSize: 12, fontWeight: 700, textAlign: "center", textDecoration: "none", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>{IC.dir(T.bg, 14)} Get Directions</a>

            {/* Activities preview */}
            {park.activities?.length > 0 && <>
              <Head text="Things to Do" count={park.activities.length} color={pc} />
              <div style={{ display: "grid", gridTemplateColumns: isD ? "1fr 1fr" : "1fr", gap: 8, marginBottom: 24 }}>
                {park.activities.slice(0, 4).map((a, i) => {
                  const IconFn = IC[a.icon];
                  return <div key={i} className="ecard" style={{ padding: "16px 14px", borderRadius: 14, background: "rgba(255,255,255,.02)", border: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 11, background: `${pc}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{IconFn ? IconFn(pc, 18) : null}</div>
                      <div><p style={{ fontSize: 15, fontWeight: 600, color: T.textHi, margin: 0 }}>{a.name}</p>{a.season && <p style={{ fontSize: 10, color: T.textSec, margin: "2px 0 0", fontWeight: 500 }}>{a.season}</p>}</div>
                    </div>
                    <p style={{ fontSize: 12, color: T.textBody, lineHeight: 1.6, margin: 0 }}>{a.desc}</p>
                  </div>;
                })}
              </div>
              {park.activities.length > 4 && <button onClick={() => setParkTab("activities")} className="hbtn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "10px 0", borderRadius: 99, background: "rgba(255,255,255,.04)", border: `1px solid ${T.border}`, color: pc, fontSize: 11, fontWeight: 600, letterSpacing: .8, cursor: "pointer", marginBottom: 24 }}>View All {park.activities.length} Activities {IC.chev(pc, 12)}</button>}
            </>}

            {/* Trails preview */}
            {park.trails?.length > 0 && <>
              <Head text="Trails" count={park.trails.length} color={pc} />
              {park.trails.slice(0, 2).map((t, i) => {
                const dc = t.difficulty === "Easy" ? pc : t.difficulty === "Moderate" ? "#E8B54D" : T.red;
                return <div key={i} className="ecard" style={{ background: CG.park, borderRadius: 18, border: `1px solid ${T.border}`, padding: isM ? "18px 16px" : "20px 18px", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: T.textHi, margin: 0 }}>{t.name}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                        <span style={{ fontSize: 11, color: pc, fontWeight: 600 }}>{t.distance}</span>
                        <span style={{ color: T.textDim }}>{"\u00B7"}</span>
                        <span style={{ fontSize: 11, color: T.textSec }}>{t.surface}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: dc, background: `${dc}18`, padding: "4px 12px", borderRadius: 99, letterSpacing: .5, flexShrink: 0 }}>{t.difficulty}</span>
                  </div>
                  <p style={{ fontSize: 13, color: T.textBody, lineHeight: 1.65, margin: 0 }}>{t.desc}</p>
                </div>;
              })}
              {park.trails.length > 2 && <button onClick={() => setParkTab("trails")} className="hbtn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "10px 0", borderRadius: 99, background: "rgba(255,255,255,.04)", border: `1px solid ${T.border}`, color: pc, fontSize: 11, fontWeight: 600, letterSpacing: .8, cursor: "pointer", marginBottom: 16 }}>View All {park.trails.length} Trails {IC.chev(pc, 12)}</button>}
            </>}

            {/* Tags */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12, marginBottom: 24 }}>
              {park.tags.map(tag => <span key={tag} style={{ fontSize: 10, padding: "5px 12px", borderRadius: 99, background: `${pc}12`, border: `1px solid ${pc}25`, color: pc, fontWeight: 600, letterSpacing: .5 }}>{tag}</span>)}
            </div>
          </div>}

          {/* TRAILS TAB */}
          {parkTab === "trails" && park.trails && <div style={{ animation: "cardIn 0.3s ease both" }}>
            <Head text="Trails" count={park.trails.length} color={pc} />
            {park.trails.map((t, i) => {
              const dc = t.difficulty === "Easy" ? pc : t.difficulty === "Moderate" ? "#E8B54D" : T.red;
              return <div key={i} className="ecard" style={{ background: CG.park, borderRadius: 18, border: `1px solid ${T.border}`, padding: isM ? "18px 16px" : "20px 18px", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: T.textHi, margin: 0 }}>{t.name}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                      <span style={{ fontSize: 11, color: pc, fontWeight: 600 }}>{t.distance}</span>
                      <span style={{ color: T.textDim }}>{"\u00B7"}</span>
                      <span style={{ fontSize: 11, color: T.textSec }}>{t.surface}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: dc, background: `${dc}18`, padding: "4px 12px", borderRadius: 99, letterSpacing: .5, flexShrink: 0 }}>{t.difficulty}</span>
                </div>
                <p style={{ fontSize: 13, color: T.textBody, lineHeight: 1.65, margin: "0 0 12px" }}>{t.desc}</p>
                {t.features && <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {t.features.map(f => <span key={f} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 99, background: `${pc}0D`, border: `1px solid ${pc}25`, color: pc, fontWeight: 500 }}>{f}</span>)}
                </div>}
              </div>;
            })}
            <div style={{ background: `${pc}08`, borderRadius: 14, border: `1px solid ${pc}25`, padding: 16, marginTop: 16, marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: pc, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 10px" }}>Trail Tips</p>
              <div style={{ fontSize: 13, color: T.textBody, lineHeight: 1.7 }}>
                <p style={{ margin: "0 0 6px" }}>{"\u2022"} Check trail conditions after rain {"\u2014"} natural surface trails can be muddy</p>
                <p style={{ margin: "0 0 6px" }}>{"\u2022"} Bring water on longer loops {"\u2014"} stations may be seasonal</p>
                <p style={{ margin: 0 }}>{"\u2022"} Dogs must be leashed on all trails (6ft max)</p>
              </div>
            </div>
          </div>}

          {/* FISHING TAB */}
          {parkTab === "fishing" && park.lake && <div style={{ animation: "cardIn 0.3s ease both" }}>
            <Head text="Fishing" color="#5CA8D4" />
            <div style={{ background: CG.water, borderRadius: 18, border: `1px solid ${T.border}`, padding: isM ? "18px 14px" : "20px 18px", marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.textSec, letterSpacing: 2.5, textTransform: "uppercase", margin: "0 0 14px" }}>Species in the Lake</p>
              {park.lake.species.map((sp, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,.02)", border: `1px solid ${T.border}`, marginBottom: 8 }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{"\uD83D\uDC1F"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: T.textHi, margin: 0 }}>{sp.name}</p>
                    <p style={{ fontSize: 11, color: T.textSec, margin: "2px 0 0" }}>{sp.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(92,168,212,.06)", borderRadius: 14, border: "1px solid rgba(92,168,212,.18)", padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {IC.info("#5CA8D4", 16)}
                <p style={{ fontSize: 13, fontWeight: 600, color: T.textHi, margin: 0 }}>License Required</p>
              </div>
              <p style={{ fontSize: 13, color: T.textBody, lineHeight: 1.65, margin: "0 0 10px" }}>{park.lake.license}</p>
              {park.lake.licenseUrl && <a href={park.lake.licenseUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5CA8D4", fontWeight: 600, textDecoration: "none" }}>Get license at OutdoorNebraska.gov {IC.link("#5CA8D4", 12)}</a>}
            </div>
            {park.lake.spots && <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.textSec, letterSpacing: 2.5, textTransform: "uppercase", margin: "0 0 12px" }}>Where to Fish</p>
              {park.lake.spots.map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}><div style={{ width: 6, height: 6, borderRadius: 99, background: "#5CA8D4", flexShrink: 0 }} /><span style={{ fontSize: 13, color: T.textBody }}>{s}</span></div>)}
            </div>}
            {park.lake.rules && <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.textSec, letterSpacing: 2.5, textTransform: "uppercase", margin: "0 0 12px" }}>Fishing Rules</p>
              {park.lake.rules.map((r, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>{IC.info(T.textDim, 13)}<span style={{ fontSize: 13, color: T.textBody }}>{r}</span></div>)}
            </div>}
          </div>}

          {/* ACTIVITIES TAB */}
          {parkTab === "activities" && park.activities && <div style={{ animation: "cardIn 0.3s ease both" }}>
            <Head text="Things to Do" count={park.activities.length} color={pc} />
            <div style={{ display: "grid", gridTemplateColumns: isD ? "1fr 1fr" : "1fr", gap: 8, marginBottom: 24 }}>
              {park.activities.map((a, i) => {
                const IconFn = IC[a.icon];
                return <div key={i} className="ecard" style={{ padding: "16px 14px", borderRadius: 14, background: "rgba(255,255,255,.02)", border: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: `${pc}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{IconFn ? IconFn(pc, 18) : null}</div>
                    <div><p style={{ fontSize: 15, fontWeight: 600, color: T.textHi, margin: 0 }}>{a.name}</p>{a.season && <p style={{ fontSize: 10, color: T.textSec, margin: "2px 0 0", fontWeight: 500 }}>{a.season}</p>}</div>
                  </div>
                  <p style={{ fontSize: 12, color: T.textBody, lineHeight: 1.6, margin: 0 }}>{a.desc}</p>
                </div>;
              })}
            </div>
          </div>}

          {/* INFO TAB */}
          {parkTab === "info" && <div style={{ animation: "cardIn 0.3s ease both" }}>
            <Head text="Park Details" color={T.textHi} />
            <div style={{ marginBottom: 24 }}>
              {park.hours && <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `${pc}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>{IC.clock(pc, 16)}</div>
                <div><p style={{ fontSize: 10, color: T.textDim, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 3px" }}>Hours</p><p style={{ fontSize: 14, color: T.textHi, fontWeight: 500, margin: 0 }}>{park.hours}</p></div>
              </div>}
              {park.address && <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `${pc}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>{IC.pin(pc, 16)}</div>
                <div><p style={{ fontSize: 10, color: T.textDim, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 3px" }}>Address</p><p style={{ fontSize: 14, color: T.textHi, fontWeight: 500, margin: 0 }}>{park.address}</p></div>
              </div>}
              {park.phone && <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `${pc}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>{IC.phone(pc, 14)}</div>
                <div><p style={{ fontSize: 10, color: T.textDim, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 3px" }}>Phone</p><p style={{ fontSize: 14, color: T.textHi, fontWeight: 500, margin: 0 }}>{park.phone}</p></div>
              </div>}
              {park.website && <a href={park.website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `${pc}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>{IC.globe(pc, 14)}</div>
                <div style={{ flex: 1 }}><p style={{ fontSize: 10, color: T.textDim, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 3px" }}>Website</p><p style={{ fontSize: 14, color: T.textHi, fontWeight: 500, margin: 0 }}>{park.website.replace("https://", "")}</p></div>
                {IC.link(T.textDim, 12)}
              </a>}
            </div>

            {/* Entrances */}
            {park.entrances && <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.textSec, letterSpacing: 2.5, textTransform: "uppercase", margin: "0 0 12px" }}>Park Entrances</p>
              {park.entrances.map((e, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ width: 30, height: 30, borderRadius: 99, background: `${pc}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: pc }}>{e.num}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: T.textHi, margin: 0 }}>{e.name}</p>
                    <p style={{ fontSize: 11, color: T.textSec, margin: "2px 0 0" }}>{e.note}</p>
                  </div>
                </div>
              ))}
            </div>}

            {/* Amenities */}
            {park.amenities && <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.textSec, letterSpacing: 2.5, textTransform: "uppercase", margin: "0 0 12px" }}>Amenities</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {park.amenities.map(a => <span key={a} style={{ fontSize: 11, padding: "6px 13px", borderRadius: 99, background: "rgba(255,255,255,.03)", border: `1px solid ${T.border}`, color: T.textBody, fontWeight: 500 }}>{a}</span>)}
              </div>
            </div>}

            {/* Rules */}
            {(park.rules_allowed || park.rules_prohibited) && <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.textSec, letterSpacing: 2.5, textTransform: "uppercase", margin: "0 0 8px" }}>Park Rules</p>
              {park.rules_allowed?.map(r => <div key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                <div style={{ width: 22, height: 22, borderRadius: 99, flexShrink: 0, background: "rgba(107,191,122,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>{IC.check("#7DD4A0", 12)}</div>
                <span style={{ fontSize: 13, color: T.textBody }}>{r}</span>
              </div>)}
              {park.rules_prohibited?.map(r => <div key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                <div style={{ width: 22, height: 22, borderRadius: 99, flexShrink: 0, background: "rgba(232,54,79,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>{IC.x(T.red, 12)}</div>
                <span style={{ fontSize: 13, color: T.textBody }}>{r}</span>
              </div>)}
            </div>}
          </div>}

          {/* CTAs */}
          <a href={mapsUrl(park.address)} target="_blank" rel="noopener noreferrer" className="cta" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "16px 0", borderRadius: 99, textDecoration: "none", background: `linear-gradient(135deg,${pc},${pc}dd)`, color: T.bg, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", boxShadow: `0 4px 24px ${pc}33`, marginBottom: 12 }}>{IC.pin(T.bg, 16)} Get Directions</a>
          <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
            {park.website && <a href={park.website} target="_blank" rel="noopener noreferrer" className="hbtn" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 0", borderRadius: 99, background: "rgba(255,255,255,.04)", border: `1px solid ${T.border}`, color: T.text, fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", textDecoration: "none" }}>{IC.globe(T.textSec, 13)} Website</a>}
            <button onClick={() => { if (navigator.share) navigator.share({ title: park.name, url: window.location.href }).catch(() => {}); else navigator.clipboard?.writeText(window.location.href); }} className="hbtn" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 0", borderRadius: 99, background: "rgba(255,255,255,.04)", border: `1px solid ${T.border}`, color: T.text, fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", cursor: "pointer" }}>{IC.share(T.textSec, 13)} Share</button>
          </div>

          <div style={{ textAlign: "center", paddingBottom: 32, borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
            <p style={{ fontSize: 10, color: T.textDim, letterSpacing: .6, margin: "0 0 4px" }}>Park info subject to change {"\u00B7"} Verify details at venue websites</p>
            <p style={{ fontSize: 9, color: "rgba(235,230,220,.2)", letterSpacing: .4, margin: 0 }}>&copy; 2026 GO: Guide to Omaha</p>
          </div>

          <div style={{ height: 100 }} />
        </div>
      </div>
    </div>
  );
}
