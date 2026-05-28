"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import CheckoutForm from "./CheckoutForm";
import EmptyState from "./EmptyState";
import OrderRequestSent from "./OrderRequestSent";
import {
  getProductPreviewImageSrc,
  PRODUCT_IMAGE_FALLBACK,
} from "../../lib/productImages";
import { getCartItemKey, getCartVariantLabel } from "../../lib/productVariants";

function handlePreviewImageError(event) {
  if (event.currentTarget.src.includes(PRODUCT_IMAGE_FALLBACK)) {
    return;
  }

  event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
}

export default function MiniCartDrawer({ isOpen, onClose }) {
  const [sentOrderRequest, setSentOrderRequest] = useState(null);
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    clearCart,
  } = useCart();

  useEffect(() => {
    if (cartItems.length > 0) {
      setSentOrderRequest(null);
    }
  }, [cartItems.length]);

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
          {sentOrderRequest ? (
            <OrderRequestSent
              orderRequest={sentOrderRequest}
              className="order-request-card-drawer"
              onReturnToShop={onClose}
            />
          ) : cartItems.length === 0 ? (
            <EmptyState
  title="Your cart is empty"
  message="Add your favorite décor pieces and checkout when ready."
  actionText="Continue Shopping"
  actionHref="/shop"
/>
          ) : (
            <>
              <div className="mini-cart-items">
                {cartItems.map((item) => {
                  const itemKey = item.cart_item_key || getCartItemKey(item);
                  const variantLabel = getCartVariantLabel(item);

                  return (
                  <div
                    key={itemKey}
                    className="mini-cart-item d-flex gap-3 mb-4"
                  >
                    <Image
                      src={getProductPreviewImageSrc(item)}
                      alt={item.title}
                      width={72}
                      height={72}
                      sizes="72px"
                      loading="lazy"
                      onError={handlePreviewImageError}
                    />

                    <div className="flex-grow-1">
                      <h6 className="mini-cart-item-title fw-bold mb-1">
                        {item.title}
                      </h6>

                      <p className="text-muted small mb-2">₦{item.price}</p>

                      {variantLabel && (
                        <p className="cart-variant-label">
                          Print: {variantLabel}
                        </p>
                      )}

                      <input
                        type="number"
                        min="1"
                        className="form-control form-control-sm"
                        style={{ width: "80px" }}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(itemKey, Number(e.target.value))
                        }
                      />
                    </div>

                    <button
                      onClick={() => removeFromCart(itemKey)}
                      className="btn btn-sm btn-outline-danger"
                    >
                      ×
                    </button>
                  </div>
                  );
                })}
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
                  onOrderRequestSent={setSentOrderRequest}
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
