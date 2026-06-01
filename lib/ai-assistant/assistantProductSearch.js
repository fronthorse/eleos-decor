import {
  detectProductQuery,
  formatProductResults,
  getCategoryNoMatchMessage,
  getProductCategorySearchKeywords,
  getProductSearchTerms,
  searchProductsByKeywords,
  strictFilterProductsByCategories,
} from "../productSearch";
import { getProductPreviewImageSrc } from "../productImages";

export function normalizeAssistantProduct(product) {
  const productId =
    product?.id ||
    product?.product_id ||
    product?.productId ||
    product?.slug ||
    "";

  return {
    id: productId,
    title: product?.title || "Eleos Decor product",
    category: product?.category || "Decor",
    price: product?.price ? `\u20a6${product.price}` : "",
    href: productId ? `/product/${productId}` : "",
    imageSrc: getProductPreviewImageSrc(product),
    reason:
      product?.assistantReason ||
      (product?.category
        ? `A relevant ${String(product.category).toLowerCase()} option from the current Eleos Decor catalogue.`
        : "A relevant option from the current Eleos Decor catalogue."),
  };
}

function uniqueProducts(products) {
  const seen = new Set();

  return (products || []).filter((product) => {
    const key =
      product?.id ||
      product?.product_id ||
      product?.productId ||
      product?.href ||
      `${product?.title}-${product?.category}-${product?.price}`;

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function searchProductsByPrimaryFields(supabase, categories) {
  const terms = getProductSearchTerms(
    getProductCategorySearchKeywords(categories),
    14
  );

  if (!terms.length) {
    return [];
  }

  const primaryFilter = terms
    .flatMap((term) => [
      `title.ilike.%${term}%`,
      `category.ilike.%${term}%`,
    ])
    .join(",");
  const { data, error } = await supabase
    .from("products")
    .select("id,title,category,description,price,image_url")
    .or(primaryFilter)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function searchAssistantProducts(supabase, messageOrKeywords, options = {}) {
  const productQuery =
    typeof messageOrKeywords === "string"
      ? detectProductQuery(messageOrKeywords)
      : {
          isProductQuery: true,
          categoryLabel: options.categoryLabel || "decor products",
          keywords: messageOrKeywords,
          categories: options.categories || [],
          detectedCategory: options.categories?.[0] || "",
        };
  const keywords = productQuery.keywords?.length
    ? productQuery.keywords
    : productQuery.isGeneralQuery
      ? []
      : messageOrKeywords;
  const primaryProducts = productQuery.categories?.length
    ? await searchProductsByPrimaryFields(supabase, productQuery.categories)
    : [];
  const rawProducts = uniqueProducts([
    ...primaryProducts,
    ...(await searchProductsByKeywords(supabase, keywords)),
  ]);
  let relevantProducts = strictFilterProductsByCategories(
    rawProducts || [],
    productQuery.categories || []
  );

  if (productQuery.categories?.length && relevantProducts.length === 0) {
    const primaryProducts = await searchProductsByPrimaryFields(
      supabase,
      productQuery.categories
    );
    relevantProducts = strictFilterProductsByCategories(
      primaryProducts,
      productQuery.categories
    );
  }

  return {
    productQuery,
    products: uniqueProducts(relevantProducts).slice(0, 6).map(normalizeAssistantProduct),
    rawProducts: relevantProducts,
  };
}

export function buildProductSearchReply(products, productQuery) {
  if (!products.length) {
    return {
      text: getCategoryNoMatchMessage(productQuery.categoryLabel || "decor products"),
      products: [],
      ctas: [
        { label: "Browse Shop", href: "/shop" },
        { label: "Continue on WhatsApp", href: "whatsapp" },
      ],
    };
  }

  const formatted = formatProductResults(
    products.map((product) => ({
      id: product.href?.split("/").pop(),
      title: product.title,
      price: product.price?.replace("\u20a6", ""),
      image_url: product.imageSrc,
    })),
    productQuery.categoryLabel || "decor products"
  );

  return {
    text: formatted.text.replace(
      /\n\d+\..*/gs,
      "\n\nI found these relevant Eleos Decor options for you:"
    ),
    products,
    ctas: [
      { label: "Browse Shop", href: "/shop" },
      { label: "Continue on WhatsApp", href: "whatsapp" },
    ],
  };
}
