"use client";

import { ChamferedPanel } from "@/components/chamfered-panel";
import type { PostListItem } from "@/lib/api";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "destructive" | "dim";

const TONE_STROKE: Record<Tone, string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
  dim: "var(--border)",
};

const TONE_TEXT: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  dim: "text-dim",
};

type EvalFields = Pick<
  PostListItem,
  "eval_pov" | "eval_format" | "eval_grounding" | "eval_passed"
>;

interface EvalBadgeProps {
  post: EvalFields;
  className?: string;
}

/**
 * The generation-eval score as a chamfered chip. Reads pov·format·grounding
 * (0–2 each) + pass/fail. Three tones so the operator can eyeball quality:
 * green = passed & perfect, amber = passed but imperfect, red = failed. A muted
 * "EVAL —" shows when a post is unscored (pre-eval, skipped, or regenerated).
 */
export function EvalBadge({ post, className }: EvalBadgeProps) {
  const { eval_pov, eval_format, eval_grounding, eval_passed } = post;

  const scored =
    eval_passed !== null &&
    eval_pov !== null &&
    eval_format !== null &&
    eval_grounding !== null;

  if (!scored) {
    return (
      <Chip tone="dim" label="Eval —" title="Not scored" className={className} />
    );
  }

  const min = Math.min(eval_pov, eval_format, eval_grounding);
  const tone: Tone = !eval_passed ? "destructive" : min < 2 ? "warning" : "success";
  const label = `${eval_passed ? "Pass" : "Fail"} ${eval_pov}·${eval_format}·${eval_grounding}`;
  const title = `POV ${eval_pov}/2 · Format ${eval_format}/2 · Grounding ${eval_grounding}/2`;

  return <Chip tone={tone} label={label} title={title} className={className} />;
}

function Chip({
  tone,
  label,
  title,
  className,
}: {
  tone: Tone;
  label: string;
  title: string;
  className?: string;
}) {
  return (
    <ChamferedPanel
      tier="component"
      size="tag"
      background="transparent"
      perimeterStroke={TONE_STROKE[tone]}
      chamferStroke="transparent"
      className={cn("inline-block", className)}
    >
      <span
        title={title}
        data-testid="eval-badge"
        className={cn(
          "block px-2 py-1 font-mono text-[9px] tracking-[0.2em] whitespace-nowrap uppercase",
          TONE_TEXT[tone],
        )}
      >
        {label}
      </span>
    </ChamferedPanel>
  );
}
