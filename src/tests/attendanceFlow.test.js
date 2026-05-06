import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClass } from '../hooks/useClass';
import useGameStore from '../store/useGameStore';

// Mock UI callbacks
const mockSetSystemAlert = vi.fn();
const mockNotify = vi.fn();
const mockSetStudying = vi.fn();
const mockSetStudyProgress = vi.fn();
const mockCloseModal = vi.fn();
const mockClearActiveTasks = vi.fn();
const mockTaskIntervalRef = { current: null };

describe('Attendance Flow & UI logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => {
      useGameStore.getState().resetGame();
    });
    vi.useFakeTimers();
  });

  it('Test Case 1 (Thiếu năng lượng): Nên hiện Modal thông báo và không bắt đầu học', () => {
    // Giả lập energy < 20
    act(() => {
      useGameStore.getState().updateStats({ energy: 10 });
      useGameStore.getState().setClassStatus(true);
    });

    const { result } = renderHook(() => useClass());

    act(() => {
      result.current.startClass(
        mockSetSystemAlert,
        mockNotify,
        mockSetStudying,
        mockSetStudyProgress,
        mockCloseModal,
        mockClearActiveTasks,
        mockTaskIntervalRef
      );
    });

    expect(mockSetSystemAlert).toHaveBeenCalledWith(expect.objectContaining({
      title: 'KHÔNG ĐỦ NĂNG LƯỢNG'
    }));
    expect(mockSetStudying).not.toHaveBeenCalled();
    expect(useGameStore.getState().isStudying).toBe(false);
  });

  it('Test Case 2 (Đủ năng lượng): Nên bắt đầu tiến trình học và trừ năng lượng', () => {
    act(() => {
      useGameStore.getState().updateStats({ energy: 100 });
      useGameStore.getState().setClassStatus(true);
    });

    const { result } = renderHook(() => useClass());

    act(() => {
      result.current.startClass(
        mockSetSystemAlert,
        mockNotify,
        mockSetStudying,
        mockSetStudyProgress,
        mockCloseModal,
        mockClearActiveTasks,
        mockTaskIntervalRef
      );
    });

    // Kiểm tra trừ năng lượng ngay khi bắt đầu (Requirement 4)
    expect(useGameStore.getState().stats.energy).toBe(80); // 100 - 20
    expect(mockSetStudying).toHaveBeenCalledWith(true);
    expect(mockSetStudyProgress).toHaveBeenCalledWith(0);
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('Test Case 3 (Tiến trình 30s): Nên chạy đủ 30s và kết thúc', () => {
    act(() => {
      useGameStore.getState().updateStats({ energy: 100 });
      useGameStore.getState().setClassStatus(true);
    });

    const { result } = renderHook(() => useClass());

    act(() => {
      result.current.startClass(
        mockSetSystemAlert,
        mockNotify,
        mockSetStudying,
        mockSetStudyProgress,
        mockCloseModal,
        mockClearActiveTasks,
        mockTaskIntervalRef
      );
    });

    // Giả lập chạy 30s
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(mockSetStudying).toHaveBeenCalledWith(false);
    expect(useGameStore.getState().playerStats.attendanceCount).toBe(1);
    expect(mockNotify).toHaveBeenCalledWith(expect.stringContaining('Kết thúc buổi học'));
  });
});
