"use client";
import { useState, useEffect } from "react";
import { useResponsive } from "./ResponsiveProvider";
import Link from "next/link";

const T = {
  bg: "#141618", accent: "#5EC4B6", text: "#F2EFE9",
  textBody: "rgba(242,239,233,0.82)", textSec: "rgba(242,239,233,0.58)",
  textDim: "rgba(242,239,233,0.32)", border: "rgba(255,255,255,0.08)",
};

const TABS = [
  { id: "today", label: "Today", href: "/" },
  { id: "events", label: "Events", href: "/?tab=events" },
  { id: "explore", label: "Explore", href: "/?tab=explore" },
  { id: "saved", label: "Saved", href: "/?tab=saved" },
];

const EXPLORE_SUBS = [
  { id: "neighborhoods", label: "Neighborhoods" },
  { id: "venues", label: "Venues" },
  { id: "museums", label: "Museums & Galleries" },
  { id: "parks", label: "Parks" },
  { id: "trails", label: "Trails" },
];

function isExploreActive(tab) {
  if (!tab) return false;
  return tab === "explore" || tab === "venues" || tab === "museums" ||
    tab.startsWith("hood:") || tab.startsWith("park:") || tab.startsWith("trail:") ||
    tab.startsWith("trailDetail:") || tab.startsWith("venue:") || tab.startsWith("walk:");
}

export function TopNav({ activeTab = "today", onTabChange, savedCount = 0, activeSub }) {
  const { isM, isT, isD } = useResponsive();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted) return null;

  // Mobile: don't render
  if (isM) return null;

  // Tablet: minimal logo bar
  if (isT) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", padding: "10px 20px",
        background: "rgba(20,22,24,0.92)", backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", color: T.accent }}>GO:</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 400, color: T.text }}>Guide to Omaha</span>
        </Link>
      </div>
    );
  }

  // Desktop: full top nav
  const showSubNav = isExploreActive(activeTab);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}>
      {/* Main nav bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 56,
        background: "rgba(20,22,24,0.94)", backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)", borderBottom: showSubNav ? "none" : "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 700, letterSpacing: "0.12em", color: T.accent }}>GO:</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 400, color: T.text, letterSpacing: 0.5 }}>Guide to Omaha</span>
        </Link>

        {/* Tab links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {TABS.map(t => {
            const isActive = t.id === activeTab || (t.id === "explore" && isExploreActive(activeTab));
            const TabEl = onTabChange ? "button" : Link;
            const tabProps = onTabChange
              ? { onClick: () => onTabChange(t.id), type: "button" }
              : { href: t.href };

            return (
              <TabEl key={t.id} {...tabProps} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 18px", borderRadius: 99, border: "none",
                background: isActive ? "rgba(94,196,182,0.10)" : "transparent",
                color: isActive ? T.accent : T.textSec,
                fontSize: 13, fontWeight: isActive ? 600 : 500, letterSpacing: 0.5,
                cursor: "pointer", textDecoration: "none", position: "relative",
                transition: "all 0.2s",
              }}>
                {t.label}
                {t.id === "saved" && savedCount > 0 && (
                  <span style={{
                    background: T.accent, color: T.bg, fontSize: 9, fontWeight: 700,
                    borderRadius: 99, padding: "1px 5px", minWidth: 14, textAlign: "center",
                  }}>{savedCount}</span>
                )}
              </TabEl>
            );
          })}
        </div>
      </div>

      {/* Explore sub-nav */}
      {showSubNav && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "0 32px", height: 40,
          background: "rgba(20,22,24,0.90)", backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          {EXPLORE_SUBS.map(sub => {
            const isActive = activeSub === sub.id ||
              (sub.id === "venues" && activeTab === "venues") ||
              (sub.id === "museums" && activeTab === "museums") ||
              (sub.id === "neighborhoods" && activeTab?.startsWith("hood:")) ||
              (sub.id === "parks" && activeTab?.startsWith("park:")) ||
              (sub.id === "trails" && (activeTab?.startsWith("trail:") || activeTab?.startsWith("trailDetail:")));

            const SubEl = onTabChange ? "button" : Link;
            const subProps = onTabChange
              ? { onClick: () => onTabChange(sub.id === "museums" ? "museums" : sub.id === "venues" ? "venues" : "explore"), type: "button" }
              : { href: "/?tab=explore" };

            return (
              <SubEl key={sub.id} {...subProps} style={{
                padding: "6px 14px", borderRadius: 99, border: "none",
                background: isActive ? "rgba(94,196,182,0.08)" : "transparent",
                color: isActive ? T.accent : T.textDim,
                fontSize: 11, fontWeight: isActive ? 600 : 500, letterSpacing: 0.8,
                cursor: "pointer", textDecoration: "none", textTransform: "uppercase",
                transition: "all 0.2s",
              }}>
                {sub.label}
              </SubEl>
            );
          })}
        </div>
      )}
    </div>
  );
}
