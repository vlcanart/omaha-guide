import { HOODS } from "../../data/hoods";
import { NeighborhoodClient } from "./NeighborhoodClient";

export function generateStaticParams() {
  return HOODS.map(h => ({ id: h.id }));
}

export function generateMetadata({ params }) {
  const hood = HOODS.find(h => h.id === params.id);
  if (!hood) return { title: "Neighborhood Not Found | GO: Guide to Omaha" };

  const title = `${hood.name} — Restaurants, Bars & Things To Do | GO: Guide to Omaha`;
  const description = (hood.desc || "").slice(0, 155);

  return {
    title,
    description,
    alternates: { canonical: `https://go-omaha.com/neighborhoods/${params.id}/` },
    openGraph: {
      title: hood.name,
      description,
      type: "website",
      url: `https://go-omaha.com/neighborhoods/${params.id}/`,
      siteName: "GO: Guide to Omaha",
      images: [{ url: "https://go-omaha.com/skyline.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: hood.name, description },
  };
}

export default function NeighborhoodPage({ params }) {
  const hood = HOODS.find(h => h.id === params.id);
  if (!hood) return <div style={{ minHeight: "100vh", background: "#141618", color: "#F2EFE9", display: "flex", alignItems: "center", justifyContent: "center" }}><p>Neighborhood not found</p></div>;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: hood.name,
    description: hood.desc || "",
    address: { "@type": "PostalAddress", addressLocality: "Omaha", addressRegion: "NE", addressCountry: "US" },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "GO: Guide to Omaha", item: "https://go-omaha.com/" },
      { "@type": "ListItem", position: 2, name: "Explore", item: "https://go-omaha.com/?tab=explore" },
      { "@type": "ListItem", position: 3, name: hood.name },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <NeighborhoodClient hood={hood} />
    </>
  );
}
