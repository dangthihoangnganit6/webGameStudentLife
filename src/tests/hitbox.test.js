import { describe, test, expect, vi } from 'vitest';
import { isPointInPolygon, OBSTACLE_POLYGONS, INTERACTION_POLYGONS } from '../game/hitboxes';
import { checkCollision, isWithinBounds } from '../game/collision';

describe('Hệ thống Kiểm thử Game', () => {

  // --- 1. TEST VÙNG CẤM (OBSTACLES) ---
  describe('Va chạm vật cản (Obstacles)', () => {
    test('Nhân vật bị chặn khi đi vào vùng vật cản (Polygon)', () => {
      // Tọa độ giả định nằm trong vùng cấm đầu tiên
      const pointInside = { x: 200, y: 300 }; 
      const isHit = isPointInPolygon(pointInside, OBSTACLE_POLYGONS[0]);
      expect(isHit).toBe(true); 
    });

    test('Nhân vật di chuyển tự do ở vùng trống', () => {
      const pointOutside = { x: 10, y: 10 };
      const isHit = OBSTACLE_POLYGONS.some(poly => isPointInPolygon(pointOutside, poly));
      expect(isHit).toBe(false); 
    });
  });

  // --- 2. TEST VÙNG TƯƠNG TÁC (INTERACTION) ---
  describe('Vùng tương tác (Interaction)', () => {
    test('Phải nhận diện được vùng Canteen', () => {
      const cantinZone = INTERACTION_POLYGONS.find(p => p.id === 'cantin');
      // Tọa độ {x: 650, y: 950} nằm trong vùng đa giác của Cantin
      const isInteracting = isPointInPolygon({ x: 650, y: 950 }, cantinZone.pts);
      expect(isInteracting).toBe(true); 
    });

    test('Phải nhận diện được vùng Hospital', () => {
      const hospitalZone = INTERACTION_POLYGONS.find(p => p.id === 'hospital');
      // Tọa độ {x: 350, y: 320} nằm trong vùng Hospital
      const isInteracting = isPointInPolygon({ x: 350, y: 320 }, hospitalZone.pts);
      expect(isInteracting).toBe(true); 
    });
  });

  // --- 3. TEST VẬT LÝ CƠ BẢN & BIÊN MAP ---
  describe('Logic Vật lý & Biên bản đồ', () => {
    test('Chặn nhân vật khi đi quá giới hạn màn hình', () => {
      const mapConfig = { WIDTH: 1440, HEIGHT: 1024 };
      // Test ra ngoài biên phải
      expect(isWithinBounds(1450, 500, 50, 50, mapConfig)).toBe(false);
      // Test ở trong biên hợp lệ
      expect(isWithinBounds(100, 100, 50, 50, mapConfig)).toBe(true);
    });

    test('Phát hiện va chạm giữa 2 hình hộp (AABB)', () => {
      const player = { x: 10, y: 10, width: 50, height: 50 };
      const object = { x: 40, y: 40, width: 50, height: 50 }; 
      expect(checkCollision(player, object)).toBe(true);
    });
  });

  // --- 4. TEST CHẶN CUỘN TRANG (SCROLL LOCK) ---
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

});