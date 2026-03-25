"use client";
import Link from "next/link";
import { T } from "../../lib/design-tokens";
import { IC } from "../../lib/icons";
import { useResponsive } from "../../components/ResponsiveProvider";

const CA = { concerts: "#5EC4B6", sports: "#64B5F6", festivals: "#CE93D8", family: "#81C784", arts: "#B39DDB", comedy: "#FFB74D" };
const CGrad = {
  concerts: "linear-gradient(135deg,#1A2E32 0%,#213740 60%,#1C3035 100%)",
  sports: "linear-gradient(135deg,#1A2430 0%,#21303E 60%,#1C2836 100%)",
  arts: "linear-gradient(135deg,#271F30 0%,#30263A 60%,#292134 100%)",
  comedy: "linear-gradient(135deg,#2D2518 0%,#3A2F1E 60%,#332A1C 100%)",
  _: "linear-gradient(135deg,#1E2024 0%,#262A2E 60%,#202428 100%)",
};
const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const WDAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
function slugify(t, id) { return (t||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60)+"-"+id; }
function parseDate(d) { if(!d||!d.match(/^\d{4}/))return null; const dt=new Date(d+"T12:00:00"); return{day:dt.getDate(),month:MONTHS[dt.getMonth()],weekday:WDAYS[dt.getDay()]}; }

export function GalleryClient({ gallery, events = [], contentImage }) {
  const { isM, isT, isD } = useResponsive();
  const mxW = isD ? 860 : isT ? 680 : 600;
  const px = isD ? 32 : isT ? 24 : 16;
  const ac = "#B39DDB";
  const artGrad = "linear-gradient(135deg,#271F30 0%,#30263A 60%,#292134 100%)";
  const today = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
  const todayH = gallery.hours?.find(h => h.day === today);
  const isOpen = todayH && !todayH.closed;
  const isLateNight = todayH?.late;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gallery.name + " " + gallery.address)}`;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans }}>
      <div style={{ maxWidth: mxW, margin: "0 auto" }}>

        {/* HERO IMAGE */}
        <div style={{ position: "relative", height: isD ? 280 : isM ? 220 : 250, overflow: "hidden", borderRadius: "0 0 24px 24px" }}>
          <img src={contentImage || gallery.img} alt={gallery.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .55 }} onError={e => { if (contentImage) { e.target.src = gallery.img; e.target.onerror = null; } }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(39,31,48,.2) 0%,rgba(39,31,48,.85) 100%)" }} />

          {/* Back button */}
          <Link href="/" className="hbtn" style={{ position: "absolute", top: 16, left: 16, background: "rgba(20,22,24,.6)", backdropFilter: "blur(8px)", border: `1px solid ${T.border}`, borderRadius: 99, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: T.textBody, fontSize: 10, fontWeight: 600, letterSpacing: .5, textDecoration: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> Back
          </Link>

          {/* Badges */}
          <div style={{ position: "absolute", top: 10, right: 12, display: "flex", gap: 6 }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "3px 9px", borderRadius: 99, background: `${ac}25`, color: ac, border: `1px solid ${ac}40` }}>{gallery.type}</span>
            {gallery.admissionFree && <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "3px 9px", borderRadius: 99, background: "rgba(125,212,160,.15)", color: T.green, border: "1px solid rgba(125,212,160,.25)" }}>Free</span>}
            {gallery.badge && <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "3px 9px", borderRadius: 99, background: "rgba(212,173,101,.15)", color: T.gold, border: "1px solid rgba(212,173,101,.25)" }}>{gallery.badge}</span>}
          </div>

          {/* Title area */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: `0 ${px}px 16px` }}>
            <h1 style={{ fontSize: isD ? 28 : 22, fontWeight: 700, color: T.textHi, margin: "0 0 4px", lineHeight: 1.2 }}>{gallery.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: T.venue }}>{gallery.neighborhood}</span>
              {todayH && <span style={{ fontSize: 9, fontWeight: 600, color: isOpen ? T.green : T.red }}>{isOpen ? `Open today ${todayH.hours}` : "Closed today"}{isLateNight ? " \u2022 Late night" : ""}</span>}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: `20px ${px}px 0` }}>

          {/* Description */}
          <p style={{ fontSize: 13, color: T.textBody, lineHeight: 1.7, margin: "0 0 18px" }}>{gallery.blurb}</p>

          {/* Address + contact */}
          <div style={{ padding: "14px", borderRadius: 14, marginBottom: 16, background: "rgba(255,255,255,.02)", border: `1px solid ${T.border}` }}>
            <p style={{ fontSize: 12, color: T.textHi, margin: "0 0 4px", fontWeight: 600 }}>{gallery.address}</p>
            {gallery.phone && <p style={{ fontSize: 11, color: T.textSec, margin: "0 0 2px" }}>{gallery.phone}</p>}
            <p style={{ fontSize: 11, color: ac, margin: 0 }}>{gallery.admission}</p>
          </div>

          {/* Hours */}
          {gallery.hours && <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.textSec, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 8px" }}>Hours</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {gallery.hours.map((h, i) => {
                const isTd = h.day === today;
                return (
                  <div key={i} style={{ padding: "6px 10px", borderRadius: 10, flex: "0 0 auto", minWidth: isM ? "calc(50% - 3px)" : "auto", background: isTd ? `${T.green}10` : "rgba(255,255,255,.02)", border: `1px solid ${isTd ? T.green + "30" : "rgba(255,255,255,.04)"}` }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: isTd ? T.green : T.textDim, marginRight: 6 }}>{h.day}</span>
                    <span style={{ fontSize: 11, color: h.closed ? T.textDim : T.textBody }}>{h.hours}</span>
                    {h.late && <span style={{ fontSize: 8, color: ac, marginLeft: 4 }}>{"\u2605"}</span>}
                  </div>
                );
              })}
            </div>
          </div>}

          {/* Exhibitions */}
          {gallery.exhibitions && <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.textSec, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 8px" }}>Exhibitions</p>
            {gallery.exhibitions.map((exh, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i > 0 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "2px 7px", borderRadius: 99, flexShrink: 0, background: exh.tag === "Now" ? `${T.green}18` : `${ac}18`, color: exh.tag === "Now" ? T.green : ac }}>{exh.tag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: T.textHi, margin: 0 }}>{exh.title}</p>
                  <p style={{ fontSize: 10, color: T.textDim, margin: "2px 0 0" }}>{exh.dates}</p>
                </div>
              </div>
            ))}
          </div>}

          {/* Highlights */}
          {gallery.highlights && <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.textSec, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 8px" }}>Highlights</p>
            {gallery.highlights.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0" }}>
                <span style={{ width: 5, height: 5, borderRadius: 99, background: ac, flexShrink: 0, marginTop: 6, opacity: .5 }} />
                <p style={{ fontSize: 12, color: T.textBody, margin: 0, lineHeight: 1.5 }}>{h}</p>
              </div>
            ))}
          </div>}

          {/* Programs */}
          {gallery.programs && <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.textSec, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 8px" }}>Programs & Events</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {gallery.programs.map((p, i) => (
                <span key={i} style={{ fontSize: 10, padding: "5px 11px", borderRadius: 99, background: `${ac}08`, border: `1px solid ${ac}22`, color: T.textBody, fontWeight: 500 }}>{p}</span>
              ))}
            </div>
          </div>}

          {/* Notice */}
          {gallery.notice && <div style={{ padding: "10px 14px", borderRadius: 12, marginBottom: 16, background: "rgba(232,54,79,.06)", border: "1px solid rgba(232,54,79,.12)" }}>
            <p style={{ fontSize: 11, color: T.textBody, margin: 0, lineHeight: 1.5 }}>
              <span style={{ color: T.red, fontWeight: 700, fontSize: 9, letterSpacing: 1, textTransform: "uppercase" }}>Notice: </span>{gallery.notice}
            </p>
          </div>}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
            {gallery.web && <a href={gallery.web} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 0", borderRadius: 99, textDecoration: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.accent}dd)`, color: T.bg, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Visit Website</a>}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 20px", borderRadius: 99, textDecoration: "none", background: "rgba(255,255,255,.04)", border: `1px solid ${T.border}`, color: T.text, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Map</a>
          </div>

          {/* UPCOMING EVENTS */}
          {events.length > 0 && <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.textSec, letterSpacing: 2.5, textTransform: "uppercase", margin: "0 0 16px" }}>Upcoming Events ({events.length})</p>
            {events.map(ev => {
              const eac = CA[ev.cat] || ac;
              const gr = CGrad[ev.cat] || CGrad._;
              const d = parseDate(ev.date);
              return (
                <div key={ev.id} className="ecard" style={{ background: gr, borderRadius: 16, border: `1px solid ${T.border}`, padding: 0, marginBottom: 10, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "stretch" }}>
                    <div style={{ width: isM ? 62 : 72, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "14px 0", background: "rgba(255,255,255,.03)", borderRight: `1px solid ${T.border}` }}>
                      {d ? <><span style={{ fontSize: 9, fontWeight: 700, color: eac, letterSpacing: 1.5 }}>{d.weekday}</span><span style={{ fontSize: isM ? 22 : 26, fontWeight: 300, color: T.textHi, lineHeight: 1.1, margin: "2px 0" }}>{d.day}</span><span style={{ fontSize: 9, fontWeight: 600, color: T.textDim, letterSpacing: 1 }}>{d.month}</span></> : <span style={{ fontSize: 18 }}>{ev.emoji}</span>}
                    </div>
                    <div style={{ flex: 1, padding: "12px 14px", minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.textHi }}>{ev.title}</h3>
                        {ev.subcategory && <span style={{ fontSize: 8, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: `${eac}15`, color: eac, letterSpacing: .5 }}>{ev.subcategory}</span>}
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 500, color: T.textSec }}>{ev.time || "TBD"} {"\u00B7"} {ev.price || "TBD"}</p>
                    </div>
                    {ev.url ? <a href={ev.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", background: `${eac}12`, borderLeft: `1px solid ${eac}25`, color: eac, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none", flexShrink: 0, gap: 5, whiteSpace: "nowrap" }}>Tickets</a> : <div style={{ display: "flex", alignItems: "center", padding: "0 14px", color: T.textDim, fontSize: 10, fontWeight: 600, flexShrink: 0 }}>Details →</div>}
                  </div>
                </div>
              );
            })}
          </div>}

          <div style={{ textAlign: "center", paddingBottom: 32, borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
            <p style={{ fontSize: 10, color: T.textDim, letterSpacing: .6, margin: "0 0 4px" }}>Info subject to change {"\u00B7"} Verify details at venue websites</p>
            <p style={{ fontSize: 9, color: "rgba(235,230,220,.2)", letterSpacing: .4, margin: 0 }}>&copy; 2026 GO: Guide to Omaha</p>
          </div>

          <div style={{ height: 100 }} />
        </div>
      </div>
    </div>
  );
}
