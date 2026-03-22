"use client";
import Link from "next/link";
import { T } from "../lib/design-tokens";

export function BackButton({ href, onClick, label = "Back" }) {
  const style = {
    background: "rgba(255,255,255,.06)",
    border: `1px solid ${T.border}`,
    borderRadius: 99,
    padding: "6px 10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
  };

  const chevron = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );

  if (href) {
    return <Link href={href} style={style}>{chevron}</Link>;
  }

  return <button onClick={onClick} className="hbtn" style={style}>{chevron}</button>;
}
