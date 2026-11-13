import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNetwork } from "@/context/NetworkContext";

/**
 * Persistent banner shown at the top of the screen:
 *  • Red strip while offline
 *  • Green "Back online" flash for ~3 s after reconnection
 */
export function OfflineBanner() {
  const { isOnline, justReconnected } = useNetwork();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const visible = !isOnline || justReconnected;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : -60,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [visible, slideAnim]);

  const bg = isOnline ? "#16a34a" : "#dc2626";
  const icon: "wifi-off" | "wifi" = isOnline ? "wifi" : "wifi-off";
  const message = isOnline
    ? "Back online — syncing progress…"
    : "No internet connection · Offline mode";

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: bg, paddingTop: insets.top + 6, transform: [{ translateY: slideAnim }] },
      ]}
      pointerEvents="none"
    >
      <Feather name={icon} size={14} color="#fff" />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
