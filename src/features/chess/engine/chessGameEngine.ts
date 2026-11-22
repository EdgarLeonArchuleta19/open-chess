import { Chess } from 'chess.js';
import type {
  BoardPiece,
  CapturedPieceRecord,
  FileChar,
  GameStateSnapshot,
  LegalMoveOption,
  MatchStatus,
  MoveRecord,
  PieceColor,
  PieceType,
  PromotionPieceType,
  RankChar,
  Square,
} from '../types/chess.types';

export const STANDARD_START_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const FILES: readonly FileChar[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS: readonly RankChar[] = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const PIECE_NAMES_ES: Record<PieceType, string> = {
  p: 'Peón',
  n: 'Caballo',
  b: 'Alfil',
  r: 'Torre',
  q: 'Dama',
  k: 'Rey',
};

export const PIECE_VALUES: Record<PieceType, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export function squareToCoords(square: Square): { fileIndex: number; rankIndex: number } {
  return {
    fileIndex: square.charCodeAt(0) - 'a'.charCodeAt(0),
    rankIndex: square.charCodeAt(1) - '1'.charCodeAt(0),
  };
}

export function getPositionKey(fen: string): string {
  return fen.split(' ').slice(0, 4).join(' ');
}

export function findKingSquare(
  pieces: Partial<Record<Square, BoardPiece>>,
  color: PieceColor
): Square | null {
  for (const piece of Object.values(pieces)) {
    if (piece && piece.color === color && piece.type === 'k') {
      return piece.square;
    }
  }
  return null;
}

export function evaluateMatchStatus(
  chess: Chess,
  pieces: Partial<Record<Square, BoardPiece>>,
  positionCounts: Record<string, number>
): MatchStatus {
  const activeTurn = chess.turn() as PieceColor;
  const inCheck = chess.inCheck();
  const checkedKingSquare = inCheck ? findKingSquare(pieces, activeTurn) : null;
  const activeName = activeTurn === 'w' ? 'Blancas' : 'Negras';
  const opponentColor: PieceColor = activeTurn === 'w' ? 'b' : 'w';
  const opponentName = opponentColor === 'w' ? 'Blancas' : 'Negras';

  if (chess.isCheckmate()) {
    return {
      outcome: 'checkmate',
      isGameOver: true,
      inCheck: true,
      checkedKingSquare,
      winner: opponentColor,
      statusMessage: `Jaque mate · Ganan ${opponentName}`,
    };
  }

  if (chess.isStalemate()) {
    return {
      outcome: 'stalemate',
      isGameOver: true,
      inCheck: false,
      checkedKingSquare: null,
      winner: 'draw',
      statusMessage: 'Tablas · Rey ahogado',
    };
  }

  if (chess.isInsufficientMaterial()) {
    return {
      outcome: 'draw-insufficient',
      isGameOver: true,
      inCheck: false,
      checkedKingSquare: null,
      winner: 'draw',
      statusMessage: 'Tablas · Material insuficiente',
    };
  }

  const halfMoveClock = Number(chess.fen().split(' ')[4] ?? 0);
  if (halfMoveClock >= 100) {
    return {
      outcome: 'draw-fifty-move',
      isGameOver: true,
      inCheck: false,
      checkedKingSquare: null,
      winner: 'draw',
      statusMessage: 'Tablas · Regla de los 50 movimientos',
    };
  }

  const posKey = getPositionKey(chess.fen());
  if ((positionCounts[posKey] ?? 0) >= 3) {
    return {
      outcome: 'draw-repetition',
      isGameOver: true,
      inCheck: false,
      checkedKingSquare: null,
      winner: 'draw',
      statusMessage: 'Tablas · Triple repetición',
    };
  }

  if (inCheck) {
    return {
      outcome: 'check',
      isGameOver: false,
      inCheck: true,
      checkedKingSquare,
      winner: null,
      statusMessage: `Jaque · Turno de ${activeName}`,
    };
  }

  return {
    outcome: 'active',
    isGameOver: false,
    inCheck: false,
    checkedKingSquare: null,
    winner: null,
    statusMessage: `Turno de ${activeName}`,
  };
}

export function createInitialGameState(initialFen: string = STANDARD_START_FEN): GameStateSnapshot {
  const chess = new Chess(initialFen);
  const board = chess.board();
  const pieces: Partial<Record<Square, BoardPiece>> = {};

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const cell = board[r][f];
      if (cell) {
        const square = cell.square as Square;
        pieces[square] = {
          id: `${cell.color}-${cell.type}-${square}`,
          type: cell.type as PieceType,
          color: cell.color as PieceColor,
          square,
        };
      }
    }
  }

  const posKey = getPositionKey(chess.fen());
  const positionCounts: Record<string, number> = { [posKey]: 1 };

  return {
    fen: chess.fen(),
    turn: chess.turn() as PieceColor,
    pieces,
    capturedPieces: {
      w: [],
      b: [],
    },
    moveHistory: [],
    lastMove: null,
    status: evaluateMatchStatus(chess, pieces, positionCounts),
    positionCounts,
  };
}

export function getLegalMovesForSquare(
  state: GameStateSnapshot,
  square: Square
): LegalMoveOption[] {
  if (state.status.isGameOver) return [];
  const piece = state.pieces[square];
  if (!piece || piece.color !== state.turn) return [];

  const chess = new Chess(state.fen);
  const rawMoves = chess.moves({ square, verbose: true });
  const byTarget = new Map<Square, LegalMoveOption>();

  for (const m of rawMoves) {
    const to = m.to as Square;
    if (byTarget.has(to)) continue;
    byTarget.set(to, {
      from: square,
      to,
      san: m.san,
      isCapture: m.flags.includes('c') || m.flags.includes('e'),
      isPromotion: Boolean(m.promotion) || m.flags.includes('p'),
      isEnPassant: m.flags.includes('e'),
      isCastling: m.flags.includes('k') || m.flags.includes('q'),
    });
  }

  return Array.from(byTarget.values());
}

export function isPromotionMove(
  state: GameStateSnapshot,
  from: Square,
  to: Square
): boolean {
  return getLegalMovesForSquare(state, from).some((m) => m.to === to && m.isPromotion);
}

export function applyChessMove(
  state: GameStateSnapshot,
  moveInput: { from: Square; to: Square; promotion?: PromotionPieceType }
): { ok: true; nextState: GameStateSnapshot } | { ok: false; error: string } {
  if (state.status.isGameOver) {
    return { ok: false, error: 'La partida ya finalizó.' };
  }

  const movingPiece = state.pieces[moveInput.from];
  if (!movingPiece) {
    return { ok: false, error: 'No hay ninguna pieza en la casilla seleccionada.' };
  }

  if (movingPiece.color !== state.turn) {
    return {
      ok: false,
      error: `Es el turno de ${state.turn === 'w' ? 'Blancas' : 'Negras'}.`,
    };
  }

  const chess = new Chess(state.fen);
  const needsPromotion =
    movingPiece.type === 'p' && (moveInput.to[1] === '8' || moveInput.to[1] === '1');
  const promotionChoice: PromotionPieceType | undefined = needsPromotion
    ? (moveInput.promotion ?? 'q')
    : undefined;

  let executedMove;
  try {
    executedMove = chess.move({
      from: moveInput.from,
      to: moveInput.to,
      promotion: promotionChoice,
    });
  } catch {
    return { ok: false, error: 'Movimiento ilegal.' };
  }

  if (!executedMove) {
    return { ok: false, error: 'Movimiento ilegal.' };
  }

  const plyNumber = state.moveHistory.length + 1;
  const moveNumber = Math.ceil(plyNumber / 2);

  // Update captured pieces
  const nextCaptured: { w: CapturedPieceRecord[]; b: CapturedPieceRecord[] } = {
    w: [...state.capturedPieces.w],
    b: [...state.capturedPieces.b],
  };

  if (executedMove.captured) {
    const isEp = executedMove.flags.includes('e');
    const captureSquare: Square = isEp
      ? (`${moveInput.to[0]}${moveInput.from[1]}` as Square)
      : moveInput.to;
    const capturedBoardPiece = state.pieces[captureSquare];
    const capturedColor: PieceColor = state.turn === 'w' ? 'b' : 'w';

    nextCaptured[capturedColor].push({
      id: capturedBoardPiece?.id ?? `${capturedColor}-${executedMove.captured}-${plyNumber}`,
      type: (capturedBoardPiece?.type ?? executedMove.captured) as PieceType,
      color: capturedColor,
      capturedOn: captureSquare,
      moveNumber,
    });
  }

  // Update piece map while preserving persistent IDs for smooth Framer Motion layout animations
  const nextPieces: Partial<Record<Square, BoardPiece>> = { ...state.pieces };
  delete nextPieces[moveInput.from];

  if (executedMove.flags.includes('e')) {
    const epCaptureSq = `${moveInput.to[0]}${moveInput.from[1]}` as Square;
    delete nextPieces[epCaptureSq];
  }

  if (executedMove.flags.includes('k')) {
    const rank = moveInput.from[1] as RankChar;
    const rookFrom = `h${rank}` as Square;
    const rookTo = `f${rank}` as Square;
    const rook = nextPieces[rookFrom];
    if (rook) {
      delete nextPieces[rookFrom];
      nextPieces[rookTo] = { ...rook, square: rookTo };
    }
  } else if (executedMove.flags.includes('q')) {
    const rank = moveInput.from[1] as RankChar;
    const rookFrom = `a${rank}` as Square;
    const rookTo = `d${rank}` as Square;
    const rook = nextPieces[rookFrom];
    if (rook) {
      delete nextPieces[rookFrom];
      nextPieces[rookTo] = { ...rook, square: rookTo };
    }
  }

  nextPieces[moveInput.to] = {
    ...movingPiece,
    square: moveInput.to,
    type: promotionChoice ?? movingPiece.type,
  };

  const authoritativeFen = chess.fen();
  const posKey = getPositionKey(authoritativeFen);
  const nextPositionCounts: Record<string, number> = {
    ...state.positionCounts,
    [posKey]: (state.positionCounts[posKey] ?? 0) + 1,
  };

  const nextStatus = evaluateMatchStatus(chess, nextPieces, nextPositionCounts);

  const moveRecord: MoveRecord = {
    ply: plyNumber,
    moveNumber,
    color: state.turn,
    from: moveInput.from,
    to: moveInput.to,
    piece: movingPiece.type,
    san: executedMove.san,
    captured: executedMove.captured as PieceType | undefined,
    promotion: promotionChoice,
    fenAfter: authoritativeFen,
    isCheck: nextStatus.inCheck,
    isCheckmate: nextStatus.outcome === 'checkmate',
  };

  return {
    ok: true,
    nextState: {
      fen: authoritativeFen,
      turn: chess.turn() as PieceColor,
      pieces: nextPieces,
      capturedPieces: nextCaptured,
      moveHistory: [...state.moveHistory, moveRecord],
      lastMove: { from: moveInput.from, to: moveInput.to },
      status: nextStatus,
      positionCounts: nextPositionCounts,
    },
  };
}

export function resignMatch(
  state: GameStateSnapshot,
  resigningColor: PieceColor
): GameStateSnapshot {
  if (state.status.isGameOver) return state;
  const winner: PieceColor = resigningColor === 'w' ? 'b' : 'w';
  const resigningName = resigningColor === 'w' ? 'Blancas' : 'Negras';
  const winnerName = winner === 'w' ? 'Blancas' : 'Negras';

  return {
    ...state,
    status: {
      outcome: 'resignation',
      isGameOver: true,
      inCheck: state.status.inCheck,
      checkedKingSquare: state.status.checkedKingSquare,
      winner,
      statusMessage: `${resigningName} se rindieron · Ganan ${winnerName}`,
    },
  };
}

export function agreeDrawMatch(state: GameStateSnapshot): GameStateSnapshot {
  if (state.status.isGameOver) return state;
  return {
    ...state,
    status: {
      outcome: 'draw-agreed',
      isGameOver: true,
      inCheck: false,
      checkedKingSquare: null,
      winner: 'draw',
      statusMessage: 'Tablas por acuerdo mutuo',
    },
  };
}

export function getOrderedBoardSquares(orientation: PieceColor): Square[] {
  const ranks = orientation === 'w' ? [...RANKS].reverse() : [...RANKS];
  const files = orientation === 'w' ? [...FILES] : [...FILES].reverse();

  const squares: Square[] = [];
  for (const rank of ranks) {
    for (const file of files) {
      squares.push(`${file}${rank}` as Square);
    }
  }
  return squares;
}
