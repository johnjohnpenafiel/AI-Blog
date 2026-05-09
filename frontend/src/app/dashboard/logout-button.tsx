"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button
      variant="outline"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-none border-border bg-transparent font-mono text-xs tracking-[0.2em] text-fg uppercase hover:bg-surface"
    >
      Logout
    </Button>
  );
}
