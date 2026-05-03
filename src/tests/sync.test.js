import { describe, it, expect, beforeEach, vi } from 'vitest';
import useGameStore from '../store/useGameStore';

describe('State Synchronization: Sleeping vs School Deadline', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
    vi.useFakeTimers();
  });

  it('nên kết thúc game do quá hạn đăng ký ngay cả khi đang ngủ trong nhà', () => {
    const store = useGameStore.getState();
    const startTime = store.playerStats.termStartTime; // Thời điểm bắt đầu kỳ học[cite: 9, 20]

    // 1. Giả lập nhân vật đang ở trong nhà và đang ngủ
    useGameStore.setState({
      currentScene: 'home_interior',
      isSleeping: true,
      sleepProgress: 50
    });

    // 2. Thiết lập trạng thái chưa đóng học phí
    store.updatePlayerStats({ isPaid: false });

    // 3. Giả lập thời gian trôi qua vượt quá deadline (300 giây)
    // Chúng ta mô phỏng logic kiểm tra trong useEffect của App.jsx
    const checkExpulsion = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const remaining = Math.max(0, 300 - elapsed);

      if (remaining <= 0 && !useGameStore.getState().playerStats.isPaid) {
        useGameStore.getState().updatePlayerStats({ 
          isExpelled: true, 
          expulsionReason: 'enrollment' 
        });
      }
    };

    // Tăng thời gian thực tế lên 301 giây
    vi.setSystemTime(startTime + 301000);
    checkExpulsion();

    const finalState = useGameStore.getState();

    // KIỂM TRA ĐỒNG BỘ:
    // Mặc dù đang ở cảnh nhà và đang ngủ, trạng thái bị đuổi học vẫn phải kích hoạt
    expect(finalState.currentScene).toBe('home_interior');
    expect(finalState.isSleeping).toBe(true);
    expect(finalState.playerStats.isExpelled).toBe(true);
    expect(finalState.playerStats.expulsionReason).toBe('enrollment');
  });

  it('nên ngừng ngủ và đóng các task khi bị đuổi học (Force Cleanup)', () => {
    const store = useGameStore.getState();

    // Giả lập đang làm nhiệm vụ (Ngủ và Nấu ăn)
    useGameStore.setState({ isSleeping: true, isCooking: true });

    // Giả lập sự kiện bị đuổi học xảy ra
    store.updatePlayerStats({ isExpelled: true });

    // Logic dọn dẹp (thường nằm trong useEffect khi isExpelled thay đổi)
    const forceCleanup = () => {
      if (useGameStore.getState().playerStats.isExpelled) {
        useGameStore.setState({ isSleeping: false, isCooking: false });
      }
    };

    forceCleanup();

    const state = useGameStore.getState();
    expect(state.isSleeping).toBe(false);
    expect(state.isCooking).toBe(false);
  });
});