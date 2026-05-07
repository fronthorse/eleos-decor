"use client";

import { useState } from "react";

export default function ProductGallery({ mainImage, galleryImages = [], title }) {
  const images =
    galleryImages && galleryImages.length > 0
      ? galleryImages
      : [mainImage];

  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div>
      <img
        src={activeImage}
        alt={title}
        className="img-fluid rounded shadow"
        style={{
          width: "100%",
          height: "520px",
          objectFit: "cover",
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
  );
}