import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import ProductGallery from "../../components/ProductGallery";
import WhatsAppOrderBox from "../../components/WhatsAppOrderBox";
import ProductReviews from "../../components/ProductReviews";
import TrackRecentlyViewed from "../../components/TrackRecentlyViewed";
import RecentlyViewedSection from "../../components/RecentlyViewedSection";

import { createClient } from "../../../lib/supabase/server";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_SEO_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  buildProductReviewSchema,
  getProductAvailability,
  getProductOfferMerchantSchema,
  getProductImage,
  normalizeDescription,
  normalizePrice,
} from "../../../lib/seo";

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
  const selectedProducts = [];
  const selectedIds = new Set([String(product.id)]);

  for (const category of categories) {
    if (selectedProducts.length >= 4) {
      break;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .neq("id", product.id)
      .order("created_at", { ascending: false })
      .limit(4 - selectedProducts.length);

    if (error) {
      console.warn("Unable to fetch complete-the-look products.", error.message);
      continue;
    }

    (data || []).forEach((item) => {
      const itemId = String(item.id);

      if (!selectedIds.has(itemId) && selectedProducts.length < 4) {
        selectedIds.add(itemId);
        selectedProducts.push(item);
      }
    });
  }

  return selectedProducts;
}

async function getProductById(id) {
  const supabase = await createClient();

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

async function getProductReviews(productId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("id,customer_name,rating,comment,created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Unable to fetch product reviews for JSON-LD.", error.message);
    return [];
  }

  return data || [];
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
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

  const title = product.title || "Decor Product";
  const description = normalizeDescription(product.description);
  const image = getProductImage(product);
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
          alt: title,
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

  const product = await getProductById(id);

  if (!product) {
    return (
      <>
        <Navbar />

        <section className="luxury-section" style={{ marginTop: "90px" }}>
          <div className="container text-center">
            <h1 className="fw-bold">Product not found</h1>

            <p className="text-muted">
              This product may have been removed or is no longer available.
            </p>

            <a href="/shop" className="btn btn-dark mt-3">
              Back to Shop
            </a>
          </div>
        </section>

        <Footer />
      </>
    );
  }

  const { data: similarProducts } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .neq("id", product.id)
    .order("created_at", { ascending: false })
    .limit(4);
  const completeLookProducts = await getCompleteLookProducts(supabase, product);

  const productUrl = absoluteUrl(`/product/${product.id}`);
  const productDescription = normalizeDescription(product.description);
  const productImage = getProductImage(product);
  const productPrice = normalizePrice(product.price);
  const productReviews = await getProductReviews(product.id);
  const productReviewSchema = buildProductReviewSchema(productReviews);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: productDescription,
    image: [productImage],
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    url: productUrl,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "NGN",
      availability: getProductAvailability(product),
      ...(productPrice ? { price: productPrice } : {}),
      ...getProductOfferMerchantSchema(),
    },
    ...productReviewSchema,
  };

  return (
    <>
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema).replace(/</g, "\\u003c"),
        }}
      />

      <TrackRecentlyViewed product={product} />

      <section className="product-editorial-hero product-details-section">
        <div className="container">
          <div className="product-editorial-layout">
            <div className="product-editorial-gallery">
              <ProductGallery
                mainImage={product.image_url}
                galleryImages={product.gallery_images}
                title={product.title}
              />
            </div>

            <div className="product-editorial-info">
              <p className="section-label product-editorial-kicker">
                {product.category}
              </p>

              <h1 className="product-editorial-title">{product.title}</h1>

              <p className="product-editorial-price">
                ₦{product.price}
              </p>

              <p className="product-detail-description product-editorial-description">
                {product.description}
              </p>

              <div className="product-style-note">
                <span>Styling note</span>
                <p>{getStylingStory(product.category)}</p>
              </div>

              <WhatsAppOrderBox product={product} />

              <div className="product-trust-grid" aria-label="Shopping support">
                <div>
                  <span>Delivery</span>
                  <strong>Nationwide delivery</strong>
                  <p>Carefully coordinated across Nigeria.</p>
                </div>

                <div>
                  <span>Checkout</span>
                  <strong>WhatsApp-assisted order</strong>
                  <p>Availability and delivery are confirmed before payment.</p>
                </div>

                <div>
                  <span>Support</span>
                  <strong>Decor guidance</strong>
                  <p>Ask for styling help before you decide.</p>
                </div>

                <div>
                  <span>Returns</span>
                  <strong>Exchange support</strong>
                  <p>Return guidance is available for eligible items.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <ProductReviews productId={product.id} />

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
