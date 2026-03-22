"use client";
import { T } from "../lib/design-tokens";
import { Skyline } from "../lib/skyline";
import { useResponsive } from "./ResponsiveProvider";

/* Default sunset gradient for compact hero — matches STOPS[2] (tv=50) from sky.js
   Since the compact hero doesn't use the time slider, we pick a warm sunset palette. */
const DEFAULT_SKY = { s1: "#C27840", s2: "#E6956B", s3: "#F0C27A", bldg: "#000000", winOp: 0 };

export function CompactHero() {
  const { isM, isT, isD } = useResponsive();
  const heroH = isD ? 120 : isT ? 105 : 95;
  const mxW = isD ? 860 : isT ? 680 : 600;
  const px = isD ? 32 : isT ? 24 : 16;

  return (
    <div style={{ position: "relative", height: heroH, minHeight: isD ? 120 : 95, maxHeight: 135, overflow: "hidden" }}>
      {/* Sky gradient */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${DEFAULT_SKY.s1} 0%, ${DEFAULT_SKY.s2} 50%, ${DEFAULT_SKY.s3} 90%)` }} />

      {/* SVG Skyline — xMidYMax slice anchors buildings at bottom */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "100%", zIndex: 5 }}>
        <Skyline color={DEFAULT_SKY.bldg} winOp={DEFAULT_SKY.winOp} />
      </div>

      {/* Fade skyline base into bg */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 35, zIndex: 6, background: `linear-gradient(180deg,transparent,${T.bg})` }} />

      {/* GO: Guide to Omaha title */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, padding: `0 ${px}px ${isD ? 10 : 7}px`, maxWidth: mxW, margin: "0 auto" }}>
        <h1 style={{ fontSize: isD ? 20 : isT ? 18 : 16, fontWeight: 300, margin: 0, color: T.text, letterSpacing: 1, lineHeight: 1.1, textShadow: "0 2px 12px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.6), 0 0 60px rgba(0,0,0,0.4)", transition: "font-size 0.4s ease" }}>
          <span style={{ fontWeight: 800, letterSpacing: 2 }}>GO</span>
          <span style={{ color: T.accent, margin: "0 6px", fontWeight: 200 }}>:</span>
          <span style={{ fontWeight: 400 }}>Guide to Omaha</span>
        </h1>
      </div>
    </div>
  );
}
