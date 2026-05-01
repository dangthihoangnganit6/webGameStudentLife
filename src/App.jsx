import React, { useEffect, useCallback, useState, useRef } from 'react';
import useGameStore from './store/useGameStore';
import useKeyboard from './hooks/useKeyboard';
import { calculateNextMove, getDistance } from './game/movement';
import { MAP_CONFIG } from './game/constants';
import { LOCATIONS } from './data/locations';
import GameLayout from './components/GameLayout';

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
  const taskIntervalRef = React.useRef(null);

  const clearActiveTasks = useCallback(() => {
    if (taskIntervalRef.current) {
      clearInterval(taskIntervalRef.current);
      taskIntervalRef.current = null;
    }
  }, []);
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
    isTutoring, setTutoring, tutoringProgress, setTutoringProgress,
    isWaiting, setWaiting, waitingProgress, setWaitingProgress,
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
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [timeLeftToEnroll, setTimeLeftToEnroll] = useState(5 * 60);
  const [showExhaustedPopup, setShowExhaustedPopup] = useState(false);
  const [showTutorAlert, setShowTutorAlert] = useState(false);
  const [showShipperAlert, setShowShipperAlert] = useState(false);

  // Sprite Animation State
  const isMoving = !!(keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight);
  const [frame, setFrame] = useState(0);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (!isMoving) {
      setFrame(0);
      return;
    }
    const animTimer = setInterval(() => {
      setFrame(prev => (prev + 1) % 4);
    }, playerStats.isRidingBicycle ? 100 : 150); // Faster animation for bicycle
    return () => clearInterval(animTimer);
  }, [isMoving, playerStats.isRidingBicycle]);

  const DESIGN_WIDTH = 1440;
  const DESIGN_HEIGHT = 1024;

  const [scaleFactor, setScaleFactor] = useState(1);
  const gameContainerRef = useRef(null);

  useEffect(() => {
    if (!gameContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Use Math.max to simulate object-fit: cover for the game container
        setScaleFactor(Math.max(width / DESIGN_WIDTH, height / DESIGN_HEIGHT));
      }
    });
    observer.observe(gameContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Keyboard shortcut for Debug Hitboxes (H key)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'h') {
        setShowDebug(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Term Sync & Expulsion Logic
  useEffect(() => {
    if (!isGameStarted) return;
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
  }, [playerStats.isEnrolled, playerStats.isPaid, playerStats.termStartTime, updatePlayerStats, isGameStarted]);

  // Periodic Energy Exhaustion Logic (1 unit per 10s)
  useEffect(() => {
    if (!isGameStarted) return;
    const energyTimer = setInterval(() => {
      updateStats(prev => ({ energy: Math.max(0, prev.energy - 1) }));
    }, 10000);

    return () => clearInterval(energyTimer);
  }, [updateStats, isGameStarted]);

  // Homeless Energy Depletion (1 unit per 1s)
  useEffect(() => {
    if (!isGameStarted) return;
    if (playerStats.rentedRoom) return;

    const homelessTimer = setInterval(() => {
      updateStats(prev => ({ energy: Math.max(0, prev.energy - 1) }));
    }, 1000);

    return () => clearInterval(homelessTimer);
  }, [playerStats.rentedRoom, updateStats, isGameStarted]);

  // Electricity Penalty & Timer
  useEffect(() => {
    if (!isGameStarted) return;
    const timer = setInterval(() => {
      updateElectricityTimer();
      if (playerStats.electricityBill.status === 'overdue') {
        updateStats(prev => ({ energy: Math.max(0, prev.energy - 1) }));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [playerStats.electricityBill.status, updateElectricityTimer, updateStats, isGameStarted]);

  // Energy Buff Timer (Miễn nhiễm giảm năng lượng)
  useEffect(() => {
    if (!isGameStarted) return;
    if (playerStats.energyBuffTimer <= 0) return;
    const buffTimer = setInterval(() => {
      useGameStore.setState(state => ({
        playerStats: {
          ...state.playerStats,
          energyBuffTimer: Math.max(0, state.playerStats.energyBuffTimer - 1)
        }
      }));
    }, 1000);
    return () => clearInterval(buffTimer);
  }, [playerStats.energyBuffTimer, isGameStarted]);

  // Homeless Notification Logic
  useEffect(() => {
    if (!isGameStarted) return;
    if (playerStats.rentedRoom) return;

    // Show notification every 15 seconds if still homeless (reduced frequency)
    notify("Bạn đang không có nhà ở, năng lượng bị giảm mỗi giây");
    const interval = setInterval(() => {
      notify("Bạn đang không có nhà ở, năng lượng bị giảm mỗi giây");
    }, 15000);
    return () => clearInterval(interval);
  }, [playerStats.rentedRoom, notify, isGameStarted]);

  // Energy Status Monitoring & Fainting
  const [lastWarningTime, setLastWarningTime] = useState(0);

  useEffect(() => {
    if (!isGameStarted) return;
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
  }, [stats.energy, isHospitalized, showExhaustedPopup, playerStats.hospitalCount, playerStats.isStroke, updatePlayerStats, lastWarningTime, notify, isGameStarted]);

  const handleExhaustedOk = () => {
    setShowExhaustedPopup(false);

    // Ngừng mọi thứ đang chạy
    clearActiveTasks();
    setCooking(false);
    setSleeping(false);
    setTutoring(false);
    setWaiting(false);
    closeModal();

    const newCount = playerStats.hospitalCount + 1;
    notify(`Bạn đã ngất xỉu lần ${newCount}! Bạn được đưa vào Bệnh viện điều trị cưỡng chế.`);
    updatePlayerStats({ hospitalCount: newCount });
    setHospitalized(true);
    setHospitalizationProgress(0);
    updatePosition({ x: 158.72, y: 59.44 }); // True hospital coordinates from LOCATIONS

    const therapyTime = 60; // 1 minute
    let therapyCurrent = 0;
    taskIntervalRef.current = setInterval(() => {
      therapyCurrent += 1;
      const prog = (therapyCurrent / therapyTime) * 100;
      if (prog >= 100) {
        clearActiveTasks();
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
    if (!isGameStarted) return;
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
  }, [playerStats.allowanceAccumulator, playerStats.totalCredits, playerStats.difficulty, stats.money, updateStats, updatePlayerStats, notify, isGameStarted]);

  // Stable Movement Loop
  useEffect(() => {
    if (!isGameStarted) return;
    const moveLoop = setInterval(() => {
      const state = useGameStore.getState();
      const currentKeys = keys; // keys state is fine since it's updated via listeners

      if (state.isModalOpen || state.isCooking || state.isSleeping || state.isTutoring || state.isWaiting || state.isHospitalized || state.playerStats.isExpelled || state.playerStats.isStroke || state.stats.energy <= 0 || state.currentScene !== 'map') return;

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

        const speed = state.playerStats.isRidingBicycle ? MAP_CONFIG.CHARACTER_SPEED * 1.5 : MAP_CONFIG.CHARACTER_SPEED;
        const nextPos = calculateNextMove(state.position, moveKey, speed, { width: MAP_CONFIG.WIDTH, height: MAP_CONFIG.HEIGHT }, scaleFactor);
        updatePosition(nextPos);

        const nearby = LOCATIONS.find(loc => {
          if (!loc.interaction && !loc.interactions) return false;
          // Coi như mô hình (không thể vào) nếu chưa nhận việc gia sư
          if (loc.id === 'student_house' && !state.playerStats.hasTutorJob) return false;

          const checkCollision = (interaction) => {
            const interactRect = {
              ...interaction,
              x: interaction.x + 10,
              y: interaction.y + 25
            };

            const pts = state.playerStats.isRidingBicycle ? [-20, -10, 0, 10, 20].map(r => ({
              px: nextPos.x + 10 + r * 0.866, // cos(30deg)
              py: nextPos.y + 50 + r * 0.5    // sin(30deg)
            })) : [
              { px: nextPos.x + 10, py: nextPos.y + 50 }
            ];

            return pts.some(p => isPointInRotatedRect(p.px, p.py, interactRect));
          };

          if (loc.interactions && loc.interactions.length > 0) {
            return loc.interactions.some(checkCollision);
          }
          if (loc.interaction) {
            return checkCollision(loc.interaction);
          }
          return false;
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
  }, [keys, openModal, showPrompt, updatePosition, setDirection, scaleFactor, isGameStarted]); // Reduced dependencies, using state directly inside

  // Attendance Loop logic
  useEffect(() => {
    if (!isGameStarted) return;
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
    isClassStarting, nextClassTimer, checkInWindow, setClassStatus, updateTimers, incrementMissed, isGameStarted
  ]);

  // Rent Billing Loop
  useEffect(() => {
    if (!isGameStarted) return;
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
  }, [playerStats.rentedRoom, playerStats.rentTimer, playerStats.totalCredits, playerStats.difficulty, payRent, updatePlayerStats, isGameStarted]);

  // Vòng lặp kết thúc
  useEffect(() => {
    if (!isGameStarted) return;
    if (!playerStats.isEnrolled) return;

    if (playerStats.attendanceCount >= playerStats.totalCredits && playerStats.totalCredits > 0) {
      notify("CHÚC MỪNG: Bạn đã hoàn thành kỳ học xuất sắc!");
      resetSchoolData();
    } else if (playerStats.missedClasses >= 3) {
      updatePlayerStats({ isExpelled: true, expulsionReason: 'attendance' });
    }
  }, [playerStats.attendanceCount, playerStats.missedClasses, playerStats.totalCredits, playerStats.isEnrolled, resetSchoolData, isGameStarted]);

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
        clearActiveTasks();
        taskIntervalRef.current = setInterval(() => {
          current += 0.1;
          const prog = (current / totalTime) * 100;
          if (prog >= 100) {
            clearActiveTasks();
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
        clearActiveTasks();
        taskIntervalRef.current = setInterval(() => {
          sleepCurrent += 0.1;
          const prog = (sleepCurrent / totalSleepTime) * 100;
          if (prog >= 100) {
            clearActiveTasks();
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
      case 'accept_shipper':
        if (stats.money >= 100000) {
          updateStats({ money: stats.money - 100000 });
          closeModal();
          setShowShipperAlert(true);
        } else {
          notify("Bạn không có đủ 100.000đ để đóng phí môi giới!");
        }
        break;
      case 'accept_tutor':
        if (stats.money >= 300000) {
          updateStats({ money: stats.money - 300000 });
          updatePlayerStats({ hasTutorJob: true });
          setShowTutorAlert(true);
          closeModal();
        } else {
          notify("Bạn không có đủ 300.000đ để đóng phí môi giới!");
        }
        break;
      case 'accept_waiter':
        updatePlayerStats({ hasWaiterJob: true });
        notify("Bạn đã nhận việc Phục vụ! Hãy đến Căng tin để bắt đầu làm việc.");
        closeModal();
        break;
      case 'teach_tutor':
        if (stats.energy >= 10) {
          setTutoring(true);
          setTutoringProgress(0);
          closeModal();

          const tutorTotalTime = 60; // 60s real time
          let tutorCurrent = 0;
          clearActiveTasks();
          taskIntervalRef.current = setInterval(() => {
            tutorCurrent += 0.1;
            const prog = (tutorCurrent / tutorTotalTime) * 100;
            if (prog >= 100) {
              clearActiveTasks();
              setTutoring(false);
              updateStats(prev => ({ money: prev.money + 100000, energy: Math.max(0, prev.energy - 10) }));
              advanceTime(1);
              notify(`Bạn đã dạy gia sư xong và nhận được 100.000đ!`);
            } else {
              setTutoringProgress(prog);
            }
          }, 100);
        } else {
          notify("Bạn quá mệt để dạy gia sư!");
        }
        break;
      case 'work_waiter':
        if (stats.energy >= 10) {
          setWaiting(true);
          setWaitingProgress(0);
          closeModal();

          const waiterTotalTime = 30; // 30s
          let waiterCurrent = 0;
          clearActiveTasks();
          taskIntervalRef.current = setInterval(() => {
            waiterCurrent += 0.1;
            const prog = (waiterCurrent / waiterTotalTime) * 100;
            if (prog >= 100) {
              clearActiveTasks();
              setWaiting(false);
              updateStats(prev => ({ money: prev.money + 50000, energy: Math.max(0, prev.energy - 10) }));
              notify(`Bạn đã hoàn thành ca làm và nhận được 50.000đ!`);
            } else {
              setWaitingProgress(prog);
            }
          }, 100);
        } else {
          notify("Bạn quá mệt để làm việc này!");
        }
        break;
      case 'buy_canteen_food':
        if (stats.money >= data.price) {
          updateStats({ money: stats.money - data.price, energy: Math.min(100, stats.energy + data.energy) });
          notify(`Bạn đã mua ${data.name} và hồi ${data.energy} năng lượng!`);
        } else {
          notify("Bạn không đủ tiền!");
        }
        break;
      case 'examine_hospital':
        if (stats.money >= 100000) {
          const cost = Math.floor(Math.random() * (500000 - 200000 + 1)) + 200000;
          updateStats({ money: stats.money - 100000 });
          updatePlayerStats({ activeMedicalBill: cost });
          setInteractionStep('hospital_treatment');
        } else {
          notify("Bạn không có đủ 100.000đ để khám tổng quát!");
        }
        break;
      case 'buy_bicycle':
        if (stats.money >= 500000) {
          updateStats({ money: stats.money - 500000 });
          updatePlayerStats({ hasBicycle: true, isRidingBicycle: true });
          notify("Bạn đã mua xe đạp mới! Hãy tận hưởng những vòng quay.");
          closeModal();
        } else {
          notify("Bạn không đủ tiền mua xe đạp!");
        }
        break;
      case 'park_bike':
        if (stats.money >= 10000) {
          updateStats({ money: stats.money - 10000 });
          updatePlayerStats({ isRidingBicycle: false });
          notify("Đã gửi xe xong! Phí: 10.000đ");
          closeModal();
        } else {
          notify("Bạn không đủ tiền gửi xe!");
        }
        break;
      case 'take_bike':
        updatePlayerStats({ isRidingBicycle: true });
        notify("Đã lấy xe!");
        closeModal();
        break;
      case 'pay_hospital_bill':
        if (stats.money >= playerStats.activeMedicalBill) {
          updateStats({ money: stats.money - playerStats.activeMedicalBill });
          updatePlayerStats({ activeMedicalBill: 0, energyBuffTimer: 120 });
          notify("Thanh toán thành công! Miễn nhiễm tụt năng lượng trong 2 phút.");
          closeModal();
        } else {
          notify("Bạn không đủ tiền thanh toán viện phí!");
        }
        break;
      default:
        break;
    }
  };

  return (
    <GameLayout
      appState={{
        notifications, setNotifications,
        timeLeftToEnroll,
        showExhaustedPopup, handleExhaustedOk,
        showTutorAlert, setShowTutorAlert,
        showShipperAlert, setShowShipperAlert,
        showDebug, setShowDebug,
        isGameStarted, setIsGameStarted,
        frame, scaleFactor, DESIGN_WIDTH, DESIGN_HEIGHT, gameContainerRef,
        handleAction
      }}
    />
  );
}

export default App;
