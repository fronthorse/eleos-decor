"use client";

import { FaWhatsapp } from "react-icons/fa";
import ProductSuggestionCard from "./ProductSuggestionCard";

export default function MessageBubble({ message, onOptionSelect, isThinking }) {
  return (
    <div className={`ai-assistant-message ${message.role}`}>
      <p>{message.text}</p>

      {message.products?.length > 0 && (
        <div className="ai-assistant-products">
          {message.products.map((product) => (
            <ProductSuggestionCard
              key={`${message.id}-${product.href}-${product.title}`}
              product={product}
            />
          ))}
        </div>
      )}

      {message.ctas?.length > 0 && (
        <div className="ai-assistant-ctas">
          {message.ctas.map((cta) => (
            <a
              className="ai-assistant-cta"
              href={cta.href}
              key={`${message.id}-${cta.label}`}
              target={cta.href.startsWith("http") ? "_blank" : undefined}
              rel={cta.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {cta.href.includes("wa.me") && <FaWhatsapp />}
              {cta.label}
            </a>
          ))}
        </div>
      )}

      {message.options?.length > 0 && (
        <div className="ai-assistant-options">
          {message.options.map((option) => (
            <button
              type="button"
              key={`${message.id}-${option}`}
              onClick={() => onOptionSelect(option)}
              disabled={isThinking}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
