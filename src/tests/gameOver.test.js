import { describe, it, expect, beforeEach } from 'vitest';
import useGameStore from '../store/useGameStore';

describe('Game Over Logic & Messages', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('Attendance Game Over: should set correct reason and flags', () => {
    const store = useGameStore.getState();
    
    // Simulate skipping 3 classes
    store.updatePlayerStats({ isExpelled: true, expulsionReason: 'attendance' });
    
    const { isExpelled, expulsionReason } = useGameStore.getState().playerStats;
    expect(isExpelled).toBe(true);
    expect(expulsionReason).toBe('attendance');
  });

  it('Registration Game Over: should have default reason', () => {
    const store = useGameStore.getState();
    
    // Simulate registration timeout
    store.updatePlayerStats({ isExpelled: true });
    
    const { isExpelled, expulsionReason } = useGameStore.getState().playerStats;
    expect(isExpelled).toBe(true);
    expect(expulsionReason).toBeUndefined(); // Falls back to default in App.jsx rendering
  });

  it('Stroke Game Over: should set isStroke flag', () => {
    const store = useGameStore.getState();
    
    // Simulate 3rd hospitalization
    store.updatePlayerStats({ isStroke: true });
    
    expect(useGameStore.getState().playerStats.isStroke).toBe(true);
  });

  it('Reset School Data: should clear all enrollment flags but keep expulsion status (until resetGame)', () => {
    const store = useGameStore.getState();
    
    store.updatePlayerStats({ 
      isEnrolled: true, 
      isPaid: true, 
      attendanceCount: 10,
      totalCredits: 15
    });
    
    store.resetSchoolData();
    
    const { isEnrolled, isPaid, attendanceCount, totalCredits } = useGameStore.getState().playerStats;
    
    expect(isEnrolled).toBe(false);
    expect(isPaid).toBe(false);
    expect(attendanceCount).toBe(0);
    expect(totalCredits).toBe(0);
  });
});
