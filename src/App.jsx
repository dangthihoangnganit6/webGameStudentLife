import React, { useEffect, useCallback, useState } from 'react';
import useGameStore from './store/useGameStore';
import useKeyboard from './hooks/useKeyboard';
import { calculateNextMove, getDistance } from './game/movement';
import { MAP_CONFIG } from './game/constants';
import { LOCATIONS } from './data/locations';
import InteractionModal from './components/InteractionModal';
import AttendanceTimer from './components/AttendanceTimer';
import CookingOverlay from './components/CookingOverlay';
import SleepOverlay from './components/SleepOverlay';
import TermTimer from './components/TermTimer';
import GameOver from './components/GameOver';
import { X } from 'lucide-react';

function App() {
  const { 
    position, updatePosition, 
    direction, setDirection,
    stats, updateStats, 
    playerStats, updatePlayerStats, resetSchoolData,
    advanceTime,
    currentScene, setCurrentScene,
    isModalOpen, activeLocation, openModal, closeModal,
    interactionStep, setInteractionStep,
    isClassStarting, setClassStatus, nextClassTimer, checkInWindow, updateTimers, incrementMissed, incrementAttendance,
    isCooking, setCooking, cookingProgress, setCookingProgress, addToInventory, removeFromInventory, payRent,
    isSleeping, setSleeping, sleepProgress, setSleepProgress, 
    resetGame
  } = useGameStore();
 
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((text) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 2000);
  }, []);

  const keys = useKeyboard();
  const [showPrompt, setShowPrompt] = useState(null);
  const [timeLeftToEnroll, setTimeLeftToEnroll] = useState(30 * 60);

  // Term Sync & Expulsion Logic
  useEffect(() => {
    let startTime = localStorage.getItem('termStartTime');
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem('termStartTime', startTime);
      updatePlayerStats({ termStartTime: parseInt(startTime) });
    } else if (!playerStats.termStartTime) {
      updatePlayerStats({ termStartTime: parseInt(startTime) });
    }

    const termTimer = setInterval(() => {
      const startValue = playerStats.termStartTime || parseInt(startTime);
      const now = Date.now();
      const elapsed = (now - startValue) / 1000; // in seconds
      const remaining = Math.max(0, (30 * 60) - elapsed);
      setTimeLeftToEnroll(remaining);

      if (remaining <= 0 && !playerStats.isEnrolled) {
        updatePlayerStats({ isExpelled: true });
        clearInterval(termTimer);
      }
    }, 1000);

    return () => clearInterval(termTimer);
  }, [playerStats.isEnrolled, playerStats.termStartTime, updatePlayerStats]);

  // Periodic Energy Exhaustion Logic (1 unit per 10s)
  useEffect(() => {
    const energyTimer = setInterval(() => {
      if (stats.energy > 0) {
        updateStats({ energy: Math.max(0, stats.energy - 1) });
      }
    }, 10000);

    return () => clearInterval(energyTimer);
  }, [stats.energy, updateStats]);

  // Homeless Energy Depletion (1 unit per 1s)
  useEffect(() => {
    if (playerStats.rentedRoom) return;

    const homelessTimer = setInterval(() => {
      if (stats.energy > 0) {
        updateStats({ energy: Math.max(0, stats.energy - 1) });
      }
    }, 1000);

    return () => clearInterval(homelessTimer);
  }, [playerStats.rentedRoom, stats.energy, updateStats]);

  // Homeless Notification Logic
  useEffect(() => {
    if (playerStats.rentedRoom) return;

    // Show notification every 15 seconds if still homeless (reduced frequency)
    notify("Bạn đang không có nhà ở, năng lượng bị giảm mỗi giây");
    const interval = setInterval(() => {
      notify("Bạn đang không có nhà ở, năng lượng bị giảm mỗi giây");
    }, 15000);
    return () => clearInterval(interval);
  }, [playerStats.rentedRoom, notify]);

  // Energy Status Monitoring
  const [lastWarningTime, setLastWarningTime] = useState(0);
  useEffect(() => {
    if (stats.energy <= 0) {
      notify("Bạn đã quá kiệt sức và ngất xỉu! Bạn được đưa vào Bệnh viện.");
      updatePosition({ x: 50, y: 450 }); // Hospital coordinates
      updateStats({ energy: 20 }); // Give some energy back so they can move
    } else if (stats.energy <= 20) {
      const now = Date.now();
      if (now - lastWarningTime > 30000) { // Warn every 30s
        notify("Bạn quá mệt, hãy về phòng nấu ăn hoặc nghỉ ngơi!");
        setLastWarningTime(now);
      }
    }
  }, [stats.energy, updatePosition, updateStats, lastWarningTime, notify]);

  // Allowance Loop Logic
  useEffect(() => {
    const baseT = playerStats.totalCredits > 0 ? playerStats.totalCredits / 5 : 5;
    const intervalMinutes = playerStats.difficulty === 'hard' ? baseT / 2 : baseT;
    const allowanceIntervalSeconds = Math.max(10, Math.round(intervalMinutes * 60)) * 3;

    const allowanceTimer = setInterval(() => {
      const nextAcc = playerStats.allowanceAccumulator + 1;
      if (nextAcc >= allowanceIntervalSeconds) {
        updateStats({ money: stats.money + 3000000 });
        updatePlayerStats({ allowanceAccumulator: 0 });
        notify("Bố mẹ vừa gửi cho bạn 3.000.000đ tiền sinh hoạt phí!");
      } else {
        updatePlayerStats({ allowanceAccumulator: nextAcc });
      }
    }, 1000);

    return () => clearInterval(allowanceTimer);
  }, [playerStats.allowanceAccumulator, playerStats.totalCredits, playerStats.difficulty, stats.money, updateStats, updatePlayerStats, notify]);

  // Stable Movement Loop
  useEffect(() => {
    const moveLoop = setInterval(() => {
      const state = useGameStore.getState();
      const currentKeys = keys; // keys state is fine since it's updated via listeners

      if (state.isModalOpen || state.isCooking || state.isSleeping || state.playerStats.isExpelled || state.stats.energy <= 0 || state.currentScene !== 'map') return;

      let moveKey = null;
      if (currentKeys.ArrowUp) moveKey = 'ArrowUp';
      else if (currentKeys.ArrowDown) moveKey = 'ArrowDown';
      else if (currentKeys.ArrowLeft) moveKey = 'ArrowLeft';
      else if (currentKeys.ArrowRight) moveKey = 'ArrowRight';

      if (moveKey) {
        if (moveKey.includes('Up')) setDirection('up');
        if (moveKey.includes('Down')) setDirection('down');
        if (moveKey.includes('Left')) setDirection('left');
        if (moveKey.includes('Right')) setDirection('right');

        const nextPos = calculateNextMove(state.position, moveKey, MAP_CONFIG.CHARACTER_SPEED);
        updatePosition(nextPos);
        
        const nearby = LOCATIONS.find(loc => {
          const dist = getDistance({ x: nextPos.x + 16, y: nextPos.y + 16 }, { x: loc.x + 60, y: loc.y + 50 });
          return dist < 80;
        });

        if (nearby) {
          if (!state.isModalOpen && showPrompt?.id !== nearby.id) {
            openModal(nearby);
            setShowPrompt(nearby);
          }
        } else {
          setShowPrompt(null);
        }
      }
    }, 16);

    return () => clearInterval(moveLoop);
  }, [keys, openModal, showPrompt, updatePosition, setDirection]); // Reduced dependencies, using state directly inside

  // Attendance Loop logic
  useEffect(() => {
    if (playerStats.isDroppedOut || !playerStats.isEnrolled || !playerStats.isPaid) return;

    const baseT = playerStats.totalCredits / 5;
    const intervalMinutes = playerStats.difficulty === 'hard' ? baseT / 2 : baseT;
    const intervalSeconds = Math.max(10, Math.round(intervalMinutes * 60)); // demo speed

    const timer = setInterval(() => {
      if (!isClassStarting) {
        if (nextClassTimer <= 0) {
          setClassStatus(true);
          updateTimers(intervalSeconds, 60);
        } else {
          updateTimers(nextClassTimer - 1, 0);
        }
      } else {
        if (checkInWindow <= 0) {
          incrementMissed();
          setClassStatus(false);
          updateTimers(intervalSeconds, 0);
        } else {
          updateTimers(nextClassTimer, checkInWindow - 1);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    playerStats.isDroppedOut, playerStats.isEnrolled, playerStats.isPaid, playerStats.totalCredits, playerStats.difficulty,
    isClassStarting, nextClassTimer, checkInWindow, setClassStatus, updateTimers, incrementMissed
  ]);

  // Rent Billing Loop
  useEffect(() => {
    if (!playerStats.rentedRoom) return;

    const baseT = playerStats.totalCredits > 0 ? playerStats.totalCredits / 5 : 5;
    const intervalMinutes = playerStats.difficulty === 'hard' ? baseT / 2 : baseT;
    const rentIntervalSeconds = Math.max(10, Math.round(intervalMinutes * 60)) * 3;

    const billingTimer = setInterval(() => {
      const nextTimer = playerStats.rentTimer + 1;
      if (nextTimer >= rentIntervalSeconds) {
        payRent();
        notify(`Bạn đã bị trừ ${playerStats.rentedRoom.price.toLocaleString()}đ tiền thuê phòng!`);
      } else {
        updatePlayerStats({ rentTimer: nextTimer });
      }
    }, 1000);

    return () => clearInterval(billingTimer);
  }, [playerStats.rentedRoom, playerStats.rentTimer, playerStats.totalCredits, playerStats.difficulty, payRent, updatePlayerStats]);

  // Vòng lặp kết thúc
  useEffect(() => {
    if (!playerStats.isEnrolled) return;

    if (playerStats.attendanceCount >= playerStats.totalCredits && playerStats.totalCredits > 0) {
      notify("CHÚC MỪNG: Bạn đã hoàn thành kỳ học xuất sắc!");
      resetSchoolData();
    } else if (playerStats.missedClasses >= 3) {
      notify("CẢNH BÁO: Bạn đã bị thôi học do vắng quá nhiều!");
      resetSchoolData();
    }
  }, [playerStats.attendanceCount, playerStats.missedClasses, playerStats.totalCredits, playerStats.isEnrolled, resetSchoolData]);

  const handleAction = (type, data) => {
    switch (type) {
      case 'enroll':
        const tuition = data.credits * 1000000;
        updatePlayerStats({ 
          credits: data.credits, 
          totalCredits: data.credits,
          difficulty: data.difficulty,
          isEnrolled: true,
          isPaid: false,
          tuitionDue: tuition,
          pendingParentSupport: false,
          hasClaimedParentSupport: false,
          attendanceCount: 0,
          missedClasses: 0
        });
        // Remove closeModal() to transition to payment view immediately
        break;
      case 'pay_tuition':
        if (stats.money >= playerStats.tuitionDue) {
          updateStats({ money: stats.money - playerStats.tuitionDue });
          updatePlayerStats({ isPaid: true, tuitionDue: 0 });
          notify("Thanh toán học phí thành công!");
          closeModal();
        }
        break;
      case 'ask_parents':
        updatePlayerStats({ pendingParentSupport: true });
        notify("Đã gửi yêu cầu, hãy về Nhà (Bố mẹ) để lấy tiền!");
        break;
      case 'get_parent_money':
        if (playerStats.pendingParentSupport) {
          updateStats({ money: stats.money + playerStats.tuitionDue });
          updatePlayerStats({ pendingParentSupport: false, hasClaimedParentSupport: true });
          notify(`Bố mẹ đã cho bạn ${playerStats.tuitionDue.toLocaleString()}đ tiền học phí!`);
          closeModal();
        }
        break;
      case 'check_in':
        if (isClassStarting) {
          updateStats({ energy: Math.max(0, stats.energy - 20) });
          incrementAttendance();
          setClassStatus(false);
          closeModal();
        }
        break;
      case 'rent_room':
        if (stats.money >= data.price) {
          updateStats({ money: stats.money - data.price });
          updatePlayerStats({ rentedRoom: data, rentTimer: 0 });
          notify(`Bạn đã thuê phòng ${data.label} thành công!`);
          closeModal();
        } else {
          notify("Không đủ tiền thuê phòng!");
        }
        break;
      case 'buy_ingredient':
        if (stats.money >= data.price) {
          updateStats({ money: stats.money - data.price });
          addToInventory(data);
          notify(`Đã mua ${data.name}!`);
        } else {
          notify("Không đủ tiền mua nguyên liệu!");
        }
        break;
      case 'start_cooking':
        const item = playerStats.inventory[data.index];
        removeFromInventory(data.index);
        setCooking(true);
        setCookingProgress(0);
        closeModal();

        const totalTime = item.cookTime; // in seconds for demo
        let current = 0;
        const cookInterval = setInterval(() => {
          current += 0.1;
          const prog = (current / totalTime) * 100;
          if (prog >= 100) {
            clearInterval(cookInterval);
            setCooking(false);
            const success = Math.random() < 0.8;
            if (success) {
              updateStats({ energy: Math.min(100, stats.energy + item.energy) });
              notify(`Nấu ăn thành công! Bạn nhận được ${item.energy} năng lượng.`);
            } else {
              notify("Món ăn bị cháy rồi! Thật đáng tiếc.");
            }
          } else {
            setCookingProgress(prog);
          }
        }, 100);
        break;
      case 'start_sleeping':
        setSleeping(true);
        setSleepProgress(0);
        closeModal();

        const totalSleepTime = 30; // 30 seconds as requested
        let sleepCurrent = 0;
        const sleepInterval = setInterval(() => {
          sleepCurrent += 0.1;
          const prog = (sleepCurrent / totalSleepTime) * 100;
          if (prog >= 100) {
            clearInterval(sleepInterval);
            setSleeping(false);
            updateStats({ energy: Math.min(100, stats.energy + 30) });
            notify("Bạn đã tỉnh táo hơn sau giấc ngủ! (+30 Energy)");
          } else {
            setSleepProgress(prog);
          }
        }, 100);
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-screen h-screen bg-green-100 overflow-hidden relative font-sans">
      {playerStats.isEnrolled && playerStats.isPaid && (
        <AttendanceTimer 
          nextClassTimer={nextClassTimer}
          checkInWindow={checkInWindow}
          isClassStarting={isClassStarting}
          playerStats={playerStats}
        />
      )}

      {!playerStats.isEnrolled && (
        <TermTimer timeLeft={timeLeftToEnroll} isEnrolled={playerStats.isEnrolled} />
      )}

      {playerStats.isExpelled && <GameOver onReset={resetGame} />}

      {isCooking && <CookingOverlay progress={cookingProgress} />}
      {isSleeping && <SleepOverlay progress={sleepProgress} />}

      {/* HUD Header */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-50 pointer-events-none">
        {/* Central Energy Bar */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-64 pointer-events-auto">
          <div className="glass-morphism p-3 border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-1.5 px-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Năng lượng</span>
              <span className={`text-xs font-black ${stats.energy <= 20 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
                {stats.energy}%
              </span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  stats.energy <= 20 
                  ? 'bg-gradient-to-r from-red-600 to-orange-500' 
                  : stats.energy <= 50
                  ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                }`}
                style={{ width: `${stats.energy}%` }}
              />
            </div>
          </div>
        </div>

        <div className="glass-morphism p-4 flex gap-6 pointer-events-auto text-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase opacity-50 block">Sinh viên</span>
            <span className="text-sm font-bold">{playerStats.isEnrolled ? "Đang đi học" : "Chưa nhập học"}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase opacity-50 block">Tài khoản</span>
            <span className="text-xl font-black text-emerald-600">{stats.money.toLocaleString()}đ</span>
          </div>
        </div>
        
        <div className="glass-morphism px-6 py-3 pointer-events-auto text-slate-800 font-bold">
          Ngày {stats.time.day} {String(stats.time.hour).padStart(2, '0')}:00
        </div>
      </div>

      {/* World Map */}
      <div className="absolute inset-0">
        {LOCATIONS.map(loc => (
          <div
            key={loc.id}
            className={`absolute ${loc.color} w-[120px] h-[100px] flex items-center justify-center text-white font-bold rounded-xl shadow-lg border-4 border-white/20 transition-all`}
            style={{ left: loc.x, top: loc.y }}
          >
            <div className="text-center">
               <div className="text-[8px] uppercase tracking-widest opacity-50">{loc.id}</div>
               {loc.name}
            </div>
          </div>
        ))}

        {/* Player */}
        <div
          className="absolute w-8 h-8 bg-slate-900 rounded-full border-2 border-white shadow-xl flex items-center justify-center z-20"
          style={{ left: position.x, top: position.y }}
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[1000]">
        {notifications.map(n => (
          <div key={n.id} className="bg-slate-900/90 backdrop-blur-md border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-300">
             <span className="text-xs font-bold leading-tight">{n.text}</span>
             <button 
              onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
             >
                <X className="w-4 h-4 text-white/40" />
             </button>
          </div>
        ))}
      </div>

      {/* Interaction Modal */}
      {isModalOpen && (
        <InteractionModal 
          location={activeLocation}
          interactionStep={interactionStep}
          setInteractionStep={setInteractionStep}
          onClose={closeModal}
          onAction={handleAction}
          playerStats={playerStats}
          stats={stats}
          isClassStarting={isClassStarting}
        />
      )}
    </div>
  );
}

export default App;
