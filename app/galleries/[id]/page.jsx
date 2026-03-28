import { GALLERIES } from "../../data/galleries";
import { INGESTED_EVENTS } from "../../events-data";
import { GalleryClient } from "./GalleryClient";
import { DetailPageScroll } from "../../components/DetailPageScroll";
import fs from "fs";
import path from "path";

export function generateStaticParams() {
  return GALLERIES.map(g => ({ id: g.id }));
}

export function generateMetadata({ params }) {
  const gallery = GALLERIES.find(g => g.id === params.id);
  if (!gallery) return { title: "Gallery Not Found | GO: Guide to Omaha" };

  const isMuseum = gallery.type === "Museum";
  const isKids = gallery.type === "Kids";
  const typeLabel = isMuseum ? "Museum" : isKids ? "Family Attraction" : "Gallery";
  const title = `${gallery.name} — ${typeLabel} in Omaha | GO: Guide to Omaha`;
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

function ZooRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content="0;url=/zoo/" />
      <div style={{ minHeight: "100vh", background: "#141618", color: "#F2EFE9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Redirecting to <a href="/zoo/" style={{ color: "#5EC4B6" }}>Zoo page</a>...</p>
      </div>
    </>
  );
}

export default function GalleryPage({ params }) {
  if (params.id === "zoo") return <ZooRedirect />;

  const gallery = GALLERIES.find(g => g.id === params.id);
  if (!gallery) return <div style={{ minHeight: "100vh", background: "#141618", color: "#F2EFE9", display: "flex", alignItems: "center", justifyContent: "center" }}><p>Gallery not found</p></div>;

  // Find upcoming events at this gallery/museum
  const today = new Date().toISOString().split("T")[0];
  const galleryEvents = (INGESTED_EVENTS || [])
    .filter(e => {
      if (e.date < today) return false;
      const ev = (e.venue || "").toLowerCase();
      const gn = (gallery.name || "").toLowerCase();
      if (ev === gn) return true;
      // Strict match: require at least 2 significant words to match
      const evWords = ev.replace(/^the\s+/, "").split(/\s+/).filter(w => w.length > 3);
      const gnWords = gn.replace(/^the\s+/, "").split(/\s+/).filter(w => w.length > 3);
      const matchCount = gnWords.filter(w => evWords.some(ew => ew.includes(w) || w.includes(ew))).length;
      return matchCount >= 2;
    })
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
    .slice(0, 20);

  // Find content image
  let contentImage = null;
  try {
    const slugMap = { joslyn: "joslyn-art-museum", bemis: "bemis-center", durham: "durham-museum" };
    const slug = slugMap[params.id] || (gallery.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const dirs = ["landmarks", "venues"];
    for (const dir of dirs) {
      const contentDir = path.join(process.cwd(), "public", "images", "content", dir, slug);
      if (fs.existsSync(contentDir)) {
        const imgs = fs.readdirSync(contentDir).filter(f => f.match(/\.(jpg|jpeg|png)$/i));
        if (imgs.length) { contentImage = `/images/content/${dir}/${slug}/${imgs[0]}`; break; }
      }
    }
  } catch (e) {}

  const isMuseum = gallery.type === "Museum";
  const isKids = gallery.type === "Kids";
  const schemaType = isMuseum ? "Museum" : isKids ? "TouristAttraction" : "ArtGallery";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": schemaType,
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
      <DetailPageScroll />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <GalleryClient gallery={gallery} events={galleryEvents} contentImage={contentImage} />
    </>
  );
}
