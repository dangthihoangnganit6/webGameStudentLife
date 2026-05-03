import { describe, it, expect } from 'vitest';

/**
 * Logic to be tested (duplicated here for pure test environment)
 */
const calculateInterval = (credits, difficulty) => {
  const baseT = credits / 5;
  return difficulty === 'hard' ? baseT / 2 : baseT;
};

const checkDropout = (missedClasses) => {
  return missedClasses >= 3;
};

describe('Attendance System Logic', () => {
  describe('Interval Calculation (Nhiệm vụ 1)', () => {
    it('should calculate interval for 20 credits on Easy difficulty', () => {
      expect(calculateInterval(20, 'easy')).toBe(4); // 20 / 5 = 4
    });

    it('should calculate interval for 20 credits on Hard difficulty', () => {
      expect(calculateInterval(20, 'hard')).toBe(2); // (20 / 5) / 2 = 2
    });

    it('should calculate interval for 15 credits on Easy difficulty', () => {
      expect(calculateInterval(15, 'easy')).toBe(3); // 15 / 5 = 3
    });

    it('should calculate interval for 15 credits on Hard difficulty', () => {
      expect(calculateInterval(15, 'hard')).toBe(1.5); // (15 / 5) / 2 = 1.5
    });

    it('should handle zero credits without crashing', () => {
      expect(calculateInterval(0, 'easy')).toBe(0); 
    });
  });

  describe('Penalty Logic (Nhiệm vụ 2)', () => {
    it('should not trigger dropout with 2 missed classes', () => {
      expect(checkDropout(2)).toBe(false);
    });

    it('should trigger dropout when missed classes reach 3', () => {
      expect(checkDropout(3)).toBe(true);
    });

    it('should continue to trigger dropout if missed classes exceed 3', () => {
      expect(checkDropout(4)).toBe(true);
    });
  });
});
