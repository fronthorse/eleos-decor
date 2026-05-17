"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  getProductPreviewImageSrc,
  PRODUCT_IMAGE_FALLBACK,
} from "../../lib/productImages";

function isValidImageUrl(imageUrl) {
  return typeof imageUrl === "string" && imageUrl.trim().length > 0;
}

export default function ProductGallery({ mainImage, galleryImages = [], title }) {
  const galleryList = Array.isArray(galleryImages) ? galleryImages : [];
  const images = [mainImage, ...galleryList]
    .filter(isValidImageUrl)
    .filter((image, index, list) => list.indexOf(image) === index);
  const safeImages = images.length > 0 ? images : [PRODUCT_IMAGE_FALLBACK];
  const imageAlt = title || "Product image";

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [failedImages, setFailedImages] = useState({});
  const [imageLoading, setImageLoading] = useState(true);

  const activeImage = safeImages[activeIndex] || safeImages[0];
  const displayImage = failedImages[activeImage]
    ? PRODUCT_IMAGE_FALLBACK
    : activeImage;

  useEffect(() => {
    setActiveIndex(0);
    setImageLoading(true);
  }, [mainImage, galleryImages]);

  function handleImageError(imageUrl) {
    setFailedImages((current) => ({
      ...current,
      [imageUrl]: true,
    }));
    setImageLoading(false);
  }

  function showPrevious() {
    setImageLoading(true);
    setActiveIndex((current) =>
      current === 0 ? safeImages.length - 1 : current - 1
    );
  }

  function showNext() {
    setImageLoading(true);
    setActiveIndex((current) =>
      current === safeImages.length - 1 ? 0 : current + 1
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
      <div className="product-gallery-shell">
        <div
          className="gallery-main-wrapper"
          onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
          onTouchEnd={handleTouchEnd}
        >
          {imageLoading && <div className="gallery-image-skeleton" />}

          <Image
            key={displayImage}
            src={displayImage}
            alt={imageAlt}
            width={700}
            height={700}
            priority={activeIndex === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
            onClick={() => setZoomOpen(true)}
            onLoad={() => setImageLoading(false)}
            onError={() => handleImageError(activeImage)}
            className="product-zoom-image product-gallery-image"
          />

          {safeImages.length > 1 && (
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
                {activeIndex + 1} / {safeImages.length}
              </div>
            </>
          )}
        </div>

        {safeImages.length > 1 && (
          <div className="gallery-thumbnails">
            {safeImages.map((image, index) => {
              const thumbImage = failedImages[image]
                ? PRODUCT_IMAGE_FALLBACK
                : getProductPreviewImageSrc({ image_url: image });

              return (
                <button
                  key={index}
                  onClick={() => {
                    setImageLoading(true);
                    setActiveIndex(index);
                  }}
                  className={`gallery-thumb ${
                    activeIndex === index ? "active" : ""
                  }`}
                  aria-label={`View ${imageAlt} image ${index + 1}`}
                >
                  <Image
                    src={thumbImage}
                    alt={`${imageAlt} ${index + 1}`}
                    width={120}
                    height={120}
                    loading="lazy"
                    sizes="82px"
                    onError={() => handleImageError(image)}
                  />
                </button>
              );
            })}
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
            src={displayImage}
            alt={imageAlt}
            width={1200}
            height={1200}
            sizes="95vw"
            className="image-zoom-full"
            onError={() => handleImageError(activeImage)}
          />
        </div>
      )}
    </>
  );
}
