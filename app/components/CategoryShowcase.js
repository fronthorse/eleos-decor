import Link from "next/link";

const categories = [
  {
    title: "Wall Frames",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38",
  },
  {
    title: "Faux Flowers",
    image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d",
  },
  {
    title: "Artificial Plants",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411",
  },
  {
    title: "Decor Lights",
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15",
  },
];

export default function CategoryShowcase() {
  return (
    <section className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Shop By Category</h2>
          <p className="text-muted">
            Find beautiful pieces for every corner of your space.
          </p>
        </div>

        <div className="row g-4">
          {categories.map((category) => (
            <div className="col-md-3" key={category.title}>
              <Link href="/shop" style={{ textDecoration: "none" }}>
                <div className="category-card position-relative rounded overflow-hidden shadow-sm">
                  <img
                    src={category.image}
                    alt={category.title}
                    style={{
                      width: "100%",
                      height: "280px",
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
                    <h5 className="text-white fw-bold p-3 mb-0">
                      {category.title}
                    </h5>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}