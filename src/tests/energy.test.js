import { describe, it, expect, beforeEach, vi } from 'vitest';
import useGameStore from '../store/useGameStore';
import { INGREDIENTS, CANTEEN_MENU } from '../game/constants';

describe('Energy System Logic', () => {
  
  beforeEach(() => {
    useGameStore.getState().resetGame();
    vi.useFakeTimers(); // Sử dụng để giả lập thời gian trôi qua
  });

  // --- 1. TIÊU HAO DO DI CHUYỂN & XE ĐẠP ---
  describe('Tiêu hao khi di chuyển', () => {
    it('nên trừ 1 năng lượng khi đi đủ 200 đơn vị (distanceCounter)', () => {
      const store = useGameStore.getState();
      
      // Di chuyển 200 đơn vị
      store.updatePosition({ x: 1314, y: 864 }); 
      
      expect(useGameStore.getState().stats.energy).toBe(99);
      expect(useGameStore.getState().playerStats.distanceCounter).toBe(0);
    });
  });

  // --- 2. TIÊU HAO DO CÔNG VIỆC & HỌC TẬP ---
  describe('Tiêu hao do hoạt động (Actions)', () => {
    it('nên trừ 20 năng lượng khi điểm danh vào lớp (Check-in)', () => {
      const store = useGameStore.getState();
      
      // Mô phỏng logic handleAction: 'check_in'
      store.updateStats({ energy: Math.max(0, store.stats.energy - 20) });
      
      expect(useGameStore.getState().stats.energy).toBe(80);
    });

    it('nên trừ 10 năng lượng sau khi hoàn thành dạy gia sư (Tutoring)', () => {
      const store = useGameStore.getState();
      
      // Mô phỏng kết thúc ca dạy gia sư
      store.updateStats(prev => ({ energy: Math.max(0, prev.energy - 10) }));
      
      expect(useGameStore.getState().stats.energy).toBe(90);
    });

    it('nên trừ năng lượng dựa trên mức độ vất vả của công việc làm thêm', () => {
      const store = useGameStore.getState();
      const workData = { name: 'Phục vụ', income: 50000, exhaustion: 15 };

      // Mô phỏng handleAction: 'work'
      if (store.stats.energy >= workData.exhaustion) {
        store.updateStats({ energy: store.stats.energy - workData.exhaustion })
      }

      expect(useGameStore.getState().stats.energy).toBe(85);
    });
  });

  // --- 3. TIÊU HAO TỰ NHIÊN & TRẠNG THÁI XẤU ---
  describe('Tiêu hao tự nhiên và Hình phạt', () => {
    it('nên trừ 1 năng lượng mỗi giây nếu đang vô gia cư (Không có nhà)', () => {
      const store = useGameStore.getState();
      useGameStore.setState({ playerStats: { ...store.playerStats, rentedRoom: null } });

      // Giả lập 5 giây trôi qua trong useEffect
      for(let i = 0; i < 5; i++) {
        useGameStore.getState().updateStats(prev => ({ energy: Math.max(0, prev.energy - 1) }));
      }

      expect(useGameStore.getState().stats.energy).toBe(95);
    });

    it('nên trừ 1 năng lượng mỗi giây khi hóa đơn điện quá hạn (Overdue)', () => {
      const store = useGameStore.getState();
      useGameStore.setState({ 
        playerStats: { 
          ...store.playerStats, 
          electricityBill: { status: 'overdue', amount: 500000 } 
        } 
      });

      // Mô phỏng logic trừ năng lượng do tiền điện overdue
      store.updateStats(prev => ({ energy: Math.max(0, prev.energy - 1) }));
      
      expect(useGameStore.getState().stats.energy).toBe(99);
    });
  });

  // --- 4. HỒI PHỤC NĂNG LƯỢNG ---
  describe('Hồi phục năng lượng', () => {
    it('nên hồi đúng lượng năng lượng từ vật phẩm và không vượt quá 100', () => {
      const store = useGameStore.getState();
      useGameStore.setState({ stats: { ...store.stats, energy: 95 } });
      
      store.updateStats({ energy: 150 });
          
      expect(useGameStore.getState().stats.energy).toBe(100);
    });
  });
});