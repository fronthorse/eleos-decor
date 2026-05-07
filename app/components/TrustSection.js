export default function TrustSection() {
  return (
    <section className="luxury-section bg-white" data-aos="fade-up">
      <div className="container">
        <div className="text-center mb-5">
          <p className="section-label">Why Choose Us</p>
          <h2 className="luxury-heading">Decor That Feels Like Home</h2>
          <p className="text-muted">
            Simple, warm, and elegant pieces for homes and offices across Nigeria.
          </p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="soft-card p-4 h-100 text-center">
              <h3 className="gold-text fw-bold">01</h3>
              <h5 className="fw-bold">Nationwide Delivery</h5>
              <p className="text-muted mb-0">
                We deliver quality decor pieces across Nigeria.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="soft-card p-4 h-100 text-center">
              <h3 className="gold-text fw-bold">02</h3>
              <h5 className="fw-bold">Affordable Elegance</h5>
              <p className="text-muted mb-0">
                Beautiful decoration pieces without unnecessary high cost.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="soft-card p-4 h-100 text-center">
              <h3 className="gold-text fw-bold">03</h3>
              <h5 className="fw-bold">Home & Office Decor</h5>
              <p className="text-muted mb-0">
                Carefully selected items for personal and professional spaces.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}