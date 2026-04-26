import { create } from 'zustand';

const useGameStore = create((set) => ({
  // Student Stats
  stats: {
    energy: 100,
    money: 50,
    time: { day: 1, hour: 8, minute: 0 },
  },
  
  // Character state
  position: { x: 100, y: 100 },
  direction: 'down',
  
  // Game state
  isModalOpen: false,
  activeLocation: null,
  
  // Actions
  updateStats: (newStats) => set((state) => ({
    stats: { ...state.stats, ...newStats }
  })),
  
  updatePosition: (newPos) => set({ position: newPos }),
  
  setDirection: (dir) => set({ direction: dir }),
  
  openModal: (location) => set({ isModalOpen: true, activeLocation: location }),
  
  closeModal: () => set({ isModalOpen: false, activeLocation: null }),
  
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
}));

export default useGameStore;
