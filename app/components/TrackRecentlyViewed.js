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
      thumbnailImage:
        product.thumbnailImage ||
        product.thumbnailUrl ||
        product.thumbnail_url ||
        product.thumbnail_image,
      description: product.description,
      category: product.category,
    };

    let saved = [];

    try {
      saved = JSON.parse(localStorage.getItem("eleos-recently-viewed")) || [];
    } catch {
      saved = [];
    }

    const filtered = saved.filter(
      (item) => item.id !== viewedProduct.id
    );

    const updated = [viewedProduct, ...filtered].slice(0, 6);

    localStorage.setItem(
      "eleos-recently-viewed",
      JSON.stringify(updated)
    );

    
  }, [
    product?.category,
    product?.description,
    product?.id,
    product?.image_url,
    product?.price,
    product?.thumbnailImage,
    product?.thumbnailUrl,
    product?.thumbnail_image,
    product?.thumbnail_url,
    product?.title,
  ]);

  return null;
}
