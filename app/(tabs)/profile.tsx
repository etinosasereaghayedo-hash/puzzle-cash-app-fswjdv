
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { usePuzzles } from "@/contexts/PuzzleContext";
import { colors } from "@/styles/commonStyles";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

export default function ProfileScreen() {
  const { 
    userProfile, 
    puzzles, 
    resetProgress, 
    payoutRequests, 
    paymentMethods,
    requestPayout,
    addPaymentMethod,
  } = usePuzzles();

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState(paymentMethods[0]?.id || '');
  const [newMethodEmail, setNewMethodEmail] = useState('');
  const [newMethodType, setNewMethodType] = useState<'paypal' | 'stripe' | 'bank'>('paypal');

  const completedPuzzles = puzzles.filter((p) => p.completed);
  const totalPuzzles = puzzles.length;
  const completionRate = totalPuzzles > 0 ? (completedPuzzles.length / totalPuzzles) * 100 : 0;

  const MINIMUM_PAYOUT = 20;

  const handleReset = () => {
    Alert.alert(
      "Reset Progress",
      "Are you sure you want to reset all your progress? This will clear your earnings and puzzle completions.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            console.log('Resetting progress');
            if (Platform.OS === 'ios') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            resetProgress();
            Alert.alert("Success", "Your progress has been reset.");
          },
        },
      ]
    );
  };

  const handleRequestPayout = () => {
    if (userProfile.availableBalance < MINIMUM_PAYOUT) {
      Alert.alert(
        "Insufficient Balance",
        `You need at least $${MINIMUM_PAYOUT} to request a payout. Keep solving puzzles!`
      );
      return;
    }
    setPayoutAmount(userProfile.availableBalance.toString());
    setShowPayoutModal(true);
  };

  const handleConfirmPayout = async () => {
    const amount = parseFloat(payoutAmount);
    
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }

    if (amount < MINIMUM_PAYOUT) {
      Alert.alert("Amount Too Low", `Minimum payout is $${MINIMUM_PAYOUT}.`);
      return;
    }

    if (amount > userProfile.availableBalance) {
      Alert.alert("Insufficient Balance", "You don't have enough balance for this payout.");
      return;
    }

    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const success = await requestPayout(amount, selectedMethodId);
    
    if (success) {
      setShowPayoutModal(false);
      Alert.alert(
        "Payout Requested!",
        `Your payout of $${amount.toFixed(2)} has been requested and will be processed shortly.`,
        [{ text: "OK" }]
      );
    } else {
      Alert.alert("Error", "Failed to process payout request. Please try again.");
    }
  };

  const handleAddPaymentMethod = () => {
    if (!newMethodEmail.trim()) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    const newMethod = {
      id: Date.now().toString(),
      type: newMethodType,
      label: newMethodType === 'paypal' ? 'PayPal' : newMethodType === 'stripe' ? 'Stripe' : 'Bank Transfer',
      email: newMethodEmail,
    };

    addPaymentMethod(newMethod);
    setNewMethodEmail('');
    setShowAddMethodModal(false);
    
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Alert.alert("Success", "Payment method added successfully!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'processing':
        return '#FF9800';
      case 'pending':
        return '#2196F3';
      case 'failed':
        return '#F44336';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark.circle.fill';
      case 'processing':
        return 'clock.fill';
      case 'pending':
        return 'hourglass';
      case 'failed':
        return 'xmark.circle.fill';
      default:
        return 'circle';
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <IconSymbol name="person.circle.fill" size={80} color={colors.primary} />
          </View>
          <Text style={styles.name}>{userProfile.name}</Text>
          <Text style={styles.email}>{userProfile.email}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.balanceSection}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <IconSymbol name="dollarsign.circle.fill" size={32} color={colors.highlight} />
              <Text style={styles.balanceTitle}>Available Balance</Text>
            </View>
            <Text style={styles.balanceAmount}>${userProfile.availableBalance.toFixed(2)}</Text>
            <Text style={styles.balanceSubtext}>
              Minimum payout: ${MINIMUM_PAYOUT}
            </Text>
            
            <Pressable 
              style={[
                styles.payoutButton,
                userProfile.availableBalance < MINIMUM_PAYOUT && styles.payoutButtonDisabled
              ]}
              onPress={handleRequestPayout}
              disabled={userProfile.availableBalance < MINIMUM_PAYOUT}
            >
              <IconSymbol 
                name="arrow.down.circle.fill" 
                size={20} 
                color={userProfile.availableBalance < MINIMUM_PAYOUT ? colors.textSecondary : colors.card} 
              />
              <Text style={[
                styles.payoutButtonText,
                userProfile.availableBalance < MINIMUM_PAYOUT && styles.payoutButtonTextDisabled
              ]}>
                Request Payout
              </Text>
            </Pressable>
          </View>

          <View style={styles.earningsRow}>
            <View style={styles.earningsItem}>
              <Text style={styles.earningsLabel}>Total Earned</Text>
              <Text style={styles.earningsValue}>${userProfile.totalEarnings}</Text>
            </View>
            <View style={styles.earningsDivider} />
            <View style={styles.earningsItem}>
              <Text style={styles.earningsLabel}>Total Withdrawn</Text>
              <Text style={styles.earningsValue}>${userProfile.totalWithdrawn}</Text>
            </View>
          </View>
        </Animated.View>

        {payoutRequests.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.payoutHistorySection}>
            <Text style={styles.sectionTitle}>Payout History</Text>
            {payoutRequests.slice(0, 5).map((payout, index) => (
              <View key={payout.id} style={styles.payoutCard}>
                <View style={styles.payoutHeader}>
                  <View style={styles.payoutInfo}>
                    <IconSymbol 
                      name={getStatusIcon(payout.status)} 
                      size={24} 
                      color={getStatusColor(payout.status)} 
                    />
                    <View style={styles.payoutDetails}>
                      <Text style={styles.payoutAmount}>${payout.amount.toFixed(2)}</Text>
                      <Text style={styles.payoutMethod}>
                        {payout.method.charAt(0).toUpperCase() + payout.method.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.payoutStatusContainer}>
                    <Text style={[styles.payoutStatus, { color: getStatusColor(payout.status) }]}>
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </Text>
                    <Text style={styles.payoutDate}>
                      {new Date(payout.requestedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          
          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <View style={styles.statIconContainer}>
                <IconSymbol name="checkmark.circle.fill" size={32} color={colors.highlight} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{userProfile.puzzlesSolved}</Text>
                <Text style={styles.statLabel}>Puzzles Solved</Text>
              </View>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <View style={styles.statIconContainer}>
                <IconSymbol name="chart.bar.fill" size={32} color={colors.primary} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{completionRate.toFixed(0)}%</Text>
                <Text style={styles.statLabel}>Completion Rate</Text>
              </View>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <View style={styles.statIconContainer}>
                <IconSymbol name="puzzlepiece.fill" size={32} color={colors.accent} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>
                  {completedPuzzles.length}/{totalPuzzles}
                </Text>
                <Text style={styles.statLabel}>Total Progress</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.infoSection}>
          <Text style={styles.sectionTitle}>How Payouts Work</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoNumber}>
                <Text style={styles.infoNumberText}>1</Text>
              </View>
              <Text style={styles.infoText}>
                Solve puzzles to earn money into your balance
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoNumber}>
                <Text style={styles.infoNumberText}>2</Text>
              </View>
              <Text style={styles.infoText}>
                Reach the minimum payout threshold of ${MINIMUM_PAYOUT}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoNumber}>
                <Text style={styles.infoNumberText}>3</Text>
              </View>
              <Text style={styles.infoText}>
                Request a payout to your preferred payment method
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoNumber}>
                <Text style={styles.infoNumberText}>4</Text>
              </View>
              <Text style={styles.infoText}>
                Receive your money within 3-5 business days
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Pressable style={styles.resetButton} onPress={handleReset}>
            <IconSymbol name="arrow.counterclockwise" size={20} color={colors.card} />
            <Text style={styles.resetButtonText}>Reset Progress</Text>
          </Pressable>
        </Animated.View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Note: This is a demo app. Earnings and payouts are simulated and not real money. 
            To implement real payouts, you would need to integrate with payment providers like Stripe or PayPal.
          </Text>
        </View>
      </ScrollView>

      {/* Payout Request Modal */}
      <Modal
        visible={showPayoutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPayoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Payout</Text>
              <Pressable onPress={() => setShowPayoutModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={styles.input}
                value={payoutAmount}
                onChangeText={setPayoutAmount}
                keyboardType="decimal-pad"
                placeholder="Enter amount"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.inputLabel}>Payment Method</Text>
              <View style={styles.methodsList}>
                {paymentMethods.map((method) => (
                  <Pressable
                    key={method.id}
                    style={[
                      styles.methodItem,
                      selectedMethodId === method.id && styles.methodItemSelected
                    ]}
                    onPress={() => setSelectedMethodId(method.id)}
                  >
                    <View style={styles.methodInfo}>
                      <IconSymbol 
                        name={method.type === 'paypal' ? 'creditcard.fill' : 'building.columns.fill'} 
                        size={24} 
                        color={selectedMethodId === method.id ? colors.primary : colors.textSecondary} 
                      />
                      <View style={styles.methodDetails}>
                        <Text style={styles.methodLabel}>{method.label}</Text>
                        <Text style={styles.methodEmail}>{method.email}</Text>
                      </View>
                    </View>
                    {selectedMethodId === method.id && (
                      <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                    )}
                  </Pressable>
                ))}
              </View>

              <Pressable 
                style={styles.addMethodButton}
                onPress={() => {
                  setShowPayoutModal(false);
                  setShowAddMethodModal(true);
                }}
              >
                <IconSymbol name="plus.circle.fill" size={20} color={colors.primary} />
                <Text style={styles.addMethodText}>Add Payment Method</Text>
              </Pressable>

              <View style={styles.modalActions}>
                <Pressable 
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setShowPayoutModal(false)}
                >
                  <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleConfirmPayout}
                >
                  <Text style={styles.modalButtonTextPrimary}>Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Payment Method Modal */}
      <Modal
        visible={showAddMethodModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddMethodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <Pressable onPress={() => setShowAddMethodModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Method Type</Text>
              <View style={styles.methodTypeButtons}>
                <Pressable
                  style={[
                    styles.methodTypeButton,
                    newMethodType === 'paypal' && styles.methodTypeButtonSelected
                  ]}
                  onPress={() => setNewMethodType('paypal')}
                >
                  <Text style={[
                    styles.methodTypeButtonText,
                    newMethodType === 'paypal' && styles.methodTypeButtonTextSelected
                  ]}>
                    PayPal
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.methodTypeButton,
                    newMethodType === 'stripe' && styles.methodTypeButtonSelected
                  ]}
                  onPress={() => setNewMethodType('stripe')}
                >
                  <Text style={[
                    styles.methodTypeButtonText,
                    newMethodType === 'stripe' && styles.methodTypeButtonTextSelected
                  ]}>
                    Stripe
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.methodTypeButton,
                    newMethodType === 'bank' && styles.methodTypeButtonSelected
                  ]}
                  onPress={() => setNewMethodType('bank')}
                >
                  <Text style={[
                    styles.methodTypeButtonText,
                    newMethodType === 'bank' && styles.methodTypeButtonTextSelected
                  ]}>
                    Bank
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={newMethodEmail}
                onChangeText={setNewMethodEmail}
                keyboardType="email-address"
                placeholder="Enter email address"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />

              <View style={styles.modalActions}>
                <Pressable 
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setShowAddMethodModal(false)}
                >
                  <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleAddPaymentMethod}
                >
                  <Text style={styles.modalButtonTextPrimary}>Add Method</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  balanceSection: {
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 12,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.highlight,
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  payoutButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  payoutButtonDisabled: {
    backgroundColor: colors.accent,
    opacity: 0.6,
  },
  payoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    marginLeft: 8,
  },
  payoutButtonTextDisabled: {
    color: colors.textSecondary,
  },
  earningsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  earningsItem: {
    flex: 1,
    alignItems: 'center',
  },
  earningsDivider: {
    width: 1,
    backgroundColor: colors.accent,
    marginHorizontal: 16,
  },
  earningsLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  payoutHistorySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  payoutCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  payoutDetails: {
    marginLeft: 12,
  },
  payoutAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  payoutMethod: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  payoutStatusContainer: {
    alignItems: 'flex-end',
  },
  payoutStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  payoutDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statsSection: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.card,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    marginLeft: 8,
  },
  disclaimer: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  methodsList: {
    marginBottom: 12,
  },
  methodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodDetails: {
    marginLeft: 12,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  methodEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 20,
  },
  addMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  methodTypeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  methodTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
  },
  methodTypeButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  methodTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  methodTypeButtonTextSelected: {
    color: colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: colors.accent,
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
});
