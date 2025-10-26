
import React from "react";
import { Stack, useRouter } from "expo-router";
import { ScrollView, Pressable, StyleSheet, View, Text, Platform } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { usePuzzles } from "@/contexts/PuzzleContext";
import { colors } from "@/styles/commonStyles";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const router = useRouter();
  const { puzzles, userProfile } = usePuzzles();

  const handlePuzzlePress = (puzzleId: string) => {
    console.log('Navigating to puzzle:', puzzleId);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/puzzle/${puzzleId}`);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'math':
        return 'function';
      case 'word':
        return 'text.quote';
      case 'logic':
        return 'brain.head.profile';
      default:
        return 'puzzlepiece.fill';
    }
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Puzzle Rewards",
            headerLargeTitle: true,
          }}
        />
      )}
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.contentContainer,
            Platform.OS !== 'ios' && styles.contentContainerWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${userProfile.totalEarnings}</Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile.puzzlesSolved}</Text>
              <Text style={styles.statLabel}>Puzzles Solved</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Available Puzzles</Text>
          <Text style={styles.sectionSubtitle}>
            Solve puzzles and earn $10 for each one!
          </Text>

          {puzzles.map((puzzle, index) => (
            <Animated.View
              key={puzzle.id}
              entering={FadeInDown.delay(index * 100).springify()}
            >
              <Pressable
                style={[
                  styles.puzzleCard,
                  puzzle.completed && styles.puzzleCardCompleted,
                ]}
                onPress={() => handlePuzzlePress(puzzle.id)}
                disabled={puzzle.completed}
              >
                <View style={styles.puzzleHeader}>
                  <View
                    style={[
                      styles.puzzleIcon,
                      { backgroundColor: getDifficultyColor(puzzle.difficulty) },
                    ]}
                  >
                    <IconSymbol
                      name={getTypeIcon(puzzle.type) as any}
                      size={24}
                      color={colors.card}
                    />
                  </View>
                  <View style={styles.puzzleInfo}>
                    <Text style={styles.puzzleTitle}>{puzzle.title}</Text>
                    <Text style={styles.puzzleDescription}>
                      {puzzle.description}
                    </Text>
                  </View>
                  {puzzle.completed ? (
                    <View style={styles.completedBadge}>
                      <IconSymbol
                        name="checkmark.circle.fill"
                        size={28}
                        color={colors.highlight}
                      />
                    </View>
                  ) : (
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardText}>${puzzle.reward}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.puzzleFooter}>
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
                  <Text style={styles.puzzleType}>
                    {puzzle.type.charAt(0).toUpperCase() + puzzle.type.slice(1)} Puzzle
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    </>
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
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.textSecondary,
    opacity: 0.3,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  puzzleCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  puzzleCardCompleted: {
    opacity: 0.6,
  },
  puzzleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  puzzleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  puzzleInfo: {
    flex: 1,
  },
  puzzleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  puzzleDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  completedBadge: {
    marginLeft: 8,
  },
  rewardBadge: {
    backgroundColor: colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.card,
  },
  puzzleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.card,
  },
  puzzleType: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
