import { normalizeAssistantProduct } from "./assistantProductSearch";
import { getRoomLabel } from "./assistantMemory";
import { strictFilterProductsByCategories } from "../productSearch";

const PRODUCT_FIELDS = "id,title,category,description,price,image_url";

const ROOM_PLANS = {
  "living room": [
    {
      label: "Anchor",
      detail: "Start with a rug, table, or sculptural furniture piece so the seating area feels intentional.",
      categories: ["rugs", "tables", "side stools"],
      keywords: ["rug", "carpet", "center table", "coffee table", "side stool"],
    },
    {
      label: "Walls",
      detail: "Add frames, a mirror, or a wall clock for height and polish.",
      categories: ["frames", "mirrors", "clocks"],
      keywords: ["frame", "mirror", "wall clock"],
    },
    {
      label: "Finish",
      detail: "Complete the room with greenery, flowers, warm light, and scent.",
      categories: ["plants", "flowers", "lights", "diffusers", "candles"],
      keywords: ["plant", "flower", "lamp", "diffuser", "candle"],
    },
  ],
  bedroom: [
    {
      label: "Calm focal point",
      detail: "Use soft lighting, frames, or a mirror to make the room restful and finished.",
      categories: ["lights", "frames", "mirrors"],
      keywords: ["lamp", "frame", "mirror"],
    },
    {
      label: "Bedside styling",
      detail: "Layer scent, flowers, candles, and small decorative pieces for warmth.",
      categories: ["diffusers", "flowers", "candles", "figurines"],
      keywords: ["diffuser", "flower", "candle", "ornament"],
    },
  ],
  "dining area": [
    {
      label: "Dining anchor",
      detail: "If dining sets are unavailable, keep the dining area elegant with wall and tabletop styling.",
      categories: ["dining sets"],
      keywords: ["dining set", "dining table", "dining chair"],
    },
    {
      label: "Atmosphere",
      detail: "Use mirrors, frames, flowers, candles, and warm light around the dining zone.",
      categories: ["mirrors", "frames", "flowers", "candles", "lights"],
      keywords: ["mirror", "frame", "flower", "candle", "lamp"],
    },
  ],
  "tv console": [
    {
      label: "Balanced surface",
      detail: "Style in low clusters with books, figurines, plants, lamps, and scent pieces.",
      categories: ["faux books", "figurines", "plants", "lights", "diffusers"],
      keywords: ["faux books", "figurine", "plant", "lamp", "diffuser"],
    },
  ],
  office: [
    {
      label: "Focused warmth",
      detail: "Keep the workspace clean with wall art, greenery, lighting, and a quiet scent.",
      categories: ["frames", "plants", "lights", "diffusers"],
      keywords: ["frame", "plant", "lamp", "diffuser"],
    },
  ],
  entryway: [
    {
      label: "First impression",
      detail: "Use a mirror, flowers, scent, and one sculptural accent for a polished arrival point.",
      categories: ["mirrors", "flowers", "diffusers", "figurines", "tables"],
      keywords: ["mirror", "flower", "diffuser", "ornament", "console table"],
    },
  ],
  hallway: [
    {
      label: "Slim styling",
      detail: "Choose wall-led decor: frames, mirrors, clocks, and soft light where space allows.",
      categories: ["frames", "mirrors", "clocks", "lights"],
      keywords: ["frame", "mirror", "wall clock", "lamp"],
    },
  ],
  apartment: [
    {
      label: "Compact layers",
      detail: "Prioritize pieces that add warmth without crowding the room.",
      categories: ["rugs", "mirrors", "plants", "lights", "diffusers"],
      keywords: ["rug", "mirror", "plant", "lamp", "diffuser"],
    },
  ],
  home: [
    {
      label: "Whole-home polish",
      detail: "Mix one anchor piece with wall decor, greenery, scent, and soft lighting.",
      categories: ["frames", "mirrors", "plants", "flowers", "lights", "diffusers"],
      keywords: ["frame", "mirror", "plant", "flower", "lamp", "diffuser"],
    },
  ],
  default: [
    {
      label: "Balanced decor",
      detail: "Start with wall decor, then add greenery, light, and scent for a premium finish.",
      categories: ["frames", "mirrors", "plants", "lights", "diffusers"],
      keywords: ["frame", "mirror", "plant", "lamp", "diffuser"],
    },
  ],
};

const STYLE_KEYWORDS = {
  luxury: ["gold", "mirror", "sculpture", "ornament", "elegant"],
  modern: ["modern", "minimal", "black", "neutral", "clean"],
  minimal: ["minimal", "neutral", "simple", "clean"],
  cozy: ["warm", "soft", "candle", "diffuser", "rug"],
  classy: ["elegant", "mirror", "gold", "frame"],
  elegant: ["elegant", "gold", "mirror", "frame"],
};

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function parsePrice(value) {
  const price = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(price) ? price : 0;
}

function formatNaira(amount) {
  return `\u20a6${Math.round(amount).toLocaleString()}`;
}

function formatBudgetSplit(budget, hasProducts) {
  if (!budget) {
    return "";
  }

  const anchor = Math.round(budget * 0.45);
  const wall = Math.round(budget * 0.25);
  const accents = Math.round(budget * 0.2);
  const reserve = Math.round(budget * 0.1);
  const base = `For the budget, I would reserve about ${formatNaira(anchor)} for the main pieces, ${formatNaira(wall)} for wall styling, ${formatNaira(accents)} for accents, and ${formatNaira(reserve)} for delivery or adjustments.`;

  if (hasProducts) {
    return base;
  }

  return `${base} If the full look runs above budget, phase it: anchor piece first, wall styling second, scent/flowers last.`;
}

function getPlan(memory) {
  return ROOM_PLANS[memory.room] || ROOM_PLANS.default;
}

function productText(product) {
  return normalizeText([product.title, product.category, product.description].join(" "));
}

function scoreProduct(product, memory, planCategories, planKeywords) {
  const text = productText(product);
  const category = normalizeText(product.category);
  const styleTerms = STYLE_KEYWORDS[normalizeText(memory.style)] || [];
  let score = 0;

  if (planCategories.some((item) => category.includes(item.replace(/s$/, "")))) {
    score += 5;
  }

  score += planKeywords.filter((keyword) => text.includes(keyword)).length * 3;
  score += styleTerms.filter((keyword) => text.includes(keyword)).length * 2;

  if (memory.budget) {
    const price = parsePrice(product.price);

    if (price && price <= memory.budget) {
      score += 3;
    } else if (price && price > memory.budget) {
      score -= 5;
    }
  }

  return score;
}

async function fetchRecommendationProducts(supabase, memory, plan) {
  const planCategories = unique(plan.flatMap((item) => item.categories));
  const planKeywords = unique(plan.flatMap((item) => item.keywords));
  const keywordFilter = planKeywords
    .flatMap((keyword) => [
      `title.ilike.%${keyword}%`,
      `category.ilike.%${keyword}%`,
      `description.ilike.%${keyword}%`,
    ])
    .join(",");
  let query = supabase.from("products").select(PRODUCT_FIELDS);

  if (keywordFilter) {
    query = query.or(keywordFilter);
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(36);

  if (error) {
    throw error;
  }

  const strictProducts = strictFilterProductsByCategories(data || [], planCategories);

  return strictProducts
    .map((product) => ({
      ...product,
      assistantScore: scoreProduct(product, memory, planCategories, planKeywords),
      assistantReason: buildProductReason(product, memory),
    }))
    .filter((product) => product.assistantScore > 0)
    .sort((first, second) => second.assistantScore - first.assistantScore);
}

function buildProductReason(product, memory) {
  const category = product?.category || "decor";
  const room = getRoomLabel(memory.room || "space").toLowerCase();
  const price = parsePrice(product?.price);

  if (memory.budget && price && price <= memory.budget) {
    return `Fits the ${room} direction and stays within your ${memory.budgetLabel} budget.`;
  }

  if (memory.style) {
    return `Works with a ${memory.style} ${room} plan from the current catalogue.`;
  }

  return `A relevant ${String(category).toLowerCase()} choice for the ${room}.`;
}

function selectBudgetedProducts(products, budget) {
  if (!budget) {
    return products.slice(0, 4);
  }

  const selected = [];
  let total = 0;

  for (const product of products) {
    const price = parsePrice(product.price);

    if (!price || total + price <= budget || selected.length === 0) {
      selected.push(product);
      total += price || 0;
    }

    if (selected.length >= 4) {
      break;
    }
  }

  return selected;
}

export async function buildRecommendation(supabase, memory) {
  const roomLabel = getRoomLabel(memory.room || "home");
  const plan = getPlan(memory);
  const style = memory.style || "balanced";
  const planText = plan.map((item) => `${item.label}: ${item.detail}`).join("\n");
  const candidates = await fetchRecommendationProducts(supabase, memory, plan);
  const selectedProducts = selectBudgetedProducts(candidates, memory.budget);
  const budgetText = formatBudgetSplit(memory.budget, selectedProducts.length > 0);
  const productIntro = selectedProducts.length
    ? "The cards below are actual available Eleos Decor products that support this direction."
    : "I don't see enough exact product matches for this full direction right now, so I would use this as a phased styling brief and confirm options on WhatsApp.";

  return {
    text: `For a ${style} ${roomLabel.toLowerCase()}, I would keep it focused:\n\n${planText}${
      budgetText ? `\n\n${budgetText}` : ""
    }\n\n${productIntro}`,
    products: selectedProducts.map(normalizeAssistantProduct),
    ctas: [
      { label: "Browse Shop", href: "/shop" },
      { label: "Continue on WhatsApp", href: "whatsapp" },
    ],
  };
}
