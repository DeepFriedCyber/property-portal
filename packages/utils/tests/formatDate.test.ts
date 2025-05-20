import { describe, it, expect } from 'vitest';
import { formatDate } from '../formatDate';

describe('formatDate', () => {
  it('formats dates in MM/DD/YYYY format', () => {
    expect(formatDate('2025-05-20')).toBe('05/20/2025');
  });

  it('throws an error for invalid dates', () => {
    expect(() => formatDate('invalid')).toThrow('Invalid date');
  });
});