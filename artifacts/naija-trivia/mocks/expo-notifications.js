/**
 * No-op stub for expo-notifications.
 * expo-notifications remote push support was removed from Expo Go in SDK 53.
 * Metro resolves this file instead of the real module when running in Expo Go
 * (configured in metro.config.js). A real development build gets the real module.
 */

const noop = () => {};
const noopAsync = async () => {};
const noopSub = { remove: noop };

module.exports = {
  // Permission
  requestPermissionsAsync: async () => ({ status: "denied" }),
  getPermissionsAsync: async () => ({ status: "denied" }),

  // Handler
  setNotificationHandler: noop,

  // Scheduling
  scheduleNotificationAsync: async () => null,
  cancelAllScheduledNotificationsAsync: noopAsync,
  cancelScheduledNotificationAsync: noopAsync,
  getAllScheduledNotificationsAsync: async () => [],

  // Listeners
  addNotificationReceivedListener: () => noopSub,
  addNotificationResponseReceivedListener: () => noopSub,
  removeNotificationSubscription: noop,

  // Trigger types enum (used in useNotifications.ts)
  SchedulableTriggerInputTypes: {
    DAILY: "daily",
    WEEKLY: "weekly",
    DATE: "date",
    TIME_INTERVAL: "timeInterval",
  },

  // Badge
  setBadgeCountAsync: noopAsync,
  getBadgeCountAsync: async () => 0,

  // Channels (Android)
  setNotificationChannelAsync: noopAsync,
  getNotificationChannelAsync: async () => null,
  deleteNotificationChannelAsync: noopAsync,

  // Token (throws in Expo Go — stub it out)
  getExpoPushTokenAsync: async () => ({ data: "" }),
  getDevicePushTokenAsync: async () => ({ data: "", type: "android" }),

  // Presentation options
  IosAlertStyle: {},
  AndroidImportance: { MAX: 5, HIGH: 4, DEFAULT: 3, LOW: 2, MIN: 1 },
};
