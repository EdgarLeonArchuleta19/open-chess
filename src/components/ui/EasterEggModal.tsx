import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { KeyRound, Lock, Unlock, X } from 'lucide-react';
import { saveEasterEggUnlocked } from '../../lib/storage';

interface EasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

export function isRochinAnswerCorrect(input: string): boolean {
  const normalized = input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return (
    normalized === 'rochin' ||
    normalized === 'profe rochin' ||
    normalized === 'profesor rochin' ||
    normalized.includes('rochin')
  );
}

export const EasterEggModal: React.FC<EasterEggModalProps> = ({
  isOpen,
  onClose,
  onUnlocked,
}) => {
  const [answer, setAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRochinAnswerCorrect(answer)) {
      saveEasterEggUnlocked(true);
      setAnswer('');
      setErrorMsg(null);
      onUnlocked();
    } else {
      setErrorMsg('Respuesta incorrecta... Pista: Una leyenda del CETis 107.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 dark:bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="easter-egg-title"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#121419] border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-mono">
                <Lock className="w-3 h-3" />
                ARCHIVO CLASIFICADO · CETis 107
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2
              id="easter-egg-title"
              className="font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 leading-tight"
            >
              ¿Cuál es el mejor profesor del CETis 107??
            </h2>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Responde correctamente para abrir la cápsula del tiempo original de este
              repositorio (25 de febrero de 2019).
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="cetis-answer-input" className="sr-only">
                  Respuesta secreta
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="cetis-answer-input"
                    type="text"
                    value={answer}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Escribe el apellido del profe..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#0A0B0E] border border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-400 focus:outline-none text-zinc-950 dark:text-zinc-100 font-mono text-sm transition-colors"
                  />
                </div>
                {errorMsg && (
                  <p className="mt-2 text-xs text-red-500 font-medium">{errorMsg}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Desbloquear
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
