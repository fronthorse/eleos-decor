import { createClient } from "@supabase/supabase-js";
import { absoluteUrl } from "../lib/seo";

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

export default async function sitemap() {
  const staticRoutes = [
    route("/", { changeFrequency: "weekly", priority: 1 }),
    route("/shop", { changeFrequency: "daily", priority: 0.9 }),
    route("/about", { changeFrequency: "monthly", priority: 0.6 }),
    route("/contact", { changeFrequency: "monthly", priority: 0.6 }),
  ];

  try {
    const supabase = getPublicSupabaseClient();
    const { data: products, error } = await supabase
      .from("products")
      .select("id,category,created_at")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error || !products) {
      return staticRoutes;
    }

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

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
