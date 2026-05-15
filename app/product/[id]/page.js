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
  getProductAvailability,
  getProductImage,
  normalizeDescription,
  normalizePrice,
} from "../../../lib/seo";

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
    .limit(3);

  const productUrl = absoluteUrl(`/product/${product.id}`);
  const productDescription = normalizeDescription(product.description);
  const productImage = getProductImage(product);
  const productPrice = normalizePrice(product.price);
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
    },
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

      <section className="luxury-section product-details-section">
        <div className="container">
          <div className="row g-5 align-items-start">
            <div className="col-lg-6">
              <ProductGallery
                mainImage={product.image_url}
                galleryImages={product.gallery_images}
                title={product.title}
              />
            </div>

            <div className="col-lg-6">
              <p className="section-label">{product.category}</p>

              <h1 className="luxury-heading mb-3">{product.title}</h1>

              <h3 className="fw-bold gold-text mb-4">
                ₦{product.price}
              </h3>

              <p className="text-muted product-detail-description">
                {product.description}
              </p>

              <WhatsAppOrderBox product={product} />
            </div>
          </div>
        </div>
      </section>

      <ProductReviews productId={product.id} />

      {similarProducts && similarProducts.length > 0 && (
        <section className="luxury-section">
          <div className="container">
            <div className="text-center mb-5">
              <p className="section-label">You May Also Like</p>

              <h2 className="luxury-heading">Similar Products</h2>
            </div>

            <div className="row g-4">
              {similarProducts.map((item) => (
                <ProductCard
                  key={item.id}
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
