import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Cpu, Globe, Shuffle, Users } from 'lucide-react';
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
import { AuroraGlow } from '../../../components/reactbits/AuroraGlow';
import { BlurText } from '../../../components/reactbits/BlurText';
import { SpotlightCard } from '../../../components/reactbits/SpotlightCard';
import { Magnetic } from '../../../components/reactbits/Magnetic';
import { LiveShowcaseBoard } from './LiveShowcaseBoard';

interface HomeScreenProps {
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

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartMatch }) => {
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
    { id: 'online', label: 'Amigos', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'bot', label: 'Bot', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'local', label: 'Local', icon: <Users className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] flex items-center">
      {/* Subtle organic ambient light */}
      <AuroraGlow />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Just the Title + Clean Controls */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="font-serif text-5xl sm:text-6xl tracking-tight leading-none text-zinc-950 dark:text-zinc-50">
              <BlurText text="OpenChess" delayStep={0.08} />
            </h1>

            <SpotlightCard
              className="rounded-3xl bg-white/85 dark:bg-[#111318]/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-[0_14px_45px_rgba(0,0,0,0.04)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
              spotlightColor="rgba(161, 161, 170, 0.14)"
            >
              {/* Mode Selector */}
              <div
                role="tablist"
                aria-label="Modo de juego"
                className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-zinc-100/90 dark:bg-[#0A0B0E]/90 border border-zinc-200/60 dark:border-zinc-800/70"
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
                      className={`relative py-2.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors z-10 ${
                        isActive
                          ? 'text-white dark:text-zinc-950'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="home-mode-pill"
                          transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                          className="absolute inset-0 rounded-xl bg-zinc-900 dark:bg-zinc-100 -z-10"
                        />
                      )}
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Minimal Controls */}
              <div className="mt-5">
                <AnimatePresence mode="wait">
                  {activeTab === 'online' && (
                    <motion.div
                      key="tab-online"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-3 gap-1.5">
                        {(
                          [
                            { id: 'w', label: 'Blancas' },
                            { id: 'random', label: 'Azar' },
                            { id: 'b', label: 'Negras' },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setOnlineSide(opt.id)}
                            className={`py-2 rounded-xl text-xs font-medium border transition-colors flex items-center justify-center gap-1 ${
                              onlineSide === opt.id
                                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100'
                                : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                            }`}
                          >
                            {opt.id === 'random' && <Shuffle className="w-3 h-3" />}
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      <Magnetic className="w-full">
                        <button
                          type="button"
                          onClick={handleCreateRoom}
                          className="w-full py-3 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                          <span>Crear sala</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Magnetic>

                      <form
                        onSubmit={handleJoinRoom}
                        className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={roomInput}
                          onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                          placeholder="Código"
                          maxLength={9}
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#0A0B0E] border border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-300 focus:outline-none font-mono text-xs tracking-widest uppercase text-zinc-950 dark:text-zinc-100"
                        />
                        <button
                          type="submit"
                          disabled={normalizeRoomCode(roomInput).length < 4}
                          className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-35 text-zinc-900 dark:text-zinc-100 font-semibold text-xs transition-colors"
                        >
                          Entrar
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {activeTab === 'bot' && (
                    <motion.div
                      key="tab-bot"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {BOT_DIFFICULTIES.map((diff) => (
                          <button
                            key={diff.id}
                            type="button"
                            onClick={() => setBotDifficulty(diff.id)}
                            className={`py-2.5 px-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                              botDifficulty === diff.id
                                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100'
                                : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
                            }`}
                          >
                            <span className="font-medium text-xs">{diff.label}</span>
                            <span className="font-mono text-[10px] opacity-70">
                              {diff.eloEstimate.replace('~', '').replace(' ELO', '')}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        {(
                          [
                            { id: 'w', label: 'Blancas' },
                            { id: 'random', label: 'Azar' },
                            { id: 'b', label: 'Negras' },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setBotSide(opt.id)}
                            className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                              botSide === opt.id
                                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100'
                                : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      <Magnetic className="w-full">
                        <button
                          type="button"
                          onClick={handleStartBot}
                          className="w-full py-3 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                          <span>Jugar</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Magnetic>
                    </motion.div>
                  )}

                  {activeTab === 'local' && (
                    <motion.div
                      key="tab-local"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="pt-2"
                    >
                      <Magnetic className="w-full">
                        <button
                          type="button"
                          onClick={handleStartLocal}
                          className="w-full py-3.5 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                          <span>Jugar 2 jugadores</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Magnetic>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SpotlightCard>
          </div>

          {/* Right Column: Quiet Living Chessboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 max-w-[430px] w-full mx-auto"
          >
            <LiveShowcaseBoard />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
