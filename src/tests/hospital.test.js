import { describe, it, expect, beforeEach } from 'vitest';
import useGameStore from '../store/useGameStore';

describe('Hospital & Stroke System Logic', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  // --- 1. TEST GIỚI HẠN ĐỘT QUỴ (STROKE THRESHOLD) ---
  describe('Ngưỡng kích hoạt Đột quỵ', () => {
    it('nên kích hoạt isStroke sau lần nhập viện thứ 3', () => {
      const store = useGameStore.getState();

      // Giả lập nhập viện 2 lần đầu
      useGameStore.setState({ playerStats: { ...store.playerStats, hospitalCount: 2 } });
      
      // Lần nhập viện thứ 3
      store.incrementHospital(); // hospitalCount sẽ tăng lên 3

      expect(useGameStore.getState().playerStats.isStroke).toBe(true);
    });
  });
  // --- 2. TEST XỬ LÝ VIỆN PHÍ & TÌNH TRẠNG KẸT (HOSPITAL LOCK) ---
  describe('Thanh toán viện phí và Xuất viện', () => {
    const store = useGameStore.getState();
    const medicalFee = 1000000;

    // Giả lập đang nằm viện với hóa đơn 1 triệu
    useGameStore.setState({ 
      isHospitalized: true, 
      playerStats: { ...store.playerStats, activeMedicalBill: medicalFee } 
    });

      // Trường hợp 1: Không đủ tiền
    it('không cho xuất viện nếu chưa đủ tiền', () => {
      const { payHospitalBill } = useGameStore.getState();

      useGameStore.setState({
          stats: { ...useGameStore.getState().stats, money: 500000 },
          isHospitalized: true,
          playerStats: {
          ...useGameStore.getState().playerStats,
          activeMedicalBill: medicalFee
          }
    
      });

      payHospitalBill();

      const state = useGameStore.getState();
      expect(state.isHospitalized).toBe(true);
      expect(state.playerStats.activeMedicalBill).toBe(medicalFee);
    });

      // Trường hợp 2: Đủ tiền
    it('xuất viện khi đủ tiền', () => {
      const { payHospitalBill } = useGameStore.getState();

      useGameStore.setState({
        stats: { ...useGameStore.getState().stats, money: 2000000 },
        isHospitalized: true,
        playerStats: {
        ...useGameStore.getState().playerStats,
        activeMedicalBill: 1000000
        }
      });

      payHospitalBill();

      const state = useGameStore.getState();
      expect(state.isHospitalized).toBe(false);
      expect(state.playerStats.activeMedicalBill).toBe(0);
    });
  });
});

