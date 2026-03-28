"use client";
import { useState } from "react";
import Link from "next/link";
import { T, CG } from "../lib/design-tokens";
import { IC } from "../lib/icons";
import { useResponsive } from "../components/ResponsiveProvider";
import { BottomNav } from "../components/BottomNav";
import {
  ZOO_INFO, ZOO_SEASONS, getCurrentSeason, ZOO_PRICING,
  ZOO_EXHIBITS, EXHIBIT_CATS, ZOO_RIDES, ZOO_IMAX,
  ZOO_EVENTS, ZOO_DINING, ZOO_TIPS,
} from "../data/zoo";

/* ── Theme ── */
const ac = "#FFB74D";
const acSoft = "rgba(255,183,77,.10)";
const zooGrad = "linear-gradient(135deg,#1E2420 0%,#262E28 60%,#202824 100%)";
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ZOO_INFO.name + " " + ZOO_INFO.address)}`;

const Head = ({ text, count, mt = 24 }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: `${mt}px 0 10px` }}>
    <h2 style={{ fontSize: 12, fontWeight: 600, color: ac, letterSpacing: 2.5, textTransform: "uppercase", margin: 0 }}>{text}</h2>
    {count != null && <span style={{ fontSize: 11, color: T.textDim, letterSpacing: 1 }}>{count}</span>}
  </div>
);

export function ZooClient() {
  const { isM, isT, isD } = useResponsive();
  const [exCat, setExCat] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [showAllDining, setShowAllDining] = useState(false);
  const [showAllPricing, setShowAllPricing] = useState(false);

  const mxW = isD ? 860 : isT ? 680 : 600;
  const px = isD ? 32 : isT ? 24 : 16;
  const season = getCurrentSeason();
  const filteredEx = exCat === "all" ? ZOO_EXHIBITS : ZOO_EXHIBITS.filter(e => e.cat === exCat);
  const diningToShow = showAllDining ? ZOO_DINING : ZOO_DINING.filter(d => d.featured);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans, paddingBottom: 80 }}>
      <div style={{ maxWidth: mxW, margin: "0 auto" }}>

        {/* ═══════ HERO ═══════ */}
        <div style={{ position: "relative", height: isD ? 340 : isM ? 280 : 300, overflow: "hidden", borderRadius: "0 0 24px 24px" }}>
          <img loading="lazy" src={ZOO_INFO.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .45 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(20,22,24,.15) 0%,rgba(20,22,24,.95) 100%)" }} />

          {/* Back */}
          <Link href="/" className="hbtn" style={{ position: "absolute", top: 16, left: 16, background: "rgba(20,22,24,.6)", backdropFilter: "blur(8px)", border: `1px solid ${T.border}`, borderRadius: 99, padding: "8px 12px", display: "flex", alignItems: "center", gap: 6, color: T.textBody, fontSize: 10, fontWeight: 600, letterSpacing: .5, textDecoration: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> Back
          </Link>

          {/* Badges */}
          <div style={{ position: "absolute", top: 12, right: 14, display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "4px 10px", borderRadius: 99, background: "rgba(212,173,101,.18)", color: T.gold, border: "1px solid rgba(212,173,101,.3)" }}>{ZOO_INFO.badge}</span>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "4px 10px", borderRadius: 99, background: `${ac}18`, color: ac, border: `1px solid ${ac}33` }}>{season.label} Hours</span>
          </div>

          {/* Title */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: `0 ${px}px 20px` }}>
            <h1 style={{ margin: 0, fontSize: isD ? 30 : isM ? 24 : 27, fontWeight: 700, color: T.textHi, lineHeight: 1.15 }}>Henry Doorly Zoo<br /><span style={{ fontWeight: 300, fontSize: isD ? 22 : isM ? 17 : 20, opacity: .85 }}>& Aquarium</span></h1>
            <p style={{ margin: "6px 0 0", fontSize: 11, color: T.textSec }}>{ZOO_INFO.address} · <span style={{ color: T.green, fontWeight: 600 }}>{season.grounds}</span></p>
          </div>
        </div>

        <div style={{ padding: `0 ${px}px` }}>

          {/* ═══════ QUICK STATS ═══════ */}
          <div style={{ display: "flex", gap: 8, margin: "16px 0", overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
            {[
              { val: "160", unit: "Acres" },
              { val: "17K+", unit: "Animals" },
              { val: "962", unit: "Species" },
              { val: "#1", unit: "in World" },
            ].map((s, i) => (
              <div key={i} style={{ flexShrink: 0, padding: "12px 16px", borderRadius: 14, textAlign: "center", background: zooGrad, border: `1px solid ${T.border}`, minWidth: 80 }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: ac, margin: "0 0 2px" }}>{s.val}</p>
                <p style={{ fontSize: 9, color: T.textSec, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>{s.unit}</p>
              </div>
            ))}
          </div>

          {/* Blurb */}
          <p style={{ fontSize: 13, color: T.textBody, lineHeight: 1.7, margin: "0 0 4px", letterSpacing: .3 }}>{ZOO_INFO.blurb}</p>
          <p style={{ fontSize: 11, color: T.gold, fontWeight: 600, margin: "0 0 16px", letterSpacing: .4 }}>{ZOO_INFO.badgeSub}</p>

          {/* ═══════ HOURS & PRICING ═══════ */}
          <Head text="Hours & Admission" />
          <div style={{ background: zooGrad, borderRadius: 18, border: `1px solid ${T.border}`, padding: "16px", marginBottom: 8 }}>
            {/* Current season */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.green, boxShadow: `0 0 10px ${T.green}` }} />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.textHi }}>Current: {season.label} ({season.dates})</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: T.textBody }}>Grounds {season.grounds} · Buildings {season.buildings}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {ZOO_SEASONS.map(s => (
                <div key={s.id} style={{ flex: "1 1 45%", minWidth: 140, padding: "8px 12px", borderRadius: 12, background: s.id === season.id ? `${T.green}10` : "rgba(255,255,255,.02)", border: `1px solid ${s.id === season.id ? T.green + "30" : "rgba(255,255,255,.04)"}` }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: s.id === season.id ? T.green : T.textDim, letterSpacing: 1, textTransform: "uppercase" }}>{s.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: T.textBody }}>{s.dates}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 11, color: T.textSec }}>{s.grounds}</p>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
              <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: T.textSec, letterSpacing: 2, textTransform: "uppercase" }}>Admission</p>
              {ZOO_PRICING.seasons.map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: i > 0 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: T.textHi }}>{p.label}</p>
                    <p style={{ margin: "1px 0 0", fontSize: 10, color: T.textDim }}>{p.dates}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: 12, color: ac, fontWeight: 600 }}>{p.adult}</p>
                    <p style={{ margin: "1px 0 0", fontSize: 10, color: T.textSec }}>Kids {p.child} · Senior {p.senior}</p>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
                {ZOO_PRICING.notes.map((n, i) => (
                  <span key={i} style={{ fontSize: 9, padding: "3px 9px", borderRadius: 99, background: "rgba(125,212,160,.08)", color: T.green, fontWeight: 600 }}>{n}</span>
                ))}
              </div>
            </div>

            {/* Membership CTA */}
            {showAllPricing && <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, marginTop: 12 }}>
              <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: T.textSec, letterSpacing: 2, textTransform: "uppercase" }}>Memberships</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {ZOO_PRICING.membership.map((m, i) => (
                  <div key={i} style={{ padding: "8px 12px", borderRadius: 12, background: "rgba(255,255,255,.02)", border: `1px solid ${T.border}` }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: T.textHi }}>{m.type}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: ac }}>{m.price}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
                {ZOO_PRICING.memberPerks.map((p, i) => (
                  <span key={i} style={{ fontSize: 9, padding: "3px 9px", borderRadius: 99, background: `${ac}08`, border: `1px solid ${ac}22`, color: T.textBody }}>{p}</span>
                ))}
              </div>
            </div>}
            <button onClick={() => setShowAllPricing(!showAllPricing)} style={{ display: "flex", alignItems: "center", gap: 4, margin: "10px auto 0", padding: "6px 14px", borderRadius: 99, background: "rgba(255,255,255,.04)", border: `1px solid ${T.border}`, color: T.textSec, fontSize: 10, fontWeight: 600, cursor: "pointer", letterSpacing: .8, textTransform: "uppercase" }}>
              {showAllPricing ? "Less" : "Memberships & Perks"}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showAllPricing ? "rotate(180deg)" : "none", transition: "transform .2s" }}><polyline points="6 9 12 15 18 9" /></svg>
            </button>
          </div>

          {/* ═══════ EXHIBITS ═══════ */}
          <Head text="Exhibits" count={filteredEx.length} />
          <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch", marginBottom: 6 }}>
            {EXHIBIT_CATS.map(c => {
              const active = exCat === c.id;
              const cnt = c.id === "all" ? ZOO_EXHIBITS.length : ZOO_EXHIBITS.filter(e => e.cat === c.id).length;
              return (
                <button key={c.id} onClick={() => setExCat(c.id)} className="pill" style={{ padding: "6px 12px", borderRadius: 99, background: active ? `${ac}18` : "rgba(255,255,255,.05)", border: `1px solid ${active ? ac + "44" : T.border}`, color: active ? ac : T.textSec, cursor: "pointer", fontSize: 10, fontWeight: active ? 600 : 500, whiteSpace: "nowrap", letterSpacing: .8, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                  {c.label}<span style={{ fontSize: 9, color: active ? ac : T.textDim, marginLeft: 2 }}>({cnt})</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isD ? "1fr 1fr" : "1fr", gap: 8 }}>
            {filteredEx.map((ex) => {
              const open = expanded === ex.id;
              return (
                <div key={ex.id} onClick={() => setExpanded(open ? null : ex.id)} className="ecard" style={{ background: zooGrad, borderRadius: 18, border: `1px solid ${open ? ac + "44" : T.border}`, overflow: "hidden", cursor: "pointer" }}>
                  {/* Image / Icon */}
                  <div style={{ position: "relative", height: open ? 140 : 100, overflow: "hidden" }}>
                    <div style={{ width: "100%", height: "100%", background: ex.cat === "indoor" ? "linear-gradient(135deg,rgba(100,181,246,.08),rgba(30,36,32,.95))" : ex.cat === "interactive" ? "linear-gradient(135deg,rgba(129,199,132,.08),rgba(30,36,32,.95))" : "linear-gradient(135deg,rgba(255,183,77,.08),rgba(30,36,32,.95))" }} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 16, opacity: .25, fontSize: open ? 64 : 48 }}>{ex.icon}</div>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(30,36,32,.1) 0%,rgba(30,36,32,.85) 100%)" }} />
                    <div style={{ position: "absolute", top: 8, left: 10, display: "flex", gap: 5 }}>
                      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "3px 8px", borderRadius: 99, background: ex.cat === "indoor" ? "rgba(100,181,246,.15)" : ex.cat === "interactive" ? "rgba(129,199,132,.15)" : "rgba(255,183,77,.15)", color: ex.cat === "indoor" ? "#64B5F6" : ex.cat === "interactive" ? "#81C784" : ac }}>{ex.cat === "indoor" ? "Indoor" : ex.cat === "interactive" ? "Interactive" : "Outdoor"}</span>
                      {ex.award && <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, padding: "3px 8px", borderRadius: 99, background: "rgba(212,173,101,.15)", color: T.gold }}>{ex.award}</span>}
                    </div>
                    <div style={{ position: "absolute", bottom: 8, left: 10, right: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.textHi, lineHeight: 1.2 }}>{ex.name}</h3>
                          <p style={{ margin: "2px 0 0", fontSize: 10, color: ac, fontWeight: 600, letterSpacing: .5 }}>{ex.tagline}</p>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="2" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded */}
                  {open && (
                    <div style={{ padding: "14px 14px 16px" }}>
                      <p style={{ fontSize: 12, color: T.textBody, lineHeight: 1.6, margin: "0 0 10px" }}>{ex.desc}</p>
                      {ex.animals && <div style={{ marginBottom: 10 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, color: T.textDim, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 5px" }}>Key Animals</p>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {ex.animals.map((a, i) => <span key={i} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 99, background: `${ac}08`, border: `1px solid ${ac}18`, color: T.textBody }}>{a}</span>)}
                        </div>
                      </div>}
                      {ex.highlights && ex.highlights.map((h, i) => (
                        <div key={i} style={{ display: "flex", gap: 6, padding: "3px 0" }}>
                          <span style={{ width: 4, height: 4, borderRadius: 99, background: ac, flexShrink: 0, marginTop: 6, opacity: .5 }} />
                          <p style={{ margin: 0, fontSize: 11, color: T.textSec, lineHeight: 1.4 }}>{h}</p>
                        </div>
                      ))}
                      {ex.note && <p style={{ margin: "8px 0 0", fontSize: 10, color: T.red, fontWeight: 600, letterSpacing: .3 }}>⚠ {ex.note}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ═══════ RIDES & ATTRACTIONS ═══════ */}
          <Head text="Rides & Attractions" count={ZOO_RIDES.length} />
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory" }}>
            {ZOO_RIDES.map(r => (
              <div key={r.id} className="ecard" style={{ background: zooGrad, borderRadius: 18, border: `1px solid ${T.border}`, padding: "16px", width: isD ? 260 : isM ? 220 : 240, minWidth: isD ? 260 : isM ? 220 : 240, flexShrink: 0, scrollSnapAlign: "start", opacity: r.open ? 1 : .65 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.textHi }}>{r.name}</h3>
                    <div style={{ display: "flex", gap: 5, marginTop: 3 }}>
                      <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 99, background: r.open ? "rgba(125,212,160,.12)" : "rgba(232,54,79,.12)", color: r.open ? T.green : T.red, fontWeight: 600 }}>{r.open ? "Open" : "Seasonal"}</span>
                      <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 99, background: `${ac}12`, color: ac, fontWeight: 600 }}>{r.price}</span>
                    </div>
                  </div>
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: T.textBody, lineHeight: 1.45 }}>{r.desc}</p>
                <p style={{ margin: 0, fontSize: 10, color: T.textDim }}>{r.hours}</p>
                {r.note && <p style={{ margin: "4px 0 0", fontSize: 10, color: T.textSec, fontStyle: "italic" }}>{r.note}</p>}
              </div>
            ))}
          </div>

          {/* ═══════ IMAX THEATER ═══════ */}
          <Head text="IMAX Theater" />
          <div style={{ background: zooGrad, borderRadius: 18, border: `1px solid ${T.border}`, padding: "16px", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ac} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /><line x1="17" y1="17" x2="22" y2="17" /></svg>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.textHi }}>{ZOO_IMAX.name}</h3>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: T.textSec }}>{ZOO_IMAX.hours}</p>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.green }}>FREE for members</p>
                <p style={{ margin: "1px 0 0", fontSize: 10, color: T.textSec }}>{ZOO_IMAX.pricing.nonMember} non-members</p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: T.textBody, lineHeight: 1.6, margin: "0 0 12px" }}>{ZOO_IMAX.desc}</p>

            {/* Films */}
            <p style={{ fontSize: 9, fontWeight: 700, color: T.textDim, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 8px" }}>Now Showing</p>
            {ZOO_IMAX.films.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderTop: i > 0 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${ac}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ac} strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.textHi }}>{f.title}</h4>
                  <p style={{ margin: "3px 0 0", fontSize: 11, color: T.textBody, lineHeight: 1.45 }}>{f.desc}</p>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 10 }}>
              {ZOO_IMAX.specs.map((s, i) => (
                <span key={i} style={{ fontSize: 9, padding: "3px 9px", borderRadius: 99, background: "rgba(255,255,255,.04)", border: `1px solid ${T.border}`, color: T.textSec, fontWeight: 500 }}>{s}</span>
              ))}
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 10, color: T.textDim, fontStyle: "italic" }}>{ZOO_IMAX.note}</p>
          </div>

          {/* ═══════ EVENTS & SEASONAL ═══════ */}
          <Head text="Events & Seasonal" count={ZOO_EVENTS.length} />
          <div style={{ display: "grid", gridTemplateColumns: isD ? "1fr 1fr" : "1fr", gap: 8 }}>
            {ZOO_EVENTS.map(ev => (
              <div key={ev.id} className="ecard" style={{ background: zooGrad, borderRadius: 16, border: `1px solid ${T.border}`, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.textHi }}>{ev.name}</h4>
                      <span style={{ fontSize: 8, padding: "2px 7px", borderRadius: 99, background: `${ac}15`, color: ac, fontWeight: 600, letterSpacing: .5 }}>{ev.tag}</span>
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: 10, fontWeight: 600, color: ac, letterSpacing: .5 }}>{ev.when} · {ev.time}</p>
                    <p style={{ margin: "5px 0 0", fontSize: 12, color: T.textBody, lineHeight: 1.45 }}>{ev.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ═══════ DINING ═══════ */}
          <Head text="Dining" count={ZOO_DINING.length} />
          <p style={{ fontSize: 11, color: T.textSec, margin: "-4px 0 10px", letterSpacing: .3 }}>13 dining locations · Outside food welcome · Picnic areas available</p>
          <div style={{ display: "grid", gridTemplateColumns: isD ? "1fr 1fr" : "1fr", gap: 6 }}>
            {diningToShow.map((d, i) => (
              <div key={i} className="ecard" style={{ background: zooGrad, borderRadius: 16, border: `1px solid ${T.border}`, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.textHi }}>{d.name}</h4>
                    <p style={{ margin: "2px 0 0", fontSize: 10, color: T.textDim }}>{d.location} · {d.hours}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: T.textBody, lineHeight: 1.4 }}>{d.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setShowAllDining(!showAllDining)} className="hbtn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, width: "100%", margin: "8px 0 0", padding: "10px 0", borderRadius: 99, background: "rgba(255,255,255,.04)", border: `1px solid ${T.border}`, color: T.textSec, fontSize: 10, fontWeight: 600, cursor: "pointer", letterSpacing: .8, textTransform: "uppercase" }}>
            {showAllDining ? "Show Featured Only" : `Show All ${ZOO_DINING.length} Dining Spots`}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showAllDining ? "rotate(180deg)" : "none", transition: "transform .2s" }}><polyline points="6 9 12 15 18 9" /></svg>
          </button>

          {/* ═══════ VISITOR TIPS ═══════ */}
          <Head text="Visitor Tips" count={ZOO_TIPS.length} />
          <div style={{ display: "grid", gridTemplateColumns: isD ? "1fr 1fr" : "1fr", gap: 6 }}>
            {ZOO_TIPS.map((tip, i) => (
              <div key={i} style={{ background: zooGrad, borderRadius: 16, border: `1px solid ${T.border}`, padding: "14px 14px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.textHi }}>{tip.title}</h4>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: T.textBody, lineHeight: 1.5 }}>{tip.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ═══════ CTAs ═══════ */}
          <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="cta" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 0", borderRadius: 99, textDecoration: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.accent}dd)`, color: T.bg, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", boxShadow: `0 4px 20px rgba(94,196,182,.3)` }}>
              {IC.dir(T.bg, 14)} Get Directions
            </a>
            <a href={ZOO_INFO.web} target="_blank" rel="noopener noreferrer" className="hbtn" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 20px", borderRadius: 99, textDecoration: "none", background: "rgba(255,255,255,.04)", border: `1px solid ${T.border}`, color: T.text, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
              Website
            </a>
          </div>

          {/* Membership CTA */}
          <a href="https://omahazoo.com/become-a-member" target="_blank" rel="noopener noreferrer" className="ecard" style={{ display: "block", marginTop: 12, padding: "16px 18px", borderRadius: 18, textDecoration: "none", color: "inherit", background: `linear-gradient(135deg, rgba(255,183,77,.08), rgba(212,173,101,.06))`, border: `1px solid ${ac}25` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ac} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" /></svg>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.textHi }}>Become a Member</h3>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: ac, fontWeight: 600 }}>Starting at $109/yr · Pays for itself in 3 visits</p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: T.textBody }}>Unlimited visits, free IMAX, 50+ zoo reciprocals</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          </a>

          {/* Footer */}
          <div style={{ textAlign: "center", paddingTop: 24, paddingBottom: 20, borderTop: `1px solid ${T.border}`, marginTop: 24 }}>
            <p style={{ fontSize: 10, color: T.textDim, letterSpacing: .6, margin: "0 0 4px" }}>Hours, pricing & exhibits subject to change · Verify at omahazoo.com</p>
            <p style={{ fontSize: 9, color: "rgba(235,230,220,.2)", letterSpacing: .4, margin: 0 }}>&copy; 2026 GO: Guide to Omaha</p>
          </div>

          <div style={{ height: 60 }} />
        </div>
      </div>
      <BottomNav active="explore" />
    </div>
  );
}
