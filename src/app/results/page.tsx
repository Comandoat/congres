"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import mails from "@/data/mails.json";
import { supabase } from "@/lib/supabase";
import ScoreDisplay from "@/components/score-display";
import type { Mail, PlayerAnswer } from "@/types";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const player = searchParams.get("player");
  const score = Number(searchParams.get("score") ?? 0);
  const correct = Number(searchParams.get("correct") ?? 0);
  const total = Number(searchParams.get("total") ?? 0);

  const [rank, setRank] = useState<number>(0);
  const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
  const [rankLoading, setRankLoading] = useState(true);

  useEffect(() => {
    if (!player || !searchParams.get("score")) {
      router.replace("/");
    }
  }, [player, searchParams, router]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("quizAnswers");
      if (stored) {
        setAnswers(JSON.parse(stored) as PlayerAnswer[]);
      }
    } catch {
      // sessionStorage not available
    }
  }, []);

  useEffect(() => {
    async function fetchRank() {
      try {
        const { count, error } = await supabase
          .from("scores")
          .select("*", { count: "exact", head: true })
          .gt("score", score);

        if (!error && count !== null) {
          setRank(count + 1);
        } else {
          setRank(1);
        }
      } catch {
        setRank(1);
      } finally {
        setRankLoading(false);
      }
    }

    fetchRank();
  }, [score]);

  const answerMap = useMemo(() => {
    const map = new Map<number, PlayerAnswer>();
    for (const a of answers) {
      map.set(a.mailId, a);
    }
    return map;
  }, [answers]);

  const typedMails = mails as Mail[];

  if (!player) return null;

  return (
    <div className="relative min-h-screen px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-[var(--color-primary)] opacity-5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-[var(--color-secondary)] opacity-5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-glow-primary mb-2 text-center text-3xl font-bold sm:text-4xl"
          style={{
            color: "var(--color-primary)",
            fontFamily: "var(--font-mono), monospace",
          }}
        >
          Résultats
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-6 text-center text-[var(--color-muted)]"
        >
          Bravo {player} !
        </motion.p>

        {!rankLoading && (
          <ScoreDisplay
            score={score}
            correct={correct}
            total={total}
            rank={rank}
          />
        )}

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.4 }}
          className="mb-6 mt-10 text-center text-xl font-semibold text-[var(--color-text)] sm:text-2xl"
        >
          Récapitulatif
        </motion.h2>

        <div className="flex flex-col gap-5">
          {typedMails.map((mail, index) => {
            const playerAnswer = answerMap.get(mail.id);
            const playerSaidPhishing = playerAnswer?.answer === "phishing";
            const isCorrect = playerAnswer
              ? (mail.isPhishing && playerSaidPhishing) ||
                (!mail.isPhishing && !playerSaidPhishing)
              : false;

            return (
              <motion.div
                key={mail.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 1.2 + index * 0.15,
                  duration: 0.4,
                  ease: "easeOut",
                }}
                className="rounded-xl border bg-[var(--color-surface)]"
                style={{
                  borderColor: "var(--color-border)",
                  borderLeftWidth: "4px",
                  borderLeftColor: isCorrect
                    ? "var(--color-success)"
                    : "var(--color-danger)",
                }}
              >
                <div className="p-4 sm:p-5">
                  <div className="mb-3 flex items-start gap-4">
                    <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-background)] sm:h-20 sm:w-28">
                      <Image
                        src={mail.image}
                        alt={`Mail #${mail.id}`}
                        fill
                        className="object-cover object-top"
                        sizes="112px"
                      />
                    </div>

                    <div className="flex flex-1 flex-col gap-2">
                      <span
                        className="text-sm font-semibold text-[var(--color-muted)]"
                        style={{ fontFamily: "var(--font-mono), monospace" }}
                      >
                        Mail #{mail.id}
                      </span>

                      <span
                        className="inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: isCorrect
                            ? "rgba(0, 255, 136, 0.1)"
                            : "rgba(255, 68, 68, 0.1)",
                          color: isCorrect
                            ? "var(--color-success)"
                            : "var(--color-danger)",
                        }}
                      >
                        {isCorrect ? "\u2713 Correct" : "\u2717 Incorrect"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3 flex flex-col gap-1.5 text-sm">
                    <p className="text-[var(--color-muted)]">
                      <span className="font-medium text-[var(--color-text)]">
                        Votre réponse :{" "}
                      </span>
                      {playerAnswer
                        ? playerSaidPhishing
                          ? "Phishing"
                          : "Légitime"
                        : "Pas de réponse"}
                    </p>
                    <p className="text-[var(--color-muted)]">
                      <span className="font-medium text-[var(--color-text)]">
                        Réponse :{" "}
                      </span>
                      <span
                        style={{
                          color: mail.isPhishing
                            ? "var(--color-danger)"
                            : "var(--color-success)",
                        }}
                      >
                        {mail.isPhishing ? "Phishing" : "Légitime"}
                      </span>
                    </p>
                  </div>

                  <div className="mb-2 rounded-lg bg-[var(--color-background)] px-3 py-2.5 text-sm">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                      Indice
                    </p>
                    <p className="text-[var(--color-muted)]">{mail.hint}</p>
                  </div>

                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                    {mail.explanation}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 1.2 + typedMails.length * 0.15 + 0.2,
            duration: 0.5,
          }}
          className="mt-10 flex flex-col items-center gap-4 pb-8"
        >
          <Link
            href="/leaderboard"
            className="glow-primary w-full max-w-xs rounded-lg bg-[var(--color-primary)] px-8 py-3.5 text-center text-lg font-semibold text-[var(--color-background)] transition-all hover:brightness-110"
          >
            Voir le classement
          </Link>

          <Link
            href="/"
            className="w-full max-w-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-3.5 text-center text-lg font-semibold text-[var(--color-text)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Rejouer
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-[var(--color-muted)]">Chargement...</div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
