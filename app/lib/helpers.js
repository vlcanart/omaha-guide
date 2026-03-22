/* ═══ HELPERS ═══ */

export const mapsDir = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
export const mapsUrl = (name, address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + address)}`;
export const u = id => `https://images.unsplash.com/${id}?w=600&h=400&fit=crop&q=80`;

export function slugify(title, id) {
  const base = (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return `${base}-${id}`;
}
