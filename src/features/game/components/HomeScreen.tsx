import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Cpu, Globe, Shuffle, Users } from 'lucide-react';
import type {
  ActiveMatchConfig,
  AppTheme,
  BotDifficulty,
  PieceColor,
} from '../../chess/types/chess.types';
import { BOT_DIFFICULTIES } from '../../ai/chessBot';
import {
  generateRoomCode,
  normalizeRoomCode,
} from '../../online/usePeerRoom';
import { SquaresBackground } from '../../../components/reactbits/SquaresBackground';
import { BlurText } from '../../../components/reactbits/BlurText';
import { SpotlightCard } from '../../../components/reactbits/SpotlightCard';
import { Magnetic } from '../../../components/reactbits/Magnetic';
import { LiveShowcaseBoard } from './LiveShowcaseBoard';

interface HomeScreenProps {
  theme: AppTheme;
  onStartMatch: (config: ActiveMatchConfig) => void;
}

type HomeTab = 'online' | 'bot' | 'local';
type SideChoice = 'w' | 'b' | 'random';

function resolveSide(choice: SideChoice): PieceColor {
  if (choice === 'random') {
    return Math.random() < 0.5 ? 'w' : 'b';
  }
  return choice;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ theme, onStartMatch }) => {
  const [activeTab, setActiveTab] = useState<HomeTab>('online');
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

  const tabs: Array<{ id: HomeTab; label: string; icon: React.ReactNode }> = [
    { id: 'online', label: 'Sala con Amigos', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'bot', label: 'Contra el Bot', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'local', label: '2 Jugadores Local', icon: <Users className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="relative w-full min-h-[calc(100vh-8rem)] flex items-center">
      {/* React Bits Interactive Canvas Grid Background */}
      <SquaresBackground theme={theme} squareSize={54} speed={0.22} />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline + Tactile Mode Launcher */}
          <div className="lg:col-span-7 space-y-7">
            <div className="space-y-3">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500"
              >
                OpenChess · Libre · PWA · Sin cuentas
              </motion.p>

              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.98] text-zinc-950 dark:text-zinc-50">
                <BlurText text="Ajedrez limpio," delayStep={0.08} />
                <br />
                <span className="italic text-zinc-500 dark:text-zinc-400">
                  <BlurText text="sin distracciones." delayStep={0.08} initialDelay={0.18} />
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed pt-1"
              >
                Crea una sala privada para jugar con un amigo, entrena contra el bot o comparte el
                tablero en persona. Sin registro ni anuncios.
              </motion.p>
            </div>

            {/* React Bits SpotlightCard Launcher */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <SpotlightCard
                className="rounded-3xl bg-white/85 dark:bg-[#111318]/90 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 p-5 sm:p-6 shadow-[0_14px_45px_rgba(0,0,0,0.05)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
                spotlightColor="rgba(161, 161, 170, 0.14)"
              >
                {/* Animated Segmented Mode Tabs */}
                <div
                  role="tablist"
                  aria-label="Modo de juego"
                  className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-zinc-100/90 dark:bg-[#0A0B0E]/90 border border-zinc-200/70 dark:border-zinc-800/80"
                >
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative py-2.5 px-2 sm:px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors z-10 ${
                          isActive
                            ? 'text-white dark:text-zinc-950'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="home-mode-pill"
                            transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                            className="absolute inset-0 rounded-xl bg-zinc-900 dark:bg-zinc-100 -z-10 shadow-sm"
                          />
                        )}
                        {tab.icon}
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Body */}
                <div className="mt-5 min-h-[195px] flex flex-col justify-between">
                  <AnimatePresence mode="wait">
                    {activeTab === 'online' && (
                      <motion.div
                        key="tab-online"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            Tu color al crear sala:
                          </span>
                          <div className="flex items-center gap-1.5">
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
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1 ${
                                  onlineSide === opt.id
                                    ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100'
                                    : 'bg-zinc-50 dark:bg-[#181B22] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300'
                                }`}
                              >
                                {opt.id === 'random' && <Shuffle className="w-3 h-3" />}
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <Magnetic className="sm:flex-1">
                            <button
                              type="button"
                              onClick={handleCreateRoom}
                              className="w-full py-3 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                            >
                              <span>Crear sala privada</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </Magnetic>
                        </div>

                        <form
                          onSubmit={handleJoinRoom}
                          className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={roomInput}
                            onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                            placeholder="Código de sala (ej. A7K9M2)"
                            maxLength={9}
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#0A0B0E] border border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-300 focus:outline-none font-mono text-xs tracking-widest uppercase text-zinc-950 dark:text-zinc-100"
                          />
                          <button
                            type="submit"
                            disabled={normalizeRoomCode(roomInput).length < 4}
                            className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 text-zinc-900 dark:text-zinc-100 font-semibold text-xs transition-colors shrink-0"
                          >
                            Unirse
                          </button>
                        </form>
                      </motion.div>
                    )}

                    {activeTab === 'bot' && (
                      <motion.div
                        key="tab-bot"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {BOT_DIFFICULTIES.map((diff) => (
                            <button
                              key={diff.id}
                              type="button"
                              onClick={() => setBotDifficulty(diff.id)}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                botDifficulty === diff.id
                                  ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100'
                                  : 'bg-zinc-50 dark:bg-[#181B22] border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                              }`}
                            >
                              <div className="font-semibold text-xs">{diff.label}</div>
                              <div
                                className={`font-mono text-[10px] mt-0.5 ${
                                  botDifficulty === diff.id
                                    ? 'opacity-75'
                                    : 'text-zinc-400'
                                }`}
                              >
                                {diff.eloEstimate}
                              </div>
                            </button>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div className="flex items-center gap-1.5">
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
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                                  botSide === opt.id
                                    ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100'
                                    : 'bg-zinc-50 dark:bg-[#181B22] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>

                          <Magnetic>
                            <button
                              type="button"
                              onClick={handleStartBot}
                              className="py-2.5 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-semibold text-xs flex items-center gap-2 transition-colors"
                            >
                              <span>Jugar vs Bot</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </Magnetic>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'local' && (
                      <motion.div
                        key="tab-local"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col justify-between gap-5 py-2"
                      >
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          Dos jugadores en la misma pantalla — PC, tablet o celular. Incluye
                          opción de auto-giro del tablero en cada turno, deshacer jugadas y
                          acuerdo de tablas. Funciona 100 % sin internet.
                        </p>

                        <div>
                          <Magnetic className="w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={handleStartLocal}
                              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                            >
                              <span>Iniciar partida local</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </Magnetic>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </SpotlightCard>
            </motion.div>
          </div>

          {/* Right Column: Live Animated Opera Game Showcase Board */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 max-w-[420px] w-full mx-auto"
          >
            <LiveShowcaseBoard />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
