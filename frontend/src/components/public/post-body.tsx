"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface PostBodyProps {
  content: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-10 mb-4 font-display text-[32px] font-bold leading-tight tracking-[0.02em] text-fg">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 mb-3 font-display text-[24px] font-bold leading-tight tracking-[0.02em] text-fg">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 font-display text-[20px] font-semibold leading-snug tracking-[0.02em] text-fg">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-5 text-[17px] leading-[1.75] text-fg/90">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-5 space-y-1 pl-6 list-disc text-[17px] leading-[1.75] text-fg/90">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-5 space-y-1 pl-6 list-decimal text-[17px] leading-[1.75] text-fg/90">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => (
    <strong className="font-bold text-fg">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent underline underline-offset-2 hover:text-[var(--accent-dim)] transition-colors"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-5 border-l-2 border-accent pl-5 text-[17px] leading-[1.75] text-muted italic">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="block rounded-none bg-surface px-5 py-4 font-mono text-[14px] leading-relaxed text-fg/80 overflow-x-auto">
          {children}
        </code>
      );
    }
    return (
      <code className="rounded-none bg-surface px-1.5 py-0.5 font-mono text-[13px] text-fg/80">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-5 overflow-x-auto border border-border">{children}</pre>
  ),
  hr: () => <hr className="my-8 border-border-dim" />,
};

export function PostBody({ content }: PostBodyProps) {
  return (
    <div data-testid="post-body" className="max-w-[680px]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
