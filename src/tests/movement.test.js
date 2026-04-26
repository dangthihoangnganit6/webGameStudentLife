import { describe, it, expect } from 'vitest';
import { movePlayer } from '../game/movement';

describe('Player Movement logic', () => {
  const locations = [
    { id: 'house', x: 100, y: 100, width: 100, height: 100 }
  ];
  const speed = 10;
  const playerSize = 32;

  it('should move player right when ArrowRight is pressed', () => {
    const startPos = { x: 50, y: 50 };
    const result = movePlayer(startPos, 'ArrowRight', speed, locations, playerSize);
    expect(result).toEqual({ x: 60, y: 50 });
  });

  it('should prevent movement if colliding with a location', () => {
    // Player is just outside the house at 100, 100
    // Moving right into it from 70 (70 + 32 = 102 > 100)
    const startPos = { x: 69, y: 110 }; 
    const result = movePlayer(startPos, 'ArrowRight', speed, locations, playerSize);
    expect(result).toEqual(startPos);
  });
});
