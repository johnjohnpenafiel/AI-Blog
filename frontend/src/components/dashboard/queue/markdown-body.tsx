"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownBodyProps {
  source: string;
}

export function MarkdownBody({ source }: MarkdownBodyProps) {
  return (
    <div className="flex flex-col gap-4 text-[15px] leading-[1.7] text-fg">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-display text-[28px] font-bold tracking-[0.02em] text-fg">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-4 font-display text-[22px] font-bold tracking-[0.02em] text-fg">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-3 font-display text-[18px] font-semibold tracking-[0.02em] text-fg">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-[15px] leading-[1.7] text-fg">{children}</p>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline-offset-2 hover:underline"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="ml-5 list-disc text-[15px] leading-[1.7] text-fg">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="ml-5 list-decimal text-[15px] leading-[1.7] text-fg">
              {children}
            </ol>
          ),
          code: ({ children }) => (
            <code className="border border-border bg-surface px-1 py-0.5 font-mono text-[13px] text-fg">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-accent pl-4 text-muted italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
