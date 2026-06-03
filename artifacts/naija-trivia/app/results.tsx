import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGame } from "@/context/GameContext";
import { CATEGORIES, Category } from "@/data/questions";
import { useColors } from "@/hooks/useColors";

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

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!saved.current) {
      saved.current = true;
      addEntry({ category, score, totalQuestions, streak, date: new Date().toISOString(), timeMs });
    }
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    if (percentage >= 70) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const info = CATEGORIES[category];
  const timeSec = Math.round(timeMs / 1000);
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

  const grade =
    percentage === 100
      ? { emoji: "🏆", label: "Perfect!", color: "#FFD700" }
      : percentage >= 80
      ? { emoji: "⭐", label: "Excellent!", color: colors.primary }
      : percentage >= 60
      ? { emoji: "👍", label: "Well done!", color: colors.accent }
      : percentage >= 40
      ? { emoji: "📚", label: "Keep learning!", color: "#8B5CF6" }
      : { emoji: "🔄", label: "Try again!", color: colors.wrong };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: topPad + 12, paddingBottom: botPad + 24 },
      ]}
    >
      {/* Category badge */}
      <Animated.View
        style={[
          styles.catBadge,
          {
            backgroundColor: info.color + "22",
            borderColor: info.color + "44",
            opacity: fadeAnim,
          },
        ]}
      >
        <Feather name={info.icon as any} size={14} color={info.color} />
        <Text style={[styles.catBadgeText, { color: info.color }]}>{info.label}</Text>
      </Animated.View>

      {/* Score Ring */}
      <Animated.View
        style={[styles.scoreRing, { borderColor: grade.color, transform: [{ scale: scaleAnim }] }]}
      >
        <Text style={[styles.scoreMain, { color: grade.color }]}>{score}</Text>
        <Text style={[styles.scoreDenom, { color: colors.mutedForeground }]}>
          / {totalQuestions}
        </Text>
        <Text style={[styles.scorePercent, { color: colors.mutedForeground }]}>
          {percentage}%
        </Text>
      </Animated.View>

      <Text style={[styles.gradeLabel, { color: colors.foreground }]}>
        {grade.label}
      </Text>

      {/* Stats Grid */}
      <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
        <StatBox
          icon="zap"
          label="Best Streak"
          value={String(streak)}
          color="#8B5CF6"
          bg={colors.card}
          border={colors.border}
        />
        <StatBox
          icon="clock"
          label="Time"
          value={`${timeSec}s`}
          color={colors.accent}
          bg={colors.card}
          border={colors.border}
        />
        <StatBox
          icon="check-circle"
          label="Correct"
          value={String(score)}
          color={colors.correct}
          bg={colors.card}
          border={colors.border}
        />
        <StatBox
          icon="x-circle"
          label="Wrong"
          value={String(totalQuestions - score)}
          color={colors.wrong}
          bg={colors.card}
          border={colors.border}
        />
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.replace({ pathname: "/quiz", params: { category } });
          }}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Feather name="refresh-cw" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Play Again</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.replace("/");
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
            Home
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/leaderboard");
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
          <MaterialCommunityIcons name="trophy-outline" size={18} color={colors.accent} />
          <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>
            Leaderboard
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function StatBox({
  icon,
  label,
  value,
  color,
  bg,
  border,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  bg: string;
  border: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.statBox, { backgroundColor: bg, borderColor: border }]}>
      <Feather name={icon as any} size={20} color={color} />
      <Text style={[styles.statBoxValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statBoxLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  catBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 28,
  },
  catBadgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  scoreRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  scoreMain: { fontSize: 52, fontFamily: "Inter_700Bold", lineHeight: 56 },
  scoreDenom: { fontSize: 18, fontFamily: "Inter_500Medium" },
  scorePercent: { fontSize: 15, fontFamily: "Inter_400Regular", marginTop: 2 },
  gradeLabel: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 28,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
    justifyContent: "center",
  },
  statBox: {
    width: "45%",
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    paddingVertical: 16,
    gap: 6,
  },
  statBoxValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statBoxLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  actions: { width: "100%", gap: 10 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
  },
  primaryBtnText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    gap: 10,
  },
  secondaryBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
