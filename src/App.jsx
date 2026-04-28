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
import HospitalOverlay from './components/HospitalOverlay';
import TermTimer from './components/TermTimer';
import ElectricityBillOverlay from './components/ElectricityBillOverlay';
import GameOver from './components/GameOver';
import { X, Activity } from 'lucide-react';

import pathImage from './assets/path.png';
import hospitalImage from './assets/hospital.png';
import universityImage from './assets/university.png';
import apartmentImage from './assets/apartment.png';
import supermarketImage from './assets/supermarket.png';
import homeImage from './assets/home.png';
import jobCenterImage from './assets/job_center.png';

const IMAGE_MAP = {
  'hospital.png': hospitalImage,
  'university.png': universityImage,
  'apartment.png': apartmentImage,
  'supermarket.png': supermarketImage,
  'home.png': homeImage,
  'job_center.png': jobCenterImage
};

const isPointInRotatedRect = (px, py, rect) => {
  const { x, y, w, h, rotation } = rect;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const angleRad = rotation * (Math.PI / 180);
  
  const dx = px - cx;
  const dy = py - cy;
  
  const unX = Math.cos(-angleRad) * dx - Math.sin(-angleRad) * dy;
  const unY = Math.sin(-angleRad) * dx + Math.cos(-angleRad) * dy;
  
  return unX >= -w / 2 && unX <= w / 2 && unY >= -h / 2 && unY <= h / 2;
};

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
    isHospitalized, setHospitalized, hospitalizationProgress, setHospitalizationProgress,
    generateElectricityBill, payElectricityBill, updateElectricityTimer,
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
  const [timeLeftToEnroll, setTimeLeftToEnroll] = useState(5 * 60);
  const [showExhaustedPopup, setShowExhaustedPopup] = useState(false);

  const DESIGN_WIDTH = 1440;
  const DESIGN_HEIGHT = 1024;

  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      setScaleFactor(Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT));
    };
    handleResize(); // Initialize on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      if (playerStats.isPaid) {
        clearInterval(termTimer);
        return;
      }
      const startValue = playerStats.termStartTime || parseInt(startTime);
      const now = Date.now();
      const elapsed = (now - startValue) / 1000; // in seconds
      const remaining = Math.max(0, 300 - elapsed);
      setTimeLeftToEnroll(remaining);

      // Expulsion logic only if not paid
      if (remaining <= 0 && !playerStats.isPaid) {
        updatePlayerStats({ isExpelled: true });
        clearInterval(termTimer);
      }
    }, 1000);

    return () => clearInterval(termTimer);
  }, [playerStats.isEnrolled, playerStats.isPaid, playerStats.termStartTime, updatePlayerStats]);

  // Periodic Energy Exhaustion Logic (1 unit per 10s)
  useEffect(() => {
    const energyTimer = setInterval(() => {
      updateStats(prev => ({ energy: Math.max(0, prev.energy - 1) }));
    }, 10000);

    return () => clearInterval(energyTimer);
  }, [updateStats]);

  // Homeless Energy Depletion (1 unit per 1s)
  useEffect(() => {
    if (playerStats.rentedRoom) return;

    const homelessTimer = setInterval(() => {
      updateStats(prev => ({ energy: Math.max(0, prev.energy - 1) }));
    }, 1000);

    return () => clearInterval(homelessTimer);
  }, [playerStats.rentedRoom, updateStats]);

  // Electricity Penalty & Timer
  useEffect(() => {
    const timer = setInterval(() => {
      updateElectricityTimer();
      if (playerStats.electricityBill.status === 'overdue') {
        updateStats(prev => ({ energy: Math.max(0, prev.energy - 1) }));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [playerStats.electricityBill.status, updateElectricityTimer, updateStats]);

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

  // Energy Status Monitoring & Fainting
  const [lastWarningTime, setLastWarningTime] = useState(0);

  useEffect(() => {
    if (stats.energy <= 0 && !isHospitalized && !showExhaustedPopup && !playerStats.isStroke) {
      const newCount = playerStats.hospitalCount + 1;

      if (newCount >= 3) {
        updatePlayerStats({ isStroke: true });
      } else {
        setShowExhaustedPopup(true);
      }
    } else if (stats.energy > 0 && stats.energy <= 20 && !isHospitalized) {
      const now = Date.now();
      if (now - lastWarningTime > 30000) { // Warn every 30s
        notify("Bạn quá mệt, hãy về phòng nấu ăn hoặc nghỉ ngơi!");
        setLastWarningTime(now);
      }
    }
  }, [stats.energy, isHospitalized, showExhaustedPopup, playerStats.hospitalCount, playerStats.isStroke, updatePlayerStats, lastWarningTime, notify]);

  const handleExhaustedOk = () => {
    setShowExhaustedPopup(false);
    const newCount = playerStats.hospitalCount + 1;
    notify(`Bạn đã ngất xỉu lần ${newCount}! Bạn được đưa vào Bệnh viện điều trị cưỡng chế.`);
    updatePlayerStats({ hospitalCount: newCount });
    setHospitalized(true);
    setHospitalizationProgress(0);
    updatePosition({ x: 158.72, y: 59.44 }); // True hospital coordinates from LOCATIONS

    const therapyTime = 60; // 1 minute as requested
    let therapyCurrent = 0;
    const hospitalInterval = setInterval(() => {
      therapyCurrent += 1;
      const prog = (therapyCurrent / therapyTime) * 100;
      if (prog >= 100) {
        clearInterval(hospitalInterval);
        setHospitalized(false);
        updateStats({ energy: 30 });
        notify("Điều trị thành công! (+30 Energy)");
      } else {
        setHospitalizationProgress(prog);
      }
    }, 1000);
  };
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
        
        // New Rule: Trigger electricity bill after allowance notification ends (2s)
        setTimeout(() => {
          if (playerStats.electricityBill.status === 'none') {
            const amount = Math.floor(Math.random() * (700000 - 300000 + 1)) + 300000;
            generateElectricityBill(amount);
            notify("Nhắc nhở: Hãy kiểm tra và thanh toán tiền điện tháng này!");
          }
        }, 2200); // 2.2s delay to wait for notify text to disappear
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

      if (state.isModalOpen || state.isCooking || state.isSleeping || state.isHospitalized || state.playerStats.isExpelled || state.playerStats.isStroke || state.stats.energy <= 0 || state.currentScene !== 'map') return;

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

        const nextPos = calculateNextMove(state.position, moveKey, MAP_CONFIG.CHARACTER_SPEED, { width: MAP_CONFIG.WIDTH, height: MAP_CONFIG.HEIGHT }, scaleFactor);
        updatePosition(nextPos);

        const nearby = LOCATIONS.find(loc => {
           return isPointInRotatedRect(nextPos.x + 16, nextPos.y + 16, loc.interaction);
        });

        if (nearby) {
          if (!state.isModalOpen && showPrompt?.id !== nearby.id && !state.isHospitalized) {
            openModal(nearby);
            setShowPrompt(nearby);
          }
        } else {
          setShowPrompt(null);
        }
      }
    }, 16);

    return () => clearInterval(moveLoop);
  }, [keys, openModal, showPrompt, updatePosition, setDirection, scaleFactor]); // Reduced dependencies, using state directly inside

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
      updatePlayerStats({ isExpelled: true, expulsionReason: 'attendance' });
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
      case 'work':
        if (stats.energy >= data.exhaustion) {
          updateStats({ money: stats.money + data.income, energy: stats.energy - data.exhaustion });
          notify(`Bạn đã làm việc ${data.name} và nhận được ${data.income.toLocaleString()}đ!`);
          closeModal();
        } else {
          notify("Bạn quá mệt để làm việc này!");
        }
        break;
      case 'pay_electricity_bill':
        payElectricityBill();
        closeModal();
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-950 flex flex-row overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR (Thông số) */}
      <div className="flex-1 min-w-[280px] bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 z-50 overflow-y-auto">
        <h2 className="text-xl font-black text-white/50 uppercase tracking-widest mb-2 font-mono">Thông số</h2>

        {/* Sinh viên & Tài khoản */}
        <div className="glass-morphism bg-white/5 p-6 rounded-[28px] border border-white/10 flex flex-col gap-5 text-white shadow-xl">
          <div>
            <span className="text-xs font-black uppercase opacity-50 block tracking-widest mb-1">Sinh viên</span>
            <span className="text-xl font-black">{playerStats.isEnrolled ? "Đang đi học" : "Chưa nhập học"}</span>
          </div>
          <div className="w-full h-[2px] bg-white/10"></div>
          <div>
            <span className="text-xs font-black uppercase opacity-50 block tracking-widest mb-1">Tài khoản</span>
            <span className="text-3xl font-black text-emerald-400">{stats.money.toLocaleString()}đ</span>
          </div>
        </div>

        {/* Năng lượng */}
        <div className="glass-morphism bg-white/5 p-6 rounded-[24px] border border-white/10 text-white shadow-xl">
          <div className="flex justify-between items-center mb-4 px-1">
            <span className="text-xs font-black uppercase tracking-[0.3em] opacity-50">Năng lượng</span>
            <span className={`text-2xl font-black ${stats.energy <= 20 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
              {stats.energy}%
            </span>
          </div>
          <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
            <div
              className={`h-full transition-all duration-500 rounded-full ${stats.energy <= 20
                  ? 'bg-gradient-to-r from-red-600 to-orange-500'
                  : stats.energy <= 50
                    ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                }`}
              style={{ width: `${stats.energy}%` }}
            />
          </div>
        </div>

        {/* Thời gian in Game */}
        <div className="glass-morphism bg-white/5 px-6 py-6 rounded-[28px] border border-white/10 text-center text-white shadow-xl">
          <span className="text-xs font-black uppercase opacity-50 block tracking-widest mb-2">Thời gian</span>
          <span className="font-black text-3xl">Ngày {stats.time.day} - {String(stats.time.hour).padStart(2, '0')}:00</span>
        </div>

        {/* Timers */}
        {playerStats.isEnrolled && playerStats.isPaid && (
          <AttendanceTimer
            nextClassTimer={nextClassTimer}
            checkInWindow={checkInWindow}
            isClassStarting={isClassStarting}
            playerStats={playerStats}
          />
        )}

        {!playerStats.isPaid && (
          <TermTimer timeLeft={timeLeftToEnroll} isEnrolled={playerStats.isPaid} />
        )}
      </div>

      {/* MIDDLE CONTAINER (GAME VIEWPORT) */}
      <div 
        className="relative bg-slate-950 overflow-hidden shadow-2xl" 
        style={{ width: DESIGN_WIDTH * scaleFactor, height: DESIGN_HEIGHT * scaleFactor, flexShrink: 0 }}
      >
        {/* GAME CONTAINER (SCALED) */}
        <div 
          className="absolute top-0 left-0 bg-green-100 overflow-hidden transform-gpu"
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `scale(${scaleFactor})`,
            transformOrigin: 'top left'
          }}
        >
          {playerStats.isExpelled && (
            <GameOver
              onReset={resetGame}
              type="expelled"
              title="Bạn đã bị đuổi học"
              message={playerStats.expulsionReason === 'attendance'
                ? "Vì vắng học quá 3 buổi, nhà trường đã ra quyết định thôi học đối với bạn. Hãy cố gắng hơn ở kỳ tới!"
                : "Vì không đăng ký tín chỉ đúng hạn, nhà trường đã ra quyết định thôi học đối với bạn. Hãy cố gắng hơn ở kỳ tới!"
              }
            />
          )}

          {playerStats.isStroke && (
            <GameOver
              onReset={resetGame}
              type="stroke"
              title="Đột quỵ không qua khỏi"
              message="Vì kiệt sức và làm việc quá sức mà không chú ý đến sức khỏe, bạn đã bị đột quỵ không qua khỏi. Hãy biết cân bằng cuộc sống!"
            />
          )}

          {isCooking && <CookingOverlay progress={cookingProgress} />}
          {isSleeping && <SleepOverlay progress={sleepProgress} />}
          {isHospitalized && <HospitalOverlay progress={hospitalizationProgress} />}

          <ElectricityBillOverlay
            bill={playerStats.electricityBill}
            onPay={payElectricityBill}
            money={stats.money}
          />

      {/* World Map */}
      <div 
        className="absolute inset-0"
        style={{ width: MAP_CONFIG.WIDTH, height: MAP_CONFIG.HEIGHT }}
        onClick={(e) => {
           // Cập nhật tọa độ Click theo yêu cầu của tỷ lệ scaleFactor
           const rect = e.currentTarget.getBoundingClientRect();
           const clickX = (e.clientX - rect.left) / scaleFactor;
           const clickY = (e.clientY - rect.top) / scaleFactor;
           
           // Xử lý tọa độ map ở đây (Ví dụ: di chuyển tức thì, point-n-click)
           console.log("Scaled Click:", clickX, clickY);
        }}
      >
        <img 
          src={pathImage} 
          alt="Map Base" 
          className="absolute top-0 left-0" 
          style={{ width: MAP_CONFIG.WIDTH, height: MAP_CONFIG.HEIGHT, objectFit: 'cover' }} 
        />
        
        {LOCATIONS.map(loc => {
           const d = loc.display;
           // Nếu rotation = 180 thì lật ngang (theo yêu cầu scale.x = -1 của User)
           const tFlip = d.rotation === 180 ? 'scaleX(-1)' : `rotate(${d.rotation || 0}deg)`;
           return (
            <img
              key={loc.id}
              src={IMAGE_MAP[loc.image]}
              alt={loc.name}
              className="absolute"
              style={{
                left: d.x,
                top: d.y,
                width: d.w,
                height: d.h,
                transform: tFlip,
                transformOrigin: 'center'
              }}
            />
          );
        })}

        {/* Player */}
        <div
          className="absolute w-8 h-8 bg-slate-900 rounded-full border-2 border-white shadow-xl flex items-center justify-center z-20"
          style={{ left: position.x, top: position.y }}
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4 z-[1000] w-full max-w-md">
        {notifications.map(n => (
          <div key={n.id} className="bg-slate-900/95 backdrop-blur-xl border-2 border-white/10 text-white px-8 py-5 rounded-[24px] shadow-2xl flex items-center justify-between gap-6 animate-in slide-in-from-right duration-500">
             <span className="text-lg font-black leading-tight tracking-tight">{n.text}</span>
             <button 
              onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
              className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
             >
                <X className="w-6 h-6 text-white/40" />
             </button>
          </div>
        ))}
      </div>

      {/* Exhausted Popup (Mới) */}
      {showExhaustedPopup && (
        <div className="absolute inset-0 z-[15000] bg-black/85 flex items-center justify-center backdrop-blur-sm pointer-events-auto">
          <div className="bg-slate-900 border-2 border-red-500 p-10 rounded-[32px] max-w-lg text-center shadow-[0_0_100px_rgba(239,68,68,0.3)] animate-in zoom-in-95 duration-500">
            <h3 className="text-3xl font-black text-red-500 uppercase mb-6 tracking-widest">CẢNH BÁO</h3>
            <p className="text-white text-xl mb-10 leading-relaxed font-bold">
              Bạn đã kiệt sức và được ai đó đưa đến bệnh viện!
            </p>
            <button 
              onClick={handleExhaustedOk}
              className="bg-red-600 hover:bg-red-500 text-white font-black py-4 px-16 rounded-2xl text-xl hover:scale-105 transition-all shadow-xl"
            >
              OK
            </button>
          </div>
        </div>
      )}

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
      </div>

      {/* RIGHT SIDEBAR (Bảng Xếp Hạng) */}
      <div className="flex-1 min-w-[250px] bg-slate-900 border-l border-slate-800 p-6 flex flex-col z-50 overflow-y-auto">
        <h2 className="text-xl font-black text-white/50 uppercase tracking-widest mb-4 font-mono">Bảng Xếp Hạng</h2>
        <div className="text-slate-500 text-sm italic">Tính năng đang cập nhật...</div>
      </div>

    </div>
  );
}

export default App;
