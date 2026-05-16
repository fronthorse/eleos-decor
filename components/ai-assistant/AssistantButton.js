"use client";

import { BsStars } from "react-icons/bs";

export default function AssistantButton({ isOpen, onClick }) {
  return (
    <button
      type="button"
      className="ai-assistant-toggle"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls="eleos-ai-assistant-panel"
      aria-label={isOpen ? "Close decor assistant" : "Open decor assistant"}
      title="Need decor help?"
    >
      <span className="ai-assistant-toggle-icon" aria-hidden="true">
        <BsStars />
      </span>
      <span className="ai-assistant-toggle-text">Ask Decor Assistant</span>
      {!isOpen && (
        <span className="ai-assistant-tooltip" role="tooltip">
          Need decor help?
        </span>
      )}
    </button>
  );
}
