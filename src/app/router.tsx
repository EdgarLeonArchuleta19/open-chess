import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { EasterEggModal } from '../components/ui/EasterEggModal';
import { EasterEggFullPage } from '../features/easter-egg/EasterEggFullPage';
import type {
  ActiveMatchConfig,
  AppPreferences,
} from '../features/chess/types/chess.types';
import { HomeScreen } from '../features/game/components/HomeScreen';
import { GameScreen } from '../features/game/components/GameScreen';
import { normalizeRoomCode } from '../features/online/usePeerRoom';
import {
  loadEasterEggUnlocked,
  loadPreferences,
  savePreferences,
} from '../lib/storage';

function detectInitialRoomFromUrl(): ActiveMatchConfig | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const rawRoom = params.get('room');
  if (!rawRoom) return null;
  const cleaned = normalizeRoomCode(rawRoom);
  if (cleaned.length < 4) return null;

  return {
    mode: 'online',
    playerColor: 'b',
    roomCode: cleaned,
    isHost: false,
  };
}

function isEasterEggHashActive(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hash === '#/107';
}

export const AppRouter: React.FC = () => {
  const [preferences, setPreferences] = useState<AppPreferences>(() =>
    loadPreferences()
  );
  const [activeMatch, setActiveMatch] = useState<ActiveMatchConfig | null>(() =>
    detectInitialRoomFromUrl()
  );
  const [isEasterEggChallengeOpen, setIsEasterEggChallengeOpen] = useState(false);
  const [isEasterEggRouteOpen, setIsEasterEggRouteOpen] = useState<boolean>(
    () => isEasterEggHashActive() && loadEasterEggUnlocked()
  );

  // Sync dark/light mode class onto <html>
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [preferences.theme]);

  // Listen for browser back/forward button on #/107 hash route
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#/107' && loadEasterEggUnlocked()) {
        setIsEasterEggRouteOpen(true);
      } else {
        setIsEasterEggRouteOpen(false);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const updatePreferences = useCallback(
    (updater: (prev: AppPreferences) => AppPreferences) => {
      setPreferences((prev) => {
        const next = updater(prev);
        savePreferences(next);
        return next;
      });
    },
    []
  );

  const handleToggleTheme = useCallback(() => {
    updatePreferences((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, [updatePreferences]);

  const handleToggleSound = useCallback(() => {
    updatePreferences((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  }, [updatePreferences]);

  const handleExitToHome = useCallback(() => {
    setActiveMatch(null);
    if (typeof window !== 'undefined' && window.location.search.includes('room=')) {
      const cleanUrl = `${window.location.origin}${window.location.pathname}`;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);

  const handleClickEasterEggIcon = useCallback(() => {
    if (loadEasterEggUnlocked()) {
      window.location.hash = '#/107';
      setIsEasterEggRouteOpen(true);
    } else {
      setIsEasterEggChallengeOpen(true);
    }
  }, []);

  const handleUnlockEasterEgg = useCallback(() => {
    setIsEasterEggChallengeOpen(false);
    window.location.hash = '#/107';
    setIsEasterEggRouteOpen(true);
  }, []);

  const handleExitEasterEggRoute = useCallback(() => {
    setIsEasterEggRouteOpen(false);
    if (typeof window !== 'undefined' && window.location.hash === '#/107') {
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}${window.location.search}`
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] dark:bg-[#0A0B0E] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <Header
        isInGame={Boolean(activeMatch)}
        theme={preferences.theme}
        soundEnabled={preferences.soundEnabled}
        onNavigateHome={handleExitToHome}
        onToggleTheme={handleToggleTheme}
        onToggleSound={handleToggleSound}
        onOpenEasterEgg={handleClickEasterEggIcon}
      />

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {!activeMatch ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <HomeScreen
                theme={preferences.theme}
                onStartMatch={(cfg) => setActiveMatch(cfg)}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`game-${activeMatch.mode}-${activeMatch.roomCode ?? 'local'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <GameScreen
                config={activeMatch}
                preferences={preferences}
                onUpdatePreferences={updatePreferences}
                onExitToHome={handleExitToHome}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-5 px-4 border-t border-zinc-200/70 dark:border-zinc-800/70 text-center text-xs text-zinc-400 dark:text-zinc-500 transition-colors duration-300">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-serif text-sm text-zinc-700 dark:text-zinc-300">
            Open<span className="italic opacity-75">Chess</span>
          </span>
          <span className="font-mono text-[11px]">
            Libre · Sin cuentas · Sin anuncios · PWA
          </span>
        </div>
      </footer>

      {/* Challenge modal before unlocking */}
      <EasterEggModal
        isOpen={isEasterEggChallengeOpen}
        onClose={() => setIsEasterEggChallengeOpen(false)}
        onUnlocked={handleUnlockEasterEgg}
      />

      {/* Full-page route (#/107) displaying the untouched 2019 mipagina/index.html */}
      <AnimatePresence>
        {isEasterEggRouteOpen && (
          <EasterEggFullPage onExit={handleExitEasterEggRoute} />
        )}
      </AnimatePresence>
    </div>
  );
};
