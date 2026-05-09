import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";

import { LogoutButton } from "./logout-button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="flex min-h-screen flex-col gap-8 bg-bg px-8 py-12">
      <header className="flex items-center justify-between border-b border-border pb-6">
        <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
          DeLorean / Admin / Dashboard
        </p>
        <LogoutButton />
      </header>

      <section className="flex flex-col gap-2">
        <p className="font-mono text-[0.7rem] tracking-[0.2em] text-muted uppercase">
          Signed in as
        </p>
        <p className="font-mono text-lg text-fg">{session?.user?.email}</p>
      </section>

      <p className="font-mono text-xs text-muted">
        Placeholder dashboard. The real shell ships in{" "}
        <code className="text-fg">dashboard-shell-and-overview</code>.
      </p>
    </main>
  );
}
