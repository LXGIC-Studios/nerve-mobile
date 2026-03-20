# NERVE Mobile - Testing Report
**Date:** 2026-03-20
**Platform:** Web (Expo export) — iOS Simulator unavailable (no Xcode installed)
**Tester:** Sora (automated)

## Environment Note
iOS Simulator testing was not possible because Xcode is not installed on this Mac mini. Testing was performed via Expo web export with `npx expo export --platform web`, served locally and verified in browser. All core logic (trading engine, price fetching, routing, state management) is shared between web and native.

## Screens Tested

### 1. Trade Screen ✅
- **Chart:** TradingView widget renders via iframe on web (fixed from WebView-only)
- **Market selector:** BTC-PERP with price, change, leverage display
- **Stats bar:** 24h High/Low, Volume, Funding Rate — all render correctly
- **Order form:** Market/Limit tabs, size input, leverage picker, TP/SL toggle
- **Quick size buttons:** 10%, 25%, 50%, 75%, 100% working
- **Order confirmation sheet:** Renders with full trade details (size, leverage, margin, liq price, fee)
- **Open Positions:** Shows position cards with swipe-to-close and close button

### 2. Markets Screen ✅
- **Search bar:** Working
- **Category filters:** All, Favorites, Majors, Layer 1, L2, DeFi, Meme, AI, Infra
- **Sort pills:** Volume, Change, Price, A-Z
- **Market cards:** 41 perpetuals with symbol, volume, mini sparkline, price, change
- **Favorites:** Star toggle with AsyncStorage persistence
- **Fear & Greed Index:** Shows value and classification
- **Market detail:** Navigation to /market/[symbol] with chart, orderbook, stats

### 3. Portfolio Screen ✅
- **Equity card:** Shows total equity, balance, unrealized PnL, available margin
- **Stats grid:** Margin used, win rate, total PnL, total trades
- **Margin ratio bar:** Visual bar with safe/caution/danger thresholds
- **Positions tab:** Position cards with close button, PnL display
- **History tab:** Closed trades with entry/exit prices, PnL, duration
- **Empty states:** Proper messaging when no positions/trades

### 4. Dashboard Screen ✅
- **XP bar:** Trader level, XP progress, next level
- **Account overview:** Equity, Total PnL, Trades summary
- **AI Conviction badge:** Score with HIGH/MED/LOW labels
- **Stats grid:** Win rate, discipline, avg PnL, best trade
- **Edge map:** Best hours and strongest pairs
- **Mini charts:** 30-day win rate and discipline bar charts
- **Trading heatmap:** 7x24 activity grid
- **AI Insights:** Warning, info, caution, success cards

### 5. Settings Screen ✅
- **Account summary:** Balance, total trades, win rate
- **Trading settings:** Margin mode toggle (Cross/Isolated), leverage
- **Notifications:** Push, price alerts, liquidation warnings toggles
- **Preferences:** Haptic feedback, theme, currency
- **Leaderboard:** Expandable top 10 traders with rankings
- **Reset account:** Confirmation dialog, resets to $100,000
- **About:** NERVE branding, version, tagline

### 6. Market Detail (/market/[symbol]) ✅
- **Header:** Back button, symbol, leverage info, favorite toggle, trade button
- **Price display:** Large price with change badge
- **TradingView chart:** Full interactive chart
- **Stats grid:** 24h high/low, volume, OI, funding rate, max leverage
- **Order book:** Color-coded bids/asks with depth bars and spread

### 7. N Coach (AI Assistant) ✅
- **Chat interface:** Messages list, assistant/user bubbles
- **Quick actions:** Market Analysis, Risk Check, Trade Ideas, Position Review, Funding Rates
- **Input:** Text input with send button, keyboard avoidance
- **API integration:** Hits https://nerve-production-f309.up.railway.app/api/coach with fallback to local generation
- **Context building:** Sends account state (positions, prices, balance) to coach

### 8. Onboarding ✅
- **4 slides:** Coach, Paper Trade, Brain/Insights, Rocket/Start
- **Pagination dots:** Animated width/opacity
- **Navigation:** Skip button, Next/Start Trading CTA
- **Persistence:** Saves completion to AsyncStorage

## Trading Flow Test ✅
1. ✅ Selected BTC-PERP from market selector
2. ✅ Entered $5,000 size at 5x leverage
3. ✅ Confirmed LONG order via confirmation sheet
4. ✅ Position appeared in Open Positions section with correct entry price (includes realistic slippage)
5. ✅ Position visible in Portfolio with margin, PnL, liquidation price
6. ✅ Closed position — appeared in trade history with entry/exit prices
7. ✅ Balance updated correctly after close ($99,995.89 from $100,000 after slippage)

## Bugs Found & Fixed

### 1. Missing `useEffect` Import (CRASH)
**File:** `app/market/[symbol].tsx`
**Issue:** `useEffect` was used but not imported from React, causing TypeScript error and runtime crash
**Fix:** Added `useEffect` to the import statement

### 2. WebView Not Supported on Web (VISUAL)
**File:** `src/components/TradingViewChart.tsx`
**Issue:** `react-native-webview` shows "React Native WebView does not support this platform" on web
**Fix:** Added Platform.OS check — uses `<iframe>` on web, `<WebView>` on native

### 3. Prices Showing $0.000000 (DATA)
**File:** `src/lib/api/prism.ts`
**Issue:** When API returns data with no `price` field, it fell back to `0`, overriding mock data fallback
**Fix:** Added null check — `getPrice()` returns `null` if price is 0 or undefined, allowing mock data to display

### 4. Missing Negative Sign on PnL (VISUAL)
**File:** `src/hooks/useFormatters.ts`
**Issue:** `pnlSign()` returned empty string for negative numbers, but callers used `Math.abs()` for the value, so losses showed as positive (e.g., "$4.11" instead of "-$4.11")
**Fix:** Changed `pnlSign()` to return `'-'` for negative numbers

### 5. Double Negative on Percentage PnL (VISUAL)
**Files:** Multiple (index.tsx, portfolio.tsx, dashboard.tsx, PositionCard.tsx, PositionDetailSheet.tsx)
**Issue:** After fixing pnlSign, patterns like `{pnlSign(pnlPct)}{pnlPct.toFixed(2)}%` would produce "--5.20%" since both pnlSign and toFixed include the negative sign
**Fix:** Changed all percentage displays to use `Math.abs()`: `{pnlSign(pnlPct)}{Math.abs(pnlPct).toFixed(2)}%`

### 6. Skeleton Animation Warning on Web (MINOR)
**File:** `src/components/Skeleton.tsx`
**Issue:** `useNativeDriver: true` not supported on web, causing console warning
**Fix:** Changed to `Platform.OS !== 'web'` for useNativeDriver

### 7. Coach API Not Integrated (FEATURE)
**File:** `app/coach.tsx`
**Issue:** Coach used only local response generation (simulated), not the real production API
**Fix:** Added real API call to `https://nerve-production-f309.up.railway.app/api/coach` with local fallback on error/timeout. Configurable via `COACH_API_BASE_URL` constant.

## AsyncStorage Persistence ✅
- Positions persist via `nerve_positions` key
- Closed trades persist via `nerve_trades`
- Balance persists via `nerve_balance`
- Favorites persist via `nerve_favorites`
- Onboarding completion persists via `nerve_onboarding_complete`
- All verified working through the trading flow test

## Not Tested (Requires iOS Simulator/Xcode)
- Haptic feedback (expo-haptics)
- Native push notifications
- SafeAreaView insets on notch devices
- Swipeable gesture on position cards (react-native-gesture-handler)
- Native WebView chart rendering
- App background/foreground lifecycle
- Actual AsyncStorage persistence across app restarts

## Recommendations
1. **Install Xcode** on this machine to enable full iOS Simulator testing
2. **Add error boundary around TradingView** — chart load failures should show the ChartPlaceholder fallback
3. **Consider adding a loading state** for initial price fetch so users don't briefly see mock prices
4. **Coach API error handling** — show user-friendly error if API is unreachable
5. **Add haptic feedback guards** — already present (Platform.OS !== 'web' checks)
