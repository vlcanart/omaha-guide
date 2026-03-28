"use client";

import { useState, useEffect, useRef } from "react";
import { BottomNav } from "../components/BottomNav";

const t = {
  bg: "#141618", bgElevated: "#1A1C1F", bgCard: "#1E2023", bgHover: "#252729",
  surface: "#2A2D30", text: "#F2EFE9", textMuted: "#B8B3AB", textBody: "rgba(242,239,233,0.85)", textDim: "#7D7870",
  cream: "#E8E2D6", teal: "#5EC4B6", green: "#6BBF7A",
  // Luminarium — electric violet + bright cyan, science-center energy
  accent: "#8B6CE0", accentSoft: "rgba(139,108,224,0.12)",
  accentDeep: "#6B4CC0", cyan: "#3DD6E8", cyanSoft: "rgba(61,214,232,0.10)",
  display: "'Inter', system-ui, -apple-system, sans-serif",
  body: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'IBM Plex Mono', 'SF Mono', monospace",
  pagePx: "clamp(1rem, 4vw, 2.5rem)", maxW: "1100px", radius: "10px", radiusSm: "6px",
};

function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold, rootMargin: "0px 0px -40px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal();
  return <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(18px)", transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`, ...style }}>{children}</div>;
}

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

function Hero() {
  return (
    <div style={{ position: "relative", minHeight: "100svh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: `0 ${t.pagePx} 3rem`, background: t.bg, overflow: "hidden" }}>
      {/* Hero image */}
      <img loading="lazy" src="/images/content/venues/kiewit-luminarium/kiewit-luminarium-1.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.15, pointerEvents: "none" }} />
      {/* Electric glow — dual plasma spots */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 45% 35% at 60% 30%, rgba(139,108,224,0.09) 0%, transparent 60%), radial-gradient(ellipse 40% 50% at 25% 75%, rgba(61,214,232,0.06) 0%, transparent 55%)`, pointerEvents: "none" }} />
      {/* Geometric: stellated icosahedron hint — intersecting triangles */}
      <svg style={{ position: "absolute", top: "8vh", right: "5vw", width: "240px", height: "240px", opacity: 0.06, pointerEvents: "none" }} viewBox="0 0 240 240" fill="none" stroke="rgba(139,108,224,1)" strokeWidth="0.8">
        <polygon points="120,20 220,180 20,180" />
        <polygon points="120,220 20,60 220,60" />
        <circle cx="120" cy="120" r="70" />
      </svg>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(20,22,24,1) 0%, transparent 40%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: "780px" }}>
        <div style={{ fontFamily: t.mono, fontSize: "0.6rem", fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", color: t.accent, marginBottom: "1.25rem", animation: "goFadeUp 0.8s ease 0.2s both" }}>
          Omaha&apos;s Interactive Science Center · Opened 2023
        </div>
        <h1 style={{ fontFamily: t.display, fontSize: "clamp(3.2rem, 9vw, 7rem)", fontWeight: 300, lineHeight: 0.9, color: t.text, letterSpacing: "-0.02em", margin: 0, animation: "goFadeUp 1s ease 0.4s both" }}>
          Kiewit<br /><em style={{ fontStyle: "italic", color: t.accent }}>Luminarium</em>
        </h1>
        <p style={{ fontFamily: t.body, fontSize: "1rem", fontWeight: 300, color: t.textDim, lineHeight: 1.6, maxWidth: "470px", marginTop: "1.5rem", animation: "goFadeUp 1s ease 0.6s both" }}>
          82,000 square feet of hands-on science, art, and human perception on the Missouri Riverfront — co-created with San Francisco&apos;s Exploratorium and designed by HDR. Over 120 interactive exhibits for every age.
        </p>
        <div style={{ display: "flex", gap: "0.6rem", marginTop: "1.75rem", flexWrap: "wrap", animation: "goFadeUp 1s ease 0.8s both" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", background: t.accentSoft, border: "1px solid rgba(139,108,224,0.18)", borderRadius: "100px", fontFamily: t.mono, fontSize: "0.6rem", letterSpacing: "0.08em", color: t.accent, textTransform: "uppercase" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.cyan, animation: "goPulse 2s ease infinite" }} />
            $101M · Privately Funded
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", background: t.cyanSoft, border: "1px solid rgba(61,214,232,0.18)", borderRadius: "100px", fontFamily: t.mono, fontSize: "0.6rem", letterSpacing: "0.08em", color: t.cyan, textTransform: "uppercase" }}>
            Exploratorium Partner
          </span>
        </div>
      </div>
    </div>
  );
}

function VitalsBar() {
  const vitals = [
    { label: "Hours", value: "Tue–Sun 10–5", accent: "Wed til 7" },
    { label: "Location", value: "345 Riverfront Drive" },
    { label: "Adults", accent: "$18", value: " · Youth $13" },
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

function About() {
  const stats = [
    { num: "120+", label: "Interactive Exhibits" },
    { num: "82K", label: "Square Feet" },
    { num: "4", label: "Gallery Zones" },
  ];
  return (
    <section style={{ padding: `4.5rem ${t.pagePx}`, borderBottom: "1px solid rgba(242,239,233,0.06)" }}>
      <div style={{ maxWidth: t.maxW, margin: "0 auto" }}>
        <SectionHeader label="About" heading="Where curiosity has no age limit." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "3.5rem", marginTop: "2.5rem" }}>
          <Reveal delay={0.1}>
            <div style={{ fontFamily: t.body, fontSize: "0.95rem", fontWeight: 300, lineHeight: 1.75, color: t.textBody }}>
              <p>The Kiewit Luminarium is Omaha&apos;s first dedicated science center — a $101 million, privately funded institution that opened April 15, 2023, at Lewis &amp; Clark Landing on the Missouri Riverfront. It&apos;s part workshop, part museum, part playground.</p>
              <p style={{ marginTop: "1.1rem" }}>Co-created with San Francisco&apos;s Exploratorium — one of the nation&apos;s premier science museums — and designed by HDR as a contemporary &ldquo;machine shed&rdquo; container, the building lifts off the ground toward downtown and anchors into the riverfront boardwalk, with vertical shading fins that animate the facade as pedestrians pass.</p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div>
              <div style={{ fontFamily: t.display, fontSize: "1.6rem", fontWeight: 300, fontStyle: "italic", lineHeight: 1.35, color: t.text, paddingLeft: "1.75rem", borderLeft: `2px solid ${t.accent}` }}>
                &ldquo;Finding the science and the humanity in the everyday.&rdquo;
              </div>
              <div style={{ fontFamily: t.mono, fontSize: "0.6rem", letterSpacing: "0.1em", color: t.textDim, paddingLeft: "1.75rem", marginTop: "0.6rem" }}>— Silva Raker, Inaugural CEO</div>
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

const galleries = [
  { title: "Catch Waves", desc: "Dive into motion, sound, light, and heat. Swing pendulums, make waves, create shadows, see your body heat, and play music — hands-on exploration of universal physics.", tag: "Davis & Fazzone Gallery" },
  { title: "Dig Deeper", desc: "Explore land, water, structures, and tools with Greater Omaha as the focus. Stream dynamics, groundwater pumps, gear systems, and chain reactions.", tag: "Union Pacific Gallery" },
  { title: "Find Yourself", desc: "Explore cells, self, and community. Zoom in to see how cells make a person, then zoom out to see how people make a society. Sensitive, sociable, self-revelatory.", tag: "Nebraska Medicine Gallery" },
  { title: "Make It Count", desc: "Climb into shapes, patterns, and numbers. Assemble complex geometric patterns, test super-sized dominoes, and explore financial literacy through play.", tag: "FNBO Gallery" },
  { title: "Geometry Playground", desc: "Large-scale immersive structures — a gyroid, stellated icosahedron, truncated octahedron, and helix — invite full-body play in geometric space.", tag: "Anne M. Hubbard" },
  { title: "The Grid", desc: "A striking two-story tower exploring innovation, repair, and the everyday skills of community care. Home improvement meets systems thinking meets haute couture.", tag: "Grewcock Family" },
];

function Galleries() {
  const [hovered, setHovered] = useState(null);
  return (
    <section style={{ padding: `4.5rem ${t.pagePx}`, background: t.bgElevated, position: "relative", overflow: "hidden" }}>
      <svg style={{ position: "absolute", top: "-80px", right: "-60px", width: "320px", height: "320px", opacity: 0.03, pointerEvents: "none" }} viewBox="0 0 320 320" fill="none" stroke="rgba(139,108,224,1)" strokeWidth="0.7">
        <polygon points="160,20 300,260 20,260" /><polygon points="160,300 20,60 300,60" />
      </svg>
      <div style={{ maxWidth: t.maxW, margin: "0 auto", position: "relative" }}>
        <SectionHeader label="Exhibits" heading="120+ ways to get your hands on science." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1px", background: "rgba(242,239,233,0.04)", marginTop: "2.5rem", borderRadius: t.radius, overflow: "hidden" }}>
          {galleries.map((g, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ background: hovered === i ? t.bgHover : t.bgElevated, padding: "2.25rem 1.75rem", position: "relative", transition: "background 0.35s", cursor: "default", minHeight: "185px", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "2px", background: `linear-gradient(90deg, ${t.accent}, ${t.cyan})`, transform: hovered === i ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform 0.4s" }} />
                <div style={{ fontFamily: t.display, fontSize: "1.3rem", fontWeight: 400, color: t.text, marginBottom: "0.65rem" }}>{g.title}</div>
                <div style={{ fontFamily: t.body, fontSize: "0.82rem", lineHeight: 1.6, color: t.textDim, fontWeight: 300, flex: 1 }}>{g.desc}</div>
                <div style={{ fontFamily: t.mono, fontSize: "0.55rem", letterSpacing: "0.08em", color: t.accent, opacity: 0.6, marginTop: "1rem", textTransform: "uppercase" }}>{g.tag}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1} style={{ marginTop: "3rem" }}>
          <div style={{ fontFamily: t.mono, fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: t.teal, marginBottom: "1.25rem" }}>Now & Upcoming</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
            {[
              { title: "Finding Titanic: The Secret Mission", sub: "Feb 7 – Apr 26, 2026" },
              { title: "Night Light (21+)", sub: "Adults-only evenings of discovery" },
              { title: "BioDiscovery Lab", sub: "Hands-on biodesign · Ages 8+" },
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

function PlanVisit() {
  const pricing = [
    { label: "Adults (18+)", price: "$18" },
    { label: "Seniors / Teachers / Military", price: "$15" },
    { label: "Youth (4–17)", price: "$13" },
    { label: "Kids (3 & under)", price: "Free" },
    { label: "Indigenous (Tribal ID)", price: "Free" },
    { label: "Members", price: "Free" },
  ];
  const hours = [
    { day: "Monday", time: "Closed", closed: true },
    { day: "Tue, Thu–Sun", time: "10 am – 5 pm" },
    { day: "Wednesday", time: "10 am – 7 pm" },
  ];
  return (
    <section style={{ padding: `4.5rem ${t.pagePx}` }}>
      <div style={{ maxWidth: t.maxW, margin: "0 auto" }}>
        <SectionHeader label="Plan Your Visit" heading="Everything you need to know." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "3.5rem", marginTop: "2.5rem" }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.15rem", background: t.accentSoft, borderRadius: t.radiusSm, marginTop: "1.25rem", fontFamily: t.body, fontSize: "0.8rem", color: t.text, lineHeight: 1.45 }}>
                <span style={{ fontSize: "1.1rem", flexShrink: 0, opacity: 0.7 }}>⚡</span>
                <strong style={{ fontWeight: 500 }}>Wed 3–7 PM:</strong>&nbsp;Discounted admission — $7 adults / $5 youth
              </div>
              <div style={{ marginTop: "2rem" }}>
                <BlockTitle>Getting There</BlockTitle>
                <div style={{ fontFamily: t.body, fontSize: "0.88rem", lineHeight: 1.7, color: t.textBody, fontWeight: 300 }}>
                  <p>345 Riverfront Drive, Omaha, NE 68102. Lewis &amp; Clark Landing on the Missouri Riverfront. Free parking for all guests.</p>
                  <p style={{ marginTop: "0.75rem" }}>Steps from Gene Leahy Mall, the Bob Kerrey Pedestrian Bridge, and CHI Health Center. Part of the $400M+ riverfront revitalization.</p>
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
              <div style={{ fontFamily: t.mono, fontSize: "0.6rem", color: t.textDim, marginTop: "0.6rem", letterSpacing: "0.04em" }}>Museums for All: $1 w/ SNAP EBT or eWIC</div>
              <div style={{ marginTop: "2rem" }}>
                <BlockTitle>Contact</BlockTitle>
                <div style={{ fontFamily: t.body, fontSize: "0.88rem", lineHeight: 1.7, color: t.textBody, fontWeight: 300 }}>
                  345 Riverfront Drive<br />Omaha, NE 68102<br />@kiewitluminarium
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const amenities = [
  { name: "Fig. Café", desc: "Sourdough · Sandwiches · Beer & wine · Full coffee bar", icon: "☕" },
  { name: "Luminarium Store", desc: "Science kits · Books · Unique gifts", icon: "◈" },
  { name: "Maker Space", desc: "Hands-on demos · Led by Luminators", icon: "⚙" },
  { name: "Private Events", desc: "Corporate · Field trips · Birthday parties", icon: "✧" },
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

function FooterCTA() {
  return (
    <div style={{ padding: `5rem ${t.pagePx}`, textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 50% 60% at 50% 100%, ${t.accentSoft} 0%, transparent 70%)`, pointerEvents: "none" }} />
      <Reveal>
        <div style={{ position: "relative", maxWidth: "560px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: t.display, fontSize: "clamp(2rem, 4.5vw, 3.2rem)", fontWeight: 300, color: t.text, lineHeight: 1.12, margin: "0 0 1.25rem 0" }}>
            You&apos;ll never look at<br />a pothole the same way.
          </h2>
          <p style={{ fontFamily: t.body, fontSize: "0.88rem", color: t.textDim, lineHeight: 1.6, marginBottom: "2.25rem" }}>
            Science is everywhere. The Luminarium just makes it impossible to ignore. Bring your hands, your curiosity, and everyone you know.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://kiewitluminarium.org/tickets/" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.8rem 1.75rem", background: t.teal, color: t.bg, fontFamily: t.body, fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.03em", textDecoration: "none", borderRadius: "100px", border: `1px solid ${t.teal}`, cursor: "pointer" }}>Get Tickets →</a>
            <a href="https://kiewitluminarium.org/exhibits/" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", padding: "0.8rem 1.75rem", background: "transparent", color: t.cream, fontFamily: t.body, fontSize: "0.78rem", fontWeight: 400, letterSpacing: "0.03em", textDecoration: "none", borderRadius: "100px", border: "1px solid rgba(232,226,214,0.15)", cursor: "pointer" }}>Explore Exhibits</a>
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
        {[{ label: "kiewitluminarium.org", href: "https://kiewitluminarium.org" }, { label: "345 Riverfront Dr", href: "https://maps.google.com/?q=345+Riverfront+Drive+Omaha+NE" }].map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noreferrer" style={{ fontFamily: t.mono, fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(242,239,233,0.25)", textDecoration: "none" }}>{link.label}</a>
        ))}
      </div>
    </footer>
  );
}

export default function LuminariumVenuePage() {
  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ background: t.bg, color: t.text, minHeight: "100svh", paddingBottom: 80 }}>
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
      <Hero />
      <VitalsBar />
      <About />
      <Galleries />
      <PlanVisit />
      <Amenities />
      <FooterCTA />
      <SiteFooter />
      <BottomNav active="explore" />
    </div>
  );
}
