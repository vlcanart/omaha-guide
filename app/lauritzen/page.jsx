import LauritzenVenuePage from "./LauritzenClient";
import { DetailPageScroll } from "../components/DetailPageScroll";

export function generateMetadata() {
  const title = "Lauritzen Gardens — 100-Acre Botanical Garden in Omaha | GO: Guide to Omaha";
  const description = "100 acres of stunning botanical gardens with seasonal model trains, conservatory, rose gardens, and Japanese garden. Plan your visit to Omaha's premier outdoor attraction.";

  return {
    title,
    description,
    alternates: { canonical: "https://go-omaha.com/lauritzen/" },
    openGraph: {
      title: "Lauritzen Gardens — 100-Acre Botanical Garden",
      description,
      type: "website",
      url: "https://go-omaha.com/lauritzen/",
      siteName: "GO: Guide to Omaha",
      images: [{ url: "https://go-omaha.com/skyline.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: "Lauritzen Gardens | GO: Guide to Omaha", description },
  };
}

export default function LauritzenPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Park",
    name: "Lauritzen Gardens",
    description: "100-acre botanical garden with seasonal model trains, conservatory, rose gardens, and Japanese garden.",
    url: "https://www.lauritzengardens.org",
    telephone: "(402) 346-4002",
    address: {
      "@type": "PostalAddress",
      streetAddress: "100 Bancroft St",
      addressLocality: "Omaha",
      addressRegion: "NE",
      postalCode: "68108",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.2384,
      longitude: -95.9158,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "GO: Guide to Omaha", item: "https://go-omaha.com/" },
      { "@type": "ListItem", position: 2, name: "Lauritzen Gardens" },
    ],
  };

  return (
    <>
      <DetailPageScroll />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <LauritzenVenuePage />
    </>
  );
}
