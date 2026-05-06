import { useState, useCallback } from 'react';
import useGameStore from '../store/useGameStore';
import { supabase } from '../lib/supabaseClient';

export const useTutor = () => {
  const { 
    updateStats, 
    updatePlayerStats, 
    setTutoring, 
    setTutoringProgress 
  } = useGameStore();

  const [isProcessingEvent, setIsProcessingEvent] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(null); // 'expelled' | 'pay_cut'

  // Hàm đồng bộ dữ liệu lên Supabase
  const syncToSupabase = useCallback(async (money, hasTutorJob) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    console.log('DEBUG: Syncing tutor data to Supabase...', { money, hasTutorJob });
    const { error } = await supabase
      .from('profiles')
      .update({ 
        money: money,
        has_tutor_job: hasTutorJob 
      })
      .eq('id', session.user.id);

    if (error) {
      console.error('DEBUG: Supabase sync error:', error.message);
    }
  }, []);

  // Xử lý sự kiện ngẫu nhiên giữa buổi
  const triggerMidLessonEvent = useCallback((tutorCurrent, setSystemAlert) => {
    const rand = Math.random();
    
    if (rand < 0.4) { // 40% Được tặng đồ ăn
      setSystemAlert({
        type: 'income',
        title: 'ĐƯỢC TẶNG ĐỒ ĂN',
        message: 'Phụ huynh thấy bạn dạy nhiệt tình quá nên đã tặng bạn một hộp cơm bổ dưỡng!',
        onOk: () => {
          const latestStats = useGameStore.getState().stats;
          updateStats({ energy: Math.min(100, latestStats.energy + 10) });
        }
      });
      return null;
    } 
    
    if (rand < 0.6) { // 20% Bị chửi
      setSystemAlert({
        type: 'expense',
        title: 'BỊ PHỤ HUYNH MẮNG',
        message: 'Học sinh làm bài sai, phụ huynh đổ lỗi cho bạn dạy không kỹ và mắng một trận tơi bời!',
        onOk: () => {
          const latestStats = useGameStore.getState().stats;
          updateStats({ energy: Math.max(0, latestStats.energy - 10) });
        }
      });
      return null;
    } 
    
    if (rand < 0.9) { // 30% Bị đuổi (Cảnh báo)
      setPendingEvent('expelled');
      setSystemAlert({
        type: 'expense',
        title: 'CẢNH BÁO',
        message: 'Phụ huynh đang có vẻ rất không hài lòng với kết quả học tập gần đây của con họ...'
      });
      return 'expelled';
    } 
    
    // 10% Chê đắt (Cảnh báo)
    setPendingEvent('pay_cut');
    setSystemAlert({
      type: 'expense',
      title: 'CẢNH BÁO',
      message: 'Phụ huynh phàn nàn rằng mức học phí hiện tại đang hơi cao so với mặt bằng chung...'
    });
    return 'pay_cut';
  }, [updateStats]);

  // Xử lý kết quả cuối buổi
  const handleFinalEvent = useCallback((activeEvent, stats, notify, setSystemAlert) => {
    const completeTeaching = (finalIncome, shouldKeepJob = true) => {
      const latestStats = useGameStore.getState().stats;
      const newMoney = latestStats.money + finalIncome;
      
      updateStats({ 
        money: newMoney, 
        energy: Math.max(0, latestStats.energy - 10) 
      });

      if (!shouldKeepJob) {
        updatePlayerStats({ hasTutorJob: false });
      }

      notify(`Hoàn thành buổi dạy! +${finalIncome.toLocaleString()}đ`);
      
      // Đồng bộ lên Supabase
      syncToSupabase(newMoney, shouldKeepJob);
      setPendingEvent(null);
    };

    if (activeEvent === 'expelled') {
      setSystemAlert({
        type: 'expense',
        title: 'BỊ CHO NGHỈ VIỆC',
        message: 'Đúng như dự đoán, phụ huynh đã chính thức quyết định cho bạn nghỉ việc từ ngày mai.',
        onOk: () => completeTeaching(100000, false)
      });
    } else if (activeEvent === 'pay_cut') {
      setSystemAlert({
        type: 'expense',
        title: 'CẮT GIẢM HỌC PHÍ',
        message: 'Gia chủ quyết định cắt giảm 20.000đ học phí buổi này vì cho rằng chất lượng chưa tương xứng.',
        onOk: () => completeTeaching(80000, true)
      });
    } else {
      completeTeaching(100000, true);
    }
  }, [updateStats, updatePlayerStats, syncToSupabase]);

  return {
    isProcessingEvent,
    setIsProcessingEvent,
    pendingEvent,
    setPendingEvent,
    triggerMidLessonEvent,
    handleFinalEvent
  };
};
