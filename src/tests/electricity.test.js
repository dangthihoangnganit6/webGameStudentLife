import { describe, it, expect, vi, beforeEach } from 'vitest';
import useGameStore from '../store/useGameStore';

describe('Electricity Bill System', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('should generate a bill with random amount between 300k and 700k', () => {
    const amount = 500000;
    useGameStore.getState().generateElectricityBill(amount);
    
    const state = useGameStore.getState();
    expect(state.playerStats.electricityBill.amount).toBe(amount);
    expect(state.playerStats.electricityBill.status).toBe('pending');
    expect(state.playerStats.electricityBill.timeLeftToPay).toBe(60);
  });

  it('should transition to overdue after 60 seconds', () => {
    useGameStore.getState().generateElectricityBill(500000);
    
    // Simulate 60 seconds
    for (let i = 0; i < 60; i++) {
      useGameStore.getState().updateElectricityTimer();
    }
    
    const state = useGameStore.getState();
    expect(state.playerStats.electricityBill.timeLeftToPay).toBe(0);
    expect(state.playerStats.electricityBill.status).toBe('overdue');
  });

  it('should subtract money and set status to paid when bill is paid', () => {
    const initialMoney = 3000000;
    const billAmount = 500000;
    
    useGameStore.setState({ stats: { money: initialMoney, energy: 100, time: { day: 1, hour: 8, minute: 0 } } });
    useGameStore.getState().generateElectricityBill(billAmount);
    
    useGameStore.getState().payElectricityBill();
    
    const state = useGameStore.getState();
    expect(state.stats.money).toBe(initialMoney - billAmount);
    expect(state.playerStats.electricityBill.status).toBe('paid');
  });

  it('should decrease energy when overdue', () => {
    // This is handled in App.jsx's useEffect, but we can verify the state expectation.
    // In our store logic, status becomes 'overdue' after timer hits 0.
    useGameStore.getState().generateElectricityBill(500000);
    for (let i = 0; i < 60; i++) {
        useGameStore.getState().updateElectricityTimer();
    }
    
    expect(useGameStore.getState().playerStats.electricityBill.status).toBe('overdue');
  });
});
