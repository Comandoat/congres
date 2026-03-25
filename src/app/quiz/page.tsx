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
  const [direction, setDirection] = useState(1);
  const currentTimeRef = useRef(0);

  // Store answers in a ref so they survive re-renders without triggering them
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

  const handleAnswer = (answer: 'phishing' | 'legitimate') => {
    // Guard against double-submit using ref (not state, to avoid race conditions)
    if (submittingRef.current) return;

    setTimerRunning(false);

    const newAnswer: PlayerAnswer = {
      mailId: currentMail.id,
      answer,
      timeInSeconds: Math.round(currentTimeRef.current * 10) / 10,
    };

    answersRef.current = [...answersRef.current, newAnswer];

    if (isLastMail) {
      // Lock immediately via ref
      submittingRef.current = true;
      setIsSubmitting(true);

      const allAnswers = answersRef.current;
      const { score, correctAnswers } = calculateTotalScore(allAnswers, typedMails);

      // Save answers to sessionStorage
      try {
        sessionStorage.setItem('quizAnswers', JSON.stringify(allAnswers));
      } catch {
        // ignore
      }

      // Build URL before any async
      const resultsUrl = `/results?player=${encodeURIComponent(playerName)}&score=${score}&correct=${correctAnswers}&total=${typedMails.length}`;

      // Fire and navigate — use sendBeacon as primary (fire-and-forget, survives navigation)
      // plus a fetch as backup
      const payload = JSON.stringify({
        player_name: playerName,
        score,
        correct_answers: correctAnswers,
        total_questions: typedMails.length,
      });

      // sendBeacon is guaranteed to complete even if the page navigates away
      const beaconSent = navigator.sendBeacon(
        '/api/scores',
        new Blob([payload], { type: 'application/json' })
      );

      if (!beaconSent) {
        // Fallback: use fetch with keepalive
        fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }

      // Navigate immediately — sendBeacon handles the save in background
      window.location.href = resultsUrl;
    } else {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => {
        setTimerRunning(true);
      }, 50);
    }
  };

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
