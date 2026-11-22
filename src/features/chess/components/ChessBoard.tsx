import React from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import type {
  BoardPalette,
  BoardPiece,
  LegalMoveOption,
  PieceColor,
  Square,
} from '../types/chess.types';
import {
  getOrderedBoardSquares,
  PIECE_NAMES_ES,
  squareToCoords,
} from '../engine/chessGameEngine';
import { ChessPieceSvg } from '../../../components/chess/ChessPieceSvg';

interface ChessBoardProps {
  pieces: Partial<Record<Square, BoardPiece>>;
  orientation: PieceColor;
  selectedSquare: Square | null;
  legalMoves: LegalMoveOption[];
  lastMove: { from: Square; to: Square } | null;
  checkedKingSquare: Square | null;
  showCoordinates: boolean;
  palette: BoardPalette;
  disabled?: boolean;
  onSquareClick: (square: Square) => void;
}

const PALETTE_CLASSES: Record<
  BoardPalette,
  { light: string; dark: string; lightCoord: string; darkCoord: string }
> = {
  minimal: {
    light: 'bg-[#ECECE8] dark:bg-[#D6D6D2]',
    dark: 'bg-[#7A818E] dark:bg-[#49505C]',
    lightCoord: 'text-zinc-600',
    darkCoord: 'text-zinc-200/80',
  },
  walnut: {
    light: 'bg-[#EFE6D5] dark:bg-[#E4D7C3]',
    dark: 'bg-[#9E7856] dark:bg-[#7A593E]',
    lightCoord: 'text-[#7A593E]/85',
    darkCoord: 'text-[#EFE6D5]/85',
  },
  slate: {
    light: 'bg-[#E2E8F0] dark:bg-[#CBD5E1]',
    dark: 'bg-[#64748B] dark:bg-[#334155]',
    lightCoord: 'text-slate-600',
    darkCoord: 'text-slate-200/80',
  },
};

export const ChessBoard: React.FC<ChessBoardProps> = ({
  pieces,
  orientation,
  selectedSquare,
  legalMoves,
  lastMove,
  checkedKingSquare,
  showCoordinates,
  palette,
  disabled = false,
  onSquareClick,
}) => {
  const orderedSquares = getOrderedBoardSquares(orientation);
  const colors = PALETTE_CLASSES[palette];

  const legalMoveMap = new Map<Square, LegalMoveOption>();
  for (const m of legalMoves) {
    legalMoveMap.set(m.to, m);
  }

  return (
    <div className="relative w-full max-w-[540px] aspect-square mx-auto select-none">
      <div className="w-full h-full p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#14161B] border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.45)] transition-colors duration-300">
        <LayoutGroup id="openchess-board-pieces">
          <div
            className="w-full h-full grid grid-cols-8 grid-rows-8 rounded-xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10"
            role="grid"
            aria-label="Tablero de ajedrez OpenChess"
          >
            {orderedSquares.map((square) => {
              const { fileIndex, rankIndex } = squareToCoords(square);
              const isLight = (fileIndex + rankIndex) % 2 === 1;
              const piece = pieces[square];
              const isSelected = selectedSquare === square;
              const legalMove = legalMoveMap.get(square);
              const isLastMoveSquare =
                lastMove?.from === square || lastMove?.to === square;
              const isCheckedKing = checkedKingSquare === square;

              const isLeftEdge =
                (orientation === 'w' && fileIndex === 0) ||
                (orientation === 'b' && fileIndex === 7);
              const isBottomEdge =
                (orientation === 'w' && rankIndex === 0) ||
                (orientation === 'b' && rankIndex === 7);

              const baseBg = isLight ? colors.light : colors.dark;
              const coordColor = isLight ? colors.lightCoord : colors.darkCoord;

              const pieceLabel = piece
                ? `, ${PIECE_NAMES_ES[piece.type]} ${piece.color === 'w' ? 'Blanco' : 'Negro'}`
                : '';
              const moveLabel = legalMove
                ? legalMove.isCapture
                  ? ', captura disponible'
                  : ', movimiento legal'
                : '';

              return (
                <button
                  key={square}
                  type="button"
                  disabled={disabled && !piece && !legalMove}
                  data-testid={`square-${square}`}
                  aria-label={`Casilla ${square}${pieceLabel}${moveLabel}`}
                  onClick={() => onSquareClick(square)}
                  className={`relative flex items-center justify-center w-full h-full focus:outline-none ${baseBg}`}
                >
                  {/* Subtle Last Move Highlight */}
                  {isLastMoveSquare && !isSelected && (
                    <span className="absolute inset-0 bg-amber-300/35 dark:bg-amber-400/25 pointer-events-none" />
                  )}

                  {/* Selected Square Highlight */}
                  {isSelected && (
                    <span className="absolute inset-0 bg-amber-400/45 dark:bg-amber-300/35 ring-2 ring-inset ring-zinc-900/40 dark:ring-white/60 pointer-events-none" />
                  )}

                  {/* Checked King Glow */}
                  {isCheckedKing && (
                    <motion.span
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: [0.55, 0.85, 0.55] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      className="absolute inset-0 bg-red-500/60 pointer-events-none"
                    />
                  )}

                  {/* Rank Coordinate */}
                  {showCoordinates && isLeftEdge && (
                    <span
                      className={`absolute top-0.5 left-1 font-mono text-[9px] sm:text-[10px] font-medium leading-none pointer-events-none ${coordColor}`}
                    >
                      {square[1]}
                    </span>
                  )}

                  {/* File Coordinate */}
                  {showCoordinates && isBottomEdge && (
                    <span
                      className={`absolute bottom-0.5 right-1 font-mono text-[9px] sm:text-[10px] font-medium leading-none pointer-events-none ${coordColor}`}
                    >
                      {square[0]}
                    </span>
                  )}

                  {/* Animated Piece with Framer Motion Spring Layout */}
                  {piece && (
                    <motion.div
                      layoutId={piece.id}
                      transition={{
                        type: 'spring',
                        stiffness: 460,
                        damping: 34,
                        mass: 0.7,
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

                  {/* Legal Move Dot (Empty Square) */}
                  {legalMove && !piece && (
                    <motion.span
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      className="relative z-20 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-zinc-900/25 dark:bg-black/35 pointer-events-none"
                    />
                  )}

                  {/* Legal Capture Ring */}
                  {legalMove && piece && (
                    <motion.span
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                      className="absolute inset-1 z-20 rounded-full ring-[3.5px] ring-zinc-900/35 dark:ring-black/45 pointer-events-none"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </div>
  );
};
