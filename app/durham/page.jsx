import DurhamVenuePage from "./DurhamClient";
import { DetailPageScroll } from "../components/DetailPageScroll";

export function generateMetadata() {
  const title = "The Durham Museum — Art Deco Union Station in Omaha | GO: Guide to Omaha";
  const description = "Stunning 1931 Art Deco Union Station turned Smithsonian-affiliated museum. Vintage train cars, 1940s storefronts, working soda fountain. Plan your visit.";

  return {
    title,
    description,
    alternates: { canonical: "https://go-omaha.com/durham/" },
    openGraph: {
      title: "The Durham Museum — Art Deco Union Station",
      description,
      type: "website",
      url: "https://go-omaha.com/durham/",
      siteName: "GO: Guide to Omaha",
      images: [{ url: "https://go-omaha.com/skyline.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: "The Durham Museum | GO: Guide to Omaha", description },
  };
}

export default function DurhamPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Museum",
    name: "The Durham Museum",
    description: "Stunning 1931 Art Deco Union Station turned Smithsonian-affiliated museum with vintage train cars, 1940s storefronts, and working soda fountain.",
    url: "https://durhammuseum.org",
    telephone: "(402) 444-5071",
    address: {
      "@type": "PostalAddress",
      streetAddress: "801 S 10th St",
      addressLocality: "Omaha",
      addressRegion: "NE",
      postalCode: "68108",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.2553,
      longitude: -95.9310,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "GO: Guide to Omaha", item: "https://go-omaha.com/" },
      { "@type": "ListItem", position: 2, name: "The Durham Museum" },
    ],
  };

  return (
    <>
      <DetailPageScroll />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <DurhamVenuePage />
    </>
  );
}
