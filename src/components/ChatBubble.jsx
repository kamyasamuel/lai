import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';

export default function ChatBubble({ msg }) {
  const isUser = msg.sender === 'user';
  const bg = isUser ? 'bg-[#111] self-end ml-auto' : 'bg-transparent self-start mr-auto';
  return (
    <div className={`p-3 rounded max-w-md ${bg}`}>
      <div className="text-xs text-gray-400 mb-1">
        {isUser ? '🧑 You' : 'Legal AI'} · {new Date(msg.timestamp).toLocaleTimeString()}
      </div>
      <MarkdownRenderer content={msg.text} />
    </div>
  );
}