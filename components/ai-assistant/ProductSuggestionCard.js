"use client";

import Image from "next/image";
import { useState } from "react";
import { PRODUCT_IMAGE_FALLBACK } from "@/lib/productImages";

export default function ProductSuggestionCard({ product }) {
  const [imageSrc, setImageSrc] = useState(
    product.imageSrc || PRODUCT_IMAGE_FALLBACK
  );

  return (
    <article className="ai-assistant-product">
      <Image
        src={imageSrc}
        alt={product.title}
        width={58}
        height={58}
        onError={() => setImageSrc(PRODUCT_IMAGE_FALLBACK)}
        className="ai-assistant-product-image"
      />
      <div className="ai-assistant-product-copy">
        <h3 className="ai-assistant-product-title">{product.title}</h3>
        {product.price && <p className="ai-assistant-product-price">{product.price}</p>}
        <a href={product.href} className="ai-assistant-product-button">
          View Product
        </a>
      </div>
    </article>
  );
}
