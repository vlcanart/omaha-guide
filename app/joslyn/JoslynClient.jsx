"use client";

import { useState, useEffect, useRef } from "react";
import { useResponsive } from "../components/ResponsiveProvider";
import { BottomNav } from "../components/BottomNav";

// ═══════════════════════════════════════════════════════════════
// GO: Guide to Omaha — Design Tokens
// ═══════════════════════════════════════════════════════════════
const t = {
  // Core palette
  bg: "#141618",
  bgElevated: "#1A1C1F",
  bgCard: "#1E2023",
  bgHover: "#252729",
  surface: "#2A2D30",
  text: "#F2EFE9",
  textMuted: "#B8B3AB",
  textDim: "#7D7870",
  cream: "#E8E2D6",
  teal: "#5EC4B6",
  green: "#6BBF7A",

  // Joslyn venue accent — warm terracotta drawn from the pink marble
  accent: "#C4785B",
  accentSoft: "rgba(196,120,91,0.12)",
  gold: "#BDA26B",
  goldSoft: "rgba(189,162,107,0.10)",

  // Typography — aligned with site-wide Inter
  display: "'Inter', system-ui, -apple-system, sans-serif",
  body: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'IBM Plex Mono', 'SF Mono', monospace",
  textBody: "rgba(242,239,233,0.85)",

  // Spacing
  pagePx: "clamp(1rem, 4vw, 2.5rem)",
  maxW: "1100px",
  radius: "10px",
  radiusSm: "6px",
};

// ═══════════════════════════════════════════════════════════════
// Intersection Observer hook for scroll reveals
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
    <div
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: `0 ${t.pagePx} 3rem`,
        background: t.bg,
        overflow: "hidden",
      }}
    >
      {/* Hero image */}
      <img loading="lazy" src="/images/content/landmarks/joslyn-art-museum/joslyn-art-museum-1.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.18, pointerEvents: "none" }} />
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 70% 50% at 65% 25%, ${t.accentSoft} 0%, transparent 70%),
            radial-gradient(ellipse 50% 70% at 20% 85%, rgba(94,196,182,0.05) 0%, transparent 60%)
          `,
          pointerEvents: "none",
        }}
      />
      {/* Geometric Art Deco accent */}
      <div
        style={{
          position: "absolute",
          top: "10vh",
          right: "6vw",
          width: "260px",
          height: "260px",
          border: `1px solid rgba(189,162,107,0.1)`,
          transform: "rotate(45deg)",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "22px",
            border: `1px solid rgba(189,162,107,0.05)`,
          }}
        />
      </div>
      {/* Bottom gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(20,22,24,1) 0%, transparent 40%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 2, maxWidth: "780px" }}>
        <div
          style={{
            fontFamily: t.mono,
            fontSize: "0.6rem",
            fontWeight: 400,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: t.gold,
            marginBottom: "1.25rem",
            animation: "goFadeUp 0.8s ease 0.2s both",
          }}
        >
          Omaha&apos;s Premier Art Museum · Est. 1931
        </div>
        <h1
          style={{
            fontFamily: t.display,
            fontSize: "clamp(3.5rem, 10vw, 7.5rem)",
            fontWeight: 300,
            lineHeight: 0.9,
            color: t.text,
            letterSpacing: "-0.02em",
            margin: 0,
            animation: "goFadeUp 1s ease 0.4s both",
          }}
        >
          The<br />
          <em style={{ fontStyle: "italic", color: t.accent }}> Joslyn</em>
        </h1>
        <p
          style={{
            fontFamily: t.body,
            fontSize: "1rem",
            fontWeight: 300,
            color: t.textDim,
            lineHeight: 1.6,
            maxWidth: "440px",
            marginTop: "1.5rem",
            animation: "goFadeUp 1s ease 0.6s both",
          }}
        >
          12,000 works spanning 5,000 years of human creativity — across three
          architecturally distinct buildings in the heart of Midtown.
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1.75rem",
            padding: "0.55rem 1.1rem",
            background: t.goldSoft,
            border: `1px solid rgba(189,162,107,0.18)`,
            borderRadius: "100px",
            fontFamily: t.mono,
            fontSize: "0.65rem",
            letterSpacing: "0.1em",
            color: t.gold,
            textTransform: "uppercase",
            animation: "goFadeUp 1s ease 0.8s both",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: t.green,
              animation: "goPulse 2s ease infinite",
            }}
          />
          Free Admission · Always
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// VITALS BAR
// ═══════════════════════════════════════════════════════════════
const vitals = [
  { label: "Hours", value: "Tue–Sun", accent: "10 am – 4 pm" },
  { label: "Location", value: "2200 Dodge Street" },
  { label: "Admission", accent: "Free", value: " · Holland Foundation" },
];

function VitalsBar() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        borderBottom: `1px solid rgba(242,239,233,0.06)`,
      }}
    >
      {vitals.map((v, i) => (
        <Reveal key={i} delay={i * 0.05}>
          <div
            style={{
              padding: "1.75rem 1.5rem",
              textAlign: "center",
              borderRight:
                i < vitals.length - 1
                  ? `1px solid rgba(242,239,233,0.06)`
                  : "none",
            }}
          >
            <div
              style={{
                fontFamily: t.mono,
                fontSize: "0.55rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: t.textDim,
                marginBottom: "0.4rem",
              }}
            >
              {v.label}
            </div>
            <div
              style={{
                fontFamily: t.display,
                fontSize: "1.2rem",
                fontWeight: 500,
                color: t.text,
              }}
            >
              {v.accent && (
                <span style={{ color: t.teal }}>{v.accent}</span>
              )}
              {v.value && (
                <span>
                  {v.accent ? " " : ""}
                  {v.value}
                </span>
              )}
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
      <div
        style={{
          fontFamily: t.mono,
          fontSize: "0.58rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: t.teal,
          marginBottom: "0.75rem",
        }}
      >
        {label}
      </div>
      <h2
        style={{
          fontFamily: t.display,
          fontSize: "clamp(1.8rem, 4.5vw, 3rem)",
          fontWeight: 300,
          lineHeight: 1.1,
          color: t.text,
          margin: 0,
          maxWidth: "560px",
        }}
      >
        {heading}
      </h2>
    </Reveal>
  );
}

// ═══════════════════════════════════════════════════════════════
// ABOUT
// ═══════════════════════════════════════════════════════════════
function About() {
  const stats = [
    { num: "12,000+", label: "Works" },
    { num: "5,000", label: "Years of Art" },
    { num: "3", label: "Buildings" },
  ];

  return (
    <section
      style={{
        padding: `4.5rem ${t.pagePx}`,
        borderBottom: `1px solid rgba(242,239,233,0.06)`,
      }}
    >
      <div style={{ maxWidth: t.maxW, margin: "0 auto" }}>
        <SectionHeader label="About" heading="Nebraska's largest art museum, reimagined." />
        <div
          className="venue-grid-2col"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "3.5rem",
            marginTop: "2.5rem",
          }}
        >
          <Reveal delay={0.1}>
            <div
              style={{
                fontFamily: t.body,
                fontSize: "0.95rem",
                fontWeight: 300,
                lineHeight: 1.75,
                color: t.textBody,
              }}
            >
              <p>
                The Joslyn reopened in September 2024 following a transformative
                two-year expansion. The new Rhonda &amp; Howard Hawks Pavilion —
                designed by Snøhetta — adds 42,000 square feet, earning
                recognition as one of the world&apos;s seven most beautiful museum
                openings by Prix Versailles.
              </p>
              <p style={{ marginTop: "1.1rem" }}>
                Originally a gift to the city from Sarah Joslyn in memory of her
                husband George, the museum has grown from a single Art Deco
                landmark into a three-building campus where centuries of art and
                architecture converge.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div>
              <div
                style={{
                  fontFamily: t.display,
                  fontSize: "1.6rem",
                  fontWeight: 300,
                  fontStyle: "italic",
                  lineHeight: 1.35,
                  color: t.text,
                  paddingLeft: "1.75rem",
                  borderLeft: `2px solid ${t.accent}`,
                }}
              >
                &ldquo;One of the world&apos;s seven most beautiful museum
                openings.&rdquo;
              </div>
              <div
                style={{
                  fontFamily: t.mono,
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                  color: t.textDim,
                  paddingLeft: "1.75rem",
                  marginTop: "0.6rem",
                }}
              >
                — Prix Versailles, 2024
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "2.5rem",
                  marginTop: "2.5rem",
                }}
              >
                {stats.map((s, i) => (
                  <div key={i}>
                    <div
                      style={{
                        fontFamily: t.display,
                        fontSize: "2.5rem",
                        fontWeight: 300,
                        color: t.text,
                        lineHeight: 1,
                      }}
                    >
                      {s.num}
                    </div>
                    <div
                      style={{
                        fontFamily: t.mono,
                        fontSize: "0.55rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: t.textDim,
                        marginTop: "0.25rem",
                      }}
                    >
                      {s.label}
                    </div>
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
// COLLECTION
// ═══════════════════════════════════════════════════════════════
const collections = [
  {
    title: "European Art",
    desc: "Renaissance through 19th century. Impressionist landscapes, Baroque figure studies, and centuries of Western tradition in the original Art Deco galleries.",
    artists: "Monet · El Greco · Degas · Titian · Rembrandt",
  },
  {
    title: "American West",
    desc: "Home to the Margre Durham Center for Western Studies and two of the nation's most important collections of frontier-era documentary art.",
    artists: "Karl Bodmer · Alfred Jacob Miller · George Catlin",
  },
  {
    title: "Contemporary",
    desc: "The Phillip G. Schrager Collection debuts across the Hawks Pavilion — five decades of installations, painting, and sculpture alongside Ed Ruscha works on paper.",
    artists: "Matthew Ritchie · Ed Ruscha · Emerging Artists",
  },
  {
    title: "Asian Art",
    desc: "Chinese and Japanese collections — delicate prints, ceramics, and calligraphy illuminating millennia of Eastern philosophy and material innovation.",
    artists: "Chinese Ceramics · Japanese Ukiyo-e",
  },
  {
    title: "Ancient World",
    desc: "Greek vases, Roman artifacts, and antiquities reaching back five millennia. The foundation layer of the museum's comprehensive human survey.",
    artists: "Greek Ceramics · Roman Sculpture",
  },
  {
    title: "Sculpture Gardens",
    desc: "The Kiewit Sculpture Garden and Truhlsen Discovery Garden wrap three buildings with art, landscape architecture, and contemplative outdoor space.",
    artists: "Open Year-Round · Free",
  },
];

function FullWidthImage({ src, alt, height = "45vh" }) {
  return (
    <div style={{ position: "relative", width: "100%", height, overflow: "hidden" }}>
      <img loading="lazy" src={src} alt={alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,22,24,1) 0%, transparent 15%, transparent 85%, rgba(20,22,24,1) 100%)", pointerEvents: "none" }} />
    </div>
  );
}

function Collection() {
  const [hovered, setHovered] = useState(null);

  return (
    <>
    <FullWidthImage src="/images/content/landmarks/joslyn-art-museum/joslyn-art-museum-1.jpg" alt="Joslyn Art Museum interior" />
    <section
      style={{
        padding: `4.5rem ${t.pagePx}`,
        background: t.bgElevated,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circle */}
      <div
        style={{
          position: "absolute",
          top: "-180px",
          right: "-80px",
          width: "420px",
          height: "420px",
          border: `1px solid rgba(189,162,107,0.04)`,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div style={{ maxWidth: t.maxW, margin: "0 auto", position: "relative" }}>
        <SectionHeader label="The Collection" heading="From antiquity to now." />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1px",
            background: "rgba(242,239,233,0.04)",
            marginTop: "2.5rem",
            borderRadius: t.radius,
            overflow: "hidden",
          }}
        >
          {collections.map((c, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: hovered === i ? t.bgHover : t.bgElevated,
                  padding: "2.25rem 1.75rem",
                  position: "relative",
                  transition: "background 0.35s ease",
                  cursor: "default",
                  minHeight: "200px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Bottom accent line */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "2px",
                    background: `linear-gradient(90deg, ${t.accent}, ${t.gold})`,
                    transform: hovered === i ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "left",
                    transition: "transform 0.4s ease",
                  }}
                />
                <div
                  style={{
                    fontFamily: t.display,
                    fontSize: "1.3rem",
                    fontWeight: 400,
                    color: t.text,
                    marginBottom: "0.65rem",
                  }}
                >
                  {c.title}
                </div>
                <div
                  style={{
                    fontFamily: t.body,
                    fontSize: "0.82rem",
                    lineHeight: 1.6,
                    color: t.textDim,
                    fontWeight: 300,
                    flex: 1,
                  }}
                >
                  {c.desc}
                </div>
                <div
                  style={{
                    fontFamily: t.mono,
                    fontSize: "0.6rem",
                    letterSpacing: "0.04em",
                    color: t.gold,
                    opacity: 0.65,
                    marginTop: "1rem",
                  }}
                >
                  {c.artists}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// ARCHITECTURE TIMELINE
// ═══════════════════════════════════════════════════════════════
const buildings = [
  {
    year: "1931",
    name: "The Joslyn Memorial",
    detail:
      "Pink Georgia marble Art Deco landmark by John & Alan McDonald. Listed among America's 100 finest buildings in 1938. European, Western, and ancient collections.",
  },
  {
    year: "1994",
    name: "Suzanne & Walter Scott Pavilion",
    detail:
      "58,000 sq ft designed by Norman Foster. Modern and contemporary galleries, temporary exhibition space, and expanded public amenities.",
  },
  {
    year: "2024",
    name: "Rhonda & Howard Hawks Pavilion",
    detail:
      "42,000 sq ft by Snøhetta + Alley Poyner Macchietto. Glass atriums, garden views, expanded galleries. Prix Versailles recognition.",
  },
];

function Architecture() {
  return (
    <section
      style={{
        padding: `4.5rem ${t.pagePx}`,
        borderTop: `1px solid rgba(242,239,233,0.06)`,
        borderBottom: `1px solid rgba(242,239,233,0.06)`,
      }}
    >
      <div style={{ maxWidth: t.maxW, margin: "0 auto" }}>
        <SectionHeader label="The Campus" heading="Three buildings. One vision." />
        <div style={{ marginTop: "2.5rem" }}>
          {buildings.map((b, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr",
                  gap: "2.5rem",
                  padding: "1.75rem 0",
                  borderBottom:
                    i < buildings.length - 1
                      ? `1px solid rgba(242,239,233,0.06)`
                      : "none",
                  alignItems: "start",
                }}
              >
                <div
                  style={{
                    fontFamily: t.display,
                    fontSize: "1.8rem",
                    fontWeight: 300,
                    color: t.accent,
                    textAlign: "right",
                  }}
                >
                  {b.year}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: t.display,
                      fontSize: "1.2rem",
                      fontWeight: 500,
                      color: t.text,
                      marginBottom: "0.35rem",
                    }}
                  >
                    {b.name}
                  </div>
                  <div
                    style={{
                      fontFamily: t.body,
                      fontSize: "0.85rem",
                      lineHeight: 1.6,
                      color: t.textDim,
                      fontWeight: 300,
                    }}
                  >
                    {b.detail}
                  </div>
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
  { day: "Tue – Wed", time: "10 am – 4 pm" },
  { day: "Thursday", time: "10 am – 8 pm" },
  { day: "Fri – Sun", time: "10 am – 4 pm" },
];

function PlanVisit() {
  return (
    <section style={{ padding: `4.5rem ${t.pagePx}` }}>
      <div style={{ maxWidth: t.maxW, margin: "0 auto" }}>
        <SectionHeader
          label="Plan Your Visit"
          heading="Everything you need to know."
        />
        <div
          className="venue-grid-2col"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "3.5rem",
            marginTop: "2.5rem",
          }}
        >
          {/* Left column */}
          <Reveal delay={0.1}>
            <div>
              <BlockTitle>Hours</BlockTitle>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.55rem",
                }}
              >
                {hours.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      fontFamily: t.body,
                      fontSize: "0.88rem",
                    }}
                  >
                    <span style={{ color: t.textDim }}>{h.day}</span>
                    <span
                      style={{
                        color: h.closed ? t.accent : t.text,
                        fontWeight: 400,
                      }}
                    >
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "2rem" }}>
                <BlockTitle>Getting There</BlockTitle>
                <div
                  style={{
                    fontFamily: t.body,
                    fontSize: "0.88rem",
                    lineHeight: 1.7,
                    color: t.textBody,
                    fontWeight: 300,
                  }}
                >
                  <p>
                    2200 Dodge Street, Omaha, NE 68102. Free on-site parking
                    (first come, first served). Metered street parking available.
                  </p>
                  <p style={{ marginTop: "0.75rem" }}>
                    By bike — racks available, free helmet lockers. By bus —
                    Metro ORBT at 24th &amp; Dodge, steps away.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
          {/* Right column */}
          <Reveal delay={0.2}>
            <div>
              <BlockTitle>Admission</BlockTitle>
              <div
                style={{
                  fontFamily: t.body,
                  fontSize: "0.88rem",
                  lineHeight: 1.7,
                  color: t.textBody,
                  fontWeight: 300,
                }}
              >
                <p>
                  General admission is always free, provided by the Holland
                  Foundation. Select temporary exhibitions may require a ticket
                  (ages 13+). Children 12 and under always free. Free ticket
                  days scheduled for every ticketed show.
                </p>
              </div>
              {/* Callout */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1rem 1.15rem",
                  background: t.goldSoft,
                  borderRadius: t.radiusSm,
                  marginTop: "1.25rem",
                  fontFamily: t.body,
                  fontSize: "0.8rem",
                  color: t.text,
                  lineHeight: 1.45,
                }}
              >
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>✦</span>
                Download the free <strong style={{ fontWeight: 500 }}>&nbsp;Bloomberg Connects&nbsp;</strong> app
                for a digital guide.
              </div>
              <div style={{ marginTop: "2rem" }}>
                <BlockTitle>Contact</BlockTitle>
                <div
                  style={{
                    fontFamily: t.body,
                    fontSize: "0.88rem",
                    lineHeight: 1.7,
                    color: t.textBody,
                    fontWeight: 300,
                  }}
                >
                  (402) 342-3300
                  <br />
                  @joslynartmuseum on all platforms
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function BlockTitle({ children }) {
  return (
    <div
      style={{
        fontFamily: t.display,
        fontSize: "1.15rem",
        fontWeight: 500,
        color: t.text,
        marginBottom: "0.85rem",
        paddingBottom: "0.6rem",
        borderBottom: `1px solid rgba(242,239,233,0.06)`,
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AMENITIES STRIP
// ═══════════════════════════════════════════════════════════════
const amenities = [
  { name: "Durham Café", desc: "Full menu 10am–3pm · Glass atrium · Patio", icon: "☕" },
  { name: "The Shop", desc: "Art books · Curated gifts · Keepsakes", icon: "◈" },
  { name: "Public Tours", desc: "Free guided tours · Group bookings", icon: "◎" },
  { name: "Private Events", desc: "Weddings · Corporate · Receptions", icon: "✧" },
];

function Amenities() {
  const [hovered, setHovered] = useState(null);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "1px",
        background: "rgba(242,239,233,0.04)",
        borderTop: `1px solid rgba(242,239,233,0.06)`,
        borderBottom: `1px solid rgba(242,239,233,0.06)`,
      }}
    >
      {amenities.map((a, i) => (
        <Reveal key={i} delay={i * 0.06}>
          <div
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === i ? t.bgHover : t.bg,
              padding: "2.25rem 1.25rem",
              textAlign: "center",
              transition: "background 0.3s ease",
              cursor: "default",
            }}
          >
            <div
              style={{
                fontSize: "1.3rem",
                marginBottom: "0.75rem",
                opacity: 0.5,
              }}
            >
              {a.icon}
            </div>
            <div
              style={{
                fontFamily: t.display,
                fontSize: "1.05rem",
                fontWeight: 500,
                color: t.text,
                marginBottom: "0.3rem",
              }}
            >
              {a.name}
            </div>
            <div
              style={{
                fontFamily: t.body,
                fontSize: "0.7rem",
                color: t.textDim,
                lineHeight: 1.5,
              }}
            >
              {a.desc}
            </div>
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
    <div
      style={{
        padding: `5rem ${t.pagePx}`,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 50% 60% at 50% 100%, ${t.accentSoft} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <Reveal>
        <div
          style={{
            position: "relative",
            maxWidth: "560px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontFamily: t.display,
              fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
              fontWeight: 300,
              color: t.text,
              lineHeight: 1.12,
              margin: "0 0 1.25rem 0",
            }}
          >
            Five thousand years.
            <br />
            One afternoon.
          </h2>
          <p
            style={{
              fontFamily: t.body,
              fontSize: "0.88rem",
              color: t.textDim,
              lineHeight: 1.6,
              marginBottom: "2.25rem",
            }}
          >
            Free to enter. Free to explore. The Joslyn belongs to Omaha.
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="https://joslyn.org/visit/visit-detail/"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.8rem 1.75rem",
                background: t.teal,
                color: t.bg,
                fontFamily: t.body,
                fontSize: "0.78rem",
                fontWeight: 500,
                letterSpacing: "0.03em",
                textDecoration: "none",
                borderRadius: "100px",
                border: `1px solid ${t.teal}`,
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            >
              Plan Your Visit →
            </a>
            <a
              href="https://joslyn.org/art/collection/"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.8rem 1.75rem",
                background: "transparent",
                color: t.cream,
                fontFamily: t.body,
                fontSize: "0.78rem",
                fontWeight: 400,
                letterSpacing: "0.03em",
                textDecoration: "none",
                borderRadius: "100px",
                border: `1px solid rgba(232,226,214,0.15)`,
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            >
              Browse Collection
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
    <footer
      style={{
        padding: "1.75rem 1.5rem",
        borderTop: `1px solid rgba(242,239,233,0.04)`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.75rem",
      }}
    >
      <div
        style={{
          fontFamily: t.mono,
          fontSize: "0.58rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(242,239,233,0.2)",
        }}
      >
        <span style={{ color: t.teal, fontWeight: 600 }}>GO:</span> Guide to
        Omaha · Venue Page
      </div>
      <div style={{ display: "flex", gap: "1.25rem" }}>
        {[
          { label: "joslyn.org", href: "https://joslyn.org" },
          { label: "(402) 342-3300", href: "tel:4023423300" },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: t.mono,
              fontSize: "0.58rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(242,239,233,0.25)",
              textDecoration: "none",
            }}
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE COMPONENT — default export
// ═══════════════════════════════════════════════════════════════
export default function JoslynVenuePage() {
  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ background: t.bg, color: t.text, minHeight: "100svh", paddingBottom: 80 }}>
      {/* Global keyframes */}
      <style>{`
        @keyframes goFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes goPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
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
      <Collection />
      <Architecture />
      <PlanVisit />
      <Amenities />
      <FooterCTA />
      <SiteFooter />
      <BottomNav active="explore" />
    </div>
  );
}
