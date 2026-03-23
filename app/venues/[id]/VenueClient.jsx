"use client";
import { useState } from "react";
import Link from "next/link";
import { T, CG } from "../../lib/design-tokens";
import { IC } from "../../lib/icons";
import { useResponsive } from "../../components/ResponsiveProvider";

var TYPE_ACCENT = {
  "Arena": "#64B5F6",
  "Performing Arts": "#CE93D8",
  "Indie / Club": "#5EC4B6",
  "Comedy Club": "#FFB74D",
  "Bar / Venue": "#D4AD65",
  "Museum / Attraction": "#81C784",
  "Outdoor": "#FF8A65",
};

var CAT_EMOJI = { concerts: "\uD83C\uDFB5", sports: "\uD83C\uDFC6", comedy: "\uD83D\uDE02", family: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", arts: "\uD83C\uDFAD", festivals: "\uD83C\uDFAA" };

function fmtDate(d) { if (!d || !/^\d{4}/.test(d)) return d || ""; return new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); }
function daysUntil(d) { if (!d || !/^\d{4}/.test(d)) return null; var n = new Date(); n.setHours(0,0,0,0); var e = new Date(d + "T12:00:00"); e.setHours(0,0,0,0); return Math.ceil((e - n) / 86400000); }
function dateParts(d) { if (!d || !/^\d{4}/.test(d)) return null; var dt = new Date(d + "T12:00:00"); return { mon: dt.toLocaleDateString("en-US", { month: "short" }).toUpperCase(), day: dt.getDate(), dow: dt.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase() }; }

export function VenueClient({ venue, upcomingEvents }) {
  var { isM, isT, isD } = useResponsive();
  var [shared, setShared] = useState(false);
  var mxW = isD ? 860 : isT ? 680 : 600;
  var px = isD ? 32 : isT ? 24 : 16;
  var ac = TYPE_ACCENT[venue.type] || T.accent;
  var acSoft = ac + "18";
  var acBorder = ac + "44";
  var cityName = venue.city === "lincoln" ? "Lincoln" : venue.city === "cb" ? "Council Bluffs" : "Omaha";
  var mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent((venue.addr || venue.name) + ", " + cityName + " NE");
  var events = upcomingEvents || [];

  function handleShare() {
    if (navigator.share) { try { navigator.share({ title: venue.name, url: window.location.href }); } catch(e) {} }
    else { try { navigator.clipboard.writeText(window.location.href); } catch(e) {} }
    setShared(true); setTimeout(function() { setShared(false); }, 2000);
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans, paddingBottom: 48 }}>
      <div style={{ maxWidth: mxW, margin: "0 auto" }}>

        {/* ═══ HERO ═══ */}
        <div style={{ position: "relative", height: isD ? 340 : isM ? 280 : 300, overflow: "hidden", borderRadius: "0 0 24px 24px" }}>
          <img src={venue.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }} onError={function(e) { e.target.style.display = "none"; }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(20,22,24,.15) 0%,rgba(20,22,24,.95) 100%)" }} />

          <Link href="/" className="hbtn" style={{ position: "absolute", top: 16, left: 16, background: "rgba(20,22,24,.6)", backdropFilter: "blur(8px)", border: "1px solid " + T.border, borderRadius: 99, padding: "8px 12px", display: "flex", alignItems: "center", gap: 6, color: T.textBody, fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> Back
          </Link>

          <div style={{ position: "absolute", top: 12, right: 14, display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "4px 10px", borderRadius: 99, background: acSoft, color: ac, border: "1px solid " + acBorder }}>{venue.type}</span>
            {venue.city && venue.city !== "omaha" && <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "4px 10px", borderRadius: 99, background: "rgba(230,149,107,.15)", color: "#E6956B", border: "1px solid rgba(230,149,107,.3)" }}>{cityName}</span>}
          </div>

          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 " + px + "px 20px" }}>
            <h1 style={{ margin: 0, fontSize: isD ? 30 : isM ? 24 : 27, fontWeight: 700, color: T.textHi, lineHeight: 1.15 }}>{venue.name}</h1>
            <p style={{ margin: "6px 0 0", fontSize: 11, color: T.textSec }}>{venue.area} {"\u00B7"} {venue.cap} capacity {"\u00B7"} {cityName}</p>
          </div>
        </div>

        <div style={{ padding: "0 " + px + "px" }}>

          {/* ═══ QUICK STATS ═══ */}
          <div style={{ display: "flex", gap: 8, margin: "16px 0", overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
            {[
              { val: venue.cap, unit: "Capacity", icon: "\uD83C\uDFDF\uFE0F" },
              { val: venue.type.split(" / ")[0], unit: "Type", icon: "\uD83C\uDFE0" },
              { val: venue.area, unit: "Area", icon: "\uD83D\uDCCD" },
              { val: String(events.length), unit: "Upcoming", icon: "\uD83C\uDFAB" },
            ].map(function(s, i) { return (
              <div key={i} style={{ flexShrink: 0, padding: "12px 16px", borderRadius: 14, textAlign: "center", background: "rgba(255,255,255,.03)", border: "1px solid " + T.border, minWidth: 80 }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <p style={{ fontSize: 16, fontWeight: 700, color: ac, margin: "2px 0 0" }}>{s.val}</p>
                <p style={{ fontSize: 9, color: T.textSec, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>{s.unit}</p>
              </div>
            ); })}
          </div>

          {/* ═══ ABOUT ═══ */}
          <p style={{ fontSize: 14, color: T.textBody, lineHeight: 1.7, margin: "0 0 20px", letterSpacing: 0.3 }}>{venue.desc}</p>

          {/* ═══ UPCOMING EVENTS ═══ */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 12, fontWeight: 600, color: ac, letterSpacing: 2.5, textTransform: "uppercase", margin: "0 0 12px" }}>Upcoming Events {events.length > 0 && <span style={{ color: T.textDim, fontSize: 11, letterSpacing: 1 }}>({events.length})</span>}</h2>

            {events.length === 0 ? (
              <div style={{ padding: "24px 16px", borderRadius: 18, background: "rgba(255,255,255,.02)", border: "1px solid " + T.border, textAlign: "center" }}>
                <p style={{ fontSize: 28, margin: "0 0 8px" }}>{"\uD83C\uDFB6"}</p>
                <p style={{ fontSize: 13, color: T.textSec, margin: "0 0 4px" }}>No upcoming events listed</p>
                <p style={{ fontSize: 11, color: T.textDim, margin: 0 }}>Check the venue website for the latest schedule</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {events.map(function(ev, i) {
                  var days = daysUntil(ev.date);
                  var dp = dateParts(ev.date);
                  var catColor = { concerts: "#5EC4B6", sports: "#64B5F6", comedy: "#FFB74D", family: "#81C784", arts: "#CE93D8", festivals: "#FF8A65" }[ev.cat] || T.accent;
                  var gr = CG[ev.cat] || CG._ || "rgba(255,255,255,.02)";
                  var isToday = days === 0;
                  return (
                    <div key={i} style={{ borderRadius: 16, overflow: "hidden", display: "flex", alignItems: "stretch", background: gr, border: "1px solid " + T.border }}>
                      {/* Calendar date card — white full height */}
                      {dp && <div style={{ width: 66, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FFFFFF", borderRight: "1px solid rgba(0,0,0,.06)" }}>
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: isToday ? catColor : "#888", textTransform: "uppercase" }}>{dp.mon}</span>
                        <span style={{ fontSize: 26, fontWeight: 800, color: "#1A1A1A", lineHeight: 1.1 }}>{dp.day}</span>
                        <span style={{ fontSize: 9, fontWeight: 600, color: isToday ? catColor : "#888", letterSpacing: 0.5 }}>{dp.dow}</span>
                      </div>}
                      {/* Event info + ticket */}
                      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                        <Link href={"/events/" + ev.slug + "/"} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: isM ? "12px 12px" : "14px 16px", textDecoration: "none", color: "inherit", flex: 1 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", gap: 6, marginBottom: 5, flexWrap: "wrap", alignItems: "center" }}>
                              <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "3px 8px", borderRadius: 99, background: catColor + "18", color: catColor, border: "1px solid " + catColor + "33" }}>{(CAT_EMOJI[ev.cat] || "") + " " + (ev.cat || "event")}</span>
                              {days !== null && days >= 0 && <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "3px 8px", borderRadius: 99, background: isToday ? catColor + "15" : "rgba(255,255,255,.06)", color: isToday ? catColor : T.textSec }}>{isToday ? "Today" : days === 1 ? "Tomorrow" : days + " days"}</span>}
                            </div>
                            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.textHi, lineHeight: 1.25 }}>{ev.title}</h3>
                            <p style={{ margin: "4px 0 0", fontSize: 11, color: T.textSec }}>{ev.time || ""}{ev.price ? " \u00B7 " + ev.price : ""}</p>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><polyline points="9 18 15 12 9 6" /></svg>
                        </Link>
                        {ev.url && ev.url !== "#" && (
                          <div style={{ padding: "0 " + (isM ? 12 : 16) + "px 12px", display: "flex", justifyContent: "flex-end" }}>
                            <a href={ev.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 28px", borderRadius: 99, textDecoration: "none", background: catColor, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
                              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="3"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                              Tickets
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ═══ VENUE DETAILS ═══ */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 12, fontWeight: 600, color: ac, letterSpacing: 2.5, textTransform: "uppercase", margin: "0 0 12px" }}>Venue Details</h2>
            <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid " + T.border, background: "rgba(255,255,255,.02)" }}>
              {[
                venue.addr ? { label: "Address", value: venue.addr, icon: "\uD83D\uDCCD", link: mapsUrl } : null,
                { label: "Type", value: venue.type, icon: "\uD83C\uDFE0" },
                { label: "Area", value: venue.area + ", " + cityName, icon: "\uD83D\uDDFA\uFE0F" },
                { label: "Capacity", value: venue.cap, icon: "\uD83D\uDC65" },
                venue.url ? { label: "Website", value: venue.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""), icon: "\uD83C\uDF10", link: venue.url } : null,
              ].filter(Boolean).map(function(r, i) { return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderTop: i > 0 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                  <span style={{ fontSize: 16, width: 24, textAlign: "center", flexShrink: 0 }}>{r.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 10, color: T.textDim, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 2px" }}>{r.label}</p>
                    {r.link ? <a href={r.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: ac, fontWeight: 500, textDecoration: "none", margin: 0 }}>{r.value}</a> : <p style={{ fontSize: 14, color: T.textHi, fontWeight: 500, margin: 0 }}>{r.value}</p>}
                  </div>
                </div>
              ); })}
            </div>
          </div>

          {/* ═══ ACTION BUTTONS ═══ */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="cta" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 0", borderRadius: 99, textDecoration: "none", background: "linear-gradient(135deg, " + ac + ", " + ac + "dd)", color: T.bg, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", boxShadow: "0 4px 20px " + ac + "40" }}>
              {IC.dir(T.bg, 14)} Get Directions
            </a>
            {venue.url && <a href={venue.url} target="_blank" rel="noopener noreferrer" className="hbtn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 20px", borderRadius: 99, textDecoration: "none", background: "rgba(255,255,255,.04)", border: "1px solid " + T.border, color: T.text, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
              {IC.globe(T.textSec, 13)} Website
            </a>}
          </div>

          <button onClick={handleShare} className="hbtn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px 0", borderRadius: 99, background: "rgba(255,255,255,.04)", border: "1px solid " + T.border, color: shared ? T.green : T.text, fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", cursor: "pointer", marginBottom: 28 }}>
            {shared ? IC.check(T.green, 13) : IC.share(T.textSec, 13)} {shared ? "Copied!" : "Share"}
          </button>

          {/* ═══ FOOTER ═══ */}
          <div style={{ textAlign: "center", paddingBottom: 20, borderTop: "1px solid " + T.border, paddingTop: 20 }}>
            <p style={{ fontSize: 10, color: T.textDim, letterSpacing: 0.6, margin: "0 0 4px" }}>Venue info subject to change {"\u00B7"} Verify details at venue websites</p>
            <p style={{ fontSize: 9, color: "rgba(235,230,220,.2)", letterSpacing: 0.4, margin: 0 }}>{"\u00A9"} 2026 GO: Guide to Omaha</p>
          </div>

          <div style={{ height: 60 }} />
        </div>
      </div>
    </div>
  );
}
