"use client";

import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";

export default function WhatsAppOrderBox({ product }) {
  const { addToCart } = useCart();

  function handleAddToCart() {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
    });

    toast.success("Added to cart");
  }

  return (
    <div className="bg-white p-4 rounded shadow-sm mt-4">
      <h5 className="fw-bold mb-3">Ready to Order?</h5>

      <p className="text-muted">
        Add this item to your cart, then checkout through WhatsApp from your
        cart.
      </p>

      <button
        type="button"
        onClick={handleAddToCart}
        className="btn btn-dark btn-lg w-100"
      >
        Add to Cart
      </button>
    </div>
  );
}