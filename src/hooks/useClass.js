import { useCallback } from 'react';
import useGameStore from '../store/useGameStore';
import { supabase } from '../lib/supabaseClient';

export const useClass = () => {
  const { 
    updateStats, 
    updatePlayerStats,
    incrementAttendance 
  } = useGameStore();

  // Hàm đồng bộ dữ liệu chuyên cần lên Supabase
  const syncAttendanceToSupabase = useCallback(async (newAttendance) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    console.log('DEBUG: Syncing attendance data to Supabase...', { attendanceCount: newAttendance });
    const { error } = await supabase
      .from('profiles')
      .update({ 
        attendance_count: newAttendance 
      })
      .eq('id', session.user.id);

    if (error) {
      console.error('DEBUG: Supabase sync error:', error.message);
    }
  }, []);

  // Xử lý sự kiện ngẫu nhiên giữa buổi học (50%)
  const triggerClassEvent = useCallback((setSystemAlert) => {
    const rand = Math.random();
    
    if (rand < 0.35) { // 35% Bạn cho đồ ăn/Nói chuyện vui
      setSystemAlert({
        type: 'income',
        title: 'BẠN BÈ QUAN TÂM',
        message: 'Bạn vừa có một cuộc trò chuyện vui vẻ với bạn cùng bàn và được mời ăn vặt!',
        onOk: () => {
          const latestStats = useGameStore.getState().stats;
          updateStats({ energy: Math.min(100, latestStats.energy + 10) });
        }
      });
      return 'friendly';
    } 
    
    if (rand < 0.60) { // 25% Thu tiền quỹ lớp
      setSystemAlert({
        type: 'expense',
        title: 'THU TIỀN QUỸ LỚP',
        message: 'Cán sự lớp vừa đi thu tiền quỹ lớp định kỳ. Bạn phải đóng 50.000đ!',
        onOk: () => {
          const latestStats = useGameStore.getState().stats;
          updateStats({ money: Math.max(0, latestStats.money - 50000) });
        }
      });
      return 'class_fund';
    } 
    
    if (rand < 0.80) { // 20% Bị giảng viên khiển trách
      setSystemAlert({
        type: 'expense',
        title: 'BỊ KHIỂN TRÁCH',
        message: 'Bạn bị giảng viên nhắc nhở vì làm việc riêng trong giờ học. Thật là căng thẳng!',
        onOk: () => {
          const latestStats = useGameStore.getState().stats;
          updateStats({ energy: Math.max(0, latestStats.energy - 15) });
        }
      });
      return 'scolded';
    } 
    
    // 20% Sự kiện bình thường
    return 'normal';
  }, [updateStats]);

  // Xử lý kết thúc buổi học
  const handleFinalClassEvent = useCallback((notify) => {
    incrementAttendance();
    const latestPlayerStats = useGameStore.getState().playerStats;
    
    notify("Kết thúc buổi học! +1 Buổi chuyên cần.");
    
    // Đồng bộ lên Supabase
    syncAttendanceToSupabase(latestPlayerStats.attendanceCount);
  }, [incrementAttendance, syncAttendanceToSupabase]);

  // Xử lý bắt đầu buổi học
  const startClass = useCallback((setSystemAlert, notify, setStudying, setStudyProgress, closeModal, clearActiveTasks, taskIntervalRef) => {
    const state = useGameStore.getState();
    const stats = state.stats;
    const isClassStarting = state.isClassStarting;

    if (!isClassStarting) {
      notify("Chưa đến giờ học hoặc bạn đã điểm danh rồi!");
      return;
    }

    if (stats.energy < 20) {
      setSystemAlert({
        type: 'expense',
        title: 'KHÔNG ĐỦ NĂNG LƯỢNG',
        message: 'Bạn đang quá kiệt sức (cần ít nhất 20 năng lượng). Hãy nghỉ ngơi hoặc ăn uống trước khi vào lớp!'
      });
      return;
    }

    // Đủ năng lượng -> Trừ 20 energy và bắt đầu học
    updateStats({ energy: stats.energy - 20 });
    setStudying(true); 
    setStudyProgress(0); 
    state.setClassStatus(false); 
    closeModal();
    
    let studyCurrent = 0; 
    let eventTriggered = false;
    clearActiveTasks();
    taskIntervalRef.current = setInterval(() => {
      studyCurrent += 1;
      const prog = (studyCurrent / 30) * 100;
      
      // 1. Kích hoạt sự kiện giữa buổi (tại 50%)
      if (studyCurrent === 15 && !eventTriggered) {
        eventTriggered = true;
        triggerClassEvent(setSystemAlert);
      }

      if (prog >= 100) { 
        clearActiveTasks(); 
        setStudying(false); 
        handleFinalClassEvent(notify);
      } else {
        setStudyProgress(prog);
      }
    }, 1000);
  }, [updateStats, triggerClassEvent, handleFinalClassEvent]);

  return {
    triggerClassEvent,
    handleFinalClassEvent,
    startClass
  };
};
