"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaHeart, FaRegHeart } from "react-icons/fa";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import {
  getProductPreviewImageSrc,
  getProductBalancedCardImageSrc,
  getProductCardImageSrc,
  PRODUCT_IMAGE_FALLBACK,
} from "../../lib/productImages";
import { buildProductImageAlt } from "../../lib/seo";
import { supportsPrintVariants } from "../../lib/productVariants";

function hasBalancedArtImage(category) {
  const normalizedCategory = String(category || "").toLowerCase();

  return (
    supportsPrintVariants(category) ||
    normalizedCategory.includes("frame") ||
    normalizedCategory.includes("wall art")
  );
}

function ProductCard({
  id,
  image,
  thumbnailImage,
  title,
  price,
  category,
  columnClassName = "col-md-4",
}) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [imageFailed, setImageFailed] = useState(false);

  const saved = isInWishlist(id);
  const requiresPrintChoice = supportsPrintVariants(category);
  const usesBalancedImage = hasBalancedArtImage(category);
  const cardClassName = `product-card h-100 ${
    usesBalancedImage ? "product-card--art" : ""
  } ${
    requiresPrintChoice ? "product-card--frame" : ""
  }`;
  const optimizedImage = usesBalancedImage
    ? getProductBalancedCardImageSrc(image)
    : getProductCardImageSrc(image, thumbnailImage);
  const imageSrc =
    optimizedImage && !imageFailed ? optimizedImage : PRODUCT_IMAGE_FALLBACK;
  const imageAlt = buildProductImageAlt({ title, category });

  useEffect(() => {
    setImageFailed(false);
  }, [image, thumbnailImage]);

  function handleAddToCart() {
    const cartProduct = {
      id,
      title,
      price,
      image_url: image,
      thumbnailImage,
    };

    addToCart({
      id,
      title,
      price,
      image_url: image,
      thumbnail_url: getProductPreviewImageSrc(cartProduct),
    });

    toast.success("Added to cart");
  }

  async function handleWishlistClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const result = await toggleWishlist({
      id,
      title,
      price,
      category,
      image_url: image,
      thumbnailImage,
      href: `/product/${id}`,
    });

    if (result?.message) {
      result.success
        ? toast.success(result.message)
        : toast.error(result.message);
    }
  }

  return (
    <div className={columnClassName}>
      <div className={cardClassName}>
        <Link href={`/product/${id}`} className="product-card-link">
          <div className="product-image-wrapper">
            <button
              type="button"
              onClick={handleWishlistClick}
              className={`wishlist-btn ${saved ? "is-active" : ""}`}
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={saved}
            >
              {saved ? (
                <FaHeart aria-hidden="true" />
              ) : (
                <FaRegHeart aria-hidden="true" />
              )}
            </button>

            <Image
              src={imageSrc}
              className="product-image"
              alt={imageAlt}
              width={640}
              height={512}
              loading="lazy"
              sizes="(max-width: 575px) 50vw, (max-width: 991px) 33vw, 25vw"
              onError={() => setImageFailed(true)}
            />
          </div>

          <div className="product-card-body">
            <h5>{title}</h5>
          </div>
        </Link>

        <div className="product-card-actions">
          <div className="product-card-price-row">
            <strong>{"\u20a6"}{price}</strong>

            <Link href={`/product/${id}`} className="product-card-details">
              Details
            </Link>
          </div>

          {requiresPrintChoice ? (
            <Link href={`/product/${id}`} className="product-card-add">
              Choose Print
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="product-card-add"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
