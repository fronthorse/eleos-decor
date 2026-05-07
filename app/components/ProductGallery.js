"use client";

import { useState } from "react";

export default function ProductGallery({ mainImage, galleryImages = [], title }) {
  const images =
    galleryImages && galleryImages.length > 0 ? galleryImages : [mainImage];

  const [activeImage, setActiveImage] = useState(images[0]);
  const [zoomOpen, setZoomOpen] = useState(false);

  return (
    <>
      <div>
        <img
          src={activeImage}
          alt={title}
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
          <div className="d-flex gap-3 mt-3 flex-wrap">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(image)}
                className="border-0 bg-transparent p-0"
              >
                <img
                  src={image}
                  alt={`${title} ${index + 1}`}
                  className="rounded"
                  style={{
                    width: "85px",
                    height: "85px",
                    objectFit: "cover",
                    border:
                      activeImage === image
                        ? "3px solid #1f1f1f"
                        : "2px solid #ddd",
                    cursor: "pointer",
                  }}
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

          <img src={activeImage} alt={title} className="image-zoom-full" />
        </div>
      )}
    </>
  );
}