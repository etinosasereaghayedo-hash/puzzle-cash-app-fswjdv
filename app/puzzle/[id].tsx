
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePuzzles } from "@/contexts/PuzzleContext";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function PuzzleDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { puzzles, solvePuzzle } = usePuzzles();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const puzzle = puzzles.find((p) => p.id === id);

  if (!puzzle) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>Puzzle not found</Text>
      </View>
    );
  }

  const handleAnswerSelect = (answer: string) => {
    console.log('Selected answer:', answer);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    console.log('Submitting answer:', selectedAnswer);
    if (!selectedAnswer) {
      Alert.alert("No Answer", "Please select an answer before submitting.");
      return;
    }

    const correct = selectedAnswer.toLowerCase() === puzzle.answer.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setTimeout(() => {
        solvePuzzle(puzzle.id);
        Alert.alert(
          "Congratulations! 🎉",
          `You earned $${puzzle.reward}!`,
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      }, 1000);
    } else {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setTimeout(() => {
        Alert.alert(
          "Incorrect Answer",
          "Try again! You can retry this puzzle.",
          [
            {
              text: "Try Again",
              onPress: () => {
                setSelectedAnswer(null);
                setShowResult(false);
              },
            },
          ]
        );
      }, 1000);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return colors.highlight;
      case 'medium':
        return colors.accent;
      case 'hard':
        return colors.primary;
      default:
        return colors.secondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(puzzle.difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>
              {puzzle.difficulty.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.title}>{puzzle.title}</Text>
          <Text style={styles.description}>{puzzle.description}</Text>
          <View style={styles.rewardContainer}>
            <IconSymbol name="dollarsign.circle.fill" size={32} color={colors.highlight} />
            <Text style={styles.rewardAmount}>${puzzle.reward}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.questionCard}>
          <Text style={styles.questionLabel}>Question:</Text>
          <Text style={styles.questionText}>{puzzle.question}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.optionsContainer}>
          <Text style={styles.optionsLabel}>Select your answer:</Text>
          {puzzle.options?.map((option, index) => (
            <Animated.View
              key={option}
              entering={FadeInDown.delay(500 + index * 100).springify()}
            >
              <Pressable
                style={[
                  styles.optionButton,
                  selectedAnswer === option && styles.optionButtonSelected,
                  showResult &&
                    option.toLowerCase() === puzzle.answer.toLowerCase() &&
                    styles.optionButtonCorrect,
                  showResult &&
                    selectedAnswer === option &&
                    option.toLowerCase() !== puzzle.answer.toLowerCase() &&
                    styles.optionButtonIncorrect,
                ]}
                onPress={() => !showResult && handleAnswerSelect(option)}
                disabled={showResult}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedAnswer === option && styles.optionTextSelected,
                    showResult &&
                      option.toLowerCase() === puzzle.answer.toLowerCase() &&
                      styles.optionTextCorrect,
                  ]}
                >
                  {option}
                </Text>
                {showResult && option.toLowerCase() === puzzle.answer.toLowerCase() && (
                  <Animated.View entering={ZoomIn.springify()}>
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={24}
                      color={colors.card}
                    />
                  </Animated.View>
                )}
                {showResult &&
                  selectedAnswer === option &&
                  option.toLowerCase() !== puzzle.answer.toLowerCase() && (
                    <Animated.View entering={ZoomIn.springify()}>
                      <IconSymbol
                        name="xmark.circle.fill"
                        size={24}
                        color={colors.card}
                      />
                    </Animated.View>
                  )}
              </Pressable>
            </Animated.View>
          ))}
        </Animated.View>

        {!showResult && (
          <Animated.View entering={FadeInDown.delay(900).springify()}>
            <Pressable
              style={[
                styles.submitButton,
                !selectedAnswer && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!selectedAnswer}
            >
              <Text style={styles.submitButtonText}>Submit Answer</Text>
            </Pressable>
          </Animated.View>
        )}

        {showResult && (
          <Animated.View entering={ZoomIn.springify()} style={styles.resultContainer}>
            <IconSymbol
              name={isCorrect ? "checkmark.circle.fill" : "xmark.circle.fill"}
              size={64}
              color={isCorrect ? colors.highlight : "#dc3545"}
            />
            <Text style={[styles.resultText, { color: isCorrect ? colors.highlight : "#dc3545" }]}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.card,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  rewardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.highlight,
    marginLeft: 8,
  },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionsLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  optionButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionButtonCorrect: {
    borderColor: colors.highlight,
    backgroundColor: colors.highlight,
  },
  optionButtonIncorrect: {
    borderColor: '#dc3545',
    backgroundColor: '#dc3545',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.card,
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: colors.card,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 123, 255, 0.3)',
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: colors.secondary,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.card,
  },
  resultContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
});
