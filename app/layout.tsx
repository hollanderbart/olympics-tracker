import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/QueryProvider";

export const metadata: Metadata = {
  title: "Nederland 🇳🇱 Olympische Winterspelen 2026 — Medailles & Programma",
  description:
    "Volg de Nederlandse medailles en het programma van de Olympische Winterspelen 2026 in Milano Cortina. Live updates, medaillespiegel en schema met Nederlandse atleten.",
  openGraph: {
    title: "Nederland — Olympische Winterspelen 2026",
    description:
      "Live medailletracker en programma voor Team NL bij de Winterspelen in Milano Cortina.",
    locale: "nl_NL",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🇳🇱</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
