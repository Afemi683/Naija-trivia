import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LeaderboardEntry, useGame } from "@/context/GameContext";
import { CATEGORIES, Category } from "@/data/questions";
import { useColors } from "@/hooks/useColors";

const ALL = "all" as const;
type Filter = Category | typeof ALL;

const FILTERS: { key: Filter; label: string }[] = [
  { key: ALL, label: "All" },
  { key: "history", label: "History" },
  { key: "geography", label: "Geography" },
  { key: "current-affairs", label: "Affairs" },
];

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { leaderboard, clearLeaderboard } = useGame();
  const [filter, setFilter] = useState<Filter>(ALL);
  const isWeb = Platform.OS === "web";

  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

  const filtered =
    filter === ALL ? leaderboard : leaderboard.filter((e) => e.category === filter);

  const handleClear = () => {
    Alert.alert("Clear Leaderboard", "Remove all saved scores?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          clearLeaderboard();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, borderBottomColor: colors.border },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Leaderboard
        </Text>
        {leaderboard.length > 0 ? (
          <Pressable onPress={handleClear} hitSlop={12}>
            <Feather name="trash-2" size={20} color={colors.wrong} />
          </Pressable>
        ) : (
          <View style={{ width: 20 }} />
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => {
              Haptics.selectionAsync();
              setFilter(f.key);
            }}
            style={[
              styles.filterTab,
              {
                backgroundColor:
                  filter === f.key ? colors.primary : colors.card,
                borderColor: filter === f.key ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: filter === f.key ? "#fff" : colors.mutedForeground,
                },
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: botPad + 24 },
        ]}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="trophy-outline"
              size={52}
              color={colors.mutedForeground}
            />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No scores yet
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Play a quiz to see your results here
            </Text>
            <Pressable
              onPress={() => router.replace("/")}
              style={({ pressed }) => [
                styles.playBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={styles.playBtnText}>Play Now</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item, index }) => (
          <EntryRow entry={item} rank={index + 1} />
        )}
      />
    </View>
  );
}

function EntryRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const colors = useColors();
  const info = CATEGORIES[entry.category];
  const percentage = Math.round((entry.score / entry.totalQuestions) * 100);
  const date = new Date(entry.date);
  const dateStr = date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });

  const rankColor =
    rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : colors.mutedForeground;

  return (
    <View
      style={[
        styles.entryRow,
        {
          backgroundColor: colors.card,
          borderColor: rank <= 3 ? rankColor + "44" : colors.border,
          borderLeftColor: info.color,
        },
      ]}
    >
      <Text style={[styles.rankText, { color: rankColor }]}>
        {rank <= 3 ? ["1st", "2nd", "3rd"][rank - 1] : `#${rank}`}
      </Text>
      <View style={styles.entryBody}>
        <View style={styles.entryTop}>
          <View style={[styles.catDot, { backgroundColor: info.color + "22" }]}>
            <Feather name={info.icon as any} size={12} color={info.color} />
          </View>
          <Text style={[styles.catName, { color: info.color }]}>{info.label}</Text>
          <Text style={[styles.entryDate, { color: colors.mutedForeground }]}>
            {dateStr}
          </Text>
        </View>
        <View style={styles.entryBottom}>
          <Text style={[styles.entryScore, { color: colors.foreground }]}>
            {entry.score}/{entry.totalQuestions}
          </Text>
          <Text style={[styles.entryPercent, { color: colors.mutedForeground }]}>
            {percentage}%
          </Text>
          {entry.streak >= 3 && (
            <View style={styles.entryStreak}>
              <Feather name="zap" size={10} color={colors.accent} />
              <Text style={[styles.entryStreakText, { color: colors.accent }]}>
                {entry.streak}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 7,
    alignItems: "center",
  },
  filterText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  listContent: { paddingHorizontal: 20, gap: 10 },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  playBtn: {
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginTop: 8,
  },
  playBtnText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 14,
    gap: 14,
  },
  rankText: { width: 32, fontSize: 13, fontFamily: "Inter_700Bold", textAlign: "center" },
  entryBody: { flex: 1 },
  entryTop: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  catDot: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  catName: { fontSize: 12, fontFamily: "Inter_600SemiBold", flex: 1 },
  entryDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  entryBottom: { flexDirection: "row", alignItems: "center", gap: 8 },
  entryScore: { fontSize: 17, fontFamily: "Inter_700Bold" },
  entryPercent: { fontSize: 13, fontFamily: "Inter_400Regular" },
  entryStreak: { flexDirection: "row", alignItems: "center", gap: 2 },
  entryStreakText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
