export default {
  expo: {
    name: "NERVE",
    slug: "nerve-mobile",
    owner: "lxgic-studios",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "nerve",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    extra: {
      eas: {
        // Will be set automatically on first `eas build`
        projectId: "__PLACEHOLDER_PROJECT_ID__"
      }
    },
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#07080A"
    },
    ios: {
      supportsTablet: false, // Focus on phone experience initially
      bundleIdentifier: "com.nerve.mobile",
      buildNumber: "1",
      config: {
        usesNonExemptEncryption: false
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1"]
          }
        ]
      }
    },
    android: {
      compileSdkVersion: 35,
      targetSdkVersion: 35,
      buildToolsVersion: "35.0.0",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#07080A"
      },
      package: "com.nerve.mobile",
      versionCode: 1
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#00E5FF",
        }
      ],
    ],
    experiments: {
      typedRoutes: true
    }
  }
};