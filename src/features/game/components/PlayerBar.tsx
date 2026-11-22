import React from 'react';
import { motion } from 'framer-motion';
import type {
  CapturedPieceRecord,
  PieceColor,
} from '../../chess/types/chess.types';
import { ChessPieceSvg } from '../../../components/chess/ChessPieceSvg';
import { PIECE_VALUES } from '../../chess/engine/chessGameEngine';

interface PlayerBarProps {
  color: PieceColor;
  label: string;
  subtitle?: string;
  isActiveTurn: boolean;
  isThinking?: boolean;
  isWinner: boolean;
  capturedByPlayer: CapturedPieceRecord[];
  materialAdvantage: number;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  color,
  label,
  subtitle,
  isActiveTurn,
  isThinking = false,
  isWinner,
  capturedByPlayer,
  materialAdvantage,
}) => {
  const isWhite = color === 'w';
  const sortedCaptured = [...capturedByPlayer].sort(
    (a, b) => PIECE_VALUES[b.type] - PIECE_VALUES[a.type]
  );

  return (
    <div
      className={`rounded-2xl px-3.5 py-2.5 border transition-all duration-300 flex items-center justify-between gap-3 ${
        isActiveTurn
          ? 'bg-white dark:bg-[#161920] border-zinc-900/30 dark:border-zinc-600 shadow-sm'
          : 'bg-white/60 dark:bg-[#111318] border-zinc-200/70 dark:border-zinc-800/70'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
            isWhite
              ? 'bg-[#F4F4F0] border-zinc-300'
              : 'bg-zinc-900 border-zinc-700'
          }`}
        >
          <ChessPieceSvg type="k" color={color} className="w-6 h-6" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-zinc-950 dark:text-zinc-100 truncate">
              {label}
            </span>
            {subtitle && (
              <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                {subtitle}
              </span>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-0.5 min-h-[18px] mt-0.5">
            {sortedCaptured.map((cap) => (
              <div key={cap.id} className="w-4 h-4 -ml-0.5 first:ml-0">
                <ChessPieceSvg
                  type={cap.type}
                  color={cap.color}
                  className="w-full h-full"
                />
              </div>
            ))}
            {materialAdvantage > 0 && (
              <span className="ml-1.5 font-mono text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                +{materialAdvantage}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isWinner && (
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-[11px] font-semibold">
            Ganador
          </span>
        )}

        {isThinking && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[11px] font-mono">
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100"
            />
            Pensando...
          </span>
        )}

        {isActiveTurn && !isThinking && !isWinner && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Turno
          </span>
        )}
      </div>
    </div>
  );
};
