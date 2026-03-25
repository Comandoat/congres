'use client';

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full">
      <p className="text-sm text-[var(--color-muted)] mb-1">
        Mail {current}/{total}
      </p>
      <div className="w-full h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percent}%`,
            background: 'linear-gradient(90deg, #0066ff, #00d4ff)',
          }}
        />
      </div>
    </div>
  );
}
