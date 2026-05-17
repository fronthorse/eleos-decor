import Image from "next/image";
import Link from "next/link";

const heroImage =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=82";

export default function Hero() {
  return (
    <section className="home-editorial-hero">
      <Image
        src={heroImage}
        alt="Warm modern living room with layered neutral decor"
        fill
        priority
        sizes="100vw"
        className="home-editorial-hero-image"
      />

      <div className="home-editorial-hero-overlay" />

      <div className="container home-editorial-hero-content">
        <div className="home-editorial-hero-copy">
          <p className="home-kicker">Eleos Decor</p>

          <h1>Create a home that feels calm, warm, and beautifully styled.</h1>

          <p>
            Curated decor pieces for layered living rooms, restful bedrooms,
            welcoming entryways, and the little corners that make a space feel
            personal.
          </p>

          <div className="home-hero-actions">
            <Link href="/shop" className="btn btn-light hero-btn">
              Shop Collection
            </Link>

            <Link
              href="/shop?category=Tables&page=1"
              className="home-hero-secondary-link"
            >
              Explore by room
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
