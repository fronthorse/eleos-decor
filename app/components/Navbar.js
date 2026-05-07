"use client";

import { useState } from "react";
import { useCart } from "../../context/CartContext";
import MiniCartDrawer from "./MiniCartDrawer";

export default function Navbar() {
  const { cartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-white fixed-top minimal-navbar">
        <div className="container">
          <a className="navbar-brand fw-bold" href="/">
            Eleos Decor
          </a>

          <div className="d-flex align-items-center gap-2 order-lg-2">
            <button
              onClick={() => setCartOpen(true)}
              className="btn btn-sm btn-outline-dark cart-nav-btn"
            >
              Cart ({cartCount})
            </button>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div className="collapse navbar-collapse order-lg-1" id="navbarNav">
            <ul className="navbar-nav ms-lg-auto align-items-lg-center gap-lg-3 mt-3 mt-lg-0">
              <li className="nav-item">
                <a className="nav-link" href="/">Home</a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/shop">Shop</a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/about">About</a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/contact">Contact</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <MiniCartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}