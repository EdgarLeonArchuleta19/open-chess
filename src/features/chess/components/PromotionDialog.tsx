import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type {
  PieceColor,
  PromotionPieceType,
  Square,
} from '../types/chess.types';
import { ChessPieceSvg } from '../../../components/chess/ChessPieceSvg';
import { PIECE_NAMES_ES } from '../engine/chessGameEngine';

interface PromotionDialogProps {
  isOpen: boolean;
  color: PieceColor;
  targetSquare: Square | null;
  onSelect: (piece: PromotionPieceType) => void;
  onCancel: () => void;
}

const PROMOTION_OPTIONS: PromotionPieceType[] = ['q', 'r', 'b', 'n'];

export const PromotionDialog: React.FC<PromotionDialogProps> = ({
  isOpen,
  color,
  targetSquare,
  onSelect,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && targetSquare && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="promotion-dialog-title"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#14161B] border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl"
          >
            <h3
              id="promotion-dialog-title"
              className="font-serif text-2xl text-zinc-950 dark:text-zinc-50 text-center"
            >
              Coronación en {targetSquare.toUpperCase()}
            </h3>
            <p className="mt-1 text-xs text-center text-zinc-500 dark:text-zinc-400">
              Elige la pieza a la que deseas promover tu peón
            </p>

            <div className="mt-5 grid grid-cols-4 gap-2.5">
              {PROMOTION_OPTIONS.map((pieceType) => (
                <motion.button
                  key={pieceType}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => onSelect(pieceType)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-[#1B1E25] dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors"
                >
                  <ChessPieceSvg
                    type={pieceType}
                    color={color}
                    className="w-11 h-11"
                  />
                  <span className="mt-1.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                    {PIECE_NAMES_ES[pieceType]}
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
