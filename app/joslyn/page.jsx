import JoslynVenuePage from "./JoslynClient";
import { DetailPageScroll } from "../components/DetailPageScroll";

export function generateMetadata() {
  const title = "Joslyn Art Museum — Free World-Class Art in Omaha | GO: Guide to Omaha";
  const description = "12,000 works spanning 5,000 years. Three architecturally distinct buildings including the 2024 Snohetta-designed Hawks Pavilion. Always free admission. Plan your visit.";

  return {
    title,
    description,
    alternates: { canonical: "https://go-omaha.com/joslyn/" },
    openGraph: {
      title: "Joslyn Art Museum — Free World-Class Art",
      description,
      type: "website",
      url: "https://go-omaha.com/joslyn/",
      siteName: "GO: Guide to Omaha",
      images: [{ url: "https://go-omaha.com/skyline.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: "Joslyn Art Museum | GO: Guide to Omaha", description },
  };
}

export default function JoslynPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ArtGallery",
    name: "Joslyn Art Museum",
    description: "Nebraska's largest art museum with 12,000+ works spanning 5,000 years. Three architecturally distinct buildings. Always free admission.",
    url: "https://joslyn.org",
    telephone: "(402) 342-3300",
    address: {
      "@type": "PostalAddress",
      streetAddress: "2200 Dodge St",
      addressLocality: "Omaha",
      addressRegion: "NE",
      postalCode: "68102",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.2635,
      longitude: -95.9394,
    },
    isAccessibleForFree: true,
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "00:00", closes: "00:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Tuesday", "Friday", "Saturday", "Sunday"], opens: "10:00", closes: "16:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Wednesday", "Thursday"], opens: "10:00", closes: "20:00" },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.7",
      reviewCount: "4280",
      bestRating: "5",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "GO: Guide to Omaha", item: "https://go-omaha.com/" },
      { "@type": "ListItem", position: 2, name: "Joslyn Art Museum" },
    ],
  };

  return (
    <>
      <DetailPageScroll />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <JoslynVenuePage />
    </>
  );
}
