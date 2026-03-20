import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../src/theme/colors';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { setupNotifications } from '../src/lib/notifications';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';

const ONBOARDING_KEY = 'nerve_onboarding_complete';

function RootNavigator() {
  const { user, isLoading: authLoading, isGuest } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setNeedsOnboarding(value !== 'true');
      setIsReady(true);
    });
    setupNotifications();
  }, []);

  if (!isReady || authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const isAuthenticated = !!user || isGuest;
  let initialRoute = '(tabs)';
  if (needsOnboarding) initialRoute = 'onboarding';
  else if (!isAuthenticated) initialRoute = 'auth/login';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgPrimary }, animation: 'fade', animationDuration: 200 }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="auth/login" options={{ animation: 'fade' }} />
        <Stack.Screen name="auth/signup" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="auth/forgot-password" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="market/[symbol]" options={{ animation: 'slide_from_right', animationDuration: 250, gestureEnabled: true, gestureDirection: 'horizontal' }} />
        <Stack.Screen name="coach" options={{ animation: 'slide_from_bottom', animationDuration: 300, gestureEnabled: true, gestureDirection: 'vertical', presentation: 'modal' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
