import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";

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
      <View style={[statStyles.iconWrap, { backgroundColor: color + "22" }]}>
        {icon}
      </View>
      <Text style={[statStyles.value, { color: colors.foreground }]}>{value}</Text>
      <Text style={[statStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}
const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 6,
    minWidth: "45%",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  value: { fontSize: 22, fontFamily: "Inter_700Bold" },
  label: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.4 },
});

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { user, isGuest, logout } = useAuth();
  const { leaderboard, daily } = useGame();

  const topPad = isWeb ? 67 : insets.top;
  const botPad = (isWeb ? 34 : insets.bottom) + TAB_BAR_H;

  const totalGames = leaderboard.length;
  const totalScore = leaderboard.reduce((s, e) => s + e.score, 0);
  const totalQ = leaderboard.reduce((s, e) => s + e.totalQuestions, 0);
  const accuracy = totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0;
  const bestStreak = leaderboard.reduce((s, e) => Math.max(s, e.streak), 0);
  const dailyStreak = daily.streak;
  const gamesPlayed = daily.history.filter((r) => r.completed).length;

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: botPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section header */}
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Profile</Text>

        {/* Avatar + Identity */}
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
                <Text style={[styles.displayName, { color: colors.foreground }]}>Guest</Text>
                <Text style={[styles.emailText, { color: colors.mutedForeground }]}>
                  Scores saved on this device only
                </Text>
                <View style={[styles.guestBadge, { backgroundColor: colors.accent + "22", borderColor: colors.accent }]}>
                  <Feather name="user" size={11} color={colors.accent} />
                  <Text style={[styles.guestBadgeText, { color: colors.accent }]}>Guest Mode</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.displayName, { color: colors.foreground }]}>{user?.name}</Text>
                <Text style={[styles.emailText, { color: colors.mutedForeground }]}>{user?.email}</Text>
                <View style={[styles.verifiedBadge, { backgroundColor: colors.primary + "22", borderColor: colors.primary }]}>
                  <Feather name="check-circle" size={11} color={colors.primary} />
                  <Text style={[styles.verifiedText, { color: colors.primary }]}>Verified Account</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Stats */}
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
            value={String(dailyStreak)}
            icon={<MaterialCommunityIcons name="fire" size={18} color="#FF6B35" />}
            color="#FF6B35"
          />
        </View>

        {/* Daily summary */}
        <View style={[styles.dailySummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.dailySummaryRow}>
            <MaterialCommunityIcons name="calendar-check" size={20} color={colors.primary} />
            <Text style={[styles.dailySummaryLabel, { color: colors.mutedForeground }]}>
              Daily challenges completed
            </Text>
            <Text style={[styles.dailySummaryValue, { color: colors.foreground }]}>{gamesPlayed}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.dailySummaryRow}>
            <MaterialCommunityIcons name="trophy" size={20} color={colors.accent} />
            <Text style={[styles.dailySummaryLabel, { color: colors.mutedForeground }]}>
              Longest daily streak
            </Text>
            <Text style={[styles.dailySummaryValue, { color: colors.foreground }]}>{daily.longestStreak}</Text>
          </View>
        </View>

        {/* Actions */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>

        {isGuest ? (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              logout();
            }}
            style={({ pressed }) => [
              styles.signInBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="log-in" size={18} color="#fff" />
            <Text style={styles.signInBtnText}>Sign In to Sync Scores</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.wrong,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Feather name="log-out" size={18} color={colors.wrong} />
            <Text style={[styles.logoutText, { color: colors.wrong }]}>Log Out</Text>
          </Pressable>
        )}

        <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
          Naija Trivia · v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  pageTitle: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 20, letterSpacing: -0.4 },

  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 16,
    marginBottom: 28,
  },
  identityBody: { flex: 1, gap: 4 },
  displayName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  emailText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  guestBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  guestBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  verifiedText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },

  dailySummary: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 28,
    gap: 0,
  },
  dailySummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  dailySummaryLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  dailySummaryValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  divider: { height: 1, marginVertical: 10 },

  signInBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 15,
    gap: 10,
    marginBottom: 16,
  },
  signInBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 15,
    gap: 10,
    marginBottom: 16,
  },
  logoutText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },

  versionText: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
    marginBottom: 8,
  },
});
