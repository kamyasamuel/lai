import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import Mermaid from './Mermaid';

const components = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    if (match && match[1] === 'mermaid') {
      return <Mermaid chart={String(children).replace(/\n$/, '')} />;
    }
    return !inline && match ? (
      <code className={className} {...props}>
        {children}
      </code>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

export default function MarkdownRenderer({ content }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      />
    </div>
  );
} 