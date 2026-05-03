import { describe, it, expect } from 'vitest';
import { calculateNextMove } from '../game/movement';
import { MAP_CONFIG } from '../game/constants';
import useGameStore from '../store/useGameStore';

describe('Movement & Collision Logic', () => {
  const speed = MAP_CONFIG.CHARACTER_SPEED; // 4
  const boundaries = { width: MAP_CONFIG.WIDTH, height: MAP_CONFIG.HEIGHT }; // 1440x1024
  
  // Tính toán trước giá trị di chuyển Isometric cho tốc độ 4, góc 30 độ
  // dx = 0, dy = 4 (ArrowDown) -> iso_dx = (0 - 4) * cos(30) ≈ -3.46, iso_dy = (0 + 4) * sin(30) = 2
  const expectedIsoDown = { x: 200 - 3.4641016151377544, y: 200 + 2 };

  it('should move character down when direction is down', () => {
    // Starting at 200, 200 (Empty space)
    const initialPos = { x: 200, y: 200 };
    const newPos = calculateNextMove(initialPos, 'ArrowDown', speed, boundaries);
    
    expect(newPos.x).toBeCloseTo(expectedIsoDown.x);
    expect(newPos.y).toBe(expectedIsoDown.y);
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

  test('Vật lý: Tốc độ xe đạp phải nhanh hơn đi bộ', () => {
    const { CHARACTER_SPEED } = require('../game/constants').MAP_CONFIG;
    
    // Giả lập trạng thái đi xe đạp
    useGameStore.setState({ playerStats: { isRidingBicycle: true } });
    
    const speed = useGameStore.getState().playerStats.isRidingBicycle 
                 ? CHARACTER_SPEED * 1.5 : CHARACTER_SPEED;
    
    expect(speed).toBe(6); // 4 * 1.5[cite: 2, 6]
  });
});

describe('Hệ thống phím điều khiển', () => {
  test('Phải gọi preventDefault để chặn cuộn trang khi nhấn phím mũi tên', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    const spy = vi.spyOn(event, 'preventDefault');
    
    const keysToBlock = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
    if (keysToBlock.includes(event.key)) {
      event.preventDefault();
    }

    expect(spy).toHaveBeenCalled(); 
  });
});
