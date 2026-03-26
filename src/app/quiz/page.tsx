'use client';

import { useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import mails from '@/data/mails.json';
import { calculateTotalScore } from '@/lib/scoring';
import type { Mail, PlayerAnswer } from '@/types';
import MailViewer from '@/components/mail-viewer';
import Timer from '@/components/timer';
import ProgressBar from '@/components/progress-bar';

const typedMails: Mail[] = mails as Mail[];

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const playerName = searchParams.get('player') || '';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const currentTimeRef = useRef(0);
  const answersRef = useRef<PlayerAnswer[]>([]);
  const submittingRef = useRef(false);

  if (!playerName) {
    router.replace('/');
    return null;
  }

  const currentMail = typedMails[currentIndex];
  const isLastMail = currentIndex === typedMails.length - 1;

  const handleTimeUpdate = useCallback((time: number) => {
    currentTimeRef.current = time;
  }, []);

  const handleAnswer = async (answer: 'phishing' | 'legitimate') => {
    if (submittingRef.current) return;

    setTimerRunning(false);

    const newAnswer: PlayerAnswer = {
      mailId: currentMail.id,
      answer,
      timeInSeconds: Math.round(currentTimeRef.current * 10) / 10,
    };

    answersRef.current = [...answersRef.current, newAnswer];

    if (isLastMail) {
      submittingRef.current = true;
      setIsSubmitting(true);
      setSaveStatus('Enregistrement de votre score...');

      const allAnswers = answersRef.current;
      const { score, correctAnswers } = calculateTotalScore(allAnswers, typedMails);

      // Save answers to sessionStorage
      try {
        sessionStorage.setItem('quizAnswers', JSON.stringify(allAnswers));
      } catch {
        // ignore
      }

      const resultsUrl = `/results?player=${encodeURIComponent(playerName)}&score=${score}&correct=${correctAnswers}&total=${typedMails.length}`;

      setSaveStatus('Enregistrement de votre score...');

      // Use await fetch — we show a loading screen so no race condition
      let saved = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          setSaveStatus('Enregistrement de votre score...');
          const res = await fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              player_name: playerName,
              score,
              correct_answers: correctAnswers,
              total_questions: typedMails.length,
            }),
          });

          if (res.ok) {
            saved = true;
            setSaveStatus('Score enregistré !');
            break;
          } else {
            const errText = await res.text();
            setSaveStatus(`Erreur ${res.status}: ${errText}`);
          }
        } catch (e) {
          setSaveStatus(`Erreur réseau (tentative ${attempt}): ${e}`);
        }

        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      if (!saved) {
        // Last resort: try sendBeacon
        setSaveStatus('Enregistrement de votre score...');
        navigator.sendBeacon(
          '/api/scores',
          new Blob(
            [JSON.stringify({
              player_name: playerName,
              score,
              correct_answers: correctAnswers,
              total_questions: typedMails.length,
            })],
            { type: 'application/json' }
          )
        );
      }

      // Small delay so user can see the status
      await new Promise((r) => setTimeout(r, 500));
      window.location.href = resultsUrl;
    } else {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => {
        setTimerRunning(true);
      }, 50);
    }
  };

  // Saving screen
  if (isSubmitting) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
        <p className="text-[var(--color-text)] text-center font-medium">{saveStatus}</p>
        <p className="text-[var(--color-muted)] text-xs text-center">Ne fermez pas cette page</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <ProgressBar current={currentIndex + 1} total={typedMails.length} />
        </div>
        <Timer isRunning={timerRunning} onTimeUpdate={handleTimeUpdate} />
      </div>

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentMail.id}
            custom={direction}
            initial={{ x: direction * 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <MailViewer imageSrc={currentMail.image} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pb-4">
        <button
          onClick={() => handleAnswer('phishing')}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 py-5 px-4 rounded-xl text-lg font-bold
            bg-red-500/15 border-2 border-red-500/40 text-red-400
            active:scale-95 transition-all duration-150
            hover:bg-red-500/25 hover:border-red-500/60
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-2xl">🛡️</span>
          <span>Phishing</span>
        </button>

        <button
          onClick={() => handleAnswer('legitimate')}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 py-5 px-4 rounded-xl text-lg font-bold
            bg-green-500/15 border-2 border-green-500/40 text-green-400
            active:scale-95 transition-all duration-150
            hover:bg-green-500/25 hover:border-green-500/60
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-2xl">✉️</span>
          <span>Légitime</span>
        </button>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center">
          <p className="text-[var(--color-muted)]">Chargement...</p>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
