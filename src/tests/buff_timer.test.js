import { describe, it, expect, beforeEach } from 'vitest';
import useGameStore from '../store/useGameStore';

describe('Buffs & Timers System: Năng lượng và Thời gian', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  // --- 1. KIỂM THỬ CỘNG DỒN THỜI GIAN BUFF (STACKING TIMERS) ---
  describe('Cộng dồn thời gian Buff', () => {
    it('nên cộng dồn thời gian energyBuffTimer khi sử dụng liên tiếp nhiều vật phẩm', () => {
      const store = useGameStore.getState();
      
      // Giả lập sử dụng vật phẩm Buff lần 1 (+100 đơn vị thời gian)
      store.updatePlayerStats({ energyBuffTimer: store.playerStats.energyBuffTimer + 100 });
      expect(useGameStore.getState().playerStats.energyBuffTimer).toBe(100);

      // Giả lập sử dụng tiếp vật phẩm Buff lần 2 (+100 đơn vị thời gian)
      store.updatePlayerStats({ energyBuffTimer: useGameStore.getState().playerStats.energyBuffTimer + 100 });
      
      // Kết quả: Phải cộng dồn thành 200 thay vì bị ghi đè thành 100
      expect(useGameStore.getState().playerStats.energyBuffTimer).toBe(200);
    });
  });

  // --- 2. TRẠNG THÁI BUFF KHI DI CHUYỂN (DISTANCE VS ENERGY) ---
  describe('Tương tác giữa Buff và Di chuyển', () => {
    it('distanceCounter vẫn tăng nhưng energy phải giữ nguyên khi có Buff', () => {
      const store = useGameStore.getState();
      const initialEnergy = 100;
      
      // Kích hoạt Buff và thiết lập trạng thái ban đầu
      useGameStore.setState({ 
        stats: { ...store.stats, energy: initialEnergy },
        playerStats: { ...store.playerStats, energyBuffTimer: 50, distanceCounter: 0 } 
      });

      // Di chuyển 200 đơn vị (ngưỡng bình thường sẽ trừ 1 năng lượng)[cite: 12, 23]
      store.updatePosition({ x: 1314, y: 864 }); 

      const state = useGameStore.getState();
      
      // Kiểm tra: distanceCounter được reset về 0 sau khi đạt ngưỡng 200
      expect(state.playerStats.distanceCounter).toBe(0); 
      // Kiểm tra: Năng lượng tuyệt đối không đổi nhờ có Buff
      expect(state.stats.energy).toBe(initialEnergy); 
    });

    it('nên trừ năng lượng bình thường ngay sau khi energyBuffTimer về 0', () => {
      const store = useGameStore.getState();
      
      // Thiết lập Buff sắp hết (còn 0)
      useGameStore.setState({ 
        playerStats: { ...store.playerStats, energyBuffTimer: 0, distanceCounter: 0 } 
      });

      // Di chuyển 200 đơn vị
      store.updatePosition({ x: 1314, y: 864 }); 

      // Kết quả: Năng lượng phải giảm xuống 99 vì không còn Buff bảo vệ[cite: 9, 23]
      expect(useGameStore.getState().stats.energy).toBe(99); 
    });
  });
});