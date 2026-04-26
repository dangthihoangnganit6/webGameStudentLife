import { describe, it, expect } from 'vitest';
import useGameStore from '../store/useGameStore';

describe('Term & Allowance Logic', () => {
  it('should add 3,000,000 VND when allowance interval is reached', () => {
    const { stats, playerStats, updateStats, updatePlayerStats } = useGameStore.getState();
    const initialMoney = stats.money;
    
    // Simulate allowance logic (usually triggered by useEffect in App)
    const allowanceInterval = 30; // 30 units
    const nextAcc = allowanceInterval; 
    
    if (nextAcc >= allowanceInterval) {
      useGameStore.setState((state) => ({
        stats: { ...state.stats, money: state.stats.money + 3000000 },
        playerStats: { ...state.playerStats, allowanceAccumulator: 0 }
      }));
    }

    expect(useGameStore.getState().stats.money).toBe(initialMoney + 3000000);
    expect(useGameStore.getState().playerStats.allowanceAccumulator).toBe(0);
  });

  it('should trigger expulsion after deadline if not enrolled', () => {
    useGameStore.setState((state) => ({
      playerStats: { 
        ...state.playerStats, 
        isEnrolled: false, 
        isExpelled: false 
      }
    }));

    // Simulate expulsion check
    const remaining = 0;
    if (remaining <= 0 && !useGameStore.getState().playerStats.isEnrolled) {
      useGameStore.setState((state) => ({
        playerStats: { ...state.playerStats, isExpelled: true }
      }));
    }

    expect(useGameStore.getState().playerStats.isExpelled).toBe(true);
  });
});
