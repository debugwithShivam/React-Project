import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { Typography, BorderRadius, Spacing } from '../../theme';
import { CustomHeader } from '../../components/common/CustomHeader';
import { CustomButton } from '../../components/common/CustomButton';
import { InputField } from '../../components/common/InputField';

export const WalletScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const {
    walletBalance,
    addMoneyToWallet,
    transactions,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    user,
  } = useUser();

  const [customAmount, setCustomAmount] = useState('');
  const [showAddMoney, setShowAddMoney] = useState(false);

  const handleQuickAdd = (amount) => {
    addMoneyToWallet(amount);
    Alert.alert('Success', `₹${amount} added to your UrbanRide Wallet!`);
    setShowAddMoney(false);
    setCustomAmount('');
  };

  const handleCustomAdd = () => {
    const val = parseFloat(customAmount);
    if (!val || val <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    addMoneyToWallet(val);
    Alert.alert('Success', `₹${val} added to your UrbanRide Wallet!`);
    setShowAddMoney(false);
    setCustomAmount('');
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? colors.background : '#F8FAFC' },
      ]}
    >
      <CustomHeader
        title="Payments & Wallet"
        subtitle="Manage UrbanRide balance, UPI & Cards"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Balance Hero Card */}
        <View
          style={[
            styles.walletHero,
            {
              backgroundColor: isDark ? '#131C2E' : '#0284C7',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.walletHeroTop}>
            <View>
              <Text style={styles.walletHeroLabel}>URBANRIDE WALLET</Text>
              <Text style={styles.walletHeroBalance}>
                ₹{walletBalance.toFixed(2)}
              </Text>
            </View>
            <View style={styles.walletIconCircle}>
              <MaterialCommunityIcons name="wallet" size={32} color="#FFFFFF" />
            </View>
          </View>

          {/* Quick Top-up Pills */}
          <Text style={styles.quickAddLabel}>Quick Top-up</Text>
          <View style={styles.quickAmountsRow}>
            {[100, 200, 500, 1000].map((amt) => (
              <TouchableOpacity
                key={amt}
                style={styles.quickAmountBtn}
                onPress={() => handleQuickAdd(amt)}
                activeOpacity={0.8}
              >
                <Text style={styles.quickAmountText}>+₹{amt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.customAddTrigger}
            onPress={() => setShowAddMoney(!showAddMoney)}
          >
            <Text style={styles.customAddText}>
              {showAddMoney ? 'Hide Custom Amount' : 'Enter Custom Amount +'}
            </Text>
          </TouchableOpacity>

          {showAddMoney && (
            <View style={styles.customInputSection}>
              <InputField
                label="Amount (₹)"
                value={customAmount}
                onChangeText={setCustomAmount}
                placeholder="e.g. 350"
                keyboardType="numeric"
              />
              <CustomButton
                title="Add Money via UPI"
                variant="success"
                size="small"
                onPress={handleCustomAdd}
                style={{ marginTop: 6 }}
              />
            </View>
          )}
        </View>

        {/* UPI & Linked Accounts */}
        <Text
          style={[
            Typography.caption,
            {
              color: colors.textSecondary,
              marginTop: Spacing.xl,
              marginBottom: Spacing.sm,
              fontWeight: '700',
              paddingHorizontal: Spacing.xs,
            },
          ]}
        >
          LINKED UPI APPS
        </Text>

        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          {user.upiOptions.map((upi) => (
            <TouchableOpacity
              key={upi.id}
              style={[
                styles.methodItem,
                { borderBottomColor: colors.border },
              ]}
              onPress={() => {
                setSelectedPaymentMethod({
                  type: 'upi',
                  title: upi.provider,
                  detail: upi.handle,
                });
                Alert.alert('Payment Method Set', `Set ${upi.provider} as default.`);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.methodLeft}>
                <View
                  style={[
                    styles.methodIconWrapper,
                    { backgroundColor: isDark ? colors.surfaceSubtle : colors.primaryLight },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="lightning-bolt"
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text
                    style={[
                      Typography.title,
                      { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
                    ]}
                  >
                    {upi.provider}
                  </Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                    {upi.handle}
                  </Text>
                </View>
              </View>

              <Ionicons
                name={
                  selectedPaymentMethod.title === upi.provider
                    ? 'checkmark-circle'
                    : 'ellipse-outline'
                }
                size={22}
                color={
                  selectedPaymentMethod.title === upi.provider
                    ? colors.primary
                    : colors.textMuted
                }
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Saved Debit / Credit Cards */}
        <Text
          style={[
            Typography.caption,
            {
              color: colors.textSecondary,
              marginTop: Spacing.xl,
              marginBottom: Spacing.sm,
              fontWeight: '700',
              paddingHorizontal: Spacing.xs,
            },
          ]}
        >
          SAVED CARDS
        </Text>

        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          {user.savedCards.map((card) => (
            <View
              key={card.id}
              style={[
                styles.methodItem,
                { borderBottomColor: colors.border },
              ]}
            >
              <View style={styles.methodLeft}>
                <View
                  style={[
                    styles.methodIconWrapper,
                    { backgroundColor: isDark ? colors.surfaceSubtle : '#EEF2FF' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="credit-card-outline"
                    size={22}
                    color={colors.accent}
                  />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text
                    style={[
                      Typography.title,
                      { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
                    ]}
                  >
                    {card.bank} •••• {card.last4}
                  </Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                    Expires {card.expiry}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => Alert.alert('Add Card', 'Card options: remove or set default.')}
              >
                <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Recent Transactions List */}
        <Text
          style={[
            Typography.caption,
            {
              color: colors.textSecondary,
              marginTop: Spacing.xl,
              marginBottom: Spacing.sm,
              fontWeight: '700',
              paddingHorizontal: Spacing.xs,
            },
          ]}
        >
          RECENT TRANSACTIONS
        </Text>

        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          {transactions.map((tx) => (
            <View
              key={tx.id}
              style={[
                styles.txItem,
                { borderBottomColor: colors.border },
              ]}
            >
              <View style={styles.txLeft}>
                <View
                  style={[
                    styles.txIconWrapper,
                    {
                      backgroundColor:
                        tx.type === 'credit'
                          ? '#10B98120'
                          : (isDark ? colors.surfaceSubtle : '#FEE2E2'),
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={tx.type === 'credit' ? 'arrow-down-bold' : 'arrow-up-bold'}
                    size={18}
                    color={tx.type === 'credit' ? '#10B981' : '#EF4444'}
                  />
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text
                    style={[
                      Typography.title,
                      { color: colors.textPrimary, fontSize: 14 },
                    ]}
                  >
                    {tx.title}
                  </Text>
                  <Text style={[Typography.captionSmall, { color: colors.textSecondary, marginTop: 2 }]}>
                    {tx.date}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  Typography.title,
                  {
                    color: tx.type === 'credit' ? '#10B981' : colors.textPrimary,
                    fontWeight: '700',
                  },
                ]}
              >
                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  walletHero: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    shadowColor: '#0284C7',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  walletHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletHeroLabel: {
    color: '#E0F2FE',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  walletHeroBalance: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
  },
  walletIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddLabel: {
    color: '#E0F2FE',
    fontSize: 12,
    fontWeight: '600',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAmountBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  quickAmountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  customAddTrigger: {
    marginTop: Spacing.md,
    alignSelf: 'center',
  },
  customAddText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  customInputSection: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  cardSection: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
