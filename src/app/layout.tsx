import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "PhishQuiz — Congrès Biologie Médicale",
  description:
    "Testez votre capacité à détecter les e-mails de phishing. Un quiz interactif de sensibilisation au phishing pour les professionnels de la biologie médicale.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[var(--color-background)] text-[var(--color-text)] min-h-screen flex flex-col`}
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        <main className="flex-1">{children}</main>
        <footer className="py-4 text-center text-sm text-[var(--color-muted)]">
          Par Antoine CAPUCCIO &amp; Noa BROCA
        </footer>
      </body>
    </html>
  );
}
