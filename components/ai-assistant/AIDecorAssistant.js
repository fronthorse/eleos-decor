"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAIDecorChatPersistence } from "@/hooks/useAIDecorChatPersistence";
import {
  DEFAULT_ASSISTANT_MEMORY,
  WELCOME_MESSAGE,
} from "@/lib/ai-assistant/assistantConfig";
import {
  getMissingConsultationStep,
  updateConversationMemory,
} from "@/lib/ai-assistant/assistantMemory";
import { detectAssistantIntent } from "@/lib/ai-assistant/assistantIntents";
import {
  buildProductSearchReply,
  searchAssistantProducts,
} from "@/lib/ai-assistant/assistantProductSearch";
import { buildRecommendation } from "@/lib/ai-assistant/assistantRecommendations";
import {
  buildConsultationPrompt,
  buildDeliveryReply,
  buildFallbackReply,
  buildOrderReply,
  buildPreferenceConfirmation,
  buildWhatsAppReply,
  withResolvedCtas,
} from "@/lib/ai-assistant/assistantReplies";
import AssistantButton from "./AssistantButton";
import AssistantPanel from "./AssistantPanel";

const DEFAULT_MESSAGES = [WELCOME_MESSAGE];
const ASSISTANT_BUTTON_MARGIN = 12;
const ASSISTANT_BUTTON_GAP = 10;

function createAssistantMessage(reply) {
  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    source: reply.source || "fallback",
    intentSource: reply.intentSource || "fallback",
    ...withResolvedCtas(reply),
  };
}

async function requestGeminiReply({ message, memory, messages }) {
  const response = await fetch("/api/chatbot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      memory,
      messages: messages
        .slice(-8)
        .map(({ role, text }) => ({ role, text }))
        .filter((item) => item.text),
    }),
  });

  if (!response.ok) {
    throw new Error("Chatbot API request failed.");
  }

  const result = await response.json();

  if (result?.useFallback || !result?.reply) {
    const error = new Error("Chatbot API requested fallback.");
    error.intentSource = result?.intentSource || "fallback";
    throw error;
  }

  return result;
}

export default function AIDecorAssistant() {
  const supabase = useMemo(() => createClient(), []);
  const buttonRef = useRef(null);
  const dragStateRef = useRef(null);
  const messagesRef = useRef(null);
  const conversationVersionRef = useRef(0);
  const clearStatusTimerRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [assistantMemory, setAssistantMemory] = useState(DEFAULT_ASSISTANT_MEMORY);
  const [buttonPosition, setButtonPosition] = useState(null);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);
  const [hasJustClearedChat, setHasJustClearedChat] = useState(false);

  const clampButtonPosition = useCallback((left, top) => {
    if (typeof window === "undefined") {
      return { left, top };
    }

    const buttonRect = buttonRef.current?.getBoundingClientRect();
    const width = buttonRect?.width || 48;
    const height = buttonRect?.height || 48;
    const margin = ASSISTANT_BUTTON_MARGIN;
    const maxLeft = Math.max(margin, window.innerWidth - width - margin);
    const maxTop = Math.max(margin, window.innerHeight - height - margin);
    let nextLeft = Math.min(Math.max(left, margin), maxLeft);
    let nextTop = Math.min(Math.max(top, margin), maxTop);
    const whatsappRect = document
      .querySelector(".whatsapp-float")
      ?.getBoundingClientRect();

    if (whatsappRect) {
      const overlaps =
        nextLeft < whatsappRect.right + ASSISTANT_BUTTON_GAP &&
        nextLeft + width > whatsappRect.left - ASSISTANT_BUTTON_GAP &&
        nextTop < whatsappRect.bottom + ASSISTANT_BUTTON_GAP &&
        nextTop + height > whatsappRect.top - ASSISTANT_BUTTON_GAP;

      if (overlaps) {
        const aboveWhatsApp = whatsappRect.top - height - ASSISTANT_BUTTON_GAP;
        const besideWhatsApp = whatsappRect.left - width - ASSISTANT_BUTTON_GAP;

        if (aboveWhatsApp >= margin) {
          nextTop = aboveWhatsApp;
        } else if (besideWhatsApp >= margin) {
          nextLeft = besideWhatsApp;
        }
      }
    }

    return {
      left: Math.min(Math.max(nextLeft, margin), maxLeft),
      top: Math.min(Math.max(nextTop, margin), maxTop),
    };
  }, []);

  const { clearPersistedChat } = useAIDecorChatPersistence({
    messages,
    setMessages,
    preferences: assistantMemory,
    setPreferences: setAssistantMemory,
    isOpen,
    setIsOpen,
    defaultMessages: DEFAULT_MESSAGES,
    defaultPreferences: DEFAULT_ASSISTANT_MEMORY,
  });

  useEffect(() => {
    if (!messagesRef.current) {
      return;
    }

    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, isThinking, isOpen]);

  useEffect(() => {
    return () => {
      if (clearStatusTimerRef.current) {
        window.clearTimeout(clearStatusTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!buttonPosition) {
      return undefined;
    }

    function handleResize() {
      setButtonPosition((currentPosition) => {
        if (!currentPosition) {
          return currentPosition;
        }

        return clampButtonPosition(currentPosition.left, currentPosition.top);
      });
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [buttonPosition, clampButtonPosition]);

  useEffect(() => {
    return () => {
      if (dragStateRef.current?.cleanup) {
        dragStateRef.current.cleanup();
      }
    };
  }, []);

  function handleAssistantPointerDown(event) {
    if (event.button !== 0 || !buttonRef.current) {
      return;
    }

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: buttonRect.left,
      startTop: buttonRect.top,
      didDrag: false,
      cleanup: null,
    };

    function handlePointerMove(moveEvent) {
      if (moveEvent.pointerId !== dragState.pointerId) {
        return;
      }

      const deltaX = moveEvent.clientX - dragState.startX;
      const deltaY = moveEvent.clientY - dragState.startY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        dragState.didDrag = true;
      }

      if (!dragState.didDrag) {
        return;
      }

      moveEvent.preventDefault();
      setButtonPosition(
        clampButtonPosition(
          dragState.startLeft + deltaX,
          dragState.startTop + deltaY
        )
      );
    }

    function handlePointerUp(upEvent) {
      if (upEvent.pointerId !== dragState.pointerId) {
        return;
      }

      dragState.cleanup?.();

      if (dragState.didDrag) {
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 120);
      }

      dragStateRef.current = null;
    }

    dragState.cleanup = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };

    dragStateRef.current = dragState;
    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  }

  function handleAssistantButtonClick(event) {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      suppressClickRef.current = false;
      return;
    }

    setIsOpen((open) => !open);
  }

  async function buildReply(message) {
    const { memory, extracted } = updateConversationMemory(
      assistantMemory,
      message
    );
    const intent = detectAssistantIntent(message, memory, extracted);
    const confirmation = buildPreferenceConfirmation(extracted);

    if (intent.type === "delivery_faq") {
      return { memory, reply: buildDeliveryReply() };
    }

    if (intent.type === "order_faq") {
      return { memory, reply: buildOrderReply() };
    }

    if (intent.type === "whatsapp_handoff") {
      return { memory, reply: buildWhatsAppReply() };
    }

    if (intent.type === "product_search") {
      const { products, productQuery } = await searchAssistantProducts(
        supabase,
        message
      );
      return {
        memory,
        reply: buildProductSearchReply(products, productQuery),
      };
    }

    if (
      intent.type === "decor_consultation" ||
      intent.type === "room_styling" ||
      intent.type === "budget_guidance"
    ) {
      const missingStep = getMissingConsultationStep(memory);
      const shouldRecommendNow =
        intent.type === "budget_guidance" ||
        intent.type === "room_styling" ||
        (extracted.hasOverrideIntent && (memory.room || memory.budget || memory.style));

      if (missingStep !== "ready" && !shouldRecommendNow) {
        const nextMemory = {
          ...memory,
          consultation: {
            ...memory.consultation,
            currentStep: missingStep,
            hasAskedStyle:
              missingStep === "style" || memory.consultation?.hasAskedStyle,
          },
        };

        return {
          memory: nextMemory,
          reply: {
            ...buildConsultationPrompt(missingStep, nextMemory),
            text: `${confirmation}${buildConsultationPrompt(missingStep, nextMemory).text}`,
          },
        };
      }

      const readyMemory = {
        ...memory,
        consultation: {
          ...memory.consultation,
          currentStep: "ready",
        },
      };
      const recommendation = await buildRecommendation(supabase, readyMemory);

      return {
        memory: readyMemory,
        reply: {
          ...recommendation,
          text: `${confirmation}${recommendation.text}`,
        },
      };
    }

    return { memory, reply: buildFallbackReply(memory) };
  }

  async function sendMessage(value = input) {
    const trimmedValue = value.trim();

    if (!trimmedValue || isThinking) {
      return;
    }

    const conversationVersion = conversationVersionRef.current;
    setIsThinking(true);
    setInput("");
    setHasJustClearedChat(false);
    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmedValue,
      },
    ]);

    try {
      let result;

      try {
        result = await requestGeminiReply({
          message: trimmedValue,
          memory: assistantMemory,
          messages,
        });
      } catch (error) {
        result = await buildReply(trimmedValue);
        result.reply = {
          ...result.reply,
          source: "fallback",
          intentSource: error?.intentSource || "fallback",
        };
      }

      if (conversationVersionRef.current !== conversationVersion) {
        return;
      }

      setAssistantMemory(result.memory);

      window.setTimeout(() => {
        if (conversationVersionRef.current !== conversationVersion) {
          return;
        }

        setMessages((current) => [...current, createAssistantMessage(result.reply)]);
        setIsThinking(false);
      }, 180);
    } catch (error) {
      console.error("Unable to build AI assistant reply.", error);
      window.setTimeout(() => {
        if (conversationVersionRef.current !== conversationVersion) {
          return;
        }

        setMessages((current) => [
          ...current,
          createAssistantMessage({
            ...buildFallbackReply(assistantMemory),
            source: "fallback",
            intentSource: "fallback",
          }),
        ]);
        setIsThinking(false);
      }, 180);
    }
  }

  async function clearChat() {
    if (isClearingChat) {
      return;
    }

    conversationVersionRef.current += 1;
    setIsClearingChat(true);
    setHasJustClearedChat(false);
    setIsThinking(false);
    setInput("");

    try {
      await clearPersistedChat();
      setHasJustClearedChat(true);

      if (clearStatusTimerRef.current) {
        window.clearTimeout(clearStatusTimerRef.current);
      }

      clearStatusTimerRef.current = window.setTimeout(() => {
        setHasJustClearedChat(false);
      }, 1400);
    } finally {
      setIsClearingChat(false);
    }
  }

  const widgetStyle = buttonPosition
    ? {
        left: `${buttonPosition.left}px`,
        top: `${buttonPosition.top}px`,
        right: "auto",
        bottom: "auto",
      }
    : undefined;

  return (
    <div
      className={`ai-assistant-widget ${isOpen ? "open" : "collapsed"}`}
      style={widgetStyle}
      data-dragged={buttonPosition ? "true" : undefined}
    >
      <AssistantPanel
        isOpen={isOpen}
        messages={messages}
        input={input}
        setInput={setInput}
        isThinking={isThinking}
        isClearingChat={isClearingChat}
        hasJustClearedChat={hasJustClearedChat}
        onClose={() => setIsOpen(false)}
        onClear={clearChat}
        onSend={() => sendMessage()}
        onQuickAction={sendMessage}
        messagesRef={messagesRef}
      />
      <AssistantButton
        ref={buttonRef}
        isOpen={isOpen}
        onClick={handleAssistantButtonClick}
        onPointerDown={handleAssistantPointerDown}
      />
    </div>
  );
}
