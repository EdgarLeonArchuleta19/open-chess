import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Eye, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import type { AppTheme } from '../../features/chess/types/chess.types';
import { Wordmark } from '../chess/Wordmark';

interface HeaderProps {
  isInGame: boolean;
  theme: AppTheme;
  soundEnabled: boolean;
  onNavigateHome: () => void;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onOpenEasterEgg: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isInGame,
  theme,
  soundEnabled,
  onNavigateHome,
  onToggleTheme,
  onToggleSound,
  onOpenEasterEgg,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#F7F7F5]/80 dark:bg-[#0A0B0E]/80 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/70 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isInGame && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={onNavigateHome}
              aria-label="Volver al inicio"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121419] text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
          )}
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-left focus:outline-none group"
            aria-label="Ir al inicio de OpenChess"
          >
            <Wordmark size="sm" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            aria-label={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#121419] text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </motion.button>

          {/* Theme Toggle (Dark / Light) */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#121419] text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors relative overflow-hidden w-9 h-9 flex items-center justify-center"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ y: -14, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 14, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* Preserved 2019 CETis 107 / Rochin Easter Egg Relic Icon */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={onOpenEasterEgg}
            title="Reliquia 107?"
            aria-label="Icono misterioso CETis 107"
            className="px-2.5 py-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-[#121419]/80 text-zinc-500 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px] font-semibold tracking-tight">107?</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
