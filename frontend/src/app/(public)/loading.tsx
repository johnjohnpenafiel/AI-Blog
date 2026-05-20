/**
 * Route-transition fallback for the public surface. The page itself
 * SSR-fetches and blocks on initial render, so this only flashes during
 * client-side navigations from another route.
 */
export default function PublicLoading() {
  return (
    <section className="mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center px-6 py-24">
      <div className="h-px w-full bg-[var(--border-dim)]" />
      <p className="mt-4 font-mono text-[10px] tracking-[0.25em] text-accent uppercase">
        {"// LOADING TRANSMISSION"}
      </p>
      <div className="mt-10 h-[56px] w-3/4 max-w-3xl bg-surface" />
      <div className="mt-4 h-[24px] w-1/2 max-w-xl bg-surface" />
      <div className="mt-8 h-px w-full bg-[var(--border-dim)]" />
      <div className="mt-12 flex flex-col gap-6">
        <div className="h-[180px] w-full bg-surface" />
        <div className="h-[180px] w-full bg-surface" />
      </div>
    </section>
  );
}
