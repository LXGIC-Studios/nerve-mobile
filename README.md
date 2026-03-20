# NERVE Mobile

AI-powered paper trading app for crypto perpetual futures. Practice trading with $100K in virtual funds, real-time market data, and an AI coaching assistant.

## Tech Stack

- **Framework**: Expo SDK 55 / React Native 0.83
- **Navigation**: Expo Router (file-based)
- **State**: React hooks + AsyncStorage persistence
- **Charts**: TradingView WebView integration
- **Haptics**: expo-haptics for trade feedback
- **Notifications**: expo-notifications for TP/SL alerts
- **Animations**: React Native Animated + Reanimated
- **Market Data**: Strykr Prism API (live crypto prices)

## Setup

```bash
# Clone
git clone https://github.com/LXGIC-Studios/nerve-mobile.git
cd nerve-mobile

# Install deps
npm install

# Configure env vars
cp .env.example .env
# Edit .env with your Prism API key

# Start dev server
npx expo start
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_PRISM_API_URL` | Prism API base URL |
| `EXPO_PUBLIC_PRISM_API_KEY` | Prism API key for market data |

## Running Locally

```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Expo Go (scan QR)
npx expo start
```

## Building for TestFlight

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project (first time)
eas build:configure

# Build for TestFlight (internal distribution)
eas build --platform ios --profile preview

# Build for App Store submission
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

## Architecture

```
nerve-mobile/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Tab navigation
│   │   ├── index.tsx       # Trade screen (main)
│   │   ├── markets.tsx     # Market browser
│   │   ├── portfolio.tsx   # Portfolio & positions
│   │   ├── dashboard.tsx   # Analytics & AI insights
│   │   └── settings.tsx    # Settings & leaderboard
│   ├── market/[symbol].tsx # Market detail page
│   ├── coach.tsx           # AI coaching chat
│   ├── onboarding.tsx      # First-run onboarding
│   └── _layout.tsx         # Root layout
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ErrorBoundary   # App-level error catch
│   │   ├── OrderForm       # Trade entry form
│   │   ├── PositionCard    # Position display
│   │   ├── MarketCard      # Market list item
│   │   ├── TradingViewChart# WebView chart
│   │   ├── Skeleton        # Loading skeletons
│   │   └── icons/          # Custom SVG icons
│   ├── lib/
│   │   ├── api/prism.ts    # Market data API client
│   │   ├── engine/         # Paper trading engine
│   │   │   ├── tradingEngine.ts  # Core engine (positions, PnL, TP/SL)
│   │   │   └── types.ts         # TypeScript types
│   │   ├── hooks/
│   │   │   ├── usePrices.ts     # Real-time price polling
│   │   │   └── useTradingEngine.ts # Trading state hook
│   │   └── notifications.ts     # Local push notifications
│   ├── theme/
│   │   ├── colors.ts       # Design system colors
│   │   └── spacing.ts      # Typography & spacing
│   ├── hooks/
│   │   └── useFormatters.ts # Number formatting utils
│   └── data/
│       └── mockData.ts     # Market list & mock data
├── assets/                 # App icons, splash screen
├── app.config.js           # Expo config (dynamic)
├── app.json                # Expo config (static)
├── eas.json                # EAS Build profiles
└── store-metadata.md       # App Store listing copy
```

## Data Flow

1. **Price Polling**: `usePrices` hook polls Prism API every 8s for live prices
2. **Global Cache**: Prices stored in module-level cache, shared across components
3. **Trading Engine**: Singleton `TradingEngine` class manages positions, PnL, TP/SL
4. **Persistence**: All trading state saved to AsyncStorage
5. **Notifications**: Local push notifications on TP/SL hits and liquidation warnings
6. **Mark Price Updates**: Engine recalculates unrealized PnL on every price tick

## Trading Engine

The paper trading engine simulates realistic execution:

- **Slippage**: 0.01-0.05% random slippage on fills
- **Liquidation**: Calculated at 90% of margin distance
- **TP/SL**: Auto-closes positions when mark price crosses levels
- **Margin**: Cross-margin mode with position-level tracking
- **Starting Balance**: $100,000 virtual USD

## Screens

| Screen | Description |
|--------|-------------|
| **Trade** | Main trading interface with chart, order form, open positions |
| **Markets** | Browse 40+ perp markets with search, filters, favorites |
| **Portfolio** | Account overview, positions, trade history |
| **Dashboard** | AI analytics, win rate, discipline score, XP system |
| **Settings** | Preferences, leaderboard, account reset |
| **Coach** | AI trading assistant chat (N Coach) |
| **Market Detail** | Deep-dive into individual markets with order book |

## Built By

[LXGIC Studios](https://github.com/LXGIC-Studios)
