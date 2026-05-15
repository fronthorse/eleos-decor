export const SITE_URL = "https://eleosdecor.com";
export const SITE_NAME = "Eleos Decor";
export const DEFAULT_SEO_DESCRIPTION =
  "Shop premium home and office decor from Eleos Decor. Discover elegant frames, plants, flowers, mirrors, lights, rugs, tables, diffusers, and decorative accessories with delivery across Nigeria.";
export const DEFAULT_OG_IMAGE = "/eleos-og-image.png";
export const DEFAULT_KEYWORDS = [
  "Eleos Decor",
  "home decor Nigeria",
  "interior decor Nigeria",
  "office decor",
  "luxury decor",
  "decor accessories",
  "artificial plants",
  "decorative lights",
];

export function absoluteUrl(path = "/") {
  if (typeof path !== "string" || path.trim().length === 0) {
    return SITE_URL;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return new URL(path, SITE_URL).toString();
}

export function normalizeDescription(description, fallback = DEFAULT_SEO_DESCRIPTION) {
  if (typeof description !== "string") {
    return fallback;
  }

  const cleanDescription = description.replace(/\s+/g, " ").trim();

  if (!cleanDescription) {
    return fallback;
  }

  return cleanDescription.length > 155
    ? `${cleanDescription.slice(0, 152).trim()}...`
    : cleanDescription;
}

export function normalizePrice(price) {
  const normalizedPrice =
    typeof price === "string" ? price.replace(/[^\d.]/g, "") : price;
  const numericPrice = Number(normalizedPrice);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return null;
  }

  return numericPrice.toFixed(2);
}

export function getProductImage(product) {
  if (!product || typeof product !== "object") {
    return absoluteUrl(DEFAULT_OG_IMAGE);
  }

  const image =
    product.image_url ||
    product.image ||
    product.thumbnail_url ||
    product.thumbnail_image ||
    product.thumbnailUrl ||
    product.thumbnailImage ||
    product.gallery_images?.find((item) => typeof item === "string" && item);

  return absoluteUrl(image || DEFAULT_OG_IMAGE);
}

export function getProductAvailability(product) {
  if (!product || typeof product !== "object") {
    return "https://schema.org/OutOfStock";
  }

  if (product.is_available === false || product.available === false) {
    return "https://schema.org/OutOfStock";
  }

  if (Number.isFinite(Number(product.stock_quantity))) {
    return Number(product.stock_quantity) > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";
  }

  return "https://schema.org/InStock";
}
