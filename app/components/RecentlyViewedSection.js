"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

export default function RecentlyViewedSection({ currentProductId }) {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("eleos-recently-viewed")) || [];

    const filtered = saved.filter(
      (product) => product.id !== currentProductId
    );

    setRecentProducts(filtered);
  }, [currentProductId]);

  if (recentProducts.length === 0) return null;

  return (
    <section className="py-5">
      <div className="container">
        <h3 className="fw-bold mb-4">Recently Viewed</h3>

        <div className="row g-4">
          {recentProducts.map((product) => (
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
            />
          ))}
        </div>
      </div>
    </section>
  );
}
