import { describe, it, expect } from 'vitest';
import { calculateNextMove, getDistance } from '../game/movement';
import { MAP_CONFIG } from '../game/constants';

describe('Player Isometric Movement & Math Logic', () => {
  const speed = MAP_CONFIG.CHARACTER_SPEED; // 4
  const bounds = { width: MAP_CONFIG.WIDTH, height: MAP_CONFIG.HEIGHT }; // 1440x1024

  it('should correctly calculate distance between two points', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 3, y: 4 };
    expect(getDistance(p1, p2)).toBe(5);
  });

  it('nên di chuyển theo đúng hệ tọa độ nghiêng (Isometric)', () => {
    const startPos = { x: 500, y: 500 };
    // Khi nhấn Down, tọa độ x và y phải thay đổi theo ma trận xoay 30 độ
    const result = calculateNextMove(startPos, 'ArrowDown', speed, bounds, 1);
    
    // dx=0, dy=4 -> iso_dx = (0-4)*cos(30) ≈ -3.46; iso_dy = (0+4)*sin(30) = 2
    expect(result.x).toBeCloseTo(500 - 3.464, 3);
    expect(result.y).toBe(502);
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
});
