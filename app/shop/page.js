"use client";

import { useState } from "react";

import Navbar from ".././components/Navbar";
import Footer from ".././components/Footer";
import ProductCard from ".././components/ProductCard";

import products from ".././data/products";

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const categories = [
    "All",
    "Frames",
    "Flowers",
    "Lighting",
    "Plants",
  ];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (product) =>
            product.category === selectedCategory
        );

  return (
    <>
      <Navbar />

      <section
        className="py-5"
        style={{ marginTop: "100px" }}
      >
        <div className="container">

          {/* HEADER */}
          <div className="text-center mb-5">
            <h1 className="fw-bold">
              Shop Eleos Decor
            </h1>

            <p className="text-muted">
              Explore elegant décor pieces for
              beautiful living spaces.
            </p>
          </div>

          {/* CATEGORY FILTERS */}
          <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">

            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(category)
                }
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

          {/* PRODUCTS */}
          <div className="row g-4">

            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
              />
            ))}

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}