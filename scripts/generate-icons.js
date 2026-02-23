#!/usr/bin/env node
/**
 * Generates PWA icons for GO: Guide to Omaha
 * Creates SVG icons at 192 and 512 sizes, plus a favicon
 */

const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "public");

function createIconSvg(size) {
  const pad = size * 0.1;
  const r = size * 0.15;
  const cx = size / 2;
  const cy = size / 2;
  const fs1 = size * 0.32;
  const fs2 = size * 0.1;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#141618"/>
      <stop offset="100%" stop-color="#1E2024"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <text x="${cx}" y="${cy - size * 0.04}" text-anchor="middle" dominant-baseline="central"
    font-family="system-ui, -apple-system, sans-serif" font-weight="700"
    font-size="${fs1}" fill="#5EC4B6" letter-spacing="${size * 0.02}">GO</text>
  <text x="${cx}" y="${cy + size * 0.22}" text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif" font-weight="500"
    font-size="${fs2}" fill="#A39E94" letter-spacing="${size * 0.015}">OMAHA</text>
  <rect x="${pad}" y="${size - pad - 3}" width="${size - pad * 2}" height="3" rx="1.5" fill="#5EC4B6" opacity="0.6"/>
</svg>`;
}

function createFaviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#141618"/>
  <text x="16" y="20" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="#5EC4B6">GO</text>
</svg>`;
}

// Generate icons
fs.writeFileSync(path.join(OUT_DIR, "icon-192.svg"), createIconSvg(192));
fs.writeFileSync(path.join(OUT_DIR, "icon-512.svg"), createIconSvg(512));
fs.writeFileSync(path.join(OUT_DIR, "favicon.svg"), createFaviconSvg());

console.log("✓ Generated PWA icons (icon-192.svg, icon-512.svg, favicon.svg)");
console.log("  Note: For production, convert SVGs to PNG using:");
console.log("    npx svg2png-cli icon-192.svg -o icon-192.png -w 192 -h 192");
console.log("    npx svg2png-cli icon-512.svg -o icon-512.png -w 512 -h 512");
console.log("  Or use https://cloudconvert.com/svg-to-png");
