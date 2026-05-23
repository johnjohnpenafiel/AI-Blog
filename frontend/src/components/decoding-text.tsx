import { cn } from "@/lib/utils";

/**
 * Deterministic char-code parity mapping → identical output across SSR and
 * client hydration. Non-alphanumerics (whitespace, punctuation, `/`, `·`)
 * pass through so the resulting string keeps the same word boundaries and
 * line wrapping as the real text.
 */
function toBinary(text: string): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (/[a-zA-Z0-9]/.test(ch)) {
      out += ch.charCodeAt(0) % 2 === 0 ? "0" : "1";
    } else {
      out += ch;
    }
  }
  return out;
}

interface DecodingTextProps {
  children: string;
  className?: string;
}

/**
 * Renders text that "decodes" from binary (0/1) to its real content. Pairs
 * with the public hero's AI-scanning animation: during the 3s scan the
 * figure on the right reads as a machine processing input, and every other
 * piece of copy reads as machine-language placeholder. At ~3s the binary
 * overlay fades out and the real text fades in.
 *
 * Gated to `lg+` only — the figure isn't shown below the desktop breakpoint,
 * so the loading-state narrative doesn't apply there. Reduced-motion users
 * also see only the real text. No binary, no animation in either case.
 */
export function DecodingText({ children, className }: DecodingTextProps) {
  const binary = toBinary(children);
  return (
    <span className={cn("relative inline-block", className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:motion-safe:inline lg:motion-safe:[animation:hero-skeleton-out_0.3s_ease-out_2.7s_forwards]"
      >
        {binary}
      </span>
      <span className="lg:motion-safe:opacity-0 lg:motion-safe:[animation:hero-decode-in_0.45s_ease-out_3s_forwards]">
        {children}
      </span>
    </span>
  );
}
