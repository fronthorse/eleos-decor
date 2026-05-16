import { detectProductQuery } from "../productSearch";
import { normalizeText } from "./assistantMemory";

const PRODUCT_SEARCH_TERMS = [
  "do you have",
  "do you sell",
  "show me",
  "available",
  "looking for",
  "find",
  "shop",
  "buy",
  "can i get",
];

const CONSULTATION_TERMS = [
  "help me decorate",
  "help me choose decor",
  "help me style",
  "decorate my",
  "style my",
  "decor consultation",
  "pick for me",
];

const STYLING_TERMS = ["ideas for", "recommend for", "what should i put", "style my", "for my"];
const DELIVERY_TERMS = ["deliver", "delivery", "shipping", "waybill", "location"];
const ORDER_TERMS = ["how do i order", "order", "payment", "pay", "checkout", "buy"];
const WHATSAPP_TERMS = ["whatsapp", "human", "agent", "chat with", "call"];
const BUDGET_TERMS = ["budget", "spend", "cost", "price range", "500k", "1m", "naira"];
const DECOR_CONTEXT_TERMS = [
  "decor for",
  "decorate",
  "styling",
  "style",
  "ideas for",
  "what should i put",
  "centerpiece for",
  "centrepiece for",
];
const STRICT_PRODUCT_REQUEST_TERMS = [
  "do you have",
  "do you sell",
  "show me",
  "available",
  "any",
  "looking for",
  "find",
  "can i get",
];

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

export function detectAssistantIntent(message, memory, extracted) {
  const text = normalizeText(message);
  const productQuery = detectProductQuery(message);

  if (includesAny(text, WHATSAPP_TERMS)) {
    return { type: "whatsapp_handoff", productQuery };
  }

  if (includesAny(text, DELIVERY_TERMS)) {
    return { type: "delivery_faq", productQuery };
  }

  if (text.includes("how do i order") || (includesAny(text, ORDER_TERMS) && !productQuery.categories.length)) {
    return { type: "order_faq", productQuery };
  }

  if (
    includesAny(text, DECOR_CONTEXT_TERMS) &&
    !includesAny(text, STRICT_PRODUCT_REQUEST_TERMS)
  ) {
    return { type: "room_styling", productQuery };
  }

  if (
    productQuery.isProductQuery &&
    (productQuery.categories.length > 0 || includesAny(text, PRODUCT_SEARCH_TERMS))
  ) {
    return { type: "product_search", productQuery };
  }

  if (includesAny(text, CONSULTATION_TERMS)) {
    return { type: "decor_consultation", productQuery };
  }

  if (extracted.room && (includesAny(text, STYLING_TERMS) || extracted.categories.length > 0)) {
    return { type: "room_styling", productQuery };
  }

  if (includesAny(text, BUDGET_TERMS) || extracted.budget) {
    return { type: "budget_guidance", productQuery };
  }

  if (extracted.room || extracted.style || extracted.hasOverrideIntent || memory?.room) {
    return { type: "decor_consultation", productQuery };
  }

  return { type: "fallback", productQuery };
}
