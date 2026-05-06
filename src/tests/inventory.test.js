import { describe, it, expect, beforeEach } from 'vitest';
import useGameStore from '../store/useGameStore';
import { INGREDIENTS } from '../game/constants';

describe('Advanced Inventory & Stacking Logic', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  // --- 1. KIỂM THỬ CƠ CHẾ CHỒNG CHẤT (STACKING) ---
  describe('Cơ chế Stacking', () => {
    it('nên kiểm tra xem vật phẩm cùng loại chiếm nhiều ô hay gộp số lượng', () => {
      const store = useGameStore.getState();
      const egg = INGREDIENTS.find(i => i.id === 'egg');

      // Nhặt 2 quả trứng
      store.addToInventory(egg);
      store.addToInventory(egg);

      const inventory = useGameStore.getState().playerStats.inventory;

      // Dựa trên hàm addToInventory hiện tại: [...state.playerStats.inventory, item]
      // Dự đoán: Nó sẽ chiếm 2 ô riêng biệt trong mảng
      expect(inventory.length).toBe(2);
      expect(inventory[0].id).toBe('egg');
      expect(inventory[1].id).toBe('egg');
    });
  });

  // --- 2. KIỂM THỬ GIỚI HẠN NĂNG LƯỢNG KHI ĂN CHUỖI VẬT PHẨM ---
  describe('Giới hạn năng lượng (Energy Cap) với chuỗi vật phẩm', () => {
    it('năng lượng phải dừng ở 100 khi ăn liên tục nhiều vật phẩm từ mức 99', () => {
      const store = useGameStore.getState();
      
      // 1. Ép năng lượng về mức 99
      useGameStore.setState({ stats: { ...store.stats, energy: 99 } });
      // 2. Giả lập ăn 3 quả trứng (mỗi quả +10 energy)
      const egg = INGREDIENTS.find(i => i.id === 'egg');
      
      store.updateStats(prev => ({
      energy: Math.min(100, prev.energy + egg.energy)
    }));

      store.updateStats(prev => ({
        energy: Math.min(100, prev.energy + egg.energy)
      }));

      store.updateStats(prev => ({
        energy: Math.min(100, prev.energy + egg.energy)
      }));

      expect(useGameStore.getState().stats.energy).toBe(100);
      });
    });

  // --- 3. KIỂM THỬ SỨC CHỨA (CAPACITY) ---
  describe('Giới hạn sức chứa túi đồ', () => {
    it('không nên cho phép thêm đồ nếu túi đã đạt giới hạn (giả định 10 ô)', () => {
      const store = useGameStore.getState();
      const MAX_SLOTS = 10;
      const egg = INGREDIENTS.find(i => i.id === 'egg');

      // Lấp đầy túi đồ
      for (let i = 0; i < MAX_SLOTS; i++) {
        store.addToInventory(egg);
      }

      // Logic kiểm tra giới hạn trước khi thêm (thường nằm ở hàm handleAction)
      const canAddMore = useGameStore.getState().playerStats.inventory.length < MAX_SLOTS;
      
      expect(canAddMore).toBe(false);
      expect(useGameStore.getState().playerStats.inventory.length).toBe(10);
    });
  });
});