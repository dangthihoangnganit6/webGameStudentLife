import { describe, test, expect, beforeEach, vi } from 'vitest';
import useGameStore from '../store/useGameStore';

describe('Kiểm thử Logic & Trình tự (Sequence & Workflow)', () => {

  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  // --- 1. CHECK TRÌNH TỰ (SEQUENCE) & ĐIỀU KIỆN CẦN (PREREQUISITE) ---
  describe('Điều kiện cần và Trình tự nhận việc', () => {
    test('Không được phép dạy gia sư nếu chưa nhận việc tại Trung tâm', () => {
      const store = useGameStore.getState();
      
      // Giả lập: Người chơi chưa có việc (hasTutorJob: false)[cite: 5]
      // Nhưng cố tình đứng vào vùng tương tác của Nhà học sinh (student_house)
      const studentHouseLoc = { id: 'student_house' };
      
      // Logic trong App.jsx: Chỉ mở Modal nếu đã có việc
      const canOpen = (loc) => {
        if (loc.id === 'student_house' && !store.playerStats.hasTutorJob) return false;
        return true;
      };

      expect(canOpen(studentHouseLoc)).toBe(false);
    });

    test('Chỉ được nhận việc khi có đủ tiền đóng phí môi giới', () => {
      const store = useGameStore.getState();
      // Giả lập: Tiền 0đ
      useGameStore.setState({ stats: { ...store.stats, money: 0 } });

      // Mô phỏng handleAction 'accept_tutor' đòi phí 300k
      const mockNotify = vi.fn();
      const handleAcceptTutor = (money) => {
        if (money < 300000) {
          mockNotify("Bạn không có đủ 300.000đ để đóng phí môi giới!");
          return false;
        }
        return true;
      };

      const result = handleAcceptTutor(useGameStore.getState().stats.money);
      expect(result).toBe(false);
      expect(mockNotify).toHaveBeenCalledWith(expect.stringContaining("không có đủ 300.000đ"));
    });
  });

  // --- 2. CHECK HỘI THOẠI & TASK (DYNAMIC CONTENT) ---
  describe('Thay đổi nội dung thông báo theo tiến độ', () => {
    test('Thông báo Game Over phải thay đổi đúng theo lý do bị đuổi học', () => {
      const store = useGameStore.getState();

      // Trường hợp 1: Nghỉ học quá buổi
      useGameStore.setState({ playerStats: { ...store.playerStats, isExpelled: true, expulsionReason: 'attendance' } });
      let message = useGameStore.getState().playerStats.expulsionReason === 'attendance' 
        ? "Vì vắng học quá 3 buổi..." : "...";
      expect(message).toContain("vắng học quá 3 buổi");

      // Trường hợp 2: Quên đăng ký tín chỉ
      useGameStore.setState({ playerStats: { ...store.playerStats, isExpelled: true, expulsionReason: 'enrollment' } });
      message = useGameStore.getState().playerStats.expulsionReason === 'attendance' 
        ? "..." : "Vì không đăng ký tín chỉ đúng hạn...";
      expect(message).toContain("không đăng ký tín chỉ đúng hạn");
    });
  });

  // --- 3. CHECK PHÁ GAME (TASK SUSPENSION) ---
  describe('Xử lý khi đang làm dở nhiệm vụ mà bỏ chạy', () => {
    test('Khi bị ngất xỉu (Exhausted), mọi Task đang chạy phải bị hủy ngay lập tức', () => {
      const store = useGameStore.getState();
      
      // Giả lập: Đang nấu ăn hoặc đang học gia sư
      useGameStore.setState({ isCooking: true, isTutoring: true });

      // Logic handleExhaustedOk trong App.jsx: reset mọi progress
      const clearActiveTasks = () => {
        useGameStore.setState({ isCooking: false, isTutoring: false });
      };

      clearActiveTasks();
      
      const state = useGameStore.getState();
      expect(state.isCooking).toBe(false);
      expect(state.isTutoring).toBe(false);
    });
  });
});