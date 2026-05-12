export default function Hero() {
  return (
    <section className="hero-section d-flex align-items-center">
      <div className="container">
        <div className="row">
          <div className="col-lg-7">
            <p className="section-label text-white mb-3">
              Eleos Decor
            </p>

            <h1 className="hero-title">
              Beautiful Décor for Warm, Elegant Spaces
            </h1>

            <p className="hero-text mt-3">
              Curated home and office décor pieces designed to add comfort,
              style, and personality to your space.
            </p>

            <a href="/shop" className="btn btn-light hero-btn mt-4">
              Shop Collection
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}