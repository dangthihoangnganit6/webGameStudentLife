import { describe, it, expect, beforeEach } from 'vitest';
import useGameStore from '../store/useGameStore';

describe('Action Conflict: Xung đột hành động', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('nên hủy trạng thái nấu ăn khi bắt đầu đi ngủ', () => {
    const store = useGameStore.getState();

    // 1. Giả lập nhân vật đang nấu ăn
    useGameStore.setState({ 
      isCooking: true, 
      cookingProgress: 30 
    });
    // 2. Logic mô phỏng khi người chơi bấm "Đi ngủ"
    const startSleeping = () => {
      const state = useGameStore.getState();
      
      // Quy tắc: Nếu đang làm việc khác, phải reset các trạng thái đó về false/0
      if (state.isCooking) {
        useGameStore.setState({ isCooking: false, cookingProgress: 0 });
      }
      
      // Bắt đầu đi ngủ
      useGameStore.setState({ isSleeping: true, sleepProgress: 0 });
    };

    startSleeping();

    const finalState = useGameStore.getState();
    
    // KIỂM TRA:
    expect(finalState.isCooking).toBe(false); // Nấu ăn phải bị hủy
    expect(finalState.cookingProgress).toBe(0); // Tiến độ nấu ăn phải về 0
    expect(finalState.isSleeping).toBe(true); // Trạng thái ngủ phải được kích hoạt
  });

  it('nên ngăn chặn việc di chuyển khi đang thực hiện bất kỳ hành động nào (Task Lock)', () => {
    const store = useGameStore.getState();
    const initialPos = { x: 1114, y: 864 };

    // Giả lập đang dạy gia sư
    useGameStore.setState({ isTutoring: true, position: initialPos });

    // Mô phỏng logic trong handleKeyDown
    const moveAttempt = (key) => {
      const state = useGameStore.getState();
      // Nếu đang thực hiện bất kỳ task nào, chặn di chuyển
      if (state.isCooking || state.isSleeping || state.isTutoring || state.isWaiting) {
        return; 
      }
      const nextPos = calculateNextMove(state.position, key, speed);
      store.updatePosition(nextPos);
    };

    moveAttempt('ArrowUp');

    expect(useGameStore.getState().position).toEqual(initialPos); 
  });
});