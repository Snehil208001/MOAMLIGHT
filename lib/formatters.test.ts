import { describe, it, expect } from 'vitest';
import { formatINR } from './formatters';

describe('formatINR', () => {
  it('should format zero correctly', () => {
    expect(formatINR(0)).toBe('₹0');
  });

  it('should format standard numbers correctly', () => {
    expect(formatINR(1299)).toBe('₹1,299');
    expect(formatINR(999)).toBe('₹999');
  });

  it('should format large numbers using Indian numbering system', () => {
    expect(formatINR(100000)).toBe('₹1,00,000');
    expect(formatINR(14999)).toBe('₹14,999');
    expect(formatINR(10000000)).toBe('₹1,00,00,000');
  });

  it('should round decimal numbers correctly since maximumFractionDigits is 0', () => {
    expect(formatINR(1299.5)).toBe('₹1,300');
    expect(formatINR(1299.4)).toBe('₹1,299');
  });

  it('should handle negative numbers', () => {
    expect(formatINR(-1299)).toBe('-₹1,299');
  });

  it('should handle NaN correctly by returning "₹0"', () => {
    expect(formatINR(NaN)).toBe('₹0');
  });
});
