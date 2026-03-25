"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import LeaderboardTable from "@/components/leaderboard-table";

export default function LeaderboardPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-hidden px-4 py-8 lg:py-16">
      {/* Animated cyber grid background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="cyber-grid absolute inset-0 opacity-15" />
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-[var(--color-primary)] opacity-5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-[var(--color-secondary)] opacity-5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-6 lg:gap-8"
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-glow-primary text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          style={{
            color: "var(--color-primary)",
            fontFamily: "var(--font-mono), monospace",
          }}
        >
          {"\u{1F3C6}"} Classement
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center text-base text-[var(--color-muted)] sm:text-lg lg:text-xl"
        >
          Les meilleurs chasseurs de phishing en temps r&eacute;el
        </motion.p>

        {/* Leaderboard table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-full"
        >
          <LeaderboardTable />
        </motion.div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Link
            href="/"
            className="glow-primary inline-block rounded-lg bg-[var(--color-primary)] px-8 py-3 text-base font-semibold text-[var(--color-background)] transition-all hover:brightness-110 lg:text-lg"
          >
            Retour &agrave; l&apos;accueil
          </Link>
        </motion.div>
      </motion.div>

      {/* CSS for cyber grid */}
      <style jsx global>{`
        .cyber-grid {
          background-image:
            linear-gradient(
              rgba(0, 212, 255, 0.08) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(0, 212, 255, 0.08) 1px,
              transparent 1px
            );
          background-size: 60px 60px;
          animation: gridMove 20s linear infinite;
        }
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(60px, 60px);
          }
        }
      `}</style>
    </div>
  );
}
