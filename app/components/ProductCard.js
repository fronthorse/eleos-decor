"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import {
  getProductPreviewImageSrc,
  getProductCardImageSrc,
  PRODUCT_IMAGE_FALLBACK,
} from "../../lib/productImages";

export default function ProductCard({
  id,
  image,
  thumbnailImage,
  title,
  description,
  price,
}) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [imageFailed, setImageFailed] = useState(false);

  const saved = isInWishlist(id);
  const optimizedImage = getProductCardImageSrc(image, thumbnailImage);
  const imageSrc =
    optimizedImage && !imageFailed ? optimizedImage : PRODUCT_IMAGE_FALLBACK;

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

    const result = await toggleWishlist(id);

    if (result?.message) {
      result.success ? toast.success(result.message) : toast.error(result.message);
    }
  }

  return (
    <div className="col-md-4">
      <div className="product-card h-100">
        <Link
          href={`/product/${id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="product-image-wrapper">
            <button
              type="button"
              onClick={handleWishlistClick}
              className="wishlist-btn"
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            >
              {saved ? "♥" : "♡"}
            </button>

            <Image
              src={imageSrc}
              className="product-image"
              alt={title || "Product image"}
              width={640}
              height={512}
              loading="lazy"
              sizes="(max-width: 575px) 100vw, (max-width: 991px) 50vw, 33vw"
              onError={() => setImageFailed(true)}
            />
          </div>

          <div className="p-4">
            <h5 className="fw-bold mb-3">{title}</h5>

            <p className="text-muted product-description">
              {description}
            </p>
          </div>
        </Link>

        <div className="px-4 pb-4 mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">₦{price}</h5>

            <span className="gold-text small fw-bold">
              Premium Decor
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="btn btn-dark w-100 py-3 mb-2"
          >
            Add to Cart
          </button>

          <Link
            href={`/product/${id}`}
            className="btn btn-outline-dark w-100 py-3"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
