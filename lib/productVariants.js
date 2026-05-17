export const FRAME_VARIANT_CATEGORY = "frames";
export const PRODUCT_VARIANT_TYPE_PRINT = "print";

function normalizeCategory(value) {
  return String(value || "").trim().toLowerCase();
}

export function normalizeProductVariantProductId(productId) {
  const numericProductId = Number(productId);

  return Number.isFinite(numericProductId) ? numericProductId : null;
}

export function supportsPrintVariants(productOrCategory) {
  const category =
    typeof productOrCategory === "object"
      ? productOrCategory?.category
      : productOrCategory;

  return normalizeCategory(category) === FRAME_VARIANT_CATEGORY;
}

export function normalizeVariantGallery(gallery) {
  if (Array.isArray(gallery)) {
    return gallery.filter((item) => typeof item === "string" && item.trim());
  }

  if (typeof gallery === "string") {
    try {
      const parsedGallery = JSON.parse(gallery);

      return normalizeVariantGallery(parsedGallery);
    } catch {
      return gallery.trim() ? [gallery.trim()] : [];
    }
  }

  return [];
}

export function normalizeProductVariant(variant) {
  if (!variant?.id || !variant?.image_url || !variant?.variant_label) {
    return null;
  }

  return {
    id: String(variant.id),
    product_id: normalizeProductVariantProductId(variant.product_id),
    variant_label: variant.variant_label,
    variant_type: variant.variant_type || PRODUCT_VARIANT_TYPE_PRINT,
    image_url: variant.image_url,
    gallery: normalizeVariantGallery(variant.gallery),
    price_override: variant.price_override || "",
    sku: variant.sku || "",
    is_default: Boolean(variant.is_default),
  };
}

export function normalizeProductVariants(variants = []) {
  return variants.map(normalizeProductVariant).filter(Boolean);
}

export function getDefaultVariant(variants = []) {
  const normalizedVariants = normalizeProductVariants(variants);

  return (
    normalizedVariants.find((variant) => variant.is_default) ||
    normalizedVariants[0] ||
    null
  );
}

export function getVariantPrice(product, variant) {
  return variant?.price_override || product?.price || "";
}

export function getVariantGalleryImages(product, variant) {
  if (!variant) {
    return Array.isArray(product?.gallery_images) ? product.gallery_images : [];
  }

  return normalizeVariantGallery(variant.gallery);
}

export function getCartItemKey(item) {
  const productId = item?.id ?? item?.product_id ?? "";
  const variantId = item?.variant_id ?? item?.variant?.id ?? "default";

  return `${productId}::${variantId || "default"}`;
}

export function getCartVariantLabel(item) {
  return (
    item?.variant_label ||
    item?.selectedVariant?.variant_label ||
    item?.variant?.variant_label ||
    ""
  );
}
