import React, { useEffect, useRef } from 'react';
import type { MoveRecord } from '../chess/types/chess.types';

interface MoveHistoryPanelProps {
  moves: MoveRecord[];
}

export const MoveHistoryPanel: React.FC<MoveHistoryPanelProps> = ({ moves }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves.length]);

  // Group into pairs: [whiteMove, blackMove?]
  const pairs: Array<{
    moveNumber: number;
    white: MoveRecord;
    black?: MoveRecord;
  }> = [];

  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-[#121419] border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col h-52 sm:h-64 overflow-hidden transition-colors duration-300">
      <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Movimientos
        </span>
        <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
          {moves.length} {moves.length === 1 ? 'jugada' : 'jugadas'}
        </span>
      </div>

      {pairs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            El historial aparecerá aquí al comenzar la partida.
          </p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto divide-y divide-zinc-100/80 dark:divide-zinc-800/50"
        >
          {pairs.map((pair) => (
            <div
              key={pair.moveNumber}
              className="grid grid-cols-12 px-4 py-2 text-xs font-mono items-center hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
            >
              <span className="col-span-2 text-zinc-400 dark:text-zinc-500">
                {pair.moveNumber}.
              </span>
              <span className="col-span-5 font-medium text-zinc-900 dark:text-zinc-100">
                {pair.white.san}
              </span>
              <span className="col-span-5 font-medium text-zinc-600 dark:text-zinc-400">
                {pair.black?.san ?? ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
