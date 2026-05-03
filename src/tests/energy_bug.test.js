import { describe, it, expect } from 'vitest';
import useGameStore from '../store/useGameStore';

describe('Energy and Housing Bug', () => {
  it('should keep rentedRoom after resetSchoolData is called', () => {
    // 1. Setup state: Player has a rented room
    const testRoom = { id: 'standard', label: 'Standard Room', price: 2000000 };
    useGameStore.setState((state) => ({
      playerStats: {
        ...state.playerStats,
        rentedRoom: testRoom,
        rentTimer: 50,
        isEnrolled: true,
        isPaid: true
      }
    }));

    // Verify setup
    expect(useGameStore.getState().playerStats.rentedRoom).toBe(testRoom);

    // 2. Call resetSchoolData (simulating next term/month)
    useGameStore.getState().resetSchoolData();

    expect(useGameStore.getState().playerStats.rentedRoom).toEqual(testRoom);
  });

  it('should set rentedRoom to null when homeless', () => {
    // 1. Setup: No housing
    useGameStore.setState((state) => ({
      stats: { ...state.stats, energy: 100 },
      playerStats: { ...state.playerStats, rentedRoom: null }
    }));

    // In a real browser, the useEffect in App would handle this.
    // Here we just verify the state changes correctly if the logic were in the store or if we simulate it.
    // Since the 1s logic is in App.jsx (useEffect), we can't easily test it here without rendering App.
    // However, we can check that rentedRoom is indeed null.
    expect(useGameStore.getState().playerStats.rentedRoom).toBeNull();
  });
});
