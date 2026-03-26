"use client";

import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// GO: Guide to Omaha — Design Tokens
// ═══════════════════════════════════════════════════════════════
const t = {
  bg: "#141618",
  bgElevated: "#1A1C1F",
  bgCard: "#1E2023",
  bgHover: "#252729",
  surface: "#2A2D30",
  text: "#F2EFE9",
  textMuted: "#B8B3AB",
  textBody: "rgba(242,239,233,0.85)",
  textDim: "#7D7870",
  cream: "#E8E2D6",
  teal: "#5EC4B6",
  green: "#6BBF7A",

  // Durham venue accent — warm amber/brass drawn from the Great Hall chandeliers
  accent: "#D4A24C",
  accentSoft: "rgba(212,162,76,0.12)",
  accentDeep: "#B8872E",
  marble: "#4A6A7A",
  marbleSoft: "rgba(74,106,122,0.10)",

  display: "'Inter', system-ui, -apple-system, sans-serif",
  body: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'IBM Plex Mono', 'SF Mono', monospace",

  pagePx: "clamp(1rem, 4vw, 2.5rem)",
  maxW: "1100px",
  radius: "10px",
  radiusSm: "6px",
};

// ═══════════════════════════════════════════════════════════════
// Scroll reveal hook
// ═══════════════════════════════════════════════════════════════
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GO: Omaha top bar
// ═══════════════════════════════════════════════════════════════
function GoBar() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "rgba(20,22,24,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(242,239,233,0.06)" }}>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
        <div style={{ width: 32, height: 32, borderRadius: 99, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(242,239,233,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </div>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.1em", color: "#5EC4B6" }}>GO:</span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", fontWeight: 400, color: "#E8E2D6" }}>Guide to Omaha</span>
      </a>
      <div style={{ display: "flex", gap: 6 }}>
        <a href="/?tab=events" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "#E8E2D6", padding: "6px 12px", borderRadius: 99, border: "1px solid rgba(242,239,233,0.1)", textDecoration: "none" }}>Events</a>
        <a href="/?tab=explore" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "#E8E2D6", padding: "6px 12px", borderRadius: 99, border: "1px solid rgba(242,239,233,0.1)", textDecoration: "none" }}>Explore</a>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════
function Hero() {
  return (
    <div style={{ position: "relative", minHeight: "100svh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: `0 ${t.pagePx} 3rem`, background: t.bg, overflow: "hidden" }}>
      {/* Hero image */}
      <img loading="lazy" src="/images/venues/durham-museum.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.18, pointerEvents: "none" }} />
      {/* Ambient glow — warm amber chandelier light from above */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 40% at 50% 15%, rgba(212,162,76,0.10) 0%, transparent 65%), radial-gradient(ellipse 50% 60% at 80% 80%, rgba(74,106,122,0.06) 0%, transparent 55%)`, pointerEvents: "none" }} />
      {/* Art Deco rail lines */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "2px", height: "35vh", background: "linear-gradient(to bottom, rgba(212,162,76,0.15), transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "35vh", left: "50%", transform: "translateX(-50%)", width: "80px", height: "2px", background: "linear-gradient(to right, transparent, rgba(212,162,76,0.12), transparent)", pointerEvents: "none" }} />
      {/* Bottom gradient */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(20,22,24,1) 0%, transparent 40%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: "780px" }}>
        <div style={{ fontFamily: t.mono, fontSize: "0.6rem", fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", color: t.accent, marginBottom: "1.25rem", animation: "goFadeUp 0.8s ease 0.2s both" }}>
          Omaha&apos;s Home to History · Est. 1931
        </div>
        <h1 style={{ fontFamily: t.display, fontSize: "clamp(3.5rem, 10vw, 7.5rem)", fontWeight: 300, lineHeight: 0.9, color: t.text, letterSpacing: "-0.02em", margin: 0, animation: "goFadeUp 1s ease 0.4s both" }}>
          The<br />
          <em style={{ fontStyle: "italic", color: t.accent }}>Durham</em>
        </h1>
        <p style={{ fontFamily: t.body, fontSize: "1rem", fontWeight: 300, color: t.textDim, lineHeight: 1.6, maxWidth: "460px", marginTop: "1.5rem", animation: "goFadeUp 1s ease 0.6s both" }}>
          A National Historic Landmark and Smithsonian Affiliate — where Omaha&apos;s story lives inside the Art Deco grandeur of the original 1931 Union Station.
        </p>
        <div style={{ display: "flex", gap: "0.6rem", marginTop: "1.75rem", flexWrap: "wrap", animation: "goFadeUp 1s ease 0.8s both" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", background: t.accentSoft, border: "1px solid rgba(212,162,76,0.18)", borderRadius: "100px", fontFamily: t.mono, fontSize: "0.6rem", letterSpacing: "0.08em", color: t.accent, textTransform: "uppercase" }}>
            National Historic Landmark
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", background: t.marbleSoft, border: "1px solid rgba(74,106,122,0.18)", borderRadius: "100px", fontFamily: t.mono, fontSize: "0.6rem", letterSpacing: "0.08em", color: t.marble, textTransform: "uppercase" }}>
            Smithsonian Affiliate
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// VITALS BAR
// ═══════════════════════════════════════════════════════════════
const vitals = [
  { label: "Hours", value: "Tue–Sat 10–4", accent: "Sun Noon–4" },
  { label: "Location", value: "801 S 10th Street" },
  { label: "Adults", accent: "$15", value: " · Kids $8" },
];

function VitalsBar() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", borderBottom: "1px solid rgba(242,239,233,0.06)" }}>
      {vitals.map((v, i) => (
        <Reveal key={i} delay={i * 0.05}>
          <div style={{ padding: "1.75rem 1.5rem", textAlign: "center", borderRight: i < vitals.length - 1 ? "1px solid rgba(242,239,233,0.06)" : "none" }}>
            <div style={{ fontFamily: t.mono, fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: t.textDim, marginBottom: "0.4rem" }}>{v.label}</div>
            <div style={{ fontFamily: t.display, fontSize: "1.2rem", fontWeight: 500, color: t.text }}>
              {v.accent && <span style={{ color: t.teal }}>{v.accent}</span>}
              {v.value && <span>{v.accent ? " " : ""}{v.value}</span>}
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION HEADER
// ═══════════════════════════════════════════════════════════════
function SectionHeader({ label, heading }) {
  return (
    <Reveal>
      <div style={{ fontFamily: t.mono, fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: t.teal, marginBottom: "0.75rem" }}>{label}</div>
      <h2 style={{ fontFamily: t.display, fontSize: "clamp(1.8rem, 4.5vw, 3rem)", fontWeight: 300, lineHeight: 1.1, color: t.text, margin: 0, maxWidth: "560px" }}>{heading}</h2>
    </Reveal>
  );
}

// ═══════════════════════════════════════════════════════════════
// ABOUT
// ═══════════════════════════════════════════════════════════════
function About() {
  const stats = [
    { num: "1931", label: "Union Station Opens" },
    { num: "1975", label: "Becomes Museum" },
    { num: "60 ft", label: "Great Hall Ceiling" },
  ];
  return (
    <section style={{ padding: `4.5rem ${t.pagePx}`, borderBottom: "1px solid rgba(242,239,233,0.06)" }}>
      <div style={{ maxWidth: t.maxW, margin: "0 auto" }}>
        <SectionHeader label="About" heading="Where architecture is the first exhibit." />
        <div className="venue-grid-2col" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "3.5rem", marginTop: "2.5rem" }}>
          <Reveal delay={0.1}>
            <div style={{ fontFamily: t.body, fontSize: "0.95rem", fontWeight: 300, lineHeight: 1.75, color: t.textBody }}>
              <p>Built in 1931 by architect Gilbert Stanley Underwood for the Union Pacific Railroad, Omaha&apos;s Union Station was the showpiece of a city at the crossroads of a continent. At its peak, over a million passengers a year passed through its doors.</p>
              <p style={{ marginTop: "1.1rem" }}>When passenger rail declined, the station closed in 1971. Reborn in 1975 as the Western Heritage Museum — and later renamed for philanthropists Charles and Margre Durham — it now houses the region&apos;s premier history museum, a Smithsonian Affiliate with ties to the Library of Congress, National Archives, and Field Museum.</p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div>
              <div style={{ fontFamily: t.display, fontSize: "1.6rem", fontWeight: 300, fontStyle: "italic", lineHeight: 1.35, color: t.text, paddingLeft: "1.75rem", borderLeft: `2px solid ${t.accent}` }}>
                &ldquo;One of the finest examples of Art Deco architecture in the country.&rdquo;
              </div>
              <div style={{ fontFamily: t.mono, fontSize: "0.6rem", letterSpacing: "0.1em", color: t.textDim, paddingLeft: "1.75rem", marginTop: "0.6rem" }}>— National Park Service</div>
              <div style={{ display: "flex", gap: "2.5rem", marginTop: "2.5rem" }}>
                {stats.map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: t.display, fontSize: "2.2rem", fontWeight: 300, color: t.text, lineHeight: 1 }}>{s.num}</div>
                    <div style={{ fontFamily: t.mono, fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: t.textDim, marginTop: "0.25rem" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// THE GREAT HALL (signature feature)
// ═══════════════════════════════════════════════════════════════
function GreatHall() {
  const details = [
    { label: "Dimensions", value: "160 × 72 ft" },
    { label: "Ceiling Height", value: "60 feet" },
    { label: "Chandeliers", value: "Six · 13 ft tall" },
    { label: "Marble", value: "Blue & Black Belgian" },
  ];
  return (
    <section style={{ padding: `4.5rem ${t.pagePx}`, background: t.bgElevated, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-120px", left: "50%", transform: "translateX(-50%)", width: "1px", height: "240px", background: "linear-gradient(to bottom, transparent, rgba(212,162,76,0.08), transparent)", pointerEvents: "none" }} />
      <div style={{ maxWidth: t.maxW, margin: "0 auto", position: "relative" }}>
        <SectionHeader label="The Great Hall" heading="The Suzanne & Walter Scott Great Hall." />
        <Reveal delay={0.1}>
          <p style={{ fontFamily: t.body, fontSize: "0.95rem", fontWeight: 300, lineHeight: 1.75, color: t.textBody, maxWidth: "640px", marginTop: "1.5rem" }}>
            Step into the restored main waiting room and look up. Sculptured plaster painted with gold and silver leaf trim spans a 60-foot ceiling. Ten cathedral-like plate glass windows line the walls. Six immense chandeliers — each 13 feet tall — hang suspended 20 feet above a patterned terrazzo floor flanked by blue and black Belgian marble. Bronze statues by Omaha sculptor John Lajba stand frozen mid-stride, echoing the travelers who once filled this hall.
          </p>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1px", background: "rgba(242,239,233,0.04)", marginTop: "2.5rem", borderRadius: t.radius, overflow: "hidden" }}>
          {details.map((d, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div style={{ background: t.bgElevated, padding: "1.75rem 1.25rem", textAlign: "center" }}>
                <div style={{ fontFamily: t.display, fontSize: "1.5rem", fontWeight: 400, color: t.accent, lineHeight: 1.1 }}>{d.value}</div>
                <div style={{ fontFamily: t.mono, fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: t.textDim, marginTop: "0.4rem" }}>{d.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXHIBITS
// ═══════════════════════════════════════════════════════════════
const exhibits = [
  { title: "Harriman Family Line", desc: "Board restored 1940s–50s train cars — a Pullman car, lounge car, and caboose. Get up close to a steam engine and walk the platforms.", tag: "Permanent" },
  { title: "Byron Reed Collection", desc: "One of the world's rarest numismatic collections, including the 1804 Dollar. Ancient coins, colonial currency, documents, and manuscripts.", tag: "Permanent" },
  { title: "Omaha at Work", desc: "From Lewis & Clark to the modern metropolis. Entrepreneurial history, the USS Omaha exhibit, and the forces that built a city at the crossroads.", tag: "Permanent" },
  { title: "Home & Family Gallery", desc: "Walk through a rawhide tepee, an 1880s worker's cottage, and a 1940s Dundee Tudor home — three eras of domestic life on the plains.", tag: "Permanent" },
  { title: "The Platform", desc: "Interactive STEAM space for all ages. Science, technology, engineering, art, and mathematics through hands-on play and weekend programming.", tag: "Permanent" },
  { title: "Trans-Mississippi Exposition", desc: "Omaha's 1898 World's Fair drew 2.6 million visitors. Souvenirs, photographs, and artifacts recall the 'White City' that lasted five months.", tag: "Permanent" },
];

const currentExhibits = [
  { title: "The Negro Motorist Green Book", time: "Through May 3, 2026" },
  { title: "Get Building! Bricks at The Durham", time: "Through May 24, 2026" },
  { title: "Heroes & Villains: Disney Costumes", time: "Opens May 23, 2026" },
  { title: "The Signers", time: "Opens August 1, 2026" },
];

function Exhibits() {
  const [hovered, setHovered] = useState(null);
  return (
    <section style={{ padding: `4.5rem ${t.pagePx}` }}>
      <div style={{ maxWidth: t.maxW, margin: "0 auto" }}>
        <SectionHeader label="Permanent Exhibits" heading="History you can walk through." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1px", background: "rgba(242,239,233,0.04)", marginTop: "2.5rem", borderRadius: t.radius, overflow: "hidden" }}>
          {exhibits.map((e, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ background: hovered === i ? t.bgHover : t.bg, padding: "2.25rem 1.75rem", position: "relative", transition: "background 0.35s", cursor: "default", minHeight: "185px", display: "flex", flexDirection: "column" }}
              >
                <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "2px", background: `linear-gradient(90deg, ${t.accent}, ${t.accentDeep})`, transform: hovered === i ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform 0.4s" }} />
                <div style={{ fontFamily: t.display, fontSize: "1.3rem", fontWeight: 400, color: t.text, marginBottom: "0.65rem" }}>{e.title}</div>
                <div style={{ fontFamily: t.body, fontSize: "0.82rem", lineHeight: 1.6, color: t.textDim, fontWeight: 300, flex: 1 }}>{e.desc}</div>
                <div style={{ fontFamily: t.mono, fontSize: "0.55rem", letterSpacing: "0.08em", color: t.accent, opacity: 0.6, marginTop: "1rem", textTransform: "uppercase" }}>{e.tag}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Current / Upcoming */}
        <Reveal delay={0.1} style={{ marginTop: "3rem" }}>
          <div style={{ fontFamily: t.mono, fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: t.teal, marginBottom: "1.25rem" }}>Now & Upcoming</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
            {currentExhibits.map((c, i) => (
              <div key={i} style={{ padding: "1.25rem 1.5rem", background: t.bgElevated, borderRadius: t.radiusSm, borderLeft: `2px solid ${t.accent}` }}>
                <div style={{ fontFamily: t.display, fontSize: "1.05rem", fontWeight: 500, color: t.text, marginBottom: "0.3rem" }}>{c.title}</div>
                <div style={{ fontFamily: t.mono, fontSize: "0.6rem", letterSpacing: "0.06em", color: t.textDim }}>{c.time}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// BUILDING TIMELINE
// ═══════════════════════════════════════════════════════════════
const timeline = [
  { year: "1931", name: "Union Station Opens", detail: "Designed by Gilbert Stanley Underwood for Union Pacific. Glazed terra cotta exterior, Art Deco interior with blue & black Belgian marble. Peter Kiewit & Sons construction." },
  { year: "1971", name: "Station Closes", detail: "Passenger rail declines. The station is donated to the City of Omaha by Union Pacific Railroad in 1973." },
  { year: "1975", name: "Western Heritage Museum", detail: "Reborn as a regional history museum. Renovation led by Charles & Margre Durham and local philanthropists between 1995–97." },
  { year: "Today", name: "The Durham Museum", detail: "A National Historic Landmark, Smithsonian Affiliate, and finalist for 'Best Attraction' in Douglas County. Over 20 permanent galleries and rotating exhibitions." },
];

function Timeline() {
  return (
    <section style={{ padding: `4.5rem ${t.pagePx}`, background: t.bgElevated, borderTop: "1px solid rgba(242,239,233,0.06)", borderBottom: "1px solid rgba(242,239,233,0.06)" }}>
      <div style={{ maxWidth: t.maxW, margin: "0 auto" }}>
        <SectionHeader label="The Station" heading="From rail hub to landmark." />
        <div style={{ marginTop: "2.5rem" }}>
          {timeline.map((b, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "2.5rem", padding: "1.75rem 0", borderBottom: i < timeline.length - 1 ? "1px solid rgba(242,239,233,0.06)" : "none", alignItems: "start" }}>
                <div style={{ fontFamily: t.display, fontSize: "1.8rem", fontWeight: 300, color: t.accent, textAlign: "right" }}>{b.year}</div>
                <div>
                  <div style={{ fontFamily: t.display, fontSize: "1.2rem", fontWeight: 500, color: t.text, marginBottom: "0.35rem" }}>{b.name}</div>
                  <div style={{ fontFamily: t.body, fontSize: "0.85rem", lineHeight: 1.6, color: t.textDim, fontWeight: 300 }}>{b.detail}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// PLAN YOUR VISIT
// ═══════════════════════════════════════════════════════════════
const hours = [
  { day: "Monday", time: "Closed", closed: true },
  { day: "Tue – Sat", time: "10 am – 4 pm" },
  { day: "Sunday", time: "Noon – 4 pm" },
];

const pricing = [
  { label: "Adults", price: "$15" },
  { label: "Seniors (62+)", price: "$12" },
  { label: "Military / Veteran", price: "$12" },
  { label: "Children (3–12)", price: "$8" },
  { label: "Under 2", price: "Free" },
  { label: "Members", price: "Free" },
];

function BlockTitle({ children }) {
  return (
    <div style={{ fontFamily: t.display, fontSize: "1.15rem", fontWeight: 500, color: t.text, marginBottom: "0.85rem", paddingBottom: "0.6rem", borderBottom: "1px solid rgba(242,239,233,0.06)" }}>{children}</div>
  );
}

function PlanVisit() {
  return (
    <section style={{ padding: `4.5rem ${t.pagePx}` }}>
      <div style={{ maxWidth: t.maxW, margin: "0 auto" }}>
        <SectionHeader label="Plan Your Visit" heading="Everything you need to know." />
        <div className="venue-grid-2col" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "3.5rem", marginTop: "2.5rem" }}>
          <Reveal delay={0.1}>
            <div>
              <BlockTitle>Hours</BlockTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {hours.map((h, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: t.body, fontSize: "0.88rem" }}>
                    <span style={{ color: t.textDim }}>{h.day}</span>
                    <span style={{ color: h.closed ? t.accent : t.text, fontWeight: 400 }}>{h.time}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "2rem" }}>
                <BlockTitle>Getting There</BlockTitle>
                <div style={{ fontFamily: t.body, fontSize: "0.88rem", lineHeight: 1.7, color: t.textBody, fontWeight: 300 }}>
                  <p>801 S 10th Street, Omaha, NE 68108. Free parking on-site including bus/RV spaces.</p>
                  <p style={{ marginTop: "0.75rem" }}>Located in the Rail &amp; Commerce Historic District, steps from the Old Market. Wheelchair accessible with electric scooters available at the front desk.</p>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div>
              <BlockTitle>Admission</BlockTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {pricing.map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: t.body, fontSize: "0.88rem" }}>
                    <span style={{ color: t.textDim }}>{p.label}</span>
                    <span style={{ color: p.price === "Free" ? t.green : t.text, fontWeight: 500, fontFamily: t.mono, fontSize: "0.8rem" }}>{p.price}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.15rem", background: t.accentSoft, borderRadius: t.radiusSm, marginTop: "1.5rem", fontFamily: t.body, fontSize: "0.8rem", color: t.text, lineHeight: 1.45 }}>
                <span style={{ fontSize: "1.1rem", flexShrink: 0, opacity: 0.7 }}>✦</span>
                Advance tickets encouraged but not required. Walk-ins welcome.
              </div>
              <div style={{ marginTop: "2rem" }}>
                <BlockTitle>Contact</BlockTitle>
                <div style={{ fontFamily: t.body, fontSize: "0.88rem", lineHeight: 1.7, color: t.textBody, fontWeight: 300 }}>
                  (402) 444-5071<br />info@durhammuseum.org<br />@TheDurhamMuseum on all platforms
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// AMENITIES
// ═══════════════════════════════════════════════════════════════
const amenities = [
  { name: "Soda Fountain", desc: "Original 1931 · Phosphates · Malts · Hot dogs", icon: "🍦" },
  { name: "Hitchcock Shop", desc: "Books · Gifts · Local souvenirs", icon: "◈" },
  { name: "Guided Tours", desc: "Saturdays at 1 PM · Group bookings", icon: "◎" },
  { name: "Private Events", desc: "Weddings · Corporate · Birthday parties", icon: "✧" },
];

function Amenities() {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1px", background: "rgba(242,239,233,0.04)", borderTop: "1px solid rgba(242,239,233,0.06)", borderBottom: "1px solid rgba(242,239,233,0.06)" }}>
      {amenities.map((a, i) => (
        <Reveal key={i} delay={i * 0.06}>
          <div onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ background: hovered === i ? t.bgHover : t.bg, padding: "2.25rem 1.25rem", textAlign: "center", transition: "background 0.3s", cursor: "default" }}>
            <div style={{ fontSize: "1.3rem", marginBottom: "0.75rem", opacity: 0.5 }}>{a.icon}</div>
            <div style={{ fontFamily: t.display, fontSize: "1.05rem", fontWeight: 500, color: t.text, marginBottom: "0.3rem" }}>{a.name}</div>
            <div style={{ fontFamily: t.body, fontSize: "0.7rem", color: t.textDim, lineHeight: 1.5 }}>{a.desc}</div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FOOTER CTA
// ═══════════════════════════════════════════════════════════════
function FooterCTA() {
  return (
    <div style={{ padding: `5rem ${t.pagePx}`, textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 50% 60% at 50% 100%, ${t.accentSoft} 0%, transparent 70%)`, pointerEvents: "none" }} />
      <Reveal>
        <div style={{ position: "relative", maxWidth: "560px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: t.display, fontSize: "clamp(2rem, 4.5vw, 3.2rem)", fontWeight: 300, color: t.text, lineHeight: 1.12, margin: "0 0 1.25rem 0" }}>
            A million stories<br />passed through these doors.
          </h2>
          <p style={{ fontFamily: t.body, fontSize: "0.88rem", color: t.textDim, lineHeight: 1.6, marginBottom: "2.25rem" }}>
            Yours is next. Grab a phosphate at the original soda fountain and stay a while.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://durhammuseum.org/visit/hours-and-admission/" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.8rem 1.75rem", background: t.teal, color: t.bg, fontFamily: t.body, fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.03em", textDecoration: "none", borderRadius: "100px", border: `1px solid ${t.teal}`, cursor: "pointer" }}>
              Plan Your Visit →
            </a>
            <a href="https://durhammuseum.org/current-exhibits/" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", padding: "0.8rem 1.75rem", background: "transparent", color: t.cream, fontFamily: t.body, fontSize: "0.78rem", fontWeight: 400, letterSpacing: "0.03em", textDecoration: "none", borderRadius: "100px", border: "1px solid rgba(232,226,214,0.15)", cursor: "pointer" }}>
              Current Exhibits
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SITE FOOTER
// ═══════════════════════════════════════════════════════════════
function SiteFooter() {
  return (
    <footer style={{ padding: "1.75rem 1.5rem", borderTop: "1px solid rgba(242,239,233,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
      <div style={{ fontFamily: t.mono, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(242,239,233,0.2)" }}>
        <span style={{ color: t.teal, fontWeight: 600 }}>GO:</span> Guide to Omaha · Venue Page
      </div>
      <div style={{ display: "flex", gap: "1.25rem" }}>
        {[{ label: "durhammuseum.org", href: "https://durhammuseum.org" }, { label: "(402) 444-5071", href: "tel:4024445071" }].map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noreferrer" style={{ fontFamily: t.mono, fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(242,239,233,0.25)", textDecoration: "none" }}>{link.label}</a>
        ))}
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE COMPONENT — default export
// ═══════════════════════════════════════════════════════════════
export default function DurhamVenuePage() {
  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ background: t.bg, color: t.text, minHeight: "100svh" }}>
      <style>{`
        @keyframes goFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes goPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
        body { margin: 0; }
        * { box-sizing: border-box; }
        @media (max-width: 720px) {
          .venue-grid-2col { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
          .venue-hero h1 { font-size: clamp(2.2rem, 8vw, 4rem) !important; }
        }
      `}</style>
      <GoBar />
      <Hero />
      <VitalsBar />
      <About />
      <GreatHall />
      <Exhibits />
      <Timeline />
      <PlanVisit />
      <Amenities />
      <FooterCTA />
      <SiteFooter />
    </div>
  );
}
