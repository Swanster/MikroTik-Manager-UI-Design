import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getTheme } from '../app/components/theme';

describe('Theme system', () => {
  it('returns dark theme tokens when isDark=true', () => {
    const t = getTheme(true);
    expect(t.bg).toBe('#0E0F12');
    expect(t.surface).toBe('#16181D');
    expect(t.text).toBe('#E8EAF0');
    expect(t.accent).toBe('#2F6FED');
  });

  it('returns light theme tokens when isDark=false', () => {
    const t = getTheme(false);
    expect(t.bg).toBe('#F4F5F7');
    expect(t.surface).toBe('#FFFFFF');
    expect(t.text).toBe('#0E0F12');
    expect(t.accent).toBe('#2F6FED');
  });

  it('all theme tokens are defined for dark mode', () => {
    const t = getTheme(true);
    const keys = Object.keys(t) as (keyof typeof t)[];
    keys.forEach((key) => {
      expect(t[key]).toBeDefined();
      expect(typeof t[key]).toBe('string');
    });
  });

  it('all theme tokens are defined for light mode', () => {
    const t = getTheme(false);
    const keys = Object.keys(t) as (keyof typeof t)[];
    keys.forEach((key) => {
      expect(t[key]).toBeDefined();
      expect(typeof t[key]).toBe('string');
    });
  });
});
