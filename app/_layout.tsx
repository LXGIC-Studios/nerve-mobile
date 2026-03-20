import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../src/theme/colors';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { setupNotifications } from '../src/lib/notifications';

const ONBOARDING_KEY = 'nerve_onboarding_complete';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setNeedsOnboarding(value !== 'true');
      setIsReady(true);
    });
    // Request notification permissions
    setupNotifications();
  }, []);

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: colors.bgPrimary }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
          <StatusBar style="light" translucent backgroundColor="transparent" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bgPrimary },
              animation: 'fade',
              animationDuration: 200,
            }}
            initialRouteName={needsOnboarding ? 'onboarding' : '(tabs)'}
          >
            <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="market/[symbol]"
              options={{
                animation: 'slide_from_right',
                animationDuration: 250,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen
              name="coach"
              options={{
                animation: 'slide_from_bottom',
                animationDuration: 300,
                gestureEnabled: true,
                gestureDirection: 'vertical',
                presentation: 'modal',
              }}
            />
          </Stack>
        </View>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
