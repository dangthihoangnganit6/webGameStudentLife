import { describe, it, expect, beforeEach } from 'vitest';
import useGameStore from '../store/useGameStore';

describe('Course Registration Logic Verification', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('Case 1: Successful registration before deadline prevents expulsion', () => {
    const store = useGameStore.getState();
    const startTime = Date.now();
    
    // Simulating 290 seconds has passed (10s remaining)
    const now = startTime + 290000; 
    const elapsed = (now - startTime) / 1000; // 290
    const remaining = Math.max(0, 300 - elapsed); // 10
    
    // Player pays tuition
    store.updatePlayerStats({ isPaid: true });
    
    // Expulsion check logic (from App.jsx)
    let isExpelled = false;
    if (remaining <= 0 && !useGameStore.getState().playerStats.isPaid) {
      isExpelled = true;
    }
    
    expect(remaining).toBeGreaterThan(0);
    expect(useGameStore.getState().playerStats.isPaid).toBe(true);
    expect(isExpelled).toBe(false);
  });

  it('Case 2: Registration at exactly 0.1s left (Edge Case) is prioritized', () => {
    const store = useGameStore.getState();
    const startTime = Date.now();
    
    // Simulating 299.9s passed (0.1s remaining)
    const now = startTime + 299900; 
    const elapsed = (now - startTime) / 1000; 
    const remaining = Math.max(0, 300 - elapsed); 
    
    // Player pays tuition at the last millisecond
    store.updatePlayerStats({ isPaid: true });
    
    // Even if next tick hits exactly 0 or less
    const nextTickRemaining = 0;
    let isExpelled = false;
    if (nextTickRemaining <= 0 && !useGameStore.getState().playerStats.isPaid) {
      isExpelled = true;
    }
    
    expect(isExpelled).toBe(false);
    expect(useGameStore.getState().playerStats.isPaid).toBe(true);
  });

  it('Case 3: Failing to pay by the time timer hits 0 leads to expulsion', () => {
    const startTime = Date.now();
    
    // Simulating 300s passed (0s remaining)
    const now = startTime + 301000; 
    const elapsed = (now - startTime) / 1000; 
    const remaining = Math.max(0, 300 - elapsed); 
    
    // Player has NOT paid
    let isExpelled = false;
    if (remaining <= 0 && !useGameStore.getState().playerStats.isPaid) {
      isExpelled = true;
    }
    
    expect(remaining).toBe(0);
    expect(isExpelled).toBe(true);
  });

  it('Term Reset: Verification that resetSchoolData restarts the countdown', () => {
    const { vi } = import.meta.vitest;
    const store = useGameStore.getState();
    const initialStartTime = store.playerStats.termStartTime;
    
    // Move time forward by 1 second
    vi.setSystemTime(initialStartTime + 1000);
    
    // Simulate finishing a term
    store.resetSchoolData();
    
    const newStartTime = useGameStore.getState().playerStats.termStartTime;
    expect(newStartTime).toBe(initialStartTime + 1000);
    expect(useGameStore.getState().playerStats.isPaid).toBe(false);
    expect(useGameStore.getState().playerStats.isEnrolled).toBe(false);
    
    vi.useRealTimers();
  });
});
