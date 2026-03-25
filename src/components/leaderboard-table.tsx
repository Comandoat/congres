"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { ScoreEntry } from "@/types";

export default function LeaderboardTable() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const initialLoadDone = useRef(false);

  useEffect(() => {
    // Fetch initial scores
    const fetchScores = async () => {
      const { data, error } = await supabase
        .from("scores")
        .select("*")
        .order("score", { ascending: false })
        .limit(100);

      if (!error && data) {
        setScores(data as ScoreEntry[]);
      }
      setLoading(false);
      initialLoadDone.current = true;
    };

    fetchScores();

    // Subscribe to real-time inserts
    const channel = supabase
      .channel("scores")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scores" },
        (payload) => {
          const newEntry = payload.new as ScoreEntry;

          // Highlight new entry
          setNewIds((prev) => new Set(prev).add(newEntry.id));
          setTimeout(() => {
            setNewIds((prev) => {
              const next = new Set(prev);
              next.delete(newEntry.id);
              return next;
            });
          }, 2500);

          // Add entry and re-sort, keep top 100
          setScores((prev) => {
            const updated = [...prev, newEntry];
            updated.sort((a, b) => b.score - a.score);
            return updated.slice(0, 100);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getRankStyle = (rank: number) => {
    if (rank === 1)
      return {
        color: "#FFD700",
        textShadow: "0 0 10px rgba(255, 215, 0, 0.5)",
        fontSize: "1.2em",
      };
    if (rank === 2)
      return {
        color: "#C0C0C0",
        textShadow: "0 0 8px rgba(192, 192, 192, 0.4)",
        fontSize: "1.1em",
      };
    if (rank === 3)
      return {
        color: "#CD7F32",
        textShadow: "0 0 8px rgba(205, 127, 50, 0.4)",
        fontSize: "1.05em",
      };
    return {};
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "\u{1F947}";
    if (rank === 2) return "\u{1F948}";
    if (rank === 3) return "\u{1F949}";
    return `${rank}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent"
        />
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center"
      >
        <p className="text-lg text-[var(--color-muted)]">
          Aucun score pour le moment. Soyez le premier !
        </p>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      {/* Participant count */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-4 text-center text-sm text-[var(--color-muted)] lg:text-base"
      >
        {scores.length} participant{scores.length > 1 ? "s" : ""}
      </motion.p>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {/* Header */}
        <div className="grid grid-cols-[3.5rem_1fr_5rem_6rem] items-center border-b border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] sm:grid-cols-[4rem_1fr_6rem_8rem] lg:px-6 lg:py-4 lg:text-sm">
          <span>#</span>
          <span>Nom</span>
          <span className="text-right">Score</span>
          <span className="text-right">Bonnes rep.</span>
        </div>

        {/* Rows */}
        <AnimatePresence initial={true}>
          {scores.map((entry, index) => {
            const rank = index + 1;
            const isNew = newIds.has(entry.id);
            const isTopThree = rank <= 3;

            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  backgroundColor: isNew
                    ? "rgba(0, 212, 255, 0.12)"
                    : "transparent",
                }}
                transition={{
                  duration: 0.4,
                  delay: initialLoadDone.current ? 0 : index * 0.03,
                  backgroundColor: { duration: 0.3 },
                }}
                className={`grid grid-cols-[3.5rem_1fr_5rem_6rem] items-center border-b border-[var(--color-border)] px-4 py-2.5 last:border-b-0 sm:grid-cols-[4rem_1fr_6rem_8rem] lg:px-6 lg:py-3 ${
                  isTopThree ? "font-semibold" : ""
                }`}
                style={isTopThree ? getRankStyle(rank) : {}}
              >
                {/* Rank */}
                <span
                  className={`text-sm lg:text-base ${
                    !isTopThree ? "text-[var(--color-muted)]" : ""
                  }`}
                >
                  {getRankIcon(rank)}
                </span>

                {/* Name */}
                <span
                  className={`truncate text-sm lg:text-base ${
                    isTopThree
                      ? ""
                      : "text-[var(--color-text)]"
                  }`}
                >
                  {entry.player_name}
                </span>

                {/* Score */}
                <span
                  className={`text-right text-sm font-mono lg:text-base ${
                    isTopThree
                      ? ""
                      : "text-[var(--color-primary)]"
                  }`}
                  style={
                    isTopThree
                      ? {}
                      : { textShadow: "0 0 6px rgba(0, 212, 255, 0.3)" }
                  }
                >
                  {entry.score}
                </span>

                {/* Correct answers */}
                <span
                  className={`text-right text-sm lg:text-base ${
                    !isTopThree ? "text-[var(--color-muted)]" : ""
                  }`}
                >
                  {entry.correct_answers}/{entry.total_questions}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
