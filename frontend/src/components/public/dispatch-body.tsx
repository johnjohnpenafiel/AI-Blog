"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Article body — renders the post's markdown into the design's editorial prose
 * voice. Styling is carried entirely by `.tg-prose` element selectors in
 * public-theme.css (Archivo body, mono-orange `>` lists, orange-rule pull
 * quotes), so the markdown maps onto the design without per-element wrappers.
 */
export function DispatchBody({ content }: { content: string }) {
  return (
    <div className="tg-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
