import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Code2,
  ExternalLink,
  Eye,
  Heart,
  KeyRound,
  Lock,
  Sparkles,
  Terminal,
  Unlock,
  X,
} from 'lucide-react';
import { ORIGINAL_2019_HTML_SOURCE } from '../../lib/originalMiPaginaSource';
import { loadEasterEggUnlocked, saveEasterEggUnlocked } from '../../lib/storage';

interface EasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const EasterEggModal: React.FC<EasterEggModalProps> = ({ isOpen, onClose }) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => loadEasterEggUnlocked());
  const [answer, setAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'framed' | 'source'>('framed');

  const miPaginaUrl = `${import.meta.env.BASE_URL}mipagina/index.html`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRochinAnswerCorrect(answer)) {
      setIsUnlocked(true);
      saveEasterEggUnlocked(true);
      setErrorMsg(null);
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
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 dark:bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="easter-egg-title"
          onClick={onClose}
        >
          {!isUnlocked ? (
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
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#121419] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
            >
              {/* Museum Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-zinc-50 dark:bg-[#171A21] border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2
                        id="easter-egg-title"
                        className="font-semibold text-sm sm:text-base text-zinc-950 dark:text-zinc-50"
                      >
                        CÁPSULA DEL TIEMPO (2019) — &ldquo;EDGARDO / AJEDREZ&rdquo;
                      </h2>
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-[11px] font-mono">
                        <Heart className="w-3 h-3 fill-current" />
                        Código 100% Original Intacto
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Mi primera página web hecha en el CETis 107 (25 Feb 2019 · Profe Rochin).
                      Conservada en <code>mipagina/index.html</code> sin alterar ni una línea.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('framed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      viewMode === 'framed'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                        : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Cuadro
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('source')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      viewMode === 'source'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                        : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    HTML (2019)
                  </button>

                  <a
                    href={miPaginaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir Vista Original
                  </a>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar cápsula del tiempo"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Museum Body */}
              <div className="flex-1 bg-zinc-100 dark:bg-[#0A0B0E] p-3 sm:p-5 overflow-hidden flex flex-col">
                {viewMode === 'framed' ? (
                  <div className="flex-1 flex flex-col rounded-xl overflow-hidden border-2 border-zinc-300 dark:border-zinc-800 shadow-inner bg-[#B40404]">
                    <div className="px-3 py-1.5 bg-zinc-900 text-zinc-400 flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        <span className="ml-2 text-zinc-200">
                          mipagina/index.html — &lt;title&gt;EDGARDO&lt;/title&gt;
                        </span>
                      </div>
                      <span>25 Feb 2019</span>
                    </div>

                    <iframe
                      src={miPaginaUrl}
                      title="EDGARDO - Primera página web de Ajedrez (2019)"
                      className="w-full flex-1 bg-[#B40404]"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-[#0D1117]">
                    <div className="px-4 py-2 bg-[#161B22] border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
                      <span className="flex items-center gap-2 text-zinc-200">
                        <Terminal className="w-3.5 h-3.5" />
                        mipagina/index.html (Commit faa561ba · 25 Feb 2019 · 133 líneas intactas)
                      </span>
                      <span>HTML Puro</span>
                    </div>
                    <pre className="flex-1 p-4 overflow-auto text-xs font-mono text-zinc-200 leading-relaxed">
                      <code>{ORIGINAL_2019_HTML_SOURCE}</code>
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
