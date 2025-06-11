import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { Bot, User } from 'lucide-react';

export default function ChatBubble({ msg }) {
  const { text, sender } = msg;

  const isUser = sender === 'user';
  const bubbleClass = isUser ? 'bg-[#2c2c2c] self-end' : 'bg-[#1a1a1a] self-start';
  const Icon = isUser ? User : Bot;

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
          <Icon size={20} className="text-white" />
        </div>
      )}
      <div className={`p-4 rounded-lg max-w-xl md:max-w-2xl text-white ${bubbleClass}`}>
        <MarkdownRenderer content={text} />
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
          <Icon size={20} className="text-white" />
        </div>
      )}
    </div>
  );
}
