import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { computeBotMove } from './chessBot';
import type { BotDifficulty } from '../chess/types/chess.types';

describe('OpenChess — AI Bot Engine', () => {
  it('returns a valid legal move for all 4 difficulty levels from the starting position', () => {
    const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const difficulties: BotDifficulty[] = [
      'beginner',
      'intermediate',
      'advanced',
      'master',
    ];

    for (const diff of difficulties) {
      const move = computeBotMove(startFen, diff);
      expect(move).not.toBeNull();
      if (!move) continue;

      const chess = new Chess(startFen);
      const executed = chess.move(move);
      expect(executed).not.toBeNull();
    }
  });

  it('finds immediate checkmate-in-1 on Master difficulty', () => {
    // White Queen on h5, White Bishop on c4 -> Qxf7# is Scholar's mate
    const mateInOneFen =
      'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4';
    const move = computeBotMove(mateInOneFen, 'master');
    expect(move).not.toBeNull();
    expect(move?.from).toBe('h5');
    expect(move?.to).toBe('f7');
  });
});
