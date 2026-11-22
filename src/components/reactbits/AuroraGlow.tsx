import React from 'react';
import { motion } from 'framer-motion';

/**
 * Ultra-subtle ambient light drift (React Bits-inspired minimal aurora).
 * No harsh grids, no noise — just quiet atmospheric depth for dark and light modes.
 */
export const AuroraGlow: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
    >
      <motion.div
        animate={{
          x: ['-6%', '6%', '-6%'],
          y: ['-4%', '5%', '-4%'],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-32 left-1/4 w-[520px] h-[520px] rounded-full bg-zinc-300/40 dark:bg-zinc-700/20 blur-[120px]"
      />
      <motion.div
        animate={{
          x: ['5%', '-5%', '5%'],
          y: ['4%', '-6%', '4%'],
          scale: [1.06, 0.96, 1.06],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-40 right-1/4 w-[480px] h-[480px] rounded-full bg-stone-300/35 dark:bg-zinc-800/25 blur-[130px]"
      />
    </div>
  );
};
