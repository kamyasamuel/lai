import React from 'react';
export default function LoadingIndicator({ text = 'Loading...' }) {
  return <div className="text-center text-gray-400 animate-pulse">{text}</div>;
}