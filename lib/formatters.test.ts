import { formatINR } from './formatters';

describe('formatINR', () => {
  it('should format a positive integer correctly', () => {
    expect(formatINR(1299)).toBe('₹1,299');
    expect(formatINR(14999)).toBe('₹14,999');
    expect(formatINR(100000)).toBe('₹1,00,000');
  });

  it('should format zero correctly', () => {
    expect(formatINR(0)).toBe('₹0');
  });

  it('should handle decimals by dropping the fractional part', () => {
    // Note: maximumFractionDigits: 0 rounds the number
    expect(formatINR(1299.99)).toBe('₹1,300');
    expect(formatINR(1299.1)).toBe('₹1,299');
  });

  it('should format negative numbers correctly', () => {
    expect(formatINR(-1299)).toBe('-₹1,299');
  });

  it('should handle NaN by returning a fallback', () => {
    expect(formatINR(NaN)).toBe('₹0');
  });
});
