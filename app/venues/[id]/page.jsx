import { VENUES } from "../../data/venues";
import { VenueClient } from "./VenueClient";

export function generateStaticParams() {
  return VENUES.map(v => ({ id: String(v.id) }));
}

export function generateMetadata({ params }) {
  const venue = VENUES.find(v => String(v.id) === params.id);
  if (!venue) return { title: "Venue Not Found | GO: Guide to Omaha" };

  const title = `${venue.name} — ${venue.type} in Omaha | GO: Guide to Omaha`;
  const description = (venue.desc || "").slice(0, 155);

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

export default function VenuePage({ params }) {
  const venue = VENUES.find(v => String(v.id) === params.id);
  if (!venue) return <div style={{ minHeight: "100vh", background: "#141618", color: "#F2EFE9", display: "flex", alignItems: "center", justifyContent: "center" }}><p>Venue not found</p></div>;

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <VenueClient venue={venue} />
    </>
  );
}
