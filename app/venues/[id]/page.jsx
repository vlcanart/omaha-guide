import { VENUES } from "../../data/venues";
import { INGESTED_EVENTS } from "../../events-data";
import { VenueClient } from "./VenueClient";
import { DetailPageScroll } from "../../components/DetailPageScroll";
import fs from "fs";
import path from "path";

export function generateStaticParams() {
  return VENUES.map(v => ({ id: String(v.id) }));
}

export function generateMetadata({ params }) {
  const venue = VENUES.find(v => String(v.id) === params.id);
  if (!venue) return { title: "Venue Not Found | GO: Guide to Omaha" };

  const title = `${venue.name} — Events & Shows | GO: Guide to Omaha`;
  const description = `Upcoming events at ${venue.name} in ${venue.area}, Omaha. ${(venue.desc || "").slice(0, 120)}`;

  return {
    title,
    description,
    alternates: { canonical: `https://go-omaha.com/venues/${params.id}/` },
    openGraph: {
      title: venue.name,
      description,
      type: "website",
      url: `https://go-omaha.com/venues/${params.id}/`,
      siteName: "GO: Guide to Omaha",
      images: [{ url: "https://go-omaha.com/skyline.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: venue.name, description },
  };
}

function matchVenue(eventVenue, venueName) {
  if (!eventVenue || !venueName) return false;
  const ev = eventVenue.toLowerCase();
  const vn = venueName.toLowerCase();
  if (ev === vn) return true;
  // Match on first significant word (skip "the")
  const evWords = ev.replace(/^the\s+/, "").split(/\s+/);
  const vnWords = vn.replace(/^the\s+/, "").split(/\s+/);
  // Match if first 2+ char word matches
  const evFirst = evWords.find(w => w.length > 2) || "";
  const vnFirst = vnWords.find(w => w.length > 2) || "";
  if (evFirst && vnFirst && (ev.includes(vnFirst) || vn.includes(evFirst))) return true;
  return false;
}

export default function VenuePage({ params }) {
  const venue = VENUES.find(v => String(v.id) === params.id);
  if (!venue) return <div style={{ minHeight: "100vh", background: "#141618", color: "#F2EFE9", display: "flex", alignItems: "center", justifyContent: "center" }}><p>Venue not found</p></div>;

  // Find upcoming events at this venue
  const today = new Date().toISOString().split("T")[0];
  const venueEvents = (INGESTED_EVENTS || [])
    .filter(e => e.date >= today && matchVenue(e.venue, venue.name))
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
    .slice(0, 30);

  // Find content image from our real photo library
  const venueSlug = (venue.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let contentImage = null;
  try {
    const contentDir = path.join(process.cwd(), "public", "images", "content", "venues", venueSlug);
    if (fs.existsSync(contentDir)) {
      const imgs = fs.readdirSync(contentDir).filter(f => f.match(/\.(jpg|jpeg|png)$/i));
      if (imgs.length) contentImage = `/images/content/venues/${venueSlug}/${imgs[0]}`;
    }
  } catch (e) {}

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name: venue.name,
    description: venue.desc || "",
    address: { "@type": "PostalAddress", addressLocality: "Omaha", addressRegion: "NE" },
    geo: venue.lat ? { "@type": "GeoCoordinates", latitude: venue.lat, longitude: venue.lng } : undefined,
    maximumAttendeeCapacity: venue.cap ? parseInt(venue.cap.replace(/[^0-9]/g, "")) || undefined : undefined,
    url: venue.url || undefined,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "GO: Guide to Omaha", item: "https://go-omaha.com/" },
      { "@type": "ListItem", position: 2, name: "Venues", item: "https://go-omaha.com/?tab=venues" },
      { "@type": "ListItem", position: 3, name: venue.name },
    ],
  };

  return (
    <>
      <DetailPageScroll />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <VenueClient venue={venue} events={venueEvents} contentImage={contentImage} />
    </>
  );
}
