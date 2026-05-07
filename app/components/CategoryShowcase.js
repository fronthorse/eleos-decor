import Link from "next/link";

const categories = [
  {
    title: "Frames",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38",
  },
  {
    title: "Plants",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411",
  },
  {
    title: "Mirrors",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6",
  },
  {
    title: "Flowers",
    image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d",
  },
  {
    title: "Rugs",
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843",
  },
  {
    title: "Scented Candles",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59",
  },
];

export default function CategoryShowcase() {
  return (
    <section className="py-5 bg-white">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Shop By Category</h2>
          <p className="text-muted">
            Find beautiful pieces for every corner of your space.
          </p>
        </div>

        <div className="row g-4">
          {categories.map((category) => (
            <div className="col-md-4 col-lg-2" key={category.title}>
              <Link
                href={`/shop?category=${encodeURIComponent(category.title)}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="category-card position-relative rounded overflow-hidden shadow-sm h-100"
                  data-aos="fade-up"
                >
                  <img
                    src={category.image}
                    alt={category.title}
                    style={{
                      width: "100%",
                      height: "220px",
                      objectFit: "cover",
                    }}
                  />

                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end"
                    style={{
                      background:
                        "linear-gradient(transparent, rgba(0,0,0,0.65))",
                    }}
                  >
                    <h6 className="text-white fw-bold p-3 mb-0">
                      {category.title}
                    </h6>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <Link href="/shop" className="btn btn-dark">
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
}
