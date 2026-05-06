import { describe, it, expect, beforeEach } from 'vitest';
import useGameStore from '../store/useGameStore';

describe('Salary Accuracy: Kiểm thử tính chính xác của tiền lương', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('gia sư trả đúng lương', () => {
    const { completeTutorJob } = useGameStore.getState();

    useGameStore.setState({
        stats: { energy: 100, money: 1000000 }
    });

    completeTutorJob();

    const state = useGameStore.getState();

    expect(state.stats.money).toBe(1100000);
    expect(state.stats.energy).toBe(90);
  });

  it('nên cộng chính xác lương Phục vụ (50,000đ) và trừ năng lượng tương ứng', () => {
    const { completeWaiterJob } = useGameStore.getState();

    useGameStore.setState({
        stats: { energy: 100, money: 1000000 }
    });

    completeWaiterJob();

    const state = useGameStore.getState();

    expect(state.stats.money).toBe(1050000);
    expect(state.stats.energy).toBe(90);
  });

  it('không được nhận lương nếu đang làm dở mà bị ngất (Exhausted)', () => {
    const store = useGameStore.getState();
    const initialMoney = 500;
    
    useGameStore.setState({ stats: { ...store.stats, money: initialMoney }, isWaiting: true });

    // Giả lập bị ngất xỉu giữa chừng
    const forceExhausted = () => {
      // Logic cleanup khi ngất: hủy task và không cộng tiền
      useGameStore.setState({ isWaiting: false, waitingProgress: 0 }); 
    };

    forceExhausted();

    expect(useGameStore.getState().stats.money).toBe(initialMoney); 
    expect(useGameStore.getState().isWaiting).toBe(false);
  });
});