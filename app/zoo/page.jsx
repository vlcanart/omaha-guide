import { ZOO_INFO, ZOO_EXHIBITS, ZOO_SEASONS } from "../data/zoo";
import { ZooClient } from "./ZooClient";
import { DetailPageScroll } from "../components/DetailPageScroll";

export function generateMetadata() {
  const title = "Henry Doorly Zoo & Aquarium — #1 Zoo in the World | GO: Guide to Omaha";
  const description = "Plan your visit to the #1 zoo in the world. 160 acres, 17,000+ animals, Desert Dome, Lied Jungle, IMAX theater, 13 dining spots. Hours, pricing, exhibits & tips.";

  return {
    title,
    description,
    alternates: { canonical: "https://go-omaha.com/zoo/" },
    openGraph: {
      title: "Henry Doorly Zoo & Aquarium — #1 Zoo in the World",
      description,
      type: "website",
      url: "https://go-omaha.com/zoo/",
      siteName: "GO: Guide to Omaha",
      images: [{ url: "https://go-omaha.com/skyline.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: "Henry Doorly Zoo & Aquarium", description },
  };
}

export default function ZooPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Zoo",
    name: ZOO_INFO.name,
    description: ZOO_INFO.blurb,
    url: ZOO_INFO.web,
    telephone: ZOO_INFO.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "3701 S 10th St",
      addressLocality: "Omaha",
      addressRegion: "NE",
      postalCode: "68107",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: ZOO_INFO.lat,
      longitude: ZOO_INFO.lng,
    },
    image: ZOO_INFO.img,
    priceRange: "$14.95 - $33.95",
    openingHoursSpecification: ZOO_SEASONS.map(s => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: s.id === "summer" ? "09:00" : "10:00",
      closes: s.id === "summer" ? "17:00" : "16:00",
      validFrom: s.id === "summer" ? "2026-04-01" : "2025-11-04",
      validThrough: s.id === "summer" ? "2026-11-03" : "2026-03-31",
    })),
    containsPlace: ZOO_EXHIBITS.slice(0, 6).map(ex => ({
      "@type": "TouristAttraction",
      name: ex.name,
      description: ex.tagline,
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.7",
      reviewCount: "6048",
      bestRating: "5",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "GO: Guide to Omaha", item: "https://go-omaha.com/" },
      { "@type": "ListItem", position: 2, name: "Henry Doorly Zoo & Aquarium" },
    ],
  };

  return (
    <>
      <DetailPageScroll />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ZooClient />
    </>
  );
}
