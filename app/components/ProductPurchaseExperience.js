"use client";

import { useMemo, useState } from "react";
import ProductGallery from "./ProductGallery";
import ProductVariantSelector from "./ProductVariantSelector";
import WhatsAppOrderBox from "./WhatsAppOrderBox";
import {
  getDefaultVariant,
  getVariantGalleryImages,
  getVariantPrice,
} from "../../lib/productVariants";

export default function ProductPurchaseExperience({ product, variants = [] }) {
  const defaultVariant = useMemo(() => getDefaultVariant(variants), [variants]);
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  const activeVariant = selectedVariant || defaultVariant;

  const activeProduct = useMemo(() => {
    if (!activeVariant) {
      return product;
    }

    return {
      ...product,
      price: getVariantPrice(product, activeVariant),
      image_url: activeVariant.image_url || product.image_url,
      gallery_images: getVariantGalleryImages(product, activeVariant),
      selectedVariant: activeVariant,
      variant_id: activeVariant.id,
      variant_label: activeVariant.variant_label,
      variant_type: activeVariant.variant_type,
      variant_sku: activeVariant.sku,
    };
  }, [activeVariant, product]);

  const mainImage = activeVariant?.image_url || product.image_url;
  const galleryImages = useMemo(
    () => getVariantGalleryImages(product, activeVariant),
    [activeVariant, product]
  );

  return (
    <>
      <div className="product-editorial-gallery">
        <ProductGallery
          mainImage={mainImage}
          galleryImages={galleryImages}
          title={product.title}
        />
      </div>

      <div className="product-editorial-info">
        <p className="section-label product-editorial-kicker">
          {product.category}
        </p>

        <h1 className="product-editorial-title">{product.title}</h1>

        <p className="product-editorial-price">{"\u20a6"}{activeProduct.price}</p>

        <p className="product-detail-description product-editorial-description">
          {product.description}
        </p>

        <ProductVariantSelector
          variants={variants}
          selectedVariant={activeVariant}
          onSelectVariant={setSelectedVariant}
        />

        <div className="product-style-note">
          <span>Styling note</span>
          <p>{product.stylingStory}</p>
        </div>

        <WhatsAppOrderBox product={activeProduct} />

        <div className="product-trust-grid" aria-label="Shopping support">
          <div>
            <span>Delivery</span>
            <strong>Nationwide delivery</strong>
            <p>Carefully coordinated across Nigeria.</p>
          </div>

          <div>
            <span>Checkout</span>
            <strong>WhatsApp-assisted order</strong>
            <p>Availability and delivery are confirmed before payment.</p>
          </div>

          <div>
            <span>Support</span>
            <strong>Decor guidance</strong>
            <p>Ask for styling help before you decide.</p>
          </div>

          <div>
            <span>Returns</span>
            <strong>Exchange support</strong>
            <p>Return guidance is available for eligible items.</p>
          </div>
        </div>
      </div>
    </>
  );
}
