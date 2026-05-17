"use client";

interface Bar {
  width: string;
  height: string;
}

const BARS: Bar[] = [
  { width: "50%", height: "24px" }, // heading
  { width: "95%", height: "12px" },
  { width: "88%", height: "12px" },
  { width: "92%", height: "12px" },
  { width: "70%", height: "12px" },
  { width: "40%", height: "20px" }, // subheading
  { width: "94%", height: "12px" },
  { width: "85%", height: "12px" },
  { width: "90%", height: "12px" },
  { width: "78%", height: "12px" },
  { width: "45%", height: "20px" }, // subheading
  { width: "93%", height: "12px" },
  { width: "87%", height: "12px" },
  { width: "91%", height: "12px" },
  { width: "82%", height: "12px" },
  { width: "65%", height: "12px" },
  { width: "42%", height: "20px" }, // subheading
  { width: "96%", height: "12px" },
  { width: "84%", height: "12px" },
  { width: "89%", height: "12px" },
  { width: "72%", height: "12px" },
];

export function MarkdownSkeleton() {
  return (
    <div
      role="status"
      aria-label="Regenerating content"
      data-testid="markdown-skeleton"
      className="flex flex-col gap-4"
    >
      {BARS.map((bar, i) => (
        <div
          key={i}
          className="animate-pulse bg-[var(--surface-raised)]"
          style={{
            width: bar.width,
            height: bar.height,
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  );
}
