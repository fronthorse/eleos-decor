import Navbar from "../.././components/Navbar";
import Footer from "../.././components/Footer";
import products from "../.././data/products";

export default async function ProductDetails({ params }) {
  const { id } = await params;

  const product = products.find(
    (item) => String(item.id) === String(id)
  );

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="container py-5" style={{ marginTop: "80px" }}>
          <h1>Product not found</h1>
          <p>No product matches this ID: {id}</p>
        </div>
        <Footer />
      </>
    );
  }

  const whatsappMessage = `Hello Eleos Decor, I want to order ${product.title}`;

  return (
    <>
      <Navbar />

      <section className="py-5" style={{ marginTop: "80px" }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-md-6">
              <img
                src={product.image}
                alt={product.title}
                className="img-fluid rounded shadow"
                style={{
                  width: "100%",
                  height: "500px",
                  objectFit: "cover",
                }}
              />
            </div>

            <div className="col-md-6">
              <p className="text-muted">{product.category}</p>
              <h1 className="fw-bold mb-4">{product.title}</h1>
              <h3 className="mb-4">₦{product.price}</h3>
              <p className="lead text-muted">{product.description}</p>

              <a
                href={`https://wa.me/2348168350533?text=${encodeURIComponent(
                  whatsappMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-dark btn-lg mt-4"
              >
                Order on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}