import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabaseClient';

const useGameStore = create(
  persist(
    (set, get) => ({
      // Student Stats
      stats: {
        // Volatile stats (UI state only)
      },

      playerStats: {
        time: { day: 1, hour: 8, minute: 0 },
        hasReceivedInitialMoney: false,
        energy: 100,
        money: 0,
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
        },
        hasBicycle: false,
        isRidingBicycle: false,
        sessions_count: 0,
        full_name: '',
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
        const combined = { ...state.stats, ...state.playerStats };
        const evaluatedStats = typeof newStats === 'function' ? newStats(combined) : newStats;

        const statsUpdates = {};
        const playerStatsUpdates = {};

        Object.keys(evaluatedStats).forEach(key => {
          if (key === 'energy' || key === 'money' || key === 'time' || key === 'hasReceivedInitialMoney') {
            playerStatsUpdates[key] = evaluatedStats[key];
          } else {
            statsUpdates[key] = evaluatedStats[key];
          }
        });

        if (state.playerStats.energyBuffTimer > 0 && playerStatsUpdates.energy !== undefined && playerStatsUpdates.energy < state.playerStats.energy) {
          playerStatsUpdates.energy = state.playerStats.energy;
        }

        return {
          stats: { ...state.stats, ...statsUpdates },
          playerStats: { ...state.playerStats, ...playerStatsUpdates }
        };
      }),

      loadFromCloud: async (userId) => {
        if (!userId) return;
        try {
          // 1. Kiểm tra xem đã có dữ liệu chưa
          const { data, error } = await supabase
            .from('player_progress')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (error) throw error;

          if (!data) {
            // 2. Nếu chưa có (User mới), khởi tạo dòng dữ liệu đầu tiên lên mây
            console.log('DEBUG: Khởi tạo player_progress cho user mới:', userId);
            await get().syncToCloud(userId);
          } else {
            // 3. Nếu đã có, lấy dữ liệu và ưu tiên ghi đè vào Store
            console.log('DEBUG: Đã tìm thấy dữ liệu mây cho user:', userId);
            const cloudStats = data.player_stats || {};

            // Xử lý đồ ăn hỏng nếu offline > 24h
            const lastOnline = new Date(data.last_online);
            const now = new Date();
            const diffInHours = (now - lastOnline) / (1000 * 60 * 60);

            if (diffInHours > 24 && cloudStats.inventory) {
              const originalLength = cloudStats.inventory.length;
              cloudStats.inventory = cloudStats.inventory.filter(item => item.type !== 'food');
              if (cloudStats.inventory.length < originalLength) {
                console.warn("Đồ ăn đã hỏng hết rồi");
              }
            }

            // Hydrate: Đưa dữ liệu mây vào store
            set((state) => ({
              playerStats: {
                ...state.playerStats,
                ...cloudStats
              }
            }));
          }
        } catch (err) {
          console.error('Error in loadFromCloud:', err.message);
        }
      },

      syncToCloud: async (userId) => {
        let finalId = userId;
        if (!finalId) {
          const { data: { user } } = await supabase.auth.getUser();
          finalId = user?.id;
        }
        if (!finalId) {
          console.warn("⚠️ Không tìm thấy User ID để sync!");
          return;
        }

        const { playerStats } = get();
        
        // Chỉ lọc các biến quan trọng để lưu lên Cloud
        const criticalData = {
          money: playerStats.money,
          time: playerStats.time,
          credits: playerStats.credits,
          totalCredits: playerStats.totalCredits,
          tuitionDue: playerStats.tuitionDue,
          isPaid: playerStats.isPaid,
          isEnrolled: playerStats.isEnrolled,
          isExpelled: playerStats.isExpelled,
          isDroppedOut: playerStats.isDroppedOut,
          hasReceivedInitialMoney: playerStats.hasReceivedInitialMoney,
          hasTutorJob: playerStats.hasTutorJob,
          hasWaiterJob: playerStats.hasWaiterJob,
          difficulty: playerStats.difficulty,
          sessions_count: playerStats.sessions_count,
          inventory: playerStats.inventory
        };

        console.log("🚀 ĐANG GỌI SYNC TO CLOUD...");
        try {
          const { error } = await supabase
            .from('player_progress')
            .upsert({
              id: finalId,
              player_stats: criticalData,
              last_online: new Date().toISOString()
            }, { onConflict: 'id' });

          if (error) throw error;
          console.log("✅ Lưu thành công!");
        } catch (err) {
          console.error("❌ Lỗi:", err.message);
        }
      },

      // Keep loadGameData/saveGameData for backward compatibility or just update them
      loadGameData: async (userId) => {
        // We still load core profile (money, etc.) but money/energy are now in stats (local)
        // Actually, per requirements, money/energy/exp/level/time are LOCAL.
        // So loadGameData only needs to fetch the profile info like full_name.
        if (!userId) return;
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, sessions_count')
            .eq('id', userId)
            .maybeSingle();

          if (error) throw error;
          if (data) {
            set((state) => ({
              playerStats: {
                ...state.playerStats,
                sessions_count: data.sessions_count || 0,
                full_name: data.full_name || '',
              }
            }));
          }
          // Also load the main progress
          await get().loadFromCloud(userId);
        } catch (err) {
          console.error('Error loading game data:', err.message);
        }
      },

      saveGameData: async (userId) => {
        if (!userId) return;
        try {
          // 1. Sync the core game variables to cloud
          await get().syncToCloud(userId);

          // 2. Update session count in profiles if needed
          // (Usually handled at login, but we can update here too)
          const state = get();
          await supabase.from('profiles').update({
            sessions_count: state.playerStats.sessions_count
          }).eq('id', userId);

          console.log('DEBUG: All game data saved');
        } catch (err) {
          console.error('Error saving game data:', err.message);
        }
      },

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
            hasBicycle: false,
            isRidingBicycle: false,
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
        set((state) => ({
      stats: {
        time: { day: 1, hour: 8, minute: 0 },
      },
          playerStats: {
            energy: 100,
            money: 0,
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
            hasBicycle: false,
            isRidingBicycle: false,
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
        let { day, hour, minute } = state.playerStats.time;
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
          playerStats: {
            ...state.playerStats,
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
        const { electricityBill, money } = state.playerStats;
        if (money >= electricityBill.amount) {
          return {
            playerStats: {
              ...state.playerStats,
              money: money - electricityBill.amount,
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
    }), {
    name: 'student-life-v1',
    // Removed partialize to allow full state persistence in LocalStorage
  }));

export default useGameStore;
if (typeof window !== 'undefined') {
  window.useGameStore = useGameStore;
}