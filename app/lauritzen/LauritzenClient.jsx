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

  // Lauritzen venue — botanical greens + earthy terracotta
  accent: "#7BA858",
  accentSoft: "rgba(123,168,88,0.12)",
  accentDeep: "#5C8A3E",
  earth: "#C4956B",
  earthSoft: "rgba(196,149,107,0.10)",

  display: "'Inter', system-ui, -apple-system, sans-serif",
  body: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'IBM Plex Mono', 'SF Mono', monospace",
  pagePx: "clamp(1rem, 4vw, 2.5rem)",
  maxW: "1100px",
  radius: "10px",
  radiusSm: "6px",
};

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
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(18px)", transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`, ...style }}>{children}</div>
  );
}

function GoBar() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem", background: "rgba(20,22,24,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(242,239,233,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <span style={{ fontFamily: t.mono, fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: t.teal }}>GO:</span>
        <span style={{ fontFamily: t.body, fontSize: "0.7rem", fontWeight: 400, letterSpacing: "0.06em", color: t.cream }}>Guide to Omaha</span>
      </div>
      <div style={{ display: "flex", gap: "0.35rem" }}>
        {["Venues", "Events", "Explore"].map((l) => (
          <span key={l} style={{ fontFamily: t.body, fontSize: "0.6rem", letterSpacing: "0.04em", color: t.cream, padding: "0.35rem 0.8rem", borderRadius: "100px", border: "1px solid rgba(242,239,233,0.08)", cursor: "pointer" }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HERO — organic leaf motif instead of geometric shapes
// ═══════════════════════════════════════════════════════════════
function Hero() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: `0 ${t.pagePx} 3rem`, background: t.bg, overflow: "hidden" }}>
      {/* Hero image */}
      <img loading="lazy" src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&q=70&auto=format" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.2, pointerEvents: "none" }} />
      {/* Organic glow — dappled light through a canopy */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 40% 30% at 30% 20%, rgba(123,168,88,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 70% 60%, rgba(123,168,88,0.05) 0%, transparent 55%), radial-gradient(ellipse 35% 50% at 85% 25%, rgba(196,149,107,0.06) 0%, transparent 55%)`, pointerEvents: "none" }} />
      {/* Organic curve — abstract leaf */}
      <svg style={{ position: "absolute", top: "8vh", right: "4vw", width: "280px", height: "280px", opacity: 0.06, pointerEvents: "none" }} viewBox="0 0 280 280" fill="none" stroke="rgba(123,168,88,1)" strokeWidth="1">
        <path d="M140 20 C60 60 20 140 60 220 C100 280 200 260 240 180 C260 130 220 40 140 20Z" />
        <path d="M140 60 C100 90 80 140 100 200" />
        <path d="M140 60 C170 100 180 160 160 210" />
      </svg>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg, #141618) 0%, transparent 40%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: "780px" }}>
        <div style={{ fontFamily: t.mono, fontSize: "0.6rem", fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", color: t.accent, marginBottom: "1.25rem", animation: "goFadeUp 0.8s ease 0.2s both" }}>
          Nebraska&apos;s Premier Botanical Garden · Est. 1994
        </div>
        <h1 style={{ fontFamily: t.display, fontSize: "clamp(3.2rem, 9vw, 7rem)", fontWeight: 300, lineHeight: 0.9, color: t.text, letterSpacing: "-0.02em", margin: 0, animation: "goFadeUp 1s ease 0.4s both" }}>
          Lauritzen<br />
          <em style={{ fontStyle: "italic", color: t.accent }}>Gardens</em>
        </h1>
        <p style={{ fontFamily: t.body, fontSize: "1rem", fontWeight: 300, color: t.textDim, lineHeight: 1.6, maxWidth: "460px", marginTop: "1.5rem", animation: "goFadeUp 1s ease 0.6s both" }}>
          100 acres of rolling bluffs overlooking the Missouri River — over 20 themed gardens, a tropical conservatory, and 3 miles of trails through one of the nation&apos;s most outstanding botanical collections.
        </p>
        <div style={{ display: "flex", gap: "0.6rem", marginTop: "1.75rem", flexWrap: "wrap", animation: "goFadeUp 1s ease 0.8s both" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", background: t.accentSoft, border: "1px solid rgba(123,168,88,0.18)", borderRadius: "100px", fontFamily: t.mono, fontSize: "0.6rem", letterSpacing: "0.08em", color: t.accent, textTransform: "uppercase" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.green, animation: "goPulse 2s ease infinite" }} />
            Open Daily 9–5
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", background: t.earthSoft, border: "1px solid rgba(196,149,107,0.18)", borderRadius: "100px", fontFamily: t.mono, fontSize: "0.6rem", letterSpacing: "0.08em", color: t.earth, textTransform: "uppercase" }}>
            250,000+ Visitors / Year
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// VITALS
// ═══════════════════════════════════════════════════════════════
function VitalsBar() {
  const vitals = [
    { label: "Hours", value: "Open Daily", accent: "9 am – 5 pm" },
    { label: "Location", value: "100 Bancroft Street" },
    { label: "Adults", accent: "$18", value: " · Kids $11" },
  ];
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

function SectionHeader({ label, heading }) {
  return (
    <Reveal>
      <div style={{ fontFamily: t.mono, fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: t.teal, marginBottom: "0.75rem" }}>{label}</div>
      <h2 style={{ fontFamily: t.display, fontSize: "clamp(1.8rem, 4.5vw, 3rem)", fontWeight: 300, lineHeight: 1.1, color: t.text, margin: 0, maxWidth: "560px" }}>{heading}</h2>
    </Reveal>
  );
}

function BlockTitle({ children }) {
  return <div style={{ fontFamily: t.display, fontSize: "1.15rem", fontWeight: 500, color: t.text, marginBottom: "0.85rem", paddingBottom: "0.6rem", borderBottom: "1px solid rgba(242,239,233,0.06)" }}>{children}</div>;
}

// ═══════════════════════════════════════════════════════════════
// ABOUT
// ═══════════════════════════════════════════════════════════════
function About() {
  const stats = [
    { num: "100", label: "Acres" },
    { num: "20+", label: "Themed Gardens" },
    { num: "3 mi", label: "of Trails" },
  ];
  return (
    <section style={{ padding: `4.5rem ${t.pagePx}`, borderBottom: "1px solid rgba(242,239,233,0.06)" }}>
      <div style={{ maxWidth: t.maxW, margin: "0 auto" }}>
        <SectionHeader label="About" heading="A living laboratory on the bluffs." />
        <div className="venue-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3.5rem", marginTop: "2.5rem" }}>
          <Reveal delay={0.1}>
            <div style={{ fontFamily: t.body, fontSize: "0.95rem", fontWeight: 300, lineHeight: 1.75, color: t.textBody }}>
              <p>What began as a vision in the 1980s — and a former limestone quarry — opened in 1994 as the Omaha Botanical Gardens. Renamed for the Lauritzen family in 2001, the garden has grown into a 100-acre botanical institution on rolling bluffs overlooking the Missouri River, just northeast of the Henry Doorly Zoo.</p>
              <p style={{ marginTop: "1.1rem" }}>With the 32,000 sq ft Visitor &amp; Education Center (2001), the Marjorie K. Daugherty Conservatory (2014), and the brand-new Sofia&apos;s Play Garden (2025), Lauritzen Gardens attracts over 250,000 visitors a year and is ranked among the world&apos;s most outstanding botanical gardens.</p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div>
              <div style={{ fontFamily: t.display, fontSize: "1.6rem", fontWeight: 300, fontStyle: "italic", lineHeight: 1.35, color: t.text, paddingLeft: "1.75rem", borderLeft: `2px solid ${t.accent}` }}>
                &ldquo;Ranked among the most outstanding botanical gardens in the world.&rdquo;
              </div>
              <div style={{ fontFamily: t.mono, fontSize: "0.6rem", letterSpacing: "0.1em", color: t.textDim, paddingLeft: "1.75rem", marginTop: "0.6rem" }}>— 2023 International Recognition</div>
              <div style={{ display: "flex", gap: "2.5rem", marginTop: "2.5rem" }}>
                {stats.map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: t.display, fontSize: "2.5rem", fontWeight: 300, color: t.text, lineHeight: 1 }}>{s.num}</div>
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
// GARDENS
// ═══════════════════════════════════════════════════════════════
const gardens = [
  { title: "Rose Garden", desc: "The garden's first major feature, open since 1995. Hundreds of cultivars in peak bloom from June through October — labeled and meticulously maintained.", tag: "Signature" },
  { title: "Daugherty Conservatory", desc: "A 17,000 sq ft glass conservatory housing tropical and temperate zones year-round — palms, orchids, bromeliads, and aquatic plants regardless of Nebraska weather.", tag: "Indoor · Year-Round" },
  { title: "Victorian Garden", desc: "Formal bedding displays and ornamental patterns inspired by 19th-century garden design. Seasonal rotations of annuals create a living tapestry of color.", tag: "Outdoor" },
  { title: "Model Railroad Garden", desc: "Miniature trains wind through scaled garden landscapes — a perennial favorite for families and a hit with children of all ages since 2007.", tag: "Family Favorite" },
  { title: "Sofia's Play Garden", desc: "Brand new for 2025. A nature-focused playground north of the visitor center — hands-on learning, climbing, and exploration for children.", tag: "New · 2025" },
  { title: "Woodland Trail & Waterfall", desc: "Three miles of shaded paths wind through native woodlands, meadows, and past a cascading waterfall. Birdsong, benches, and quiet everywhere.", tag: "Trails" },
];

function Gardens() {
  const [hovered, setHovered] = useState(null);
  return (
    <section style={{ padding: `4.5rem ${t.pagePx}`, background: t.bgElevated, position: "relative", overflow: "hidden" }}>
      <svg style={{ position: "absolute", bottom: "-60px", left: "-40px", width: "300px", height: "300px", opacity: 0.03, pointerEvents: "none" }} viewBox="0 0 300 300" fill="none" stroke="rgba(123,168,88,1)" strokeWidth="1">
        <circle cx="150" cy="150" r="140" />
        <circle cx="150" cy="150" r="100" />
        <circle cx="150" cy="150" r="60" />
      </svg>
      <div style={{ maxWidth: t.maxW, margin: "0 auto", position: "relative" }}>
        <SectionHeader label="The Gardens" heading="Over 20 gardens. Every season different." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1px", background: "rgba(242,239,233,0.04)", marginTop: "2.5rem", borderRadius: t.radius, overflow: "hidden" }}>
          {gardens.map((g, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ background: hovered === i ? t.bgHover : t.bgElevated, padding: "2.25rem 1.75rem", position: "relative", transition: "background 0.35s", cursor: "default", minHeight: "185px", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "2px", background: `linear-gradient(90deg, ${t.accent}, ${t.earth})`, transform: hovered === i ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform 0.4s" }} />
                <div style={{ fontFamily: t.display, fontSize: "1.3rem", fontWeight: 400, color: t.text, marginBottom: "0.65rem" }}>{g.title}</div>
                <div style={{ fontFamily: t.body, fontSize: "0.82rem", lineHeight: 1.6, color: t.textDim, fontWeight: 300, flex: 1 }}>{g.desc}</div>
                <div style={{ fontFamily: t.mono, fontSize: "0.55rem", letterSpacing: "0.08em", color: t.accent, opacity: 0.6, marginTop: "1rem", textTransform: "uppercase" }}>{g.tag}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Current Exhibits */}
        <Reveal delay={0.1} style={{ marginTop: "3rem" }}>
          <div style={{ fontFamily: t.mono, fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: t.teal, marginBottom: "1.25rem" }}>Now on View</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
            {[
              { title: "TROLLS: Save the Humans", sub: "Thomas Dambo · Through May 18, 2026" },
              { title: "Orchid Exhibition", sub: "Hundreds in peak bloom · Floral Display Hall" },
              { title: "Spring EGGstravaganza", sub: "Family events · Activity tickets" },
            ].map((c, i) => (
              <div key={i} style={{ padding: "1.25rem 1.5rem", background: t.bgElevated, borderRadius: t.radiusSm, borderLeft: `2px solid ${t.accent}` }}>
                <div style={{ fontFamily: t.display, fontSize: "1.05rem", fontWeight: 500, color: t.text, marginBottom: "0.3rem" }}>{c.title}</div>
                <div style={{ fontFamily: t.mono, fontSize: "0.6rem", letterSpacing: "0.06em", color: t.textDim }}>{c.sub}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// TIMELINE
// ═══════════════════════════════════════════════════════════════
const timeline = [
  { year: "1994", name: "Omaha Botanical Gardens Opens", detail: "First plantings on a former quarry site. The Rose Garden becomes the first major public feature in 1995." },
  { year: "2001", name: "Visitor & Education Center", detail: "32,000 sq ft with a 65-foot vaulted glass roof, floral display hall, café, gift shop, and horticultural library. Renamed Lauritzen Gardens." },
  { year: "2014", name: "Daugherty Conservatory", detail: "A $20 million, 17,000 sq ft glass conservatory bringing tropical and temperate plants to Nebraska year-round." },
  { year: "2025", name: "Sofia's Play Garden", detail: "A nature-focused children's playground. The garden now spans 100+ acres with over 20 distinct gardens and 3 miles of trails." },
];

function Timeline() {
  return (
    <section style={{ padding: `4.5rem ${t.pagePx}`, borderTop: "1px solid rgba(242,239,233,0.06)", borderBottom: "1px solid rgba(242,239,233,0.06)" }}>
      <div style={{ maxWidth: t.maxW, margin: "0 auto" }}>
        <SectionHeader label="Growth" heading="From quarry to world-class garden." />
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
function PlanVisit() {
  const pricing = [
    { label: "Adults (13–64)", price: "$18" },
    { label: "Seniors (65+)", price: "$15" },
    { label: "Military", price: "$15" },
    { label: "Children (3–12)", price: "$11" },
    { label: "Under 2", price: "Free" },
    { label: "Members", price: "Free" },
  ];
  return (
    <section style={{ padding: `4.5rem ${t.pagePx}` }}>
      <div style={{ maxWidth: t.maxW, margin: "0 auto" }}>
        <SectionHeader label="Plan Your Visit" heading="Everything you need to know." />
        <div className="venue-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3.5rem", marginTop: "2.5rem" }}>
          <Reveal delay={0.1}>
            <div>
              <BlockTitle>Hours</BlockTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: t.body, fontSize: "0.88rem" }}>
                  <span style={{ color: t.textDim }}>Daily</span><span style={{ color: t.text, fontWeight: 400 }}>9 am – 5 pm</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: t.body, fontSize: "0.88rem" }}>
                  <span style={{ color: t.textDim }}>Sofia&apos;s Play Garden</span><span style={{ color: t.text, fontWeight: 400 }}>Closes 4:30 pm</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: t.body, fontSize: "0.88rem" }}>
                  <span style={{ color: t.textDim }}>Last Entry</span><span style={{ color: t.earth, fontWeight: 400 }}>4 pm</span>
                </div>
              </div>
              <div style={{ marginTop: "2rem" }}>
                <BlockTitle>Getting There</BlockTitle>
                <div style={{ fontFamily: t.body, fontSize: "0.88rem", lineHeight: 1.7, color: t.textBody, fontWeight: 300 }}>
                  <p>100 Bancroft Street, Omaha, NE 68108. From I-80, take the 13th Street exit north to Bancroft, then east. Free parking for 550+ cars. Bus/motorcoach parking at front entrance.</p>
                  <p style={{ marginTop: "0.75rem" }}>Adjacent to the Henry Doorly Zoo. Tram tours available May–October ($3 members / $5 general) — a narrated, one-hour ride through all 100 acres.</p>
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
              <div style={{ fontFamily: t.mono, fontSize: "0.6rem", color: t.textDim, marginTop: "0.6rem", letterSpacing: "0.04em" }}>All prices plus tax</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.15rem", background: t.accentSoft, borderRadius: t.radiusSm, marginTop: "1.25rem", fontFamily: t.body, fontSize: "0.8rem", color: t.text, lineHeight: 1.45 }}>
                <span style={{ fontSize: "1.1rem", flexShrink: 0, opacity: 0.7 }}>✦</span>
                Advance tickets encouraged. Walk-ins welcome. No outside food or beverages.
              </div>
              <div style={{ marginTop: "2rem" }}>
                <BlockTitle>Contact</BlockTitle>
                <div style={{ fontFamily: t.body, fontSize: "0.88rem", lineHeight: 1.7, color: t.textBody, fontWeight: 300 }}>
                  (402) 346-4002<br />@lauritzengarden
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
  { name: "Café & Coffee", desc: "Indoor dining · Seasonal menus · Garden views", icon: "☕" },
  { name: "Gift Shop", desc: "Plants · Garden tools · Local goods", icon: "◈" },
  { name: "Tram Tours", desc: "May–Oct · Narrated · 1 hour · All 100 acres", icon: "◎" },
  { name: "Private Events", desc: "Weddings · Corporate · Photography sessions", icon: "✧" },
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
            A hundred acres.<br />Every season, a new garden.
          </h2>
          <p style={{ fontFamily: t.body, fontSize: "0.88rem", color: t.textDim, lineHeight: 1.6, marginBottom: "2.25rem" }}>
            From daffodil walks to tropical orchids — the garden is always in bloom somewhere. Come find your quiet.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://www.lauritzengardens.org/tickets/" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.8rem 1.75rem", background: t.teal, color: t.bg, fontFamily: t.body, fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.03em", textDecoration: "none", borderRadius: "100px", border: `1px solid ${t.teal}`, cursor: "pointer" }}>
              Get Tickets →
            </a>
            <a href="https://www.lauritzengardens.org/Visit/Events_and_Exhibits/" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", padding: "0.8rem 1.75rem", background: "transparent", color: t.cream, fontFamily: t.body, fontSize: "0.78rem", fontWeight: 400, letterSpacing: "0.03em", textDecoration: "none", borderRadius: "100px", border: "1px solid rgba(232,226,214,0.15)", cursor: "pointer" }}>
              Events & Exhibits
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer style={{ padding: "1.75rem 1.5rem", borderTop: "1px solid rgba(242,239,233,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
      <div style={{ fontFamily: t.mono, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(242,239,233,0.2)" }}>
        <span style={{ color: t.teal, fontWeight: 600 }}>GO:</span> Guide to Omaha · Venue Page
      </div>
      <div style={{ display: "flex", gap: "1.25rem" }}>
        {[{ label: "lauritzengardens.org", href: "https://www.lauritzengardens.org" }, { label: "(402) 346-4002", href: "tel:4023464002" }].map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noreferrer" style={{ fontFamily: t.mono, fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(242,239,233,0.25)", textDecoration: "none" }}>{link.label}</a>
        ))}
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE — default export
// ═══════════════════════════════════════════════════════════════
export default function LauritzenVenuePage() {
  return (
    <div style={{ background: t.bg, color: t.text, minHeight: "100vh" }}>
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
      <Gardens />
      <Timeline />
      <PlanVisit />
      <Amenities />
      <FooterCTA />
      <SiteFooter />
    </div>
  );
}
