"use client";

import { forwardRef } from "react";
import { BsStars } from "react-icons/bs";

function AssistantButton({ isOpen, onClick, onPointerDown }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className="ai-assistant-toggle"
      onClick={onClick}
      onPointerDown={onPointerDown}
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

export default forwardRef(AssistantButton);
