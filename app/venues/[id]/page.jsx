// app/venues/[id]/page.jsx — Server Component
import { VENUES } from "../../data/venues";
import { SEED_EVENTS } from "../../data/events";
import { INGESTED_EVENTS } from "../../events-data";
import { eventSlug } from "../../events/event-utils";
import { VenueClient } from "./VenueClient";
import { DetailPageScroll } from "../../components/DetailPageScroll";

function getAllEvents() {
  var seed = Array.isArray(SEED_EVENTS) ? SEED_EVENTS : [];
  var ingested = Array.isArray(INGESTED_EVENTS) ? INGESTED_EVENTS : [];
  return [...seed, ...ingested];
}

function getUpcomingEvents(venueName) {
  var today = new Date().toISOString().slice(0, 10);
  return getAllEvents()
    .filter(function(ev) { return ev.venue === venueName; })
    .filter(function(ev) { return !ev.date || ev.date >= today || !/^\d{4}/.test(ev.date); })
    .sort(function(a, b) { return (a.date || "").localeCompare(b.date || ""); })
    .slice(0, 12)
    .map(function(ev) { return Object.assign({}, ev, { slug: eventSlug(ev) }); });
}

export function generateStaticParams() {
  return VENUES.map(function(v) { return { id: v.slug || String(v.id) }; });
}

export function generateMetadata({ params }) {
  var venue = VENUES.find(function(v) { return (v.slug || String(v.id)) === params.id; });
  if (!venue) return { title: "Venue Not Found | GO: Guide to Omaha" };

  var title = venue.name + " — " + venue.type + " in " + (venue.city === "lincoln" ? "Lincoln" : venue.city === "cb" ? "Council Bluffs" : "Omaha") + " | GO: Guide to Omaha";
  var description = venue.desc + " Capacity: " + venue.cap + ". " + venue.area + ".";

  return {
    title: title,
    description: description,
    alternates: { canonical: "https://go-omaha.com/venues/" + (venue.slug || params.id) + "/" },
    openGraph: {
      title: venue.name,
      description: description,
      type: "website",
      url: "https://go-omaha.com/venues/" + (venue.slug || params.id) + "/",
      siteName: "GO: Guide to Omaha",
      images: [{ url: "https://go-omaha.com/skyline.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: venue.name, description: description },
  };
}

export default function VenuePage({ params }) {
  var venue = VENUES.find(function(v) { return (v.slug || String(v.id)) === params.id; });
  if (!venue) return <div style={{ minHeight: "100vh", background: "#141618", color: "#F2EFE9", display: "flex", alignItems: "center", justifyContent: "center" }}><p>Venue not found</p></div>;

  var upcomingEvents = getUpcomingEvents(venue.name);
  var cityName = venue.city === "lincoln" ? "Lincoln" : venue.city === "cb" ? "Council Bluffs" : "Omaha";

  var jsonLd = {
    "@context": "https://schema.org",
    "@type": venue.type === "Museum / Attraction" ? "Museum" : "EventVenue",
    name: venue.name,
    description: venue.desc || "",
    address: { "@type": "PostalAddress", streetAddress: venue.addr || "", addressLocality: cityName, addressRegion: "NE", addressCountry: "US" },
    geo: venue.lat ? { "@type": "GeoCoordinates", latitude: venue.lat, longitude: venue.lng } : undefined,
    maximumAttendeeCapacity: venue.cap ? parseInt(venue.cap.replace(/[^0-9]/g, "")) || undefined : undefined,
    url: venue.url || undefined,
  };

  if (upcomingEvents.length > 0) {
    jsonLd.event = upcomingEvents.slice(0, 5).map(function(ev) {
      return {
        "@type": "Event",
        name: ev.title,
        startDate: ev.date || undefined,
        url: "https://go-omaha.com/events/" + ev.slug + "/",
        offers: ev.url && ev.url !== "#" ? { "@type": "Offer", url: ev.url } : undefined,
      };
    });
  }

  var breadcrumbLd = {
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
      <VenueClient venue={venue} upcomingEvents={upcomingEvents} />
    </>
  );
}
