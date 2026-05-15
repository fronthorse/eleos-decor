import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import ProductGallery from "../../components/ProductGallery";
import WhatsAppOrderBox from "../../components/WhatsAppOrderBox";
import ProductReviews from "../../components/ProductReviews";
import TrackRecentlyViewed from "../../components/TrackRecentlyViewed";
import RecentlyViewedSection from "../../components/RecentlyViewedSection";
import toast from "react-hot-toast";

import { createClient } from "../../../lib/supabase/server";

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

  return (
    <>
      <Navbar />

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
