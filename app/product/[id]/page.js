import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import ProductPurchaseExperience from "../../components/ProductPurchaseExperience";
import TrackRecentlyViewed from "../../components/TrackRecentlyViewed";

import { createClient } from "../../../lib/supabase/server";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_SEO_DESCRIPTION,
  SITE_NAME,
  buildProductMerchantSchema,
  buildProductImageAlt,
  buildProductSeoDescription,
  buildProductSeoTitle,
  getProductAvailability,
  getProductImage,
  normalizePrice,
} from "../../../lib/seo";
import {
  normalizeProductVariants,
  supportsPrintVariants,
} from "../../../lib/productVariants";
import {
  getCuratedFilterHref,
  getProductStyleScore,
  SHOP_SPACE_FILTERS,
  STYLED_COLLECTION_FILTERS,
} from "../../../lib/shopCuration";

const ProductReviews = dynamic(() => import("../../components/ProductReviews"), {
  loading: () => null,
});
const RecentlyViewedSection = dynamic(
  () => import("../../components/RecentlyViewedSection"),
  {
    loading: () => null,
  }
);

const COMPLETE_LOOK_CATEGORY_MAP = {
  "dining sets": ["Scented Candles", "Flowers", "Ornaments", "Diffusers"],
  tables: ["Scented Candles", "Flowers", "Frames", "Ornaments", "Plants"],
  bedsheets: ["Throw Pillows", "Throw Blankets", "Lamps", "Diffusers"],
  "throw pillows": ["Throw Blankets", "Bedsheets", "Rugs", "Lamps"],
  "throw blankets": ["Throw Pillows", "Bedsheets", "Lamps", "Scented Candles"],
  rugs: ["Tables", "Plants", "Frames", "Throw Pillows"],
  mirrors: ["Tables", "Scented Candles", "Flowers", "Frames"],
  frames: ["Tables", "Plants", "Lamps", "Scented Candles"],
  "wall clocks": ["Tables", "Frames", "Plants", "Ornaments"],
  lamps: ["Throw Pillows", "Throw Blankets", "Diffusers", "Tables"],
  lighting: ["Lamps", "Mirrors", "Tables", "Frames"],
  diffusers: ["Scented Candles", "Flowers", "Frames", "Lamps"],
  "scented candles": ["Flowers", "Diffusers", "Tables", "Ornaments"],
  plants: ["Tables", "Frames", "Rugs", "Scented Candles"],
  flowers: ["Tables", "Scented Candles", "Mirrors", "Ornaments"],
};

const DEFAULT_COMPLETE_LOOK_CATEGORIES = [
  "Scented Candles",
  "Flowers",
  "Frames",
  "Plants",
];
const PRODUCT_RELATED_FIELDS =
  "id,title,category,description,price,image_url,created_at";

function normalizeCategoryKey(category) {
  return String(category || "").toLowerCase().trim();
}

function getCompleteLookCategories(category) {
  return (
    COMPLETE_LOOK_CATEGORY_MAP[normalizeCategoryKey(category)] ||
    DEFAULT_COMPLETE_LOOK_CATEGORIES
  );
}

function getStylingStory(category) {
  const categoryKey = normalizeCategoryKey(category);

  if (categoryKey.includes("dining")) {
    return "Build a graceful tablescape with soft light, sculptural accents, and florals that make shared moments feel considered.";
  }

  if (
    categoryKey.includes("bedsheet") ||
    categoryKey.includes("pillow") ||
    categoryKey.includes("blanket")
  ) {
    return "Layer calm bedding, plush cushions, and warm bedside light for a bedroom that feels restful and quietly luxurious.";
  }

  if (categoryKey.includes("rug")) {
    return "Anchor the room with texture, then add tables, greenery, and framed details for a complete styled setting.";
  }

  if (categoryKey.includes("mirror")) {
    return "Pair reflective pieces with console styling, candles, and soft florals to create a polished focal point.";
  }

  return "Layer warm textures, soft lighting, and statement decor for a beautifully styled living space.";
}

async function getCompleteLookProducts(supabase, product) {
  const categories = getCompleteLookCategories(product.category);

  if (!categories.length) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_RELATED_FIELDS)
    .in("category", categories)
    .neq("id", product.id)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("Unable to fetch complete-the-look products.", error.message);
    return [];
  }

  return (data || [])
    .sort((first, second) => {
      return (
        categories.indexOf(first.category) - categories.indexOf(second.category)
      );
    })
    .slice(0, 4);
}

async function getProductById(supabase, id) {
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    return null;
  }

  return product;
}

async function getProductReviewsForSchema(supabase, productId) {
  const { data, error } = await supabase
    .from("reviews")
    .select("id,customer_name,rating,comment,created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Unable to fetch product reviews for JSON-LD.", error.message);
    return [];
  }

  return data || [];
}

async function getProductVariants(supabase, product) {
  if (!supportsPrintVariants(product)) {
    return [];
  }

  const { data, error } = await supabase
    .from("product_variants")
    .select(
      "id,product_id,variant_label,variant_type,image_url,gallery,price_override,sku,is_default"
    )
    .eq("product_id", product.id)
    .eq("variant_type", "print")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Unable to fetch product variants.", error.message);
    return [];
  }

  return normalizeProductVariants(data || []);
}

function getProductCategoryHref(category) {
  return category ? `/shop?category=${encodeURIComponent(category)}` : "/shop";
}

function productMatchesCuratedFilter(product, filter) {
  const tiers = filter.tiers || [];
  const category = product.category;
  const categoryMatch = tiers.some((tier) =>
    (tier.categories || []).includes(category)
  );

  if (categoryMatch) {
    return true;
  }

  return getProductStyleScore(product, filter.styleKeywords || []) > 0;
}

function getProductDiscoveryLinks(product) {
  const categoryLinks = product.category
    ? [
        {
          label: `${product.category} category`,
          href: getProductCategoryHref(product.category),
        },
      ]
    : [];
  const roomLinks = SHOP_SPACE_FILTERS.filter((space) =>
    productMatchesCuratedFilter(product, space)
  )
    .slice(0, 3)
    .map((space) => ({
      label: `${space.label} decor`,
      href: getCuratedFilterHref("space", space.slug),
    }));
  const collectionLinks = STYLED_COLLECTION_FILTERS.filter((collection) =>
    productMatchesCuratedFilter(product, collection)
  )
    .slice(0, 3)
    .map((collection) => ({
      label: collection.title,
      href: getCuratedFilterHref("collection", collection.slug),
    }));

  return {
    categoryLinks,
    roomLinks,
    collectionLinks,
  };
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const product = await getProductById(supabase, id);
  const canonicalPath = `/product/${id}`;

  if (!product) {
    return {
      title: "Product Not Found",
      description: DEFAULT_SEO_DESCRIPTION,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title: "Product Not Found",
        description: DEFAULT_SEO_DESCRIPTION,
        url: canonicalPath,
        images: [DEFAULT_OG_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: "Product Not Found",
        description: DEFAULT_SEO_DESCRIPTION,
        images: [DEFAULT_OG_IMAGE],
      },
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const title = buildProductSeoTitle(product);
  const description = buildProductSeoDescription(product);
  const image = getProductImage(product);
  const imageAlt = buildProductImageAlt(product);
  const price = normalizePrice(product.price);
  const availability = getProductAvailability(product);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalPath,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    other: {
      "product:brand": SITE_NAME,
      "product:availability": availability.endsWith("InStock")
        ? "in stock"
        : "out of stock",
      ...(price
        ? {
            "product:price:amount": price,
            "product:price:currency": "NGN",
          }
        : {}),
    },
  };
}

export default async function ProductDetails({ params }) {
  const supabase = await createClient();
  const { id } = await params;

  const product = await getProductById(supabase, id);

  if (!product) {
    notFound();
  }

  const [
    { data: similarProducts },
    completeLookProducts,
    productVariants,
    productReviews,
  ] = await Promise.all([
    supabase
      .from("products")
      .select(PRODUCT_RELATED_FIELDS)
      .eq("category", product.category)
      .neq("id", product.id)
      .order("created_at", { ascending: false })
      .limit(4),
    getCompleteLookProducts(supabase, product),
    getProductVariants(supabase, product),
    getProductReviewsForSchema(supabase, product.id),
  ]);
  const discoveryLinks = getProductDiscoveryLinks(product);
  const productForExperience = {
    ...product,
    stylingStory: getStylingStory(product.category),
    imageAlt: buildProductImageAlt(product),
  };

  const productDescription = buildProductSeoDescription(product);
  const productPrice = normalizePrice(product.price);
  const productSchema = buildProductMerchantSchema(product, productReviews);

  return (
    <>
      <Navbar />

      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema).replace(/</g, "\\u003c"),
          }}
        />
      )}

      <TrackRecentlyViewed product={product} />

      <section className="product-editorial-hero product-details-section">
        <div className="container">
          <nav className="product-breadcrumbs" aria-label="Product breadcrumb">
            <Link href="/shop">Shop</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link href={getProductCategoryHref(product.category)}>
                  {product.category}
                </Link>
              </>
            )}
          </nav>

          <div className="product-editorial-layout">
            <ProductPurchaseExperience
              product={productForExperience}
              variants={productVariants}
            />
          </div>

          <div className="visually-hidden">
            <h2>{product.title}</h2>
            <p>{productDescription}</p>
            {product.category && <p>Category: {product.category}</p>}
            {productPrice && <p>Price: NGN {productPrice}</p>}
            <p>Brand: {SITE_NAME}</p>
            <p>
              Availability:{" "}
              {getProductAvailability(product).endsWith("InStock")
                ? "In stock"
                : "Out of stock"}
            </p>
          </div>
        </div>
      </section>

      {(discoveryLinks.roomLinks.length > 0 ||
        discoveryLinks.collectionLinks.length > 0 ||
        discoveryLinks.categoryLinks.length > 0) && (
        <section className="product-editorial-section product-discovery-section">
          <div className="container">
            <div className="product-section-heading">
              <p className="section-label">Explore More</p>
              <h2>Find pieces for the same style</h2>
              <p>
                Continue through related categories, room edits, and styled
                collections that match this product.
              </p>
            </div>

            <div className="product-discovery-links">
              {[
                ...discoveryLinks.categoryLinks,
                ...discoveryLinks.roomLinks,
                ...discoveryLinks.collectionLinks,
              ].map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {completeLookProducts.length > 0 && (
        <section className="product-editorial-section">
          <div className="container">
            <div className="product-section-heading">
              <p className="section-label">Styled Together</p>
              <h2>Complete the look</h2>
              <p>
                Curated companion pieces chosen to help this item feel at home
                in a finished room.
              </p>
            </div>

            <div className="product-editorial-row">
              {completeLookProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  columnClassName="product-editorial-product-card"
                  id={item.id}
                  image={item.image_url}
                  thumbnailImage={
                    item.thumbnailImage ||
                    item.thumbnailUrl ||
                    item.thumbnail_url ||
                    item.thumbnail_image
                  }
                  title={item.title}
                  description={item.description}
                  price={item.price}
                  category={item.category}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <ProductReviews productId={product.id} initialReviews={productReviews} />

      {similarProducts && similarProducts.length > 0 && (
        <section className="product-editorial-section product-related-section">
          <div className="container">
            <div className="product-section-heading">
              <p className="section-label">More to Explore</p>

              <h2>Similar pieces</h2>
              <p>
                Keep browsing within this decor family for a cohesive look.
              </p>
            </div>

            <div className="product-editorial-row">
              {similarProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  columnClassName="product-editorial-product-card"
                  id={item.id}
                  image={item.image_url}
                  thumbnailImage={
                    item.thumbnailImage ||
                    item.thumbnailUrl ||
                    item.thumbnail_url ||
                    item.thumbnail_image
                  }
                  title={item.title}
                  description={item.description}
                  price={item.price}
                  category={item.category}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <RecentlyViewedSection currentProductId={product.id} />

      <Footer />
    </>
  );
}
