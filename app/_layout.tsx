import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../src/theme/colors';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

const ONBOARDING_KEY = 'nerve_onboarding_complete';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setNeedsOnboarding(value !== 'true');
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: colors.bgPrimary }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bgPrimary },
              animation: 'fade',
            }}
            initialRouteName={needsOnboarding ? 'onboarding' : '(tabs)'}
          >
            <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="market/[symbol]"
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="coach"
              options={{
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
        </View>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
