"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import Navbar from ".././components/Navbar";
import Footer from ".././components/Footer";
import ProductCard from ".././components/ProductCard";
import { supabase } from "../../lib/supabaseClient";

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
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

    setProducts(data);
    setLoading(false);
  }

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

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

          {loading && (
            <div className="text-center py-5">
              <p className="text-muted">Loading products...</p>
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-5">
              <h4>No products found</h4>
              <p className="text-muted">
                Products in this category will appear here once uploaded.
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