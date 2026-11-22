export type PieceColor = 'w' | 'b';

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export type PromotionPieceType = 'q' | 'r' | 'b' | 'n';

export type FileChar = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
export type RankChar = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type Square = `${FileChar}${RankChar}`;

export type GameMode = 'local' | 'bot' | 'online';

export type BotDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'master';

export type AppTheme = 'dark' | 'light';

export type BoardPalette = 'minimal' | 'walnut' | 'slate';

export interface BoardPiece {
  /** Persistent ID so Framer Motion can animate pieces gliding across squares */
  id: string;
  type: PieceType;
  color: PieceColor;
  square: Square;
}

export interface CapturedPieceRecord {
  id: string;
  type: PieceType;
  color: PieceColor;
  capturedOn: Square;
  moveNumber: number;
}

export interface MoveRecord {
  ply: number;
  moveNumber: number;
  color: PieceColor;
  from: Square;
  to: Square;
  piece: PieceType;
  san: string;
  captured?: PieceType;
  promotion?: PromotionPieceType;
  fenAfter: string;
  isCheck: boolean;
  isCheckmate: boolean;
}

export type MatchOutcomeType =
  | 'active'
  | 'check'
  | 'checkmate'
  | 'stalemate'
  | 'draw-insufficient'
  | 'draw-fifty-move'
  | 'draw-repetition'
  | 'resignation'
  | 'draw-agreed';

export interface MatchStatus {
  outcome: MatchOutcomeType;
  isGameOver: boolean;
  inCheck: boolean;
  checkedKingSquare: Square | null;
  winner: PieceColor | 'draw' | null;
  statusMessage: string;
}

export interface GameStateSnapshot {
  fen: string;
  turn: PieceColor;
  pieces: Partial<Record<Square, BoardPiece>>;
  capturedPieces: {
    w: CapturedPieceRecord[];
    b: CapturedPieceRecord[];
  };
  moveHistory: MoveRecord[];
  lastMove: { from: Square; to: Square } | null;
  status: MatchStatus;
  positionCounts: Record<string, number>;
}

export interface LegalMoveOption {
  from: Square;
  to: Square;
  san: string;
  isCapture: boolean;
  isPromotion: boolean;
  isEnPassant: boolean;
  isCastling: boolean;
}

export interface AppPreferences {
  theme: AppTheme;
  boardPalette: BoardPalette;
  soundEnabled: boolean;
  showCoordinates: boolean;
  autoFlipLocal: boolean;
}

export interface ActiveMatchConfig {
  mode: GameMode;
  playerColor: PieceColor;
  botDifficulty?: BotDifficulty;
  roomCode?: string;
  isHost?: boolean;
}
