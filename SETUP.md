# NERVE Mobile - Setup Guide

## Prerequisites

- Node.js 18+
- Expo CLI (`npx expo`)
- A Supabase project (free tier works)

## 1. Supabase Project Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** and copy:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Run Migrations

In the Supabase SQL editor, run the migration files in order:

```
supabase/migrations/20260320000001_create_profiles.sql
supabase/migrations/20260320000002_create_paper_positions.sql
supabase/migrations/20260320000003_create_paper_balances.sql
supabase/migrations/20260320000004_create_user_settings.sql
```

Or if using the Supabase CLI:

```bash
supabase db push
```

### Enable Auth Providers

1. **Email/Password**: Enabled by default in Supabase
2. **Apple Sign In**:
   - Go to **Authentication > Providers > Apple**
   - Enable Apple provider
   - Add your Apple Service ID and configure callbacks
   - Follow [Supabase Apple Auth docs](https://supabase.com/docs/guides/auth/social-login/auth-apple)
3. **Google Sign In** (optional):
   - Go to **Authentication > Providers > Google**
   - Add your Google OAuth credentials

## 2. Environment Variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

These are automatically picked up by Expo via `process.env.EXPO_PUBLIC_*`.

## 3. Apple Sign In (iOS)

For Apple Sign In to work:

1. Enable "Sign in with Apple" capability in your Apple Developer account
2. Configure the bundle identifier (`com.nerve.mobile`) in your Apple Developer portal
3. The `app.json` already has `usesAppleSignIn: true` set

## 4. Run the App

```bash
# Development
npx expo start

# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android
```

## Architecture

### Auth Flow
```
App Launch → Onboarding (first time) → Auth Screen → Main App
```

- If already logged in (session in SecureStore), skip auth
- "Continue as Guest" skips auth, uses local-only storage
- Guest users see a banner prompting them to sign up

### Cloud Sync
- Auth tokens stored in `expo-secure-store` (not AsyncStorage)
- After every trade open/close, data syncs to Supabase
- On app launch, cloud state is pulled (cloud wins on conflicts)
- Guest mode uses AsyncStorage only, no cloud sync

### Database Tables
- `profiles` - User profile data
- `paper_positions` - Open and closed positions
- `paper_balances` - Account balance
- `user_settings` - User preferences

All tables have Row Level Security (RLS) enabled. Users can only access their own data.
