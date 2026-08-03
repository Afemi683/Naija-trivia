import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { GameProvider } from "@/context/GameContext";
import LoginScreen from "@/app/login";

SplashScreen.preventAutoHideAsync();

// Lazily load expo-notifications — remote push notifications were removed from
// Expo Go in SDK 53 and the module throws on import in that environment.
function getNotifications() {
  try {
    return require("expo-notifications") as typeof import("expo-notifications");
  } catch {
    return null;
  }
}

// Set up foreground notification handler if the module is available
const Notifications = getNotifications();
if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
    // not available in this environment
  }
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isLoading, user, isGuest } = useAuth();

  // Navigate to daily screen when user taps a notification (only when available)
  useEffect(() => {
    const notif = getNotifications();
    if (!notif) return;
    try {
      const sub = notif.addNotificationResponseReceivedListener(() => {
        router.navigate("/(tabs)/daily");
      });
      return () => sub.remove();
    } catch {
      // not available in this environment
    }
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
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AuthProvider>
                <GameProvider>
                  <RootLayoutNav />
                </GameProvider>
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
