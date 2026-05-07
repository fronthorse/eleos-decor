"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
  } = useCart();

  const whatsappNumber = "2348168350533";

  const orderMessage = `
Hello Eleos Decor,

I would like to place an order:

${cartItems
  .map(
    (item) => `
• ${item.title}
Quantity: ${item.quantity}
Price: ₦${item.price}
`
  )
  .join("\n")}

Total: ₦${cartTotal.toLocaleString()}

Thank you.
`;

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    orderMessage
  )}`;

  return (
    <>
      <Navbar />

      <section
        className="luxury-section"
        style={{ marginTop: "80px" }}
      >
        <div className="container">
          <div className="text-center mb-5">
            <p className="section-label">
              Your Cart
            </p>

            <h1 className="luxury-heading">
              Shopping Cart
            </h1>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-5">
              <h4>Your cart is empty</h4>

              <p className="text-muted">
                Add beautiful decor items to your cart.
              </p>

              <a href="/shop" className="btn btn-dark mt-3">
                Continue Shopping
              </a>
            </div>
          ) : (
            <div className="row g-5">
              <div className="col-lg-8">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="soft-card p-3 mb-4"
                  >
                    <div className="row align-items-center">
                      <div className="col-md-3">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="img-fluid rounded"
                          style={{
                            height: "140px",
                            width: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>

                      <div className="col-md-5">
                        <h5 className="fw-bold">
                          {item.title}
                        </h5>

                        <p className="text-muted mb-0">
                          ₦{item.price}
                        </p>
                      </div>

                      <div className="col-md-2">
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.id,
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>

                      <div className="col-md-2">
                        <button
                          onClick={() =>
                            removeFromCart(item.id)
                          }
                          className="btn btn-outline-danger w-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                    <span className="fw-bold">
                      Total
                    </span>

                    <span className="fw-bold">
                      ₦{cartTotal.toLocaleString()}
                    </span>
                  </div>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-dark w-100 mb-3"
                  >
                    Checkout on WhatsApp
                  </a>

                  <button
                    onClick={clearCart}
                    className="btn btn-outline-dark w-100"
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