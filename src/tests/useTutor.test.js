import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTutor } from '../hooks/useTutor';
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

describe('useTutor Hook', () => {
  let mockSetSystemAlert;
  let mockNotify;

  beforeEach(() => {
    mockSetSystemAlert = vi.fn();
    mockNotify = vi.fn();
    
    // Reset Game Store
    act(() => {
      useGameStore.getState().resetGame();
      useGameStore.getState().updatePlayerStats({ hasTutorJob: true });
    });

    // Reset random mock
    vi.spyOn(Math, 'random').mockRestore();
  });

  describe('Mid-lesson Events', () => {
    it('nên cộng 10 energy khi rơi vào sự kiện Đồ ăn (40%)', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.2); // Rơi vào < 0.4
      
      const { result } = renderHook(() => useTutor());
      
      act(() => {
        result.current.triggerMidLessonEvent(15, mockSetSystemAlert);
      });

      expect(mockSetSystemAlert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'ĐƯỢC TẶNG ĐỒ ĂN'
      }));

      // Set energy thấp để thấy sự thay đổi (vì store có giới hạn tối đa 100)
      act(() => {
        useGameStore.getState().updateStats({ energy: 50 });
      });

      const onOk = mockSetSystemAlert.mock.calls[0][0].onOk;
      act(() => {
        onOk();
      });

      expect(useGameStore.getState().stats.energy).toBe(60);
    });

    it('nên trừ 10 energy khi rơi vào sự kiện Bị chửi (20%)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // Rơi vào 0.4 - 0.6
      
      const { result } = renderHook(() => useTutor());
      
      act(() => {
        result.current.triggerMidLessonEvent(15, mockSetSystemAlert);
      });

      expect(mockSetSystemAlert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'BỊ PHỤ HUYNH MẮNG'
      }));

      const onOk = mockSetSystemAlert.mock.calls[0][0].onOk;
      act(() => {
        onOk();
      });

      expect(useGameStore.getState().stats.energy).toBe(90); // 100 - 10
    });

    it('nên cập nhật pendingEvent nhưng không đổi chỉ số khi rơi vào kịch bản Bị đuổi (30%)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.7); // Rơi vào 0.6 - 0.9
      
      const { result } = renderHook(() => useTutor());
      
      let eventType;
      act(() => {
        eventType = result.current.triggerMidLessonEvent(15, mockSetSystemAlert);
      });

      expect(eventType).toBe('expelled');
      expect(result.current.pendingEvent).toBe('expelled');
      expect(useGameStore.getState().stats.money).toBe(0);
      expect(useGameStore.getState().playerStats.hasTutorJob).toBe(true);
    });
  });

  describe('Final Effects', () => {
    it('nên hủy việc làm gia sư khi xử lý sự kiện expelled ở cuối buổi', async () => {
      const { result } = renderHook(() => useTutor());
      
      act(() => {
        result.current.handleFinalEvent('expelled', useGameStore.getState().stats, mockNotify, mockSetSystemAlert);
      });

      expect(mockSetSystemAlert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'BỊ CHO NGHỈ VIỆC'
      }));

      const onOk = mockSetSystemAlert.mock.calls[0][0].onOk;
      await act(async () => {
        onOk();
      });

      expect(useGameStore.getState().playerStats.hasTutorJob).toBe(false);
      expect(useGameStore.getState().stats.money).toBe(100000);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('nên trừ 20k học phí khi xử lý sự kiện pay_cut ở cuối buổi', async () => {
      const { result } = renderHook(() => useTutor());
      
      act(() => {
        result.current.handleFinalEvent('pay_cut', useGameStore.getState().stats, mockNotify, mockSetSystemAlert);
      });

      expect(mockSetSystemAlert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'CẮT GIẢM HỌC PHÍ'
      }));

      const onOk = mockSetSystemAlert.mock.calls[0][0].onOk;
      await act(async () => {
        onOk();
      });

      expect(useGameStore.getState().stats.money).toBe(80000);
      expect(useGameStore.getState().playerStats.hasTutorJob).toBe(true);
    });

    it('nên nhận đủ 100k nếu không có sự kiện tiêu cực', async () => {
      const { result } = renderHook(() => useTutor());
      
      await act(async () => {
        result.current.handleFinalEvent(null, useGameStore.getState().stats, mockNotify, mockSetSystemAlert);
      });

      expect(useGameStore.getState().stats.money).toBe(100000);
      expect(mockNotify).toHaveBeenCalledWith(expect.stringContaining('100,000'));
    });
  });
});
