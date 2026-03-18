// NERVE Design System - Dark Theme
// Matches the web app at ~/clawd/projects/nerve/

export const colors = {
  // Backgrounds
  bgPrimary: '#07080A',
  bgSecondary: '#0D0E12',
  bgCard: '#12141A',
  bgHover: 'rgba(255,255,255,0.03)',
  bgElevated: '#181B22',

  // Text
  textPrimary: '#E8E8EC',
  textSecondary: '#8E8E93',
  textTertiary: 'rgba(232,236,241,0.4)',
  textMuted: 'rgba(232,236,241,0.25)',

  // Accent - Cyan/Electric
  accent: '#00E5FF',
  accentDim: '#0097A7',
  accentGlow: 'rgba(0,229,255,0.15)',

  // Trading
  profit: '#00D68F',
  loss: '#FF6B8A',
  caution: '#FFB020',

  // Borders
  border: 'rgba(255,255,255,0.06)',
  borderVisible: 'rgba(255,255,255,0.1)',
  borderAccent: 'rgba(0,229,255,0.2)',

  // Buttons
  longBg: '#00D68F',
  longText: '#000',
  shortBg: '#FF6B8A',
  shortText: '#fff',

  // Tab bar
  tabActive: '#00E5FF',
  tabInactive: '#8E8E93',
} as const;
