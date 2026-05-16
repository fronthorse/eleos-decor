"use client";

import MessageBubble from "./MessageBubble";
import QuickActions from "./QuickActions";
import TypingIndicator from "./TypingIndicator";

export default function MessageList({ messages, onOptionSelect, isThinking, messagesRef }) {
  return (
    <div className="ai-assistant-messages" aria-live="polite" ref={messagesRef}>
      {messages.map((message, index) => (
        <div key={message.id}>
          <MessageBubble
            message={message}
            onOptionSelect={onOptionSelect}
            isThinking={isThinking}
          />
          {index === 0 && (
            <QuickActions onAction={onOptionSelect} disabled={isThinking} />
          )}
        </div>
      ))}
      {isThinking && <TypingIndicator />}
    </div>
  );
}
