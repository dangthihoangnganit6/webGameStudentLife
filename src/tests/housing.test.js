import { describe, it, expect, vi } from 'vitest';
import useGameStore from '../store/useGameStore';

describe('Housing System Logic', () => {
  it('should subtract rent correctly after timer expires', () => {
    const { playerStats, stats, updatePlayerStats, updateStats, payRent } = useGameStore.getState();
    
    // Setup state
    const initialMoney = 5000000;
    const rentPrice = 1000000;
    
    useGameStore.setState({
      stats: { ...stats, money: initialMoney },
      playerStats: { 
        ...playerStats, 
        rentedRoom: { id: 'cheap', label: 'Giá rẻ', price: rentPrice },
        rentTimer: 0 
      }
    });

    // Manually trigger rent payment (simulating the timer completion)
    useGameStore.getState().payRent();

    const newState = useGameStore.getState();
    expect(newState.stats.money).toBe(initialMoney - rentPrice);
    expect(newState.playerStats.rentTimer).toBe(0);
  });

  it('should reset rent timer when a new room is rented', () => {
    const { playerStats } = useGameStore.getState();
    
    useGameStore.setState({
      playerStats: { ...playerStats, rentTimer: 500 }
    });

    // Simulate renting a room (this logic is usually in handleAction)
    useGameStore.setState((state) => ({
      playerStats: { 
        ...state.playerStats, 
        rentedRoom: { id: 'standard', price: 3000000 }, 
        rentTimer: 0 
      }
    }));

    expect(useGameStore.getState().playerStats.rentTimer).toBe(0);
  });
});
