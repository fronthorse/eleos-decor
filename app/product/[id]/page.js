import Link from "next/link";

import Navbar from "../.././components/Navbar";
import Footer from "../.././components/Footer";
import ProductCard from "../.././components/ProductCard";
import { supabase } from "../../../lib/supabaseClient";

export default async function ProductDetails({ params }) {
  const { id } = await params;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="container py-5" style={{ marginTop: "100px" }}>
          <h1>Product not found</h1>
          <Link href="/shop" className="btn btn-dark mt-3">
            Back to Shop
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const { data: similarProducts } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(3);

  const whatsappMessage = `Hello Eleos Decor, I want to order ${product.title}. Price: ₦${product.price}`;

  return (
    <>
      <Navbar />

      <section className="py-5" style={{ marginTop: "100px" }}>
        <div className="container">
          <div className="mb-4">
            <Link href="/shop" className="text-muted text-decoration-none">
              ← Back to Shop
            </Link>
          </div>

          <div className="row align-items-center g-5">
            <div className="col-md-6">
              <img
                src={product.image_url}
                alt={product.title}
                className="img-fluid rounded shadow"
                style={{
                  width: "100%",
                  height: "520px",
                  objectFit: "cover",
                }}
              />
            </div>

            <div className="col-md-6">
              <span className="badge bg-dark mb-3 px-3 py-2">
                {product.category}
              </span>

              <h1 className="fw-bold mb-4">{product.title}</h1>

              <h2 className="mb-4">₦{product.price}</h2>

              <p className="lead text-muted mb-4">
                {product.description}
              </p>

              <div className="p-4 rounded bg-light mb-4">
                <h6 className="fw-bold">Why you’ll love it</h6>
                <p className="text-muted mb-0">
                  A beautiful décor piece selected to add warmth,
                  elegance, and character to your living space.
                </p>
              </div>

              <a
                href={`https://wa.me/2348168350533?text=${encodeURIComponent(
                  whatsappMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-dark btn-lg w-100"
              >
                Order on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {similarProducts && similarProducts.length > 0 && (
        <section className="py-5">
          <div className="container">
            <h3 className="fw-bold mb-4">Similar Products</h3>

            <div className="row g-4">
              {similarProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  image={item.image_url}
                  title={item.title}
                  description={item.description}
                  price={item.price}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}