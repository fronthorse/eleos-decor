"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { supabase } from "../../lib/supabaseClient";

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  async function fetchFeaturedProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setFeaturedProducts(data);
    setLoading(false);
  }

  return (
    <section className="py-5" data-aos="fade-up">
      <div className="container">
        <h2 className="text-center fw-bold mb-5">Featured Products</h2>

        {loading && (
          <p className="text-center text-muted">Loading featured products...</p>
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
              title={product.title}
              description={product.description}
              price={product.price}
            />
          ))}
        </div>
      </div>
    </section>
  );
}