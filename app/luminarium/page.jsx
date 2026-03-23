import LuminariumVenuePage from "./LuminariumClient";
import { DetailPageScroll } from "../components/DetailPageScroll";

export function generateMetadata() {
  const title = "Kiewit Luminarium — Interactive Science Center on the RiverFront | GO: Guide to Omaha";
  const description = "82,000 sq ft interactive science center with 125+ hands-on STEAM exhibits. The Grid building tower, Geometry Playground, Night Light adults-only events. On Omaha's RiverFront.";

  return {
    title,
    description,
    alternates: { canonical: "https://go-omaha.com/luminarium/" },
    openGraph: {
      title: "Kiewit Luminarium — Interactive Science Center",
      description,
      type: "website",
      url: "https://go-omaha.com/luminarium/",
      siteName: "GO: Guide to Omaha",
      images: [{ url: "https://go-omaha.com/skyline.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: "Kiewit Luminarium | GO: Guide to Omaha", description },
  };
}

export default function LuminariumPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Museum",
    name: "Kiewit Luminarium",
    description: "82,000 sq ft interactive science center with 125+ hands-on STEAM exhibits on Omaha's RiverFront.",
    url: "https://kiewitluminarium.org",
    telephone: "(402) 661-8400",
    address: {
      "@type": "PostalAddress",
      streetAddress: "700 Riverfront Dr",
      addressLocality: "Omaha",
      addressRegion: "NE",
      postalCode: "68102",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.2565,
      longitude: -95.9230,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "GO: Guide to Omaha", item: "https://go-omaha.com/" },
      { "@type": "ListItem", position: 2, name: "Kiewit Luminarium" },
    ],
  };

  return (
    <>
      <DetailPageScroll />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <LuminariumVenuePage />
    </>
  );
}
