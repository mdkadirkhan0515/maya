/**
 * Maya App - Theme Constants - SDK 57 + Dark Mode Premium
 * Colors: #0B0F19 darkBase, #1E293B cardBg, #38BDF8 highlight
 */

export const Colors = {
  // Base
  darkBase: '#0B0F19',
  cardBg: '#1E293B',
  highlight: '#38BDF8',
  border: '#334155',
  delete: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',

  // Text
  textDarkMode: '#FFFFFF',
  textLightMode: '#0B0F19',
  textMuted: '#94A3B8',
  textSecondary: '#CBD5E1',

  // Extras
  overlay: 'rgba(11, 15, 25, 0.6)',
  cardBorder: '#334155',
  inputBg: '#0B0F19',
  shadow: '#000000',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const Fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
} as const;

export default Colors;
