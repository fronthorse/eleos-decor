"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const heroSlides = [
  {
    title: "Curated decor for warm, beautiful spaces.",
    subtitle:
      "Elegant pieces for homes, offices, and every corner that deserves a finishing touch.",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=82",
    alt: "Warm modern living room with layered neutral decor",
  },
  {
    title: "Style every corner with intention.",
    subtitle:
      "Discover decor pieces that bring warmth, balance, and quiet luxury into your space.",
    image: "/spaces/dining-editorial.avif",
    alt: "Warm dining space styled with refined decor",
  },
  {
    title: "Make your home feel beautifully lived in.",
    subtitle:
      "From statement pieces to soft finishing touches, create rooms that feel personal and complete.",
    image: "/spaces/bedroom-editorial.jpg",
    alt: "Calm bedroom interior with soft layered decor",
  },
];

const HERO_ROTATION_MS = 6000;

export default function Hero() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveSlideIndex((currentIndex) =>
        currentIndex === heroSlides.length - 1 ? 0 : currentIndex + 1
      );
    }, HERO_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <section
      className="home-editorial-hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="home-hero-slides" aria-hidden="true">
        {heroSlides.map((slide, index) => (
          <Image
            key={slide.title}
            src={slide.image}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className={`home-editorial-hero-image ${
              index === activeSlideIndex ? "active" : ""
            }`}
          />
        ))}
      </div>

      <div className="home-editorial-hero-overlay" />

      <div className="container home-editorial-hero-content">
        <div className="home-editorial-hero-copy">
          <p className="home-kicker">Eleos Decor</p>

          <div className="home-hero-copy-slides" aria-live="polite">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.title}
                className={`home-hero-copy-slide ${
                  index === activeSlideIndex ? "active" : ""
                }`}
                aria-hidden={index !== activeSlideIndex}
              >
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="home-hero-actions">
            <Link href="/shop" className="btn btn-light hero-btn">
              Shop Collection
            </Link>

            <Link
              href="/#shop-by-space"
              className="home-hero-secondary-link"
            >
              Explore by room
            </Link>
          </div>

          <div className="home-hero-dots" aria-label="Hero slides">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                className={index === activeSlideIndex ? "active" : ""}
                aria-label={`Show slide ${index + 1}: ${slide.title}`}
                aria-pressed={index === activeSlideIndex}
                onClick={() => setActiveSlideIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
