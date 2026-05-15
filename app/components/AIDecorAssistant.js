"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BsStars } from "react-icons/bs";
import { FaWhatsapp } from "react-icons/fa";
import { IoClose, IoSend } from "react-icons/io5";
import { createClient } from "../../lib/supabase/client";
import {
  detectProductQuery,
  formatProductResults,
  searchProductsByKeywords,
} from "../../lib/productSearch";
import { PRODUCT_IMAGE_FALLBACK } from "../../lib/productImages";
import { useAIDecorChatPersistence } from "../../hooks/useAIDecorChatPersistence";

const WHATSAPP_URL =
  "https://wa.me/2348168350533?text=Hello%20Eleos%20Decor%2C%20I%20would%20like%20help%20with%20decor%20and%20ordering.";

const quickActions = [
  "Browse products",
  "Help me choose decor",
  "Delivery information",
  "How to order",
  "Chat on WhatsApp",
];

const CONSULTATION_STEPS = {
  IDLE: "idle",
  STYLE: "style",
  ROOM: "room",
  BUDGET: "budget",
  COMPLETE: "complete",
};

const consultationStyleOptions = [
  "Modern",
  "Luxury",
  "Minimal",
  "Cozy",
  "Warm & Elegant",
  "Surprise me",
];

const consultationRoomOptions = [
  "Living room",
  "Bedroom",
  "Dining area",
  "TV console",
  "Office",
];

const consultationBudgetOptions = [
  "Under \u20a6100k",
  "\u20a6100k - \u20a6300k",
  "\u20a6300k - \u20a6700k",
  "\u20a6700k+",
];

const defaultConsultation = {
  currentStep: CONSULTATION_STEPS.IDLE,
  selectedStyle: "",
  selectedRoom: "",
  selectedRooms: [],
  selectedBudget: "",
  selectedBudgetLabel: "",
  selectedBudgetAmount: null,
  mentionedCategories: [],
  hasAskedStyle: false,
};

const initialAssistantMemory = {
  lastUserMessage: "",
  spaces: [],
  budget: null,
  styles: [],
  consultation: defaultConsultation,
};

const welcomeMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi, I'm your Eleos Decor assistant. I can help you find decor pieces, suggest styling ideas, explain delivery, or guide you to place an order.",
};

function handleProductImageError(event) {
  if (event.currentTarget.src.includes(PRODUCT_IMAGE_FALLBACK)) {
    return;
  }

  event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
}

const spaceMatchers = [
  {
    key: "living room",
    label: "Living room",
    terms: ["living room", "sitting room", "lounge", "parlor", "parlour"],
    categories: [
      "Statement wall frames",
      "A quality rug",
      "Artificial plants",
      "Decorative lights",
      "Throw pillows",
      "Center table accessories",
    ],
    weight: 45,
  },
  {
    key: "dining area",
    label: "Dining area",
    terms: ["dining area", "dining room", "dining", "dinner area"],
    categories: [
      "Wall art or mirror",
      "Artificial flowers",
      "Table centerpiece",
      "Decorative vase",
      "Warm lighting",
    ],
    weight: 30,
  },
  {
    key: "tv console",
    label: "TV console styling",
    terms: ["tv console", "television console", "media console", "console"],
    categories: [
      "Figurines",
      "Faux books",
      "Small plants",
      "Scented candles",
      "Decorative trays",
      "Table ornaments",
    ],
    weight: 15,
  },
  {
    key: "bedroom",
    label: "Bedroom",
    terms: ["bedroom", "bed room", "master room"],
    categories: [
      "Scented candles",
      "Mirrors",
      "Flowers",
      "Wall frames",
      "Soft decorative lights",
      "Bedside ornaments",
    ],
    weight: 30,
  },
  {
    key: "office",
    label: "Office",
    terms: ["office", "workspace", "work space", "study"],
    categories: [
      "Table plants",
      "Wall frames",
      "Diffusers",
      "Minimalist ornaments",
    ],
    weight: 25,
  },
  {
    key: "entryway",
    label: "Entryway",
    terms: ["entryway", "entrance", "foyer"],
    categories: ["Mirror", "Console ornaments", "Decorative vase", "Wall frames"],
    weight: 15,
  },
  {
    key: "hallway",
    label: "Hallway",
    terms: ["hallway", "corridor"],
    categories: ["Wall frames", "Mirrors", "Decorative lights", "Small plants"],
    weight: 15,
  },
  {
    key: "kitchen",
    label: "Kitchen",
    terms: ["kitchen"],
    categories: ["Small plants", "Wall clock", "Diffuser", "Simple ornaments"],
    weight: 15,
  },
  {
    key: "apartment",
    label: "Apartment",
    terms: ["apartment", "flat"],
    categories: ["Rugs", "Mirrors", "Plants", "Frames", "Diffusers", "Lighting"],
    weight: 40,
  },
  {
    key: "home",
    label: "Home",
    terms: ["home", "house"],
    categories: ["Frames", "Plants", "Mirrors", "Flowers", "Diffusers", "Lighting"],
    weight: 40,
  },
];

const styleMatchers = [
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

const productCategoryMatchers = [
  {
    key: "frames",
    terms: ["frame", "frames", "wall art", "artwork"],
  },
  {
    key: "plants",
    terms: ["plant", "plants", "artificial plant", "faux plant"],
  },
  {
    key: "flowers",
    terms: ["flower", "flowers", "vase", "bouquet"],
  },
  {
    key: "mirrors",
    terms: ["mirror", "mirrors"],
  },
  {
    key: "rugs",
    terms: ["rug", "rugs", "carpet"],
  },
  {
    key: "lights",
    terms: ["light", "lights", "lamp", "lighting"],
  },
  {
    key: "diffusers",
    terms: ["diffuser", "diffusers", "scent", "fragrance"],
  },
  {
    key: "candles",
    terms: ["candle", "candles", "scented candle"],
  },
  {
    key: "clocks",
    terms: ["clock", "clocks", "wall clock"],
  },
  {
    key: "figurines",
    terms: ["figurine", "figurines", "ornament", "ornaments", "sculpture"],
  },
  {
    key: "tables",
    terms: ["table", "tables", "center table", "console table"],
  },
  {
    key: "faux books",
    terms: ["faux book", "faux books", "decorative books"],
  },
];

const preferenceUpdateTerms = [
  "actually",
  "instead",
  "change it to",
  "change the",
  "make it",
  "make that",
  "i prefer",
  "not that",
  "switch to",
  "use",
  "update",
  "let's do",
  "lets do",
  "go with",
  "my budget is now",
];

function uniqueValues(values) {
  return [...new Set(values)];
}

function detectSpaces(message) {
  const value = message.toLowerCase();
  const detected = spaceMatchers
    .filter((space) => space.terms.some((term) => value.includes(term)))
    .map((space) => space.key);

  const specificSpaces = detected.filter(
    (space) => space !== "home" && space !== "apartment"
  );

  return specificSpaces.length > 0 ? specificSpaces : detected;
}

function detectStyles(message) {
  const value = message.toLowerCase();
  const normalizedValue = normalizeText(value);
  const detected = styleMatchers.filter((style) =>
    normalizedValue.includes(normalizeText(style))
  );
  const hasWarmElegant =
    detected.includes("warm & elegant") || detected.includes("warm and elegant");

  if (
    detected.includes("warm and elegant") &&
    !detected.includes("warm & elegant")
  ) {
    detected.push("warm & elegant");
  }

  return uniqueValues(
    detected
      .filter((style) => style !== "warm and elegant")
      .filter((style) => {
        if (hasWarmElegant && ["warm", "elegant"].includes(style)) {
          return false;
        }

        return true;
      })
  );
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getConsultation(memory) {
  return {
    ...defaultConsultation,
    ...(memory?.consultation || {}),
  };
}

function updateConsultation(memory, updates) {
  return {
    ...memory,
    consultation: {
      ...getConsultation(memory),
      ...updates,
    },
  };
}

function getSpaceDisplayLabel(spaceKey) {
  if (spaceKey === "tv console") {
    return "TV console";
  }

  return getSpaceDetails(spaceKey)?.label || spaceKey;
}

function formatList(items) {
  const cleanItems = items.filter(Boolean);

  if (cleanItems.length <= 1) {
    return cleanItems.join("");
  }

  if (cleanItems.length === 2) {
    return cleanItems.join(" and ");
  }

  return `${cleanItems.slice(0, -1).join(", ")}, and ${
    cleanItems[cleanItems.length - 1]
  }`;
}

function formatRoomList(roomKeys) {
  return formatList(roomKeys.map((room) => getSpaceDisplayLabel(room).toLowerCase()));
}

function detectMentionedCategories(message) {
  const value = normalizeText(message);

  return productCategoryMatchers
    .filter((category) =>
      category.terms.some((term) => value.includes(normalizeText(term)))
    )
    .map((category) => category.key);
}

function hasPreferenceUpdateIntent(message) {
  const value = normalizeText(message);

  return preferenceUpdateTerms.some((term) => value.includes(normalizeText(term)));
}

function shouldReplacePreference(message) {
  const value = normalizeText(message);

  return (
    value.includes("instead") ||
    value.includes("not that") ||
    value.includes("change it to") ||
    value.includes("change the") ||
    value.includes("switch to") ||
    value.includes("make it") ||
    value.includes("make that") ||
    value.includes("my budget is now")
  );
}

function isAffirmativeDecorReply(message) {
  const value = normalizeText(message);

  return [
    "yes",
    "yes help me pick",
    "sure",
    "okay",
    "ok",
    "recommend for me",
    "help me choose",
    "pick for me",
    "help me style",
    "help me pick",
  ].some((term) => value === term || value.includes(term));
}

function isDecorConsultationRequest(message) {
  const value = normalizeText(message);

  return [
    "help me choose decor",
    "help me decorate",
    "help me style",
    "recommend decor",
    "pick decor",
    "choose decor",
    "style my",
    "decor consultation",
  ].some((term) => value.includes(term));
}

function findOptionMatch(message, options) {
  const value = normalizeText(message);

  return options.find((option) => {
    const normalizedOption = normalizeText(option);
    return value === normalizedOption || value.includes(normalizedOption);
  });
}

function getRoomRecommendationCategories(room) {
  if (Array.isArray(room)) {
    return uniqueValues(room.flatMap((space) => getRoomRecommendationCategories(space)));
  }

  const space = getSpaceDetails(normalizeText(room));

  if (space) {
    return space.categories;
  }

  const roomValue = normalizeText(room);

  if (roomValue.includes("living")) {
    return getSpaceDetails("living room")?.categories || [];
  }

  if (roomValue.includes("bedroom")) {
    return getSpaceDetails("bedroom")?.categories || [];
  }

  if (roomValue.includes("dining")) {
    return getSpaceDetails("dining area")?.categories || [];
  }

  if (roomValue.includes("console") || roomValue.includes("tv")) {
    return getSpaceDetails("tv console")?.categories || [];
  }

  if (roomValue.includes("office")) {
    return getSpaceDetails("office")?.categories || [];
  }

  return ["Wall frames", "Artificial plants", "Decorative lights", "Diffusers"];
}

function getConsultationSearchKeywords(style, room, categories, mentionedCategories = []) {
  const categoryKeywords = categories.flatMap((category) =>
    normalizeText(category)
      .split(" ")
      .filter((word) => word.length > 3)
  );
  const rooms = Array.isArray(room) ? room : [room];

  return uniqueValues([
    style,
    ...rooms,
    ...categories,
    ...mentionedCategories,
    ...categoryKeywords,
  ]);
}

function buildConsultationPrompt(step, memory = initialAssistantMemory) {
  const consultation = getConsultation(memory);
  const rooms = getConsultationRooms(consultation);
  const roomText = rooms.length > 0 ? formatRoomList(rooms) : "";
  const budgetText =
    consultation.selectedBudgetLabel ||
    consultation.selectedBudget ||
    (memory.budget ? formatNairaAmount(memory.budget) : "");

  if (step === CONSULTATION_STEPS.STYLE) {
    const knownText =
      roomText && budgetText
        ? `I'll use your ${budgetText} budget for the ${roomText}. `
        : "";

    return {
      text: `Great \u2728 ${knownText}What style should I focus on?`,
      options: consultationStyleOptions,
    };
  }

  if (step === CONSULTATION_STEPS.ROOM) {
    return {
      text: "What space are you decorating?",
      options: consultationRoomOptions,
    };
  }

  return {
    text: "What budget range are you working with?",
    options: consultationBudgetOptions,
  };
}

function detectBudget(message) {
  const value = message.toLowerCase();
  const shorthandMatch = value.match(/(?:₦\s*)?(\d+(?:\.\d+)?)\s*([mk])\b/);

  if (shorthandMatch) {
    const amount = Number.parseFloat(shorthandMatch[1]);
    const multiplier = shorthandMatch[2] === "m" ? 1000000 : 1000;
    return Math.round(amount * multiplier);
  }

  const amountMatch = value.match(
    /(?:₦|ngn)?\s*(\d{1,3}(?:,\d{3})+|\d{5,})(?:\s*(?:naira|n))?/
  );

  if (!amountMatch) {
    return null;
  }

  return Number.parseInt(amountMatch[1].replace(/,/g, ""), 10);
}

function formatNaira(amount) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

function detectBudgetAmount(message) {
  const value = message.toLowerCase();
  const shorthandMatch = value.match(
    /(?:\u20a6|â‚¦|ngn)?\s*(\d+(?:\.\d+)?)\s*([mk])\b/
  );

  if (shorthandMatch) {
    const amount = Number.parseFloat(shorthandMatch[1]);
    const multiplier = shorthandMatch[2] === "m" ? 1000000 : 1000;
    return Math.round(amount * multiplier);
  }

  const millionMatch = value.match(
    /(?:\u20a6|â‚¦|ngn)?\s*(\d+(?:\.\d+)?)\s*(?:million|mill?)(?:\s*(?:naira|n))?/
  );

  if (millionMatch) {
    return Math.round(Number.parseFloat(millionMatch[1]) * 1000000);
  }

  const amountMatch = value.match(
    /(?:\u20a6|â‚¦|ngn)?\s*(\d{1,3}(?:,\d{3})+|\d{5,})(?:\s*(?:naira|n))?/
  );

  if (!amountMatch) {
    return null;
  }

  return Number.parseInt(amountMatch[1].replace(/,/g, ""), 10);
}

function formatNairaAmount(amount) {
  return `\u20a6${amount.toLocaleString("en-NG")}`;
}

function extractBudgetLabel(message) {
  const optionMatch = findOptionMatch(message, consultationBudgetOptions);
  const amount = detectBudgetAmount(message);

  if (amount) {
    return formatNairaAmount(amount);
  }

  return optionMatch || "";
}

function extractPreferencesFromText(text) {
  const value = String(text || "");
  const normalizedValue = normalizeText(value);
  const beforeInsteadOf = value.split(/\binstead of\b/i)[0];
  const detectedRooms = detectSpaces(
    normalizedValue.includes("instead of") ? beforeInsteadOf : value
  );
  const budget = detectBudgetAmount(value);
  const budgetLabel = extractBudgetLabel(value);
  const optionStyle = findOptionMatch(value, consultationStyleOptions);
  const detectedStyles = detectStyles(value).filter((style) => {
    const normalizedStyle = normalizeText(style);

    return !normalizedValue.includes(`not ${normalizedStyle}`);
  });
  const selectedStyle =
    optionStyle ||
    (normalizedValue.includes("surprise me") ? "Surprise me" : "") ||
    (detectedStyles.length > 0
      ? detectedStyles[detectedStyles.length - 1]
      : "");

  return {
    rooms: detectedRooms,
    selectedStyle,
    styles: detectedStyles,
    budget,
    budgetLabel,
    mentionedCategories: detectMentionedCategories(value),
    hasUpdateIntent: hasPreferenceUpdateIntent(value),
    shouldReplace: shouldReplacePreference(value),
    isSurpriseStyle: normalizeText(selectedStyle) === "surprise me",
  };
}

function getConsultationRooms(consultation) {
  if (Array.isArray(consultation.selectedRooms)) {
    return consultation.selectedRooms;
  }

  return detectSpaces(consultation.selectedRoom || "");
}

function mergePreferences(existingPreferences, extractedPreferences, options = {}) {
  const existingConsultation = getConsultation(existingPreferences);
  const existingRooms = uniqueValues([
    ...(existingPreferences?.spaces || []),
    ...getConsultationRooms(existingConsultation),
  ]);
  const shouldReplaceRooms =
    options.replaceRooms ||
    (extractedPreferences.shouldReplace && extractedPreferences.rooms.length > 0);
  const nextRooms =
    extractedPreferences.rooms.length === 0
      ? existingRooms
      : shouldReplaceRooms
      ? extractedPreferences.rooms
      : uniqueValues([...existingRooms, ...extractedPreferences.rooms]);
  const nextBudget =
    extractedPreferences.budget ||
    existingPreferences?.budget ||
    existingConsultation.selectedBudgetAmount ||
    null;
  const nextBudgetLabel =
    extractedPreferences.budgetLabel ||
    existingConsultation.selectedBudgetLabel ||
    existingConsultation.selectedBudget ||
    (nextBudget ? formatNairaAmount(nextBudget) : "");
  const nextStyle =
    extractedPreferences.selectedStyle ||
    existingConsultation.selectedStyle ||
    existingPreferences?.styles?.[existingPreferences.styles.length - 1] ||
    "";
  const nextStyles =
    extractedPreferences.selectedStyle && extractedPreferences.selectedStyle !== "Surprise me"
      ? [extractedPreferences.selectedStyle]
      : uniqueValues([
          ...(existingPreferences?.styles || []),
          ...extractedPreferences.styles,
        ]);
  const mentionedCategories = uniqueValues([
    ...(existingConsultation.mentionedCategories || []),
    ...extractedPreferences.mentionedCategories,
  ]);

  return {
    ...existingPreferences,
    spaces: nextRooms,
    budget: nextBudget,
    styles: nextStyles,
    consultation: {
      ...existingConsultation,
      selectedStyle: nextStyle,
      selectedRoom: nextRooms.map(getSpaceDisplayLabel).join(", "),
      selectedRooms: nextRooms,
      selectedBudget: nextBudgetLabel,
      selectedBudgetLabel: nextBudgetLabel,
      selectedBudgetAmount: nextBudget,
      mentionedCategories,
    },
  };
}

function buildConversationPreferences(messages, existingPreferences, currentMessage = "") {
  const recentUserMessages = (messages || [])
    .filter((message) => message.role === "user")
    .slice(-12)
    .map((message) => message.text);

  return [...recentUserMessages, currentMessage].reduce(
    (memory, text) => mergePreferences(memory, extractPreferencesFromText(text)),
    existingPreferences || initialAssistantMemory
  );
}

function getBudgetTier(budget) {
  if (!budget) {
    return "unknown";
  }

  if (budget >= 800000) {
    return "premium";
  }

  if (budget >= 300000) {
    return "balanced";
  }

  return "essential";
}

function getBudgetTone(budget) {
  const tier = getBudgetTier(budget);

  if (tier === "premium") {
    return "a premium but balanced styling plan";
  }

  if (tier === "balanced") {
    return "a balanced styling plan that prioritizes the pieces people notice first";
  }

  if (tier === "essential") {
    return "an essentials-first plan so the space feels intentional without overspending";
  }

  return "a thoughtful styling plan";
}

function getSpaceDetails(spaceKey) {
  return spaceMatchers.find((space) => space.key === spaceKey);
}

function buildBudgetSplit(spaces, budget) {
  const selectedSpaces = spaces.map(getSpaceDetails).filter(Boolean);

  if (!budget || selectedSpaces.length === 0) {
    return [];
  }

  const finishingWeight = selectedSpaces.length > 1 ? 10 : 15;
  const totalWeight =
    selectedSpaces.reduce((sum, space) => sum + space.weight, 0) +
    finishingWeight;

  const split = selectedSpaces.map((space) => ({
    label: space.label,
    amount: Math.round((budget * space.weight) / totalWeight / 5000) * 5000,
  }));

  const allocated = split.reduce((sum, item) => sum + item.amount, 0);

  split.push({
    label: "Finishing touches",
    amount: Math.max(0, budget - allocated),
  });

  return split;
}

function buildCategoryList(categories) {
  return categories
    .slice(0, 6)
    .map((category) => `- ${category}`)
    .join("\n");
}

function getMissingConsultationStep(memory) {
  const consultation = getConsultation(memory);
  const rooms = getConsultationRooms(consultation);

  if (rooms.length === 0) {
    return CONSULTATION_STEPS.ROOM;
  }

  if (!consultation.selectedBudgetLabel && !consultation.selectedBudget && !memory.budget) {
    return CONSULTATION_STEPS.BUDGET;
  }

  if (!consultation.selectedStyle && !consultation.hasAskedStyle) {
    return CONSULTATION_STEPS.STYLE;
  }

  return CONSULTATION_STEPS.COMPLETE;
}

function buildPreferenceUpdateConfirmation(extractedPreferences) {
  if (!extractedPreferences.hasUpdateIntent) {
    return "";
  }

  if (extractedPreferences.budget) {
    return `Got it \u2728 I'll update the budget to ${formatNairaAmount(
      extractedPreferences.budget
    )}.`;
  }

  if (extractedPreferences.rooms.length > 0) {
    return `Perfect, I'll focus on ${formatRoomList(
      extractedPreferences.rooms
    )} decor instead.`;
  }

  if (extractedPreferences.selectedStyle) {
    return `Noted \u2728 I'll use a ${extractedPreferences.selectedStyle.toLowerCase()} style for your recommendations.`;
  }

  return "Got it \u2728 I'll update that for your recommendations.";
}

function prependConfirmation(reply, confirmation) {
  if (!confirmation) {
    return reply;
  }

  return {
    ...reply,
    text: `${confirmation}\n\n${reply.text}`,
  };
}

function createMemoryUpdate(message, previousMemory) {
  const detectedBudget = detectBudgetAmount(message);

  return {
    lastUserMessage: message,
    spaces: uniqueValues([...previousMemory.spaces, ...detectSpaces(message)]),
    budget: detectedBudget || previousMemory.budget,
    styles: uniqueValues([...previousMemory.styles, ...detectStyles(message)]),
    consultation: getConsultation(previousMemory),
  };
}

function buildRecommendationResponse(memory) {
  const selectedSpaces = memory.spaces.map(getSpaceDetails).filter(Boolean);
  const spaceLabels = selectedSpaces.map((space) => space.label.toLowerCase());
  const styleText =
    memory.styles.length > 0 ? ` with a ${memory.styles.join(", ")} feel` : "";
  const budgetText = memory.budget
    ? ` and a ${formatNairaAmount(memory.budget)} budget`
    : "";

  const spaceSections = selectedSpaces
    .map((space) => `${space.label}:\n${buildCategoryList(space.categories)}`)
    .join("\n\n");

  const budgetSplit = buildBudgetSplit(memory.spaces, memory.budget);
  const splitSection =
    budgetSplit.length > 0
      ? `\n\nSuggested budget split:\n${budgetSplit
          .map((item) => `- ${item.label}: about ${formatNairaAmount(item.amount)}`)
          .join("\n")}`
      : "";

  return {
        text: `For ${formatList(spaceLabels)}${styleText}${budgetText}, I'd suggest ${getBudgetTone(
      memory.budget
    )}:\n\n${spaceSections}${splitSection}\n\nWould you like us to help you pick matching pieces from Eleos Decor?`,
    ctas: [
      {
        label: "Browse Shop",
        href: "/shop",
      },
      {
        label: "Continue on WhatsApp",
        href: WHATSAPP_URL,
      },
    ],
  };
}

async function buildConsultationRecommendation(supabase, memory) {
  const consultation = getConsultation(memory);
  const rooms = getConsultationRooms(consultation);
  const categories = uniqueValues([
    ...getRoomRecommendationCategories(rooms),
    ...(consultation.mentionedCategories || []),
  ]);
  const styleText =
    consultation.selectedStyle && consultation.selectedStyle !== "Surprise me"
      ? consultation.selectedStyle.toLowerCase()
      : "best-fit";
  const roomText = formatRoomList(rooms);
  const budgetText =
    consultation.selectedBudgetLabel ||
    consultation.selectedBudget ||
    (memory.budget ? formatNairaAmount(memory.budget) : "your selected");
  const searchKeywords = getConsultationSearchKeywords(
    styleText,
    rooms,
    categories,
    consultation.mentionedCategories || []
  );

  let products = [];

  try {
    products = await searchProductsByKeywords(supabase, searchKeywords);

    if (products.length === 0) {
      products = await searchProductsByKeywords(supabase, []);
    }
  } catch (error) {
    console.warn("Unable to search consultation products.", error);
  }

  const formattedProducts = formatProductResults(
    products,
    `${styleText} ${roomText} decor`
  );
  const categoryLines = categories
    .slice(0, 5)
    .map((category) => `- ${category}`)
    .join("\n");

  return {
    text: `Perfect \u2728 For ${roomText} with a ${budgetText} budget${
      styleText !== "best-fit" ? ` and a ${styleText} style` : ""
    }, I'd recommend:\n${categoryLines}\n\nThese choices add balance, warmth, and a finished look without making the space feel crowded.\n\nHere are some matching pieces from Eleos Decor:`,
    products: formattedProducts.products,
    ctas: [
      { label: "Browse Shop", href: "/shop" },
      { label: "Continue on WhatsApp", href: WHATSAPP_URL },
    ],
  };
}

function getAssistantReply(message, previousMemory) {
  const value = message.toLowerCase();
  const nextMemory = createMemoryUpdate(message, previousMemory);

  if (
    value.includes("whatsapp") ||
    value.includes("human") ||
    value.includes("chat with us")
  ) {
    return {
      memory: nextMemory,
      reply: {
        text: "I can connect you to Eleos Decor on WhatsApp now.",
        ctas: [{ label: "Continue on WhatsApp", href: WHATSAPP_URL }],
      },
    };
  }

  if (
    value.includes("delivery") ||
    value.includes("deliver") ||
    value.includes("shipping") ||
    value.includes("location")
  ) {
    return {
      memory: nextMemory,
      reply: {
        text: "Eleos Decor offers delivery within Nigeria. Delivery details may depend on your location and selected items. You can confirm the exact delivery cost and timeline during checkout or through WhatsApp.",
        ctas: [{ label: "Ask on WhatsApp", href: WHATSAPP_URL }],
      },
    };
  }

  if (
    value.includes("order") ||
    value.includes("checkout") ||
    value.includes("buy") ||
    value.includes("cart") ||
    value.includes("pay")
  ) {
    return {
      memory: nextMemory,
      reply: {
        text: "To place an order, add your preferred items to cart and proceed through checkout. You can also complete your order through WhatsApp for faster assistance.",
        ctas: [
          { label: "Browse Shop", href: "/shop" },
          { label: "Continue on WhatsApp", href: WHATSAPP_URL },
        ],
      },
    };
  }

  if (
    value.includes("product") ||
    value.includes("browse") ||
    value.includes("shop") ||
    value.includes("catalog") ||
    value.includes("available")
  ) {
    return {
      memory: nextMemory,
      reply: {
        text: "You can explore available decor pieces on the Shop page. Eleos Decor carries frames, plants, mirrors, diffusers, rugs, flowers, ornaments, wall clocks, and more.",
        ctas: [{ label: "Browse Shop", href: "/shop" }],
      },
    };
  }

  if (nextMemory.spaces.length > 0 && nextMemory.budget) {
    return {
      memory: nextMemory,
      reply: buildRecommendationResponse(nextMemory),
    };
  }

  if (detectBudgetAmount(message) && nextMemory.spaces.length === 0) {
    return {
      memory: nextMemory,
      reply: {
        text: `Lovely. I've noted a budget of ${formatNairaAmount(
          nextMemory.budget
        )}. Which space are you decorating: living room, dining area, bedroom, office, TV console, entryway, or a full apartment?`,
      },
    };
  }

  if (nextMemory.spaces.length > 0 && !nextMemory.budget) {
    const spaceList = nextMemory.spaces
      .map((space) => getSpaceDetails(space)?.label.toLowerCase())
      .filter(Boolean)
      .join(", ");

    return {
      memory: nextMemory,
      reply: {
        text: `Beautiful. I can help style the ${spaceList}. What budget should I work with, and do you prefer a modern, minimal, cozy, luxury, warm, or elegant look?`,
      },
    };
  }

  if (
    value.includes("style") ||
    value.includes("styling") ||
    value.includes("choose") ||
    value.includes("recommend") ||
    value.includes("suggest") ||
    value.includes("decor")
  ) {
    return {
      memory: nextMemory,
      reply: {
        text: "I'd be happy to help. Tell me the room you're decorating, your preferred style, and your budget, and I'll suggest suitable Eleos Decor pieces.",
      },
    };
  }

  return {
    memory: nextMemory,
    reply: {
      text: "I'm still learning, but I can help with products, styling ideas, delivery information, and how to order. You can also chat directly with us on WhatsApp.",
      ctas: [{ label: "Chat on WhatsApp", href: WHATSAPP_URL }],
    },
  };
}

export default function AIDecorAssistant() {
  const supabase = useMemo(() => createClient(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([welcomeMessage]);
  const [assistantMemory, setAssistantMemory] = useState(initialAssistantMemory);
  const [isThinking, setIsThinking] = useState(false);
  const messagesRef = useRef(null);

  const panelTitleId = useMemo(() => "eleos-ai-assistant-title", []);
  const defaultMessages = useMemo(() => [welcomeMessage], []);
  const { clearPersistedChat } = useAIDecorChatPersistence({
    messages,
    setMessages,
    preferences: assistantMemory,
    setPreferences: setAssistantMemory,
    isOpen,
    setIsOpen,
    defaultMessages,
    defaultPreferences: initialAssistantMemory,
  });

  useEffect(() => {
    if (!messagesRef.current) {
      return;
    }

    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, isOpen]);

  async function buildAssistantReply(trimmedValue) {
    const extractedPreferences = extractPreferencesFromText(trimmedValue);
    let mergedMemory = buildConversationPreferences(
      messages,
      assistantMemory,
      trimmedValue
    );
    const consultation = getConsultation(mergedMemory);
    const productQuery = detectProductQuery(trimmedValue);
    const shouldPrioritizeProductSearch =
      productQuery.isProductQuery &&
      consultation.currentStep === CONSULTATION_STEPS.IDLE &&
      !isDecorConsultationRequest(trimmedValue) &&
      !isAffirmativeDecorReply(trimmedValue) &&
      !extractedPreferences.hasUpdateIntent;

    if (shouldPrioritizeProductSearch) {
      try {
        const products = await searchProductsByKeywords(
          supabase,
          productQuery.keywords
        );
        const result = formatProductResults(
          products,
          productQuery.categoryLabel
        );

        return {
          memory: mergedMemory,
          reply: {
            text: result.text,
            products: result.products,
            ctas: [
              { label: "View Shop", href: "/shop" },
              { label: "Continue on WhatsApp", href: WHATSAPP_URL },
            ],
          },
        };
      } catch (error) {
        console.warn("Unable to search products for AI assistant.", error);
      }
    }

    const isConsultationFollowUp =
      consultation.currentStep !== CONSULTATION_STEPS.IDLE ||
      isDecorConsultationRequest(trimmedValue) ||
      isAffirmativeDecorReply(trimmedValue) ||
      extractedPreferences.rooms.length > 0 ||
      Boolean(extractedPreferences.budgetLabel) ||
      Boolean(extractedPreferences.selectedStyle) ||
      extractedPreferences.hasUpdateIntent;
    const confirmation = buildPreferenceUpdateConfirmation(extractedPreferences);

    if (isConsultationFollowUp) {
      const nextStep = getMissingConsultationStep(mergedMemory);

      if (nextStep !== CONSULTATION_STEPS.COMPLETE) {
        const updates = {
          currentStep: nextStep,
        };

        if (nextStep === CONSULTATION_STEPS.STYLE) {
          updates.hasAskedStyle = true;
        }

        mergedMemory = updateConsultation(mergedMemory, updates);

        return {
          memory: mergedMemory,
          reply: prependConfirmation(
            buildConsultationPrompt(nextStep, mergedMemory),
            confirmation
          ),
        };
      }

      mergedMemory = updateConsultation(mergedMemory, {
        currentStep: CONSULTATION_STEPS.COMPLETE,
      });

      const reply = await buildConsultationRecommendation(supabase, mergedMemory);

      return {
        memory: mergedMemory,
        reply: prependConfirmation(reply, confirmation),
      };
    }

    if (productQuery.isProductQuery) {
      try {
        const products = await searchProductsByKeywords(
          supabase,
          productQuery.keywords
        );
        const result = formatProductResults(
          products,
          productQuery.categoryLabel
        );

        return {
          memory: mergedMemory,
          reply: {
            text: result.text,
            products: result.products,
            ctas: [
              { label: "View Shop", href: "/shop" },
              { label: "Continue on WhatsApp", href: WHATSAPP_URL },
            ],
          },
        };
      } catch (error) {
        console.warn("Unable to search products for AI assistant.", error);
      }
    }

    return getAssistantReply(trimmedValue, mergedMemory);
  }

  async function sendMessage(value = input) {
    const trimmedValue = value.trim();

    if (!trimmedValue || isThinking) {
      return;
    }

    setIsThinking(true);
    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmedValue,
      },
    ]);
    setInput("");

    const result = await buildAssistantReply(trimmedValue);
    setAssistantMemory(result.memory);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          ...result.reply,
        },
      ]);
      setIsThinking(false);
    }, 180);
  }

  function handleQuickAction(action) {
    sendMessage(action);
  }

  return (
    <div className="ai-assistant-widget">
      <div
        className={`ai-assistant-panel ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="false"
        aria-labelledby={panelTitleId}
      >
        <div className="ai-assistant-header">
          <div>
            <span className="ai-assistant-kicker">Eleos Decor</span>
            <h2 id={panelTitleId}>Eleos Decor Assistant</h2>
            <p>Ask me about products, styling, delivery, or how to order.</p>
          </div>
          <div className="ai-assistant-header-actions">
            <button
              type="button"
              className="ai-assistant-clear"
              onClick={clearPersistedChat}
            >
              Clear chat
            </button>
            <button
              type="button"
              className="ai-assistant-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
            >
              <IoClose />
            </button>
          </div>
        </div>

        <div
          className="ai-assistant-messages"
          aria-live="polite"
          ref={messagesRef}
        >
          {messages.map((message, index) => (
            <div key={message.id}>
              <div className={`ai-assistant-message ${message.role}`}>
                <p>{message.text}</p>
                {message.products && message.products.length > 0 && (
                  <div className="ai-assistant-products">
                    {message.products.map((product, productIndex) => (
                      <div
                        className="ai-assistant-product"
                        key={`${message.id}-${product.href}`}
                      >
                        <img
                          src={product.imageSrc || PRODUCT_IMAGE_FALLBACK}
                          alt={product.title}
                          loading="lazy"
                          onError={handleProductImageError}
                          className="ai-assistant-product-image"
                        />
                        <div className="ai-assistant-product-copy">
                          <p className="ai-assistant-product-title">
                            {productIndex + 1}. {product.title}
                            {product.price && (
                              <span> - {product.price}</span>
                            )}
                          </p>
                          <a
                            href={product.href}
                            className="ai-assistant-product-button"
                          >
                            View Product
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {message.ctas && (
                  <div className="ai-assistant-ctas">
                    {message.ctas.map((cta) => (
                      <a
                        className="ai-assistant-cta"
                        href={cta.href}
                        key={`${message.id}-${cta.label}`}
                        target={cta.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          cta.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                      >
                        {cta.href.includes("wa.me") && <FaWhatsapp />}
                        {cta.label}
                      </a>
                    ))}
                  </div>
                )}
                {!message.products?.length &&
                  message.productLinks &&
                  message.productLinks.length > 0 && (
                  <div className="ai-assistant-product-links">
                    {message.productLinks.map((product) => (
                      <a href={product.href} key={`${message.id}-${product.href}`}>
                        {product.label}
                      </a>
                    ))}
                  </div>
                )}
                {message.options && message.options.length > 0 && (
                  <div className="ai-assistant-options">
                    {message.options.map((option) => (
                      <button
                        type="button"
                        key={`${message.id}-${option}`}
                        onClick={() => sendMessage(option)}
                        disabled={isThinking}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {index === 0 && (
                <div
                  className="ai-assistant-quick-actions"
                  aria-label="Quick actions"
                >
                  {quickActions.map((action) => (
                    <button
                      type="button"
                      key={action}
                      onClick={() => handleQuickAction(action)}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {isThinking && (
          <div className="ai-assistant-typing" aria-live="polite">
            Searching products...
          </div>
        )}

        <form
          className="ai-assistant-form"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about decor, delivery, or orders"
            aria-label="Message Eleos Decor assistant"
            disabled={isThinking}
          />
          <button type="submit" aria-label="Send message" disabled={isThinking}>
            <IoSend />
          </button>
        </form>
      </div>

      <button
        type="button"
        className="ai-assistant-toggle"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls={panelTitleId}
      >
        <span className="ai-assistant-toggle-icon">
          <BsStars />
        </span>
        <span>Ask Decor Assistant</span>
      </button>
    </div>
  );
}
