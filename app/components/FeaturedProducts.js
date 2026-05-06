import ProductCard from "./ProductCard";
import products from "../data/products";

export default function FeaturedProducts() {
  const featuredProducts = products.slice(0, 3);

  return (
    <section className="py-5">
      <div className="container">
        <h2 className="text-center fw-bold mb-5">Featured Products</h2>

        <div className="row g-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}