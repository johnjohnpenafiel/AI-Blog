import Link from "next/link";

export function PublicNav() {
  return (
    <nav
      data-testid="public-nav"
      className="sticky top-0 z-40 border-b border-border-dim bg-bg/85 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-display text-[18px] font-bold tracking-[0.04em] text-fg"
          aria-label="DeLorean home"
        >
          DE<span className="text-accent">LOR</span>EAN
        </Link>

        <div className="flex items-center gap-7">
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
    </nav>
  );
}
