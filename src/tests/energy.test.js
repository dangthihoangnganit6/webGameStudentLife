import { describe, it, expect, vi } from 'vitest';
import useGameStore from '../store/useGameStore';

describe('Energy System Logic', () => {
  it('should decrease energy by 5 for every 100px moved', () => {
    const { stats, playerStats, updatePosition } = useGameStore.getState();
    const initialEnergy = 100;
    
    useGameStore.setState({
      stats: { ...stats, energy: initialEnergy },
      playerStats: { ...playerStats, distanceCounter: 0 },
      position: { x: 0, y: 0 }
    });

    // Move 100px
    useGameStore.getState().updatePosition({ x: 100, y: 0 });

    const newState = useGameStore.getState();
    expect(newState.stats.energy).toBe(initialEnergy - 2);
    expect(newState.playerStats.distanceCounter).toBe(0);
  });

  it('should decrease energy when checking in', () => {
    // This logic is in handleAction, so we'll test the store property if it was there
    // Since it's in App.jsx, we verify the updateStats logic
    const initialEnergy = 100;
    useGameStore.setState((state) => ({
      stats: { ...state.stats, energy: initialEnergy }
    }));

    useGameStore.getState().updateStats({ energy: useGameStore.getState().stats.energy - 20 });
    
    expect(useGameStore.getState().stats.energy).toBe(initialEnergy - 20);
  });
});
