import { getProductPreviewImageSrc } from "./productImages";

const PRODUCT_KEYWORD_MAP = {
  plants: [
    "plant",
    "plants",
    "artificial plant",
    "faux plant",
    "table plant",
    "flower pot",
  ],
  flowers: ["flower", "flowers", "artificial flowers", "vase", "bouquet"],
  frames: ["frame", "frames", "wall frame", "wall art", "artwork"],
  mirrors: ["mirror", "mirrors"],
  rugs: ["rug", "rugs", "carpet"],
  lights: ["light", "lights", "lamp", "decorative light", "lighting"],
  diffusers: ["diffuser", "diffusers", "scent", "fragrance"],
  candles: ["candle", "candles", "scented candle"],
  clocks: ["clock", "clocks", "wall clock"],
  figurines: ["figurine", "figurines", "ornament", "ornaments", "sculpture"],
  tables: ["table", "tables", "center table", "console table"],
  chairs: ["chair", "chairs"],
  "faux books": ["faux book", "faux books", "decorative books"],
};

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
  const value = normalizeValue(message);
  const matchedCategories = Object.entries(PRODUCT_KEYWORD_MAP)
    .filter(([, keywords]) => keywords.some((keyword) => value.includes(keyword)))
    .map(([category]) => category);
  const hasProductIntent = PRODUCT_INTENT_TERMS.some((term) =>
    value.includes(term)
  );

  if (value.includes("what products") || value.includes("products do you have")) {
    return {
      isProductQuery: true,
      isGeneralQuery: true,
      categoryLabel: "decor products",
      keywords: [],
    };
  }

  if (!hasProductIntent && matchedCategories.length === 0) {
    return {
      isProductQuery: false,
      isGeneralQuery: false,
      categoryLabel: "",
      keywords: [],
    };
  }

  if (matchedCategories.length === 0 && !hasProductIntent) {
    return {
      isProductQuery: false,
      isGeneralQuery: false,
      categoryLabel: "",
      keywords: [],
    };
  }

  if (matchedCategories.length === 0) {
    return {
      isProductQuery: hasProductIntent,
      isGeneralQuery: true,
      categoryLabel: "decor products",
      keywords: [],
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
  };
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
      text: `I couldn't find ${categoryLabel} currently listed in the shop, but you can still message us on WhatsApp to confirm availability or request a similar item.`,
      products: [],
      productLinks: [],
    };
  }

  const intro =
    categoryLabel === "decor products"
      ? "Here are some available Eleos Decor products you may like:"
      : `Yes, we have ${categoryLabel} options available. Here are some you may like:`;
  const productLines = products
    .map((product, index) => {
      const price = product.price ? ` - ₦${product.price}` : "";
      return `${index + 1}. ${product.title}${price}`;
    })
    .join("\n");

  return {
    text: `${intro}${productLines ? "\n\n" : "\n\n"}You can continue browsing the shop or chat with us on WhatsApp for help choosing the best option.`,
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
