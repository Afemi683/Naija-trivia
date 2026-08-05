import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
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

import { useNetwork } from "@/context/NetworkContext";
import { getOfflineQuestions } from "@/data/offline-questions";
import { Category, Question, getRandomQuestions } from "@/data/questions";
import { useColors } from "@/hooks/useColors";

const QUESTION_COUNT = 10;
const TIMER_SECONDS = 15;

type AnswerState = "unanswered" | "correct" | "wrong";

export default function QuizScreen() {
  const { category } = useLocalSearchParams<{ category: Category }>();
  const { isOnline } = useNetwork();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const cat = category ?? "history";

  // Online: full random pool (200 questions). Offline: fixed 10-question bank.
  const [questions] = useState<Question[]>(() =>
    isOnline
      ? getRandomQuestions(cat, QUESTION_COUNT)
      : getOfflineQuestions(cat)
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
    cardAnim.setValue(40);
    Animated.spring(cardAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
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
          score: String(score + (answerState === "correct" ? 0 : 0)),
          finalScore: String(answerState === "correct" ? score : score),
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
  }, [currentIndex, questions.length, score, answerState, maxStreak, cat, startTime, timerAnim, isOnline]);

  useEffect(() => {
    if (answerState !== "unanswered") {
      const t = setTimeout(advanceQuestion, 1400);
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

  const timerWidth = timerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const timerColor = timeLeft > 8 ? colors.primary : timeLeft > 4 ? colors.accent : colors.wrong;
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

  if (!currentQuestion) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Offline mode chip */}
      {!isOnline && (
        <View style={[styles.offlineChip, { top: topPad + 52, backgroundColor: "#dc262622", borderColor: "#dc2626" }]}>
          <Feather name="wifi-off" size={11} color="#dc2626" />
          <Text style={[styles.offlineChipText, { color: "#dc2626" }]}>Offline · Limited questions</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 12, paddingBottom: botPad + 24 },
        ]}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => {
              stopTimer();
              router.back();
            }}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Feather name="x" size={22} color={colors.foreground} />
          </Pressable>
          <View style={styles.progressRow}>
            {questions.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor:
                      i < currentIndex
                        ? colors.primary
                        : i === currentIndex
                        ? colors.accent
                        : colors.muted,
                    transform: [{ scale: i === currentIndex ? 1.3 : 1 }],
                  },
                ]}
              />
            ))}
          </View>
          <View style={[styles.scoreBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.scoreText, { color: colors.primary }]}>{score}</Text>
          </View>
        </View>

        {/* Timer Bar */}
        <View style={[styles.timerTrack, { backgroundColor: colors.muted }]}>
          <Animated.View
            style={[styles.timerFill, { width: timerWidth, backgroundColor: timerColor }]}
          />
        </View>
        <View style={styles.timerRow}>
          <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
          {streak >= 2 && (
            <View style={[styles.streakBadge, { backgroundColor: colors.accent + "22" }]}>
              <Feather name="zap" size={12} color={colors.accent} />
              <Text style={[styles.streakText, { color: colors.accent }]}>
                {streak} streak!
              </Text>
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
          <Text style={[styles.questionNum, { color: colors.mutedForeground }]}>
            Q{currentIndex + 1} / {questions.length}
          </Text>
          <Text style={[styles.questionText, { color: colors.foreground }]}>
            {currentQuestion.question}
          </Text>
        </Animated.View>

        {/* Answer Options */}
        <View style={styles.options}>
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedIndex === idx;
            const isCorrect = idx === currentQuestion.correctIndex;
            let bg = colors.card;
            let border = colors.border;
            let textColor = colors.foreground;

            if (answerState !== "unanswered") {
              if (isCorrect) {
                bg = colors.correct + "22";
                border = colors.correct;
                textColor = colors.correct;
              } else if (isSelected && !isCorrect) {
                bg = colors.wrong + "22";
                border = colors.wrong;
                textColor = colors.wrong;
              }
            }

            return (
              <AnswerOption
                key={idx}
                label={String.fromCharCode(65 + idx)}
                text={opt}
                bg={bg}
                border={border}
                textColor={textColor}
                disabled={answerState !== "unanswered"}
                onPress={() => handleAnswer(idx)}
                isCorrect={answerState !== "unanswered" && isCorrect}
                isWrong={answerState !== "unanswered" && isSelected && !isCorrect}
              />
            );
          })}
        </View>

        {/* Explanation */}
        {answerState !== "unanswered" && currentQuestion.explanation && (
          <Animated.View
            style={[
              styles.explanationBox,
              {
                backgroundColor:
                  answerState === "correct"
                    ? colors.correct + "15"
                    : colors.wrong + "15",
                borderColor:
                  answerState === "correct" ? colors.correct : colors.wrong,
              },
            ]}
          >
            <Feather
              name={answerState === "correct" ? "check-circle" : "info"}
              size={14}
              color={answerState === "correct" ? colors.correct : colors.wrong}
            />
            <Text
              style={[
                styles.explanationText,
                {
                  color:
                    answerState === "correct" ? colors.correct : colors.wrong,
                },
              ]}
            >
              {currentQuestion.explanation}
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function AnswerOption({
  label,
  text,
  bg,
  border,
  textColor,
  disabled,
  onPress,
  isCorrect,
  isWrong,
}: {
  label: string;
  text: string;
  bg: string;
  border: string;
  textColor: string;
  disabled: boolean;
  onPress: () => void;
  isCorrect: boolean;
  isWrong: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        style={[
          styles.option,
          { backgroundColor: bg, borderColor: border },
        ]}
      >
        <View style={[styles.optionLabel, { borderColor: border }]}>
          <Text style={[styles.optionLabelText, { color: textColor }]}>
            {isCorrect ? "✓" : isWrong ? "✗" : label}
          </Text>
        </View>
        <Text style={[styles.optionText, { color: textColor }]}>{text}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  offlineChip: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  offlineChipText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  backBtn: { padding: 4 },
  progressRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  progressDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  scoreBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  scoreText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  timerTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  timerFill: { height: "100%", borderRadius: 3 },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  timerText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  streakText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  questionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    marginBottom: 16,
  },
  questionNum: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  questionText: {
    fontSize: 19,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 28,
  },
  options: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabelText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  optionText: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium", lineHeight: 21 },
  explanationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 14,
    gap: 8,
  },
  explanationText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
});
