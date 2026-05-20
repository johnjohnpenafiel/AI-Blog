import Link from "next/link";

export function PublicFooter() {
  return (
    <footer
      data-testid="public-footer"
      className="mt-24 border-t border-border-dim"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="font-display text-[18px] font-bold tracking-[0.04em] text-fg">
            DE<span className="text-accent">LOR</span>EAN
          </span>
          <span className="max-w-md font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
            The pulse of AI and technology reshaping the automotive industry
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-mono text-[10px] tracking-[0.25em] text-fg uppercase transition-colors hover:text-accent"
          >
            Blog
          </Link>
          <Link
            href="/about"
            className="font-mono text-[10px] tracking-[0.25em] text-fg uppercase transition-colors hover:text-accent"
          >
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
