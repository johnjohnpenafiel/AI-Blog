import type { Metadata, Viewport } from "next";
import { Archivo, DM_Mono, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

// ── Public-surface fonts (The Garage AI redesign) ──────────────────────────
// Archivo is the editorial display + body voice, run EXTENDED — load the
// `wdth` axis so `font-stretch` works. DM Mono is the "console" chrome voice
// (non-variable, so weights are explicit). Archivo also doubles as the
// dashboard's editorial voice for post content (see --font-editorial).
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

// ── Dashboard chrome font ───────────────────────────────────────────────────
// IBM Plex Mono is the admin surface's "command-console" voice — it carries all
// dashboard chrome (nav, labels, stats, buttons, page titles). The only
// exception is post content (card titles/summaries + the review preview), which
// uses the public editorial voice (Archivo) so it reads as the published work
// it represents. The public surface is unaffected (it uses its own --tg-* tokens).
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Garage AI",
  description: "AI and operational technology in the automotive industry.",
};

// viewportFit: "cover" lets the page extend under the iPhone home-indicator
// area, which makes env(safe-area-inset-*) report real values — the public
// surface's fixed bottom nav pads itself with them.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${dmMono.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg bg-fixed font-sans text-fg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
