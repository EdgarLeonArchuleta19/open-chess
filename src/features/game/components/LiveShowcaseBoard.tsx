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
    const delay = stepIndex >= OPERA_GAME_MOVES.length ? 2600 : 1200;
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

  return (
    <div className="rounded-3xl bg-white dark:bg-[#121419] border border-zinc-200/80 dark:border-zinc-800/80 p-3 shadow-sm transition-colors duration-200">
      <div className="aspect-square w-full rounded-2xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10">
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
                        stiffness: 420,
                        damping: 34,
                      }}
                      className="relative z-10 w-[82%] h-[82%] flex items-center justify-center will-change-transform"
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
    </div>
  );
};
