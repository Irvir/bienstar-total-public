// Utilities to build cloud image URLs based on a food name.
// We use open providers first to avoid API keys. Order of preference:
// 1) Unsplash Source (no key, random but cacheable per query)
// 2) LoremFlickr (no key)
// You can extend to Pexels/Unsplash official API with keys if needed.

function normalizeQuery(name) {
  return String(name || "").trim().toLowerCase()
    .replace(/\s+/g, "+")
    .replace(/[^a-z0-9+áéíóúñü-]/gi, "");
}

export function unsplashSourceUrl(name, { width = 400, height = 400, category = "food" } = {}) {
  const q = normalizeQuery(name);
  // Unsplash Source: seeded by query; may return varying images over time but good as a quick fallback.
  // format: https://source.unsplash.com/featured/400x400/?food,apple
  return `https://source.unsplash.com/featured/${width}x${height}/?${category},${q}`;
}

export function loremFlickrUrl(name, { width = 400, height = 400, category = "food" } = {}) {
  const q = normalizeQuery(name).replace(/\+/g, ",");
  // format: https://loremflickr.com/400/400/food,apple
  return `https://loremflickr.com/${width}/${height}/${category}${q ? "," + q : ""}`;
}

export function cloudImageUrl(name, opts = {}) {
  const provider = (window?.CLOUD_IMAGE_PROVIDER || "unsplash").toLowerCase();
  if (provider === "loremflickr") return loremFlickrUrl(name, opts);
  return unsplashSourceUrl(name, opts);
}

export default cloudImageUrl;
