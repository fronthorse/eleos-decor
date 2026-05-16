"use client";

import { QUICK_ACTIONS } from "@/lib/ai-assistant/assistantConfig";

export default function QuickActions({ onAction, disabled }) {
  return (
    <div className="ai-assistant-quick-actions" aria-label="Quick actions">
      {QUICK_ACTIONS.map((action) => (
        <button
          type="button"
          key={action}
          onClick={() => onAction(action)}
          disabled={disabled}
        >
          {action}
        </button>
      ))}
    </div>
  );
}
