import { getOptimizedImageUrl } from '../lib/formatters';

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
