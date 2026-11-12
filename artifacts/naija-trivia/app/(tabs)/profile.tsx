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
import { useColors } from "@/hooks/useColors";
import {
  formatHour,
  HOUR_OPTIONS,
  useNotifications,
} from "@/hooks/useNotifications";

const TAB_BAR_H = Platform.OS === "ios" ? 88 : 64;

function InitialsAvatar({ name, size = 80 }: { name: string; size?: number }) {
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
          backgroundColor: colors.primary + "33",
          borderColor: colors.primary,
        },
      ]}
    >
      <Text style={[avatarStyles.text, { fontSize: size * 0.35, color: colors.primary }]}>
        {initials || "?"}
      </Text>
    </View>
  );
}
const avatarStyles = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center", borderWidth: 2 },
  text: { fontFamily: "Inter_700Bold" },
});

function StatCard({
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
    <View style={[statStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[statStyles.iconWrap, { backgroundColor: color + "22" }]}>{icon}</View>
      <Text style={[statStyles.value, { color: colors.foreground }]}>{value}</Text>
      <Text style={[statStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}
const statStyles = StyleSheet.create({
  card: {
    flex: 1, borderRadius: 16, borderWidth: 1, padding: 14,
    alignItems: "center", gap: 6, minWidth: "45%",
  },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  value: { fontSize: 22, fontFamily: "Inter_700Bold" },
  label: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.4 },
});

/** One segment of the Light / Dark / System appearance picker. */
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
      <Feather name={icon} size={16} color={active ? colors.primaryForeground : colors.mutedForeground} />
      <Text style={[themeStyles.optionText, { color: active ? colors.primaryForeground : colors.mutedForeground }]}>
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

/** Network status row shown at the top of the profile card. */
function NetworkStatusRow() {
  const colors = useColors();
  const { isOnline } = useNetwork();
  const { pendingSyncCount } = useGame();

  return (
    <View style={[netStyles.row, {
      backgroundColor: isOnline ? colors.primary + "11" : "#92400e22",
      borderColor: isOnline ? colors.primary + "44" : "#d97706",
    }]}>
      <Feather
        name={isOnline ? "wifi" : "wifi-off"}
        size={14}
        color={isOnline ? colors.primary : "#d97706"}
      />
      <Text style={[netStyles.text, { color: isOnline ? colors.primary : "#d97706" }]}>
        {isOnline ? "Online · Full access" : "Offline · Limited mode"}
      </Text>
      {pendingSyncCount > 0 && (
        <View style={[netStyles.badge, { backgroundColor: colors.accent + "22", borderColor: colors.accent }]}>
          <MaterialCommunityIcons name="cloud-upload-outline" size={11} color={colors.accent} />
          <Text style={[netStyles.badgeText, { color: colors.accent }]}>
            {pendingSyncCount} pending sync
          </Text>
        </View>
      )}
    </View>
  );
}
const netStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 16,
  },
  text: { flex: 1, fontSize: 12, fontFamily: "Inter_600SemiBold" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
});

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { user, isGuest, isOfflineGuest, logout } = useAuth();
  const { leaderboard, daily, pendingSyncCount } = useGame();
  const { isOnline } = useNetwork();
  const notif = useNotifications();

  const topPad = isWeb ? 67 : insets.top;
  const botPad = (isWeb ? 34 : insets.bottom) + TAB_BAR_H;

  const totalGames = leaderboard.length;
  const totalScore = leaderboard.reduce((s, e) => s + e.score, 0);
  const totalQ = leaderboard.reduce((s, e) => s + e.totalQuestions, 0);
  const accuracy = totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0;
  const bestStreak = leaderboard.reduce((s, e) => Math.max(s, e.streak), 0);
  const gamesPlayed = daily.history.filter((r) => r.completed).length;
  const offlineGames = leaderboard.filter((e) => e.offlineMode).length;

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

  const handleToggleNotif = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await notif.toggle();
  };

  const handleHourSelect = async (h: number) => {
    Haptics.selectionAsync();
    await notif.setHour(h);
  };

  // Determine guest display label
  const guestLabel = isOfflineGuest ? "Offline Guest" : "Guest";
  const guestDesc = isOfflineGuest
    ? "Signed in offline · Sync when back online"
    : "Scores saved on this device only";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: botPad }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Profile</Text>

        {/* Network status */}
        <NetworkStatusRow />

        {/* Identity Card */}
        <View style={[styles.identityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {isGuest ? (
            <View style={[avatarStyles.circle, { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="user" size={32} color={colors.mutedForeground} />
            </View>
          ) : (
            <InitialsAvatar name={user?.name ?? "?"} />
          )}
          <View style={styles.identityBody}>
            {isGuest ? (
              <>
                <Text style={[styles.displayName, { color: colors.foreground }]}>{guestLabel}</Text>
                <Text style={[styles.emailText, { color: colors.mutedForeground }]}>
                  {guestDesc}
                </Text>
                <View style={[styles.badge, { backgroundColor: colors.accent + "22", borderColor: colors.accent }]}>
                  <Feather name={isOfflineGuest ? "wifi-off" : "user"} size={11} color={colors.accent} />
                  <Text style={[styles.badgeText, { color: colors.accent }]}>
                    {isOfflineGuest ? "Offline Mode" : "Guest Mode"}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.displayName, { color: colors.foreground }]}>{user?.name}</Text>
                <Text style={[styles.emailText, { color: colors.mutedForeground }]}>{user?.email}</Text>
                <View style={[styles.badge, { backgroundColor: colors.primary + "22", borderColor: colors.primary }]}>
                  <Feather name="check-circle" size={11} color={colors.primary} />
                  <Text style={[styles.badgeText, { color: colors.primary }]}>Verified Account</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Stats Grid */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>YOUR STATS</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Games Played"
            value={String(totalGames)}
            icon={<Feather name="play-circle" size={18} color={colors.primary} />}
            color={colors.primary}
          />
          <StatCard
            label="Accuracy"
            value={`${accuracy}%`}
            icon={<Feather name="target" size={18} color={colors.accent} />}
            color={colors.accent}
          />
          <StatCard
            label="Best Streak"
            value={String(bestStreak)}
            icon={<Feather name="zap" size={18} color="#8B5CF6" />}
            color="#8B5CF6"
          />
          <StatCard
            label="Daily Streak"
            value={String(daily.streak)}
            icon={<MaterialCommunityIcons name="fire" size={18} color="#FF6B35" />}
            color="#FF6B35"
          />
        </View>

        {/* Daily Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons name="calendar-check" size={20} color={colors.primary} />
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Daily challenges completed</Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{gamesPlayed}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons name="trophy" size={20} color={colors.accent} />
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Longest daily streak</Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{daily.longestStreak}</Text>
          </View>
          {offlineGames > 0 && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryRow}>
                <Feather name="wifi-off" size={20} color="#d97706" />
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Games played offline</Text>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>{offlineGames}</Text>
              </View>
            </>
          )}
          {pendingSyncCount > 0 && isOnline && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryRow}>
                <MaterialCommunityIcons name="cloud-upload-outline" size={20} color={colors.accent} />
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Entries pending sync</Text>
                <Text style={[styles.summaryValue, { color: colors.accent }]}>{pendingSyncCount}</Text>
              </View>
            </>
          )}
        </View>

        {/* Notifications */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>NOTIFICATIONS</Text>
        <View style={[styles.notifCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Toggle Row */}
          <View style={styles.notifToggleRow}>
            <View style={[styles.notifIconWrap, { backgroundColor: notif.enabled ? "#FF6B3522" : colors.muted + "33" }]}>
              <MaterialCommunityIcons
                name="bell-ring-outline"
                size={20}
                color={notif.enabled ? "#FF6B35" : colors.mutedForeground}
              />
            </View>
            <View style={styles.notifToggleBody}>
              <Text style={[styles.notifToggleTitle, { color: colors.foreground }]}>Daily Reminder</Text>
              <Text style={[styles.notifToggleDesc, { color: colors.mutedForeground }]}>
                {notif.isWeb
                  ? "Available on iOS & Android"
                  : notif.enabled
                  ? `Reminds you at ${formatHour(notif.hour)}`
                  : "Get pinged when it's time to play"}
              </Text>
            </View>
            <Switch
              value={notif.enabled}
              onValueChange={handleToggleNotif}
              disabled={notif.loading || notif.isWeb}
              trackColor={{ false: colors.muted, true: "#FF6B35" }}
              thumbColor={notif.enabled ? "#FFFFFF" : colors.border}
              ios_backgroundColor={colors.muted}
            />
          </View>

          {/* Time Picker (only when enabled + not web) */}
          {notif.enabled && !notif.isWeb && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.timePickerLabel, { color: colors.mutedForeground }]}>REMIND ME AT</Text>
              <View style={styles.timePickerRow}>
                {HOUR_OPTIONS.map((h) => (
                  <Pressable
                    key={h}
                    onPress={() => handleHourSelect(h)}
                    style={[
                      styles.timePill,
                      {
                        backgroundColor: notif.hour === h ? "#FF6B35" : colors.background,
                        borderColor: notif.hour === h ? "#FF6B35" : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.timePillText,
                        { color: notif.hour === h ? "#fff" : colors.mutedForeground },
                      ]}
                    >
                      {formatHour(h)}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={[styles.notifNote, { backgroundColor: "#FF6B3511", borderColor: "#FF6B3533" }]}>
                <MaterialCommunityIcons name="information-outline" size={14} color="#FF6B35" />
                <Text style={[styles.notifNoteText, { color: "#FF6B35" }]}>
                  Fires daily at {formatHour(notif.hour)} until you complete the challenge
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Appearance */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>APPEARANCE</Text>
        <View style={[styles.notifCard, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: "row", padding: 6, gap: 6 }]}>
          <ThemeOptionButton pref="light" label="Light" icon="sun" />
          <ThemeOptionButton pref="dark" label="Dark" icon="moon" />
          <ThemeOptionButton pref="system" label="System" icon="smartphone" />
        </View>

        {/* Account Actions */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>

        {isGuest ? (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              logout();
            }}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: isOnline ? colors.primary : colors.muted,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Feather name="log-in" size={18} color={isOnline ? "#fff" : colors.mutedForeground} />
            <Text style={[styles.actionBtnText, { color: isOnline ? "#fff" : colors.mutedForeground }]}>
              {isOnline ? "Sign In to Sync Scores" : "Sign In (requires internet)"}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: colors.card,
                borderWidth: 1.5,
                borderColor: colors.wrong,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Feather name="log-out" size={18} color={colors.wrong} />
            <Text style={[styles.actionBtnText, { color: colors.wrong }]}>Log Out</Text>
          </Pressable>
        )}

        <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
          Naija Trivia · v1.0.0 · {isOnline ? "Online" : "Offline"} Mode
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  pageTitle: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 12, letterSpacing: -0.4 },

  identityCard: {
    flexDirection: "row", alignItems: "center", borderRadius: 20,
    borderWidth: 1, padding: 20, gap: 16, marginBottom: 28,
  },
  identityBody: { flex: 1, gap: 4 },
  displayName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  emailText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start",
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4,
  },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, marginBottom: 12 },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },

  summaryCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 28 },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  summaryLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  summaryValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  divider: { height: 1, marginVertical: 10 },

  notifCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 28 },
  notifToggleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  notifIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  notifToggleBody: { flex: 1 },
  notifToggleTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  notifToggleDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  timePickerLabel: {
    fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1,
    textTransform: "uppercase", marginBottom: 10,
  },
  timePickerRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  timePill: {
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  timePillText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  notifNote: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 10, borderWidth: 1, padding: 10,
  },
  notifNoteText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular" },

  actionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 14, paddingVertical: 15, gap: 10, marginBottom: 16,
  },
  actionBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },

  versionText: {
    textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular",
    marginTop: 8, marginBottom: 8,
  },
});
