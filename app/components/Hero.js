export default function Hero() {
  return (
    <section
      className="d-flex align-items-center text-white"
      style={{
        minHeight: "95vh",
        paddingTop: "90px",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.35)), url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container">
        <div className="col-lg-7">
          <p className="text-uppercase fw-semibold mb-3" style={{ letterSpacing: "3px" }}>
            Warm Luxury For Every Space
          </p>

          <h1 className="display-2 fw-bold mb-4">
            Transform Your Home & Office With Elegant Decor
          </h1>

          <p className="lead mb-4">
            Quality and affordable interior decoration pieces carefully selected
            to make your space feel warm, stylish, and welcoming.
          </p>

          <div className="d-flex flex-wrap gap-3 pb-4">
            <a href="/shop" className="btn btn-light btn-lg">
              Shop Collection
            </a>

            <a href="/contact" className="btn btn-outline-light btn-lg">
              Talk to Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}