import type { Metadata } from "next";
import { Archivo, DM_Mono, Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// ── Public-surface fonts (The Garage AI redesign) ──────────────────────────
// Archivo is the editorial display + body voice, run EXTENDED — load the
// `wdth` axis so `font-stretch` works. DM Mono is the "console" chrome voice
// (non-variable, so weights are explicit). These are additive: the dashboard
// keeps Inter / JetBrains Mono / Fraunces untouched.
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

export const metadata: Metadata = {
  title: "The Garage AI",
  description: "AI and operational technology in the automotive industry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${archivo.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg bg-fixed font-sans text-fg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
