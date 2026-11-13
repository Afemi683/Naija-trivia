import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNetwork } from "@/context/NetworkContext";
import { getOfflineQuestions } from "@/data/offline-questions";
import { Category, Question, getRandomQuestions, CATEGORIES } from "@/data/questions";
import { useColors } from "@/hooks/useColors";

const QUESTION_COUNT = 10;
const TIMER_SECONDS = 15;

type AnswerState = "unanswered" | "correct" | "wrong";

function OptionButton({
  label,
  text,
  state,
  disabled,
  onPress,
}: {
  label: string;
  text: string;
  state: "default" | "correct" | "wrong" | "dimmed";
  disabled: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  let bg = colors.card;
  let borderColor = colors.border;
  let textColor = colors.foreground;
  let badgeBg = colors.muted;
  let badgeText = colors.mutedForeground;
  let badgeContent = label;

  if (state === "correct") {
    bg = colors.correct + "1A";
    borderColor = colors.correct;
    textColor = colors.correct;
    badgeBg = colors.correct;
    badgeText = "#FFFFFF";
    badgeContent = "✓";
  } else if (state === "wrong") {
    bg = colors.wrong + "1A";
    borderColor = colors.wrong;
    textColor = colors.wrong;
    badgeBg = colors.wrong;
    badgeText = "#FFFFFF";
    badgeContent = "✕";
  } else if (state === "dimmed") {
    bg = colors.card;
    borderColor = colors.border;
    textColor = colors.mutedForeground;
    badgeBg = colors.muted;
    badgeText = colors.mutedForeground;
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        style={[
          styles.optionBtn,
          {
            backgroundColor: bg,
            borderColor,
          },
        ]}
      >
        <View style={[styles.optionBadge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.optionBadgeText, { color: badgeText }]}>{badgeContent}</Text>
        </View>
        <Text style={[styles.optionText, { color: textColor }]}>{text}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function QuizScreen() {
  const { category } = useLocalSearchParams<{ category: Category }>();
  const { isOnline } = useNetwork();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const cat: Category = (category as Category) ?? "history";
  const catInfo = CATEGORIES[cat] ?? CATEGORIES.history;

  const [questions] = useState<Question[]>(() =>
    isOnline ? getRandomQuestions(cat, QUESTION_COUNT) : getOfflineQuestions(cat)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [startTime] = useState(Date.now());

  const timerAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = questions[currentIndex];

  const animateCardIn = useCallback(() => {
    cardAnim.setValue(30);
    Animated.spring(cardAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 70,
      friction: 9,
    }).start();
  }, [cardAnim]);

  useEffect(() => {
    animateCardIn();
  }, [currentIndex, animateCardIn]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerAnim.stopAnimation();
  }, [timerAnim]);

  const handleAnswer = useCallback(
    (idx: number, timedOut = false) => {
      if (answerState !== "unanswered") return;
      stopTimer();

      const isCorrect = !timedOut && idx === currentQuestion.correctIndex;
      setSelectedIndex(timedOut ? -1 : idx);
      setAnswerState(isCorrect ? "correct" : "wrong");

      if (isCorrect) {
        setScore((s) => s + 1);
        const newStreak = streak + 1;
        setStreak(newStreak);
        setMaxStreak((ms) => Math.max(ms, newStreak));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setStreak(0);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [answerState, currentQuestion, stopTimer, streak]
  );

  const advanceQuestion = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      const elapsed = Date.now() - startTime;
      router.replace({
        pathname: "/results",
        params: {
          category: cat,
          score: String(score),
          finalScore: String(score),
          totalQuestions: String(questions.length),
          streak: String(maxStreak),
          timeMs: String(elapsed),
          offlineMode: isOnline ? "0" : "1",
        },
      });
    } else {
      setCurrentIndex(nextIndex);
      setSelectedIndex(null);
      setAnswerState("unanswered");
      setTimeLeft(TIMER_SECONDS);
      timerAnim.setValue(1);
    }
  }, [currentIndex, questions.length, score, maxStreak, cat, startTime, timerAnim, isOnline]);

  useEffect(() => {
    if (answerState !== "unanswered") {
      const t = setTimeout(advanceQuestion, 1600);
      return () => clearTimeout(t);
    }
  }, [answerState, advanceQuestion]);

  useEffect(() => {
    if (answerState !== "unanswered") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(-1, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    Animated.timing(timerAnim, {
      toValue: 0,
      duration: TIMER_SECONDS * 1000,
      useNativeDriver: false,
    }).start();

    return () => stopTimer();
  }, [currentIndex, answerState, handleAnswer, stopTimer, timerAnim]);

  const handleQuitConfirm = () => {
    Alert.alert("Exit Quiz?", "Your progress in this quiz will not be saved.", [
      { text: "Keep Playing", style: "cancel" },
      {
        text: "Exit",
        style: "destructive",
        onPress: () => {
          stopTimer();
          router.back();
        },
      },
    ]);
  };

  const timerWidth = timerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const timerColor =
    timeLeft > 7 ? colors.primary : timeLeft > 3 ? colors.accent : colors.wrong;

  const topPad = isWeb ? 24 : insets.top;
  const botPad = isWeb ? 24 : insets.bottom;

  if (!currentQuestion) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 12, paddingBottom: botPad + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Bar */}
        <View style={styles.topNav}>
          <Pressable
            onPress={handleQuitConfirm}
            hitSlop={12}
            style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="x" size={20} color={colors.foreground} />
          </Pressable>

          <View style={[styles.categoryPill, { backgroundColor: catInfo.color + "18", borderColor: catInfo.color + "33" }]}>
            <Feather name={catInfo.icon as any} size={13} color={catInfo.color} />
            <Text style={[styles.categoryPillText, { color: catInfo.color }]}>{catInfo.label}</Text>
          </View>

          <View style={[styles.scoreChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="award" size={13} color={colors.primary} />
            <Text style={[styles.scoreChipText, { color: colors.foreground }]}>{score}</Text>
          </View>
        </View>

        {/* Progress HUD */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabels}>
            <Text style={[styles.questionCounter, { color: colors.foreground }]}>
              Question <Text style={{ color: colors.primary }}>{currentIndex + 1}</Text> of {questions.length}
            </Text>
            <View style={styles.timerRightRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color={timerColor}
              />
              <Text style={[styles.timerSecText, { color: timerColor }]}>
                {timeLeft}s
              </Text>
            </View>
          </View>

          <View style={[styles.progressBarTrack, { backgroundColor: colors.muted }]}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: timerWidth, backgroundColor: timerColor },
              ]}
            />
          </View>

          {streak >= 2 && (
            <View style={styles.streakIndicatorRow}>
              <View style={[styles.streakIndicator, { backgroundColor: colors.accentLight }]}>
                <MaterialCommunityIcons name="fire" size={14} color={colors.accent} />
                <Text style={[styles.streakIndicatorText, { color: colors.accent }]}>
                  {streak} streak!
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Question Card */}
        <Animated.View
          style={[
            styles.questionCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              transform: [{ translateY: cardAnim }],
            },
          ]}
        >
          <Text style={[styles.questionText, { color: colors.foreground }]}>
            {currentQuestion.question}
          </Text>
        </Animated.View>

        {/* Answer Options */}
        <View style={styles.optionsList}>
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedIndex === idx;
            const isCorrect = idx === currentQuestion.correctIndex;

            let state: "default" | "correct" | "wrong" | "dimmed" = "default";
            if (answerState !== "unanswered") {
              if (isCorrect) {
                state = "correct";
              } else if (isSelected) {
                state = "wrong";
              } else {
                state = "dimmed";
              }
            }

            return (
              <OptionButton
                key={idx}
                label={String.fromCharCode(65 + idx)}
                text={option}
                state={state}
                disabled={answerState !== "unanswered"}
                onPress={() => handleAnswer(idx)}
              />
            );
          })}
        </View>

        {/* Explanation Card */}
        {answerState !== "unanswered" && currentQuestion.explanation && (
          <View
            style={[
              styles.explanationCard,
              {
                backgroundColor:
                  answerState === "correct" ? colors.correct + "15" : colors.wrong + "15",
                borderColor:
                  answerState === "correct" ? colors.correct : colors.wrong,
              },
            ]}
          >
            <View style={styles.explanationHeader}>
              <Feather
                name={answerState === "correct" ? "check-circle" : "info"}
                size={16}
                color={answerState === "correct" ? colors.correct : colors.wrong}
              />
              <Text
                style={[
                  styles.explanationTitle,
                  { color: answerState === "correct" ? colors.correct : colors.wrong },
                ]}
              >
                {answerState === "correct" ? "Correct!" : "Did you know?"}
              </Text>
            </View>
            <Text
              style={[
                styles.explanationBody,
                { color: colors.foreground },
              ]}
            >
              {currentQuestion.explanation}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  categoryPillText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  scoreChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  scoreChipText: { fontSize: 14, fontFamily: "Inter_700Bold" },

  progressContainer: { marginBottom: 20 },
  progressLabels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  questionCounter: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  timerRightRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  timerSecText: { fontSize: 13, fontFamily: "Inter_700Bold" },

  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  streakIndicatorRow: { marginTop: 8, flexDirection: "row" },
  streakIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  streakIndicatorText: { fontSize: 11, fontFamily: "Inter_700Bold" },

  questionCard: {
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 26,
  },

  optionsList: { gap: 12, marginBottom: 16 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 14,
    minHeight: 58,
  },
  optionBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  optionBadgeText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  optionText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    flex: 1,
    lineHeight: 21,
  },

  explanationCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  explanationTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  explanationBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
});
