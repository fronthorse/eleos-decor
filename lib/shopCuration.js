const CATEGORY_ALIASES = {
  Blankets: "Throw Blankets",
  Candles: "Scented Candles",
  Centerpieces: "Ornaments",
  "TV Consoles": "Tables",
};

export const SHOP_SPACE_FILTERS = [
  {
    label: "Living Room",
    slug: "living-room",
    description: "Tables, consoles, rugs, greenery, and wall details.",
    tiers: [
      { weight: "primary", categories: ["Tables", "Rugs"] },
      { weight: "secondary", categories: ["Plants", "Frames", "Wall Clocks"] },
      { weight: "tertiary", categories: ["Lamps", "Scented Candles", "Flowers"] },
    ],
  },
  {
    label: "Bedroom",
    slug: "bedroom",
    description: "Soft bedding, pillows, throws, and calm finishing accents.",
    tiers: [
      { weight: "primary", categories: ["Bedsheets", "Throw Pillows", "Throw Blankets"] },
      { weight: "secondary", categories: ["Lamps", "Scented Candles", "Rugs", "Diffusers"] },
      { weight: "tertiary", categories: ["Flowers", "Frames"] },
    ],
  },
  {
    label: "Dining Area",
    slug: "dining-area",
    description: "Dining furniture, tablescapes, candles, florals, and centerpieces.",
    tiers: [
      { weight: "primary", categories: ["Dining Sets", "Tables"] },
      { weight: "secondary", categories: ["Scented Candles", "Flowers", "Ornaments"] },
      { weight: "tertiary", categories: ["Frames", "Rugs"] },
    ],
  },
  {
    label: "Office",
    slug: "office",
    description: "Focused, polished pieces for a composed workspace.",
    tiers: [
      { weight: "primary", categories: ["Frames", "Lamps", "Tables"] },
      { weight: "secondary", categories: ["Diffusers", "Plants", "Wall Clocks"] },
      { weight: "tertiary", categories: ["Faux Books", "Scented Candles"] },
    ],
  },
  {
    label: "Entryway",
    slug: "entryway",
    description: "Console styling, mirrors, florals, and first-impression details.",
    tiers: [
      { weight: "primary", categories: ["Tables", "Mirrors"] },
      { weight: "secondary", categories: ["Flowers", "Frames", "Ornaments"] },
      { weight: "tertiary", categories: ["Diffusers", "Scented Candles"] },
    ],
  },
  {
    label: "TV Console",
    slug: "tv-console",
    description: "Low tables, clocks, frames, books, and sculptural accents.",
    tiers: [
      { weight: "primary", categories: ["Tables", "Wall Clocks", "Frames"] },
      { weight: "secondary", categories: ["Faux Books", "Ornaments", "Plants"] },
      { weight: "tertiary", categories: ["Scented Candles", "Flowers"] },
    ],
  },
  {
    label: "Cozy Corners",
    slug: "cozy-corners",
    description: "Layered softness, warm light, candles, and greenery.",
    tiers: [
      { weight: "primary", categories: ["Throw Blankets", "Throw Pillows", "Lamps"] },
      { weight: "secondary", categories: ["Scented Candles", "Plants", "Rugs"] },
      { weight: "tertiary", categories: ["Diffusers", "Flowers", "Frames"] },
    ],
  },
];

export const STYLED_COLLECTION_FILTERS = [
  {
    title: "Modern Luxury",
    slug: "modern-luxury",
    text: "Polished accents, mirrors, clocks, lighting, and sculptural ornaments.",
    styleKeywords: ["luxury", "modern", "mirror", "gold", "metal", "sculptural"],
    tiers: [
      { weight: "primary", categories: ["Mirrors", "Wall Clocks", "Lamps", "Lighting"] },
      { weight: "secondary", categories: ["Ornaments", "Figurines", "Tables"] },
      { weight: "tertiary", categories: ["Frames", "Flowers"] },
    ],
  },
  {
    title: "Warm Minimalist",
    slug: "warm-minimalist",
    text: "Quiet neutrals, frames, diffusers, plants, and soft finishing pieces.",
    styleKeywords: ["warm", "minimal", "neutral", "quiet", "soft", "simple"],
    tiers: [
      { weight: "primary", categories: ["Diffusers", "Frames", "Throw Blankets", "Throw Pillows"] },
      { weight: "secondary", categories: ["Plants", "Rugs", "Scented Candles", "Lamps"] },
      { weight: "tertiary", categories: ["Mirrors", "Faux Books"] },
    ],
  },
  {
    title: "Cozy Apartment",
    slug: "cozy-apartment",
    text: "Layered rugs, lamps, plants, and candles for compact beautiful spaces.",
    styleKeywords: ["cozy", "compact", "apartment", "warm", "layered", "soft"],
    tiers: [
      { weight: "primary", categories: ["Rugs", "Lamps", "Throw Pillows", "Throw Blankets"] },
      { weight: "secondary", categories: ["Plants", "Scented Candles", "Tables"] },
      { weight: "tertiary", categories: ["Frames", "Diffusers", "Flowers"] },
    ],
  },
  {
    title: "Neutral Elegance",
    slug: "neutral-elegance",
    text: "Soft neutral textures, refined frames, mirrors, and table accents.",
    styleKeywords: ["neutral", "cream", "ivory", "beige", "white", "soft", "elegant"],
    tiers: [
      { weight: "primary", categories: ["Throw Pillows", "Throw Blankets", "Rugs", "Frames"] },
      { weight: "secondary", categories: ["Mirrors", "Diffusers", "Scented Candles", "Tables"] },
      { weight: "tertiary", categories: ["Flowers", "Ornaments"] },
    ],
  },
];

function normalizeCategory(category) {
  return CATEGORY_ALIASES[category] || category;
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTiers(tiers = []) {
  const seen = new Set();

  return tiers
    .map((tier) => {
      const categories = uniqueValues(tier.categories.map(normalizeCategory)).filter(
        (category) => {
          if (seen.has(category)) {
            return false;
          }

          seen.add(category);
          return true;
        }
      );

      return {
        ...tier,
        categories,
      };
    })
    .filter((tier) => tier.categories.length > 0);
}

export function getCuratedShopFilter({ space, collection } = {}) {
  if (space) {
    const filter = SHOP_SPACE_FILTERS.find((item) => item.slug === space);

    return filter
      ? {
          type: "space",
          label: filter.label,
          slug: filter.slug,
          tiers: normalizeTiers(filter.tiers),
          styleKeywords: [],
        }
      : null;
  }

  if (collection) {
    const filter = STYLED_COLLECTION_FILTERS.find(
      (item) => item.slug === collection
    );

    return filter
      ? {
          type: "collection",
          label: filter.title,
          slug: filter.slug,
          tiers: normalizeTiers(filter.tiers),
          styleKeywords: filter.styleKeywords || [],
        }
      : null;
  }

  return null;
}

export function getCuratedFilterHref(type, slug) {
  const params = new URLSearchParams();

  params.set(type, slug);
  params.set("page", "1");

  return `/shop?${params.toString()}`;
}

export function getProductStyleScore(product, styleKeywords = []) {
  if (!styleKeywords.length) {
    return 0;
  }

  const text = normalizeText(
    [product?.title, product?.category, product?.description].join(" ")
  );

  return styleKeywords.reduce((score, keyword) => {
    return text.includes(normalizeText(keyword)) ? score + 1 : score;
  }, 0);
}
