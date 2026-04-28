import { describe, it, expect } from 'vitest';
import { calculateNextMove } from '../game/movement';
import { MAP_CONFIG } from '../game/constants';

describe('Movement & Collision Logic', () => {
  const charSize = { width: 32, height: 32 };
  const speed = 4;

  it('should move character down when direction is down', () => {
    // Starting at 200, 200 (Empty space)
    const initialPos = { x: 200, y: 200 };
    const newPos = calculateNextMove(initialPos, 'ArrowDown', speed);
    
    expect(newPos).toEqual({ x: 200, y: 204 });
  });

  it('should not move out of top boundary', () => {
    const initialPos = { x: 200, y: 0 };
    const newPos = calculateNextMove(initialPos, 'ArrowUp', speed);
    
    expect(newPos).toEqual(initialPos);
  });

  it('should stop move when colliding with a location (e.g. Hostel at 50,50)', () => {
    // Hostel is at x: 50, y: 50, width: 120, height: 100
    // Character is at 170 + 2 (slightly to the right of hostel)
    // Moving left should collide
    const initialPos = { x: 171, y: 60 }; 
    const newPos = calculateNextMove(initialPos, 'ArrowLeft', speed);
    
    expect(newPos).toEqual(initialPos);
  });

  it('should move freely when no obstacles are present', () => {
    const initialPos = { x: 400, y: 300 }; // Empty space
    const newPos = calculateNextMove(initialPos, 'ArrowRight', speed);
    
    expect(newPos).toEqual({ x: 404, y: 300 });
  });
});
