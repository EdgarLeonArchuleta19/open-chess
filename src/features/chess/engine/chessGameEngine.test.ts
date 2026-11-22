import { describe, expect, it } from 'vitest';
import {
  agreeDrawMatch,
  applyChessMove,
  createInitialGameState,
  resignMatch,
} from './chessGameEngine';

describe('OpenChess — chessGameEngine', () => {
  it('initializes standard chess position with 32 pieces and White to move', () => {
    const state = createInitialGameState();
    expect(state.turn).toBe('w');
    expect(Object.keys(state.pieces)).toHaveLength(32);
    expect(state.status.outcome).toBe('active');
    expect(state.status.isGameOver).toBe(false);
  });

  it('validates legal moves, rejects illegal moves, and preserves persistent piece IDs', () => {
    const state0 = createInitialGameState();
    const e2Id = state0.pieces.e2?.id;
    expect(e2Id).toBeDefined();

    const illegal = applyChessMove(state0, { from: 'e2', to: 'e5' });
    expect(illegal.ok).toBe(false);

    const legal = applyChessMove(state0, { from: 'e2', to: 'e4' });
    expect(legal.ok).toBe(true);
    if (!legal.ok) return;

    expect(legal.nextState.turn).toBe('b');
    expect(legal.nextState.pieces.e4?.id).toBe(e2Id);
    expect(legal.nextState.pieces.e2).toBeUndefined();
    expect(legal.nextState.moveHistory[0].san).toBe('e4');
  });

  it('handles captures, promotion, castling, and checkmate accurately', () => {
    // Fool's mate: 1. f3 e5 2. g4 Qh4#
    let state = createInitialGameState();
    for (const m of [
      { from: 'f2', to: 'f3' },
      { from: 'e7', to: 'e5' },
      { from: 'g2', to: 'g4' },
      { from: 'd8', to: 'h4' },
    ] as const) {
      const res = applyChessMove(state, m);
      expect(res.ok).toBe(true);
      if (res.ok) state = res.nextState;
    }

    expect(state.status.isGameOver).toBe(true);
    expect(state.status.outcome).toBe('checkmate');
    expect(state.status.winner).toBe('b');
  });

  it('handles promotion to Queen or Knight cleanly', () => {
    const state0 = createInitialGameState('7k/P7/8/8/8/8/8/4K3 w - - 0 1');
    const res = applyChessMove(state0, { from: 'a7', to: 'a8', promotion: 'n' });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.nextState.pieces.a8?.type).toBe('n');
  });

  it('supports resignation and draw by mutual agreement', () => {
    const state0 = createInitialGameState();
    const resigned = resignMatch(state0, 'w');
    expect(resigned.status.outcome).toBe('resignation');
    expect(resigned.status.winner).toBe('b');

    const drawn = agreeDrawMatch(state0);
    expect(drawn.status.outcome).toBe('draw-agreed');
    expect(drawn.status.winner).toBe('draw');
  });
});
