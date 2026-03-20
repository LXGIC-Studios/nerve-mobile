# NERVE Mobile — Visual Design Report

**Date:** 2026-03-20  
**Scope:** App icon, splash screen, visual polish, typography, animations

---

## 1. App Icon & Splash Screen

### Icon (1024x1024)
- **Design:** Geometric cyan "N" letterform on dark (#07080A) background
- **Style:** Clean, angular, Bloomberg/Robinhood quality — single-color mark with subtle radial glow
- **iOS:** Rounded corners applied via icon.png (224px corner radius baked in)
- **Android:** Separate foreground/background adaptive icon layers generated
- **Favicon:** 48x48 compact version

### Splash Screen
- Dark background (#07080A) with centered N mark + "NERVE" wordmark
- Subtle cyan radial glow behind the mark
- Letter-spaced wordmark below the icon for brand reinforcement

### Files Generated
| Asset | Size | Purpose |
|-------|------|---------|
| `icon.png` | 1024x1024 | iOS app icon |
| `adaptive-icon.png` | 1024x1024 | Android adaptive icon (full) |
| `android-icon-foreground.png` | 1024x1024 | Android adaptive foreground |
| `android-icon-background.png` | 1024x1024 | Android adaptive background |
| `splash-icon.png` | 1024x1024 | Splash/launch screen |
| `favicon.png` | 48x48 | Web favicon |

---

## 2. Visual Polish Audit

### Screens Reviewed
All 8 screens + 10 components audited:

| Screen | Status | Notes |
|--------|--------|-------|
| Trade (index) | ✅ Clean | SafeAreaView, consistent spacing, tabular nums |
| Markets | ✅ Clean | Search, filters, sparklines all consistent |
| Portfolio | ✅ Enhanced | Added AnimatedCard to equity section |
| Dashboard | ✅ Enhanced | Added AnimatedCard to XP, account, conviction sections |
| Settings | ✅ Clean | Proper section cards, consistent dividers |
| Market Detail | ✅ Fixed | Added missing useEffect import |
| Coach | ✅ Enhanced | Replaced ActivityIndicator with animated typing dots |
| Onboarding | ✅ Fixed | SVG Text element type fix |

### Consistency Checks
- **Border radius:** Cards consistently use 12-16px (mostly 14px for cards, 16px for feature cards)
- **Spacing:** All screens use the spacing system from `src/theme/spacing.ts`
- **Status bar:** Light content on dark background everywhere (root layout)
- **Safe areas:** SafeAreaView properly applied on all tab screens and modals
- **No placeholder text:** All screens use proper data or empty states
- **Loading states:** Skeleton components used (not spinners) — SkeletonPositions, SkeletonCard available

---

## 3. Typography Audit

### Hierarchy (Verified Consistent)
| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| Hero | 28-34px | 800 | Screen titles, equity value |
| H2 | 20-24px | 700-800 | Section headers, conviction score |
| H3 | 15-17px | 700 | Card titles, market symbols |
| Body | 13-14px | 500-600 | Settings labels, descriptions |
| Caption | 10-12px | 600 | Stats labels, metadata |
| Micro | 8-10px | 600 | Uppercase labels, timestamps |

### Tabular Numbers
All financial displays use `fontVariant: ['tabular-nums']`:
- Prices, PnL values, percentages, equity, margins
- Verified across: Trade, Markets, Portfolio, Dashboard, OrderForm, OrderConfirmSheet

### Typography System Added
New `typography` presets exported from `spacing.ts` for future consistency:
```ts
typography.hero   // 32px, 800 weight
typography.h1     // 24px, 800 weight  
typography.body   // 14px, 400 weight
typography.tabularNums  // fontVariant: ['tabular-nums']
```

---

## 4. Animation Polish

### Screen Transitions
- **Tab → Tab:** Fade (200ms)
- **Tab → Market Detail:** Slide from right (250ms) with horizontal gesture dismiss
- **Tab → Coach:** Slide from bottom (300ms) with vertical gesture dismiss, modal presentation

### Card Entrance Animations
- New `AnimatedCard` component: fade-in + spring translateY (12px)
- Applied to Dashboard (XP bar, account card, conviction hero)
- Applied to Portfolio (equity card)
- Staggered delays (0ms, 80ms, 160ms) for sequential reveal

### Bottom Sheet (OrderConfirmSheet)
- Replaced `animationType="slide"` with custom spring animation
- Spring config: damping=22, stiffness=200, mass=0.8
- Backdrop fade: 200ms
- Close: spring return + 150ms backdrop fade

### Coach Typing Indicator
- Three animated dots with staggered opacity pulses
- Replaces generic ActivityIndicator spinner
- Matches accent color (#00E5FF)

### Pull-to-Refresh
- All scrollable screens use RefreshControl with `tintColor={colors.accent}`
- Consistent cyan accent across Trade, Markets, Portfolio, Dashboard, Market Detail

---

## 5. Tab Bar Polish

### Enhancements Applied
- Added active indicator bar (cyan line above active icon)
- Hairline separator instead of 1px border
- Slightly larger icon containers (36x30)
- Added letter spacing to labels
- Removed shadow/elevation for cleaner look

### Tab Icons
All 5 tabs use custom geometric SVG icons from the icon system:
- Trade: Lightning bolt
- Markets: Candlestick chart
- Portfolio: Horizontal bars
- Dashboard: Grid layout
- More: Three squares

---

## 6. Bug Fixes

1. **market/[symbol].tsx** — Missing `useEffect` import (runtime error)
2. **onboarding.tsx** — SVG `<Text>` vs RN `<Text>` type conflict (TS error)
3. **useFormatters.ts** — Hardcoded color strings replaced with `colors.profit`/`colors.loss` imports
4. **app.json** — Updated Android adaptive icon to use separate foreground/background images
5. **coach.tsx** — Replaced `ActivityIndicator` import with `Animated` (proper typing indicator)

---

## 7. Design System Additions

### New Components
- `AnimatedCard` — Reusable entrance animation wrapper

### Theme Extensions
- `borderRadius.card` (14) — Standard card radius
- `borderRadius.sheet` (24) — Bottom sheet radius
- `fontWeight` constants — regular through heavy
- `typography` presets — Hero through micro with tabular nums

---

## Summary

The app now has:
- ✅ Professional app icon (geometric N, dark bg, cyan accent)
- ✅ Matching splash screen with wordmark
- ✅ Consistent visual design across all 8 screens
- ✅ Proper typography hierarchy with tabular numbers
- ✅ Smooth screen transitions with gesture support
- ✅ Spring-animated bottom sheets
- ✅ Card entrance animations
- ✅ Custom typing indicator (no generic spinners)
- ✅ Premium tab bar with active indicator
- ✅ Zero TypeScript errors
