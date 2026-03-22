"use client";
import Link from "next/link";
import { T, CG } from "../../lib/design-tokens";
import { IC } from "../../lib/icons";
import { useResponsive } from "../../components/ResponsiveProvider";

export function VenueClient({ venue }) {
  const { isM, isT, isD } = useResponsive();
  const mxW = isD ? 860 : isT ? 680 : 600;
  const px = isD ? 32 : isT ? 24 : 16;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + " Omaha NE")}`;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans }}>
      <div style={{ maxWidth: mxW, margin: "0 auto" }}>

        {/* HERO IMAGE */}
        <div style={{ position: "relative", height: isD ? 300 : isM ? 220 : 260, overflow: "hidden", borderRadius: "0 0 24px 24px" }}>
          <img src={venue.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .5 }} onError={e => { e.target.style.display = "none"; }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(20,22,24,.05) 0%,rgba(20,22,24,.9) 100%)" }} />

          {/* Back button */}
          <Link href="/" className="hbtn" style={{ position: "absolute", top: 16, left: 16, background: "rgba(20,22,24,.6)", backdropFilter: "blur(8px)", border: `1px solid ${T.border}`, borderRadius: 99, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: T.textBody, fontSize: 10, fontWeight: 600, letterSpacing: .5, textDecoration: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> Back
          </Link>

          {/* Badges */}
          <div style={{ position: "absolute", top: 10, right: 12, display: "flex", gap: 5 }}>
            <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 99, background: "rgba(255,255,255,.08)", color: T.textBody, fontWeight: 600 }}>{venue.type}</span>
            {venue.city && venue.city !== "omaha" && <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 99, background: "rgba(230,149,107,.15)", color: "#E6956B", fontWeight: 600 }}>{venue.city === "cb" ? "CB" : "Lincoln"}</span>}
          </div>

          {/* Title area */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: `0 ${px}px 20px` }}>
            <h1 style={{ margin: 0, fontSize: isD ? 30 : 24, fontWeight: 600, color: T.textHi, letterSpacing: .5, lineHeight: 1.2 }}>{venue.name}</h1>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: T.venue, letterSpacing: 1, fontWeight: 500 }}>{venue.area} {"\u00B7"} {venue.cap}</p>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: `20px ${px}px 0` }}>

          {/* Description */}
          <p style={{ fontSize: 14, color: T.textBody, lineHeight: 1.7, margin: "0 0 24px", letterSpacing: .3 }}>{venue.desc}</p>

          {/* Quick info cards */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto" }}>
            {[
              { label: "Type", value: venue.type },
              { label: "Area", value: venue.area },
              { label: "Capacity", value: venue.cap },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "14px 10px", flex: 1, minWidth: 90, background: "rgba(255,255,255,.03)", borderRadius: 14, border: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 10, color: T.textDim, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{s.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.textHi, textAlign: "center" }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {venue.url && <a href={venue.url} target="_blank" rel="noopener noreferrer" className="cta" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 0", borderRadius: 99, textDecoration: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.accent}dd)`, color: T.bg, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>{IC.globe(T.bg, 13)} Visit Website</a>}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hbtn" style={{ flex: venue.url ? "none" : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 20px", borderRadius: 99, textDecoration: "none", background: "rgba(255,255,255,.04)", border: `1px solid ${T.border}`, color: T.text, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{IC.dir(T.textSec, 13)} Directions</a>
          </div>

          {/* Share button */}
          <button onClick={() => { if (navigator.share) navigator.share({ title: venue.name, url: window.location.href }).catch(() => {}); else navigator.clipboard?.writeText(window.location.href); }} className="hbtn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px 0", borderRadius: 99, background: "rgba(255,255,255,.04)", border: `1px solid ${T.border}`, color: T.text, fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", cursor: "pointer", marginBottom: 32 }}>{IC.share(T.textSec, 13)} Share</button>

          <div style={{ textAlign: "center", paddingBottom: 32, borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
            <p style={{ fontSize: 10, color: T.textDim, letterSpacing: .6, margin: "0 0 4px" }}>Venue info subject to change {"\u00B7"} Verify details at venue websites</p>
            <p style={{ fontSize: 9, color: "rgba(235,230,220,.2)", letterSpacing: .4, margin: 0 }}>&copy; 2026 GO: Guide to Omaha</p>
          </div>

          <div style={{ height: 100 }} />
        </div>
      </div>
    </div>
  );
}
