import { describe, test, expect, beforeEach } from 'vitest';
import useGameStore from '../store/useGameStore';

describe('Kiểm thử Vòng lặp & Chuyển cảnh (Loop & Layer)', () => {

  beforeEach(() => {
    useGameStore.getState().resetGame(); // Đảm bảo mỗi bài test bắt đầu từ ván mới
  });

  // 1. Kiểm tra Reset thông số khi chơi lại
  test('Khi Reset: Các thông số sinh tồn phải về giá trị mặc định', () => {
    const store = useGameStore.getState();

    // Giả lập trạng thái đang chơi và bị đuổi học[cite: 5, 6]
    useGameStore.setState({
      stats: { energy: 0, money: 50000, time: { day: 10, hour: 12, minute: 30 } },
      playerStats: { ...store.playerStats, isExpelled: true, missedClasses: 5 }
    });

    // Hành động: Người chơi bấm Play Again (gọi resetGame)
    store.resetGame();

    const newState = useGameStore.getState();
    expect(newState.stats.energy).toBe(100);       // Năng lượng về 100[cite: 5]
    expect(newState.stats.money).toBe(0);          // Tiền về 0[cite: 5]
    expect(newState.stats.time.day).toBe(1);       // Về ngày 1[cite: 5]
    expect(newState.playerStats.isExpelled).toBe(false); // Hết bị đuổi học[cite: 5]
  });

  // 2. Kiểm tra Chuyển cảnh (Layer)
  test('Khi chuyển cảnh: Scene phải thay đổi đúng mục tiêu', () => {
    const store = useGameStore.getState();
    
    // Đang ở map, đi vào nhà[cite: 5, 6]
    store.setCurrentScene('home_interior');
    expect(useGameStore.getState().currentScene).toBe('home_interior');

    // Reset game phải đưa người chơi quay lại Map[cite: 5]
    store.resetGame();
    expect(useGameStore.getState().currentScene).toBe('map');
  });

  // 3. Kiểm tra tính toàn vẹn của Inventory khi reset
  test('Khi Reset: Túi đồ phải được dọn sạch', () => {
    const store = useGameStore.getState();
    
    // Giả lập mua đồ[cite: 5, 6]
    store.addToInventory({ id: 'egg', name: 'Trứng' });
    expect(useGameStore.getState().playerStats.inventory.length).toBe(1);

    store.resetGame();
    expect(useGameStore.getState().playerStats.inventory.length).toBe(0); // Túi đồ phải trống[cite: 5]
  });
});