"use client";

import { useEffect } from "react";

export default function TrackRecentlyViewed({ product }) {
  useEffect(() => {
    if (!product?.id) return;

    const viewedProduct = {
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
      description: product.description,
    };

    const saved =
      JSON.parse(localStorage.getItem("eleos-recently-viewed")) || [];

    const filtered = saved.filter(
      (item) => item.id !== viewedProduct.id
    );

    const updated = [viewedProduct, ...filtered].slice(0, 6);

    localStorage.setItem(
      "eleos-recently-viewed",
      JSON.stringify(updated)
    );

    
  }, [product?.id]);

  return null;
}