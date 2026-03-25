"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { ScoreEntry } from "@/types";

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Simple auth check via sessionStorage
  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdmin");
    if (isAdmin === "true") {
      setAuthenticated(true);
    } else {
      // Prompt for admin code
      const code = window.prompt("Code administrateur :");
      if (code === "adminGUARDIA2026") {
        sessionStorage.setItem("isAdmin", "true");
        setAuthenticated(true);
      } else {
        router.replace("/");
      }
    }
  }, [router]);

  const fetchScores = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .order("score", { ascending: false });

    if (!error && data) {
      setScores(data as ScoreEntry[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchScores();
    }
  }, [authenticated, fetchScores]);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === scores.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(scores.map((s) => s.id)));
    }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    setDeleting(true);

    const ids = Array.from(selected);
    const { error } = await supabase
      .from("scores")
      .delete()
      .in("id", ids);

    if (error) {
      showMessage(`Erreur : ${error.message}`, "error");
    } else {
      showMessage(`${ids.length} entrée(s) supprimée(s)`, "success");
      setSelected(new Set());
      await fetchScores();
    }
    setDeleting(false);
  };

  const deleteAll = async () => {
    setDeleting(true);

    const { error } = await supabase
      .from("scores")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all rows

    if (error) {
      showMessage(`Erreur : ${error.message}`, "error");
    } else {
      showMessage("Tous les scores ont été supprimés", "success");
      setScores([]);
      setSelected(new Set());
    }
    setConfirmDeleteAll(false);
    setDeleting(false);
  };

  const logout = () => {
    sessionStorage.removeItem("isAdmin");
    router.replace("/");
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--color-muted)]">Vérification...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 py-8">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-[var(--color-primary)] opacity-5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-[var(--color-danger)] opacity-5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold sm:text-3xl"
            style={{
              color: "var(--color-danger)",
              fontFamily: "var(--font-mono), monospace",
            }}
          >
            🔒 Panel Admin
          </motion.h1>

          <div className="flex gap-3">
            <Link
              href="/leaderboard"
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text)] transition-all hover:border-[var(--color-primary)]"
            >
              Leaderboard
            </Link>
            <button
              onClick={logout}
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition-all hover:bg-red-500/20"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        >
          <div className="text-sm text-[var(--color-muted)]">
            <span className="font-semibold text-[var(--color-text)]">{scores.length}</span> participant(s)
          </div>
          {scores.length > 0 && (
            <>
              <div className="text-sm text-[var(--color-muted)]">
                Score max : <span className="font-semibold text-[var(--color-success)]">{scores[0]?.score ?? 0}</span>
              </div>
              <div className="text-sm text-[var(--color-muted)]">
                Score moyen : <span className="font-semibold text-[var(--color-primary)]">
                  {Math.round(scores.reduce((acc, s) => acc + s.score, 0) / scores.length)}
                </span>
              </div>
            </>
          )}
        </motion.div>

        {/* Action bar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text)] transition-all hover:border-[var(--color-primary)]"
          >
            {selected.size === scores.length && scores.length > 0 ? "Tout désélectionner" : "Tout sélectionner"}
          </button>

          {selected.size > 0 && (
            <button
              onClick={deleteSelected}
              disabled={deleting}
              className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/30 disabled:opacity-50"
            >
              {deleting ? "Suppression..." : `Supprimer la sélection (${selected.size})`}
            </button>
          )}

          <button
            onClick={() => setConfirmDeleteAll(true)}
            disabled={scores.length === 0 || deleting}
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/25 disabled:opacity-30"
          >
            🗑️ Tout supprimer
          </button>

          <button
            onClick={fetchScores}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-muted)] transition-all hover:text-[var(--color-text)]"
          >
            🔄 Rafraîchir
          </button>
        </div>

        {/* Confirm delete all modal */}
        <AnimatePresence>
          {confirmDeleteAll && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-sm rounded-xl border border-red-500/40 bg-[var(--color-surface)] p-6 text-center"
              >
                <p className="mb-2 text-lg font-semibold text-[var(--color-text)]">
                  Confirmer la suppression
                </p>
                <p className="mb-6 text-sm text-[var(--color-muted)]">
                  Tous les scores ({scores.length} entrées) seront définitivement supprimés.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setConfirmDeleteAll(false)}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-2 text-sm text-[var(--color-text)] transition-all hover:border-[var(--color-primary)]"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={deleteAll}
                    disabled={deleting}
                    className="rounded-lg bg-red-500 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-50"
                  >
                    {deleting ? "Suppression..." : "Supprimer tout"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-lg px-6 py-3 text-sm font-medium shadow-lg ${
                message.type === "success"
                  ? "bg-green-500/20 text-green-400 border border-green-500/40"
                  : "bg-red-500/20 text-red-400 border border-red-500/40"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <p className="text-[var(--color-muted)]">Chargement...</p>
          </div>
        ) : scores.length === 0 ? (
          <div className="flex justify-center py-12">
            <p className="text-[var(--color-muted)]">Aucun score enregistré.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                  <th className="px-3 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === scores.length && scores.length > 0}
                      onChange={toggleSelectAll}
                      className="accent-[var(--color-primary)]"
                    />
                  </th>
                  <th className="px-3 py-3 text-left text-[var(--color-muted)] font-medium">#</th>
                  <th className="px-3 py-3 text-left text-[var(--color-muted)] font-medium">Nom</th>
                  <th className="px-3 py-3 text-right text-[var(--color-muted)] font-medium">Score</th>
                  <th className="px-3 py-3 text-right text-[var(--color-muted)] font-medium">Bonnes rép.</th>
                  <th className="px-3 py-3 text-right text-[var(--color-muted)] font-medium">Date</th>
                  <th className="px-3 py-3 text-center text-[var(--color-muted)] font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((entry, index) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className={`border-b border-[var(--color-border)] transition-colors ${
                      selected.has(entry.id)
                        ? "bg-red-500/5"
                        : "hover:bg-[var(--color-surface)]"
                    }`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(entry.id)}
                        onChange={() => toggleSelect(entry.id)}
                        className="accent-[var(--color-primary)]"
                      />
                    </td>
                    <td className="px-3 py-3 text-[var(--color-muted)]" style={{ fontFamily: "var(--font-mono)" }}>
                      {index + 1}
                    </td>
                    <td className="px-3 py-3 font-medium text-[var(--color-text)]">
                      {entry.player_name}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-mono)" }}>
                      {entry.score}
                    </td>
                    <td className="px-3 py-3 text-right text-[var(--color-muted)]">
                      {entry.correct_answers}/{entry.total_questions}
                    </td>
                    <td className="px-3 py-3 text-right text-xs text-[var(--color-muted)]">
                      {new Date(entry.created_at).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={async () => {
                          const { error } = await supabase
                            .from("scores")
                            .delete()
                            .eq("id", entry.id);
                          if (!error) {
                            showMessage(`${entry.player_name} supprimé`, "success");
                            await fetchScores();
                            setSelected((prev) => {
                              const next = new Set(prev);
                              next.delete(entry.id);
                              return next;
                            });
                          } else {
                            showMessage(`Erreur: ${error.message}`, "error");
                          }
                        }}
                        className="rounded px-2 py-1 text-xs text-red-400 transition-all hover:bg-red-500/20"
                      >
                        ✕
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
