export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  card: 14,   // Standard card border radius
  sheet: 24,  // Bottom sheet border radius
  full: 999,
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  hero: 32,
} as const;

/** Standard font weights for the design system */
export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

/** Typography presets */
export const typography = {
  hero: { fontSize: fontSize.hero, fontWeight: fontWeight.heavy },
  h1: { fontSize: fontSize.xxl, fontWeight: fontWeight.heavy },
  h2: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  h3: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  body: { fontSize: fontSize.md, fontWeight: fontWeight.regular },
  bodyBold: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  caption: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  micro: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  /** Use fontVariant: ['tabular-nums'] for all number displays */
  tabularNums: { fontVariant: ['tabular-nums' as const] },
} as const;
