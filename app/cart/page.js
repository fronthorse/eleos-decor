"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CheckoutForm from "../components/CheckoutForm";
import EmptyState from "../components/EmptyState";
import OrderRequestSent from "../components/OrderRequestSent";
import { useCart } from "../../context/CartContext";
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

export default function CartPage() {
  const [sentOrderRequest, setSentOrderRequest] = useState(null);
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
  } = useCart();

  return (
    <>
      <Navbar />

      <section className="luxury-section" style={{ marginTop: "80px" }}>
        <div className="container">
          <div className="text-center mb-5">
            <p className="section-label">Your Cart</p>

            <h1 className="luxury-heading">Shopping Cart</h1>
          </div>

          {sentOrderRequest ? (
            <OrderRequestSent orderRequest={sentOrderRequest} />
          ) : cartItems.length === 0 ? (
            <EmptyState
  title="Your cart is empty"
  message="Add beautiful decor items to your cart and return here to complete checkout."
  actionText="Continue Shopping"
  actionHref="/shop"
/>
          ) : (
            <div className="row g-5">
              <div className="col-lg-8">
                {cartItems.map((item) => {
                  const itemKey = item.cart_item_key || getCartItemKey(item);
                  const variantLabel = getCartVariantLabel(item);

                  return (
                  <div key={itemKey} className="soft-card p-3 mb-4">
                    <div className="row align-items-center g-3">
                      <div className="col-md-3">
                        <Image
                          src={getProductPreviewImageSrc(item)}
                          alt={item.title}
                          width={220}
                          height={140}
                          sizes="(max-width: 767px) 100vw, 220px"
                          loading="lazy"
                          className="img-fluid rounded"
                          onError={handlePreviewImageError}
                          style={{
                            height: "140px",
                            width: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>

                      <div className="col-md-5">
                        <h5 className="fw-bold">{item.title}</h5>

                        <p className="text-muted mb-0">
                          ₦{item.price}
                        </p>
                        {variantLabel && (
                          <p className="cart-variant-label">
                            Print: {variantLabel}
                          </p>
                        )}
                      </div>

                      <div className="col-md-2">
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              itemKey,
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>

                      <div className="col-md-2">
                        <button
                          onClick={() => removeFromCart(itemKey)}
                          className="btn btn-outline-danger w-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              <div className="col-lg-4">
                <div className="soft-card p-4">
                  <h4 className="fw-bold mb-4">
                    Order Summary
                  </h4>

                  <div className="d-flex justify-content-between mb-3">
                    <span>Total Items</span>

                    <span>
                      {cartItems.reduce(
                        (total, item) =>
                          total + item.quantity,
                        0
                      )}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between mb-4">
                    <span className="fw-bold">Total</span>

                    <span className="fw-bold">
                      ₦{cartTotal.toLocaleString()}
                    </span>
                  </div>

                  <CheckoutForm
                    cartItems={cartItems}
                    cartTotal={cartTotal}
                    onOrderRequestSent={setSentOrderRequest}
                  />

                  <button
                    onClick={clearCart}
                    className="btn btn-outline-dark w-100 mt-2"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
