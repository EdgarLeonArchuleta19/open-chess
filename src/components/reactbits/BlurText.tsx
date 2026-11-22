import React from 'react';
import { motion } from 'framer-motion';

interface BlurTextProps {
  text: string;
  className?: string;
  delayStep?: number;
  initialDelay?: number;
}

/**
 * React Bits-inspired `BlurText` component.
 * Animates each word from a subtle blur and vertical offset into crisp focus.
 */
export const BlurText: React.FC<BlurTextProps> = ({
  text,
  className = '',
  delayStep = 0.07,
  initialDelay = 0,
}) => {
  const words = text.split(' ');

  return (
    <span className={`inline-flex flex-wrap gap-x-[0.26em] ${className}`}>
      {words.map((word, idx) => (
        <motion.span
          key={`${word}-${idx}`}
          initial={{ opacity: 0, y: 14, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.55,
            delay: initialDelay + idx * delayStep,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block will-change-transform"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};
