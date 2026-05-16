export const WHATSAPP_URL =
  "https://wa.me/2348168350533?text=Hello%20Eleos%20Decor%2C%20I%20would%20like%20help%20with%20decor%20and%20ordering.";

export const QUICK_ACTIONS = [
  "Browse products",
  "Help me choose decor",
  "Delivery information",
  "How to order",
  "Chat on WhatsApp",
];

export const CONSULTATION_STEPS = {
  IDLE: "idle",
  ROOM: "room",
  BUDGET: "budget",
  STYLE: "style",
  READY: "ready",
};

export const STYLE_OPTIONS = [
  "Modern",
  "Luxury",
  "Minimal",
  "Cozy",
  "Warm & Elegant",
  "Surprise me",
];

export const ROOM_OPTIONS = [
  "Living room",
  "Bedroom",
  "Dining area",
  "TV console",
  "Office",
];

export const BUDGET_OPTIONS = [
  "Under \u20a6100k",
  "\u20a6100k - \u20a6300k",
  "\u20a6300k - \u20a6700k",
  "\u20a6700k+",
];

export const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  text: "Hi, I'm your Eleos Decor Assistant. I can help you find decor pieces, plan a room, compare options, and hand you over to WhatsApp when you are ready.",
};

export const DEFAULT_ASSISTANT_MEMORY = {
  lastUserMessage: "",
  room: "",
  budget: null,
  budgetLabel: "",
  style: "",
  categories: [],
  colorPalette: "",
  roomSize: "",
  spaceType: "",
  consultation: {
    currentStep: CONSULTATION_STEPS.IDLE,
    hasAskedStyle: false,
  },
};
