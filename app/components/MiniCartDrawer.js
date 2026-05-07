"use client";

import Link from "next/link";
import { useCart } from "../../context/CartContext";

export default function MiniCartDrawer({ isOpen, onClose }) {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    clearCart,
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
//   console.log("Cart drawer open:", isOpen);

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={onClose}></div>}

      <div className={`mini-cart-drawer ${isOpen ? "open" : ""}`}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">Your Cart</h4>

          <button onClick={onClose} className="btn btn-sm btn-outline-dark">
            Close
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-5">
            <h5>Your cart is empty</h5>
            <p className="text-muted">Add beautiful decor items.</p>

            <Link href="/shop" onClick={onClose} className="btn btn-dark">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="mini-cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="mini-cart-item">
                  <img src={item.image_url} alt={item.title} />

                  <div className="flex-grow-1">
                    <h6 className="fw-bold mb-1">{item.title}</h6>
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

            <div className="border-top pt-4 mt-4">
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold">Total</span>
                <span className="fw-bold">₦{cartTotal.toLocaleString()}</span>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-dark w-100 mb-2"
              >
                Checkout on WhatsApp
              </a>

              <Link href="/cart" onClick={onClose} className="btn btn-outline-dark w-100 mb-2">
                View Full Cart
              </Link>

              <button onClick={clearCart} className="btn btn-outline-danger w-100">
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}