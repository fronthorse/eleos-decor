"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ mainImage, galleryImages = [], title }) {
  const images =
    galleryImages && galleryImages.length > 0 ? galleryImages : [mainImage];

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  const activeImage = images[activeIndex];

  function showPrevious() {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  }

  function showNext() {
    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  }

  function handleTouchEnd(e) {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const difference = touchStart - touchEnd;

    if (difference > 50) {
      showNext();
    }

    if (difference < -50) {
      showPrevious();
    }

    setTouchStart(null);
  }

  return (
    <>
      <div>
        <div
          className="gallery-main-wrapper"
          onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
          onTouchEnd={handleTouchEnd}
        >
          <Image
  src={activeImage}
  alt={title}
  width={900}
  height={700}
            onClick={() => setZoomOpen(true)}
            className="img-fluid rounded shadow product-zoom-image"
            style={{
              width: "100%",
              height: "520px",
              objectFit: "cover",
              cursor: "zoom-in",
            }}
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="gallery-arrow gallery-arrow-left"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={showNext}
                className="gallery-arrow gallery-arrow-right"
              >
                ›
              </button>

              <div className="gallery-counter">
                {activeIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="gallery-thumbnails">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`gallery-thumb ${
                  activeIndex === index ? "active" : ""
                }`}
              >
                <Image
  src={image}
  alt={`${title} ${index + 1}`}
  width={120}
  height={120}
/>
              </button>
            ))}
          </div>
        )}
      </div>

      {zoomOpen && (
        <div className="image-zoom-overlay" onClick={() => setZoomOpen(false)}>
          <button
            className="image-zoom-close"
            onClick={() => setZoomOpen(false)}
          >
            ×
          </button>

          <Image
  src={activeImage}
  alt={title}
  width={1400}
  height={1200}
  className="image-zoom-full"
/>
        </div>
      )}
    </>
  );
}