'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface MailViewerProps {
  imageSrc: string;
}

export default function MailViewer({ imageSrc }: MailViewerProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      {/* Thumbnail */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="relative w-full cursor-pointer rounded-lg overflow-hidden border border-[var(--color-border)]"
          onClick={() => setIsZoomed(true)}
        >
          <Image
            src={imageSrc}
            alt="Email screenshot"
            width={600}
            height={400}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
        <p className="text-xs text-[var(--color-muted)]">
          Appuyez pour agrandir
        </p>
      </div>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsZoomed(false)}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white text-xl backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(false);
              }}
              aria-label="Fermer"
            >
              &times;
            </button>

            {/* Zoomed image */}
            <motion.div
              className="w-full h-full overflow-auto touch-pinch-zoom p-4 flex items-center justify-center"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={imageSrc}
                alt="Email screenshot (zoomed)"
                width={1200}
                height={800}
                className="max-w-none w-full h-auto object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
