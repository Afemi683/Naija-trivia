import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { useNetwork } from "@/context/NetworkContext";
import { ThemePreference, useTheme } from "@/context/ThemeContext";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useColors } from "@/hooks/useColors";
import {
  formatHour,
  HOUR_OPTIONS,
  useNotifications,
} from "@/hooks/useNotifications";

const TAB_BAR_H = Platform.OS === "ios" ? 88 : 68;

function InitialsAvatar({ name, size = 68 }: { name: string; size?: number }) {
  const colors = useColors();
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <View
      style={[
        avatarStyles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primaryLight,
          borderColor: colors.primary,
        },
      ]}
    >
      <Text style={[avatarStyles.text, { fontSize: size * 0.36, color: colors.primary }]}>
        {initials || "🇳🇬"}
      </Text>
    </View>
  );
}

const avatarStyles = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center", borderWidth: 2 },
  text: { fontFamily: "Inter_700Bold" },
});

function StatTile({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={[statStyles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[statStyles.iconWrap, { backgroundColor: color + "18" }]}>{icon}</View>
      <Text style={[statStyles.value, { color: colors.foreground }]}>{value}</Text>
      <Text style={[statStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 6,
    minWidth: "46%",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  value: { fontSize: 20, fontFamily: "Inter_700Bold" },
  label: { fontSize: 11, fontFamily: "Inter_500Medium" },
});

function ThemeOptionButton({
  pref,
  label,
  icon,
}: {
  pref: ThemePreference;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}) {
  const colors = useColors();
  const { preference, setPreference } = useTheme();
  const active = preference === pref;

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        setPreference(pref);
      }}
      style={[
        themeStyles.option,
        { backgroundColor: active ? colors.primary : "transparent" },
      ]}
    >
      <Feather
        name={icon}
        size={15}
        color={active ? "#FFFFFF" : colors.mutedForeground}
      />
      <Text
        style={[
          themeStyles.optionText,
          { color: active ? "#FFFFFF" : colors.mutedForeground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const themeStyles = StyleSheet.create({
  option: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  optionText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { user, isGuest, isOfflineGuest, logout } = useAuth();
  const { leaderboard, daily, pendingSyncCount, flushSyncQueue } = useGame();
  const { isOnline } = useNetwork();
  const notif = useNotifications();

  const topPad = isWeb ? 36 : insets.top;
  const botPad = (isWeb ? 34 : insets.bottom) + TAB_BAR_H;

  const totalGames = leaderboard.length;
  const totalScore = leaderboard.reduce((s, e) => s + e.score, 0);
  const totalQ = leaderboard.reduce((s, e) => s + e.totalQuestions, 0);
  const accuracy = totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0;
  const bestStreak = leaderboard.reduce((s, e) => Math.max(s, e.streak), 0);
  const completedDailyCount = daily.history.filter((r) => r.completed).length;

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
        },
      },
    ]);
  };

  const handleSyncNow = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await flushSyncQueue();
    Alert.alert("Synced!", "All pending records are synchronized with Neon PostgreSQL.");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 14, paddingBottom: botPad + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>

        {/* Identity Card */}
        <View style={[styles.identityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {isGuest ? (
            <View
              style={[
                avatarStyles.circle,
                {
                  width: 68,
                  height: 68,
                  borderRadius: 34,
                  backgroundColor: colors.muted,
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather name="user" size={28} color={colors.mutedForeground} />
            </View>
          ) : (
            <InitialsAvatar name={user?.name ?? "Naija User"} />
          )}

          <View style={styles.identityBody}>
            <Text style={[styles.userName, { color: colors.foreground }]}>
              {isGuest ? (isOfflineGuest ? "Offline Guest" : "Guest Explorer") : user?.name}
            </Text>
            <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>
              {isGuest ? "Playing locally on device" : user?.email}
            </Text>

            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isOnline ? colors.primaryLight : "rgba(239,68,68,0.12)",
                    borderColor: isOnline ? colors.primary : colors.destructive,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isOnline ? colors.primary : colors.destructive },
                  ]}
                />
                <Text
                  style={[
                    styles.badgeText,
                    { color: isOnline ? colors.primary : colors.destructive },
                  ]}
                >
                  {isOnline ? "Online Sync Active" : "Offline Mode"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Database & Cloud Connection Card */}
        <View style={[styles.dbCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.dbCardTop}>
            <View style={[styles.dbIconCircle, { backgroundColor: isSupabaseConfigured ? "rgba(16, 185, 129, 0.15)" : colors.muted }]}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={22}
                color={isSupabaseConfigured ? colors.primary : colors.mutedForeground}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.dbStatusRow}>
                <Text style={[styles.dbTitle, { color: colors.foreground }]}>
                  Supabase Cloud
                </Text>
                <View
                  style={[
                    styles.neonConnectedPill,
                    {
                      backgroundColor: isSupabaseConfigured
                        ? colors.primaryLight
                        : colors.muted,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.neonConnectedText,
                      {
                        color: isSupabaseConfigured
                          ? colors.primary
                          : colors.mutedForeground,
                      },
                    ]}
                  >
                    {isSupabaseConfigured ? "CONNECTED" : "READY"}
                  </Text>
                </View>
              </View>
              <Text style={[styles.dbSubtitle, { color: colors.mutedForeground }]}>
                {isSupabaseConfigured
                  ? "PostgreSQL · Auth · Realtime Leaderboards"
                  : "Connect your Supabase project keys in .env"}
              </Text>
            </View>
          </View>

          {pendingSyncCount > 0 && (
            <View style={styles.syncPendingRow}>
              <Text style={[styles.syncPendingText, { color: colors.accent }]}>
                {pendingSyncCount} score(s) waiting to upload
              </Text>
              <Pressable
                onPress={handleSyncNow}
                style={[styles.syncNowBtn, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.syncNowText}>Sync Now</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>STATISTICS</Text>
        <View style={styles.statsGrid}>
          <StatTile
            label="Quizzes Taken"
            value={String(totalGames)}
            icon={<Feather name="check-circle" size={18} color={colors.primary} />}
            color={colors.primary}
          />
          <StatTile
            label="Overall Accuracy"
            value={`${accuracy}%`}
            icon={<Feather name="target" size={18} color={colors.accent} />}
            color={colors.accent}
          />
          <StatTile
            label="Max Quiz Streak"
            value={String(bestStreak)}
            icon={<MaterialCommunityIcons name="fire" size={18} color="#FF6B35" />}
            color="#FF6B35"
          />
          <StatTile
            label="Daily Challenges"
            value={String(completedDailyCount)}
            icon={<MaterialCommunityIcons name="calendar-check" size={18} color="#8B5CF6" />}
            color="#8B5CF6"
          />
        </View>

        {/* Appearance Control */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>APPEARANCE</Text>
        <View style={[styles.themeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemeOptionButton pref="light" label="Light" icon="sun" />
          <ThemeOptionButton pref="dark" label="Dark" icon="moon" />
          <ThemeOptionButton pref="system" label="System" icon="smartphone" />
        </View>

        {/* Notifications Control */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>REMINDERS</Text>
        <View style={[styles.notifCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.notifRow}>
            <View style={[styles.notifIcon, { backgroundColor: colors.accentLight }]}>
              <MaterialCommunityIcons name="bell-ring-outline" size={18} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.notifTitle, { color: colors.foreground }]}>Daily Quiz Alert</Text>
              <Text style={[styles.notifDesc, { color: colors.mutedForeground }]}>
                {notif.enabled ? `Scheduled at ${formatHour(notif.hour)} daily` : "Receive daily trivia nudge"}
              </Text>
            </View>
            <Switch
              value={notif.enabled}
              onValueChange={() => notif.toggle()}
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor={notif.enabled ? "#FFFFFF" : colors.mutedForeground}
            />
          </View>

          {notif.enabled && !notif.isWeb && (
            <View style={styles.hourPickerRow}>
              {HOUR_OPTIONS.map((h) => (
                <Pressable
                  key={h}
                  onPress={() => notif.setHour(h)}
                  style={[
                    styles.hourPill,
                    {
                      backgroundColor: notif.hour === h ? colors.primary : colors.muted,
                      borderColor: notif.hour === h ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.hourPillText,
                      { color: notif.hour === h ? "#FFFFFF" : colors.mutedForeground },
                    ]}
                  >
                    {formatHour(h)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Account Management */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        {isGuest ? (
          <Pressable
            onPress={() => logout()}
            style={({ pressed }) => [
              styles.accountBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Feather name="log-in" size={18} color="#FFFFFF" />
            <Text style={[styles.accountBtnText, { color: "#FFFFFF" }]}>Sign In or Register</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.accountBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.destructive,
                borderWidth: 1,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Feather name="log-out" size={18} color={colors.destructive} />
            <Text style={[styles.accountBtnText, { color: colors.destructive }]}>Log Out</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 16 },

  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
    marginBottom: 16,
  },
  identityBody: { flex: 1 },
  userName: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 2 },
  userEmail: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 8 },
  badgeRow: { flexDirection: "row" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  dbCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  dbCardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  dbIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dbStatusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dbTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  neonConnectedPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  neonConnectedText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  dbSubtitle: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  syncPendingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  syncPendingText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  syncNowBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  syncNowText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Inter_600SemiBold" },

  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 6,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },

  themeCard: {
    flexDirection: "row",
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    marginBottom: 20,
  },

  notifCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  notifRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  notifIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  notifTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  notifDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  hourPickerRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  hourPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  hourPillText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  accountBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    minHeight: 52,
  },
  accountBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
