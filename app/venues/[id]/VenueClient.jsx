"use client";
import Link from "next/link";
import { T, CG } from "../../lib/design-tokens";
import { IC } from "../../lib/icons";
import { useResponsive } from "../../components/ResponsiveProvider";
import { BottomNav } from "../../components/BottomNav";

const CA = { concerts: "#5EC4B6", sports: "#64B5F6", festivals: "#CE93D8", family: "#81C784", arts: "#B39DDB", comedy: "#FFB74D" };
const CGrad = {
  concerts: "linear-gradient(135deg,#1A2E32 0%,#213740 60%,#1C3035 100%)",
  sports: "linear-gradient(135deg,#1A2430 0%,#21303E 60%,#1C2836 100%)",
  arts: "linear-gradient(135deg,#271F30 0%,#30263A 60%,#292134 100%)",
  comedy: "linear-gradient(135deg,#2D2518 0%,#3A2F1E 60%,#332A1C 100%)",
  family: "linear-gradient(135deg,#1C2A1F 0%,#253628 60%,#1F2E22 100%)",
  festivals: "linear-gradient(135deg,#2A1F34 0%,#34263E 60%,#2C2138 100%)",
  _: "linear-gradient(135deg,#1E2024 0%,#262A2E 60%,#202428 100%)",
};
const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const DAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

function eventSlugFn(ev) {
  return [ev.title, ev.venue, ev.date].filter(Boolean).join(" ").toLowerCase().replace(/['']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseDate(d) {
  if (!d || !d.match(/^\d{4}/)) return null;
  const dt = new Date(d + "T12:00:00");
  return { day: dt.getDate(), month: MONTHS[dt.getMonth()], weekday: DAYS[dt.getDay()], full: dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) };
}

export function VenueClient({ venue, events = [], contentImage }) {
  const { isM, isT, isD } = useResponsive();
  const mxW = isD ? 860 : isT ? 680 : 600;
  const px = isD ? 32 : isT ? 24 : 16;
  const address = venue.address || events.find(e => e.venueAddress)?.venueAddress || "";
  const mapsQuery = address || (venue.name + " Omaha NE");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
  const ageRestriction = events.find(e => e.ageRestriction)?.ageRestriction || "";

  // Use content image if available, fall back to venue.img (Unsplash)
  const heroImg = contentImage || venue.img;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans, paddingBottom: 80 }}>
      <div style={{ maxWidth: mxW, margin: "0 auto" }}>

        {/* HERO IMAGE */}
        <div style={{ position: "relative", height: isD ? 340 : isM ? 240 : 280, overflow: "hidden", borderRadius: "0 0 24px 24px" }}>
          <img src={heroImg} alt={venue.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .6 }} onError={e => { e.target.src = venue.img; e.target.onerror = null; }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(20,22,24,.05) 0%,rgba(20,22,24,.9) 100%)" }} />

          <Link href="/" className="hbtn" style={{ position: "absolute", top: 16, left: 16, background: "rgba(20,22,24,.6)", backdropFilter: "blur(8px)", border: `1px solid ${T.border}`, borderRadius: 99, padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: T.textBody, fontSize: 11, fontWeight: 600, letterSpacing: .5, textDecoration: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> Back
          </Link>

          <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 5 }}>
            <span style={{ fontSize: 9, padding: "4px 10px", borderRadius: 99, background: "rgba(94,196,182,.12)", color: T.accent, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase" }}>{venue.type}</span>
            {venue.city && venue.city !== "omaha" && <span style={{ fontSize: 9, padding: "4px 10px", borderRadius: 99, background: "rgba(230,149,107,.15)", color: "#E6956B", fontWeight: 700 }}>{venue.city === "cb" ? "Council Bluffs" : "Lincoln"}</span>}
            {ageRestriction && ageRestriction !== "All Ages" && <span style={{ fontSize: 9, padding: "4px 10px", borderRadius: 99, background: "rgba(255,255,255,.08)", color: T.textSec, fontWeight: 600 }}>{ageRestriction}</span>}
          </div>

          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: `0 ${px}px 20px` }}>
            <h1 style={{ margin: 0, fontSize: isD ? 32 : 26, fontWeight: 300, color: T.textHi, letterSpacing: .5, lineHeight: 1.2 }}>{venue.name}</h1>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: T.venue, letterSpacing: 1, fontWeight: 500 }}>{venue.area} {"\u00B7"} {venue.cap} capacity</p>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: `24px ${px}px 0` }}>

          <p style={{ fontSize: 15, color: T.textBody, lineHeight: 1.75, margin: "0 0 24px", letterSpacing: .3 }}>{venue.desc}</p>

          {/* Quick info */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto" }}>
            {[
              { label: "Type", value: venue.type },
              { label: "Area", value: venue.area },
              { label: "Capacity", value: venue.cap },
              ...(ageRestriction ? [{ label: "Ages", value: ageRestriction }] : []),
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "14px 10px", flex: 1, minWidth: 80, background: "rgba(255,255,255,.03)", borderRadius: 14, border: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 9, color: T.textDim, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.textHi, textAlign: "center" }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Address */}
          {address && <div style={{ padding: "14px 16px", background: "rgba(255,255,255,.03)", borderRadius: 14, border: `1px solid ${T.border}`, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${T.accent}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{IC.dir(T.accent, 16)}</div>
            <div>
              <span style={{ fontSize: 9, color: T.textDim, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>Address</span>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: T.textHi, fontWeight: 500 }}>{address}</p>
            </div>
          </div>}

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {venue.url && <a href={venue.url} target="_blank" rel="noopener noreferrer" className="cta" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "15px 0", borderRadius: 99, textDecoration: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.accent}dd)`, color: T.bg, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", boxShadow: `0 4px 20px ${T.accent}33` }}>{IC.globe(T.bg, 14)} Visit Website</a>}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hbtn" style={{ flex: venue.url ? "none" : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "15px 20px", borderRadius: 99, textDecoration: "none", background: "rgba(255,255,255,.04)", border: `1px solid ${T.border}`, color: T.text, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{IC.dir(T.textSec, 14)} Directions</a>
          </div>

          {/* Share */}
          <button onClick={() => { if (navigator.share) navigator.share({ title: venue.name, url: window.location.href }).catch(() => {}); else navigator.clipboard?.writeText(window.location.href); }} className="hbtn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px 0", borderRadius: 99, background: "rgba(255,255,255,.04)", border: `1px solid ${T.border}`, color: T.text, fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", cursor: "pointer", marginBottom: 32 }}>{IC.share(T.textSec, 14)} Share Venue</button>

          {/* ═══ UPCOMING EVENTS ═══ */}
          {events.length > 0 && <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: T.textSec, letterSpacing: 2.5, textTransform: "uppercase", margin: "0 0 16px" }}>Upcoming Events ({events.length})</h2>
            {events.map(ev => {
              const ac = CA[ev.cat] || T.accent;
              const gr = CGrad[ev.cat] || CGrad._;
              const d = parseDate(ev.date);
              return (
                <Link key={ev.id} href={"/events/" + eventSlugFn(ev) + "/"} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                <div className="ecard" style={{ background: gr, borderRadius: 16, border: `1px solid ${T.border}`, padding: 0, marginBottom: 10, overflow: "hidden", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "stretch" }}>

                    {/* Calendar date card */}
                    <div style={{ width: isM ? 62 : 72, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "14px 0", background: "rgba(255,255,255,.03)", borderRight: `1px solid ${T.border}` }}>
                      {d ? <>
                        <span style={{ fontSize: 9, fontWeight: 700, color: ac, letterSpacing: 1.5, textTransform: "uppercase" }}>{d.weekday}</span>
                        <span style={{ fontSize: isM ? 22 : 26, fontWeight: 300, color: T.textHi, lineHeight: 1.1, margin: "2px 0" }}>{d.day}</span>
                        <span style={{ fontSize: 9, fontWeight: 600, color: T.textDim, letterSpacing: 1 }}>{d.month}</span>
                      </> : <span style={{ fontSize: 18 }}>{ev.emoji}</span>}
                    </div>

                    {/* Event info */}
                    <div style={{ flex: 1, padding: "12px 14px", minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.textHi }}>{ev.title}</h3>
                        {ev.subcategory && <span style={{ fontSize: 8, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: `${ac}15`, color: ac, letterSpacing: .5 }}>{ev.subcategory}</span>}
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 500, color: T.textSec }}>{ev.time || "TBD"} {"\u00B7"} {ev.price || "TBD"}</p>
                    </div>

                    {/* Buy tickets button */}
                    {ev.url ? <a href={ev.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", background: `${ac}12`, borderLeft: `1px solid ${ac}25`, color: ac, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none", flexShrink: 0, gap: 5, whiteSpace: "nowrap" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ac} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                      Tickets
                    </a> : <div style={{ display: "flex", alignItems: "center", padding: "0 14px", color: T.textDim, fontSize: 10, fontWeight: 600, letterSpacing: .5, flexShrink: 0 }}>
                      Details →
                    </div>}

                  </div>
                </div>
                </Link>
              );
            })}
          </div>}

          {events.length === 0 && <div style={{ textAlign: "center", padding: "24px 0 32px" }}>
            <p style={{ fontSize: 13, color: T.textSec }}>No upcoming events scheduled at this venue.</p>
            <Link href="/" style={{ color: T.accent, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Browse All Events →</Link>
          </div>}

          <div style={{ textAlign: "center", paddingBottom: 32, borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
            <p style={{ fontSize: 10, color: T.textDim, letterSpacing: .6, margin: "0 0 4px" }}>Venue info subject to change {"\u00B7"} Verify details at venue websites</p>
            <p style={{ fontSize: 9, color: "rgba(235,230,220,.2)", letterSpacing: .4, margin: 0 }}>&copy; 2026 GO: Guide to Omaha</p>
          </div>

          <div style={{ height: 100 }} />
        </div>
      </div>
      <BottomNav active="explore" />
    </div>
  );
}
