import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGame } from "@/context/GameContext";
import { useNetwork } from "@/context/NetworkContext";
import { getTodayDateString } from "@/data/daily";
import { CATEGORIES, Category } from "@/data/questions";
import { useColors } from "@/hooks/useColors";

const CATEGORY_ORDER: Category[] = ["history", "geography", "current-affairs"];
const TAB_BAR_H = Platform.OS === "ios" ? 88 : 64;

// Questions available per category in offline mode
const OFFLINE_QUESTION_COUNT = 10;

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  const colors = useColors();
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function StatsBar() {
  const colors = useColors();
  const { leaderboard } = useGame();
  const totalGames = leaderboard.length;
  const totalScore = leaderboard.reduce((s, e) => s + e.score, 0);
  const totalQ = leaderboard.reduce((s, e) => s + e.totalQuestions, 0);
  const accuracy = totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0;
  const bestStreak = leaderboard.reduce((s, e) => Math.max(s, e.streak), 0);

  if (totalGames === 0) {
    return (
      <View style={[styles.emptyStatsBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="play-circle" size={18} color={colors.primary} />
        <Text style={[styles.emptyStatsText, { color: colors.mutedForeground }]}>
          Play your first quiz to start tracking stats!
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.statsBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <StatItem label="Games" value={String(totalGames)} color={colors.primary} />
      <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
      <StatItem label="Accuracy" value={`${accuracy}%`} color={colors.accent} />
      <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
      <StatItem label="Best Streak" value={String(bestStreak)} color="#8B5CF6" />
    </View>
  );
}

function OfflineModeCard() {
  const colors = useColors();
  return (
    <View style={[styles.offlineCard, { backgroundColor: "#92400e22", borderColor: "#d97706" }]}>
      <Feather name="wifi-off" size={16} color="#d97706" />
      <View style={styles.offlineCardBody}>
        <Text style={[styles.offlineCardTitle, { color: "#d97706" }]}>Offline Mode</Text>
        <Text style={[styles.offlineCardDesc, { color: colors.mutedForeground }]}>
          {OFFLINE_QUESTION_COUNT} questions per category · Progress saved locally · Sync when back online
        </Text>
      </View>
    </View>
  );
}

function DailyChallengeBanner() {
  const colors = useColors();
  const { isOnline } = useNetwork();
  const { daily, hasDailyBeenPlayed } = useGame();
  const today = getTodayDateString();
  const played = hasDailyBeenPlayed(today);
  const todayRecord = daily.history.find((r) => r.date === today);
  const scale = useRef(new Animated.Value(1)).current;

  // Daily challenge is available offline (questions are bundled)
  return (
    <Animated.View style={[styles.dailyWrap, { transform: [{ scale }] }]}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/daily");
        }}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        style={[
          styles.dailyBanner,
          {
            backgroundColor: played ? colors.card : colors.primary,
            borderColor: played ? colors.border : colors.primary,
          },
        ]}
      >
        <View style={[styles.dailyIconWrap, { backgroundColor: played ? colors.primary + "22" : "rgba(255,255,255,0.2)" }]}>
          <MaterialCommunityIcons
            name={played ? "check-circle" : "lightning-bolt"}
            size={26}
            color={played ? colors.primary : "#fff"}
          />
        </View>
        <View style={styles.dailyBody}>
          <Text style={[styles.dailyLabel, { color: played ? colors.mutedForeground : "rgba(255,255,255,0.8)" }]}>
            DAILY CHALLENGE
          </Text>
          <Text style={[styles.dailyTitle, { color: played ? colors.foreground : "#fff" }]}>
            {played
              ? `${todayRecord?.score ?? 0}/${todayRecord?.total ?? 20} correct today`
              : "20 questions · Mixed categories"}
          </Text>
          {daily.streak > 0 && (
            <View style={styles.dailyStreakRow}>
              <MaterialCommunityIcons name="fire" size={13} color={played ? "#FF6B35" : "rgba(255,255,255,0.9)"} />
              <Text style={[styles.dailyStreakText, { color: played ? "#FF6B35" : "rgba(255,255,255,0.9)" }]}>
                {daily.streak} day streak
              </Text>
            </View>
          )}
          {!isOnline && !played && (
            <Text style={[styles.dailyOfflineNote, { color: "rgba(255,255,255,0.7)" }]}>
              Available offline
            </Text>
          )}
        </View>
        <Feather name="chevron-right" size={20} color={played ? colors.mutedForeground : "rgba(255,255,255,0.7)"} />
      </Pressable>
    </Animated.View>
  );
}

function CategoryCard({ category }: { category: Category }) {
  const colors = useColors();
  const { isOnline } = useNetwork();
  const { getBestForCategory } = useGame();
  const scale = useRef(new Animated.Value(1)).current;
  const info = CATEGORIES[category];
  const best = getBestForCategory(category);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push({ pathname: "/quiz", params: { category } });
        }}
        onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: info.color, shadowColor: info.color }]}
      >
        <View style={[styles.cardIconWrap, { backgroundColor: info.color + "33" }]}>
          <Feather name={info.icon as any} size={26} color={info.color} />
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{info.label}</Text>
          <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{info.description}</Text>
          {best ? (
            <View style={styles.bestRow}>
              <Feather name="award" size={12} color={colors.accent} />
              <Text style={[styles.bestText, { color: colors.accent }]}>Best: {best.score}/{best.totalQuestions}</Text>
            </View>
          ) : (
            <View style={[styles.newPill, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Text style={[styles.newPillText, { color: colors.mutedForeground }]}>New</Text>
            </View>
          )}
        </View>
        <View style={styles.cardRight}>
          {!isOnline && (
            <View style={[styles.offlinePill, { backgroundColor: "#92400e22", borderColor: "#d97706" }]}>
              <Text style={[styles.offlinePillText, { color: "#d97706" }]}>{OFFLINE_QUESTION_COUNT}Q</Text>
            </View>
          )}
          <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isOnline } = useNetwork();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const botPad = (isWeb ? 34 : insets.bottom) + TAB_BAR_H;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 20, paddingBottom: botPad + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.flagStrip, { backgroundColor: colors.primary }]} />
          <View style={[styles.flagStrip, { backgroundColor: colors.foreground }]} />
          <View style={[styles.flagStrip, { backgroundColor: colors.primary }]} />
          <Text style={[styles.appTitle, { color: colors.foreground }]}>Naija Trivia</Text>
          <Text style={[styles.appSubtitle, { color: colors.mutedForeground }]}>
            {isOnline ? "Test your knowledge of Nigeria" : "Offline · Limited mode"}
          </Text>
        </View>

        {!isOnline && <OfflineModeCard />}

        <StatsBar />
        <DailyChallengeBanner />

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          CHOOSE A CATEGORY{!isOnline ? " · OFFLINE" : ""}
        </Text>
        {CATEGORY_ORDER.map((cat) => (
          <CategoryCard key={cat} category={cat} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  header: { alignItems: "center", marginBottom: 24 },
  flagStrip: { width: 40, height: 4, borderRadius: 2, marginBottom: 3 },
  appTitle: { fontSize: 34, fontFamily: "Inter_700Bold", marginTop: 12, letterSpacing: -0.5 },
  appSubtitle: { fontSize: 15, fontFamily: "Inter_400Regular", marginTop: 4 },

  offlineCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  offlineCardBody: { flex: 1 },
  offlineCardTitle: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 3 },
  offlineCardDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },

  statsBar: { flexDirection: "row", borderRadius: 16, borderWidth: 1, marginBottom: 16, overflow: "hidden" },
  emptyStatsBar: {
    flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 16, borderWidth: 1,
    padding: 16, marginBottom: 16,
  },
  emptyStatsText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 16 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },
  statDivider: { width: 1 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, marginBottom: 12 },
  card: {
    flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, borderLeftWidth: 4,
    padding: 16, marginBottom: 12, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1,
    shadowRadius: 8, elevation: 3, gap: 14,
  },
  cardIconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 6 },
  bestRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  bestText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  newPill: {
    alignSelf: "flex-start", borderRadius: 6, borderWidth: 1,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  newPillText: { fontSize: 10, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.4 },
  cardRight: { flexDirection: "column", alignItems: "center", gap: 6 },
  offlinePill: {
    borderRadius: 8, borderWidth: 1,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  offlinePillText: { fontSize: 10, fontFamily: "Inter_700Bold" },

  dailyWrap: { marginBottom: 24 },
  dailyBanner: { flexDirection: "row", alignItems: "center", borderRadius: 18, borderWidth: 1, padding: 16, gap: 14 },
  dailyIconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  dailyBody: { flex: 1 },
  dailyLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 3 },
  dailyTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  dailyStreakRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  dailyStreakText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  dailyOfflineNote: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
});