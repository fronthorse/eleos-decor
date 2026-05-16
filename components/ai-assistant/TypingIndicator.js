"use client";

export default function TypingIndicator() {
  return (
    <div
      className="ai-assistant-message assistant ai-assistant-typing-bubble"
      role="status"
      aria-label="Assistant is typing"
    >
      <span className="ai-assistant-typing-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}
