
import React from 'react';
import { cn } from '@/lib/utils';

export interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isUser,
  timestamp 
}) => {
  return (
    <div className={cn(
      "flex flex-col mb-4",
      isUser ? "items-end" : "items-start"
    )}>
      <div className={cn(
        "chat-bubble",
        isUser ? "chat-bubble-user" : "chat-bubble-bot"
      )}>
        {message}
      </div>
      {timestamp && (
        <span className="text-xs text-gray-400 mt-1">
          {timestamp}
        </span>
      )}
    </div>
  );
};

export default ChatMessage;
