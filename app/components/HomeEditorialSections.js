import Image from "next/image";
import Link from "next/link";

const spaceCards = [
  {
    title: "Living Room",
    href: "/shop?space=living-room&page=1",
    text: "Layered textures, tables, and statement pieces for welcoming spaces.",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=78",
  },
  {
    title: "Bedroom",
    href: "/shop?space=bedroom&page=1",
    text: "Soft details and calming accents for restful interiors.",
    image: "/spaces/bedroom-editorial.jpg",
  },
  {
    title: "Dining Area",
    href: "/shop?space=dining-area&page=1",
    text: "Warm tablescapes and refined accents for shared moments.",
    image: "/spaces/dining-editorial.avif",
  },
  {
    title: "Workspace",
    href: "/shop?space=office&page=1",
    text: "Minimal finishing pieces that make work feel composed.",
    image:
      "https://images.unsplash.com/photo-1759986452774-be47f7db2362?auto=format&fit=crop&w=900&q=78",
  },
  {
    title: "Entryway",
    href: "/shop?space=entryway&page=1",
    text: "Console styling and thoughtful first-impression details.",
    image:
      "https://images.unsplash.com/photo-1777305293159-70adab4ea6ef?auto=format&fit=crop&w=900&q=78",
  },
];

const inspirationCards = [
  {
    title: "Cozy Apartment",
    text: "Compact spaces with softness, greenery, and warm light.",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=78",
  },
  {
    title: "Warm Minimalist Bedroom",
    text: "Quiet tones, soft linens, and pieces that let the room breathe.",
    image:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=78",
  },
  {
    title: "Neutral Dining Setup",
    text: "A calm table, layered textures, and a setting that invites gathering.",
    image:
      "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=900&q=78",
  },
  {
    title: "Modern Luxe Living Room",
    text: "Sculptural silhouettes, warm neutrals, and elegant everyday comfort.",
    image:
      "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=900&q=78",
  },
];

export function ShopBySpaceEditorial() {
  return (
    <section
      id="shop-by-space"
      className="home-editorial-section home-shop-by-space"
    >
      <div className="container">
        <div className="home-section-header">
          <p className="home-kicker">Shop by Space</p>
          <h2>Style each room with pieces that feel considered.</h2>
          <p>
            Start with the room you are styling, then discover decor that
            brings warmth, balance, and texture into the space.
          </p>
        </div>

        <div className="home-space-grid">
          {spaceCards.map((space) => (
            <Link href={space.href} className="home-space-card" key={space.title}>
              <Image
                src={space.image}
                alt={`${space.title} decor inspiration`}
                fill
                sizes="(max-width: 768px) 88vw, (max-width: 1200px) 42vw, 25vw"
                className="home-card-image"
              />

              <span className="home-card-overlay" />

              <span className="home-card-copy">
                <strong>{space.title}</strong>
                <small>{space.text}</small>
                <em>Shop the space</em>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeStoryBanner() {
  return (
    <section className="home-story-banner">
      <div className="container">
        <div className="home-story-panel">
          <Image
            src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1800&q=80"
            alt="Neutral interior with soft textures and warm light"
            fill
            sizes="100vw"
            className="home-story-image"
          />

          <div className="home-story-overlay" />

          <div className="home-story-copy">
            <p className="home-kicker">The Eleos Feeling</p>
            <h2>Soft textures. Warm lighting. Spaces that feel like home.</h2>
            <p>
              Bring together florals, frames, tables, and gentle accents to
              create rooms that feel styled without feeling overdone.
            </p>
            <Link href="/shop" className="btn btn-light hero-btn">
              Browse Decor
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StyledHomesInspiration() {
  return (
    <section className="home-editorial-section home-inspiration-section">
      <div className="container">
        <div className="home-section-header home-section-header-split">
          <div>
            <p className="home-kicker">Styled Homes Inspiration</p>
            <h2>Little scenes for the way you want home to feel.</h2>
          </div>

          <p>
            Explore warm, neutral interiors and let each room guide your next
            decor choice.
          </p>
        </div>

        <div className="home-inspiration-grid">
          {inspirationCards.map((card) => (
            <article className="home-inspiration-card" key={card.title}>
              <div className="home-inspiration-image-wrap">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 92vw, 25vw"
                  className="home-card-image"
                />
              </div>

              <div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
