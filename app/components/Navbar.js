"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { createClient } from "../../lib/supabase/client";
import { getSessionSafely } from "../../lib/supabase/auth";
import { isAdminEmail } from "../../lib/adminAuth";
import { shopNavigation } from "../../lib/navigationData";
import MiniCartDrawer from "./MiniCartDrawer";
import { useRouter } from "next/navigation";
import {
  FiArrowRight,
  FiChevronDown,
  FiHeart,
  FiShoppingBag,
} from "react-icons/fi";

const MEGA_MENU_COLUMNS = [
  { title: "Category", items: shopNavigation.categories },
  { title: "Room", items: shopNavigation.rooms },
  { title: "Collections", items: shopNavigation.collections },
];
const FEATURED_PRODUCT_ROTATION_MS = 6500;
const FEATURED_PRODUCT_FALLBACK = {
  id: 41,
  title: "Spiral Lamp",
  category: "Lighting",
  image_url:
    "https://qexvohhfowswnryqugvr.supabase.co/storage/v1/object/public/products/1778623000561-IMG_8589.jpeg",
};

export default function Navbar() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const { cartCount, clearCart } = useCart();
  const { wishlistCount } = useWishlist();
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([
    FEATURED_PRODUCT_FALLBACK,
  ]);
  const [featuredProductIndex, setFeaturedProductIndex] = useState(0);
  const isAdmin = isAdminEmail(user?.email);
  const featuredProduct =
    featuredProducts[featuredProductIndex] || FEATURED_PRODUCT_FALLBACK;

  const checkUser = useCallback(async () => {
    const { session } = await getSessionSafely(supabase);

    setUser(session?.user || null);
  }, [supabase]);

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [checkUser, supabase.auth]);

  useEffect(() => {
    let cancelled = false;

    async function loadFeaturedProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("id,title,category,image_url")
        .not("image_url", "is", null)
        .neq("image_url", "")
        .order("created_at", { ascending: false })
        .limit(8);

      if (cancelled || error || !data?.length) {
        return;
      }

      const startingIndex = Math.floor(Math.random() * data.length);

      setFeaturedProducts(data);
      setFeaturedProductIndex(startingIndex);
    }

    loadFeaturedProducts();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    if (featuredProducts.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setFeaturedProductIndex((currentIndex) => {
        let nextIndex = Math.floor(Math.random() * featuredProducts.length);

        if (nextIndex === currentIndex) {
          nextIndex = (nextIndex + 1) % featuredProducts.length;
        }

        return nextIndex;
      });
    }, FEATURED_PRODUCT_ROTATION_MS);

    return () => window.clearInterval(interval);
  }, [featuredProducts.length]);

  async function handleLogout() {
    await supabase.auth.signOut();

    clearCart();
    localStorage.removeItem("eleos-cart");

    setUser(null);

    router.push("/");
    router.refresh();
  }

  function closeNavigationMenus() {
    setMegaMenuOpen(false);
    setMobileShopOpen(false);
    setMobileNavOpen(false);
  }

  function handleMegaMenuBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setMegaMenuOpen(false);
    }
  }

  function handleMegaMenuKeyDown(event) {
    if (event.key === "Escape") {
      setMegaMenuOpen(false);
      event.currentTarget.querySelector(".nav-shop-link")?.focus();
    }
  }

  function renderMegaMenuColumn(column) {
    return (
      <div className="mega-menu-column" key={column.title}>
        <p>{column.title}</p>

        <div>
          {column.items.map((item) => (
            <Link
              href={item.href}
              className="mega-menu-link"
              key={item.label}
              onClick={closeNavigationMenus}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  function renderMobileAccordionSection(column) {
    return (
      <div className="mobile-shop-section" key={column.title}>
        <p>{column.title}</p>

        <div className="mobile-shop-links">
          {column.items.map((item) => (
            <Link
              href={item.href}
              className="mobile-shop-link"
              key={item.label}
              onClick={closeNavigationMenus}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-white fixed-top minimal-navbar">
        <div className="container">
          <Link className="navbar-brand brand-logo-link" href="/" aria-label="Eleos Decor home">
            <img
              src="/eleos-logo-nav.svg"
              alt="Eleos Decor"
              className="brand-logo"
            />
          </Link>

          <div className="d-flex align-items-center gap-2 order-lg-2">
            <Link
              href="/wishlist"
              className="cart-icon-btn wishlist-nav-btn"
              aria-label="Open wishlist"
            >
              <FiHeart />

              {wishlistCount > 0 && (
                <span className="cart-count-badge">{wishlistCount}</span>
              )}
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="cart-icon-btn"
              aria-label="Open cart"
            >
              <FiShoppingBag />

              {cartCount > 0 && (
                <span className="cart-count-badge">{cartCount}</span>
              )}
            </button>

            <button
              className="navbar-toggler"
              type="button"
              aria-controls="navbarNav"
              aria-expanded={mobileNavOpen}
              aria-label="Toggle navigation"
              onClick={() => setMobileNavOpen((isOpen) => !isOpen)}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div
            className={`collapse navbar-collapse order-lg-1 ${
              mobileNavOpen ? "show" : ""
            }`}
            id="navbarNav"
          >
            <ul className="navbar-nav ms-lg-auto align-items-lg-center gap-lg-3 mt-3 mt-lg-0">
              <li className="nav-item">
                <Link className="nav-link" href="/" onClick={closeNavigationMenus}>
                  Home
                </Link>
              </li>

              <li
                className="nav-item mega-menu-nav-item d-none d-lg-block"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
                onFocus={() => setMegaMenuOpen(true)}
                onBlur={handleMegaMenuBlur}
                onKeyDown={handleMegaMenuKeyDown}
              >
                <div className="nav-shop-group">
                  <Link
                    href="/shop"
                    className="nav-link nav-shop-link"
                    onClick={closeNavigationMenus}
                  >
                    Shop
                  </Link>

                  <button
                    type="button"
                    className="nav-shop-trigger"
                    aria-label="Open shop menu"
                    aria-expanded={megaMenuOpen}
                    aria-haspopup="true"
                    aria-controls="desktop-shop-menu"
                    onClick={() => setMegaMenuOpen(true)}
                  >
                    <FiChevronDown aria-hidden="true" />
                  </button>
                </div>

                {megaMenuOpen && (
                  <div className="mega-menu-panel" id="desktop-shop-menu">
                    <div className="mega-menu-inner">
                      {MEGA_MENU_COLUMNS.map(renderMegaMenuColumn)}

                      <Link
                        href={`/product/${featuredProduct.id}`}
                        key={featuredProduct.id}
                        className="mega-menu-feature"
                        onClick={closeNavigationMenus}
                      >
                        <span className="mega-menu-feature-image">
                          <img
                            src={featuredProduct.image_url}
                            alt={featuredProduct.title}
                          />
                        </span>

                        <span className="mega-menu-feature-copy">
                          <small>New Arrivals</small>
                          <strong>{featuredProduct.title}</strong>
                          <em>{featuredProduct.category || "Curated decor"}</em>
                          <b>
                            View Product
                            <FiArrowRight aria-hidden="true" />
                          </b>
                        </span>
                      </Link>
                    </div>

                    <Link
                      href={shopNavigation.viewAll.href}
                      className="mega-menu-view-all"
                      onClick={closeNavigationMenus}
                    >
                      {shopNavigation.viewAll.label}
                    </Link>
                  </div>
                )}
              </li>

              <li className="nav-item mobile-shop-nav-item d-lg-none">
                <div className="mobile-shop-row">
                  <Link
                    href="/shop"
                    className="nav-link mobile-shop-main-link"
                    onClick={closeNavigationMenus}
                  >
                    Shop
                  </Link>

                  <button
                    type="button"
                    className="mobile-shop-toggle"
                    aria-label={
                      mobileShopOpen ? "Close shop menu" : "Open shop menu"
                    }
                    aria-expanded={mobileShopOpen}
                    aria-controls="mobile-shop-menu"
                    onClick={() => setMobileShopOpen((isOpen) => !isOpen)}
                  >
                    <span aria-hidden="true">{mobileShopOpen ? "-" : "+"}</span>
                  </button>
                </div>

                {mobileShopOpen && (
                  <div className="mobile-shop-accordion" id="mobile-shop-menu">
                    {MEGA_MENU_COLUMNS.map(renderMobileAccordionSection)}

                    <Link
                      href={shopNavigation.viewAll.href}
                      className="mobile-shop-view-all"
                      onClick={closeNavigationMenus}
                    >
                      {shopNavigation.viewAll.label}
                    </Link>
                  </div>
                )}
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/about" onClick={closeNavigationMenus}>
                  About
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/contact" onClick={closeNavigationMenus}>
                  Contact
                </a>
              </li>

              {!user ? (
                <>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="/customer/login"
                      onClick={closeNavigationMenus}
                    >
                      Login
                    </a>
                  </li>

                  <li className="nav-item">
                    <a
                      className="btn btn-sm btn-dark px-4"
                      href="/customer/signup"
                      onClick={closeNavigationMenus}
                    >
                      Sign Up
                    </a>
                  </li>
                </>
              ) : isAdmin ? (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="/admin" onClick={closeNavigationMenus}>
                      Admin Dashboard
                    </a>
                  </li>

                  <li className="nav-item">
                    <button
                      onClick={handleLogout}
                      className="btn btn-sm btn-outline-dark px-4"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="/customer/dashboard"
                      onClick={closeNavigationMenus}
                    >
                      Dashboard
                    </a>
                  </li>

                  <li className="nav-item">
                    <button
                      onClick={handleLogout}
                      className="btn btn-sm btn-outline-dark px-4"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <MiniCartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
