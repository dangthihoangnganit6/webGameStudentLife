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
    it('should calculate base interval for Easy difficulty', () => {
      const credits = 20;
      const interval = calculateInterval(credits, 'easy');
      expect(interval).toBe(4); // 20 / 5 = 4
    });

    it('should halve the interval for Hard difficulty', () => {
      const credits = 20;
      const interval = calculateInterval(credits, 'hard');
      expect(interval).toBe(2); // (20 / 5) / 2 = 2
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
