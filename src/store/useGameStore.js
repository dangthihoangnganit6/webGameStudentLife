import { create } from 'zustand';

const useGameStore = create((set) => ({
  // Student Stats
  stats: {
    energy: 100,
    money: 3000000,
    time: { day: 1, hour: 8, minute: 0 },
  },
  
  playerStats: {
    credits: 0,
    difficulty: 'easy',
    rentPrice: 0,
    job: null,
    attendanceCount: 0,
    missedClasses: 0,
    isDroppedOut: false,
    isEnrolled: false,
    isPaid: false,
    pendingParentSupport: false,
    hasClaimedParentSupport: false,
    totalCredits: 0,
    tuitionDue: 0,
    inventory: [],
    rentedRoom: null,
    rentTimer: 0,
    hasTutorJob: false,
    hasWaiterJob: false,
    isExpelled: false,
    termStartTime: null,
    allowanceAccumulator: 0,
    distanceCounter: 0,
    hospitalCount: 0,
    isStroke: false,
    energyBuffTimer: 0,
    activeMedicalBill: 0,
    electricityBill: {
      amount: 0,
      status: 'none', // 'none' | 'pending' | 'overdue' | 'paid'
      timeLeftToPay: 0,
    }
  },
  
  isCooking: false,
  cookingProgress: 0,
  
  isSleeping: false,
  sleepProgress: 0,
  
  isHospitalized: false,
  hospitalizationProgress: 0,
  
  isTutoring: false,
  tutoringProgress: 0,
  
  isWaiting: false,
  waitingProgress: 0,
  
  // School logic state
  isClassStarting: false,
  nextClassTimer: 0,
  checkInWindow: 0,
  
  // Character state
  position: { x: 1114, y: 864 },
  direction: 'down',
  
  // Game state
  currentScene: 'map', // 'map' | 'school_interior' | 'home_interior' | 'work_interior'
  isModalOpen: false,
  activeLocation: null,
  interactionStep: 'ask', // 'ask' | 'sub_menu'
  
  // Actions
  updateStats: (newStats) => set((state) => {
    const evaluatedStats = typeof newStats === 'function' ? newStats(state.stats) : newStats;
    if (state.playerStats.energyBuffTimer > 0 && evaluatedStats.energy !== undefined && evaluatedStats.energy < state.stats.energy) {
      evaluatedStats.energy = state.stats.energy; // Prevent energy loss
    }
    return {
      stats: { ...state.stats, ...evaluatedStats }
    };
  }),

  updatePlayerStats: (newStats) => set((state) => ({
    playerStats: { 
      ...state.playerStats, 
      ...(typeof newStats === 'function' ? newStats(state.playerStats) : newStats) 
    }
  })),
  
  updatePosition: (newPos) => set((state) => {
    const dx = Math.abs(newPos.x - state.position.x);
    const dy = Math.abs(newPos.y - state.position.y);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    let newDistanceCounter = state.playerStats.distanceCounter + distance;
    let newEnergy = state.stats.energy;

    if (newDistanceCounter >= 200) {
      if (state.playerStats.energyBuffTimer <= 0) {
        newEnergy = Math.max(0, newEnergy - 1);
      }
      newDistanceCounter -= 200;
    }

    return { 
      position: newPos,
      stats: { ...state.stats, energy: newEnergy },
      playerStats: { ...state.playerStats, distanceCounter: newDistanceCounter }
    };
  }),
  
  setDirection: (dir) => set({ direction: dir }),
  
  openModal: (location) => set({ isModalOpen: true, activeLocation: location, interactionStep: 'ask' }),
  
  closeModal: () => set({ isModalOpen: false, activeLocation: null, interactionStep: 'ask' }),

  setInteractionStep: (step) => set({ interactionStep: step }),

  setCurrentScene: (scene) => set({ currentScene: scene }),

  setClassStatus: (starting) => set({ isClassStarting: starting }),
  
  updateTimers: (next, checkIn) => set({ 
    nextClassTimer: next !== undefined ? next : 0, 
    checkInWindow: checkIn !== undefined ? checkIn : 0 
  }),

  incrementMissed: () => set((state) => {
    const newMissed = state.playerStats.missedClasses + 1;
    const dropped = newMissed >= 3;
    const newMoney = dropped ? state.stats.money - 4000 : state.stats.money;
    
    return {
      stats: { ...state.stats, money: newMoney },
      playerStats: { 
        ...state.playerStats, 
        missedClasses: newMissed,
        isDroppedOut: dropped
      }
    };
  }),

  incrementAttendance: () => set((state) => ({
    playerStats: { ...state.playerStats, attendanceCount: state.playerStats.attendanceCount + 1 }
  })),

  resetSchoolData: () => {
    const now = Date.now();
    localStorage.setItem('termStartTime', now);
    set((state) => ({
      playerStats: {
        ...state.playerStats,
        credits: 0,
        attendanceCount: 0,
        missedClasses: 0,
        isDroppedOut: false,
        isEnrolled: false,
        isPaid: false,
        pendingParentSupport: false,
        hasClaimedParentSupport: false,
        hasTutorJob: false,
        hasWaiterJob: false,
        totalCredits: 0,
        tuitionDue: 0,
        termStartTime: now,
        energyBuffTimer: 0,
        activeMedicalBill: 0,
        electricityBill: { amount: 0, status: 'none', timeLeftToPay: 0 }
      },
      isClassStarting: false,
      nextClassTimer: 0,
      checkInWindow: 0,
      isCooking: false,
      cookingProgress: 0,
      isTutoring: false,
      tutoringProgress: 0,
    }));
  },

  resetGame: () => {
    localStorage.removeItem('termStartTime');
    set((state) => ({
      stats: {
        energy: 100,
        money: 3000000,
        time: { day: 1, hour: 8, minute: 0 },
      },
      playerStats: {
        credits: 0,
        difficulty: 'easy',
        rentPrice: 0,
        job: null,
        attendanceCount: 0,
        missedClasses: 0,
        isDroppedOut: false,
        isEnrolled: false,
        isPaid: false,
        pendingParentSupport: false,
        hasClaimedParentSupport: false,
        hasTutorJob: false,
        hasWaiterJob: false,
        totalCredits: 0,
        tuitionDue: 0,
        inventory: [],
        rentedRoom: null,
        rentTimer: 0,
        isExpelled: false,
        termStartTime: Date.now(),
        allowanceAccumulator: 0,
        distanceCounter: 0,
        hospitalCount: 0,
        isStroke: false,
        energyBuffTimer: 0,
        activeMedicalBill: 0,
        electricityBill: {
          amount: 0,
          status: 'none',
          timeLeftToPay: 0,
        }
      },
      isClassStarting: false,
      nextClassTimer: 0,
      checkInWindow: 0,
      isCooking: false,
      cookingProgress: 0,
      isSleeping: false,
      sleepProgress: 0,
      isHospitalized: false,
      hospitalizationProgress: 0,
      isTutoring: false,
      tutoringProgress: 0,
      isWaiting: false,
      waitingProgress: 0,
      position: { x: 1114, y: 864 },
      direction: 'down',
      currentScene: 'map',
      isModalOpen: false,
      activeLocation: null,
      interactionStep: 'ask',
    }));
    localStorage.setItem('termStartTime', Date.now());
  },

  setCooking: (cooking) => set({ isCooking: cooking }),
  setCookingProgress: (progress) => set({ cookingProgress: progress }),
  
  setSleeping: (sleeping) => set({ isSleeping: sleeping }),
  setSleepProgress: (progress) => set({ sleepProgress: progress }),
  
  setHospitalized: (hospitalized) => set({ isHospitalized: hospitalized }),
  setHospitalizationProgress: (progress) => set({ hospitalizationProgress: progress }),
  
  setTutoring: (tutoring) => set({ isTutoring: tutoring }),
  setTutoringProgress: (progress) => set({ tutoringProgress: progress }),
  
  setWaiting: (waiting) => set({ isWaiting: waiting }),
  setWaitingProgress: (progress) => set({ waitingProgress: progress }),
  
  addToInventory: (item) => set((state) => ({
    playerStats: {
      ...state.playerStats,
      inventory: [...state.playerStats.inventory, item]
    }
  })),

  removeFromInventory: (index) => set((state) => {
    const newInventory = [...state.playerStats.inventory];
    newInventory.splice(index, 1);
    return {
      playerStats: {
        ...state.playerStats,
        inventory: newInventory
      }
    };
  }),

  payRent: () => set((state) => {
    if (!state.playerStats.rentedRoom) return {};
    const rent = state.playerStats.rentedRoom.price;
    return {
      stats: { ...state.stats, money: state.stats.money - rent },
      playerStats: { ...state.playerStats, rentTimer: 0 }
    };
  }),
  
  advanceTime: (minutes) => set((state) => {
    let { day, hour, minute } = state.stats.time;
    minute += minutes;
    while (minute >= 60) {
      minute -= 60;
      hour += 1;
    }
    while (hour >= 24) {
      hour -= 24;
      day += 1;
    }
    return {
      stats: {
        ...state.stats,
        time: { day, hour, minute }
      }
    };
  }),

  generateElectricityBill: (amount) => set((state) => ({
    playerStats: {
      ...state.playerStats,
      electricityBill: { amount, status: 'pending', timeLeftToPay: 60 }
    }
  })),

  payElectricityBill: () => set((state) => {
    const { electricityBill } = state.playerStats;
    if (state.stats.money >= electricityBill.amount) {
      return {
        stats: { ...state.stats, money: state.stats.money - electricityBill.amount },
        playerStats: {
          ...state.playerStats,
          electricityBill: { ...electricityBill, status: 'paid' }
        }
      };
    }
    return {};
  }),

  updateElectricityTimer: () => set((state) => {
    const { electricityBill } = state.playerStats;
    if (electricityBill.status === 'pending') {
      const nextTime = Math.max(0, electricityBill.timeLeftToPay - 1);
      return {
        playerStats: {
          ...state.playerStats,
          electricityBill: { 
            ...electricityBill, 
            timeLeftToPay: nextTime,
            status: nextTime === 0 ? 'overdue' : 'pending'
          }
        }
      };
    }
    return {};
  }),
}));

export default useGameStore;
