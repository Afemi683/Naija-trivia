import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { GameProvider, useGame } from "@/context/GameContext";
import { NetworkProvider, useNetwork } from "@/context/NetworkContext";
import LoginScreen from "@/app/login";

SplashScreen.preventAutoHideAsync();

// expo-notifications is stubbed via metro.config.js in Expo Go (SDK 53+)
// so this is always safe to call.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const queryClient = new QueryClient();

/**
 * Watches for network reconnection and triggers auth restore + progress sync.
 * Must be inside both NetworkProvider and GameProvider.
 */
function ReconnectSync() {
  const { justReconnected } = useNetwork();
  const { tryRestoreSession } = useAuth();
  const { flushSyncQueue } = useGame();

  useEffect(() => {
    if (!justReconnected) return;
    // Fire and forget — both are safe to call when not needed
    tryRestoreSession();
    flushSyncQueue();
  }, [justReconnected, tryRestoreSession, flushSyncQueue]);

  return null;
}

function RootLayoutNav() {
  const { isLoading, user, isGuest } = useAuth();

  // Navigate to daily screen when user taps a notification
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.navigate("/(tabs)/daily");
    });
    return () => sub.remove();
  }, []);

  if (isLoading) return null;

  if (!user && !isGuest) {
    return <LoginScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="quiz" options={{ gestureEnabled: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="results" options={{ gestureEnabled: false, animation: "slide_from_bottom" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <NetworkProvider>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <AuthProvider>
                  <GameProvider>
                    {/* Reconnect sync watcher — needs auth + game context */}
                    <ReconnectSync />
                    {/* Floating offline/online banner — always on top */}
                    <OfflineBanner />
                    <RootLayoutNav />
                  </GameProvider>
                </AuthProvider>
              </KeyboardProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </NetworkProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
