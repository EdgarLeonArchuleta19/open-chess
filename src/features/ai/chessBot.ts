import { Chess, type Move } from 'chess.js';
import type {
  BotDifficulty,
  PieceType,
  PromotionPieceType,
  Square,
} from '../chess/types/chess.types';

export interface BotDifficultyInfo {
  id: BotDifficulty;
  label: string;
  eloEstimate: string;
  description: string;
}

export const BOT_DIFFICULTIES: readonly BotDifficultyInfo[] = [
  {
    id: 'beginner',
    label: 'Principiante',
    eloEstimate: '~600 ELO',
    description: 'Ideal para partidas relajadas y aprender aperturas.',
  },
  {
    id: 'intermediate',
    label: 'Intermedio',
    eloEstimate: '~1100 ELO',
    description: 'Encuentra tácticas básicas y castiga descuidos.',
  },
  {
    id: 'advanced',
    label: 'Avanzado',
    eloEstimate: '~1500 ELO',
    description: 'Calcula combinaciones y domina el centro del tablero.',
  },
  {
    id: 'master',
    label: 'Maestro',
    eloEstimate: '~1900 ELO',
    description: 'Búsqueda profunda con poda Alpha-Beta y estrategia posicional.',
  },
];

const PIECE_WEIGHTS: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-square tables from White's perspective (rank 8 at index 0 -> rank 1 at index 7)
const PST: Record<PieceType, number[][]> = {
  p: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 27, 27, 10, 5, 5],
    [0, 0, 0, 24, 24, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
  b: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ],
  r: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
  ],
  q: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
  ],
  k: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
  ],
};

function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -99999 : 99999;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isInsufficientMaterial()) {
    return 0;
  }

  const board = chess.board();
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;
      const type = piece.type as PieceType;
      const baseValue = PIECE_WEIGHTS[type];
      const tableRow = piece.color === 'w' ? r : 7 - r;
      const positional = PST[type][tableRow][f];
      const total = baseValue + positional;
      score += piece.color === 'w' ? total : -total;
    }
  }

  return score;
}

function scoreMoveForOrdering(move: Move): number {
  let score = 0;
  if (move.captured) {
    score +=
      10 * PIECE_WEIGHTS[move.captured as PieceType] -
      PIECE_WEIGHTS[move.piece as PieceType];
  }
  if (move.promotion) {
    score += PIECE_WEIGHTS[move.promotion as PieceType];
  }
  if (move.san.includes('+')) {
    score += 45;
  }
  return score;
}

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingWhite: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });
  moves.sort((a, b) => scoreMoveForOrdering(b) - scoreMoveForOrdering(a));

  if (isMaximizingWhite) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      if (evalScore > maxEval) maxEval = evalScore;
      if (evalScore > alpha) alpha = evalScore;
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      if (evalScore < minEval) minEval = evalScore;
      if (evalScore < beta) beta = evalScore;
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export interface BotMoveResult {
  from: Square;
  to: Square;
  promotion?: PromotionPieceType;
}

/**
 * Computes the bot's next move for the given FEN and difficulty level.
 * Returns null if no legal moves exist.
 */
export function computeBotMove(
  fen: string,
  difficulty: BotDifficulty
): BotMoveResult | null {
  const chess = new Chess(fen);
  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  // Beginner: 45% chance of random legal move, otherwise shallow 1-ply evaluation with noise
  if (difficulty === 'beginner' && Math.random() < 0.45) {
    const pick = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return {
      from: pick.from as Square,
      to: pick.to as Square,
      promotion: pick.promotion as PromotionPieceType | undefined,
    };
  }

  const depthByDifficulty: Record<BotDifficulty, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    master: 3,
  };

  const noiseByDifficulty: Record<BotDifficulty, number> = {
    beginner: 90,
    intermediate: 28,
    advanced: 6,
    master: 0,
  };

  const depth = depthByDifficulty[difficulty];
  const noise = noiseByDifficulty[difficulty];
  const isWhiteTurn = chess.turn() === 'w';

  legalMoves.sort((a, b) => scoreMoveForOrdering(b) - scoreMoveForOrdering(a));

  let bestMove = legalMoves[0];
  let bestScore = isWhiteTurn ? -Infinity : Infinity;

  for (const move of legalMoves) {
    chess.move(move);
    const rawScore = minimax(
      chess,
      depth - 1,
      -Infinity,
      Infinity,
      !isWhiteTurn
    );
    chess.undo();

    const jitter = noise > 0 ? (Math.random() * 2 - 1) * noise : 0;
    const score = rawScore + jitter;

    if (isWhiteTurn) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  return {
    from: bestMove.from as Square,
    to: bestMove.to as Square,
    promotion: bestMove.promotion as PromotionPieceType | undefined,
  };
}
