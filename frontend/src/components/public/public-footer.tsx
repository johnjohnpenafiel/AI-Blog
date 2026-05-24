import Link from "next/link";

export function PublicFooter() {
  return (
    <footer
      data-testid="public-footer"
      className="mt-24 border-t border-border-dim"
    >
      <div className="flex flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
        <span className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
          © The Garage AI · v1
        </span>

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
