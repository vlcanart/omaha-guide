#!/usr/bin/env node
/**
 * validate-data.js — Data validation, image audit, and missing-image categorization
 * Queries local data (data/events.json raw + app/events-data.js processed)
 * Run: node scripts/validate-data.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/events.json'), 'utf8'));

// Parse the processed events from events-data.js (ES module export → extract JSON array)
const eventsDataPath = path.join(ROOT, 'app/events-data.js');
const eventsDataSrc = fs.readFileSync(eventsDataPath, 'utf8');
const match = eventsDataSrc.match(/export const INGESTED_EVENTS = (\[[\s\S]*?\]);/);
if (!match) { console.error('Could not parse events-data.js'); process.exit(1); }
const processed = JSON.parse(match[1]);

// Venue IDs from page.jsx that have curated images
const VENUE_IDS_WITH_IMAGES = [1,2,4,5,6,7,8,9,10,11,12,14,21,22,23,25,30,38,40,43,50,51,60,61,62];

// ─────────────────────────────────────────────────────────────
// STEP 2: DATA VALIDATION
// ─────────────────────────────────────────────────────────────
function runDataValidation() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  STEP 2 — DATA VALIDATION');
  console.log('═══════════════════════════════════════════════════════\n');

  // Total events
  console.log(`📊 Raw events (data/events.json):       ${raw.length}`);
  console.log(`📊 Processed events (events-data.js):   ${processed.length}`);
  console.log(`   Difference: ${raw.length - processed.length} removed by dedup/filter/expiry\n`);

  // Images vs no images (processed)
  const withImage = processed.filter(e => e.image);
  const withoutImage = processed.filter(e => !e.image);
  const pctWith = ((withImage.length / processed.length) * 100).toFixed(1);
  const pctWithout = ((withoutImage.length / processed.length) * 100).toFixed(1);
  console.log(`🖼️  Events WITH images:    ${withImage.length} (${pctWith}%)`);
  console.log(`🖼️  Events WITHOUT images: ${withoutImage.length} (${pctWithout}%)\n`);

  // Price breakdown (processed)
  const priceMap = {};
  for (const e of processed) {
    const p = (e.price || '').trim();
    let bucket;
    if (!p || p === 'TBD' || p === 'tbd') bucket = 'TBD';
    else if (/free/i.test(p)) bucket = 'Free';
    else if (/see ticketmaster/i.test(p) || /check ticket/i.test(p)) bucket = 'See Ticketmaster';
    else if (/\$/.test(p) || /^\d/.test(p)) bucket = 'Paid';
    else bucket = `Other: "${p}"`;
    priceMap[bucket] = (priceMap[bucket] || 0) + 1;
  }
  console.log('💰 Price Breakdown (processed events):');
  for (const [bucket, count] of Object.entries(priceMap).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${bucket.padEnd(25)} ${count}`);
  }
  console.log();

  // Duplicate titles (5+ times) in processed
  const titleCounts = {};
  for (const e of processed) {
    const key = e.title.toLowerCase().trim();
    titleCounts[key] = (titleCounts[key] || 0) + 1;
  }
  const dupes = Object.entries(titleCounts).filter(([, c]) => c >= 5);
  if (dupes.length === 0) {
    console.log('✅ No duplicate titles appearing 5+ times (dedup working)\n');
  } else {
    console.log('⚠️  Duplicate titles (5+ occurrences):');
    for (const [title, count] of dupes.sort((a, b) => b[1] - a[1])) {
      console.log(`   "${title}" × ${count}`);
    }
    console.log();
  }

  // 5 random event samples
  console.log('🎲 5 Random Event Samples:');
  console.log('─'.repeat(80));
  const shuffled = [...processed].sort(() => Math.random() - 0.5).slice(0, 5);
  for (const e of shuffled) {
    console.log(`   Title:  ${e.title}`);
    console.log(`   Venue:  ${e.venue}`);
    console.log(`   Price:  ${e.price || '(none)'}`);
    console.log(`   Image:  ${e.image || '(none)'}`);
    console.log('   ' + '─'.repeat(60));
  }
  console.log();

  // Check events-data.js freshness (build timestamp)
  const buildMatch = eventsDataSrc.match(/Built: (.+)/);
  const buildTime = buildMatch ? buildMatch[1] : 'unknown';
  console.log(`🕐 events-data.js built: ${buildTime}`);
  console.log(`   Contains ${processed.length} events\n`);
}

// ─────────────────────────────────────────────────────────────
// STEP 3: IMAGE AUDIT
// ─────────────────────────────────────────────────────────────
function runImageAudit() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  STEP 3 — IMAGE AUDIT');
  console.log('═══════════════════════════════════════════════════════\n');

  const ticketmaster = [];
  const ticketOmaha = [];
  const localCached = [];
  const venueFallback = [];
  const noImage = [];
  const otherDomain = [];
  const domainSet = {};

  for (const e of processed) {
    const img = e.image || '';
    if (!img) {
      noImage.push(e);
    } else if (img.includes('s1.ticketm.net')) {
      ticketmaster.push(e);
    } else if (img.includes('img.ticketomaha.com')) {
      ticketOmaha.push(e);
    } else if (img.startsWith('/images/content/venues/') || img.startsWith('/images/content/landmarks/')) {
      venueFallback.push(e);
    } else if (img.startsWith('/images/events/')) {
      localCached.push(e);
    } else {
      otherDomain.push(e);
      try {
        const domain = new URL(img).hostname;
        domainSet[domain] = (domainSet[domain] || 0) + 1;
      } catch {
        domainSet['(invalid URL)'] = (domainSet['(invalid URL)'] || 0) + 1;
      }
    }
  }

  // Ticketmaster images
  console.log(`📸 Ticketmaster images (s1.ticketm.net): ${ticketmaster.length}`);
  if (ticketmaster.length > 0) {
    console.log('   Samples:');
    for (const e of ticketmaster.slice(0, 3)) {
      console.log(`     "${e.title}" → ${e.image}`);
    }
  }
  console.log();

  // Ticket Omaha images
  console.log(`📸 Ticket Omaha images (img.ticketomaha.com): ${ticketOmaha.length}`);
  if (ticketOmaha.length > 0) {
    console.log('   Samples:');
    for (const e of ticketOmaha.slice(0, 3)) {
      console.log(`     "${e.title}" → ${e.image}`);
    }
  }
  console.log();

  // Locally cached
  console.log(`📸 Locally cached images (/images/events/): ${localCached.length}`);
  console.log();

  // Venue fallback images
  console.log(`📸 Venue fallback images (/images/content/venues/): ${venueFallback.length}`);
  console.log();

  // No image
  console.log(`📸 Events with NO image: ${noImage.length}`);
  if (noImage.length > 0) {
    console.log('   All missing-image events:');
    for (const e of noImage) {
      console.log(`     "${e.title}" @ ${e.venue}`);
    }
  }
  console.log();

  // Other domains
  console.log(`📸 Other image domains: ${otherDomain.length}`);
  if (Object.keys(domainSet).length > 0) {
    console.log('   Domains:');
    for (const [domain, count] of Object.entries(domainSet).sort((a, b) => b[1] - a[1])) {
      console.log(`     ${domain}: ${count}`);
    }
    if (otherDomain.length > 0) {
      console.log('   Samples:');
      for (const e of otherDomain.slice(0, 3)) {
        console.log(`     "${e.title}" → ${e.image}`);
      }
    }
  }
  console.log();

  return { noImage };
}

// ─────────────────────────────────────────────────────────────
// STEP 4: CATEGORIZE MISSING-IMAGE EVENTS
// ─────────────────────────────────────────────────────────────
function categorizeMissingImages(noImage) {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  STEP 4 — CATEGORIZE MISSING-IMAGE EVENTS');
  console.log('═══════════════════════════════════════════════════════\n');

  if (noImage.length === 0) {
    console.log('✅ No events are missing images!\n');
    return;
  }

  // Read page.jsx to extract VENUES array and map venue names to IDs
  const pageJsx = fs.readFileSync(path.join(ROOT, 'app/page.jsx'), 'utf8');

  // Extract venue names that have curated images
  const venueNames = new Set();
  const venueRegex = /\{id:(\d+),name:"([^"]+)"/g;
  let vm;
  while ((vm = venueRegex.exec(pageJsx)) !== null) {
    const id = parseInt(vm[1]);
    if (VENUE_IDS_WITH_IMAGES.includes(id)) {
      venueNames.add(vm[2].toLowerCase());
    }
  }

  // Also check which venue image files actually exist
  const venueImgDir = path.join(ROOT, 'public/images/venues');
  const existingVenueImgs = new Set();
  if (fs.existsSync(venueImgDir)) {
    for (const f of fs.readdirSync(venueImgDir)) {
      existingVenueImgs.add(f.replace('.jpg', ''));
    }
  }

  // Artist/performer detection keywords
  const artistCategories = ['concerts', 'comedy', 'arts'];
  const performerKeywords = [
    /\bpresents?\b/i, /\btour\b/i, /\blive\b/i, /\bstand[- ]?up\b/i,
    /\bcomedy\b/i, /\bconcert\b/i, /\bband\b/i, /\bperform/i,
    /\bsinger\b/i, /\bcomedian\b/i, /\bmusic\b/i,
  ];

  const venueFallback = [];
  const artistEvents = [];
  const communityEvents = [];

  for (const e of noImage) {
    const venueLower = (e.venue || '').toLowerCase();

    // Check if venue has a curated image (fuzzy match venue names)
    const hasVenueFallback = venueNames.has(venueLower) ||
      [...venueNames].some(vn => venueLower.includes(vn) || vn.includes(venueLower));

    if (hasVenueFallback) {
      venueFallback.push(e);
    } else if (
      artistCategories.includes(e.cat) ||
      performerKeywords.some(rx => rx.test(e.title))
    ) {
      artistEvents.push(e);
    } else {
      communityEvents.push(e);
    }
  }

  console.log(`📋 Missing-image breakdown (${noImage.length} total):\n`);

  // Bucket 1: Venue fallback
  console.log(`🏟️  Venue fallback available: ${venueFallback.length}`);
  console.log('   (These venues have curated images in /public/images/content/venues/)');
  if (venueFallback.length > 0) {
    for (const e of venueFallback) {
      console.log(`     "${e.title}" @ ${e.venue} [${e.cat}]`);
    }
  }
  console.log();

  // Bucket 2: Artist/performer events
  console.log(`🎤 Artist/performer events: ${artistEvents.length}`);
  console.log('   (Concerts, comedy, arts with artist names — need real photos)');
  if (artistEvents.length > 0) {
    for (const e of artistEvents) {
      console.log(`     "${e.title}" @ ${e.venue} [${e.cat}] — ${e.date}`);
    }
  }
  console.log();

  // Bucket 3: Community/generic events
  console.log(`🏘️  Community/generic events: ${communityEvents.length}`);
  console.log('   (Library, parks, community — can use category-level hero)');
  if (communityEvents.length > 0) {
    for (const e of communityEvents) {
      console.log(`     "${e.title}" @ ${e.venue} [${e.cat}]`);
    }
  }
  console.log();
}

// ─────────────────────────────────────────────────────────────
// RUN ALL
// ─────────────────────────────────────────────────────────────
console.log('\n🔍 GO: Omaha — Data Validation Report');
console.log('═══════════════════════════════════════════════════════\n');

runDataValidation();
const { noImage } = runImageAudit();
categorizeMissingImages(noImage);

console.log('═══════════════════════════════════════════════════════');
console.log('  DONE — Audit complete, no data was modified');
console.log('═══════════════════════════════════════════════════════\n');
