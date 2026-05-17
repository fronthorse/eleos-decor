"use client";

import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { getProductPreviewImageSrc } from "../../lib/productImages";
import { getCartItemKey, getCartVariantLabel } from "../../lib/productVariants";

export default function WhatsAppOrderBox({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const saved = isInWishlist(product.id);
  const selectedPrint = getCartVariantLabel(product);
  const whatsappMessage = `Hello Eleos Decor, I would like help with ${
    product.title
  }.${selectedPrint ? ` Selected print: ${selectedPrint}.` : ""}`;
  const whatsappHref = `https://wa.me/2348168350533?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  function handleAddToCart() {
    addToCart({
      id: product.id,
      product_id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
      variant_id: product.variant_id || "",
      variant_label: selectedPrint,
      variant_type: product.variant_type || "",
      variant_sku: product.variant_sku || "",
      cart_item_key: getCartItemKey(product),
      thumbnail_url: getProductPreviewImageSrc(product),
    });

    toast.success("Added to cart");
  }

  async function handleWishlist() {
    const result = await toggleWishlist({
      id: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      image_url: product.image_url,
      thumbnailImage:
        product.thumbnailImage ||
        product.thumbnailUrl ||
        product.thumbnail_url ||
        product.thumbnail_image,
      href: `/product/${product.id}`,
    });

    if (result?.message) {
      result.success ? toast.success(result.message) : toast.error(result.message);
    }
  }

  return (
    <div className="product-cta-panel">
      <div>
        <p className="product-cta-kicker">Ready to style it?</p>
        <h2>Reserve this piece for your space</h2>
      </div>

      <p>
        Add this item to your cart, then checkout through WhatsApp from your
        cart. The Eleos Decor team will confirm availability, delivery, and
        final order details with you.
      </p>

      <div className="product-cta-actions">
        <button type="button" onClick={handleAddToCart} className="btn btn-dark">
          Add to Cart
        </button>

        <button
          type="button"
          onClick={handleWishlist}
          className="btn btn-outline-dark"
          aria-pressed={saved}
        >
          {saved ? "Saved" : "Save to Wishlist"}
        </button>
      </div>

      <a href={whatsappHref} className="product-whatsapp-link">
        Ask about this piece on WhatsApp
      </a>
    </div>
  );
}
