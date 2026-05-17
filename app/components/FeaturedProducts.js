"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { createClient } from "../../lib/supabase/client";
import ProductSkeleton from ".././components/ProductSkeleton";

export default function FeaturedProducts() {
  const supabase = createClient();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchFeaturedProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
     
      setLoading(false);
      return;
    }

    setFeaturedProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  return (
    <section className="home-featured-products" data-aos="fade-up">
      <div className="container">
        <div className="home-section-header">
          <p className="home-kicker">Curated Pieces</p>
          <h2>New details for rooms that need a finishing touch.</h2>
          <p>
            A small selection of fresh decor pieces chosen for warm, elegant
            homes and workspaces.
          </p>
        </div>

        {loading && (
  <div className="row g-4">
    {[1, 2, 3].map((item) => (
      <ProductSkeleton key={item} />
    ))}
  </div>
)}

        {!loading && featuredProducts.length === 0 && (
          <p className="text-center text-muted">
            Featured products will appear here once uploaded.
          </p>
        )}

        <div className="row g-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              image={product.image_url}
              thumbnailImage={
                product.thumbnailImage ||
                product.thumbnailUrl ||
                product.thumbnail_url ||
                product.thumbnail_image
              }
              title={product.title}
              description={product.description}
              price={product.price}
              category={product.category}
            />
          ))}
        </div>

        <div className="text-center mt-4">
          <a href="/shop" className="btn btn-dark">
            View All Products
          </a>
        </div>
      </div>
    </section>
  );
}
