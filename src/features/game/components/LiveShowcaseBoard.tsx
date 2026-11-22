import React, { useEffect, useState } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import {
  applyChessMove,
  createInitialGameState,
  getOrderedBoardSquares,
  squareToCoords,
} from '../../chess/engine/chessGameEngine';
import type { GameStateSnapshot, Square } from '../../chess/types/chess.types';
import { ChessPieceSvg } from '../../../components/chess/ChessPieceSvg';
import { SpotlightCard } from '../../../components/reactbits/SpotlightCard';

/**
 * Paul Morphy's Opera Game (Paris, 1858) — plays smoothly in a quiet loop
 * on the home screen to give OpenChess a genuine, living chess presence.
 */
const OPERA_GAME_MOVES: ReadonlyArray<{ from: Square; to: Square }> = [
  { from: 'e2', to: 'e4' },
  { from: 'e7', to: 'e5' },
  { from: 'g1', to: 'f3' },
  { from: 'd7', to: 'd6' },
  { from: 'd2', to: 'd4' },
  { from: 'c8', to: 'g4' },
  { from: 'd4', to: 'e5' },
  { from: 'g4', to: 'f3' },
  { from: 'd1', to: 'f3' },
  { from: 'd6', to: 'e5' },
  { from: 'f1', to: 'c4' },
  { from: 'g8', to: 'f6' },
  { from: 'f3', to: 'b3' },
  { from: 'd8', to: 'e7' },
  { from: 'b1', to: 'c3' },
  { from: 'c7', to: 'c6' },
  { from: 'c1', to: 'g5' },
  { from: 'b7', to: 'b5' },
  { from: 'c3', to: 'b5' },
  { from: 'c6', to: 'b5' },
  { from: 'c4', to: 'b5' },
  { from: 'b8', to: 'd7' },
  { from: 'e1', to: 'c1' },
  { from: 'a8', to: 'd8' },
  { from: 'd1', to: 'd7' },
  { from: 'd8', to: 'd7' },
  { from: 'h1', to: 'd1' },
  { from: 'e7', to: 'e6' },
  { from: 'b5', to: 'd7' },
  { from: 'f6', to: 'd7' },
  { from: 'b3', to: 'b8' },
  { from: 'd7', to: 'b8' },
  { from: 'd1', to: 'd8' },
];

export const LiveShowcaseBoard: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [snapshot, setSnapshot] = useState<GameStateSnapshot>(() =>
    createInitialGameState()
  );

  useEffect(() => {
    const delay = stepIndex >= OPERA_GAME_MOVES.length ? 2600 : 1250;
    const timer = window.setTimeout(() => {
      if (stepIndex >= OPERA_GAME_MOVES.length) {
        setStepIndex(0);
        setSnapshot(createInitialGameState());
        return;
      }

      const nextMove = OPERA_GAME_MOVES[stepIndex];
      setSnapshot((prev) => {
        const res = applyChessMove(prev, nextMove);
        return res.ok ? res.nextState : prev;
      });
      setStepIndex((prev) => prev + 1);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [stepIndex]);

  const squares = getOrderedBoardSquares('w');
  const latestMove = snapshot.moveHistory[snapshot.moveHistory.length - 1];

  return (
    <SpotlightCard
      className="rounded-3xl bg-white/80 dark:bg-[#111318]/85 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 p-3.5 sm:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
      spotlightColor="rgba(161, 161, 170, 0.14)"
    >
      <div className="flex items-center justify-between px-1 pb-3 text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
        <span>Morphy vs. Duque de Brunswick · 1858</span>
        <span className="text-zinc-700 dark:text-zinc-300 font-medium">
          {latestMove
            ? `${latestMove.moveNumber}.${latestMove.color === 'w' ? '' : '..'} ${latestMove.san}`
            : 'Inicio'}
        </span>
      </div>

      <div className="aspect-square w-full rounded-xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10">
        <LayoutGroup id="showcase-opera-board">
          <div className="w-full h-full grid grid-cols-8 grid-rows-8">
            {squares.map((sq) => {
              const { fileIndex, rankIndex } = squareToCoords(sq);
              const isLight = (fileIndex + rankIndex) % 2 === 1;
              const piece = snapshot.pieces[sq];
              const isLast =
                snapshot.lastMove?.from === sq || snapshot.lastMove?.to === sq;
              const isCheckedKing = snapshot.status.checkedKingSquare === sq;

              return (
                <div
                  key={sq}
                  className={`relative flex items-center justify-center ${
                    isLight
                      ? 'bg-[#ECECE8] dark:bg-[#D4D4CE]'
                      : 'bg-[#7A818E] dark:bg-[#484F5B]'
                  }`}
                >
                  {isLast && (
                    <span className="absolute inset-0 bg-amber-300/35 dark:bg-amber-400/25 pointer-events-none" />
                  )}
                  {isCheckedKing && (
                    <span className="absolute inset-0 bg-red-500/55 pointer-events-none" />
                  )}
                  {piece && (
                    <motion.div
                      layoutId={`showcase-${piece.id}`}
                      transition={{
                        type: 'spring',
                        stiffness: 340,
                        damping: 30,
                      }}
                      className="relative z-10 w-[82%] h-[82%] flex items-center justify-center"
                    >
                      <ChessPieceSvg
                        type={piece.type}
                        color={piece.color}
                        className="w-full h-full"
                      />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </SpotlightCard>
  );
};
