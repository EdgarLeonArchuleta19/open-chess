import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Code2, ExternalLink, Eye, Heart, Terminal } from 'lucide-react';
import { ORIGINAL_2019_HTML_SOURCE } from '../../lib/originalMiPaginaSource';

interface EasterEggFullPageProps {
  onExit: () => void;
}

export const EasterEggFullPage: React.FC<EasterEggFullPageProps> = ({ onExit }) => {
  const [viewMode, setViewMode] = useState<'page' | 'source'>('page');
  const miPaginaUrl = `${import.meta.env.BASE_URL}mipagina/index.html`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex flex-col w-screen h-screen bg-[#0A0B0E]"
    >
      {/* Top Bar to exit the Easter Egg or inspect original source */}
      <header className="shrink-0 w-full bg-[#0A0B0E]/95 backdrop-blur-md border-b border-zinc-800 px-3 sm:px-5 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onExit}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Salir del Easter Egg</span>
          </motion.button>

          <div className="hidden md:flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-zinc-100 truncate">
              CÁPSULA DEL TIEMPO (2019) — &ldquo;EDGARDO / AJEDREZ&rdquo;
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] font-mono shrink-0">
              <Heart className="w-3 h-3 fill-current" />
              CETis 107 · Código Original Intacto
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('page')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'page'
                ? 'bg-zinc-100 text-zinc-950'
                : 'bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Página Original</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('source')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'source'
                ? 'bg-zinc-100 text-zinc-950'
                : 'bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">HTML (2019)</span>
          </button>

          <a
            href={miPaginaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Abrir Vista Original</span>
          </a>
        </div>
      </header>

      {/* Full-viewport 2019 Page or Original HTML Source */}
      <main className="flex-1 w-full h-full overflow-hidden">
        {viewMode === 'page' ? (
          <iframe
            src={miPaginaUrl}
            title="EDGARDO - Primera página web de Ajedrez (2019)"
            className="w-full h-full border-0 bg-[#B40404]"
          />
        ) : (
          <div className="w-full h-full flex flex-col bg-[#0D1117]">
            <div className="px-5 py-2.5 bg-[#161B22] border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-2 text-zinc-200">
                <Terminal className="w-3.5 h-3.5" />
                mipagina/index.html (Commit faa561ba · 25 Feb 2019 · 133 líneas intactas)
              </span>
              <span>HTML Puro</span>
            </div>
            <pre className="flex-1 p-5 overflow-auto text-xs sm:text-sm font-mono text-zinc-200 leading-relaxed">
              <code>{ORIGINAL_2019_HTML_SOURCE}</code>
            </pre>
          </div>
        )}
      </main>
    </motion.div>
  );
};
