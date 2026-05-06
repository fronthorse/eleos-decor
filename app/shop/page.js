import Navbar from ".././components/Navbar";
import Footer from ".././components/Footer";
import ProductCard from ".././components/ProductCard";
import products from ".././data/products";

export default function ShopPage() {
  return (
    <>
      <Navbar />

      <section className="py-5" style={{ marginTop: "80px" }}>
        <div className="container">
          <div className="text-center mb-5">
            <h1 className="fw-bold">Shop Eleos Decor</h1>
            <p className="text-muted">
              Explore elegant décor pieces for beautiful living spaces.
            </p>
          </div>

          <div className="row g-4">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}