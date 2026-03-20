# TestFlight Submission Checklist

## Pre-Build Setup ✅

### EAS Configuration
- [x] **eas.json created** with NERVE-specific settings
- [x] **Owner set** to `lxgic-studios`
- [x] **Bundle ID confirmed** as `com.nerve.mobile`
- [x] **Apple Team ID** set to `U5VN9QMR97`
- [x] **Apple ID** set to `clawdko@icloud.com`
- [x] **Node version** pinned to `22.22.0`
- [x] **Build profiles** configured (development, preview, production)
- [x] **Submit config** added for iOS TestFlight

### App Configuration
- [x] **app.config.js created** (replaces app.json for flexibility)
- [x] **iOS bundleIdentifier** set correctly
- [x] **buildNumber** set to "1"
- [x] **supportsTablet** set to false (phone-first)
- [x] **ITSAppUsesNonExemptEncryption** set to false
- [x] **Privacy manifests** added for UserDefaults
- [x] **EAS project ID** placeholder ready
- [x] **expo-router plugin** configured
- [x] **expo-notifications plugin** configured
- [x] **expo-haptics plugin** configured

### Dependencies
- [x] **expo-haptics** installed and listed
- [x] **expo-notifications** installed and listed
- [x] **@gorhom/bottom-sheet** installed and listed
- [x] **Dependencies check passed** (`npx expo install --check`)
- [x] **No version mismatches** found

### App Store Metadata
- [x] **store-metadata.md created** with complete App Store information
- [x] **App name**: NERVE - AI Trading Coach
- [x] **Subtitle**: Paper Trade with AI Coaching
- [x] **Description** created (3,847 chars, under 4,000 limit)
- [x] **Keywords** optimized (97 chars, under 100 limit)
- [x] **Category** set to Finance
- [x] **Age rating** set to 17+ (simulated gambling)
- [ ] **Privacy policy** URL needed (marked as TODO)

## Required Actions Before First Build

### Apple Developer Setup
- [ ] **Verify Apple Developer Account** access with clawdko@icloud.com
- [ ] **Confirm Team ID U5VN9QMR97** permissions
- [ ] **Create App Store Connect app** record
- [ ] **Generate App Store Connect API key** (if not using Apple ID auth)

### EAS Setup
- [ ] **Install EAS CLI**: `npm install -g @expo/eas-cli`
- [ ] **Login to Expo**: `eas login`
- [ ] **Initialize EAS project**: `eas build:configure`
- [ ] **Set EAS project ID** in app.config.js (replaces placeholder)

### Assets Preparation
- [ ] **Create notification icon**: `./assets/notification-icon.png`
- [ ] **Create notification sound**: `./assets/notification-sound.wav`
- [ ] **Verify all icons** are properly sized
- [ ] **Test splash screen** on different devices
- [ ] **Prepare App Store screenshots** (6.7", 6.5", 5.5" iPhone + iPad if supporting)

### Privacy Policy & Legal
- [ ] **Create privacy policy** page at https://nerve.lxgicstudios.com/privacy
- [ ] **Create terms of use** page at https://nerve.lxgicstudios.com/terms
- [ ] **Update store-metadata.md** with actual URLs
- [ ] **Review age rating** requirements for simulated gambling

## Build Process

### Development Build (First)
```bash
# Test development build first
eas build --platform ios --profile development
```

### Preview Build
```bash
# Create preview build for internal testing
eas build --platform ios --profile preview
```

### Production Build
```bash
# Production build for TestFlight
eas build --platform ios --profile production
```

### Submit to TestFlight
```bash
# Submit to TestFlight
eas submit --platform ios --profile production
```

## Post-Build Verification

### App Store Connect
- [ ] **App appears** in App Store Connect
- [ ] **Build processes** successfully
- [ ] **TestFlight build** available
- [ ] **Internal testing** group set up
- [ ] **External testing** configured (optional)

### App Store Review Preparation
- [ ] **App Store screenshots** uploaded (all required sizes)
- [ ] **App preview video** uploaded (optional but recommended)
- [ ] **App description** finalized
- [ ] **Keywords** optimized
- [ ] **Age rating questionnaire** completed
- [ ] **App Review Information** provided
- [ ] **Demo account** created for reviewers
- [ ] **Review notes** explaining simulation nature

### Final Checks
- [ ] **Privacy policy** accessible and accurate
- [ ] **Terms of use** accessible
- [ ] **Support email** responding
- [ ] **Marketing website** live at https://nerve.lxgicstudios.com
- [ ] **All required metadata** complete
- [ ] **Version ready** for App Store review submission

## Common Issues & Solutions

### Build Failures
- **Native module issues**: Check that all deps support new architecture (`newArchEnabled: true`)
- **Bundle identifier conflicts**: Ensure unique bundle ID not used by other apps
- **Certificate issues**: Verify Apple Developer account access and team membership

### Submission Issues
- **Privacy manifest missing**: Ensure NSPrivacyAccessedAPITypes properly configured
- **Age rating rejection**: App simulates gambling, 17+ rating required
- **Description rejection**: Avoid misleading claims about guaranteed returns

### TestFlight Issues
- **Missing compliance**: ITSAppUsesNonExemptEncryption must be false for easy approval
- **Beta review delay**: First submission may take 24-48 hours for beta review

## Emergency Contacts
- **Apple Developer Support**: developer.apple.com/contact
- **EAS Support**: expo.dev/contact
- **LXGIC Studios**: support@lxgicstudios.com

## Notes
- First EAS build will take longer (15-30 minutes)
- TestFlight beta review typically takes 24-48 hours
- App Store review typically takes 24-48 hours for simple apps
- Keep certificates and provisioning profiles organized in Apple Developer portal