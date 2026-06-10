import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * The Garage AI button. Sharp rectangle, mono uppercase, accent-driven — the
 * single source of truth for every action affordance across the dashboard.
 * Built on a plain <button> (no shadcn/base-ui), with a focus ring + press
 * micro-interaction for polish. Use `buttonClasses` to style a <Link>/<a> the
 * same way.
 */
const BASE =
  "inline-flex items-center justify-center font-mono tracking-[0.25em] whitespace-nowrap uppercase transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-[var(--bg)] hover:bg-[var(--accent-dim)]",
  outline: "border border-accent text-accent hover:bg-[var(--accent-glow)]",
  ghost: "border border-border text-muted hover:text-fg",
  destructive:
    "border border-destructive text-destructive hover:bg-destructive/10",
  // Borderless text affordance (Cancel / Back) — strips the size padding.
  link: "px-0 py-0 text-dim hover:text-fg",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 text-[10px]",
  md: "px-4 py-2 text-[11px]",
  lg: "px-5 py-3 text-[11px]",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(BASE, SIZES[size], VARIANTS[variant], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}
