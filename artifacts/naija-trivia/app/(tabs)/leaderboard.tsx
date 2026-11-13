import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { useNetwork } from "@/context/NetworkContext";
import { CATEGORIES, Category } from "@/data/questions";
import { useColors } from "@/hooks/useColors";
import { isSupabaseConfigured } from "@/lib/supabase";

const ALL = "all" as const;
type Filter = Category | typeof ALL;

const FILTERS: { key: Filter; label: string }[] = [
  { key: ALL, label: "All" },
  { key: "history", label: "History" },
  { key: "geography", label: "Geography" },
  { key: "current-affairs", label: "Affairs" },
];

const TAB_BAR_H = Platform.OS === "ios" ? 88 : 68;

function EntryRow({
  entry,
  rank,
  username,
}: {
  entry: LeaderboardEntry;
  rank: number;
  username?: string;
}) {
  const colors = useColors();
  const info = CATEGORIES[entry.category] ?? CATEGORIES.history;
  const percentage = Math.round((entry.score / entry.totalQuestions) * 100);
  const date = new Date(entry.date);
  const dateStr = date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });

  const isTop3 = rank <= 3;
  const medalColor =
    rank === 1 ? "#F59E0B" : rank === 2 ? "#94A3B8" : rank === 3 ? "#CD7F32" : colors.mutedForeground;

  return (
    <View
      style={[
        styles.entryRow,
        {
          backgroundColor: colors.card,
          borderColor: isTop3 ? medalColor + "55" : colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.rankBadge,
          {
            backgroundColor: isTop3 ? medalColor + "18" : colors.muted,
          },
        ]}
      >
        {rank === 1 ? (
          <MaterialCommunityIcons name="trophy" size={16} color={medalColor} />
        ) : rank === 2 ? (
          <MaterialCommunityIcons name="medal" size={16} color={medalColor} />
        ) : rank === 3 ? (
          <MaterialCommunityIcons name="medal-outline" size={16} color={medalColor} />
        ) : (
          <Text style={[styles.rankNumber, { color: colors.mutedForeground }]}>{rank}</Text>
        )}
      </View>

      <View style={styles.entryBody}>
        <View style={styles.entryTop}>
          <View style={[styles.catIconMini, { backgroundColor: info.color + "18" }]}>
            <Feather name={info.icon as any} size={11} color={info.color} />
          </View>
          <Text style={[styles.catName, { color: colors.foreground }]}>
            {username ? `${username} · ${info.label}` : info.label}
          </Text>
          <Text style={[styles.entryDate, { color: colors.mutedForeground }]}>{dateStr}</Text>
        </View>

        <View style={styles.entryScoreRow}>
          <Text style={[styles.scoreText, { color: colors.foreground }]}>
            {entry.score}
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              /{entry.totalQuestions}
            </Text>
          </Text>

          <View style={[styles.percentBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.percentText, { color: colors.primary }]}>{percentage}%</Text>
          </View>

          {entry.streak >= 2 && (
            <View style={[styles.streakBadge, { backgroundColor: colors.accentLight }]}>
              <MaterialCommunityIcons name="fire" size={11} color={colors.accent} />
              <Text style={[styles.streakBadgeText, { color: colors.accent }]}>
                {entry.streak}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { leaderboard, clearLeaderboard, fetchCloudLeaderboard } = useGame();
  const { isOnline } = useNetwork();
  const [filter, setFilter] = useState<Filter>(ALL);
  const [scope, setScope] = useState<"local" | "cloud">("local");
  const [cloudScores, setCloudScores] = useState<any[]>([]);
  const [loadingCloud, setLoadingCloud] = useState(false);
  const isWeb = Platform.OS === "web";

  const topPad = isWeb ? 36 : insets.top;
  const botPad = (isWeb ? 34 : insets.bottom) + TAB_BAR_H;

  useEffect(() => {
    if (scope === "cloud" && isSupabaseConfigured && isOnline) {
      setLoadingCloud(true);
      fetchCloudLeaderboard(filter).then((scores) => {
        setCloudScores(scores);
        setLoadingCloud(false);
      });
    }
  }, [scope, filter, isOnline]);

  const filteredLocal =
    filter === ALL ? leaderboard : leaderboard.filter((e) => e.category === filter);

  const displayedList = scope === "local" ? filteredLocal : cloudScores;

  const handleClear = () => {
    Alert.alert("Clear History", "Are you sure you want to remove your local scores?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
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
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: topPad + 14 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Leaderboard</Text>
          <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
            Top rankings & quiz milestones
          </Text>
        </View>

        {scope === "local" && leaderboard.length > 0 && (
          <Pressable
            onPress={handleClear}
            hitSlop={12}
            style={[styles.trashBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="trash-2" size={16} color={colors.destructive} />
          </Pressable>
        )}
      </View>

      {/* Scope Segment (Local vs Supabase Cloud) */}
      {isSupabaseConfigured && (
        <View style={styles.scopeWrapper}>
          <View style={[styles.scopeSegment, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setScope("local");
              }}
              style={[
                styles.scopeBtn,
                scope === "local" && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.scopeBtnText,
                  { color: scope === "local" ? "#FFFFFF" : colors.mutedForeground },
                ]}
              >
                My Scores
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setScope("cloud");
              }}
              style={[
                styles.scopeBtn,
                scope === "cloud" && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.scopeBtnText,
                  { color: scope === "cloud" ? "#FFFFFF" : colors.mutedForeground },
                ]}
              >
                Global (Supabase)
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const isActive = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => {
                Haptics.selectionAsync();
                setFilter(f.key);
              }}
              style={[
                styles.filterTab,
                {
                  backgroundColor: isActive ? colors.primary : colors.card,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isActive ? "#FFFFFF" : colors.mutedForeground },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* List */}
      {loadingCloud ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Loading Supabase rankings...
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedList}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.listContent, { paddingBottom: botPad + 16 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <MaterialCommunityIcons name="trophy-outline" size={44} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {scope === "cloud" ? "No global records yet" : "No scores recorded yet"}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
                {scope === "cloud"
                  ? "Be the first to record a score to the Supabase global board!"
                  : "Complete a quiz in any category to see your ranking and statistics here."}
              </Text>
              <Pressable
                onPress={() => router.navigate("/")}
                style={({ pressed }) => [
                  styles.playNowBtn,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Feather name="play" size={16} color="#FFFFFF" />
                <Text style={styles.playNowText}>Start a Quiz</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item, index }) => (
            <EntryRow
              entry={{
                id: String(item.id),
                category: item.category,
                score: item.score,
                totalQuestions: item.total_questions ?? item.totalQuestions ?? 10,
                streak: item.streak ?? 0,
                timeMs: item.time_ms ?? item.timeMs ?? 0,
                date: item.created_at ?? item.date ?? new Date().toISOString(),
              }}
              rank={index + 1}
              username={item.profiles?.username || item.profiles?.full_name}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  trashBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  scopeWrapper: { paddingHorizontal: 20, marginBottom: 12 },
  scopeSegment: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
  },
  scopeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  scopeBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 9,
    alignItems: "center",
  },
  filterText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  listContent: { paddingHorizontal: 20, gap: 10 },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  rankBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNumber: { fontSize: 14, fontFamily: "Inter_700Bold" },

  entryBody: { flex: 1 },
  entryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  catIconMini: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  catName: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1 },
  entryDate: { fontSize: 11, fontFamily: "Inter_400Regular" },

  entryScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreText: { fontSize: 17, fontFamily: "Inter_700Bold" },
  percentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  percentText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  streakBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 40 },
  loadingText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptyDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 19,
  },
  playNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 12,
    marginTop: 10,
    gap: 6,
  },
  playNowText: { color: "#FFFFFF", fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
