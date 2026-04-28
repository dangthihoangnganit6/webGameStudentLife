import { describe, it, expect } from 'vitest';
import { calculateNextMove } from '../game/movement';

describe('Player Movement logic', () => {
  const speed = 10;

  it('should move player right when ArrowRight is pressed', () => {
    const startPos = { x: 50, y: 50 };
    const result = calculateNextMove(startPos, 'ArrowRight', speed);
    expect(result).toEqual({ x: 60, y: 50 });
  });

  it('should prevent movement if hitting boundaries', () => {
    const startPos = { x: 0, y: 0 };
    const result = calculateNextMove(startPos, 'ArrowLeft', speed);
    expect(result).toEqual(startPos);
  });
});
