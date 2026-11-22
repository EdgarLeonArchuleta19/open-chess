import { useCallback, useEffect, useRef, useState } from 'react';
import Peer, { type DataConnection } from 'peerjs';
import type {
  PieceColor,
  PromotionPieceType,
  Square,
} from '../chess/types/chess.types';

const PEER_PREFIX = 'openchess-room-';

export type RoomConnectionStatus =
  | 'idle'
  | 'initializing'
  | 'waiting'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export type RoomPacket =
  | { type: 'handshake'; hostColor: PieceColor; fen: string }
  | { type: 'move'; from: Square; to: Square; promotion?: PromotionPieceType }
  | { type: 'resign'; color: PieceColor }
  | { type: 'rematch-request' }
  | { type: 'rematch-accept'; hostColor: PieceColor };

export function generateRoomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export function normalizeRoomCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/^OC-?/i, '')
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);
}

interface UsePeerRoomOptions {
  enabled: boolean;
  roomCode?: string;
  isHost?: boolean;
  hostColor: PieceColor;
  currentFen: string;
  onRemoteMove: (move: {
    from: Square;
    to: Square;
    promotion?: PromotionPieceType;
  }) => void;
  onRemoteResign: (color: PieceColor) => void;
  onHandshakeReceived: (guestColor: PieceColor) => void;
  onRematchAccepted: (newLocalColor: PieceColor) => void;
}

export function usePeerRoom({
  enabled,
  roomCode,
  isHost = false,
  hostColor,
  currentFen,
  onRemoteMove,
  onRemoteResign,
  onHandshakeReceived,
  onRematchAccepted,
}: UsePeerRoomOptions) {
  const [status, setStatus] = useState<RoomConnectionStatus>(
    enabled ? 'initializing' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rematchIncoming, setRematchIncoming] = useState(false);
  const [rematchRequestedByMe, setRematchRequestedByMe] = useState(false);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);

  // Keep latest callbacks in refs so Peer listeners never capture stale closures
  const callbacksRef = useRef({
    onRemoteMove,
    onRemoteResign,
    onHandshakeReceived,
    onRematchAccepted,
    hostColor,
    currentFen,
  });
  callbacksRef.current = {
    onRemoteMove,
    onRemoteResign,
    onHandshakeReceived,
    onRematchAccepted,
    hostColor,
    currentFen,
  };

  const sendPacket = useCallback((packet: RoomPacket) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send(packet);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !roomCode) {
      setStatus('idle');
      return;
    }

    const cleanCode = normalizeRoomCode(roomCode);
    const fullHostPeerId = `${PEER_PREFIX}${cleanCode}`;
    let isCancelled = false;

    setStatus('initializing');
    setErrorMessage(null);
    setRematchIncoming(false);
    setRematchRequestedByMe(false);

    const peer = isHost ? new Peer(fullHostPeerId) : new Peer();
    peerRef.current = peer;

    const attachConnection = (conn: DataConnection) => {
      connRef.current = conn;

      const handleOpen = () => {
        if (isCancelled) return;
        setStatus('connected');
        setErrorMessage(null);

        if (isHost) {
          conn.send({
            type: 'handshake',
            hostColor: callbacksRef.current.hostColor,
            fen: callbacksRef.current.currentFen,
          } satisfies RoomPacket);
        }
      };

      if (conn.open) {
        handleOpen();
      } else {
        conn.on('open', handleOpen);
      }

      conn.on('data', (rawData) => {
        if (isCancelled || !rawData || typeof rawData !== 'object') return;
        const packet = rawData as RoomPacket;

        if (packet.type === 'handshake' && !isHost) {
          const guestColor: PieceColor = packet.hostColor === 'w' ? 'b' : 'w';
          callbacksRef.current.onHandshakeReceived(guestColor);
        } else if (packet.type === 'move') {
          callbacksRef.current.onRemoteMove({
            from: packet.from,
            to: packet.to,
            promotion: packet.promotion,
          });
        } else if (packet.type === 'resign') {
          callbacksRef.current.onRemoteResign(packet.color);
        } else if (packet.type === 'rematch-request') {
          setRematchIncoming(true);
        } else if (packet.type === 'rematch-accept') {
          setRematchIncoming(false);
          setRematchRequestedByMe(false);
          const myNewColor: PieceColor = isHost
            ? packet.hostColor
            : packet.hostColor === 'w'
              ? 'b'
              : 'w';
          callbacksRef.current.onRematchAccepted(myNewColor);
        }
      });

      conn.on('close', () => {
        if (!isCancelled) {
          setStatus('disconnected');
        }
      });

      conn.on('error', () => {
        if (!isCancelled) {
          setStatus('error');
          setErrorMessage('Se perdió la conexión con el rival.');
        }
      });
    };

    peer.on('open', () => {
      if (isCancelled) return;
      if (isHost) {
        setStatus('waiting');
      } else {
        setStatus('connecting');
        const conn = peer.connect(fullHostPeerId, { reliable: true });
        attachConnection(conn);
      }
    });

    if (isHost) {
      peer.on('connection', (incomingConn) => {
        if (isCancelled) return;
        attachConnection(incomingConn);
      });
    }

    peer.on('error', (err) => {
      if (isCancelled) return;
      setStatus('error');
      if (err.type === 'peer-unavailable') {
        setErrorMessage('No se encontró la sala. Verifica el código con tu amigo.');
      } else if (err.type === 'unavailable-id') {
        setErrorMessage('Ese código de sala ya está en uso. Crea una sala nueva.');
      } else {
        setErrorMessage('No se pudo conectar a la red P2P. Revisa tu conexión.');
      }
    });

    return () => {
      isCancelled = true;
      connRef.current?.close();
      connRef.current = null;
      peer.destroy();
      peerRef.current = null;
    };
  }, [enabled, roomCode, isHost]);

  const sendMove = useCallback(
    (from: Square, to: Square, promotion?: PromotionPieceType) => {
      sendPacket({ type: 'move', from, to, promotion });
    },
    [sendPacket]
  );

  const sendResign = useCallback(
    (color: PieceColor) => {
      sendPacket({ type: 'resign', color });
    },
    [sendPacket]
  );

  const requestRematch = useCallback(() => {
    setRematchRequestedByMe(true);
    sendPacket({ type: 'rematch-request' });
  }, [sendPacket]);

  const acceptRematch = useCallback(() => {
    const nextHostColor: PieceColor =
      callbacksRef.current.hostColor === 'w' ? 'b' : 'w';
    sendPacket({ type: 'rematch-accept', hostColor: nextHostColor });
    setRematchIncoming(false);
    setRematchRequestedByMe(false);
    const myNewColor: PieceColor = isHost
      ? nextHostColor
      : nextHostColor === 'w'
        ? 'b'
        : 'w';
    callbacksRef.current.onRematchAccepted(myNewColor);
  }, [isHost, sendPacket]);

  return {
    status,
    errorMessage,
    rematchIncoming,
    rematchRequestedByMe,
    sendMove,
    sendResign,
    requestRematch,
    acceptRematch,
  };
}
