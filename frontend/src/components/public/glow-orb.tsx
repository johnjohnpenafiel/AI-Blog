/**
 * Atmospheric orange radial glow behind the homepage and about-page heroes.
 * Pure CSS — no asset, no animation. Sits absolutely positioned inside a
 * `relative` parent.
 */
export function GlowOrb({
  size = 720,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle, var(--accent-glow), transparent 70%)",
        filter: "blur(80px)",
      }}
    />
  );
}
