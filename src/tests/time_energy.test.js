import { describe, test, expect, beforeEach } from 'vitest';
import useGameStore from '../store/useGameStore';

describe('Kiểm thử Logic GameStore (Energy & Timing)', () => {
  
  // Trước mỗi bài test, hãy reset game về trạng thái ban đầu
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  test('Logic Năng lượng: Đi bộ 200 đơn vị phải trừ 1 năng lượng', () => {
    const store = useGameStore.getState();
    const initialEnergy = store.stats.energy; // 100

    // Giả lập di chuyển 200 đơn vị
    store.updatePosition({ x: 1314, y: 864 }); // Di chuyển 200px từ vị trí gốc {1114, 864}
    
    const newEnergy = useGameStore.getState().stats.energy;
    expect(newEnergy).toBe(initialEnergy - 1); // 99
  });

  test('Logic Năng lượng: Không bị trừ khi có Buff', () => {
    const store = useGameStore.getState();
    
    // Kích hoạt Buff năng lượng
    store.updatePlayerStats({ energyBuffTimer: 100 });
    
    // Di chuyển 200 đơn vị
    store.updatePosition({ x: 1314, y: 864 });
    
    expect(useGameStore.getState().stats.energy).toBe(100); // Vẫn giữ nguyên 100
  });

  test('Năng lượng: Tuyệt đối không được âm dù di chuyển bao nhiêu đi nữa', () => {
    const store = useGameStore.getState();
    
    // 1. Ép năng lượng về mức cực thấp (ví dụ: 1)
    useGameStore.setState({ stats: { ...store.stats, energy: 1 } });

    // 2. Di chuyển một quãng đường cực xa (vượt ngưỡng 200 đơn vị nhiều lần)
    // Giả lập di chuyển 1000px
    for(let i = 0; i < 5; i++) {
        store.updatePosition({ x: 1114 + (i * 201), y: 864 }); 
    }
    
    // 3. Kết quả phải là 0, không được là -4
    expect(useGameStore.getState().stats.energy).toBe(0);
  });

  test('Logic Thời gian: Tự động nhảy sang ngày mới sau 24 giờ', () => {
    const store = useGameStore.getState();
    
    // Đang là 8:00 Ngày 1
    store.advanceTime(1000); 
    
    const { day, hour, minute } = useGameStore.getState().stats.time;
    
    expect(day).toBe(2);      // Phải sang Ngày 2
    expect(hour).toBe(0);     // Giờ phải là 0
    expect(minute).toBe(40);  // Phút phải là 40
  });
});