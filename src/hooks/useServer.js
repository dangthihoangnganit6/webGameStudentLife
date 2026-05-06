import { useState, useCallback } from 'react';
import useGameStore from '../store/useGameStore';
import { supabase } from '../lib/supabaseClient';

export const useServer = () => {
  const { 
    updateStats, 
    updatePlayerStats 
  } = useGameStore();

  const [pendingEvent, setPendingEvent] = useState(null); // 'karen' | 'manager_happy'

  // Hàm đồng bộ dữ liệu lên Supabase
  const syncToSupabase = useCallback(async (money, hasWaiterJob) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    console.log('DEBUG: Syncing waiter data to Supabase...', { money, hasWaiterJob });
    const { error } = await supabase
      .from('profiles')
      .update({ 
        money: money,
        has_waiter_job: hasWaiterJob 
      })
      .eq('id', session.user.id);

    if (error) {
      console.error('DEBUG: Supabase sync error:', error.message);
    }
  }, []);

  // Xử lý sự kiện ngẫu nhiên giữa buổi (50%)
  const triggerMidShiftEvent = useCallback((setSystemAlert) => {
    const rand = Math.random();
    
    if (rand < 0.5) { // 50% Được khách cho tiền tip
      setSystemAlert({
        type: 'income',
        title: 'ĐƯỢC KHÁCH CHO TIỀN TIP',
        message: 'Khách hàng rất hài lòng với thái độ phục vụ của bạn và đã thưởng nóng 30.000đ!',
        onOk: () => {
          const latestStats = useGameStore.getState().stats;
          updateStats({ money: latestStats.money + 30000 });
        }
      });
      return null;
    } 
    
    if (rand < 0.7) { // 20% Làm vỡ bát đĩa
      setSystemAlert({
        type: 'expense',
        title: 'LÀM VỠ BÁT ĐĨA',
        message: 'Bạn vô tình làm rơi khay thức ăn. Bị quản lý khiển trách và phải bồi thường 20.000đ!',
        onOk: () => {
          const latestStats = useGameStore.getState().stats;
          updateStats({ 
            money: Math.max(0, latestStats.money - 20000),
            energy: Math.max(0, latestStats.energy - 5)
          });
        }
      });
      return null;
    } 
    
    if (rand < 0.9) { // 20% Khách hàng khó tính (Karen)
      setPendingEvent('karen');
      setSystemAlert({
        type: 'expense',
        title: 'CẢNH BÁO',
        message: 'Một khách hàng khó tính đang liên tục phàn nàn về thái độ phục vụ của bạn với quản lý...'
      });
      return 'karen';
    } 
    
    // 10% Quản lý hài lòng
    setPendingEvent('manager_happy');
    setSystemAlert({
      type: 'income',
      title: 'QUẢN LÝ KHEN NGỢI',
      message: 'Quản lý đang rất ấn tượng với tốc độ làm việc của bạn trong ca này!'
    });
    return 'manager_happy';
  }, [updateStats]);

  // Xử lý kết quả cuối ca
  const handleFinalShiftEvent = useCallback((activeEvent, stats, notify, setSystemAlert) => {
    const completeWorking = (finalIncome) => {
      const latestStats = useGameStore.getState().stats;
      const newMoney = latestStats.money + finalIncome;
      
      updateStats({ 
        money: newMoney, 
        energy: Math.max(0, latestStats.energy - 10) 
      });

      notify(`Hoàn thành ca làm việc! +${finalIncome.toLocaleString()}đ`);
      
      // Đồng bộ lên Supabase
      syncToSupabase(newMoney, latestStats.hasWaiterJob);
      setPendingEvent(null);
    };

    const baseWage = 50000;

    if (activeEvent === 'karen') {
      setSystemAlert({
        type: 'expense',
        title: 'BỊ TRỪ LƯƠNG',
        message: 'Vì khách hàng khiếu nại quá nhiều, quản lý quyết định trừ 30.000đ vào lương ca này của bạn.',
        onOk: () => completeWorking(baseWage - 30000)
      });
    } else if (activeEvent === 'manager_happy') {
      setSystemAlert({
        type: 'income',
        title: 'THƯỞNG NÓNG',
        message: 'Quản lý quyết định thưởng thêm 20% lương vì sự nỗ lực vượt bậc của bạn trong ca làm!',
        onOk: () => completeWorking(baseWage * 1.2)
      });
    } else {
      completeWorking(baseWage);
    }
  }, [updateStats, syncToSupabase]);

  return {
    pendingEvent,
    setPendingEvent,
    triggerMidShiftEvent,
    handleFinalShiftEvent
  };
};
