function categoryHref(category) {
  const params = new URLSearchParams();

  params.set("category", category);
  params.set("page", "1");

  return `/shop?${params.toString()}`;
}

function curatedHref(type, slug) {
  const params = new URLSearchParams();

  params.set(type, slug);
  params.set("page", "1");

  return `/shop?${params.toString()}`;
}

export const shopNavigation = {
  categories: [
    { label: "Frames", href: categoryHref("Frames") },
    { label: "Tables", href: categoryHref("Tables") },
    { label: "Flowers", href: categoryHref("Flowers") },
    { label: "Bedding", href: categoryHref("Bedsheets") },
    { label: "Rugs", href: categoryHref("Rugs") },
    { label: "Mirrors", href: categoryHref("Mirrors") },
    { label: "Candles", href: categoryHref("Scented Candles") },
    { label: "Diffusers", href: categoryHref("Diffusers") },
    { label: "Wall Clocks", href: categoryHref("Wall Clocks") },
    { label: "Plants", href: categoryHref("Plants") },
    { label: "Lighting", href: categoryHref("Lighting") },
  ],
  rooms: [
    { label: "Living Room", href: curatedHref("space", "living-room") },
    { label: "Bedroom", href: curatedHref("space", "bedroom") },
    { label: "Dining Area", href: curatedHref("space", "dining-area") },
    { label: "Office", href: curatedHref("space", "office") },
    { label: "Entryway", href: curatedHref("space", "entryway") },
    { label: "TV Console", href: curatedHref("space", "tv-console") },
  ],
  collections: [
    {
      label: "Modern Luxury",
      href: curatedHref("collection", "modern-luxury"),
    },
    {
      label: "Warm Minimalist",
      href: curatedHref("collection", "warm-minimalist"),
    },
    {
      label: "Cozy Apartment",
      href: curatedHref("collection", "cozy-apartment"),
    },
    {
      label: "Neutral Elegance",
      href: curatedHref("collection", "neutral-elegance"),
    },
  ],
  viewAll: { label: "View All Products", href: "/shop" },
};
