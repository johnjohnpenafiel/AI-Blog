interface SectionHeaderProps {
  index: string;
  label: string;
}

export function SectionHeader({ index, label }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <p className="shrink-0 font-mono text-[10px] tracking-[0.25em] text-accent uppercase">
        {"//"} {index}&nbsp;&nbsp;{label}
      </p>
      <span
        aria-hidden
        className="block flex-1 border-t border-border-dim"
      />
    </div>
  );
}
