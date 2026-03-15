import './globals.css';

export const metadata = {
  title: 'GO: Guide to Omaha — Events, Concerts, Sports & Things To Do',
  description: 'The most comprehensive guide to Omaha events. Discover concerts, sports, comedy, festivals, family activities and more across 60+ venues. Updated twice daily.',
  keywords: 'Omaha events, Omaha concerts, things to do Omaha, Guide to Omaha, GO Omaha, Omaha nightlife, Omaha sports, Omaha comedy, Council Bluffs events, Omaha festivals, Omaha family events',
  authors: [{ name: 'GO: Guide to Omaha' }],
  creator: 'GO: Guide to Omaha',
  publisher: 'GO: Guide to Omaha',
  robots: 'index, follow',
  alternates: { canonical: 'https://go-omaha.com' },
  openGraph: {
    title: 'GO: Guide to Omaha',
    description: 'Your guide to everything happening in Omaha — concerts, sports, comedy, festivals & more across 60+ venues.',
    type: 'website',
    locale: 'en_US',
    siteName: 'GO: Guide to Omaha',
    url: 'https://go-omaha.com',
    images: [{ url: 'https://go-omaha.com/skyline.jpg', width: 1200, height: 630, alt: 'GO: Guide to Omaha — Omaha skyline' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GO: Guide to Omaha',
    description: 'Discover events, venues & things to do in Omaha. Updated twice daily.',
    images: ['https://go-omaha.com/skyline.jpg'],
  },
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#5EC4B6',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  // JSON-LD structured data for search engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "GO: Guide to Omaha",
    description: "Comprehensive events guide for the Omaha metro area",
    url: "https://go-omaha.com",
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    areaServed: {
      "@type": "City",
      name: "Omaha",
      address: { "@type": "PostalAddress", addressRegion: "NE", addressCountry: "US" },
    },
  };

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Plausible Analytics — privacy-friendly, no cookie banner needed */}
        {/* Replace go-omaha.com with your actual domain */}
        <script
          defer
          data-domain="go-omaha.com"
          src="https://plausible.io/js/script.js"
        />

        {/* Register Service Worker for PWA offline support */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
        {/* iOS viewport height fix + prevent body scroll */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var last = 0;
                function setH(){
                  var h = window.innerHeight;
                  if(h !== last){
                    last = h;
                    document.documentElement.style.setProperty('--app-h', h + 'px');
                  }
                  requestAnimationFrame(setH);
                }
                setH();

                document.addEventListener('touchmove', function(e){
                  var t = e.target;
                  while(t && t !== document.body){
                    if(t.id === 'app-content') return;
                    if(t.scrollHeight > t.clientHeight && getComputedStyle(t).overflowY !== 'hidden') return;
                    t = t.parentElement;
                  }
                  e.preventDefault();
                }, {passive: false});
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
