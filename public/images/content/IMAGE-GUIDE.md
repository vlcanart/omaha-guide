# GO: Omaha Image Library Guide

## How Images Work on the Site

Every image on go-omaha.com is served from this folder structure. The site auto-discovers images by looking for files matching the **folder-name** convention below. Drop a properly named file in the right folder and it will appear on the site after the next build.

---

## Folder Structure

```
public/images/content/
  neighborhoods/          Omaha neighborhoods & districts
    old-market/           old-market-1.jpg, old-market-2.jpg, ...
    dundee/               dundee-1.jpg, dundee-2.jpg, ...
    benson/               benson-1.jpg, ...
    blackstone/
    midtown/
    aksarben/
    downtown/
    north-omaha/
    south-omaha/
    little-italy/
    council-bluffs/
    la-vista-papillion/
    elkhorn/
    florence/
    west-omaha/

  venues/                 Event venues & performance spaces
    chi-health-center/    chi-health-center-1.jpg, ...
    orpheum-theater/      orpheum-theater-1.jpg, ...
    the-slowdown/
    the-admiral/
    the-astro/
    steelhouse-omaha/
    baxter-arena/
    charles-schwab-field/
    werner-park/
    bemis-center/
    holland-center/
    henry-doorly-zoo/
    barnato/
    film-streams/
    omaha-community-playhouse/
    ... (31 venue folders total)

  artists/                Performers, musicians, comedians
    whitney-cummings/     whitney-cummings-1.jpg, ...
    lorna-shore/          lorna-shore-1.jpg, ...
    ... (35 artist folders)

  teams/                  Sports teams
    creighton-bluejays/   creighton-bluejays-1.png (logo)
    omaha-storm-chasers/  omaha-storm-chasers-1.jpg
    nebraska-cornhuskers/
    omaha-mavericks/
    omaha-lancers/
    omaha-supernovas/
    omaha-kings-queens/

  landmarks/              Parks, museums, bridges, historic sites
    bob-kerrey-pedestrian-bridge/
    joslyn-art-museum/
    gene-leahy-mall/
    lauritzen-gardens/
    heartland-of-america-park/
    ... (16 landmark folders)

  categories/             Hero images for event categories
    concerts/             concerts-1.jpg
    sports/               sports-1.jpg
    comedy/               comedy-1.jpg
    arts/                 arts-1.jpg
    family/               family-1.jpg
    festivals/            festivals-1.jpg

  hero/                   Site-wide hero/banner images
```

---

## File Naming Convention

**Rule: `{folder-name}-{number}.{ext}`**

| Folder | File 1 | File 2 | File 3 |
|--------|--------|--------|--------|
| `dundee/` | `dundee-1.jpg` | `dundee-2.jpg` | `dundee-3.jpg` |
| `chi-health-center/` | `chi-health-center-1.jpg` | `chi-health-center-2.jpg` | ... |
| `whitney-cummings/` | `whitney-cummings-1.jpg` | `whitney-cummings-2.jpg` | ... |

- **Image 1** (`-1`) is always the **hero/primary** image (used as the main photo on cards and pages)
- **Images 2-5** are gallery/secondary images (used in carousels and detail pages)
- Use `.jpg` for photos, `.png` for logos/transparent backgrounds
- No spaces, no uppercase, no special characters

---

## How to Add or Replace Images

### Replace an existing image:
1. Navigate to the right folder (e.g., `neighborhoods/dundee/`)
2. Replace `dundee-1.jpg` with your new file (same name)
3. Commit and push to GitHub

### Add more images to a location:
1. Navigate to the folder (e.g., `venues/chi-health-center/`)
2. See what numbers exist (e.g., `chi-health-center-1.jpg` through `-5.jpg`)
3. Add your new file as the next number: `chi-health-center-6.jpg`
4. Commit and push

### Add a brand new entity:
1. Create a new folder: `neighborhoods/my-new-hood/`
2. Add at least one image: `my-new-hood-1.jpg`
3. The site code also needs to be updated to reference the new entity

---

## Image Specs

| Use | Recommended Size | Notes |
|-----|-----------------|-------|
| Neighborhood hero | 1200 x 800 px | Landscape, vibrant, recognizable location |
| Venue hero | 1200 x 800 px | Exterior or stage shot, well-lit |
| Artist photo | 800 x 800 px | Press photo or performance shot |
| Team logo | 400 x 400 px | PNG with transparent background preferred |
| Landmark | 1200 x 800 px | Iconic angle, good lighting |
| Category hero | 1200 x 600 px | Generic mood shot for the category |

- **Max file size**: 500KB (optimize with TinyPNG or similar)
- **Format**: JPG for photos, PNG for logos/graphics
- **Aspect ratio**: 3:2 for heroes, 1:1 for portraits/logos

---

## Image Quality Standards

**DO use:**
- Original photos you've taken
- Press photos from artist/venue websites (with permission)
- Tourism board photos (Visit Omaha)
- Wikipedia/Wikimedia Commons (CC-licensed)
- Venue-provided promotional images

**DO NOT use:**
- Unsplash or other generic stock photos
- Low-resolution screenshots
- Watermarked images
- AI-generated images of real places/people

---

## Quick Reference

```
To add 3 new Dundee photos:
  1. Go to: public/images/content/neighborhoods/dundee/
  2. Add:   dundee-2.jpg, dundee-3.jpg, dundee-4.jpg
  3. Push to GitHub
  4. Site rebuilds automatically

To replace the Old Market hero:
  1. Go to: public/images/content/neighborhoods/old-market/
  2. Replace: old-market-1.jpg (keep the same filename)
  3. Push to GitHub
```

---

## Current Coverage (as of March 2026)

| Category | Folders | With Images | Need Images |
|----------|---------|-------------|-------------|
| Neighborhoods | 15 | 15 (1 each) | Need 2-3 more per neighborhood |
| Venues | 31 | 28 | 3 empty folders |
| Artists | 35 | 28 | 7 empty folders |
| Teams | 7 | 7 | Could use action shots |
| Landmarks | 16 | 16 | Could use alternate angles |
| Categories | 6 | 6 | Good |

**Priority: Add 2-3 more photos per neighborhood and top venues.**
