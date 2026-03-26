const fs = require('fs');

// Image replacements
const imageMap = {
  'app/joslyn/JoslynClient.jsx': {
    'https://images.unsplash.com/photo-1566985446843-5ab671017dcc?w=1200&q=70&auto=format': '/images/venues/joslyn-art-museum.jpg',
  },
  'app/lauritzen/LauritzenClient.jsx': {
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&q=70&auto=format': '/images/parks/lauritzen-gardens.jpg',
  },
  'app/durham/DurhamClient.jsx': {
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200&q=70&auto=format': '/images/venues/durham-museum.jpg',
  },
  'app/luminarium/LuminariumClient.jsx': {
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=70&auto=format': '/images/venues/kiewit-luminarium.jpg',
  },
};

// New simple back button + nav to replace GoBar
const newGoBar = `function GoBar() {
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
}`;

const files = Object.keys(imageMap);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace images
  for (const [from, to] of Object.entries(imageMap[file])) {
    const count = content.split(from).length - 1;
    content = content.replaceAll(from, to);
    if (count > 0) console.log(`  ${file}: replaced ${count} Unsplash URL(s) with ${to}`);
  }

  // Replace GoBar
  const goBarStart = content.indexOf('function GoBar()');
  if (goBarStart !== -1) {
    let braceCount = 0, inGoBar = false, goBarEnd = -1;
    for (let i = goBarStart; i < content.length; i++) {
      if (content[i] === '{') { braceCount++; inGoBar = true; }
      if (content[i] === '}') { braceCount--; }
      if (inGoBar && braceCount === 0) { goBarEnd = i + 1; break; }
    }
    if (goBarEnd !== -1) {
      content = content.slice(0, goBarStart) + newGoBar + content.slice(goBarEnd);
      console.log(`  ${file}: GoBar simplified`);
    }
  }

  fs.writeFileSync(file, content);
}

console.log('Done');
