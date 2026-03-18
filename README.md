# ⚡ NERVE Mobile

AI-Powered Perpetual DEX — Mobile Companion App

## Overview

React Native (Expo) mobile app for NERVE, an AI-powered perpetual futures trading platform. This is the companion app to the [web application](../nerve/).

## Features

- **Trade Screen** — Market selector, price chart, order panel (market/limit), leverage slider, Long/Short buttons
- **Markets Screen** — All trading pairs with price, 24h change, volume, search & sort
- **Portfolio Screen** — Open positions, PnL display, margin info, account equity, fee tier display
- **Dashboard Screen** — Win rate, discipline score, AI insights, trading heatmap, recent trades
- **Settings Screen** — Margin mode, notifications, haptic feedback, theme

## Tech Stack

- **Expo SDK 55** with TypeScript
- **Expo Router** (file-based routing with tabs + stack)
- **React Native** 0.83
- **Custom design system** matching the web app (dark theme, cyan/electric accents)

## Getting Started

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `w` for web.

## Design System

| Token | Value |
|-------|-------|
| Background | `#07080A` |
| Card | `#12141A` |
| Accent | `#00E5FF` |
| Profit | `#00D68F` |
| Loss | `#FF6B8A` |
| Text | `#E8E8EC` |

## Project Structure

```
app/
  _layout.tsx          # Root layout
  (tabs)/
    _layout.tsx        # Tab navigation
    index.tsx          # Trade screen
    markets.tsx        # Markets list
    portfolio.tsx      # Portfolio & positions
    dashboard.tsx      # AI analytics
    settings.tsx       # Settings & preferences
src/
  components/          # Shared components
  data/                # Mock data
  theme/               # Design tokens
  hooks/               # Utility hooks
```

## Status

Scaffold with mock data. No real API connections yet.
