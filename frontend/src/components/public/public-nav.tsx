import Link from "next/link";

export function PublicNav() {
  return (
    <nav
      data-testid="public-nav"
      className="absolute inset-x-0 top-0 z-40 bg-transparent"
    >
      <div className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <Link
          href="/"
          className="font-display text-[18px] font-bold tracking-[0.04em] text-[#0a0a0a]"
          aria-label="The Garage AI home"
        >
          THE GARAGE AI
        </Link>

        <div className="flex items-center gap-7">
          <Link
            href="/"
            className="font-mono text-[10px] tracking-[0.25em] text-[#0a0a0a] uppercase transition-colors hover:text-accent"
          >
            Blog
          </Link>
          <span
            aria-disabled="true"
            className="font-mono text-[10px] tracking-[0.25em] text-[#777] uppercase"
            title="Coming soon"
          >
            About
          </span>
        </div>
      </div>
    </nav>
  );
}
