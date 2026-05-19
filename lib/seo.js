export const SITE_URL = "https://eleosdecor.com";
export const SITE_NAME = "Eleos Decor";
export const DEFAULT_SEO_DESCRIPTION =
  "Shop premium home and office decor from Eleos Decor. Discover elegant frames, plants, flowers, mirrors, lights, rugs, tables, diffusers, and decorative accessories with delivery across Nigeria.";
export const DEFAULT_OG_IMAGE = "/eleos-og-image.png";
export const RETURN_POLICY_URL = `${SITE_URL}/return-policy`;
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

function normalizeSeoText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildProductSeoTitle(product) {
  const title = normalizeSeoText(product?.title) || "Decor Product";
  const category = normalizeSeoText(product?.category);

  if (!category || title.toLowerCase().includes(category.toLowerCase())) {
    return `${title} in Nigeria`;
  }

  return `${title} - ${category} Decor in Nigeria`;
}

export function buildProductSeoDescription(product) {
  const title = normalizeSeoText(product?.title) || "this decor piece";
  const category = normalizeSeoText(product?.category);
  const description = normalizeSeoText(product?.description);
  const price = normalizeSeoText(product?.price);
  const categoryPhrase = category ? `${category.toLowerCase()} decor` : "home decor";
  const pricePhrase = price ? ` Price: NGN ${price}.` : "";

  if (description.length >= 85) {
    return normalizeDescription(
      `Shop ${title} from Eleos Decor for ${categoryPhrase} styling in Nigeria. ${description}${pricePhrase}`
    );
  }

  return normalizeDescription(
    `Shop ${title}, a curated ${categoryPhrase} piece from Eleos Decor for warm, elegant homes, apartments, offices, and styled spaces in Nigeria.${pricePhrase}`
  );
}

export function buildProductImageAlt(product, index) {
  const title = normalizeSeoText(product?.title) || "Eleos Decor product";
  const category = normalizeSeoText(product?.category);
  const suffix = Number.isFinite(index) ? ` view ${index + 1}` : "";

  return category
    ? `${title} ${category} decor${suffix} from Eleos Decor`
    : `${title}${suffix} from Eleos Decor`;
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

export function getProductSchemaImages(product) {
  if (!product || typeof product !== "object") {
    return [absoluteUrl(DEFAULT_OG_IMAGE)];
  }

  const images = [
    product.image_url,
    product.image,
    ...(Array.isArray(product.gallery_images) ? product.gallery_images : []),
    ...(Array.isArray(product.gallery) ? product.gallery : []),
  ]
    .filter((image) => typeof image === "string" && image.trim())
    .map((image) => absoluteUrl(image));

  return [...new Set(images)].slice(0, 8);
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

export function getMerchantShippingDetails() {
  return {
    "@type": "OfferShippingDetails",
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "NG",
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 3,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 2,
        maxValue: 7,
        unitCode: "DAY",
      },
    },
  };
}

export function getMerchantReturnPolicy() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "NG",
    returnPolicyCategory:
      "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 7,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
    merchantReturnLink: RETURN_POLICY_URL,
  };
}

export function getProductOfferMerchantSchema() {
  return {
    shippingDetails: getMerchantShippingDetails(),
    hasMerchantReturnPolicy: getMerchantReturnPolicy(),
  };
}

function normalizeReviewRating(rating) {
  const numericRating = Number(rating);

  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    return null;
  }

  return numericRating;
}

function normalizeReviewText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

export function buildProductReviewSchema(reviews = []) {
  const validReviews = (Array.isArray(reviews) ? reviews : [])
    .map((review) => ({
      ...review,
      rating: normalizeReviewRating(review?.rating),
      customer_name: normalizeReviewText(review?.customer_name),
      comment: normalizeReviewText(review?.comment),
    }))
    .filter((review) => review.rating);

  if (!validReviews.length) {
    return {};
  }

  const ratingTotal = validReviews.reduce(
    (total, review) => total + review.rating,
    0
  );
  const averageRating = Number((ratingTotal / validReviews.length).toFixed(1));
  const reviewSchema = validReviews
    .filter((review) => review.comment)
    .slice(0, 5)
    .map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.customer_name || "Customer",
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.comment,
      ...(review.created_at ? { datePublished: review.created_at } : {}),
    }));

  return {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: averageRating,
      reviewCount: validReviews.length,
      bestRating: 5,
      worstRating: 1,
    },
    ...(reviewSchema.length ? { review: reviewSchema } : {}),
  };
}
