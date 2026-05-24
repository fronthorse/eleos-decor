import { CONSULTATION_STEPS, DEFAULT_ASSISTANT_MEMORY } from "./assistantConfig";

export const ROOM_MATCHERS = [
  {
    key: "living room",
    label: "Living room",
    terms: ["living room", "sitting room", "lounge", "parlor", "parlour"],
  },
  {
    key: "bedroom",
    label: "Bedroom",
    terms: ["bedroom", "bed room", "master room"],
  },
  {
    key: "dining area",
    label: "Dining area",
    terms: ["dining area", "dining room", "dining", "dinning", "dinning area", "dinning room"],
  },
  {
    key: "tv console",
    label: "TV console",
    terms: ["tv console", "television console", "media console"],
  },
  {
    key: "office",
    label: "Office",
    terms: ["office", "workspace", "work space", "study"],
  },
  {
    key: "entryway",
    label: "Entryway",
    terms: ["entryway", "entrance", "foyer"],
  },
  {
    key: "hallway",
    label: "Hallway",
    terms: ["hallway", "corridor"],
  },
  {
    key: "kitchen",
    label: "Kitchen",
    terms: ["kitchen"],
  },
  {
    key: "apartment",
    label: "Apartment",
    terms: ["apartment", "flat"],
  },
  {
    key: "home",
    label: "Home",
    terms: ["home", "house"],
  },
];

export const STYLE_MATCHERS = [
  "warm & elegant",
  "warm and elegant",
  "luxury",
  "modern",
  "minimal",
  "cozy",
  "classy",
  "warm",
  "simple",
  "elegant",
];

const CATEGORY_MATCHERS = [
  ["dining sets", ["dining set", "dining sets", "dining table", "dining chair", "dinning set", "dinning sets", "dinning table"]],
  ["clocks", ["clock", "clocks", "wall clock", "wall clocks"]],
  ["frames", ["frame", "frames", "wall frame", "wall frames", "photo frame", "photo frames", "picture frame", "picture frames", "wall art", "artwork"]],
  ["plants", ["plant", "plants", "artificial plant", "faux plant"]],
  ["flowers", ["flower", "flowers", "vase flower", "vase flowers", "vase", "bouquet"]],
  ["mirrors", ["mirror", "mirrors", "wall mirror", "wall mirrors"]],
  ["rugs", ["rug", "rugs", "carpet", "carpets"]],
  ["lights", ["light", "lights", "lamp", "lamps", "lighting"]],
  ["diffusers", ["diffuser", "diffusers", "scent", "scents", "home scent", "fragrance", "fragrances"]],
  ["humidifiers", ["humidifier", "humidifiers"]],
  ["candles", ["candle", "candles"]],
  ["throw pillows", ["throw pillow", "throw pillows", "pillow", "cushion"]],
  ["throw blankets", ["throw blanket", "throw blankets", "blanket"]],
  ["bedsheets", ["bedsheet", "bedsheets", "bed sheet"]],
  ["figurines", ["figurine", "figurines", "ornament", "ornaments", "sculpture"]],
  ["tables", ["table", "tables", "center table", "coffee table", "side table", "console table"]],
  ["faux books", ["faux book", "faux books", "decorative books"]],
  ["water fountains", ["water fountain", "water fountains", "fountain"]],
  ["decor accessories", ["decor accessory", "decor accessories", "accessory", "accessories"]],
];

const COLOR_MATCHERS = [
  "neutral",
  "cream",
  "white",
  "black",
  "gold",
  "beige",
  "brown",
  "green",
  "grey",
  "gray",
  "earth tone",
  "earth tones",
  "warm tone",
  "warm tones",
];

const ROOM_SIZE_MATCHERS = ["small", "compact", "medium", "large", "spacious"];
const SPACE_TYPE_MATCHERS = ["apartment", "flat", "home", "house", "office"];
const OVERRIDE_TERMS = ["actually", "instead", "change", "make it", "switch to", "my budget is now", "budget is now"];

export function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function includesTerm(text, term) {
  const normalizedTerm = normalizeText(term);
  return normalizedTerm
    ? new RegExp(`(^|\\s)${normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`).test(text)
    : false;
}

export function getRoomLabel(room) {
  return ROOM_MATCHERS.find((matcher) => matcher.key === room)?.label || room || "";
}

export function detectRoom(message) {
  const text = normalizeText(message);
  const matches = ROOM_MATCHERS.filter((room) =>
    room.terms.some((term) => includesTerm(text, term))
  );
  const specific = matches.find((room) => !["home", "apartment"].includes(room.key));
  return specific?.key || matches[0]?.key || "";
}

export function detectStyle(message) {
  const text = normalizeText(message);
  const matched = STYLE_MATCHERS.filter((style) => includesTerm(text, style));

  if (matched.includes("warm and elegant")) {
    return "warm & elegant";
  }

  if (matched.includes("warm & elegant")) {
    return "warm & elegant";
  }

  return matched.find((style) => !["warm", "elegant"].includes(style)) || matched[0] || "";
}

export function detectBudget(message) {
  const raw = String(message || "").toLowerCase();
  const text = raw.replace(/,/g, "");
  const match = text.match(/(?:\u20a6|ngn|naira)?\s*(\d+(?:\.\d+)?)\s*(k|m|million|thousand)?/i);

  if (!match) {
    return { amount: null, label: "" };
  }

  let amount = Number(match[1]);
  const suffix = match[2] || "";

  if (!Number.isFinite(amount)) {
    return { amount: null, label: "" };
  }

  if (suffix === "k" || suffix === "thousand") {
    amount *= 1000;
  }

  if (suffix === "m" || suffix === "million") {
    amount *= 1000000;
  }

  if (amount < 1000 && !suffix) {
    return { amount: null, label: "" };
  }

  return {
    amount,
    label: formatBudget(amount),
  };
}

export function formatBudget(amount) {
  if (!amount) {
    return "";
  }

  if (amount >= 1000000) {
    const value = amount / 1000000;
    return `\u20a6${Number.isInteger(value) ? value : value.toFixed(1)}m`;
  }

  if (amount >= 1000) {
    return `\u20a6${Math.round(amount / 1000)}k`;
  }

  return `\u20a6${amount}`;
}

export function detectCategories(message) {
  const text = normalizeText(message);
  return unique(
    CATEGORY_MATCHERS.filter(([, terms]) => terms.some((term) => includesTerm(text, term))).map(
      ([category]) => category
    )
  );
}

function detectFromList(message, values) {
  const text = normalizeText(message);
  return values.find((value) => includesTerm(text, value)) || "";
}

export function hasOverrideIntent(message) {
  const text = normalizeText(message);
  return OVERRIDE_TERMS.some((term) => text.includes(normalizeText(term)));
}

export function extractPreferences(message) {
  const budget = detectBudget(message);

  return {
    room: detectRoom(message),
    budget: budget.amount,
    budgetLabel: budget.label,
    style: detectStyle(message),
    categories: detectCategories(message),
    colorPalette: detectFromList(message, COLOR_MATCHERS),
    roomSize: detectFromList(message, ROOM_SIZE_MATCHERS),
    spaceType: detectFromList(message, SPACE_TYPE_MATCHERS),
    hasOverrideIntent: hasOverrideIntent(message),
  };
}

export function mergePreferences(previousMemory, extracted, message) {
  const previous = {
    ...DEFAULT_ASSISTANT_MEMORY,
    ...(previousMemory || {}),
    consultation: {
      ...DEFAULT_ASSISTANT_MEMORY.consultation,
      ...(previousMemory?.consultation || {}),
    },
  };

  return {
    ...previous,
    lastUserMessage: message,
    room: extracted.room || previous.room,
    budget: extracted.budget || previous.budget,
    budgetLabel: extracted.budgetLabel || previous.budgetLabel,
    style: extracted.style || previous.style,
    categories: extracted.categories.length
      ? extracted.hasOverrideIntent
        ? extracted.categories
        : unique([...previous.categories, ...extracted.categories])
      : previous.categories,
    colorPalette: extracted.colorPalette || previous.colorPalette,
    roomSize: extracted.roomSize || previous.roomSize,
    spaceType: extracted.spaceType || previous.spaceType,
  };
}

export function getMissingConsultationStep(memory) {
  if (!memory?.room) {
    return CONSULTATION_STEPS.ROOM;
  }

  if (!memory?.budget) {
    return CONSULTATION_STEPS.BUDGET;
  }

  if (!memory?.style && !memory?.consultation?.hasAskedStyle) {
    return CONSULTATION_STEPS.STYLE;
  }

  return CONSULTATION_STEPS.READY;
}

export function updateConversationMemory(previousMemory, message) {
  const extracted = extractPreferences(message);
  const nextMemory = mergePreferences(previousMemory, extracted, message);

  return {
    memory: nextMemory,
    extracted,
  };
}
