import { describe, it, expect } from 'vitest';
import { calculateNextMove, getDistance } from '../game/movement';

describe('Player Isometric Movement & Math Logic', () => {
  const speed = 10;
  // Based on current game constraints (width: 1440, height: 1024, CHAR_W: 20, CHAR_H: 50)
  const bounds = { width: 1440, height: 1024 };

  it('should correctly calculate distance between two points', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 3, y: 4 };
    expect(getDistance(p1, p2)).toBe(5);
  });

  it('should apply scaleFactor and trigonometric projection to diagonals', () => {
    const startPos = { x: 500, y: 500 };
    
    // Normal scale
    const resultNormal = calculateNextMove(startPos, 'ArrowRight', speed, bounds, 1);
    // Double scale
    const resultScaled = calculateNextMove(startPos, 'ArrowRight', speed, bounds, 2);
    
    const deltaNormalX = resultNormal.x - startPos.x;
    const deltaScaledX = resultScaled.x - startPos.x;
    
    // The scaled x distance should be double the normal projection
    expect(deltaScaledX).toBeCloseTo(deltaNormalX * 2);
  });

  it('should completely halt movement if bounds are exceeded to prevent wall-sliding', () => {
    // Current char sizes inside movement.js: CHAR_W = 20, CHAR_H = 50
    // Try to move out of the left boundary
    const startPos = { x: 5, y: 500 };
    
    // If we move ArrowLeft, dx is negative, iso_dx is negative.
    // It should hit the left boundary (< 0) and stand entirely still!
    const result = calculateNextMove(startPos, 'ArrowLeft', 100, bounds, 1);
    
    expect(result.x).toBe(startPos.x); // Exactly identical
    expect(result.y).toBe(startPos.y); 
  });
});
