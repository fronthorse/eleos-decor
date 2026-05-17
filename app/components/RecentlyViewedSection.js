"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

export default function RecentlyViewedSection({ currentProductId }) {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    let saved = [];

    try {
      saved = JSON.parse(localStorage.getItem("eleos-recently-viewed")) || [];
    } catch {
      saved = [];
    }

    const filtered = saved.filter(
      (product) => product.id !== currentProductId
    );

    setRecentProducts(filtered);
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
