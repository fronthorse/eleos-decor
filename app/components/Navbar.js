"use client";
import { useCart } from "../../context/CartContext";
export default function Navbar() {
  const { cartCount } = useCart();
  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm fixed-top py-3 luxury-navbar">
      <div className="container">
        <a className="navbar-brand fw-bold fs-3" href="/">
          Eleos Decor
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            <li className="nav-item">
              <a className="nav-link fw-medium" href="/">Home</a>
            </li>

            <li className="nav-item">
              <a className="nav-link fw-medium" href="/shop">Shop</a>
            </li>

            <li className="nav-item">
              <a className="nav-link fw-medium" href="/about">About</a>
            </li>

            <li className="nav-item">
              <a className="nav-link fw-medium" href="/contact">Contact</a>
            </li>
<li className="nav-item">
  <a className="nav-link fw-medium" href="/cart">
    Cart ({cartCount})
  </a>
</li>
            <li className="nav-item">
              <a className="btn btn-dark px-4" href="/shop">
                Shop Now
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}