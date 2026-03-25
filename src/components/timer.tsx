'use client';

import { useEffect, useRef, useCallback } from 'react';

interface TimerProps {
  isRunning: boolean;
  onTimeUpdate: (time: number) => void;
}

export default function Timer({ isRunning, onTimeUpdate }: TimerProps) {
  const startTimeRef = useRef<number>(0);
  const displayRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(0);

  const tick = useCallback(() => {
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    currentTimeRef.current = elapsed;

    if (displayRef.current) {
      displayRef.current.textContent = `${elapsed.toFixed(1)}s`;
    }

    onTimeUpdate(elapsed);
    rafRef.current = requestAnimationFrame(tick);
  }, [onTimeUpdate]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      currentTimeRef.current = 0;

      if (displayRef.current) {
        displayRef.current.textContent = '0.0s';
      }

      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, tick]);

  return (
    <span
      ref={displayRef}
      className="font-mono text-[var(--color-secondary)] text-glow-secondary text-sm"
    >
      0.0s
    </span>
  );
}
