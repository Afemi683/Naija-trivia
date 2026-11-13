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

import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { useNetwork } from "@/context/NetworkContext";
import { getTodayDateString } from "@/data/daily";
import { CATEGORIES, Category } from "@/data/questions";
import { useColors } from "@/hooks/useColors";

const CATEGORY_ORDER: Category[] = ["history", "geography", "current-affairs"];
const TAB_BAR_H = Platform.OS === "ios" ? 88 : 68;
const OFFLINE_QUESTION_COUNT = 10;

function StatBox({
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
    <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIconWrap, { backgroundColor: color + "18" }]}>{icon}</View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      </View>
    </View>
  );
}

function StatsSection() {
  const colors = useColors();
  const { leaderboard } = useGame();
  const totalGames = leaderboard.length;
  const totalScore = leaderboard.reduce((s, e) => s + e.score, 0);
  const totalQ = leaderboard.reduce((s, e) => s + e.totalQuestions, 0);
  const accuracy = totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0;
  const bestStreak = leaderboard.reduce((s, e) => Math.max(s, e.streak), 0);

  if (totalGames === 0) {
    return (
      <View style={[styles.emptyStatsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.emptyStatsIcon, { backgroundColor: colors.primaryLight }]}>
          <Feather name="award" size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.emptyStatsTitle, { color: colors.foreground }]}>Start Your Journey</Text>
          <Text style={[styles.emptyStatsSub, { color: colors.mutedForeground }]}>
            Play a quiz to unlock stats, streaks, and leaderboards!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.statsRow}>
      <StatBox
        label="Quizzes"
        value={String(totalGames)}
        icon={<Feather name="check-circle" size={18} color={colors.primary} />}
        color={colors.primary}
      />
      <StatBox
        label="Accuracy"
        value={`${accuracy}%`}
        icon={<Feather name="target" size={18} color={colors.accent} />}
        color={colors.accent}
      />
      <StatBox
        label="Best Streak"
        value={String(bestStreak)}
        icon={<MaterialCommunityIcons name="fire" size={20} color="#FF6B35" />}
        color="#FF6B35"
      />
    </View>
  );
}

function DailyBanner() {
  const colors = useColors();
  const { isOnline } = useNetwork();
  const { daily, hasDailyBeenPlayed } = useGame();
  const today = getTodayDateString();
  const played = hasDailyBeenPlayed(today);
  const todayRecord = daily.history.find((r) => r.date === today);
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[styles.dailyWrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/daily");
        }}
        onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        style={[
          styles.dailyCard,
          played
            ? { backgroundColor: colors.card, borderColor: colors.border }
            : { backgroundColor: colors.primary, borderColor: colors.primary },
        ]}
      >
        <View
          style={[
            styles.dailyBadge,
            { backgroundColor: played ? colors.primaryLight : "rgba(255, 255, 255, 0.2)" },
          ]}
        >
          <MaterialCommunityIcons
            name={played ? "check-decagram" : "lightning-bolt"}
            size={24}
            color={played ? colors.primary : "#FFFFFF"}
          />
        </View>

        <View style={styles.dailyInfo}>
          <View style={styles.dailyHeaderRow}>
            <Text
              style={[
                styles.dailyTag,
                { color: played ? colors.primary : "rgba(255, 255, 255, 0.9)" },
              ]}
            >
              DAILY CHALLENGE
            </Text>
            {daily.streak > 0 && (
              <View
                style={[
                  styles.streakPill,
                  { backgroundColor: played ? colors.accentLight : "rgba(255, 255, 255, 0.2)" },
                ]}
              >
                <MaterialCommunityIcons
                  name="fire"
                  size={12}
                  color={played ? colors.accent : "#FFFFFF"}
                />
                <Text
                  style={[
                    styles.streakPillText,
                    { color: played ? colors.accent : "#FFFFFF" },
                  ]}
                >
                  {daily.streak}d streak
                </Text>
              </View>
            )}
          </View>

          <Text
            style={[
              styles.dailyTitle,
              { color: played ? colors.foreground : "#FFFFFF" },
            ]}
          >
            {played
              ? `Completed! ${todayRecord?.score ?? 0}/${todayRecord?.total ?? 20} correct`
              : "20 Questions · Multi-Category"}
          </Text>

          <Text
            style={[
              styles.dailySub,
              { color: played ? colors.mutedForeground : "rgba(255, 255, 255, 0.8)" },
            ]}
          >
            {played ? "Tap to view today's breakdown" : "Boost your streak & climb the ranks"}
          </Text>
        </View>

        <View
          style={[
            styles.dailyActionCircle,
            { backgroundColor: played ? colors.muted : "rgba(255, 255, 255, 0.25)" },
          ]}
        >
          <Feather
            name={played ? "eye" : "arrow-right"}
            size={18}
            color={played ? colors.foreground : "#FFFFFF"}
          />
        </View>
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
    <Animated.View style={[styles.catCardWrap, { transform: [{ scale }] }]}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push({ pathname: "/quiz", params: { category } });
        }}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        style={[
          styles.catCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[styles.catIconWrap, { backgroundColor: info.color + "18" }]}>
          <Feather name={info.icon as any} size={24} color={info.color} />
        </View>

        <View style={styles.catContent}>
          <View style={styles.catTitleRow}>
            <Text style={[styles.catTitle, { color: colors.foreground }]}>{info.label}</Text>
            {best && (
              <View style={[styles.bestBadge, { backgroundColor: colors.accentLight }]}>
                <Feather name="award" size={11} color={colors.accent} />
                <Text style={[styles.bestBadgeText, { color: colors.accent }]}>
                  {best.score}/{best.totalQuestions}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.catDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
            {info.description}
          </Text>

          <View style={styles.catMetaRow}>
            <View style={[styles.metaChip, { backgroundColor: colors.muted }]}>
              <Feather name="help-circle" size={11} color={colors.mutedForeground} />
              <Text style={[styles.metaChipText, { color: colors.mutedForeground }]}>
                {isOnline ? "10 Questions" : `${OFFLINE_QUESTION_COUNT} Questions`}
              </Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: colors.muted }]}>
              <Feather name="clock" size={11} color={colors.mutedForeground} />
              <Text style={[styles.metaChipText, { color: colors.mutedForeground }]}>
                15s / Q
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.catArrow, { backgroundColor: colors.muted }]}>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, isGuest } = useAuth();
  const { isOnline } = useNetwork();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 36 : insets.top;
  const botPad = (isWeb ? 34 : insets.bottom) + TAB_BAR_H;

  const greetingName = user?.name ? user.name.split(" ")[0] : isGuest ? "Guest" : "Explorer";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPad + 16, paddingBottom: botPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTop}>
            <View style={[styles.flagPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.flagBar, { backgroundColor: "#008751" }]} />
              <View style={[styles.flagBar, { backgroundColor: "#FFFFFF" }]} />
              <View style={[styles.flagBar, { backgroundColor: "#008751" }]} />
              <Text style={[styles.flagText, { color: colors.foreground }]}>Naija Trivia</Text>
            </View>

            <View style={[styles.statusPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? colors.correct : colors.destructive },
                ]}
              />
              <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>
          </View>

          <Text style={[styles.greeting, { color: colors.foreground }]}>
            Kedu, {greetingName}! 🇳🇬
          </Text>
          <Text style={[styles.greetingSub, { color: colors.mutedForeground }]}>
            How well do you know Nigeria today? Pick a challenge below.
          </Text>
        </View>

        {/* Quick Stats HUD */}
        <StatsSection />

        {/* Daily Challenge Spotlight */}
        <DailyBanner />

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Categories</Text>
          <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>
            3 topics available
          </Text>
        </View>

        <View style={styles.catList}>
          {CATEGORY_ORDER.map((cat) => (
            <CategoryCard key={cat} category={cat} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  heroHeader: { marginBottom: 20 },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  flagPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 3,
  },
  flagBar: { width: 5, height: 12, borderRadius: 1.5 },
  flagText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    marginLeft: 4,
    letterSpacing: -0.2,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  greeting: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  greetingSub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statContent: { flex: 1 },
  statValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },

  emptyStatsCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 20,
  },
  emptyStatsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStatsTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  emptyStatsSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  dailyWrapper: { marginBottom: 24 },
  dailyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
  },
  dailyBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dailyInfo: { flex: 1 },
  dailyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  dailyTag: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  streakPillText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  dailyTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 2 },
  dailySub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  dailyActionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  sectionCount: { fontSize: 12, fontFamily: "Inter_500Medium" },

  catList: { gap: 12 },
  catCardWrap: { width: "100%" },
  catCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  catIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  catContent: { flex: 1 },
  catTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  catTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  bestBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  bestBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  catDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 8 },
  catMetaRow: { flexDirection: "row", gap: 8 },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  metaChipText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  catArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
