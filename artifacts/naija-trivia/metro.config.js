const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// expo-notifications remote push support was removed from Expo Go in SDK 53.
// Redirect to a no-op stub so the app runs in Expo Go without crashing.
// To restore real notifications, remove the extraNodeModules entry below and
// build a proper development build via `eas build`.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "expo-notifications": path.resolve(__dirname, "mocks/expo-notifications.js"),
};

module.exports = config;
