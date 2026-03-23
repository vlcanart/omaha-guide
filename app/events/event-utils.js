// Install: app/events/event-utils.js

export function eventSlug(ev) {
  return [ev.title, ev.venue, ev.date]
    .filter(Boolean).join(" ").toLowerCase()
    .replace(/['']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function findEventBySlug(events, slug) {
  return events.find(function(ev) { return eventSlug(ev) === slug; }) || null;
}

export function getAllEventSlugs(events) {
  return events.map(function(ev) { return { slug: eventSlug(ev) }; });
}

export function concertJsonLd(ev, venue) {
  var startDate = ev.date && ev.time ? ev.date + "T" + to24h(ev.time) : ev.date;
  var pr = parsePrice(ev.price);
  var ld = {
    "@context": "https://schema.org", "@type": "MusicEvent",
    name: ev.title,
    description: ev.desc || ev.title + " live at " + ev.venue + " in Omaha, NE",
    startDate: startDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "MusicVenue", name: ev.venue, address: { "@type": "PostalAddress", addressLocality: "Omaha", addressRegion: "NE", addressCountry: "US" } },
    performer: { "@type": "MusicGroup", name: ev.title },
    organizer: { "@type": "Organization", name: "GO: Guide to Omaha", url: "https://go-omaha.com" },
  };
  if (venue && venue.lat) ld.location.geo = { "@type": "GeoCoordinates", latitude: venue.lat, longitude: venue.lng };
  if (ev.url && ev.url !== "#") { ld.offers = { "@type": "Offer", url: ev.url, availability: "https://schema.org/InStock" }; if (pr.low) { ld.offers.price = pr.low; ld.offers.priceCurrency = "USD"; } if (pr.high) ld.offers.highPrice = pr.high; }
  return ld;
}

export function sportsJsonLd(ev, venue) {
  var startDate = ev.date && ev.time ? ev.date + "T" + to24h(ev.time) : ev.date;
  var pr = parsePrice(ev.price);
  var ld = {
    "@context": "https://schema.org", "@type": "SportsEvent",
    name: ev.title,
    description: ev.desc || ev.title + " at " + ev.venue + " in Omaha, NE",
    startDate: startDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "StadiumOrArena", name: ev.venue, address: { "@type": "PostalAddress", addressLocality: "Omaha", addressRegion: "NE", addressCountry: "US" } },
    organizer: { "@type": "Organization", name: "GO: Guide to Omaha", url: "https://go-omaha.com" },
  };
  if (ev.homeTeam) ld.homeTeam = { "@type": "SportsTeam", name: ev.homeTeam };
  if (ev.awayTeam) ld.awayTeam = { "@type": "SportsTeam", name: ev.awayTeam };
  if (venue && venue.lat) ld.location.geo = { "@type": "GeoCoordinates", latitude: venue.lat, longitude: venue.lng };
  if (ev.url && ev.url !== "#") { ld.offers = { "@type": "Offer", url: ev.url, availability: "https://schema.org/InStock" }; if (pr.low) { ld.offers.price = pr.low; ld.offers.priceCurrency = "USD"; } if (pr.high) ld.offers.highPrice = pr.high; }
  return ld;
}

export function eventJsonLd(ev, venue) {
  if (ev.cat === "sports") return sportsJsonLd(ev, venue);
  return concertJsonLd(ev, venue);
}

export function eventMeta(ev) {
  var dateStr = ev.date ? new Date(ev.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "";
  var slug = eventSlug(ev);
  return {
    title: ev.title + " | " + ev.venue + " | GO: Guide to Omaha",
    description: (ev.desc || ev.title + " live at " + ev.venue) + " \u2014 " + dateStr + " in Omaha, NE. " + (ev.price || ""),
    openGraph: { title: ev.title + " \u2014 " + dateStr, description: (ev.desc || ev.title) + " at " + ev.venue + ", Omaha NE", type: "website", siteName: "GO: Guide to Omaha", url: "https://go-omaha.com/events/" + slug },
    twitter: { card: "summary_large_image", title: ev.title + " | " + ev.venue, description: ev.desc || ev.title + " in Omaha" },
    alternates: { canonical: "https://go-omaha.com/events/" + slug },
  };
}

function to24h(t) { if (!t) return "20:00:00"; var m = t.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i); if (!m) return "20:00:00"; var h = parseInt(m[1]); var min = m[2] || "00"; var ap = (m[3] || "").toUpperCase(); if (ap === "PM" && h < 12) h += 12; if (ap === "AM" && h === 12) h = 0; return String(h).padStart(2, "0") + ":" + min + ":00"; }
function parsePrice(p) { if (!p) return {}; var n = p.match(/\d+\.?\d*/g); if (!n) return {}; return { low: n[0], high: n.length > 1 ? n[n.length - 1] : undefined }; }
