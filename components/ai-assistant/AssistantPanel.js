"use client";

import { IoClose, IoSend } from "react-icons/io5";
import MessageList from "./MessageList";

export default function AssistantPanel({
  isOpen,
  messages,
  input,
  setInput,
  isThinking,
  isClearingChat,
  hasJustClearedChat,
  onClose,
  onClear,
  onSend,
  onQuickAction,
  messagesRef,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <section
      id="eleos-ai-assistant-panel"
      className="ai-assistant-panel open"
      role="dialog"
      aria-modal="false"
      aria-labelledby="eleos-ai-assistant-title"
    >
      <header className="ai-assistant-header">
        <div>
          <span className="ai-assistant-kicker">Eleos Decor</span>
          <h2 id="eleos-ai-assistant-title">Decor Assistant</h2>
          <p>Ask about styling, products, delivery, or ordering.</p>
        </div>
        <div className="ai-assistant-header-actions">
          <button
            type="button"
            className="ai-assistant-clear"
            onClick={onClear}
            disabled={isClearingChat}
          >
            {isClearingChat
              ? "Clearing..."
              : hasJustClearedChat
                ? "Cleared"
                : "Clear chat"}
          </button>
          <button
            type="button"
            className="ai-assistant-close"
            onClick={onClose}
            aria-label="Close assistant"
          >
            <IoClose />
          </button>
        </div>
      </header>

      <MessageList
        messages={messages}
        onOptionSelect={onQuickAction}
        isThinking={isThinking}
        messagesRef={messagesRef}
      />

      <form
        className="ai-assistant-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
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
    </section>
  );
}
