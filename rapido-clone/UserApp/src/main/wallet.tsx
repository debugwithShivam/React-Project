import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/api/axios';

type WalletTransaction = {
  id: number;
  description?: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  created_at: string;
};

export default function WalletScreen() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [walletRes, txRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions'),
      ]);
      setBalance(Number(walletRes.data?.balance || 0));
      setTransactions(txRes.data?.transactions || []);
    } catch (e: any) {
      console.log('WALLET ERROR', e?.response?.data || e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const handleAddMoney = () => {
    Alert.alert('Add Money', 'Razorpay top-up flow is not wired in this build. Use admin panel to credit wallet for testing.');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/main/home');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={22} color="#111111" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Wallet</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.walletIconBox}>
            <Ionicons name="wallet" size={24} color="#FACC15" />
          </View>

          <Text style={styles.balanceLabel}>Available Balance</Text>

          {loading ? (
            <ActivityIndicator color="#FACC15" style={{ marginVertical: 10 }} />
          ) : (
            <Text style={styles.balanceAmount}>
              ₹{balance.toLocaleString('en-IN')}
            </Text>
          )}

          <TouchableOpacity
            style={styles.addMoneyButton}
            activeOpacity={0.85}
            onPress={handleAddMoney}
          >
            <Ionicons name="add" size={20} color="#111111" />
            <Text style={styles.addMoneyText}>Add Money</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={handleAddMoney}
          >
            <View style={styles.actionIconBox}>
              <Ionicons
                name="add-circle-outline"
                size={24}
                color="#111111"
              />
            </View>
            <Text style={styles.actionTitle}>Add Money</Text>
            <Text style={styles.actionSubtitle}>Top up wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconBox}>
              <Ionicons
                name="card-outline"
                size={24}
                color="#111111"
              />
            </View>
            <Text style={styles.actionTitle}>Payment Methods</Text>
            <Text style={styles.actionSubtitle}>Manage cards</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions */}
        <View style={styles.transactionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionList}>
          {loading ? (
            <View style={{ padding: 30, alignItems: 'center' }}>
              <ActivityIndicator color="#111111" />
            </View>
          ) : transactions.length === 0 ? (
            <View style={{ padding: 30, alignItems: 'center' }}>
              <Ionicons name="receipt-outline" size={28} color="#999999" />
              <Text style={styles.transactionSubtitle}>No transactions yet</Text>
            </View>
          ) : transactions.map((transaction) => (
            <View
              key={transaction.id}
              style={styles.transactionItem}
            >
              <View style={styles.transactionIconBox}>
                <Ionicons
                  name={transaction.type === 'CREDIT' ? 'add-circle-outline' : 'car-outline'}
                  size={20}
                  color="#111111"
                />
              </View>

              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>
                  {transaction.description || (transaction.type === 'CREDIT' ? 'Wallet Credit' : 'Wallet Debit')}
                </Text>

                <Text style={styles.transactionSubtitle}>
                  {new Date(transaction.created_at).toLocaleString()}
                </Text>
              </View>

              <Text
                style={[
                  styles.transactionAmount,
                  transaction.type === 'CREDIT'
                    ? styles.creditAmount
                    : styles.debitAmount,
                ]}
              >
                {transaction.type === 'CREDIT' ? '+' : '-'} ₹{Number(transaction.amount).toLocaleString('en-IN')}
              </Text>
            </View>
          ))}
        </View>

        {/* Security Note */}
        <View style={styles.securityBox}>
          <Ionicons
            name="shield-checkmark-outline"
            size={22}
            color="#10B981"
          />

          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>
              Your money is secure
            </Text>

            <Text style={styles.securityText}>
              Wallet transactions are protected and securely processed.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/main/home')}
        >
          <Ionicons
            name="home-outline"
            size={22}
            color="#999999"
          />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/main/rides')}
        >
          <Ionicons
            name="receipt-outline"
            size={22}
            color="#999999"
          />
          <Text style={styles.navLabel}>Rides</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="wallet"
            size={22}
            color="#111111"
          />
          <Text style={[styles.navLabel, styles.navLabelActive]}>
            Wallet
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/main/profile')}
        >
          <Ionicons
            name="person-outline"
            size={22}
            color="#999999"
          />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
  },

  headerSpacer: {
    width: 42,
  },

  balanceCard: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
  },

  walletIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(250,204,21,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  balanceLabel: {
    color: '#bdbdbd',
    fontSize: 13,
    fontWeight: '600',
  },

  balanceAmount: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 5,
    marginBottom: 18,
  },

  addMoneyButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FACC15',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addMoneyText: {
    marginLeft: 7,
    color: '#111111',
    fontSize: 14,
    fontWeight: '800',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111111',
  },

  actionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 28,
  },

  actionCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eeeeee',
    borderRadius: 16,
    padding: 15,
    marginRight: 10,
    backgroundColor: '#ffffff',
  },

  actionCardLast: {
    marginRight: 0,
  },

  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  actionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111111',
  },

  actionSubtitle: {
    fontSize: 11,
    color: '#888888',
    marginTop: 4,
  },

  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  seeAll: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
  },

  transactionList: {
    borderWidth: 1,
    borderColor: '#eeeeee',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },

  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },

  transactionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },

  transactionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111111',
  },

  transactionSubtitle: {
    fontSize: 11,
    color: '#888888',
    marginTop: 4,
  },

  transactionAmount: {
    fontSize: 14,
    fontWeight: '800',
  },

  creditAmount: {
    color: '#10B981',
  },

  debitAmount: {
    color: '#111111',
  },

  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faf9',
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
  },

  securityContent: {
    flex: 1,
    marginLeft: 10,
  },

  securityTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111111',
  },

  securityText: {
    fontSize: 11,
    color: '#777777',
    marginTop: 3,
    lineHeight: 16,
  },

  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
  },

  navLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#999999',
  },

  navLabelActive: {
    color: '#111111',
    fontWeight: '800',
  },
});
