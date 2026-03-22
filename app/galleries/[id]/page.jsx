import { GALLERIES } from "../../data/galleries";
import { GalleryClient } from "./GalleryClient";

export function generateStaticParams() {
  return GALLERIES.map(g => ({ id: g.id }));
}

export function generateMetadata({ params }) {
  const gallery = GALLERIES.find(g => g.id === params.id);
  if (!gallery) return { title: "Gallery Not Found | GO: Guide to Omaha" };

  const isMuseum = gallery.type === "Museum";
  const title = `${gallery.name} — ${isMuseum ? "Museum" : "Gallery"} in Omaha | GO: Guide to Omaha`;
  const description = (gallery.blurb || "").slice(0, 155);

  return {
    title,
    description,
    alternates: { canonical: `https://go-omaha.com/galleries/${params.id}/` },
    openGraph: {
      title: gallery.name,
      description,
      type: "website",
      url: `https://go-omaha.com/galleries/${params.id}/`,
      siteName: "GO: Guide to Omaha",
      images: [{ url: "https://go-omaha.com/skyline.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: gallery.name, description },
  };
}

export default function GalleryPage({ params }) {
  const gallery = GALLERIES.find(g => g.id === params.id);
  if (!gallery) return <div style={{ minHeight: "100vh", background: "#141618", color: "#F2EFE9", display: "flex", alignItems: "center", justifyContent: "center" }}><p>Gallery not found</p></div>;

  const isMuseum = gallery.type === "Museum";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isMuseum ? "Museum" : "ArtGallery",
    name: gallery.name,
    description: gallery.blurb || "",
    address: gallery.address || "",
    telephone: gallery.phone || undefined,
    url: gallery.web || undefined,
    isAccessibleForFree: gallery.admissionFree || false,
    openingHoursSpecification: gallery.hours?.filter(h => !h.closed).map(h => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.day === "Mon" ? "Monday" : h.day === "Tue" ? "Tuesday" : h.day === "Wed" ? "Wednesday" : h.day === "Thu" ? "Thursday" : h.day === "Fri" ? "Friday" : h.day === "Sat" ? "Saturday" : "Sunday",
      opens: h.hours?.split("-")[0]?.trim() || "",
      closes: h.hours?.split("-")[1]?.trim() || "",
    })) || [],
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "GO: Guide to Omaha", item: "https://go-omaha.com/" },
      { "@type": "ListItem", position: 2, name: "Museums & Galleries", item: "https://go-omaha.com/?tab=museums" },
      { "@type": "ListItem", position: 3, name: gallery.name },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <GalleryClient gallery={gallery} />
    </>
  );
}
