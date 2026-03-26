/**
 * Fix all custom venue pages:
 * 1. Bigger GoBar with back button
 * 2. Scroll to top on load
 * 3. Responsive improvements
 */
const fs = require('fs');

const files = [
  'app/joslyn/JoslynClient.jsx',
  'app/lauritzen/LauritzenClient.jsx',
  'app/durham/DurhamClient.jsx',
  'app/luminarium/LuminariumClient.jsx',
];

// New GoBar with back button, bigger logo, responsive
const newGoBar = `function GoBar() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 1.25rem", background: "rgba(20,22,24,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(242,239,233,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 99, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textDecoration: "none", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(242,239,233,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </a>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5EC4B6" }}>GO:</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", fontWeight: 400, letterSpacing: "0.04em", color: "#E8E2D6" }}>Guide to Omaha</span>
        </a>
      </div>
      <div style={{ display: "flex", gap: "0.4rem" }}>
        {[{label:"Events",href:"/?tab=events"},{label:"Explore",href:"/?tab=explore"},{label:"Venues",href:"/?tab=venues"}].map((l) => (
          <a key={l.label} href={l.href} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", letterSpacing: "0.04em", color: "#E8E2D6", padding: "0.4rem 0.9rem", borderRadius: 99, border: "1px solid rgba(242,239,233,0.1)", cursor: "pointer", textDecoration: "none" }}>{l.label}</a>
        ))}
      </div>
    </div>
  );
}`;

// Scroll-to-top effect to add after the first useState/useEffect import
const scrollToTop = `
  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);`;

let totalFixed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace the GoBar function
  const goBarStart = content.indexOf('function GoBar()');
  if (goBarStart !== -1) {
    // Find the end of GoBar — it ends with a closing }
    // GoBar is always: function GoBar() { return ( <div>...</div> ); }
    // Find the matching closing brace
    let braceCount = 0;
    let goBarEnd = -1;
    let inGoBar = false;
    for (let i = goBarStart; i < content.length; i++) {
      if (content[i] === '{') { braceCount++; inGoBar = true; }
      if (content[i] === '}') { braceCount--; }
      if (inGoBar && braceCount === 0) { goBarEnd = i + 1; break; }
    }
    if (goBarEnd !== -1) {
      content = content.slice(0, goBarStart) + newGoBar + content.slice(goBarEnd);
      console.log(`  ✓ ${file}: GoBar replaced`);
    }
  }

  // Add scroll-to-top to the main component
  // Find the default export function and add useEffect after the first line
  const exportMatch = content.match(/export default function \w+\(\)\s*\{/);
  if (exportMatch) {
    const idx = content.indexOf(exportMatch[0]) + exportMatch[0].length;
    if (!content.includes('window.scrollTo(0, 0)')) {
      content = content.slice(0, idx) + scrollToTop + content.slice(idx);
      console.log(`  ✓ ${file}: scroll-to-top added`);
    }
  }

  // Fix responsive: change clamp values for hero text on mobile
  // Make hero min-height responsive
  content = content.replace(/minHeight:\s*"100vh"/g, 'minHeight: "100svh"');

  // Fix grid columns to be responsive — 2-col grids should go 1-col on mobile
  content = content.replace(
    /gridTemplateColumns:\s*"1fr 1fr"/g,
    'gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"'
  );

  fs.writeFileSync(file, content);
  totalFixed++;
}

console.log(`\nFixed ${totalFixed} custom venue pages`);
