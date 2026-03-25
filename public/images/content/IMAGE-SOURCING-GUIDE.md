# GO: Guide to Omaha — Image Sourcing Guide

## Current Status
- **55 images populated** (20 venues, 3 team logos)
- **60 folders still empty** (33 artists, 15 neighborhoods, 16 landmarks, 6 categories, 11 venues, 4 teams)

---

## Folder Structure
```
public/images/content/
├── artists/      (33 folders) — Artist press photos, headshots
├── venues/       (31 folders) — Venue exterior/interior shots
├── teams/        (7 folders)  — Team logos and action shots
├── neighborhoods/(15 folders) — District/area photography
├── landmarks/    (16 folders) — Parks, museums, bridges
├── categories/   (6 folders)  — Category hero images
└── hero/         — Site-wide hero/skyline images
```

---

## Image Sourcing Tactics (No Unsplash)

### TIER 1: Best Quality, Free to Use

#### 1. Visit Omaha Media Library
**URL**: https://www.visitomaha.com/media/
The tourism board has a full press/media photo library with high-res professional shots of:
- Skyline, downtown, neighborhoods
- Major venues (CHI Health Center, Orpheum, TD Ameritrade)
- Landmarks (Bob Kerrey Bridge, Gene Leahy Mall, Old Market)
- Seasonal/event photography
**Usage**: Media/press use — email media@visitomaha.com for commercial rights clarification.

#### 2. City of Omaha / Douglas County
**URL**: https://www.cityofomaha.org/
Government photos are often public domain. Good for:
- Parks, public spaces, infrastructure
- Neighborhood aerial shots
- Gene Leahy Mall / Riverfront revitalization photos

#### 3. Venue Websites (og:image scraping)
Every venue has hero images on their homepage. Use `og:image` meta tags:
- CHI Health Center → chihealthcenteromaha.com
- Orpheum → omahaperformingarts.org
- Werner Park → milb.com/omaha
- Henry Doorly Zoo → omahazoo.com
These are the highest-quality venue photos available.

#### 4. Flickr Creative Commons
**URL**: https://www.flickr.com/search/?text=omaha+nebraska&license=1%2C2%2C3%2C4%2C5%2C6
Search with CC license filter. Excellent for:
- Old Market streetscapes
- Benson murals
- Blackstone District
- Downtown skyline shots
Many professional photographers post CC-licensed Omaha work.

### TIER 2: Artist Images

#### 5. Spotify Press Images
Use Spotify's embed/share URLs — artist hero images are served from Spotify's CDN.
Pattern: `https://i.scdn.co/image/...`
Available for all major artists in the lineup.

#### 6. Artist Press Kits / EPKs
Most touring artists have downloadable press photos:
- Check artist websites for "Press" or "EPK" pages
- Management companies often have media kits
- Labels provide hi-res promotional images

#### 7. Ticketmaster Event Images
Already in your pipeline! The Ticketmaster API returns event images.
Check: `public/images/events/` — already has event-specific images.

### TIER 3: Team/Sports

#### 8. ESPN CDN (already using)
Pattern: `https://a.espncdn.com/i/teamlogos/ncaa/500/{ID}.png`
✅ Already downloaded: Creighton, UNO, Nebraska

#### 9. MiLB.com / Team Websites
- Storm Chasers: milb.com/omaha
- Lancers: omahalancers.com
- Supernovas: lovb.com/teams/omaha

### TIER 4: Neighborhoods & Landmarks

#### 10. Google Maps Street View Static API
**URL**: `https://maps.googleapis.com/maps/api/streetview?size=1200x600&location=...&key=YOUR_KEY`
Requires Google Maps API key. Excellent for:
- Exact intersection/neighborhood shots
- Storefront views
- Park entrances

#### 11. Nebraska Tourism Commission
**URL**: https://visitnebraska.com/media
State-level tourism photos, including Omaha metro.

#### 12. Wikimedia Commons (category browsing)
Direct category links (works better than search):
- https://commons.wikimedia.org/wiki/Category:Omaha,_Nebraska
- https://commons.wikimedia.org/wiki/Category:Buildings_in_Omaha,_Nebraska
Browse visually, download what works.

---

## Naming Conventions

### Files per folder:
```
artists/{slug}/
  hero.jpg       — Primary press photo (800x800 min)
  thumb.jpg      — Square crop for cards (400x400)
  banner.jpg     — Wide crop for headers (1200x400)

venues/{slug}/
  exterior.jpg   — Building exterior
  interior.jpg   — Inside the venue
  thumb.jpg      — Card thumbnail
  stage.jpg      — Stage/performance area

teams/{slug}/
  logo.png       — Transparent PNG logo
  logo-dark.png  — Dark background version
  action.jpg     — Game/match action shot

neighborhoods/{slug}/
  hero.jpg       — Defining street/area shot
  street.jpg     — Street-level view
  aerial.jpg     — Overhead/drone view (if available)

landmarks/{slug}/
  hero.jpg       — Iconic angle
  detail.jpg     — Architectural detail
```

### Image specs:
- **Format**: JPEG for photos, PNG for logos/transparency
- **Min resolution**: 800px on shortest side
- **Max file size**: 500KB (optimize with squoosh.app or imageoptim)
- **Aspect ratios**: 16:9 for heroes/banners, 1:1 for thumbs, 3:2 for cards

---

## Quick Win: Manual Batch Download

The fastest way to populate the remaining folders:

1. **Neighborhoods** (15 min): Go to visitomaha.com, browse neighborhood pages, save hero images
2. **Landmarks** (15 min): Go to each landmark's website, save their hero/og:image
3. **Artists** (30 min): Visit each artist's Spotify page → right-click → save artist image
4. **Teams** (10 min): Visit team websites, save logos from header/about pages
5. **Categories** (10 min): Use best venue photos from populated folders as category heroes

---

## Automation Options (Future)

1. **Spotify Web API** — Get artist images programmatically (needs OAuth app)
2. **Google Places Photos API** — Get venue/landmark photos (needs billing)
3. **Jina Reader** — Already in pipeline, could scrape og:image from venue pages
4. **Custom scraper** — Hit venue URLs, extract og:image meta tags automatically
