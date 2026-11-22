import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Cpu,
  Globe,
  Shuffle,
  Smartphone,
  Sparkles,
  Users,
} from 'lucide-react';
import type {
  ActiveMatchConfig,
  BotDifficulty,
  PieceColor,
} from '../../chess/types/chess.types';
import { BOT_DIFFICULTIES } from '../../ai/chessBot';
import {
  generateRoomCode,
  normalizeRoomCode,
} from '../../online/usePeerRoom';
import { Wordmark } from '../../../components/chess/Wordmark';

interface HomeScreenProps {
  onStartMatch: (config: ActiveMatchConfig) => void;
}

type SideChoice = 'w' | 'b' | 'random';

function resolveSide(choice: SideChoice): PieceColor {
  if (choice === 'random') {
    return Math.random() < 0.5 ? 'w' : 'b';
  }
  return choice;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartMatch }) => {
  const [expandedPanel, setExpandedPanel] = useState<'none' | 'online' | 'bot'>('none');
  const [roomInput, setRoomInput] = useState('');
  const [onlineSide, setOnlineSide] = useState<SideChoice>('random');
  const [botSide, setBotSide] = useState<SideChoice>('w');
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('intermediate');

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    onStartMatch({
      mode: 'online',
      playerColor: resolveSide(onlineSide),
      roomCode: code,
      isHost: true,
    });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = normalizeRoomCode(roomInput);
    if (cleaned.length < 4) return;
    onStartMatch({
      mode: 'online',
      playerColor: 'b',
      roomCode: cleaned,
      isHost: false,
    });
  };

  const handleStartBot = () => {
    onStartMatch({
      mode: 'bot',
      playerColor: resolveSide(botSide),
      botDifficulty,
    });
  };

  const handleStartLocal = () => {
    onStartMatch({
      mode: 'local',
      playerColor: 'w',
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Editorial Minimalist Hero */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="text-center space-y-4 mb-12 sm:mb-14"
      >
        <Wordmark size="lg" />

        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
          Ajedrez minimalista y libre. Juega con amigos al instante, en el mismo dispositivo o
          contra la IA. Sin cuentas, sin anuncios.
        </p>
      </motion.div>

      {/* 3 Primary Mode Cards */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Mode 1: Online Rooms */}
        <motion.button
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.985 }}
          type="button"
          onClick={() =>
            setExpandedPanel((prev) => (prev === 'online' ? 'none' : 'online'))
          }
          className={`text-left p-6 rounded-2xl border transition-all flex flex-col justify-between min-h-[176px] ${
            expandedPanel === 'online'
              ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100 shadow-lg'
              : 'bg-white dark:bg-[#121419] border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-400 dark:hover:border-zinc-600'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div
              className={`p-2.5 rounded-xl ${
                expandedPanel === 'online'
                  ? 'bg-white/15 dark:bg-black/10'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200'
              }`}
            >
              <Globe className="w-5 h-5" />
            </div>
            <span
              className={`text-[11px] font-mono ${
                expandedPanel === 'online'
                  ? 'opacity-75'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              P2P · Enlace
            </span>
          </div>

          <div className="mt-6">
            <h2 className="font-semibold text-base tracking-tight">Sala con Amigos</h2>
            <p
              className={`mt-1 text-xs leading-relaxed ${
                expandedPanel === 'online'
                  ? 'opacity-80'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              Crea una sala privada en un clic y comparte el enlace o código.
            </p>
          </div>
        </motion.button>

        {/* Mode 2: Vs Bot */}
        <motion.button
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.985 }}
          type="button"
          onClick={() => setExpandedPanel((prev) => (prev === 'bot' ? 'none' : 'bot'))}
          className={`text-left p-6 rounded-2xl border transition-all flex flex-col justify-between min-h-[176px] ${
            expandedPanel === 'bot'
              ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100 shadow-lg'
              : 'bg-white dark:bg-[#121419] border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-400 dark:hover:border-zinc-600'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div
              className={`p-2.5 rounded-xl ${
                expandedPanel === 'bot'
                  ? 'bg-white/15 dark:bg-black/10'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200'
              }`}
            >
              <Cpu className="w-5 h-5" />
            </div>
            <span
              className={`text-[11px] font-mono ${
                expandedPanel === 'bot'
                  ? 'opacity-75'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              4 Niveles
            </span>
          </div>

          <div className="mt-6">
            <h2 className="font-semibold text-base tracking-tight">Contra el Bot</h2>
            <p
              className={`mt-1 text-xs leading-relaxed ${
                expandedPanel === 'bot'
                  ? 'opacity-80'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              Entrena offline contra nuestra IA desde Principiante hasta Maestro.
            </p>
          </div>
        </motion.button>

        {/* Mode 3: Local 2 Players */}
        <motion.button
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.985 }}
          type="button"
          onClick={handleStartLocal}
          className="text-left p-6 rounded-2xl border bg-white dark:bg-[#121419] border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-900 dark:hover:border-zinc-300 transition-all flex flex-col justify-between min-h-[176px] group"
        >
          <div className="flex items-center justify-between w-full">
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-all" />
          </div>

          <div className="mt-6">
            <h2 className="font-semibold text-base tracking-tight text-zinc-950 dark:text-zinc-50">
              2 Jugadores Local
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Juega cara a cara en la misma pantalla, PC o celular al instante.
            </p>
          </div>
        </motion.button>
      </motion.div>

      {/* Expandable Configuration Drawer (Online Room or Bot Setup) */}
      <AnimatePresence mode="wait">
        {expandedPanel === 'online' && (
          <motion.div
            key="online-panel"
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden mt-5"
          >
            <div className="rounded-2xl bg-white dark:bg-[#121419] border border-zinc-200 dark:border-zinc-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create Room */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-zinc-950 dark:text-zinc-50">
                    Crear nueva sala
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Elige tu color y comparte el enlace generado con tu amigo.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'w', label: 'Blancas' },
                      { id: 'random', label: 'Aleatorio' },
                      { id: 'b', label: 'Negras' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setOnlineSide(opt.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                        onlineSide === opt.id
                          ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100'
                          : 'bg-zinc-50 dark:bg-[#181B22] border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {opt.id === 'random' && <Shuffle className="w-3 h-3" />}
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleCreateRoom}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Crear sala privada</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>

              {/* Join Room */}
              <form
                onSubmit={handleJoinRoom}
                className="space-y-4 md:border-l md:border-zinc-200 md:dark:border-zinc-800 md:pl-6"
              >
                <div>
                  <h3 className="font-semibold text-sm text-zinc-950 dark:text-zinc-50">
                    Unirse con código
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    ¿Tu amigo ya creó una sala? Ingresa el código de 6 caracteres.
                  </p>
                </div>

                <input
                  type="text"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                  placeholder="Ej. A7K9M2"
                  maxLength={9}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#0A0B0E] border border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-300 focus:outline-none font-mono text-sm tracking-widest uppercase text-zinc-950 dark:text-zinc-100"
                />

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={normalizeRoomCode(roomInput).length < 4}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 text-zinc-900 dark:text-zinc-100 font-semibold text-xs transition-colors"
                >
                  Entrar a la sala
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}

        {expandedPanel === 'bot' && (
          <motion.div
            key="bot-panel"
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden mt-5"
          >
            <div className="rounded-2xl bg-white dark:bg-[#121419] border border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
              <div>
                <h3 className="font-semibold text-sm text-zinc-950 dark:text-zinc-50">
                  Selecciona la dificultad del Bot
                </h3>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {BOT_DIFFICULTIES.map((diff) => (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => setBotDifficulty(diff.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        botDifficulty === diff.id
                          ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100'
                          : 'bg-zinc-50 dark:bg-[#181B22] border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs">{diff.label}</span>
                        <span
                          className={`font-mono text-[10px] ${
                            botDifficulty === diff.id ? 'opacity-75' : 'text-zinc-400'
                          }`}
                        >
                          {diff.eloEstimate}
                        </span>
                      </div>
                      <p
                        className={`mt-1.5 text-[11px] leading-snug ${
                          botDifficulty === diff.id
                            ? 'opacity-80'
                            : 'text-zinc-500 dark:text-zinc-400'
                        }`}
                      >
                        {diff.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-1">
                    Jugar con:
                  </span>
                  {(
                    [
                      { id: 'w', label: 'Blancas' },
                      { id: 'random', label: 'Aleatorio' },
                      { id: 'b', label: 'Negras' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBotSide(opt.id)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                        botSide === opt.id
                          ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100'
                          : 'bg-zinc-50 dark:bg-[#181B22] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleStartBot}
                  className="py-2.5 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Iniciar partida</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimalist Principles Strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="mt-14 pt-8 border-t border-zinc-200/70 dark:border-zinc-800/70 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-zinc-400 dark:text-zinc-500"
      >
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Sin cuentas ni registro
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5" />
          Instalable como App (PWA)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          100% libre y sin anuncios
        </span>
      </motion.div>
    </div>
  );
};
