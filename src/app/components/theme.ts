export interface Theme {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  accent: string;
  accentHover: string;
  accentBg: string;
  accentText: string;
  green: string;
  greenBg: string;
  greenText: string;
  amber: string;
  amberBg: string;
  amberText: string;
  red: string;
  redBg: string;
  redText: string;
  shadow: string;
}

export const darkTheme: Theme = {
  bg: '#0E0F12',
  surface: '#16181D',
  surface2: '#1C1E24',
  border: '#24262E',
  text: '#E8EAF0',
  textMuted: '#8B8FA8',
  textSubtle: '#5A5D73',
  accent: '#2F6FED',
  accentHover: '#1A5BD9',
  accentBg: 'rgba(47,111,237,0.12)',
  accentText: '#6B9FFF',
  green: '#22C55E',
  greenBg: 'rgba(34,197,94,0.12)',
  greenText: '#4ADE80',
  amber: '#F59E0B',
  amberBg: 'rgba(245,158,11,0.12)',
  amberText: '#FCD34D',
  red: '#EF4444',
  redBg: 'rgba(239,68,68,0.12)',
  redText: '#F87171',
  shadow: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
};

export const lightTheme: Theme = {
  bg: '#F4F5F7',
  surface: '#FFFFFF',
  surface2: '#F9FAFB',
  border: '#E2E4EC',
  text: '#0E0F12',
  textMuted: '#6B7280',
  textSubtle: '#9CA3AF',
  accent: '#2F6FED',
  accentHover: '#1A5BD9',
  accentBg: '#EEF3FD',
  accentText: '#1D4ED8',
  green: '#16A34A',
  greenBg: '#F0FDF4',
  greenText: '#15803D',
  amber: '#D97706',
  amberBg: '#FFFBEB',
  amberText: '#B45309',
  red: '#DC2626',
  redBg: '#FEF2F2',
  redText: '#B91C1C',
  shadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
};

export const getTheme = (isDark: boolean): Theme => (isDark ? darkTheme : lightTheme);
