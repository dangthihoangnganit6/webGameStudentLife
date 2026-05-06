import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useServer } from '../hooks/useServer';
import useGameStore from '../store/useGameStore';
import { supabase } from '../lib/supabaseClient';

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } } })),
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

describe('useServer Hook', () => {
  let mockSetSystemAlert;
  let mockNotify;

  beforeEach(() => {
    mockSetSystemAlert = vi.fn();
    mockNotify = vi.fn();
    
    // Reset Game Store
    act(() => {
      useGameStore.getState().resetGame();
    });

    vi.spyOn(Math, 'random').mockRestore();
  });

  describe('Mid-shift Events (50-20-20-10%)', () => {
    it('nên cộng 30k tiền tip khi rơi vào kịch bản 50%', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.25); // < 0.5
      
      const { result } = renderHook(() => useServer());
      
      act(() => {
        result.current.triggerMidShiftEvent(mockSetSystemAlert);
      });

      expect(mockSetSystemAlert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'ĐƯỢC KHÁCH CHO TIỀN TIP'
      }));

      const onOk = mockSetSystemAlert.mock.calls[0][0].onOk;
      act(() => { onOk(); });

      expect(useGameStore.getState().stats.money).toBe(30000);
    });

    it('nên trừ 20k và 5 energy khi rơi vào kịch bản Vỡ bát (20%)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.6); // 0.5 - 0.7
      
      const { result } = renderHook(() => useServer());
      
      act(() => {
        result.current.triggerMidShiftEvent(mockSetSystemAlert);
      });

      expect(mockSetSystemAlert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'LÀM VỠ BÁT ĐĨA'
      }));

      const onOk = mockSetSystemAlert.mock.calls[0][0].onOk;
      act(() => { onOk(); });

      expect(useGameStore.getState().stats.money).toBe(0); // 0 - 20k = 0 (min is 0)
      expect(useGameStore.getState().stats.energy).toBe(95); // 100 - 5
    });

    it('nên set pendingEvent karen khi rơi vào kịch bản 20% khách khó tính', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.8); // 0.7 - 0.9
      
      const { result } = renderHook(() => useServer());
      
      act(() => {
        result.current.triggerMidShiftEvent(mockSetSystemAlert);
      });

      expect(result.current.pendingEvent).toBe('karen');
      expect(mockSetSystemAlert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'CẢNH BÁO'
      }));
    });

    it('nên set pendingEvent manager_happy khi rơi vào kịch bản 10% quản lý hài lòng', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.95); // 0.9 - 1.0
      
      const { result } = renderHook(() => useServer());
      
      act(() => {
        result.current.triggerMidShiftEvent(mockSetSystemAlert);
      });

      expect(result.current.pendingEvent).toBe('manager_happy');
      expect(mockSetSystemAlert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'QUẢN LÝ KHEN NGỢI'
      }));
    });
  });

  describe('Final Effects', () => {
    it('nên trừ 30k lương khi bị khách Karen khiếu nại', async () => {
      const { result } = renderHook(() => useServer());
      
      act(() => {
        result.current.handleFinalShiftEvent('karen', useGameStore.getState().stats, mockNotify, mockSetSystemAlert);
      });

      const onOk = mockSetSystemAlert.mock.calls[0][0].onOk;
      await act(async () => { onOk(); });

      // Lương cơ bản 50k - 30k phạt = 20k
      expect(useGameStore.getState().stats.money).toBe(20000);
    });

    it('nên thưởng 20% lương khi quản lý hài lòng', async () => {
      const { result } = renderHook(() => useServer());
      
      act(() => {
        result.current.handleFinalShiftEvent('manager_happy', useGameStore.getState().stats, mockNotify, mockSetSystemAlert);
      });

      const onOk = mockSetSystemAlert.mock.calls[0][0].onOk;
      await act(async () => { onOk(); });

      // Lương cơ bản 50k * 1.2 = 60k
      expect(useGameStore.getState().stats.money).toBe(60000);
    });
  });
});
