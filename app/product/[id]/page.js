import Link from "next/link";

import Navbar from "../.././components/Navbar";
import Footer from "../.././components/Footer";
import ProductCard from "../.././components/ProductCard";
import { createClient } from "../../../lib/supabase/server";
import ProductGallery from "../.././components/ProductGallery";
import WhatsAppOrderBox from "../.././components/WhatsAppOrderBox";
import ProductReviews from "../.././components/ProductReviews";
import TrackRecentlyViewed from "../.././components/TrackRecentlyViewed";
import RecentlyViewedSection from "../.././components/RecentlyViewedSection";

export default async function ProductDetails({ params }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    return (
      <>
        <Navbar />
        
        <div className="container py-5" style={{ marginTop: "100px" }}>
          <h1>Product not found</h1>
          <Link href="/shop" className="btn btn-dark mt-3">
            Back to Shop
          </Link>
        </div>
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
  return (
    <>
      <Navbar />
<TrackRecentlyViewed product={product} />
      <section className="luxury-section" style={{ marginTop: "70px" }}>
        <div className="container">
          <div className="mb-4">
            <Link href="/shop" className="text-muted text-decoration-none">
              ← Back to Shop
            </Link>
          </div>

          <div className="row align-items-center g-5">
            <div className="col-md-6">
              <ProductGallery
                mainImage={product.image_url}
                galleryImages={product.gallery_images}
                title={product.title}
              />
            </div>

            <div className="col-md-6">
              <div className="product-detail-box">
                <span className="product-badge mb-3">{product.category}</span>

                <h1 className="fw-bold mb-4">{product.title}</h1>

                <h2 className="mb-4">₦{product.price}</h2>

                <p className="lead text-muted mb-4">{product.description}</p>

                <div className="p-4 rounded bg-light mb-4">
                  <h6 className="fw-bold">Why you’ll love it</h6>
                  <p className="text-muted mb-0">
                    A beautiful décor piece selected to add warmth, elegance,
                    and character to your living space.
                  </p>
                </div>

                <WhatsAppOrderBox product={product} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {similarProducts && similarProducts.length > 0 && (
        <section className="py-5">
          <div className="container">
            <h3 className="fw-bold mb-4">Similar Products</h3>

            <div className="row g-4">
              {similarProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  image={item.image_url}
                  title={item.title}
                  description={item.description}
                  price={item.price}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      <ProductReviews productId={product.id} />
      <RecentlyViewedSection currentProductId={product.id} />
      <Footer />
    </>
  );
}
