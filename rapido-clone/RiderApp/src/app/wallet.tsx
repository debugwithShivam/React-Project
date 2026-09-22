import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '@/api/axios';
import { COLORS } from '@/constants';

export default function WalletScreen() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, txRes] = await Promise.all([
          api.get('/driver/profile'),
          api.get('/wallet/transactions').catch(() => ({ data: { transactions: [] } })),
        ]);
        setBalance(Number(profileRes.data?.driver?.wallet_balance || 0));
        setTransactions(txRes.data?.transactions || []);
      } catch (e: any) {
        console.log('WALLET ERROR', e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color={COLORS.yellow} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity onPress={() => router.push('/payout')}><Ionicons name="arrow-up-circle-outline" size={24} color={COLORS.yellow} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available balance</Text>
          <Text style={styles.balanceValue}>₹{balance.toFixed(2)}</Text>
          <TouchableOpacity style={styles.payoutButton} onPress={() => router.push('/payout')}>
            <Text style={styles.payoutButtonText}>Request Payout</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Transactions</Text>
        {transactions.length === 0 ? (
          <View style={styles.empty}><Ionicons name="receipt-outline" size={30} color={COLORS.muted} /><Text style={styles.emptyText}>No transactions yet</Text></View>
        ) : transactions.map((tx) => (
          <View key={tx.id} style={styles.txRow}>
            <View style={[styles.txIcon, { backgroundColor: tx.type === 'CREDIT' ? '#E1F2E9' : '#FDE8E8' }]}>
              <Ionicons name={tx.type === 'CREDIT' ? 'arrow-down' : 'arrow-up'} size={18} color={tx.type === 'CREDIT' ? COLORS.green : COLORS.red} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.txTitle}>{tx.description || tx.type}</Text>
              <Text style={styles.txDate}>{new Date(tx.created_at).toLocaleString()}</Text>
            </View>
            <Text style={[styles.txAmount, { color: tx.type === 'CREDIT' ? COLORS.green : COLORS.red }]}>
              {tx.type === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  header: { backgroundColor: COLORS.ink, height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  content: { padding: 20, paddingBottom: 40 },
  balanceCard: { backgroundColor: COLORS.ink, borderRadius: 22, padding: 24, alignItems: 'center', marginBottom: 24 },
  balanceLabel: { color: '#AAB0AD', fontSize: 12, fontWeight: '700' },
  balanceValue: { color: '#fff', fontSize: 40, fontWeight: '900', marginTop: 8 },
  payoutButton: { marginTop: 18, backgroundColor: COLORS.yellow, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  payoutButtonText: { color: COLORS.ink, fontWeight: '800', fontSize: 14 },
  sectionTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '900', marginBottom: 12 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: COLORS.muted, marginTop: 10, fontSize: 13 },
  txRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.paper, borderRadius: 14, padding: 14, marginBottom: 10, gap: 12 },
  txIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txTitle: { color: COLORS.ink, fontWeight: '700', fontSize: 14 },
  txDate: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  txAmount: { fontWeight: '800', fontSize: 15 },
});
