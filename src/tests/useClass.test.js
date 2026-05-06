import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClass } from '../hooks/useClass';
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

describe('useClass Hook', () => {
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

  describe('Mid-class Events (35-25-20-20%)', () => {
    it('nên cộng 10 energy khi rơi vào sự kiện Bạn cho đồ ăn (35%)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.2); // < 0.35
      
      const { result } = renderHook(() => useClass());
      
      act(() => {
        result.current.triggerClassEvent(mockSetSystemAlert);
      });

      expect(mockSetSystemAlert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'BẠN BÈ QUAN TÂM'
      }));

      const onOk = mockSetSystemAlert.mock.calls[0][0].onOk;
      act(() => {
        useGameStore.getState().updateStats({ energy: 50 });
        onOk();
      });

      expect(useGameStore.getState().stats.energy).toBe(60);
    });

    it('nên trừ 50k khi rơi vào sự kiện Thu tiền quỹ lớp (25%)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // 0.35 - 0.60
      
      const { result } = renderHook(() => useClass());
      
      act(() => {
        result.current.triggerClassEvent(mockSetSystemAlert);
      });

      expect(mockSetSystemAlert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'THU TIỀN QUỸ LỚP'
      }));

      const onOk = mockSetSystemAlert.mock.calls[0][0].onOk;
      act(() => {
        useGameStore.getState().updateStats({ money: 100000 });
        onOk();
      });

      expect(useGameStore.getState().stats.money).toBe(50000);
    });

    it('nên trừ 15 energy khi bị giảng viên khiển trách (20%)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.7); // 0.60 - 0.80
      
      const { result } = renderHook(() => useClass());
      
      act(() => {
        result.current.triggerClassEvent(mockSetSystemAlert);
      });

      expect(mockSetSystemAlert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'BỊ KHIỂN TRÁCH'
      }));

      const onOk = mockSetSystemAlert.mock.calls[0][0].onOk;
      act(() => {
        onOk();
      });

      expect(useGameStore.getState().stats.energy).toBe(85); // 100 - 15
    });

    it('không thay đổi gì khi rơi vào sự kiện bình thường (20%)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9); // 0.80 - 1.0
      
      const { result } = renderHook(() => useClass());
      
      let eventType;
      act(() => {
        eventType = result.current.triggerClassEvent(mockSetSystemAlert);
      });

      expect(eventType).toBe('normal');
      expect(mockSetSystemAlert).not.toHaveBeenCalled();
    });
  });

  describe('Final Effects', () => {
    it('nên cộng 1 chuyên cần khi kết thúc buổi học', async () => {
      const { result } = renderHook(() => useClass());
      
      await act(async () => {
        result.current.handleFinalClassEvent(mockNotify);
      });

      expect(useGameStore.getState().playerStats.attendanceCount).toBe(1);
      expect(mockNotify).toHaveBeenCalledWith(expect.stringContaining('Kết thúc buổi học'));
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });
  });
});
