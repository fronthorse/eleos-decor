"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  getProductPreviewImageSrc,
  PRODUCT_IMAGE_FALLBACK,
} from "../../lib/productImages";

export default function ProductVariantSelector({
  variants = [],
  selectedVariant,
  onSelectVariant,
}) {
  const printVariants = useMemo(
    () => variants.filter((variant) => variant?.variant_type === "print"),
    [variants]
  );

  if (printVariants.length === 0) {
    return null;
  }

  return (
    <div className="product-variant-panel" aria-label="Choose print">
      <div className="product-variant-heading">
        <span>Choose Print</span>
        {selectedVariant?.variant_label && (
          <strong>{selectedVariant.variant_label}</strong>
        )}
      </div>

      <div className="product-variant-options">
        {printVariants.map((variant) => {
          const active = selectedVariant?.id === variant.id;

          return (
            <button
              type="button"
              key={variant.id}
              className={`product-variant-option ${active ? "active" : ""}`}
              onClick={() => onSelectVariant(variant)}
              aria-pressed={active}
            >
              <span className="product-variant-thumb">
                <Image
                  src={getProductPreviewImageSrc(variant)}
                  alt={variant.variant_label}
                  width={96}
                  height={96}
                  sizes="72px"
                />
              </span>

              <span className="product-variant-label">
                {variant.variant_label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
