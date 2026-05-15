export const PRODUCT_IMAGE_FALLBACK = "/placeholder-product.svg";

const PRODUCT_CARD_IMAGE_TRANSFORM = {
  width: 640,
  height: 512,
  resize: "cover",
  quality: 75,
};

const PRODUCT_PREVIEW_IMAGE_TRANSFORM = {
  width: 240,
  height: 240,
  resize: "cover",
  quality: 72,
};

const PRODUCT_THUMBNAIL_FIELDS = [
  "thumbnailImage",
  "thumbnailUrl",
  "thumbnail_url",
  "thumbnail_image",
];

function isValidImageUrl(imageUrl) {
  return typeof imageUrl === "string" && imageUrl.trim().length > 0;
}

function getSupabaseImageTransformUrl(imageUrl, options) {
  if (!isValidImageUrl(imageUrl)) {
    return "";
  }

  try {
    const url = new URL(imageUrl);

    if (!url.pathname.includes("/storage/v1/object/public/")) {
      return imageUrl;
    }

    url.pathname = url.pathname.replace(
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/"
    );

    Object.entries(options).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });

    return url.toString();
  } catch {
    return imageUrl;
  }
}

export function getProductCardImageSrc(imageUrl, thumbnailUrl) {
  if (isValidImageUrl(thumbnailUrl)) {
    return thumbnailUrl;
  }

  return getSupabaseImageTransformUrl(imageUrl, PRODUCT_CARD_IMAGE_TRANSFORM);
}

export function getProductThumbnailUrl(product) {
  if (!product || typeof product !== "object") {
    return "";
  }

  const thumbnailUrl = PRODUCT_THUMBNAIL_FIELDS.map((field) => product[field])
    .find(isValidImageUrl);

  return thumbnailUrl || "";
}

export function getProductPreviewImageSrc(product) {
  if (!product || typeof product !== "object") {
    return PRODUCT_IMAGE_FALLBACK;
  }

  const thumbnailUrl = getProductThumbnailUrl(product);

  if (thumbnailUrl) {
    return thumbnailUrl;
  }

  const imageUrl = product.image_url || product.image;
  const transformedUrl = getSupabaseImageTransformUrl(
    imageUrl,
    PRODUCT_PREVIEW_IMAGE_TRANSFORM
  );

  return transformedUrl || PRODUCT_IMAGE_FALLBACK;
}

export function getProductCardImageFromProduct(product) {
  if (!product || typeof product !== "object") {
    return PRODUCT_IMAGE_FALLBACK;
  }

  const imageUrl = product.image_url || product.image;
  const cardImageUrl = getProductCardImageSrc(
    imageUrl,
    getProductThumbnailUrl(product)
  );

  return cardImageUrl || PRODUCT_IMAGE_FALLBACK;
}
