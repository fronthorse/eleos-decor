"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function createAssistantMessage(reply) {
  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    ...withResolvedCtas(reply),
  };
}

export default function AIDecorAssistant() {
  const supabase = useMemo(() => createClient(), []);
  const messagesRef = useRef(null);
  const conversationVersionRef = useRef(0);
  const clearStatusTimerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [assistantMemory, setAssistantMemory] = useState(DEFAULT_ASSISTANT_MEMORY);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);
  const [hasJustClearedChat, setHasJustClearedChat] = useState(false);

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

      if (missingStep !== "ready") {
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
      const result = await buildReply(trimmedValue);

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
      console.warn("Unable to build AI assistant reply.", error);
      window.setTimeout(() => {
        if (conversationVersionRef.current !== conversationVersion) {
          return;
        }

        setMessages((current) => [
          ...current,
          createAssistantMessage(buildFallbackReply(assistantMemory)),
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

  return (
    <div className={`ai-assistant-widget ${isOpen ? "open" : "collapsed"}`}>
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
      <AssistantButton isOpen={isOpen} onClick={() => setIsOpen((open) => !open)} />
    </div>
  );
}
