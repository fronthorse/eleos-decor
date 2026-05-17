"use client";

import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EmptyState from "../components/EmptyState";
import { useWishlist } from "../../context/WishlistContext";
import { PRODUCT_IMAGE_FALLBACK } from "../../lib/productImages";

function formatPrice(price) {
  return price ? `\u20a6${price}` : "Price on request";
}

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();

  async function handleRemove(productId) {
    const result = await removeFromWishlist(productId);

    if (result?.message) {
      result.success ? toast.success(result.message) : toast.error(result.message);
    }
  }

  return (
    <>
      <Navbar />

      <main className="wishlist-page luxury-section">
        <div className="container">
          <div className="wishlist-page-header">
            <p className="section-label">Saved Pieces</p>
            <h1 className="luxury-heading mb-2">Your Wishlist</h1>
            <p className="text-muted mb-0">
              Keep your favorite Eleos Decor pieces close while you plan your
              space.
            </p>
          </div>

          {wishlistItems.length === 0 ? (
            <EmptyState
              title="Your wishlist is empty"
              message="Save beautiful decor pieces from the shop and return here when you are ready."
              actionText="Browse Shop"
              actionHref="/shop"
            />
          ) : (
            <div className="wishlist-grid">
              {wishlistItems.map((item) => (
                <article className="wishlist-item-card" key={item.id}>
                  <Link href={item.href} className="wishlist-item-image-link">
                    <Image
                      src={item.imageSrc || item.image_url || PRODUCT_IMAGE_FALLBACK}
                      alt={item.title}
                      width={420}
                      height={336}
                      className="wishlist-item-image"
                    />
                  </Link>

                  <div className="wishlist-item-copy">
                    {item.category && (
                      <p className="wishlist-item-category">{item.category}</p>
                    )}

                    <h2>{item.title}</h2>
                    <p className="wishlist-item-price">{formatPrice(item.price)}</p>

                    <div className="wishlist-item-actions">
                      <Link href={item.href} className="btn btn-dark">
                        View Product
                      </Link>

                      <button
                        type="button"
                        className="btn btn-outline-dark"
                        onClick={() => handleRemove(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
