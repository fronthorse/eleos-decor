"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import Navbar from ".././components/Navbar";
import Footer from ".././components/Footer";
import ProductCard from ".././components/ProductCard";
import { createClient } from "../../lib/supabase/client";
import ProductSkeleton from ".././components/ProductSkeleton";

function ShopContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [loading, setLoading] = useState(true);

  const categories = [
    "All",
    "Frames",
    "Plants",
    "Mirrors",
    "Diffusers",
    "Humidifiers",
    "Rugs",
    "Tables",
    "Dining Sets",
    "Flowers",
    "Figurines",
    "Faux Books",
    "Wall Clocks",
    "Ornaments",
    "Chairs",
    "Scented Candles",
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

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

  function getNumericPrice(price) {
    return Number(String(price).replace(/,/g, ""));
  }

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());

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

  return (
    <>
      <Navbar />

      <section className="py-5" style={{ marginTop: "100px" }}>
        <div className="container">
          <div className="text-center mb-5">
            <h1 className="fw-bold">Shop Eleos Decor</h1>
            <p className="text-muted">
              Explore elegant décor pieces for beautiful living spaces.
            </p>
          </div>

          <div className="row g-3 align-items-center mb-4">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Search products, categories, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="col-md-4">
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

          <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`btn ${
                  selectedCategory === category
                    ? "btn-dark"
                    : "btn-outline-dark"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {!loading && (
            <p className="text-muted mb-4">
              Showing {filteredProducts.length} product
              {filteredProducts.length === 1 ? "" : "s"}
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
            <div className="text-center py-5">
              <h4>No products found</h4>
              <p className="text-muted">
                Try another search term or category.
              </p>
            </div>
          )}

          <div className="row g-4">
            {filteredProducts.map((product) => (
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