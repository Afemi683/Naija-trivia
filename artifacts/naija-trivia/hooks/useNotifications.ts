import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

const NOTIF_ENABLED_KEY = "naija_notif_enabled";
const NOTIF_HOUR_KEY = "naija_notif_hour";
const NOTIF_ID_KEY = "naija_notif_id";

const DEFAULT_HOUR = 9;
const IS_WEB = Platform.OS === "web";

export const HOUR_OPTIONS = [7, 8, 9, 10, 12, 18, 20, 21];

export function formatHour(h: number): string {
  if (h === 0) return "12:00 AM";
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return "12:00 PM";
  return `${h - 12}:00 PM`;
}

// Lazily load expo-notifications so a crash in Expo Go (SDK 53+) doesn't
// take down the whole app. Returns null when unavailable.
function getNotifications() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("expo-notifications") as typeof import("expo-notifications");
  } catch {
    return null;
  }
}

async function scheduleDaily(hour: number): Promise<string | null> {
  if (IS_WEB) return null;
  const Notifications = getNotifications();
  if (!Notifications) return null;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🇳🇬 Daily Challenge Ready!",
        body: "Keep your streak alive — play today's Naija Trivia challenge!",
        sound: true,
        data: { screen: "daily" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
      } as any,
    });
    return id;
  } catch {
    return null;
  }
}

export function useNotifications() {
  const [enabled, setEnabled] = useState(false);
  const [hour, setHourState] = useState(DEFAULT_HOUR);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (IS_WEB) { setLoading(false); return; }
    AsyncStorage.multiGet([NOTIF_ENABLED_KEY, NOTIF_HOUR_KEY]).then((pairs) => {
      setEnabled(pairs[0][1] === "true");
      setHourState(pairs[1][1] ? parseInt(pairs[1][1], 10) : DEFAULT_HOUR);
      setLoading(false);
    });
  }, []);

  const toggle = useCallback(async () => {
    if (IS_WEB) {
      Alert.alert("Not Available", "Push notifications are only available on iOS and Android devices.");
      return;
    }

    const Notifications = getNotifications();

    if (!Notifications) {
      Alert.alert(
        "Not Available",
        "Push notifications require a development build. They are not supported in Expo Go from SDK 53 onwards."
      );
      return;
    }

    if (!enabled) {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please enable notifications in your device settings to receive daily reminders.",
            [{ text: "OK" }]
          );
          return;
        }
        const id = await scheduleDaily(hour);
        await AsyncStorage.multiSet([
          [NOTIF_ENABLED_KEY, "true"],
          [NOTIF_ID_KEY, id ?? ""],
        ]);
        setEnabled(true);
      } catch {
        Alert.alert("Error", "Could not enable notifications. Please try again.");
      }
    } else {
      try {
        await Notifications.cancelAllScheduledNotificationsAsync();
      } catch {
        // ignore
      }
      await AsyncStorage.multiSet([
        [NOTIF_ENABLED_KEY, "false"],
        [NOTIF_ID_KEY, ""],
      ]);
      setEnabled(false);
    }
  }, [enabled, hour]);

  const setHour = useCallback(async (h: number) => {
    setHourState(h);
    await AsyncStorage.setItem(NOTIF_HOUR_KEY, String(h));
    if (enabled && !IS_WEB) {
      const id = await scheduleDaily(h);
      if (id) await AsyncStorage.setItem(NOTIF_ID_KEY, id);
    }
  }, [enabled]);

  return {
    enabled,
    toggle,
    hour,
    setHour,
    loading,
    isWeb: IS_WEB,
  };
}
