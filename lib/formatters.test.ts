import { describe, it, expect } from 'vitest';
import { calculateDiscount } from './formatters';

describe('calculateDiscount', () => {
  it('should calculate the correct discount percentage', () => {
    expect(calculateDiscount(1000, 800)).toBe(20);
    expect(calculateDiscount(100, 50)).toBe(50);
    expect(calculateDiscount(200, 150)).toBe(25);
  });

  it('should return 0 when MRP is equal to price', () => {
    expect(calculateDiscount(1000, 1000)).toBe(0);
  });

  it('should return 0 when MRP is 0', () => {
    expect(calculateDiscount(0, 800)).toBe(0);
  });

  it('should return 0 when MRP is less than price (invalid case)', () => {
    expect(calculateDiscount(500, 800)).toBe(0);
  });

  it('should return 0 when MRP is undefined or null', () => {
    // @ts-expect-error Testing invalid input
    expect(calculateDiscount(undefined, 800)).toBe(0);
    // @ts-expect-error Testing invalid input
    expect(calculateDiscount(null, 800)).toBe(0);
  });

  it('should handle decimal values properly by rounding them', () => {
    // 1000 - 850.5 = 149.5 / 1000 = 0.1495 * 100 = 14.95 -> 15
    expect(calculateDiscount(1000, 850.5)).toBe(15);
    // 100 - 33.33 = 66.67 / 100 = 0.6667 * 100 = 66.67 -> 67
    expect(calculateDiscount(100, 33.33)).toBe(67);
  });
});
