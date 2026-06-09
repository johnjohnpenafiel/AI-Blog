/**
 * The two-ring LogoMark — the only drawn vector in the system. Square-cornered
 * everywhere else; these rings + tiny status dots are the only round geometry.
 */
export function LogoMark({
  size = 26,
  color = "var(--tg-orange)",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size * 0.62}
      viewBox="0 0 42 26"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="14" cy="13" r="11.5" stroke={color} strokeWidth="1.6" />
      <circle cx="28" cy="13" r="11.5" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}
