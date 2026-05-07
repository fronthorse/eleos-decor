export default function Hero() {
  return (
    <section className="hero-section d-flex align-items-center text-white">
      <div className="container">
        <div className="col-lg-7">
          <p className="section-label text-white mb-3">
            Warm Luxury For Every Space
          </p>

          <h1 className="hero-title mb-4">
            Transform Your Home & Office With Elegant Decor
          </h1>

          <p className="hero-text mb-4">
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

          <div className="d-flex flex-wrap gap-4 mt-4">
            <div>
              <h4 className="fw-bold mb-0">Nationwide</h4>
              <small>Delivery across Nigeria</small>
            </div>

            <div>
              <h4 className="fw-bold mb-0">Home & Office</h4>
              <small>Decor solutions</small>
            </div>

            <div>
              <h4 className="fw-bold mb-0">Warm Luxury</h4>
              <small>Affordable elegance</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}