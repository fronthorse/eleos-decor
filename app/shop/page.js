"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import Navbar from ".././components/Navbar";
import Footer from ".././components/Footer";
import ProductCard from ".././components/ProductCard";
import ProductSkeleton from ".././components/ProductSkeleton";
import EmptyState from ".././components/EmptyState";

import { createClient } from "../../lib/supabase/client";

function ShopContent() {
  const supabase = createClient();

  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(12);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = [
    "All",
    "Frames",
    "Mirrors",
    "Wall Clocks",
    "Wall Art",
    "Rugs",
    "Throw Pillows",
    "Throw Blankets",
    "Bedsheets",
    "Tables",
    "Chairs",
    "Dining Sets",
    "Ornaments",
    "Figurines",
    "Faux Books",
    "Lamps",
    "Diffusers",
    "Humidifiers",
    "Scented Candles",
    "Plants",
    "Flowers",
    "Artificial Water Fountains",
  ];

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory, searchTerm, sortOption]);

  function getNumericPrice(price) {
    return Number(
      String(price)
        .replace(/₦/g, "")
        .replace(/,/g, "")
        .trim()
    );
  }

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const search = searchTerm.toLowerCase().trim();

      const searchableText = `
        ${product.title || ""}
        ${product.description || ""}
        ${product.category || ""}
        ${product.price || ""}
      `.toLowerCase();

      const matchesSearch =
        search === "" || searchableText.includes(search);

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      }

      if (sortOption === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }

      if (sortOption === "price-low") {
        return getNumericPrice(a.price) - getNumericPrice(b.price);
      }

      if (sortOption === "price-high") {
        return getNumericPrice(b.price) - getNumericPrice(a.price);
      }

      return 0;
    });

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <>
      <Navbar />

      <section className="shop-page-section">
        <div className="container">
          <div className="text-center shop-page-heading">
            <h1 className="fw-bold">Shop Eleos Decor</h1>

            <p className="text-muted">
              Explore elegant décor pieces for beautiful living spaces.
            </p>
          </div>

          <div className="d-md-none mb-3">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="btn btn-dark w-100"
            >
              {filterOpen ? "Hide Search & Filter" : "Search & Filter"}
            </button>
          </div>

          <div className={`shop-mobile-filter ${filterOpen ? "open" : ""}`}>
            <div className="row g-3 align-items-center mb-4">
              <div className="col-md-8">
                <label className="form-label fw-bold small mb-1 d-md-none">
                  Search
                </label>

                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold small mb-1 d-md-none">
                  Sort
                </label>

                <select
                  className="form-select form-select-lg"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="shop-filter-card mb-5">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold small mb-1">
                    Category
                  </label>

                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 d-none d-md-block">
                  <label className="form-label fw-bold small mb-1">
                    Showing
                  </label>

                  <div className="bg-white border rounded-pill px-4 py-2 small">
                    {selectedCategory === "All"
                      ? "All categories"
                      : selectedCategory}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!loading && (
            <p className="text-muted mb-4">
              Showing {visibleProducts.length} of {filteredProducts.length}{" "}
              product{filteredProducts.length === 1 ? "" : "s"}
            </p>
          )}

          {loading && (
            <div className="row g-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <ProductSkeleton key={item} />
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <EmptyState
              title="No products found"
              message="Try another search term, category, or sorting option."
              actionText="View All Products"
              actionHref="/shop"
            />
          )}

          {!loading && filteredProducts.length > 0 && (
            <>
              <div className="row g-4">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    image={product.image_url}
                    title={product.title}
                    description={product.description}
                    price={product.price}
                  />
                ))}
              </div>

              {visibleCount < filteredProducts.length && (
                <div className="text-center mt-5">
                  <button
                    onClick={() =>
                      setVisibleCount((count) => count + 12)
                    }
                    className="btn btn-outline-dark px-5"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<p className="text-center py-5">Loading shop...</p>}>
      <ShopContent />
    </Suspense>
  );
}
