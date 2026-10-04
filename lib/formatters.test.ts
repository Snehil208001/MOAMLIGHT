import { describe, it, expect } from 'vitest';
import { getOptimizedImageUrl } from './formatters';

describe('getOptimizedImageUrl', () => {
  it('should return empty string if url is empty', () => {
    expect(getOptimizedImageUrl('')).toBe('');
  });

  describe('Unsplash URLs', () => {
    it('should append correct parameters for a base Unsplash URL', () => {
      const url = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff';
      const expected = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';
      expect(getOptimizedImageUrl(url)).toBe(expected);
    });

    it('should strip existing queries and append correct parameters for an Unsplash URL with queries', () => {
      const url = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=50&w=200';
      const expected = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';
      expect(getOptimizedImageUrl(url)).toBe(expected);
    });

    it('should use provided width and quality parameters', () => {
      const url = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff';
      const expected = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=90';
      expect(getOptimizedImageUrl(url, 1200, 90)).toBe(expected);
    });
  });

  describe('Shopify URLs', () => {
    it('should append correct parameters for a base Shopify URL', () => {
      const url = 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png';
      const expected = 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?width=600&format=webp';
      expect(getOptimizedImageUrl(url)).toBe(expected);
    });

    it('should append parameters using & if the Shopify URL already has queries', () => {
      const url = 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?v=1530129081';
      const expected = 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?v=1530129081&width=600&format=webp';
      expect(getOptimizedImageUrl(url)).toBe(expected);
    });

    it('should use provided width parameter for Shopify URLs', () => {
      const url = 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png';
      const expected = 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?width=800&format=webp';
      expect(getOptimizedImageUrl(url, 800)).toBe(expected);
    });
  });

  describe('Other URLs', () => {
    it('should return the original URL for unrecognized domains', () => {
      const url = 'https://example.com/image.jpg';
      expect(getOptimizedImageUrl(url)).toBe(url);
    });
  });
});
