"use client";
import { T } from "../lib/design-tokens";

export function SectionHead({ text, count, mt = 20, color }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: `${mt}px 0 10px` }}>
      <h2 style={{ fontSize: 12, fontWeight: 600, color: color || T.textSec, letterSpacing: 2.5, textTransform: "uppercase", margin: 0 }}>{text}</h2>
      {count != null && <span style={{ fontSize: 11, color: T.textDim, letterSpacing: 1 }}>{count}</span>}
    </div>
  );
}
