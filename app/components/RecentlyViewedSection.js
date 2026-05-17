"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { createClient } from "../../lib/supabase/client";

const RECENTLY_VIEWED_KEY = "eleos-recently-viewed";

export default function RecentlyViewedSection({ currentProductId }) {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function loadRecentProducts() {
      let saved = [];

      try {
        saved = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY)) || [];
      } catch {
        saved = [];
      }

      const filtered = saved.filter(
        (product) => String(product.id) !== String(currentProductId)
      );

      const savedIds = filtered.map((product) => product.id).filter(Boolean);

      if (savedIds.length === 0) {
        if (!cancelled) {
          setRecentProducts([]);
        }
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select(
          "id,title,category,description,price,image_url,gallery_images,thumbnail_url,thumbnail_image"
        )
        .in("id", savedIds);

      if (cancelled) {
        return;
      }

      if (error) {
        setRecentProducts(filtered);
        return;
      }

      const productsById = new Map(
        (data || []).map((product) => [String(product.id), product])
      );
      const validRecentProducts = filtered
        .map((product) => productsById.get(String(product.id)))
        .filter(Boolean);
      const validRecentIds = new Set(
        validRecentProducts.map((product) => String(product.id))
      );

      setRecentProducts(validRecentProducts);
      localStorage.setItem(
        RECENTLY_VIEWED_KEY,
        JSON.stringify(
          saved
            .filter(
              (product) =>
                String(product.id) === String(currentProductId) ||
                validRecentIds.has(String(product.id))
            )
            .slice(0, 6)
        )
      );
    }

    loadRecentProducts();

    return () => {
      cancelled = true;
    };
  }, [currentProductId]);

  if (recentProducts.length === 0) return null;

  return (
    <section className="product-editorial-section product-recent-section">
      <div className="container">
        <div className="product-section-heading">
          <p className="section-label">Recently Viewed</p>
          <h2>Pieces you considered</h2>
        </div>

        <div className="product-editorial-row">
          {recentProducts.map((product) => (
            <ProductCard
              key={product.id}
              columnClassName="product-editorial-product-card"
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
      </div>
    </section>
  );
}
