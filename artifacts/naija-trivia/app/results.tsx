import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
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
import { CATEGORIES, Category } from "@/data/questions";
import { useColors } from "@/hooks/useColors";

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIconWrap, { backgroundColor: color + "18" }]}>{icon}</View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export default function ResultsScreen() {
  const params = useLocalSearchParams<{
    category: Category;
    score: string;
    totalQuestions: string;
    streak: string;
    timeMs: string;
    finalScore: string;
  }>();

  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addEntry } = useGame();
  const saved = useRef(false);
  const isWeb = Platform.OS === "web";

  const category = (params.category ?? "history") as Category;
  const score = parseInt(params.score ?? params.finalScore ?? "0", 10);
  const totalQuestions = parseInt(params.totalQuestions ?? "10", 10);
  const streak = parseInt(params.streak ?? "0", 10);
  const timeMs = parseInt(params.timeMs ?? "0", 10);
  const percentage = Math.round((score / totalQuestions) * 100);

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!saved.current) {
      saved.current = true;
      addEntry({
        category,
        score,
        totalQuestions,
        streak,
        date: new Date().toISOString(),
        timeMs,
      });
    }

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    if (percentage >= 70) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const info = CATEGORIES[category] ?? CATEGORIES.history;
  const timeSec = Math.round(timeMs / 1000);
  const topPad = isWeb ? 24 : insets.top;
  const botPad = isWeb ? 24 : insets.bottom;

  const grade =
    percentage === 100
      ? { emoji: "🏆", label: "Masterful!", color: "#FFD700" }
      : percentage >= 80
      ? { emoji: "🌟", label: "Outstanding!", color: colors.primary }
      : percentage >= 60
      ? { emoji: "👏", label: "Well Done!", color: colors.accent }
      : percentage >= 40
      ? { emoji: "📖", label: "Good Effort!", color: "#8B5CF6" }
      : { emoji: "💪", label: "Keep Practicing!", color: colors.wrong };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: botPad + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Pill */}
        <View style={styles.header}>
          <View
            style={[
              styles.catBadge,
              { backgroundColor: info.color + "18", borderColor: info.color + "33" },
            ]}
          >
            <Feather name={info.icon as any} size={14} color={info.color} />
            <Text style={[styles.catBadgeText, { color: info.color }]}>{info.label} Quiz</Text>
          </View>
        </View>

        {/* Score Circle Hero */}
        <Animated.View
          style={[
            styles.heroRing,
            {
              backgroundColor: colors.card,
              borderColor: grade.color,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.emojiText}>{grade.emoji}</Text>
          <Text style={[styles.scoreNumber, { color: grade.color }]}>
            {score}
            <Text style={[styles.scoreDenom, { color: colors.mutedForeground }]}>
              /{totalQuestions}
            </Text>
          </Text>
          <Text style={[styles.percentageText, { color: colors.mutedForeground }]}>
            {percentage}% Accuracy
          </Text>
        </Animated.View>

        <Text style={[styles.gradeHeading, { color: colors.foreground }]}>
          {grade.label}
        </Text>
        <Text style={[styles.gradeSubtext, { color: colors.mutedForeground }]}>
          {percentage >= 70
            ? "Impressive Naija trivia knowledge! Keep up the momentum."
            : "Every round makes you wiser. Try again to beat your record!"}
        </Text>

        {/* Stats 3-Column Grid */}
        <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
          <StatCard
            icon={<MaterialCommunityIcons name="fire" size={20} color="#FF6B35" />}
            label="Best Streak"
            value={String(streak)}
            color="#FF6B35"
          />
          <StatCard
            icon={<Feather name="clock" size={18} color={colors.accent} />}
            label="Time"
            value={`${timeSec}s`}
            color={colors.accent}
          />
          <StatCard
            icon={<Feather name="percent" size={18} color={colors.primary} />}
            label="Score Rate"
            value={`${percentage}%`}
            color={colors.primary}
          />
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.replace({ pathname: "/quiz", params: { category } });
            }}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Feather name="rotate-ccw" size={18} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Play Again</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.replace("/(tabs)");
            }}
            style={({ pressed }) => [
              styles.secondaryBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Feather name="home" size={18} color={colors.foreground} />
            <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>
              Back to Home
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, alignItems: "center" },
  header: { marginBottom: 16 },
  catBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  catBadgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  heroRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 14,
    shadowColor: "rgba(0,0,0,0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  emojiText: { fontSize: 32, marginBottom: 4 },
  scoreNumber: { fontSize: 36, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  scoreDenom: { fontSize: 20, fontFamily: "Inter_500Medium" },
  percentageText: { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 2 },

  gradeHeading: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    textAlign: "center",
    marginTop: 8,
  },
  gradeSubtext: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 6,
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  statsGrid: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 17, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },

  actionRow: { width: "100%", gap: 12 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    minHeight: 54,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    minHeight: 54,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
