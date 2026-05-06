export default function Hero() {
  return (
    <section
      className="d-flex align-items-center text-white"
      style={{
        height: "90vh",
        paddingTop: "80px",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container">
        <h1 className="display-2 fw-bold">Eleos Decor</h1>

        <p className="lead col-md-6 mt-4">
          Luxury interior decorations crafted to transform your space into
          elegance and comfort.
        </p>

        <a href="/shop" className="btn btn-light btn-lg mt-3">
          Shop Collection
        </a>
      </div>
    </section>
  );
}