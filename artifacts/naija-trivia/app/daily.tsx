import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { CATEGORIES } from "@/data/questions";
import {
  DAILY_QUESTION_COUNT,
  getLastNDates,
  getTodayDateString,
  getDailyQuestions,
} from "@/data/daily";
import { Question } from "@/data/questions";
import { useColors } from "@/hooks/useColors";

const TIMER_SECONDS = 20;
const CALENDAR_DAYS = 14;

type Phase = "intro" | "quiz" | "done";

export default function DailyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { daily, completeDailyChallenge, hasDailyBeenPlayed } = useGame();

  const today = getTodayDateString();
  const alreadyPlayed = hasDailyBeenPlayed(today);

  const [phase, setPhase] = useState<Phase>(alreadyPlayed ? "done" : "intro");
  const [questions] = useState<Question[]>(() => getDailyQuestions(today));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<"unanswered" | "correct" | "wrong">("unanswered");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardAnim = useRef(new Animated.Value(0)).current;
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

  const dates = getLastNDates(CALENDAR_DAYS);
  const currentQ = questions[currentIndex];

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    timerAnim.stopAnimation();
  }, [timerAnim]);

  const handleAnswer = useCallback((idx: number, timedOut = false) => {
    if (answerState !== "unanswered") return;
    stopTimer();
    const isCorrect = !timedOut && idx === currentQ.correctIndex;
    setSelectedIndex(timedOut ? -1 : idx);
    setAnswerState(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setScore((s) => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [answerState, currentQ, stopTimer]);

  const advanceQuestion = useCallback(async () => {
    const next = currentIndex + 1;
    if (next >= questions.length) {
      const finalScore = answerState === "correct" ? score : score;
      await completeDailyChallenge(today, finalScore, questions.length);
      setPhase("done");
    } else {
      setCurrentIndex(next);
      setSelectedIndex(null);
      setAnswerState("unanswered");
      setTimeLeft(TIMER_SECONDS);
      timerAnim.setValue(1);
      cardAnim.setValue(40);
      Animated.spring(cardAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
    }
  }, [currentIndex, questions.length, answerState, score, completeDailyChallenge, today, timerAnim, cardAnim]);

  useEffect(() => {
    if (answerState !== "unanswered") {
      const t = setTimeout(advanceQuestion, 1500);
      return () => clearTimeout(t);
    }
  }, [answerState, advanceQuestion]);

  useEffect(() => {
    if (phase !== "quiz" || answerState !== "unanswered") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { handleAnswer(-1, true); return 0; }
        return prev - 1;
      });
    }, 1000);
    Animated.timing(timerAnim, { toValue: 0, duration: TIMER_SECONDS * 1000, useNativeDriver: false }).start();
    return () => stopTimer();
  }, [currentIndex, phase, answerState, handleAnswer, stopTimer, timerAnim]);

  useEffect(() => {
    cardAnim.setValue(40);
    Animated.spring(cardAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
  }, [currentIndex, cardAnim]);

  const timerWidth = timerAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const timerColor = timeLeft > 10 ? colors.primary : timeLeft > 5 ? colors.accent : colors.wrong;

  // ─── TODAY'S RESULTS (ALREADY PLAYED) ─────────────────────
  const todayRecord = daily.history.find((r) => r.date === today);

  if (phase === "intro" || phase === "done") {
    const isDone = phase === "done";
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: topPad + 12, paddingBottom: botPad + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <Feather name="arrow-left" size={22} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Daily Challenge</Text>
            <View style={{ width: 22 }} />
          </View>

          {/* Streak Hero */}
          <StreakHero streak={daily.streak} longestStreak={daily.longestStreak} />

          {/* Today's result if done */}
          {isDone && todayRecord && (
            <View style={[styles.todayResult, { backgroundColor: colors.primary + "22", borderColor: colors.primary }]}>
              <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />
              <View style={styles.todayResultBody}>
                <Text style={[styles.todayResultTitle, { color: colors.foreground }]}>
                  Today completed!
                </Text>
                <Text style={[styles.todayResultScore, { color: colors.primary }]}>
                  {todayRecord.score}/{todayRecord.total} correct
                </Text>
              </View>
            </View>
          )}

          {/* Calendar */}
          <CalendarStrip dates={dates} history={daily.history} today={today} />

          {/* CTA */}
          {!isDone ? (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setPhase("quiz");
              }}
              style={({ pressed }) => [styles.startBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
            >
              <MaterialCommunityIcons name="lightning-bolt" size={20} color="#fff" />
              <Text style={styles.startBtnText}>Start Today's Challenge</Text>
            </Pressable>
          ) : (
            <View style={styles.doneNote}>
              <Feather name="clock" size={14} color={colors.mutedForeground} />
              <Text style={[styles.doneNoteText, { color: colors.mutedForeground }]}>
                Come back tomorrow for a new challenge
              </Text>
            </View>
          )}

          {/* Today's Questions Preview */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TODAY'S TOPICS</Text>
          {questions.map((q, i) => {
            const catInfo = CATEGORIES[q.category];
            return (
              <View key={q.id} style={[styles.questionPreview, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.qNumBadge, { backgroundColor: catInfo.color + "22" }]}>
                  <Text style={[styles.qNumText, { color: catInfo.color }]}>{i + 1}</Text>
                </View>
                <View style={styles.qPreviewBody}>
                  <Text style={[styles.qCatLabel, { color: catInfo.color }]}>{catInfo.label}</Text>
                  <Text style={[styles.qPreviewText, { color: isDone ? colors.foreground : colors.mutedForeground }]} numberOfLines={isDone ? undefined : 2}>
                    {isDone ? q.question : "???"}
                  </Text>
                </View>
                {isDone && (
                  <Feather
                    name={daily.history.find((r) => r.date === today)?.score !== undefined ? "check" : "minus"}
                    size={16}
                    color={colors.mutedForeground}
                  />
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // ─── QUIZ PHASE ────────────────────────────────────────────
  if (!currentQ) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 12, paddingBottom: botPad + 24 }]}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => { stopTimer(); setPhase("intro"); }} hitSlop={12} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <Feather name="x" size={22} color={colors.foreground} />
          </Pressable>
          <View style={styles.progressRow}>
            {questions.map((_, i) => (
              <View key={i} style={[styles.progressDot, { backgroundColor: i < currentIndex ? colors.primary : i === currentIndex ? colors.accent : colors.muted, transform: [{ scale: i === currentIndex ? 1.3 : 1 }] }]} />
            ))}
          </View>
          <View style={[styles.scoreBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.scoreText, { color: colors.primary }]}>{score}</Text>
          </View>
        </View>

        {/* Category badge */}
        <View style={[styles.catBadge, { backgroundColor: CATEGORIES[currentQ.category].color + "22" }]}>
          <Feather name={CATEGORIES[currentQ.category].icon as any} size={12} color={CATEGORIES[currentQ.category].color} />
          <Text style={[styles.catBadgeText, { color: CATEGORIES[currentQ.category].color }]}>
            {CATEGORIES[currentQ.category].label}
          </Text>
        </View>

        {/* Timer */}
        <View style={[styles.timerTrack, { backgroundColor: colors.muted }]}>
          <Animated.View style={[styles.timerFill, { width: timerWidth, backgroundColor: timerColor }]} />
        </View>
        <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>

        {/* Question */}
        <Animated.View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border, transform: [{ translateY: cardAnim }] }]}>
          <Text style={[styles.questionNum, { color: colors.mutedForeground }]}>
            Question {currentIndex + 1} of {questions.length}
          </Text>
          <Text style={[styles.questionText, { color: colors.foreground }]}>{currentQ.question}</Text>
        </Animated.View>

        {/* Options */}
        <View style={styles.options}>
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedIndex === idx;
            const isCorrect = idx === currentQ.correctIndex;
            let bg = colors.card;
            let border = colors.border;
            let textColor = colors.foreground;
            if (answerState !== "unanswered") {
              if (isCorrect) { bg = colors.correct + "22"; border = colors.correct; textColor = colors.correct; }
              else if (isSelected && !isCorrect) { bg = colors.wrong + "22"; border = colors.wrong; textColor = colors.wrong; }
            }
            return (
              <Pressable
                key={idx}
                onPress={() => handleAnswer(idx)}
                disabled={answerState !== "unanswered"}
                style={[styles.option, { backgroundColor: bg, borderColor: border }]}
              >
                <View style={[styles.optionLabel, { borderColor: border }]}>
                  <Text style={[styles.optionLabelText, { color: textColor }]}>
                    {answerState !== "unanswered" && isCorrect ? "✓" : answerState !== "unanswered" && isSelected && !isCorrect ? "✗" : String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Explanation */}
        {answerState !== "unanswered" && currentQ.explanation && (
          <View style={[styles.explanationBox, { backgroundColor: answerState === "correct" ? colors.correct + "15" : colors.wrong + "15", borderColor: answerState === "correct" ? colors.correct : colors.wrong }]}>
            <Feather name={answerState === "correct" ? "check-circle" : "info"} size={14} color={answerState === "correct" ? colors.correct : colors.wrong} />
            <Text style={[styles.explanationText, { color: answerState === "correct" ? colors.correct : colors.wrong }]}>{currentQ.explanation}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── SUB-COMPONENTS ────────────────────────────────────────

function StreakHero({ streak, longestStreak }: { streak: number; longestStreak: number }) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={[styles.streakHero, { backgroundColor: colors.card, borderColor: colors.border, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.streakMain}>
        <MaterialCommunityIcons name="fire" size={40} color={streak > 0 ? "#FF6B35" : colors.mutedForeground} />
        <View>
          <Text style={[styles.streakNumber, { color: streak > 0 ? "#FF6B35" : colors.foreground }]}>{streak}</Text>
          <Text style={[styles.streakLabel, { color: colors.mutedForeground }]}>
            {streak === 1 ? "day streak" : "day streak"}
          </Text>
        </View>
      </View>
      <View style={[styles.streakDivider, { backgroundColor: colors.border }]} />
      <View style={styles.streakBest}>
        <Text style={[styles.streakBestNum, { color: colors.accent }]}>{longestStreak}</Text>
        <Text style={[styles.streakBestLabel, { color: colors.mutedForeground }]}>Best</Text>
      </View>
    </Animated.View>
  );
}

function CalendarStrip({ dates, history, today }: {
  dates: string[];
  history: { date: string; completed: boolean; score: number; total: number }[];
  today: string;
}) {
  const colors = useColors();
  const historyMap = new Map(history.map((r) => [r.date, r]));
  const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <View style={[styles.calendar, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.calendarTitle, { color: colors.foreground }]}>Activity</Text>
      <View style={styles.calendarRow}>
        {[...dates].reverse().map((d) => {
          const record = historyMap.get(d);
          const isToday = d === today;
          const dayOfWeek = new Date(d + "T12:00:00").getDay();
          const dayNum = parseInt(d.split("-")[2], 10);
          const filled = record?.completed ?? false;
          const pct = record ? Math.round((record.score / record.total) * 100) : 0;
          const dotColor = filled ? (pct >= 80 ? colors.primary : pct >= 50 ? colors.accent : colors.wrong) : "transparent";

          return (
            <View key={d} style={styles.calDay}>
              <Text style={[styles.calDayLabel, { color: colors.mutedForeground }]}>{DAY_LABELS[dayOfWeek]}</Text>
              <View style={[
                styles.calDayCircle,
                {
                  backgroundColor: filled ? dotColor : "transparent",
                  borderColor: isToday ? colors.accent : filled ? dotColor : colors.border,
                  borderWidth: isToday ? 2 : 1,
                },
              ]}>
                <Text style={[styles.calDayNum, { color: filled ? "#fff" : isToday ? colors.accent : colors.mutedForeground }]}>
                  {dayNum}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.calendarLegend}>
        {[
          { color: colors.primary, label: "≥80%" },
          { color: colors.accent, label: "50–79%" },
          { color: colors.wrong, label: "<50%" },
        ].map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendText, { color: colors.mutedForeground }]}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  topBar: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 16 },
  headerTitle: { flex: 1, fontSize: 20, fontFamily: "Inter_700Bold" },
  // Streak hero
  streakHero: { flexDirection: "row", borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 16, alignItems: "center" },
  streakMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  streakNumber: { fontSize: 42, fontFamily: "Inter_700Bold", lineHeight: 44 },
  streakLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  streakDivider: { width: 1, height: 40, marginHorizontal: 16 },
  streakBest: { alignItems: "center" },
  streakBestNum: { fontSize: 24, fontFamily: "Inter_700Bold" },
  streakBestLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.6 },
  // Calendar
  calendar: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 20 },
  calendarTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 14 },
  calendarRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  calDay: { alignItems: "center", gap: 6 },
  calDayLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  calDayCircle: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  calDayNum: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  calendarLegend: { flexDirection: "row", gap: 14, justifyContent: "center" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  // Today result
  todayResult: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 16, gap: 12 },
  todayResultBody: { flex: 1 },
  todayResultTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  todayResultScore: { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 2 },
  // CTA
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 16, paddingVertical: 16, gap: 10, marginBottom: 24 },
  startBtnText: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: "#fff" },
  doneNote: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24 },
  doneNoteText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  // Section label
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, marginBottom: 10 },
  // Question preview
  questionPreview: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10, gap: 12 },
  qNumBadge: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  qNumText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  qPreviewBody: { flex: 1 },
  qCatLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  qPreviewText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  // Quiz
  progressRow: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  progressDot: { width: 8, height: 8, borderRadius: 4 },
  scoreBadge: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  scoreText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  timerTrack: { height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 6 },
  timerFill: { height: "100%", borderRadius: 3 },
  timerText: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 14 },
  catBadge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, gap: 5, marginBottom: 12 },
  catBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  questionCard: { borderRadius: 20, borderWidth: 1, padding: 22, marginBottom: 16 },
  questionNum: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 },
  questionText: { fontSize: 19, fontFamily: "Inter_600SemiBold", lineHeight: 28 },
  options: { gap: 10 },
  option: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 12 },
  optionLabel: { width: 32, height: 32, borderRadius: 10, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  optionLabelText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  optionText: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium", lineHeight: 21 },
  explanationBox: { flexDirection: "row", alignItems: "flex-start", borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 14, gap: 8 },
  explanationText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
});
