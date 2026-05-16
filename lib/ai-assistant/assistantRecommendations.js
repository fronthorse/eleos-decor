import { searchAssistantProducts } from "./assistantProductSearch";
import { getRoomLabel } from "./assistantMemory";

const ROOM_PLANS = {
  "living room": [
    { label: "Anchor", detail: "Start with a rug or center table to define the sitting area.", keywords: ["rug", "center table", "coffee table"] },
    { label: "Walls", detail: "Add frames, a mirror, or a wall clock for height and polish.", keywords: ["frames", "mirror", "wall clock"] },
    { label: "Soft finish", detail: "Layer plants, flowers, lighting, and scent so the room feels complete.", keywords: ["plants", "flowers", "lamp", "diffuser"] },
  ],
  bedroom: [
    { label: "Calm focal point", detail: "Use mirrors, wall frames, or soft lighting to make the room feel restful.", keywords: ["mirror", "frames", "lamp"] },
    { label: "Bedside styling", detail: "Add flowers, candles, a diffuser, or small ornaments for a finished look.", keywords: ["flowers", "candle", "diffuser", "ornament"] },
  ],
  "dining area": [
    { label: "Dining anchor", detail: "Prioritize the dining set, then build around the wall and tabletop.", keywords: ["dining set", "dining table", "dining chair"] },
    { label: "Atmosphere", detail: "Use a mirror, art, flowers, and warm lighting to make meals feel elevated.", keywords: ["mirror", "frames", "flowers", "light"] },
  ],
  "tv console": [
    { label: "Balanced surface", detail: "Style in low clusters with books, figurines, plants, and scent pieces.", keywords: ["faux books", "figurine", "plant", "diffuser"] },
  ],
  office: [
    { label: "Focused warmth", detail: "Use minimal wall art, greenery, lighting, and a diffuser for a polished workspace.", keywords: ["frames", "plant", "lamp", "diffuser"] },
  ],
  default: [
    { label: "Foundation", detail: "Choose one anchor piece, then add wall decor and final styling accents.", keywords: ["frames", "mirror", "plants", "decor accessories"] },
  ],
};

function formatBudgetSplit(budget) {
  if (!budget) {
    return "";
  }

  const anchor = Math.round(budget * 0.45);
  const wall = Math.round(budget * 0.25);
  const accents = Math.round(budget * 0.2);
  const reserve = Math.round(budget * 0.1);

  return `A smart split: about \u20a6${anchor.toLocaleString()} for anchor pieces, \u20a6${wall.toLocaleString()} for wall styling, \u20a6${accents.toLocaleString()} for accents, and \u20a6${reserve.toLocaleString()} as delivery or adjustment reserve.`;
}

function getPlan(memory) {
  return ROOM_PLANS[memory.room] || ROOM_PLANS.default;
}

export async function buildRecommendation(supabase, memory) {
  const roomLabel = getRoomLabel(memory.room || "space");
  const plan = getPlan(memory);
  const style = memory.style || "balanced";
  const planText = plan
    .map((item) => `${item.label}: ${item.detail}`)
    .join("\n");
  const budgetText = formatBudgetSplit(memory.budget);
  const keywords = [...new Set(plan.flatMap((item) => item.keywords))].slice(0, 8);
  const { products } = await searchAssistantProducts(supabase, keywords, {
    categoryLabel: `${roomLabel.toLowerCase()} decor`,
  });

  return {
    text: `For a ${style} ${roomLabel.toLowerCase()}, I would build the room in layers:\n\n${planText}${
      budgetText ? `\n\n${budgetText}` : ""
    }\n\nHere are product directions that can support that look.`,
    products: products.slice(0, 4),
    ctas: [
      { label: "Browse Shop", href: "/shop" },
      { label: "Continue on WhatsApp", href: "whatsapp" },
    ],
  };
}
