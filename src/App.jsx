import React, { useEffect, useCallback, useState, useRef } from 'react';
import useGameStore from './store/useGameStore';
import useKeyboard from './hooks/useKeyboard';
import { calculateNextMove } from './game/movement';
import { MAP_CONFIG } from './game/constants';
import { LOCATIONS } from './data/locations';
import { OBSTACLE_POLYGONS, INTERACTION_POLYGONS, isPointInPolygon } from './game/hitboxes';
import GameLayout from './components/GameLayout';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { supabase, signInWithGoogle } from './lib/supabaseClient';

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
    const currentState = useGameStore.getState();
    if (currentState.playerStats.isExpelled || currentState.playerStats.isStroke) return;
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  }, []);

  const keys = useKeyboard();
  const [showPrompt, setShowPrompt] = useState(null);
  const [timeLeftToEnroll, setTimeLeftToEnroll] = useState(5 * 60);
  const [showExhaustedPopup, setShowExhaustedPopup] = useState(false);
  const [systemAlert, setSystemAlert] = useState(null);
  const [showTutorAlert, setShowTutorAlert] = useState(false);
  const [showShipperAlert, setShowShipperAlert] = useState(false);
  const [hasReceivedInitialMoney, setHasReceivedInitialMoney] = useState(false);
  const [frame, setFrame] = useState(0);
  const [showDebug, setShowDebug] = useState(false);

  const DESIGN_WIDTH = 1440;
  const DESIGN_HEIGHT = 1024;
  const [scaleFactor, setScaleFactor] = useState(1);
  const gameContainerRef = useRef(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [hasStartedGuestMode, setHasStartedGuestMode] = useState(false);

  // 1. Khởi tạo State session (mặc định là null)
  const [session, setSession] = useState(null);
  const sessionRef = useRef(null);
  const systemAlertRef = useRef(null);

  useEffect(() => {
    systemAlertRef.current = systemAlert;
  }, [systemAlert]);

  // 2. Lắng nghe trạng thái thực tế: SIGNED_IN và INITIAL_SESSION
  useEffect(() => {
    // Kiểm tra session hiện tại ngay khi load
    const checkInitialSession = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      console.log("DEBUG: Initial Session Check:", s);
      setSession(s);
    };
    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      console.log("DEBUG: Auth State Changed Event:", event, "New Session:", !!s);
      // Chỉ setSession nếu không phải là event SIGNED_IN (vì handleLoginSuccess đã lo rồi)
      // Hoặc nếu session thực tế khác với session hiện tại
      if (s?.user?.id !== sessionRef.current?.user?.id) {
        setSession(s);
        sessionRef.current = s;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setHasStartedGuestMode(false);
  };

  const handleLoginSuccess = async (supabaseSession) => {
    console.log('DEBUG: handleLoginSuccess called with session:', supabaseSession);
    setSession(supabaseSession);
    sessionRef.current = supabaseSession;
    setShowLogin(false);
    setShowSignUp(false);

    // Fetch profile data (username, full_name) từ bảng profiles
    if (supabaseSession?.user?.id) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', supabaseSession.user.id)
        .single();

      if (profileError) {
        console.warn('DEBUG: Không lấy được profile:', profileError.message);
      } else {
        console.log('DEBUG: Profile data:', profile);
        // Merge profile data vào session để UI hiển thị
        setSession((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            user_metadata: {
              ...prev.user.user_metadata,
              full_name: profile.full_name || prev.user.user_metadata?.full_name,
              username: profile.username,
            },
          },
        }));
      }
    }
  };

  // Resize Observer
  useEffect(() => {
    if (!gameContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setScaleFactor(Math.max(width / DESIGN_WIDTH, height / DESIGN_HEIGHT));
      }
    });
    observer.observe(gameContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Debug keys
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key.toLowerCase() === 'h') setShowDebug(prev => !prev); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- GAME LOOPS (Only active when logged in OR guest mode started) ---
  const isGameStarted = !!session || hasStartedGuestMode;

  useEffect(() => {
    if (!isGameStarted || playerStats.isExpelled || playerStats.isStroke) {
      setShowExhaustedPopup(false); setShowTutorAlert(false); setShowShipperAlert(false);
      setShowPrompt(null); setSystemAlert(null); setTimeLeftToEnroll(5 * 60);
      setNotifications([]); setHasReceivedInitialMoney(false);
    }
  }, [isGameStarted, playerStats.isExpelled, playerStats.isStroke]);

  useEffect(() => {
    if (isGameStarted && !hasReceivedInitialMoney) {
      setSystemAlert({
        type: 'income', title: 'TRỢ CẤP ĐẦU KỲ',
        message: 'Bố mẹ vừa gửi cho bạn 3.000.000đ tiền sinh hoạt phí tháng đầu tiên!',
        onOk: () => {
          const currentState = useGameStore.getState();
          currentState.updateStats({ money: currentState.stats.money + 3000000 });
        }
      });
      setHasReceivedInitialMoney(true);
    }
  }, [isGameStarted, hasReceivedInitialMoney]);



  // ═══════════════════════════════════════════════════════
  //  MASTER GAME TIMER – chạy mỗi 1 giây
  //  Xử lý: thời gian game, countdown, energy, class, rent, electricity
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    if (!isGameStarted) return;

    const masterTimer = setInterval(() => {
      const state = useGameStore.getState();
      const { stats: s, playerStats: ps } = state;

      // Skip khi game over hoặc đang trong overlay
      if (ps.isExpelled || ps.isStroke) return;

      // ── 1. Thời gian trong game: 1 giây thực = 1 phút game ──
      state.advanceTime(1);

      // ── 2. Enrollment countdown (chưa đăng ký tín chỉ) ──
      if (!ps.isEnrolled) {
        setTimeLeftToEnroll(prev => {
          const next = prev - 1;
          if (next <= 0) {
            state.updatePlayerStats({ isExpelled: true, expulsionReason: 'enrollment' });
          }
          return Math.max(0, next);
        });
      }

      // --- DYNAMIC INTERVAL CALCULATION ---
      const baseT = ps.totalCredits > 0 ? ps.totalCredits / 5 : 5;
      const intervalMinutes = ps.difficulty === 'hard' ? baseT / 2 : baseT;
      const intervalSeconds = Math.max(10, Math.round(intervalMinutes * 60));
      const longIntervalSeconds = intervalSeconds * 3;

      // ── 3. Passive energy drain ──
      if (!state.isSleeping && !state.isHospitalized && ps.energyBuffTimer <= 0) {
        if (!ps.rentedRoom) {
          // Homeless: -1 per 1s
          state.updateStats({ energy: Math.max(0, s.energy - 1) });
        } else {
          // Normal: -1 per 10s
          const energyAcc = (ps.energyAccumulator || 0) + 1;
          if (energyAcc >= 10) {
            state.updateStats({ energy: Math.max(0, s.energy - 1) });
            state.updatePlayerStats({ energyAccumulator: 0 });
          } else {
            state.updatePlayerStats({ energyAccumulator: energyAcc });
          }
        }

        // Check for exhaustion
        if (s.energy <= 0 && !state.isCooking && !ps.isStroke && !state.isHospitalized) {
          const nextCount = ps.hospitalCount + 1;
          if (nextCount >= 3) {
            state.updatePlayerStats({ isStroke: true, hospitalCount: 3 });
          } else {
            setShowExhaustedPopup(true);
          }
        }
      }

      // ── 4. Energy buff timer ──
      if (ps.energyBuffTimer > 0) {
        state.updatePlayerStats({ energyBuffTimer: ps.energyBuffTimer - 1 });
      }

      // ── 5. Class timer (đã đăng ký + đã đóng tiền) ──
      if (ps.isPaid && ps.isEnrolled && !ps.isDroppedOut) {
        if (state.isClassStarting) {
          const newCheckIn = state.checkInWindow - 1;
          if (newCheckIn <= 0) {
            state.setClassStatus(false);
            state.incrementMissed();
            state.updateTimers(intervalSeconds, 0);
            
            const currentState = useGameStore.getState();
            if (currentState.playerStats.missedClasses >= 3) {
              currentState.updatePlayerStats({ isExpelled: true, expulsionReason: 'attendance' });
            }
          } else {
            state.updateTimers(state.nextClassTimer, newCheckIn);
          }
        } else {
          const newTimer = state.nextClassTimer - 1;
          if (newTimer <= 0) {
            state.setClassStatus(true);
            state.updateTimers(intervalSeconds, 60); // 60s window
          } else {
            state.updateTimers(newTimer, state.checkInWindow);
          }
        }
      }

      // ── 6. Rent timer ──
      if (ps.rentedRoom && !systemAlertRef.current) {
        const newRentTimer = ps.rentTimer + 1;
        if (newRentTimer >= longIntervalSeconds) {
          const rent = ps.rentedRoom.price;
          setSystemAlert({
            type: 'expense',
            title: 'THANH TOÁN TIỀN NHÀ',
            message: `Đã đến kỳ hạn thanh toán tiền nhà (${ps.rentedRoom.label}). Hệ thống đã tự động khấu trừ ${rent.toLocaleString()}đ từ tài khoản của bạn.`,
            onOk: () => { useGameStore.getState().payRent(); }
          });
        } else {
          state.updatePlayerStats({ rentTimer: newRentTimer });
        }
      }

      // ── 7. Allowance timer (Periodic) ──
      const nextAllowanceAcc = (ps.allowanceAccumulator || 0) + 1;
      if (nextAllowanceAcc >= longIntervalSeconds) {
        state.updateStats({ money: s.money + 3000000 });
        state.updatePlayerStats({ allowanceAccumulator: 0 });
        setSystemAlert({
          type: 'income',
          title: 'TRỢ CẤP ĐỊNH KỲ',
          message: 'Bố mẹ vừa gửi cho bạn 3.000.000đ tiền sinh hoạt phí!'
        });

        // Trigger electricity bill
        setTimeout(() => {
          const innerState = useGameStore.getState();
          if (innerState.playerStats.electricityBill.status === 'none') {
            const amount = Math.floor(Math.random() * (700000 - 300000 + 1)) + 300000;
            innerState.generateElectricityBill(amount);
            notify("Nhắc nhở: Hãy kiểm tra và thanh toán tiền điện tháng này!");
          }
        }, 2200);
      } else {
        state.updatePlayerStats({ allowanceAccumulator: nextAllowanceAcc });
      }

      // ── 8. Electricity bill timer ──
      if (ps.electricityBill.status === 'pending') {
        state.updateElectricityTimer();
      }
      if (ps.electricityBill.status === 'overdue') {
        state.updateStats({ energy: Math.max(0, s.energy - 1) });
      }

    }, 1000); // 1 giây thực = 1 tick

    return () => clearInterval(masterTimer);
  }, [isGameStarted]);

  useEffect(() => {
    if (!isGameStarted) return;
    const moveLoop = setInterval(() => {
      const state = useGameStore.getState();
      if (systemAlertRef.current || state.isModalOpen || state.isCooking || state.isSleeping || state.isTutoring || state.isWaiting || state.isHospitalized || state.playerStats.isExpelled || state.playerStats.isStroke || state.stats.energy <= 0 || state.currentScene !== 'map') return;
      let moveKey = null;
      if (keys.ArrowUp) moveKey = 'ArrowUp';
      else if (keys.ArrowDown) moveKey = 'ArrowDown';
      else if (keys.ArrowLeft) moveKey = 'ArrowLeft';
      else if (keys.ArrowRight) moveKey = 'ArrowRight';
      if (moveKey) {
        if (moveKey.includes('Up')) setDirection('up');
        if (moveKey.includes('Down')) setDirection('down');
        if (moveKey.includes('Left')) setDirection('left');
        if (moveKey.includes('Right')) setDirection('right');
        const speed = state.playerStats.isRidingBicycle ? MAP_CONFIG.CHARACTER_SPEED * 1.5 : MAP_CONFIG.CHARACTER_SPEED;
        const nextPos = calculateNextMove(state.position, moveKey, speed, { width: MAP_CONFIG.WIDTH, height: MAP_CONFIG.HEIGHT }, scaleFactor);
        const pts = state.playerStats.isRidingBicycle ? [-20, -10, 0, 10, 20].map(r => ({ x: nextPos.x + 10 + r * 0.866, y: nextPos.y + 50 + r * 0.5 })) : [{ x: nextPos.x + 10, y: nextPos.y + 50 }];
        const isColliding = OBSTACLE_POLYGONS.some(polygon => pts.some(p => isPointInPolygon(p, polygon)));
        if (!isColliding) updatePosition(nextPos);
        const activePolygon = INTERACTION_POLYGONS.find(poly => (isColliding ? (state.playerStats.isRidingBicycle ? [-20, -10, 0, 10, 20].map(r => ({ x: state.position.x + 10 + r * 0.866, y: state.position.y + 50 + r * 0.5 })) : [{ x: state.position.x + 10, y: state.position.y + 50 }]) : pts).some(p => isPointInPolygon(p, poly.pts)));
        if (activePolygon) {
          const loc = LOCATIONS.find(l => l.id === activePolygon.id);
          if (loc && !(loc.id === 'student_house' && !state.playerStats.hasTutorJob)) {
            if (!state.isModalOpen && showPrompt?.id !== loc.id && !state.isHospitalized) {
              openModal(loc); setShowPrompt(loc);
            }
          }
        } else setShowPrompt(null);
      }
    }, 16);
    return () => clearInterval(moveLoop);
  }, [keys, openModal, showPrompt, updatePosition, setDirection, scaleFactor, isGameStarted]);

  // --- SPRITE ANIMATION LOOP ---
  // Cycle qua 4 frames (0→1→2→3→0...) mỗi 150ms khi nhân vật đang di chuyển
  useEffect(() => {
    const isMoving = keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight;

    if (!isMoving || !isGameStarted) {
      // Reset về frame đứng yên khi dừng
      setFrame(0);
      return;
    }

    const animLoop = setInterval(() => {
      setFrame(prev => (prev + 1) % 4);
    }, playerStats.isRidingBicycle ? 100 : 150); // Faster for bicycle // 150ms/frame ≈ 6.7 FPS animation

    return () => clearInterval(animLoop);
  }, [keys.ArrowUp, keys.ArrowDown, keys.ArrowLeft, keys.ArrowRight, isGameStarted]);

  const handleExhaustedOk = () => {
    setShowExhaustedPopup(false); clearActiveTasks();
    setCooking(false); setSleeping(false); setTutoring(false); setWaiting(false);
    closeModal();
    const newCount = playerStats.hospitalCount + 1;
    notify(`Bạn đã ngất xỉu lần ${newCount}! Bạn được đưa vào Bệnh viện điều trị cưỡng chế.`);
    updatePlayerStats({ hospitalCount: newCount });
    setHospitalized(true); setHospitalizationProgress(0);
    updatePosition({ x: 380, y: 400 }); setDirection('down');
    let therapyCurrent = 0;
    taskIntervalRef.current = setInterval(() => {
      therapyCurrent += 1;
      const prog = (therapyCurrent / 60) * 100;
      if (prog >= 100) { clearActiveTasks(); setHospitalized(false); updateStats({ energy: 30 }); }
      else setHospitalizationProgress(prog);
    }, 1000);
  };

  const handleAction = (type, data) => {
    switch (type) {
      case 'enroll':
        updatePlayerStats({ credits: data.credits, totalCredits: data.credits, difficulty: data.difficulty, isEnrolled: true, isPaid: false, tuitionDue: data.credits * 1000000, attendanceCount: 0, missedClasses: 0 });
        break;
      case 'pay_tuition':
        if (stats.money >= playerStats.tuitionDue) { updateStats({ money: stats.money - playerStats.tuitionDue }); updatePlayerStats({ isPaid: true, tuitionDue: 0 }); notify("Thành công!"); closeModal(); }
        break;
      case 'rent_room':
        if (stats.money >= data.price) { updateStats({ money: stats.money - data.price }); updatePlayerStats({ rentedRoom: data, rentTimer: 0 }); closeModal(); }
        break;
      case 'start_cooking':
        const item = playerStats.inventory[data.index]; removeFromInventory(data.index); setCooking(true); setCookingProgress(0); closeModal();
        let current = 0; clearActiveTasks();
        taskIntervalRef.current = setInterval(() => {
          current += 0.1; const prog = (current / item.cookTime) * 100;
          if (prog >= 100) { clearActiveTasks(); setCooking(false); updateStats({ energy: Math.min(100, stats.energy + item.energy) }); }
          else setCookingProgress(prog);
        }, 100);
        break;
      case 'start_sleeping':
        setSleeping(true); setSleepProgress(0); closeModal();
        let sleepCurrent = 0; clearActiveTasks();
        taskIntervalRef.current = setInterval(() => {
          sleepCurrent += 0.1; const prog = (sleepCurrent / 30) * 100;
          if (prog >= 100) { clearActiveTasks(); setSleeping(false); updateStats({ energy: Math.min(100, stats.energy + 30) }); }
          else setSleepProgress(prog);
        }, 100);
        break;
      case 'work':
        if (stats.energy >= data.exhaustion) { updateStats({ money: stats.money + data.income, energy: stats.energy - data.exhaustion }); closeModal(); }
        break;
      case 'pay_electricity_bill': payElectricityBill(); closeModal(); break;
      case 'buy_bicycle':
        if (stats.money >= 500000) { updateStats({ money: stats.money - 500000 }); updatePlayerStats({ hasBicycle: true, isRidingBicycle: true }); closeModal(); }
        break;
      case 'park_bike':
        if (stats.money >= 10000) { updateStats({ money: stats.money - 10000 }); updatePlayerStats({ isRidingBicycle: false }); closeModal(); }
        break;
      case 'take_bike': updatePlayerStats({ isRidingBicycle: true }); closeModal(); break;
      case 'pay_hospital_bill':
        const billAmount = playerStats.activeMedicalBill || 0;
        if (stats.money >= billAmount) {
          updateStats({ money: stats.money - billAmount });
          updatePlayerStats({ 
            activeMedicalBill: 0, 
            energyBuffTimer: 120, // 2 minutes (120 seconds)
            isHospitalized: false 
          });
          notify("Điều trị thành công! Bạn nhận được 2 phút bảo trì năng lượng.");
          closeModal();
        } else {
          notify("Không đủ tiền thanh toán viện phí!");
        }
        break;
      case 'ask_parents':
        updatePlayerStats({ pendingParentSupport: true });
        notify("Đã gửi yêu cầu hỗ trợ! Hãy về nhà bố mẹ để lấy tiền.");
        break;
      case 'get_parent_money':
        const tuition = playerStats.tuitionDue || 0;
        updateStats({ money: stats.money + tuition });
        updatePlayerStats({ pendingParentSupport: false, hasClaimedParentSupport: true });
        notify(`Bạn đã nhận được ${tuition.toLocaleString()}đ tiền học phí từ bố mẹ!`);
        closeModal();
        break;
      case 'check_in':
        if (isClassStarting) {
          if (stats.energy >= 20) {
            updateStats({ energy: stats.energy - 20 });
            incrementAttendance();
            setClassStatus(false); // Only 1 check-in per session
            notify("Điểm danh thành công! +1 buổi học (-20 Năng lượng).");
            closeModal();
          } else {
            notify("Bạn quá mệt để đi học! Hãy nghỉ ngơi trước.");
          }
        } else {
          notify("Chưa đến giờ học hoặc bạn đã điểm danh rồi!");
        }
        break;
      case 'examine_hospital':
        if (stats.money >= 100000) {
          updateStats({ money: stats.money - 100000 });
          const randomBill = Math.floor(Math.random() * (500000 - 200000 + 1)) + 200000;
          updatePlayerStats({ activeMedicalBill: randomBill });
          setInteractionStep('hospital_treatment');
          notify("Khám xong! Bác sĩ đã kê đơn điều trị.");
        } else {
          notify("Không đủ tiền khám bệnh (100.000đ)!");
        }
        break;
      case 'accept_waiter':
        updatePlayerStats({ hasWaiterJob: true });
        notify("Bạn đã trở thành nhân viên căng tin!");
        closeModal();
        break;
      case 'accept_tutor':
        if (stats.money >= 300000) {
          updateStats({ money: stats.money - 300000 });
          updatePlayerStats({ hasTutorJob: true });
          setSystemAlert({
            type: 'income',
            title: 'NHẬN VIỆC GIA SƯ',
            message: 'Đăng ký thành công! Bạn có thể bắt đầu dạy học tại Nhà Học Sinh (nằm ngay cạnh Trường Học).',
            onOk: () => closeModal()
          });
        } else {
          notify("Không đủ tiền phí môi giới (300.000đ)!");
        }
        break;
      case 'accept_shipper':
        if (stats.money >= 100000) {
          if (playerStats.hasBicycle) {
            updateStats({ money: stats.money - 100000 });
            updatePlayerStats({ hasShipperJob: true });
            notify("Đăng ký xe ôm công nghệ thành công!");
            closeModal();
          } else {
             setShowShipperAlert(true);
          }
        } else {
          notify("Không đủ tiền phí môi giới (100.000đ)!");
        }
        break;
      case 'buy_food':
      case 'buy_ingredient':
      case 'buy_item':
        if (stats.money >= data.price) {
          updateStats({ money: stats.money - data.price });
          addToInventory(data);
          notify(`Đã mua ${data.name}!`);
          if (type !== 'buy_ingredient') closeModal();
        } else {
          notify("Không đủ tiền!");
        }
        break;
      case 'buy_canteen_food':
        if (stats.money >= data.price) {
          updateStats({ money: stats.money - data.price, energy: Math.min(100, stats.energy + data.energy) });
          notify(`Đã ăn ${data.name}! +${data.energy} năng lượng.`);
          closeModal();
        } else {
          notify("Không đủ tiền!");
        }
        break;
      case 'work_waiter':
        if (stats.energy >= 10) {
          setWaiting(true); setWaitingProgress(0); closeModal();
          let waiterCurrent = 0; clearActiveTasks();
          taskIntervalRef.current = setInterval(() => {
            waiterCurrent += 1;
            const prog = (waiterCurrent / 30) * 100;
            if (prog >= 100) { 
              clearActiveTasks(); setWaiting(false); 
              updateStats({ money: stats.money + 50000, energy: stats.energy - 10 });
              notify("Hoàn thành ca làm việc! +50.000đ");
            } else {
              setWaitingProgress(prog);
            }
          }, 1000);
        } else {
          notify("Không đủ năng lượng để làm việc!");
        }
        break;
      case 'teach_tutor':
        if (stats.energy >= 10) {
          setTutoring(true); setTutoringProgress(0); closeModal();
          let tutorCurrent = 0; clearActiveTasks();
          taskIntervalRef.current = setInterval(() => {
            tutorCurrent += 1;
            const prog = (tutorCurrent / 30) * 100;
            if (prog >= 100) { 
              clearActiveTasks(); setTutoring(false); 
              updateStats({ money: stats.money + 100000, energy: stats.energy - 10 });
              notify("Hoàn thành buổi dạy! +100.000đ");
            } else {
              setTutoringProgress(prog);
            }
          }, 1000);
        } else {
          notify("Không đủ năng lượng để làm việc!");
        }
        break;
      default: break;
    }
  };

  const commonState = {
    notifications, setNotifications, timeLeftToEnroll, showExhaustedPopup, handleExhaustedOk,
    showTutorAlert, setShowTutorAlert, showShipperAlert, setShowShipperAlert,
    systemAlert, setSystemAlert, showDebug, setShowDebug, frame, scaleFactor,
    DESIGN_WIDTH, DESIGN_HEIGHT, gameContainerRef, handleAction, signInWithGoogle, handleLogout
  };

  // 3. Logic Render:
  //    - GameLayout luôn hiện (StartScreen hoặc game map)
  //    - Khi showLogin=true, Login overlay toàn màn hình đè lên
  return (
    <>
      <GameLayout
        appState={{
          ...commonState,
          handleAction,
          signInWithGoogle, handleLogout,
          session,
          showLogin, setShowLogin, handleLoginSuccess,
          showSignUp, setShowSignUp,
          isGameStarted, setIsGameStarted: setHasStartedGuestMode
        }}
      />

      {/* Login overlay */}
      {showLogin && !showSignUp && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onGoogleLogin={signInWithGoogle}
          onClose={() => setShowLogin(false)}
          onSignUpClick={() => { setShowLogin(false); setShowSignUp(true); }}
        />
      )}

      {/* SignUp overlay */}
      {showSignUp && (
        <SignUp
          onSignUpSuccess={() => setShowSignUp(false)}
          onGoogleLogin={signInWithGoogle}
          onClose={() => setShowSignUp(false)}
          onLoginClick={() => { setShowSignUp(false); setShowLogin(true); }}
        />
      )}
    </>
  );
}

export default App;
