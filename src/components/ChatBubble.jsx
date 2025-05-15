import React from 'react';
export default function ChatBubble({ msg }) {
  const isUser = msg.sender === 'user';
  const bg = isUser ? 'bg-[#444] self-end ml-auto' : 'bg-[#333] self-start mr-auto';
  return (
    <div className={`p-3 rounded max-w-md ${bg}`}>
      <div className="text-xs text-gray-400 mb-1">
        {isUser ? '🧑 You' : '🤖 AI'} · {new Date(msg.timestamp).toLocaleTimeString()}
      </div>
      <div>{msg.text}</div>
    </div>
  );
}