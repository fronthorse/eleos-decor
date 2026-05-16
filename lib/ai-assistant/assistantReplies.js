import { BUDGET_OPTIONS, ROOM_OPTIONS, STYLE_OPTIONS, WHATSAPP_URL } from "./assistantConfig";
import { getRoomLabel } from "./assistantMemory";

export function withResolvedCtas(reply) {
  return {
    ...reply,
    ctas: reply.ctas?.map((cta) => ({
      ...cta,
      href: cta.href === "whatsapp" ? WHATSAPP_URL : cta.href,
    })),
  };
}

export function buildConsultationPrompt(step, memory) {
  if (step === "room") {
    return {
      text: "I can help you build a polished decor plan. Which space are we styling first?",
      options: ROOM_OPTIONS,
    };
  }

  if (step === "budget") {
    return {
      text: `${getRoomLabel(memory.room)} works beautifully. What budget should I plan around?`,
      options: BUDGET_OPTIONS,
    };
  }

  return {
    text: `Great. I have ${getRoomLabel(memory.room).toLowerCase()} and ${memory.budgetLabel}. What style should guide the look? You can also say "surprise me" and I will keep it balanced.`,
    options: STYLE_OPTIONS,
  };
}

export function buildDeliveryReply() {
  return {
    text: "Yes, Eleos Decor supports delivery. Share your location or continue on WhatsApp and the team will confirm availability, delivery fee, and timing before finalizing your order.",
    ctas: [
      { label: "Browse Shop", href: "/shop" },
      { label: "Continue on WhatsApp", href: "whatsapp" },
    ],
  };
}

export function buildOrderReply() {
  return {
    text: "To order, open the product you like, add it to cart, and send your order request. Eleos Decor will confirm product availability, delivery details, and payment steps with you on WhatsApp.",
    ctas: [
      { label: "Browse Shop", href: "/shop" },
      { label: "Continue on WhatsApp", href: "whatsapp" },
    ],
  };
}

export function buildWhatsAppReply() {
  return {
    text: "Of course. Continue on WhatsApp and the Eleos Decor team can help with product details, styling, delivery, or order confirmation.",
    ctas: [{ label: "Continue on WhatsApp", href: "whatsapp" }],
  };
}

export function buildFallbackReply(memory) {
  if (memory?.room || memory?.budget || memory?.style) {
    return {
      text: `I can keep helping with your ${getRoomLabel(memory.room || "space").toLowerCase()} plan. Ask for product ideas, change the room or budget, or tell me the style you prefer.`,
      ctas: [
        { label: "Browse Shop", href: "/shop" },
        { label: "Continue on WhatsApp", href: "whatsapp" },
      ],
    };
  }

  return {
    text: "I can help you find products, style a room, plan around a budget, explain delivery, or guide you through ordering. What would you like to do first?",
    options: ["Do you have clocks?", "Help me choose decor", "Do you deliver?", "How do I order?"],
  };
}

export function buildPreferenceConfirmation(extracted) {
  if (extracted.room) {
    return `Noted, we will style the ${getRoomLabel(extracted.room).toLowerCase()} instead. `;
  }

  if (extracted.budgetLabel) {
    return `Noted, I will plan around ${extracted.budgetLabel}. `;
  }

  if (extracted.style) {
    return `Lovely, ${extracted.style} is a strong direction. `;
  }

  return "";
}
