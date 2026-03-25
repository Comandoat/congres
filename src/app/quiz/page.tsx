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

// Save score via our own API route (server-side insert to Supabase)
// This avoids any browser-side issues (CORS, ad-blockers, client SDK bugs)
async function saveScore(data: {
  player_name: string;
  score: number;
  correct_answers: number;
  total_questions: number;
}): Promise<boolean> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true, // ensures request survives page navigation
      });
      if (res.ok) return true;
      console.error(`Save attempt ${attempt + 1}: ${res.status}`);
    } catch (e) {
      console.error(`Network error attempt ${attempt + 1}:`, e);
    }
    if (attempt < 2) await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const playerName = searchParams.get('player') || '';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
  const [timerRunning, setTimerRunning] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward
  const currentTimeRef = useRef(0);

  // Redirect if no player name
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
    if (isSubmitting) return;

    setTimerRunning(false);

    const newAnswer: PlayerAnswer = {
      mailId: currentMail.id,
      answer,
      timeInSeconds: Math.round(currentTimeRef.current * 10) / 10,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (isLastMail) {
      // Calculate score and save
      setIsSubmitting(true);
      const { score, correctAnswers } = calculateTotalScore(
        updatedAnswers,
        typedMails
      );

      // Save answers to sessionStorage for the results page
      try {
        sessionStorage.setItem('quizAnswers', JSON.stringify(updatedAnswers));
      } catch {
        // sessionStorage not available
      }

      // Build the results URL now (before any async work)
      const resultsUrl = `/results?player=${encodeURIComponent(playerName)}&score=${score}&correct=${correctAnswers}&total=${typedMails.length}`;

      // Save score via our API route (server-side)
      const saved = await saveScore({
        player_name: playerName,
        score,
        correct_answers: correctAnswers,
        total_questions: typedMails.length,
      });

      if (!saved) {
        console.error('Failed to save score after 3 attempts');
      }

      // Navigate only after save is complete
      window.location.href = resultsUrl;
    } else {
      // Move to next mail
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);

      // Restart timer after a brief moment for the animation
      setTimeout(() => {
        setTimerRunning(true);
      }, 50);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col px-4 py-6 max-w-lg mx-auto">
      {/* Header: progress + timer */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <ProgressBar current={currentIndex + 1} total={typedMails.length} />
        </div>
        <Timer isRunning={timerRunning} onTimeUpdate={handleTimeUpdate} />
      </div>

      {/* Mail viewer with transition */}
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

      {/* Answer buttons */}
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
