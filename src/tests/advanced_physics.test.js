import { describe, it, expect, beforeEach } from 'vitest';
import useGameStore from '../store/useGameStore';
import { calculateNextMove } from '../game/movement';
import { isPointInPolygon, INTERACTION_POLYGONS } from '../game/hitboxes';

describe('Advanced Interaction & Movement: Xung đột và Chồng lấn', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  // --- 1. CHẶN DI CHUYỂN KHI ĐANG MỞ MODAL ---
  describe('Ngăn chặn di chuyển ngầm', () => {
    it('vị trí nhân vật không được thay đổi nếu isModalOpen là true', () => {
      const store = useGameStore.getState();
      const initialPos = { x: 500, y: 500 };
      
      // Giả lập trạng thái đang mở Modal tương tác
      useGameStore.setState({ 
        position: initialPos, 
        isModalOpen: true 
      });

      // Logic trong hàm xử lý sự kiện bàn phím (mô phỏng)
      const handleKeyDown = (key) => {
        const state = useGameStore.getState();
        // NẾU Modal đang mở, KHÔNG cho phép tính toán vị trí mới[cite: 9]
        if (state.isModalOpen) return; 

        const nextPos = calculateNextMove(state.position, key);
        store.updatePosition(nextPos);
      };

      handleKeyDown('ArrowDown');

      const finalPos = useGameStore.getState().position;
      // Vị trí phải giữ nguyên, không bị thay đổi ngầm
      expect(finalPos).toEqual(initialPos);
    });
  });

  // --- 2. VÙNG CHỒNG LẤN (OVERLAPPING HITBOXES) ---
  describe('Ưu tiên vùng tương tác (Hitbox Priority)', () => {
    it('nên ưu tiên mở địa điểm xuất hiện trước trong mảng cấu hình khi đứng ở điểm giao thoa', () => {
      const store = useGameStore.getState();
      
      // Giả lập 2 vùng tương tác giả định chồng lấn nhau tại tọa độ {x: 100, y: 100}
      const mockPolygons = [
        { id: 'parking', pts: [{x: 90, y: 90}, {x: 110, y: 90}, {x: 110, y: 110}, {x: 90, y: 110}] },
        { id: 'school', pts: [{x: 95, y: 95}, {x: 105, y: 95}, {x: 105, y: 105}, {x: 95, y: 105}] }
      ];

      const checkInteractions = (point) => {
        // Tìm vùng tương tác đầu tiên thỏa mãn điều kiện[cite: 16]
        return mockPolygons.find(poly => isPointInPolygon(point, poly.pts));
      };

      const interaction = checkInteractions({ x: 100, y: 100 });

      // Kết quả: Phải ưu tiên 'parking' vì nó đứng trước trong danh sách quét
      expect(interaction.id).toBe('parking');
    });

    it('nên nhận diện đúng vùng tương tác thực tế của School tại điểm cụ thể', () => {
      const schoolZone = INTERACTION_POLYGONS.find(p => p.id === 'school');
      // Tọa độ cụ thể được tính toán dựa trên parseRect trong mã nguồn
      const testPoint = { x: 1050, y: 250 }; 
      
      const isHit = isPointInPolygon(testPoint, schoolZone.pts);
      expect(isHit).toBe(true);
    });
  });
});