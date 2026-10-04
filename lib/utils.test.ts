import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('combines basic string classes', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditionally applied classes with objects', () => {
    expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2');
  });

  it('resolves Tailwind class conflicts via twMerge', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('handles undefined, null, and false values gracefully', () => {
    expect(cn('class1', undefined, null, false, 'class2')).toBe('class1 class2');
  });

  it('handles complex combinations', () => {
    expect(
      cn(
        'base-class',
        { 'active-class': true, 'inactive-class': false },
        ['array-class1', 'array-class2'],
        'p-4 bg-red-500',
        'p-8' // this should override p-4
      )
    ).toBe('base-class active-class array-class1 array-class2 bg-red-500 p-8');
  });
});
