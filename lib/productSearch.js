import { getProductPreviewImageSrc } from "./productImages";

const PRODUCT_KEYWORD_MAP = {
  "dining sets": [
    "dining set",
    "dining sets",
    "dining table",
    "dining tables",
    "dining chair",
    "dining chairs",
    "dinning set",
    "dinning sets",
    "dinning table",
    "dinning tables",
    "dinning chair",
    "dinning chairs",
    "dinner set",
    "dinner sets",
  ],
  plants: [
    "plant",
    "plants",
    "artificial plant",
    "artificial plants",
    "faux plant",
    "faux plants",
    "table plant",
    "table plants",
    "flower pot",
    "flower pots",
  ],
  flowers: [
    "flower",
    "flowers",
    "artificial flower",
    "artificial flowers",
    "floral",
    "vase",
    "vases",
    "bouquet",
    "bouquets",
  ],
  frames: [
    "frame",
    "frames",
    "wall frame",
    "wall frames",
    "photo frame",
    "photo frames",
    "picture frame",
    "picture frames",
    "wall art",
    "artwork",
  ],
  mirrors: ["mirror", "mirrors", "wall mirror"],
  rugs: ["rug", "rugs", "carpet", "carpets", "floor mat", "floor mats"],
  lights: [
    "light",
    "lights",
    "lamp",
    "lamps",
    "decorative light",
    "decorative lights",
    "lighting",
  ],
  diffusers: [
    "diffuser",
    "diffusers",
    "scent",
    "scents",
    "home scent",
    "home scents",
    "fragrance",
    "fragrances",
  ],
  humidifiers: ["humidifier", "humidifiers"],
  candles: ["candle", "candles", "scented candle", "scented candles"],
  clocks: ["clock", "clocks", "wall clock", "wall clocks"],
  "throw pillows": ["throw pillow", "throw pillows", "pillow", "pillows", "cushion", "cushions"],
  "throw blankets": ["throw blanket", "throw blankets", "blanket", "blankets", "throw"],
  bedsheets: ["bedsheet", "bedsheets", "bed sheet", "bed sheets"],
  figurines: ["figurine", "figurines", "ornament", "ornaments", "sculpture", "sculptures"],
  "decor accessories": ["decor accessory", "decor accessories", "accessory", "accessories"],
  tables: [
    "table",
    "tables",
    "center table",
    "center tables",
    "centre table",
    "centre tables",
    "coffee table",
    "coffee tables",
    "side table",
    "side tables",
    "console table",
    "console tables",
    "dining table",
    "dining tables",
    "side stool",
    "side stools",
    "stool",
    "stools",
  ],
  "side stools": ["side stool", "side stools", "stool", "stools"],
  chairs: ["chair", "chairs"],
  "faux books": ["faux book", "faux books", "decorative books"],
  "water fountains": [
    "water fountain",
    "water fountains",
    "artificial water fountain",
    "artificial water fountains",
    "fountain",
    "fountains",
  ],
};

const CATEGORY_RELEVANCE_RULES = {
  "dining sets": {
    include: [
      "dining set",
      "dining sets",
      "dining table",
      "dining tables",
      "dining chair",
      "dining chairs",
      "dining room",
      "dinning set",
      "dinning sets",
      "dinning table",
      "dinning tables",
      "dinning chair",
      "dinning chairs",
      "dinning room",
      "dinner set",
      "dinner sets",
    ],
    exclude: [
      "blanket",
      "blankets",
      "throw blanket",
      "throw blankets",
      "pillow",
      "pillows",
      "throw pillow",
      "throw pillows",
      "flower",
      "flowers",
      "frame",
      "frames",
      "rug",
      "rugs",
      "mirror",
      "mirrors",
      "diffuser",
      "diffusers",
      "humidifier",
      "humidifiers",
      "candle",
      "candles",
      "ornament",
      "ornaments",
      "decor accessory",
      "decor accessories",
      "accessory",
      "accessories",
    ],
  },
  rugs: {
    include: ["rug", "rugs", "carpet", "carpets", "floor mat", "floor mats"],
  },
  plants: {
    include: [
      "plant",
      "plants",
      "artificial plant",
      "artificial plants",
      "faux plant",
      "faux plants",
      "table plant",
      "flower pot",
    ],
  },
  mirrors: {
    include: ["mirror", "mirrors", "wall mirror", "wall mirrors"],
  },
  frames: {
    include: [
      "frame",
      "frames",
      "wall frame",
      "wall frames",
      "photo frame",
      "photo frames",
      "picture frame",
      "picture frames",
      "wall art",
      "artwork",
    ],
  },
  clocks: {
    include: ["clock", "clocks", "wall clock", "wall clocks"],
  },
  flowers: {
    include: ["flower", "flowers", "artificial flower", "artificial flowers", "floral", "bouquet", "vase"],
  },
  lights: {
    include: ["lamp", "lamps", "light", "lights", "lighting"],
  },
  diffusers: {
    include: ["diffuser", "diffusers", "fragrance", "fragrances", "scent", "scents"],
  },
  humidifiers: {
    include: ["humidifier", "humidifiers"],
  },
  candles: {
    include: ["candle", "candles", "scented candle", "scented candles"],
  },
  "throw pillows": {
    include: ["throw pillow", "throw pillows", "pillow", "pillows", "cushion", "cushions"],
  },
  "throw blankets": {
    include: ["throw blanket", "throw blankets", "blanket", "blankets"],
  },
  bedsheets: {
    include: ["bedsheet", "bedsheets", "bed sheet", "bed sheets"],
  },
  figurines: {
    include: [
      "figurine",
      "figurines",
      "ornament",
      "ornaments",
      "sculpture",
      "sculptures",
    ],
  },
  "decor accessories": {
    include: [
      "decor accessory",
      "decor accessories",
      "accessory",
      "accessories",
      "ornament",
      "ornaments",
      "figurine",
      "figurines",
      "sculpture",
      "sculptures",
      "faux book",
      "faux books",
    ],
  },
  tables: {
    include: [
      "table",
      "tables",
      "center table",
      "center tables",
      "centre table",
      "centre tables",
      "coffee table",
      "coffee tables",
      "side table",
      "side tables",
      "console table",
      "console tables",
      "dining table",
      "dining tables",
      "side stool",
      "side stools",
      "stool",
      "stools",
    ],
  },
  "side stools": {
    include: [
      "side stool",
      "side stools",
      "stool",
      "stools",
      "side table",
      "side tables",
    ],
  },
  chairs: {
    include: ["chair", "chairs"],
  },
  "faux books": {
    include: ["faux book", "faux books", "decorative book", "decorative books"],
  },
  "water fountains": {
    include: [
      "water fountain",
      "water fountains",
      "artificial water fountain",
      "artificial water fountains",
      "fountain",
      "fountains",
    ],
  },
};

const STRICT_CATEGORY_RELEVANCE_RULES = {
  "dining sets": {
    primaryInclude: CATEGORY_RELEVANCE_RULES["dining sets"].include,
    primaryExclude: CATEGORY_RELEVANCE_RULES["dining sets"].exclude,
  },
  chairs: {
    primaryInclude: ["chair", "chairs", "dining chair", "accent chair"],
  },
  bedsheets: {
    primaryInclude: ["bedsheet", "bedsheets", "bed sheet", "bed sheets"],
  },
  rugs: {
    primaryInclude: CATEGORY_RELEVANCE_RULES.rugs.include,
  },
  mirrors: {
    primaryInclude: CATEGORY_RELEVANCE_RULES.mirrors.include,
  },
  clocks: {
    primaryInclude: CATEGORY_RELEVANCE_RULES.clocks.include,
  },
  tables: {
    primaryInclude: [
      "table",
      "tables",
      "center table",
      "center tables",
      "centre table",
      "centre tables",
      "coffee table",
      "coffee tables",
      "side table",
      "side tables",
      "console table",
      "console tables",
      "dining table",
      "dining tables",
      "side stool",
      "side stools",
      "stool",
      "stools",
    ],
    categoryInclude: [
      "table",
      "tables",
      "furniture",
      "furnitures",
      "stool",
      "stools",
    ],
    primaryExclude: [
      "dining table",
      "dining tables",
      "table flower",
      "table flowers",
      "tabletop flower",
      "table top flower",
      "table decor",
      "tabletop decor",
      "table top decor",
      "table centerpiece",
      "table centrepiece",
      "table ornament",
      "table ornaments",
      "table plant",
      "table plants",
      "table lamp",
      "table lamps",
      "centerpiece",
      "centrepiece",
      "vase",
      "lamp",
      "lamps",
      "ornament",
      "ornaments",
      "plant",
      "plants",
      "flower",
      "flowers",
      "decor flower",
      "artificial flower",
      "artificial flowers",
    ],
  },
  "side stools": {
    primaryInclude: ["side stool", "side stools", "stool", "stools"],
    categoryInclude: [
      "stool",
      "stools",
      "table",
      "tables",
      "furniture",
      "furnitures",
    ],
    primaryExclude: [
      "table flower",
      "table flowers",
      "tabletop flower",
      "table top flower",
      "table decor",
      "tabletop decor",
      "table top decor",
      "table ornament",
      "table plant",
      "table lamp",
      "centerpiece",
      "centrepiece",
      "vase",
      "lamp",
      "ornament",
      "plant",
      "flower",
      "flowers",
      "decor flower",
      "artificial flower",
    ],
  },
};

function getStrictCategoryRule(category) {
  if (STRICT_CATEGORY_RELEVANCE_RULES[category]) {
    return STRICT_CATEGORY_RELEVANCE_RULES[category];
  }

  const relevanceRule = CATEGORY_RELEVANCE_RULES[category];

  if (!relevanceRule?.include?.length) {
    return null;
  }

  return {
    primaryInclude: relevanceRule.include,
    categoryInclude: relevanceRule.include,
    primaryExclude: relevanceRule.exclude || [],
  };
}

const PRODUCT_INTENT_TERMS = [
  "do you have",
  "do you sell",
  "show me",
  "available",
  "i need",
  "what products",
  "what can i buy",
  "any",
  "looking for",
  "find",
  "recommend",
  "recommendation",
  "browse",
  "browse products",
  "shop",
  "buy",
];

export const PRODUCT_SEARCH_FIELDS = ["title", "category", "description"];
export const PRODUCT_SEARCH_RPC = "search_products";

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeValue(value) {
  return String(value || "").toLowerCase();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeSearchText(value) {
  return normalizeValue(value)
    .replace(/&/g, " and ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeProductText(product) {
  return normalizeSearchText(
    [product?.title, product?.category, product?.description].join(" ")
  );
}

function normalizeProductPrimaryText(product) {
  return normalizeSearchText([product?.title, product?.category].join(" "));
}

function normalizeProductTitleText(product) {
  return normalizeSearchText(product?.title || "");
}

function normalizeProductCategoryText(product) {
  return normalizeSearchText(product?.category || "");
}

function textIncludesTerm(text, term) {
  const normalizedTerm = normalizeSearchText(term);

  if (!normalizedTerm) {
    return false;
  }

  return new RegExp(`(^|\\s)${escapeRegExp(normalizedTerm)}(\\s|$)`).test(text);
}

function textIncludesAny(text, terms = []) {
  return terms.some((term) => textIncludesTerm(text, term));
}

function isProductRelevantToCategory(product, category) {
  const rule = CATEGORY_RELEVANCE_RULES[category];

  if (!rule) {
    return true;
  }

  const text = normalizeProductText(product);

  if (rule.exclude?.length && textIncludesAny(text, rule.exclude)) {
    return false;
  }

  if (rule.includeGroups?.length) {
    return rule.includeGroups.every((group) => textIncludesAny(text, group));
  }

  return textIncludesAny(text, rule.include || []);
}

function isProductStrictlyRelevantToCategory(product, category) {
  const rule = getStrictCategoryRule(category);

  if (!rule) {
    return isProductRelevantToCategory(product, category);
  }

  const titleText = normalizeProductTitleText(product);
  const categoryText = normalizeProductCategoryText(product);
  const primaryText = normalizeProductPrimaryText(product);
  const hasCategoryMatch = textIncludesAny(
    categoryText,
    rule.categoryInclude || rule.primaryInclude || []
  );
  const hasTitleMatch = textIncludesAny(titleText, rule.primaryInclude || []);

  if (!hasCategoryMatch && !hasTitleMatch) {
    return false;
  }

  if (rule.primaryExclude?.length && textIncludesAny(primaryText, rule.primaryExclude)) {
    return hasCategoryMatch && hasTitleMatch;
  }

  return true;
}

export function sanitizeProductSearchTerm(value) {
  return String(value || "")
    .replace(/[%_,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getProductSearchTerms(value, limit = 8) {
  const terms = Array.isArray(value) ? value : [value];

  return uniqueValues(terms.map(sanitizeProductSearchTerm)).slice(0, limit);
}

export function buildProductSearchOrFilter(value) {
  const terms = getProductSearchTerms(value);

  if (terms.length === 0) {
    return "";
  }

  return terms
    .flatMap((term) =>
      PRODUCT_SEARCH_FIELDS.map((field) => `${field}.ilike.%${term}%`)
    )
    .join(",");
}

export function applyProductSearchFilter(query, value) {
  const orFilter = buildProductSearchOrFilter(value);

  return orFilter ? query.or(orFilter) : query;
}

export function mapProductSortToRpc(sortOption) {
  if (sortOption === "price-low") {
    return "price_low";
  }

  if (sortOption === "price-high") {
    return "price_high";
  }

  if (sortOption === "oldest") {
    return "oldest";
  }

  return "newest";
}

export function getRpcProductsResult(data) {
  const rows = Array.isArray(data) ? data : [];

  return {
    products: rows.map(({ total_count, rank, ...product }) => product),
    totalCount: rows.length > 0 ? Number(rows[0].total_count || 0) : 0,
  };
}

export function normalizeCategory(message) {
  const value = normalizeSearchText(message);
  let categories = Object.entries(PRODUCT_KEYWORD_MAP)
    .filter(([, keywords]) => keywords.some((keyword) => textIncludesTerm(value, keyword)))
    .map(([category]) => category);
  const hasTableDecorContext = textIncludesAny(value, [
    "table flower",
    "table flowers",
    "tabletop flower",
    "table top flower",
    "table centerpiece",
    "table centrepiece",
    "dining table decor",
    "decor for my dining table",
    "decor for dining table",
  ]);
  const hasStrongTableFurnitureTerm = textIncludesAny(value, [
    "center table",
    "center tables",
    "centre table",
    "centre tables",
    "coffee table",
    "coffee tables",
    "side table",
    "side tables",
    "console table",
    "console tables",
    "side stool",
    "side stools",
    "stool",
    "stools",
  ]);

  if (hasTableDecorContext && !hasStrongTableFurnitureTerm) {
    categories = categories.filter(
      (category) => !["tables", "side stools", "dining sets"].includes(category)
    );
  }

  return {
    detectedCategory: categories[0] || "",
    categories,
  };
}

export async function searchProductsWithFullText(
  supabase,
  {
    searchQuery = "",
    category = "All",
    sort = "newest",
    limit = 12,
    offset = 0,
  } = {}
) {
  const cleanSearch = sanitizeProductSearchTerm(searchQuery);
  const cleanCategory = category && category !== "All" ? category : null;

  const { data, error } = await supabase.rpc(PRODUCT_SEARCH_RPC, {
    p_search_query: cleanSearch,
    p_category: cleanCategory,
    p_sort: mapProductSortToRpc(sort),
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    throw error;
  }

  return getRpcProductsResult(data);
}

export function detectProductQuery(message) {
  const value = normalizeSearchText(message);
  const { categories: matchedCategories } = normalizeCategory(message);
  const hasProductIntent = PRODUCT_INTENT_TERMS.some((term) =>
    value.includes(term)
  );

  if (value.includes("what products") || value.includes("products do you have")) {
    return {
      isProductQuery: true,
      isGeneralQuery: true,
      categoryLabel: "decor products",
      keywords: [],
      categories: [],
      detectedCategory: "",
    };
  }

  if (!hasProductIntent && matchedCategories.length === 0) {
    return {
      isProductQuery: false,
      isGeneralQuery: false,
      categoryLabel: "",
      keywords: [],
      categories: [],
      detectedCategory: "",
    };
  }

  if (matchedCategories.length === 0 && !hasProductIntent) {
    return {
      isProductQuery: false,
      isGeneralQuery: false,
      categoryLabel: "",
      keywords: [],
      categories: [],
      detectedCategory: "",
    };
  }

  if (matchedCategories.length === 0) {
    return {
      isProductQuery: hasProductIntent,
      isGeneralQuery: true,
      categoryLabel: "decor products",
      keywords: [],
      categories: [],
      detectedCategory: "",
    };
  }

  const keywords = matchedCategories.flatMap(
    (category) => PRODUCT_KEYWORD_MAP[category]
  );

  return {
    isProductQuery: true,
    isGeneralQuery: false,
    categoryLabel: matchedCategories.join(", "),
    keywords: uniqueValues(keywords),
    categories: matchedCategories,
    detectedCategory: matchedCategories[0] || "",
  };
}

export function filterProductsByCategoryRelevance(products, categories = []) {
  const strictCategories = uniqueValues(categories).filter(
    (category) => CATEGORY_RELEVANCE_RULES[category]
  );

  if (!strictCategories.length) {
    return products;
  }

  return (products || []).filter((product) =>
    strictCategories.some((category) =>
      isProductRelevantToCategory(product, category)
    )
  );
}

export function filterProductsByDetectedCategory(products, detectedCategory) {
  return filterProductsByCategoryRelevance(
    products,
    detectedCategory ? [detectedCategory] : []
  );
}

export function strictFilterProductsByCategory(products, categoryKey) {
  if (!categoryKey) {
    return products || [];
  }

  return (products || []).filter((product) =>
    isProductStrictlyRelevantToCategory(product, categoryKey)
  );
}

export function strictFilterProductsByCategories(products, categories = []) {
  const strictCategories = uniqueValues(categories).filter(
    (category) => getStrictCategoryRule(category)
  );

  if (!strictCategories.length) {
    return filterProductsByCategoryRelevance(products, categories);
  }

  return (products || []).filter((product) =>
    strictCategories.some((category) =>
      isProductStrictlyRelevantToCategory(product, category)
    )
  );
}

export function getProductCategoryKeywords(categoryKey) {
  return PRODUCT_KEYWORD_MAP[categoryKey] || [];
}

export function getProductCategorySearchKeywords(categories = []) {
  return uniqueValues(categories.flatMap(getProductCategoryKeywords));
}

export function getCategoryNoMatchMessage(categoryLabel) {
  if (String(categoryLabel).toLowerCase().includes("dining set")) {
    return "We don't seem to have dining sets available right now. I can show related dining-area decor instead, or connect you on WhatsApp to confirm upcoming stock.";
  }

  if (String(categoryLabel).toLowerCase().includes("dining")) {
    return "We don’t seem to have dining sets available right now, but I can help you explore dining-area decor or connect you on WhatsApp.";
  }

  if (String(categoryLabel).toLowerCase().includes("table")) {
    return "We don't seem to have table products available right now. I can show related living-room decor instead, or connect you on WhatsApp to confirm availability.";
  }

  if (String(categoryLabel).toLowerCase().includes("stool")) {
    return "We don't seem to have side stools available right now. I can show related accent decor instead, or connect you on WhatsApp to confirm availability.";
  }

  return `We don't seem to have ${categoryLabel} available right now. I can show clearly labeled alternatives, or connect you on WhatsApp to confirm availability.`;
}

export async function searchProductsByKeywords(supabase, keywords) {
  const cleanKeywords = getProductSearchTerms(keywords);

  if (cleanKeywords.length === 0) {
    const { data, error } = await supabase
      .from("products")
      .select("id,title,category,description,price,image_url")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }

    return data || [];
  }

  try {
    const fullTextQueries = uniqueValues([
      cleanKeywords[0],
      ...cleanKeywords.filter((keyword) => !keyword.includes(" ")).slice(0, 4),
    ]);

    for (const queryText of fullTextQueries) {
      const { products } = await searchProductsWithFullText(supabase, {
        searchQuery: queryText,
        sort: "newest",
        limit: 5,
        offset: 0,
      });

      if (products.length > 0) {
        return products;
      }
    }
  } catch (error) {
    console.warn("Full-text product search failed; using fallback.", error);
  }

  let searchQuery = supabase
    .from("products")
    .select("id,title,category,description,price,image_url");

  searchQuery = applyProductSearchFilter(searchQuery, cleanKeywords);

  const { data, error } = await searchQuery
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  return data || [];
}

export function formatProductResults(products, categoryLabel) {
  if (!products.length) {
    return {
      text: `I couldn't find an exact ${categoryLabel} match right now, but I can still recommend similar decor options or help you narrow down the style, size, and budget.`,
      products: [],
      productLinks: [],
    };
  }

  const intro =
    categoryLabel === "decor products"
      ? "Here are available Eleos Decor pieces worth considering:"
      : `Here are ${categoryLabel} options from Eleos Decor that fit your search:`;
  const productLines = products
    .map((product, index) => {
      const price = product.price ? ` - ₦${product.price}` : "";
      return `${index + 1}. ${product.title}${price}`;
    })
    .join("\n");

  return {
    text: `${intro}${productLines ? "\n\n" : "\n\n"}Share your preferred style, space, or budget and I'll narrow this down for you.`,
    products: products.map((product) => ({
      title: product.title,
      price: product.price ? `\u20a6${product.price}` : "",
      href: `/product/${product.id}`,
      imageSrc: getProductPreviewImageSrc(product),
    })),
    productLinks: products.map((product) => ({
      label: product.title,
      href: `/product/${product.id}`,
    })),
  };
}
