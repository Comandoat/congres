"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  const [playerName, setPlayerName] = useState("");
  const router = useRouter();

  const handleStart = () => {
    if (playerName.trim()) {
      router.push(`/quiz?player=${encodeURIComponent(playerName.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && playerName.trim()) {
      handleStart();
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
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
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-8 text-center"
      >
        {/* Title with neon glow */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-glow-primary text-5xl font-bold tracking-tight sm:text-6xl"
          style={{
            color: "var(--color-primary)",
            fontFamily: "var(--font-mono), monospace",
          }}
        >
          PhishQuiz
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg text-[var(--color-text)] sm:text-xl"
        >
          Testez votre capacité à détecter les e-mails de phishing
        </motion.p>

        {/* Rules */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4 text-sm leading-relaxed text-[var(--color-muted)]"
        >
          Vous allez recevoir une série d&apos;e-mails. Pour chacun, déterminez
          s&apos;il s&apos;agit d&apos;un <strong className="text-[var(--color-danger)]">phishing</strong> ou
          d&apos;un <strong className="text-[var(--color-success)]">e-mail légitime</strong>.
          <br />
          Soyez rapide&nbsp;: la vitesse de réponse rapporte des points bonus&nbsp;!
        </motion.div>

        {/* Name input */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="w-full"
        >
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Votre nom ou nom d'équipe"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-center text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none transition-shadow focus:border-[var(--color-primary)] focus:shadow-[0_0_12px_rgba(0,212,255,0.25)]"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
            maxLength={40}
            autoComplete="off"
          />
        </motion.div>

        {/* Start button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          whileHover={playerName.trim() ? { scale: 1.03 } : {}}
          whileTap={playerName.trim() ? { scale: 0.97 } : {}}
          onClick={handleStart}
          disabled={!playerName.trim()}
          className="glow-primary w-full cursor-pointer rounded-lg bg-[var(--color-primary)] px-8 py-3.5 text-lg font-semibold text-[var(--color-background)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:brightness-100"
        >
          Commencer
        </motion.button>

        {/* Leaderboard link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          <Link
            href="/leaderboard"
            className="text-sm text-[var(--color-muted)] underline underline-offset-4 transition-colors hover:text-[var(--color-primary)]"
          >
            Voir le classement
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
