"use client";

import Link from "next/link";
import { useCart } from "../../context/CartContext";
import CheckoutForm from "./CheckoutForm";
import EmptyState from "./EmptyState";
import {
  getProductPreviewImageSrc,
  PRODUCT_IMAGE_FALLBACK,
} from "../../lib/productImages";

function handlePreviewImageError(event) {
  if (event.currentTarget.src.includes(PRODUCT_IMAGE_FALLBACK)) {
    return;
  }

  event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
}

export default function MiniCartDrawer({ isOpen, onClose }) {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    clearCart,
  } = useCart();

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={onClose}></div>}

      <div className={`mini-cart-drawer ${isOpen ? "open" : ""}`}>
        <div className="mini-cart-header d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">Your Cart</h4>

          <button onClick={onClose} className="btn btn-sm btn-outline-dark">
            Close
          </button>
        </div>

        <div className="mini-cart-body">
          {cartItems.length === 0 ? (
            <EmptyState
  title="Your cart is empty"
  message="Add your favorite décor pieces and checkout when ready."
  actionText="Continue Shopping"
  actionHref="/shop"
/>
          ) : (
            <>
              <div className="mini-cart-items">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="mini-cart-item d-flex gap-3 mb-4"
                  >
                    <img
                      src={getProductPreviewImageSrc(item)}
                      alt={item.title}
                      loading="lazy"
                      onError={handlePreviewImageError}
                    />

                    <div className="flex-grow-1">
                      <h6 className="mini-cart-item-title fw-bold mb-1">
                        {item.title}
                      </h6>

                      <p className="text-muted small mb-2">₦{item.price}</p>

                      <input
                        type="number"
                        min="1"
                        className="form-control form-control-sm"
                        style={{ width: "80px" }}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, Number(e.target.value))
                        }
                      />
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="btn btn-sm btn-outline-danger"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="mini-cart-footer border-top pt-4 mt-4">
                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-bold">Total</span>

                  <span className="fw-bold">
                    ₦{cartTotal.toLocaleString()}
                  </span>
                </div>

                <CheckoutForm
                  cartItems={cartItems}
                  cartTotal={cartTotal}
                  compact={true}
                />

                <Link
                  href="/cart"
                  onClick={onClose}
                  className="btn btn-outline-dark w-100 mt-2 mb-2"
                >
                  View Full Cart
                </Link>

                <button
                  onClick={clearCart}
                  className="btn btn-outline-danger w-100"
                >
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
