"use client";
import Link from "next/link";

const T = {
  accent: "#5EC4B6",
  bg: "#141618",
  textDim: "rgba(242,239,233,.55)",
};

const tabs = [
  { id: "today", label: "Today", href: "/", icon: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> },
  { id: "events", label: "Events", href: "/#events", icon: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { id: "explore", label: "Explore", href: "/#explore", icon: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg> },
  { id: "saved", label: "Saved", href: "/#saved", icon: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> },
  { id: "more", label: "More", href: "/#more", icon: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg> },
];

export function BottomNav({ active }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 999,
      background: "rgba(38,40,46,.98)", backdropFilter: "blur(22px)",
      borderTop: "1px solid rgba(255,255,255,.12)",
      display: "flex", justifyContent: "space-around",
      padding: "6px 4px 8px",
      paddingBottom: "max(8px, env(safe-area-inset-bottom, 8px))",
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <Link key={t.id} href={t.href} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            background: isActive ? "rgba(94,196,182,.1)" : "transparent",
            border: "none", cursor: "pointer", padding: "10px 16px",
            borderRadius: 11, minWidth: 60, minHeight: 48,
            color: isActive ? T.accent : T.textDim,
            textDecoration: "none", transition: "all .2s",
          }}>
            <span>{t.icon(isActive ? T.accent : T.textDim, 22)}</span>
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, letterSpacing: .8, textTransform: "uppercase" }}>{t.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
