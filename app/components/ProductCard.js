"use client";

import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import Image from "next/image";

export default function ProductCard({
  id,
  image,
  title,
  description,
  price,
}) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const saved = isInWishlist(id);

  return (
    <div className="col-md-4">
      <div className="product-card h-100">
        <Link
          href={`/product/${id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="product-image-wrapper">
            <button
              onClick={async (e) => {
                e.preventDefault();
                await toggleWishlist(id);
              }}
              className="wishlist-btn"
            >
              {saved ? "♥" : "♡"}
            </button>

            <Image
  src={image}
  className="product-image"
  alt={title}
  width={500}
  height={360}
  loading="lazy"
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
            onClick={() =>
              addToCart({
                id,
                title,
                price,
                image_url: image,
              })
            }
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