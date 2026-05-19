import { createClient } from "@supabase/supabase-js";
import { absoluteUrl } from "../lib/seo";
import {
  getCuratedFilterHref,
  SHOP_SPACE_FILTERS,
  STYLED_COLLECTION_FILTERS,
} from "../lib/shopCuration";

export const revalidate = 3600;

function getPublicSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function route(path, options = {}) {
  return {
    url: absoluteUrl(path),
    lastModified: options.lastModified || new Date(),
    changeFrequency: options.changeFrequency || "weekly",
    priority: options.priority || 0.7,
  };
}

async function fetchSitemapProducts(supabase) {
  const pageSize = 1000;
  const products = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("products")
      .select("id,category,created_at")
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) {
      throw error;
    }

    products.push(...(data || []));

    if (!data || data.length < pageSize) {
      break;
    }
  }

  return products;
}

export default async function sitemap() {
  const staticRoutes = [
    route("/", { changeFrequency: "weekly", priority: 1 }),
    route("/shop", { changeFrequency: "daily", priority: 0.9 }),
    route("/about", { changeFrequency: "monthly", priority: 0.6 }),
    route("/contact", { changeFrequency: "monthly", priority: 0.6 }),
    route("/return-policy", { changeFrequency: "monthly", priority: 0.5 }),
  ];

  try {
    const supabase = getPublicSupabaseClient();
    const products = await fetchSitemapProducts(supabase);

    const productRoutes = products
      .filter((product) => product.id)
      .map((product) =>
        route(`/product/${product.id}`, {
          lastModified: product.created_at || new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        })
      );

    const categories = [
      ...new Set(
        products
          .map((product) => product.category)
          .filter((category) => typeof category === "string" && category.trim())
      ),
    ];

    const categoryRoutes = categories.map((category) =>
      route(`/shop?category=${encodeURIComponent(category)}`, {
        changeFrequency: "weekly",
        priority: 0.75,
      })
    );

    const roomRoutes = SHOP_SPACE_FILTERS.map((space) =>
      route(getCuratedFilterHref("space", space.slug), {
        changeFrequency: "weekly",
        priority: 0.72,
      })
    );

    const collectionRoutes = STYLED_COLLECTION_FILTERS.map((collection) =>
      route(getCuratedFilterHref("collection", collection.slug), {
        changeFrequency: "weekly",
        priority: 0.72,
      })
    );

    return [
      ...staticRoutes,
      ...categoryRoutes,
      ...roomRoutes,
      ...collectionRoutes,
      ...productRoutes,
    ];
  } catch {
    return staticRoutes;
  }
}
