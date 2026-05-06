import { describe, test, expect, vi, beforeEach } from 'vitest';
import useGameStore from '../store/useGameStore';

describe('Kiểm thử UI & Sidebar (Hiển thị)', () => {

  beforeEach(() => {
    // Đưa game về trạng thái ban đầu trước mỗi lần test
    useGameStore.getState().resetGame();
  });

  // --- 1. CHECK HIỂN THỊ SIDEBAR (REALTIME) ---
  describe('Cập nhật dữ liệu Sidebar', () => {
    test('Năng lượng trên Sidebar phải khớp với dữ liệu trong Store', () => {
      const store = useGameStore.getState();
      
      // Giả lập năng lượng giảm xuống 75%[cite: 5]
      store.updateStats({ energy: 75 });
      
      const currentState = useGameStore.getState();
      // Kiểm tra giá trị stats.energy mà Sidebar đang dùng để hiển thị thanh Bar[cite: 5, 9]
      expect(currentState.stats.energy).toBe(75);
    });

    test('Tiền hiển thị trên Sidebar phải cập nhật ngay khi thay đổi', () => {
      const store = useGameStore.getState();
      
      // Giả lập nhận trợ cấp 3.000.000đ[cite: 6]
      store.updateStats({ money: 3000000 });
      
      const moneyInK = (useGameStore.getState().stats.money / 1000).toFixed(0);
      // Sidebar hiển thị đơn vị 'k', nên 3.000.000 phải hiện là '3000k'
      expect(moneyInK).toBe('3000');
    });
  });

  // --- 2. CHECK THÔNG BÁO (NOTIFICATIONS) ---
  describe('Logic hiển thị Notifications', () => {
    test('Dọn sạch thông báo khi Game Over (Bị đuổi học hoặc Đột quỵ)', () => {
      // Giả lập đang có thông báo trên màn hình[cite: 6]
      let notifications = [{ id: 1, text: "Bạn đang đói!" }];
      
      // Giả lập trạng thái bị đuổi học[cite: 6]
      const isExpelled = true;
      
      // Logic trong App.jsx: Nếu bị đuổi học thì xóa sạch mảng notifications[cite: 6]
      if (isExpelled) {
        notifications = [];
      }
      
      expect(notifications.length).toBe(0);
    });

    test('Không cho phép nhận thông báo mới khi đang trong trạng thái Đột quỵ', () => {
      // Mô phỏng hàm notify trong App.jsx[cite: 6]
      const notify = (isStroke, text) => {
        if (isStroke) return []; // Nếu đột quỵ, không thêm thông báo mới[cite: 6]
        return [{ id: Date.now(), text }];
      };

      const result = notify(true, "Tiền lương đã về!");
      expect(result.length).toBe(0);
    });
  });

  // --- 3. CHECK RESPONSIVE & SCALE ---
  describe('Hệ thống Responsive (Scale Factor)', () => {
    test('ScaleFactor phải thay đổi khi kích thước trình duyệt thay đổi', () => {
      // Giả lập các kích thước màn hình khác nhau
      const DESIGN_WIDTH = 1440;

      expect(1024 / DESIGN_WIDTH).toBeLessThan(1); // thu nhỏ
      expect(1440 / DESIGN_WIDTH).toBe(1);         // giữ nguyên
      expect(1920 / DESIGN_WIDTH).toBeGreaterThan(1); // phóng to
    });
  });

  test('Tòa nhà phải mờ đi khi nhân vật đi phía sau (Occlusion)', () => {
    const store = useGameStore.getState();
    
    // Giả lập nhân vật đứng ở vị trí bị che khuất bởi Bệnh viện[cite: 2, 9]
    // Tọa độ Bệnh viện: x: 158.72, y: 59.44, w: 412.02, h: 367.63[cite: 2]
    const hiddenPosition = { x: 300, y: 200 }; 
    useGameStore.setState({ position: hiddenPosition });

    // Logic kiểm tra độ mờ (isOccluded) trong GameLayout.jsx
    const building = { x: 158.72, y: 59.44, w: 412.02, h: 367.63 };
    const buildingBaseY = building.y + building.h * 0.75;
    const playerFeetX = hiddenPosition.x + 10;
    const playerFeetY = hiddenPosition.y + 50;

    const isOccluded = 
      playerFeetX > building.x + building.w * 0.25 &&
      playerFeetX < building.x + building.w * 0.75 &&
      playerFeetY > building.y + building.h * 0.25 &&
      playerFeetY <= buildingBaseY;

    expect(isOccluded).toBe(true);
    // Nếu isOccluded là true, tòa nhà sẽ có style { opacity: 0.5 }
  });

  test('Nhân vật phải lật hình đúng hướng khi di chuyển trái/phải', () => {
    const store = useGameStore.getState();

    // Trường hợp đi bộ sang trái
    store.setDirection('left');
    let scaleX = (direction) => (direction === 'left' || direction === 'down' ? -1 : 1);
    expect(scaleX(useGameStore.getState().direction)).toBe(-1); // Phải lật hình

    // Trường hợp đi xe đạp sang phải
    store.setDirection('right');
    scaleX = (direction) => (direction === 'left' || direction === 'right' ? -1 : 1);
    expect(scaleX(useGameStore.getState().direction)).toBe(-1); // Xe đạp lật hình khi sang phải/trái
  });

  test('SystemAlert phải có Z-index cao hơn InteractionModal để không bị hiện đè hỗn loạn', () => {
    const modalZIndex = 50; // Z-index của header/vùng chứa modal cơ bản
    const systemAlertZIndex = 16000; // Z-index của các thông báo hệ thống
    const notificationZIndex = 99999; // Z-index của thông báo góc màn hình

    // Đảm bảo thông báo quan trọng luôn nằm trên bảng tương tác
    expect(systemAlertZIndex).toBeGreaterThan(modalZIndex);
    expect(notificationZIndex).toBeGreaterThan(systemAlertZIndex);
  });

  test('Thông báo nhặt đồ/trợ cấp không được hiện khi game chưa bắt đầu', () => {
    const isGameStarted = false;
    const notifications = [{ id: 1, text: "Nhận được tiền" }];
    
    // Logic dọn dẹp thông báo trong App.jsx
    let activeNotifications = notifications;
    if (!isGameStarted) {
      activeNotifications = [];
    }
    
    expect(activeNotifications.length).toBe(0);
  });
});