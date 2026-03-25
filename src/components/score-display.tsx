"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ScoreDisplayProps {
  score: number;
  correct: number;
  total: number;
  rank: number;
}

export default function ScoreDisplay({
  score,
  correct,
  total,
  rank,
}: ScoreDisplayProps) {
  const [displayedScore, setDisplayedScore] = useState(0);

  useEffect(() => {
    if (score === 0) return;

    const duration = 1500; // ms
    const steps = 60;
    const increment = score / steps;
    const stepDuration = duration / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), score);
      setDisplayedScore(current);
      if (step >= steps) {
        clearInterval(interval);
        setDisplayedScore(score);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center gap-3 py-8"
    >
      {/* Score number */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-glow-primary text-7xl font-bold sm:text-8xl"
        style={{
          color: "var(--color-primary)",
          fontFamily: "var(--font-mono), monospace",
        }}
      >
        {displayedScore}
      </motion.div>

      {/* Label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="text-lg text-[var(--color-text)] sm:text-xl"
      >
        points
      </motion.p>

      {/* Correct answers */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="text-base text-[var(--color-muted)]"
      >
        {correct}/{total} bonnes réponses
      </motion.p>

      {/* Rank */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="mt-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5"
      >
        <span className="text-[var(--color-muted)]">
          Vous êtes{" "}
        </span>
        <span
          className="text-glow-secondary font-bold"
          style={{ color: "var(--color-secondary)" }}
        >
          #{rank}
        </span>
        <span className="text-[var(--color-muted)]"> au classement</span>
      </motion.div>
    </motion.div>
  );
}
