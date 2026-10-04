import { describe, it, expect } from 'vitest';
import { formatINR, calculateDiscount, getOptimizedImageUrl } from './formatters';

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
    expect(calculateDiscount(1000, 850.5)).toBe(15);
    expect(calculateDiscount(100, 33.33)).toBe(67);
  });
});

describe('getOptimizedImageUrl', () => {
  it('returns empty string if url is falsy', () => {
    expect(getOptimizedImageUrl('')).toBe('');
  });

  it('optimizes unsplash URLs correctly', () => {
    const url = 'https://images.unsplash.com/photo-123';
    expect(getOptimizedImageUrl(url)).toBe(`${url}?auto=format&fit=crop&w=600&q=80`);
  });

  it('optimizes shopify URLs correctly without existing query string', () => {
    const url = 'https://cdn.shopify.com/s/files/1/0533/2089/files/image.jpg';
    expect(getOptimizedImageUrl(url)).toBe(`${url}?width=600&format=webp`);
  });

  it('optimizes shopify URLs correctly with existing query string', () => {
    const url = 'https://cdn.shopify.com/s/files/1/0533/2089/files/image.jpg?v=123';
    expect(getOptimizedImageUrl(url)).toBe(`${url}&width=600&format=webp`);
  });

  it('returns original url if not unsplash or shopify', () => {
    const url = 'https://example.com/image.jpg';
    expect(getOptimizedImageUrl(url)).toBe(url);
  });

  it('allows custom width and quality', () => {
    const url = 'https://images.unsplash.com/photo-123';
    expect(getOptimizedImageUrl(url, 800, 90)).toBe(`${url}?auto=format&fit=crop&w=800&q=90`);
  });
});
