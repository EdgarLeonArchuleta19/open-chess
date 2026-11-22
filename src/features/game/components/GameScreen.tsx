import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Check,
  Copy,
  Flag,
  Handshake,
  Link2,
  Palette,
  Redo2,
  RefreshCw,
  RotateCcw,
  Undo2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type {
  ActiveMatchConfig,
  AppPreferences,
  BoardPalette,
  GameStateSnapshot,
  PieceColor,
  PromotionPieceType,
  Square,
} from '../../chess/types/chess.types';
import {
  agreeDrawMatch,
  applyChessMove,
  createInitialGameState,
  getLegalMovesForSquare,
  isPromotionMove,
  PIECE_VALUES,
  resignMatch,
} from '../../chess/engine/chessGameEngine';
import { BOT_DIFFICULTIES, computeBotMove } from '../../ai/chessBot';
import { usePeerRoom } from '../../online/usePeerRoom';
import { ChessBoard } from '../../chess/components/ChessBoard';
import { PromotionDialog } from '../../chess/components/PromotionDialog';
import { MoveHistoryPanel } from '../../history/MoveHistoryPanel';
import { PlayerBar } from './PlayerBar';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { chessSound } from '../../../lib/sound';

interface GameScreenProps {
  config: ActiveMatchConfig;
  preferences: AppPreferences;
  onUpdatePreferences: (updater: (prev: AppPreferences) => AppPreferences) => void;
  onExitToHome: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  config,
  preferences,
  onUpdatePreferences,
  onExitToHome,
}) => {
  const [gameState, setGameState] = useState<GameStateSnapshot>(() =>
    createInitialGameState()
  );
  const [undoStack, setUndoStack] = useState<GameStateSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<GameStateSnapshot[]>([]);
  const [localColor, setLocalColor] = useState<PieceColor>(config.playerColor);
  const [orientation, setOrientation] = useState<PieceColor>(config.playerColor);

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [copiedType, setCopiedType] = useState<'none' | 'code' | 'link'>('none');
  const [confirmAction, setConfirmAction] = useState<'restart' | 'resign' | null>(null);

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const isOnline = config.mode === 'online';
  const isBot = config.mode === 'bot';
  const isLocal = config.mode === 'local';

  // Trigger sound and confetti when a move completes
  const playMoveAudio = useCallback(
    (next: GameStateSnapshot, wasCapture: boolean) => {
      if (next.status.isGameOver) {
        chessSound.playGameOver(preferences.soundEnabled);
        if (next.status.outcome === 'checkmate') {
          confetti({
            particleCount: 70,
            spread: 65,
            origin: { y: 0.65 },
            colors: ['#18181B', '#F4F4F5', '#A1A1AA', '#F59E0B'],
          });
        }
      } else if (next.status.inCheck) {
        chessSound.playCheck(preferences.soundEnabled);
      } else if (wasCapture) {
        chessSound.playCapture(preferences.soundEnabled);
      } else {
        chessSound.playMove(preferences.soundEnabled);
      }
    },
    [preferences.soundEnabled]
  );

  const handleRemoteMove = useCallback(
    (move: { from: Square; to: Square; promotion?: PromotionPieceType }) => {
      const current = gameStateRef.current;
      const res = applyChessMove(current, move);
      if (!res.ok) return;
      const latestMove = res.nextState.moveHistory[res.nextState.moveHistory.length - 1];
      setUndoStack((prev) => [...prev, current]);
      setRedoStack([]);
      setGameState(res.nextState);
      setSelectedSquare(null);
      playMoveAudio(res.nextState, Boolean(latestMove?.captured));
    },
    [playMoveAudio]
  );

  const handleRemoteResign = useCallback(
    (color: PieceColor) => {
      setGameState((prev) => resignMatch(prev, color));
      chessSound.playGameOver(preferences.soundEnabled);
    },
    [preferences.soundEnabled]
  );

  const handleHandshakeReceived = useCallback((guestColor: PieceColor) => {
    setLocalColor(guestColor);
    setOrientation(guestColor);
  }, []);

  const handleRematchAccepted = useCallback((newMyColor: PieceColor) => {
    setLocalColor(newMyColor);
    setOrientation(newMyColor);
    setGameState(createInitialGameState());
    setUndoStack([]);
    setRedoStack([]);
    setSelectedSquare(null);
    setPendingPromotion(null);
  }, []);

  const peerRoom = usePeerRoom({
    enabled: isOnline,
    roomCode: config.roomCode,
    isHost: config.isHost,
    hostColor: localColor,
    currentFen: gameState.fen,
    onRemoteMove: handleRemoteMove,
    onRemoteResign: handleRemoteResign,
    onHandshakeReceived: handleHandshakeReceived,
    onRematchAccepted: handleRematchAccepted,
  });

  // Bot turn scheduler
  useEffect(() => {
    if (!isBot || gameState.status.isGameOver) {
      setIsBotThinking(false);
      return;
    }

    const botColor: PieceColor = localColor === 'w' ? 'b' : 'w';
    if (gameState.turn !== botColor) {
      setIsBotThinking(false);
      return;
    }

    setIsBotThinking(true);
    const delayMs = 380 + Math.floor(Math.random() * 240);
    const timer = window.setTimeout(() => {
      const current = gameStateRef.current;
      if (current.status.isGameOver || current.turn !== botColor) return;

      const botMove = computeBotMove(
        current.fen,
        config.botDifficulty ?? 'intermediate'
      );
      if (!botMove) {
        setIsBotThinking(false);
        return;
      }

      const res = applyChessMove(current, botMove);
      if (res.ok) {
        const latestMove = res.nextState.moveHistory[res.nextState.moveHistory.length - 1];
        setUndoStack((prev) => [...prev, current]);
        setRedoStack([]);
        setGameState(res.nextState);
        playMoveAudio(res.nextState, Boolean(latestMove?.captured));
      }
      setIsBotThinking(false);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [config.botDifficulty, gameState.fen, gameState.status.isGameOver, gameState.turn, isBot, localColor, playMoveAudio]);

  const canInteractWithBoard = useMemo(() => {
    if (gameState.status.isGameOver) return false;
    if (isLocal) return true;
    if (isBot) return gameState.turn === localColor && !isBotThinking;
    if (isOnline) {
      return peerRoom.status === 'connected' && gameState.turn === localColor;
    }
    return false;
  }, [
    gameState.status.isGameOver,
    gameState.turn,
    isBot,
    isBotThinking,
    isLocal,
    isOnline,
    localColor,
    peerRoom.status,
  ]);

  const legalMovesForSelected = useMemo(() => {
    if (!selectedSquare || !canInteractWithBoard) return [];
    return getLegalMovesForSquare(gameState, selectedSquare);
  }, [canInteractWithBoard, gameState, selectedSquare]);

  const commitLocalMove = useCallback(
    (from: Square, to: Square, promotion?: PromotionPieceType) => {
      const res = applyChessMove(gameState, { from, to, promotion });
      if (!res.ok) return;

      const latestMove = res.nextState.moveHistory[res.nextState.moveHistory.length - 1];
      setUndoStack((prev) => [...prev, gameState]);
      setRedoStack([]);
      setGameState(res.nextState);
      setSelectedSquare(null);
      setPendingPromotion(null);
      playMoveAudio(res.nextState, Boolean(latestMove?.captured));

      if (isOnline) {
        peerRoom.sendMove(from, to, promotion);
      }

      if (isLocal && preferences.autoFlipLocal && !res.nextState.status.isGameOver) {
        setOrientation(res.nextState.turn);
      }
    },
    [
      gameState,
      isLocal,
      isOnline,
      peerRoom,
      playMoveAudio,
      preferences.autoFlipLocal,
    ]
  );

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (!canInteractWithBoard) return;
      const clickedPiece = gameState.pieces[square];

      if (!selectedSquare) {
        if (clickedPiece && clickedPiece.color === gameState.turn) {
          setSelectedSquare(square);
        }
        return;
      }

      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }

      if (clickedPiece && clickedPiece.color === gameState.turn) {
        setSelectedSquare(square);
        return;
      }

      const isLegalTarget = legalMovesForSelected.some((m) => m.to === square);
      if (!isLegalTarget) {
        setSelectedSquare(null);
        return;
      }

      if (isPromotionMove(gameState, selectedSquare, square)) {
        setPendingPromotion({ from: selectedSquare, to: square });
        return;
      }

      commitLocalMove(selectedSquare, square);
    },
    [
      canInteractWithBoard,
      commitLocalMove,
      gameState,
      legalMovesForSelected,
      selectedSquare,
    ]
  );

  const handleUndo = () => {
    if (isOnline || undoStack.length === 0) return;

    // In Bot mode, step back 2 plies so it returns to the human player's turn
    if (isBot && undoStack.length >= 2 && gameState.turn === localColor) {
      const targetState = undoStack[undoStack.length - 2];
      setUndoStack((prev) => prev.slice(0, -2));
      setRedoStack((prev) => [undoStack[undoStack.length - 1], gameState, ...prev]);
      setGameState(targetState);
      setSelectedSquare(null);
      return;
    }

    const previousState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [gameState, ...prev]);
    setGameState(previousState);
    setSelectedSquare(null);
  };

  const handleRedo = () => {
    if (isOnline || redoStack.length === 0) return;
    const nextState = redoStack[0];
    setRedoStack((prev) => prev.slice(1));
    setUndoStack((prev) => [...prev, gameState]);
    setGameState(nextState);
    setSelectedSquare(null);
  };

  const handleRestart = () => {
    if (isOnline) {
      peerRoom.requestRematch();
      return;
    }
    setGameState(createInitialGameState());
    setUndoStack([]);
    setRedoStack([]);
    setSelectedSquare(null);
    setPendingPromotion(null);
    if (isLocal && preferences.autoFlipLocal) {
      setOrientation('w');
    }
  };

  const handleResign = () => {
    const resigningColor = isLocal ? gameState.turn : localColor;
    setGameState((prev) => resignMatch(prev, resigningColor));
    chessSound.playGameOver(preferences.soundEnabled);
    if (isOnline) {
      peerRoom.sendResign(resigningColor);
    }
  };

  const handleCopyInvite = (type: 'code' | 'link') => {
    if (!config.roomCode) return;
    const text =
      type === 'code'
        ? config.roomCode
        : `${window.location.origin}${window.location.pathname}?room=${config.roomCode}`;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedType(type);
    window.setTimeout(() => setCopiedType('none'), 2000);
  };

  // Compute material balance
  const whiteCapturedPoints = gameState.capturedPieces.b.reduce(
    (sum, p) => sum + PIECE_VALUES[p.type],
    0
  );
  const blackCapturedPoints = gameState.capturedPieces.w.reduce(
    (sum, p) => sum + PIECE_VALUES[p.type],
    0
  );

  const botInfo = BOT_DIFFICULTIES.find((b) => b.id === config.botDifficulty);

  const getPlayerBarProps = (color: PieceColor) => {
    const isWhite = color === 'w';
    const enemyColor: PieceColor = isWhite ? 'b' : 'w';
    const adv = isWhite
      ? Math.max(0, whiteCapturedPoints - blackCapturedPoints)
      : Math.max(0, blackCapturedPoints - whiteCapturedPoints);

    let label = isWhite ? 'Blancas' : 'Negras';
    let subtitle: string | undefined;

    if (isBot) {
      if (color === localColor) {
        label = 'Tú';
        subtitle = isWhite ? 'Blancas' : 'Negras';
      } else {
        label = `Bot · ${botInfo?.label ?? 'IA'}`;
        subtitle = botInfo?.eloEstimate;
      }
    } else if (isOnline) {
      if (color === localColor) {
        label = 'Tú';
        subtitle = isWhite ? 'Blancas' : 'Negras';
      } else {
        label = peerRoom.status === 'connected' ? 'Amigo' : 'Esperando amigo...';
        subtitle = isWhite ? 'Blancas' : 'Negras';
      }
    }

    return {
      color,
      label,
      subtitle,
      isActiveTurn: !gameState.status.isGameOver && gameState.turn === color,
      isThinking: isBot && color !== localColor && isBotThinking,
      isWinner: gameState.status.winner === color,
      capturedByPlayer: gameState.capturedPieces[enemyColor],
      materialAdvantage: adv,
    };
  };

  const topColor: PieceColor = orientation === 'w' ? 'b' : 'w';
  const bottomColor: PieceColor = orientation;

  const palettes: Array<{ id: BoardPalette; label: string }> = [
    { id: 'minimal', label: 'Minimal' },
    { id: 'walnut', label: 'Nogal' },
    { id: 'slate', label: 'Pizarra' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6"
    >
      {/* Online Room Connection Banner */}
      {isOnline && config.roomCode && (
        <div className="mb-4 rounded-2xl bg-white dark:bg-[#121419] border border-zinc-200 dark:border-zinc-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                peerRoom.status === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : peerRoom.status === 'error' || peerRoom.status === 'disconnected'
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              {peerRoom.status === 'error' || peerRoom.status === 'disconnected' ? (
                <WifiOff className="w-4 h-4" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Sala
                </span>
                <span className="font-mono font-semibold text-sm tracking-wider text-zinc-950 dark:text-zinc-50">
                  {config.roomCode}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {peerRoom.status === 'connected' && 'Conectado con tu amigo en tiempo real.'}
                {peerRoom.status === 'waiting' &&
                  'Comparte el código o enlace para que tu amigo se una.'}
                {(peerRoom.status === 'initializing' ||
                  peerRoom.status === 'connecting') &&
                  'Estableciendo conexión P2P...'}
                {peerRoom.status === 'disconnected' && 'Tu amigo salió de la sala.'}
                {peerRoom.status === 'error' &&
                  (peerRoom.errorMessage ?? 'Error de conexión.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopyInvite('code')}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors"
            >
              {copiedType === 'code' ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedType === 'code' ? 'Copiado' : 'Código'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopyInvite('link')}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedType === 'link' ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Link2 className="w-3.5 h-3.5" />
              )}
              <span>{copiedType === 'link' ? 'Enlace copiado' : 'Copiar enlace'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Board Column */}
        <div className="lg:col-span-7 flex flex-col gap-2.5">
          <PlayerBar {...getPlayerBarProps(topColor)} />

          <ChessBoard
            pieces={gameState.pieces}
            orientation={orientation}
            selectedSquare={selectedSquare}
            legalMoves={legalMovesForSelected}
            lastMove={gameState.lastMove}
            checkedKingSquare={gameState.status.checkedKingSquare}
            showCoordinates={preferences.showCoordinates}
            palette={preferences.boardPalette}
            disabled={!canInteractWithBoard}
            onSquareClick={handleSquareClick}
          />

          <PlayerBar {...getPlayerBarProps(bottomColor)} />
        </div>

        {/* Side Column: Status, History & Minimal Controls */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Status Card */}
          <div className="rounded-2xl bg-white dark:bg-[#121419] border border-zinc-200/80 dark:border-zinc-800/80 p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Estado
              </span>
              <p className="font-medium text-sm text-zinc-950 dark:text-zinc-50 mt-0.5">
                {gameState.status.statusMessage}
              </p>
            </div>

            {gameState.status.isGameOver && (
              <div className="flex items-center gap-2 shrink-0">
                {isOnline && peerRoom.rematchIncoming ? (
                  <button
                    type="button"
                    onClick={peerRoom.acceptRematch}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                  >
                    Aceptar revancha
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRestart}
                    disabled={isOnline && peerRoom.rematchRequestedByMe}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white disabled:opacity-50 text-white dark:text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>
                      {isOnline && peerRoom.rematchRequestedByMe
                        ? 'Esperando...'
                        : 'Revancha'}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Incoming Rematch Banner (if peer requested during game over) */}
          {isOnline && peerRoom.rematchIncoming && !gameState.status.isGameOver && (
            <div className="rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 p-3.5 flex items-center justify-between gap-3 text-xs">
              <span>Tu amigo propuso una nueva partida.</span>
              <button
                type="button"
                onClick={peerRoom.acceptRematch}
                className="px-3 py-1.5 rounded-lg bg-white/15 dark:bg-black/10 font-semibold"
              >
                Aceptar
              </button>
            </div>
          )}

          {/* Move History */}
          <MoveHistoryPanel moves={gameState.moveHistory} />

          {/* Controls Card */}
          <div className="rounded-2xl bg-white dark:bg-[#121419] border border-zinc-200/80 dark:border-zinc-800/80 p-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {!isOnline && (
                <>
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={undoStack.length === 0}
                    className="py-2 px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-[#181B22] dark:hover:bg-zinc-800 disabled:opacity-35 border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Deshacer</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    className="py-2 px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-[#181B22] dark:hover:bg-zinc-800 disabled:opacity-35 border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Redo2 className="w-3.5 h-3.5" />
                    <span>Rehacer</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setOrientation((prev) => (prev === 'w' ? 'b' : 'w'))}
                className="py-2 px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-[#181B22] dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Girar</span>
              </button>

              {isLocal && !gameState.status.isGameOver && (
                <button
                  type="button"
                  onClick={() => setGameState((prev) => agreeDrawMatch(prev))}
                  className="py-2 px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-[#181B22] dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Handshake className="w-3.5 h-3.5" />
                  <span>Tablas</span>
                </button>
              )}

              {!isOnline && (
                <button
                  type="button"
                  onClick={() =>
                    gameState.moveHistory.length > 0
                      ? setConfirmAction('restart')
                      : handleRestart()
                  }
                  className="py-2 px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-[#181B22] dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reiniciar</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setConfirmAction('resign')}
                disabled={gameState.status.isGameOver}
                className="py-2 px-3 rounded-xl bg-zinc-50 hover:bg-red-50 dark:bg-[#181B22] dark:hover:bg-red-950/30 disabled:opacity-35 border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Rendirse</span>
              </button>
            </div>

            {/* Minimalist Board Palette & Local Auto-flip */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-zinc-400" />
                {palettes.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      onUpdatePreferences((prev) => ({ ...prev, boardPalette: p.id }))
                    }
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      preferences.boardPalette === p.id
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {isLocal && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdatePreferences((prev) => ({
                      ...prev,
                      autoFlipLocal: !prev.autoFlipLocal,
                    }))
                  }
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                    preferences.autoFlipLocal
                      ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  Auto-girar: {preferences.autoFlipLocal ? 'Sí' : 'No'}
                </button>
              )}
            </div>

            {isOnline && (
              <button
                type="button"
                onClick={onExitToHome}
                className="w-full py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              >
                Salir de la sala
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Promotion Modal */}
      <PromotionDialog
        isOpen={Boolean(pendingPromotion)}
        color={gameState.turn}
        targetSquare={pendingPromotion?.to ?? null}
        onSelect={(piece) => {
          if (pendingPromotion) {
            commitLocalMove(pendingPromotion.from, pendingPromotion.to, piece);
          }
        }}
        onCancel={() => setPendingPromotion(null)}
      />

      {/* Confirm Restart / Resign Modal */}
      <ConfirmModal
        isOpen={confirmAction === 'restart'}
        title="¿Reiniciar la partida?"
        description="Se perderá el tablero actual y comenzará una nueva partida desde la posición inicial."
        confirmLabel="Reiniciar"
        variant="primary"
        onConfirm={() => {
          setConfirmAction(null);
          handleRestart();
        }}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmModal
        isOpen={confirmAction === 'resign'}
        title="¿Confirmar rendición?"
        description="La victoria se otorgará inmediatamente al rival."
        confirmLabel="Rendirse"
        variant="danger"
        onConfirm={() => {
          setConfirmAction(null);
          handleResign();
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </motion.div>
  );
};
