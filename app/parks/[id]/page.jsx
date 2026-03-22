import { PARKS } from "../../data/parks";
import { ParkClient } from "./ParkClient";

export function generateStaticParams() {
  return PARKS.map(p => ({ id: p.id }));
}

export function generateMetadata({ params }) {
  const park = PARKS.find(p => p.id === params.id);
  if (!park) return { title: "Park Not Found | GO: Guide to Omaha" };

  const title = `${park.name} — Trails, Activities & Info | GO: Guide to Omaha`;
  const description = (park.desc || "").slice(0, 155);

  return {
    title,
    description,
    alternates: { canonical: `https://go-omaha.com/parks/${params.id}/` },
    openGraph: {
      title: park.name,
      description,
      type: "website",
      url: `https://go-omaha.com/parks/${params.id}/`,
      siteName: "GO: Guide to Omaha",
      images: [{ url: "https://go-omaha.com/skyline.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: park.name, description },
  };
}

export default function ParkPage({ params }) {
  const park = PARKS.find(p => p.id === params.id);
  if (!park) return <div style={{ minHeight: "100vh", background: "#141618", color: "#F2EFE9", display: "flex", alignItems: "center", justifyContent: "center" }}><p>Park not found</p></div>;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Park",
    name: park.name,
    description: park.desc || "",
    address: park.address || "",
    geo: park.lat ? { "@type": "GeoCoordinates", latitude: park.lat, longitude: park.lng } : undefined,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "GO: Guide to Omaha", item: "https://go-omaha.com/" },
      { "@type": "ListItem", position: 2, name: "Explore", item: "https://go-omaha.com/?tab=explore" },
      { "@type": "ListItem", position: 3, name: park.name },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ParkClient park={park} />
    </>
  );
}
