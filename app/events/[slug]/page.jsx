import { SEED_EVENTS } from "../../data/events";
import { INGESTED_EVENTS } from "../../events-data";
import { slugify } from "../../lib/helpers";
import { EventDetailClient } from "./EventDetailClient";
import { DetailPageScroll } from "../../components/DetailPageScroll";

function getAllEvents() {
  return [...SEED_EVENTS, ...(INGESTED_EVENTS || [])];
}

function findEvent(slug) {
  const all = getAllEvents();
  return all.find(ev => slugify(ev.title, ev.id) === slug);
}

export function generateStaticParams() {
  return getAllEvents().map(ev => ({ slug: slugify(ev.title, ev.id) }));
}

export function generateMetadata({ params }) {
  const ev = findEvent(params.slug);
  if (!ev) return { title: "Event Not Found | GO: Guide to Omaha" };

  const title = `${ev.title} at ${ev.venue} | GO: Guide to Omaha`;
  const description = ev.desc?.slice(0, 155) || `${ev.title} — ${ev.date} at ${ev.venue}, Omaha`;

  return {
    title,
    description,
    alternates: { canonical: `https://go-omaha.com/events/${params.slug}/` },
    openGraph: {
      title: ev.title,
      description,
      type: "website",
      url: `https://go-omaha.com/events/${params.slug}/`,
      siteName: "GO: Guide to Omaha",
      images: [{ url: "https://go-omaha.com/skyline.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: ev.title, description },
  };
}

export default function EventPage({ params }) {
  const ev = findEvent(params.slug);
  if (!ev) {
    return (
      <div style={{ minHeight: "100vh", background: "#141618", color: "#F2EFE9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Event not found</p>
      </div>
    );
  }

  // Event JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: ev.title,
    description: ev.desc || "",
    startDate: ev.date || undefined,
    location: {
      "@type": "Place",
      name: ev.venue || "",
      address: { "@type": "PostalAddress", addressLocality: "Omaha", addressRegion: "NE" },
    },
    ...(ev.url ? { offers: { "@type": "Offer", url: ev.url } } : {}),
  };

  // Breadcrumb JSON-LD
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "GO: Guide to Omaha", item: "https://go-omaha.com/" },
      { "@type": "ListItem", position: 2, name: "Events", item: "https://go-omaha.com/?tab=events" },
      { "@type": "ListItem", position: 3, name: ev.title },
    ],
  };

  return (
    <>
      <DetailPageScroll />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <EventDetailClient event={ev} />
    </>
  );
}
