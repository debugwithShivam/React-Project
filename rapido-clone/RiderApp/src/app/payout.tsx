import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '@/api/axios';
import { COLORS } from '@/constants';

export default function PayoutScreen() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [upi, setUpi] = useState('');
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const [profileRes, payoutRes] = await Promise.all([
        api.get('/driver/profile'),
        api.get('/payouts/mine'),
      ]);
      setBalance(Number(profileRes.data?.driver?.wallet_balance || 0));
      setUpi(profileRes.data?.driver?.payout_upi || '');
      setPayouts(payoutRes.data?.payouts || []);
    } catch (e: any) {
      console.log('PAYOUT LOAD ERROR', e?.response?.data || e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { Alert.alert('Invalid amount', 'Enter a valid payout amount.'); return; }
    if (amt > balance) { Alert.alert('Insufficient balance', `You only have ₹${balance.toFixed(2)} available.`); return; }
    if (!upi.trim()) { Alert.alert('UPI required', 'Enter your UPI ID for payout.'); return; }
    setSubmitting(true);
    try {
      await api.post('/payouts/request', { amount: amt, upiId: upi.trim() });
      Alert.alert('Requested', 'Your payout request has been submitted.');
      setAmount('');
      await load();
    } catch (e: any) {
      Alert.alert('Request failed', e?.response?.data?.message || 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color={COLORS.yellow} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Payout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available to withdraw</Text>
          <Text style={styles.balanceValue}>₹{balance.toFixed(2)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Request payout</Text>
        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>Amount (₹)</Text>
          <TextInput style={styles.input} value={amount} onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))} placeholder="0" placeholderTextColor="#9A9E9B" keyboardType="decimal-pad" />
          <Text style={styles.inputLabel}>UPI ID</Text>
          <TextInput style={styles.input} value={upi} onChangeText={setUpi} placeholder="yourname@upi" placeholderTextColor="#9A9E9B" autoCapitalize="none" />
          <TouchableOpacity style={[styles.submitButton, submitting && { opacity: 0.6 }]} onPress={submit} disabled={submitting}>
            {submitting ? <ActivityIndicator color={COLORS.ink} /> : <Text style={styles.submitText}>Request Payout</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Payout history</Text>
        {payouts.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyText}>No payout requests yet</Text></View>
        ) : payouts.map((p) => (
          <View key={p.id} style={styles.payoutRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.payoutAmount}>₹{Number(p.amount).toFixed(2)}</Text>
              <Text style={styles.payoutDate}>{new Date(p.created_at).toLocaleDateString()} · {p.upi_id}</Text>
            </View>
            <View style={[styles.statusPill, p.status === 'PAID' && { backgroundColor: '#E1F2E9' }, p.status === 'REJECTED' && { backgroundColor: '#FDE8E8' }]}>
              <Text style={[styles.statusText, p.status === 'PAID' && { color: COLORS.green }, p.status === 'REJECTED' && { color: COLORS.red }]}>{p.status}</Text>
            </View>
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
  balanceValue: { color: '#fff', fontSize: 36, fontWeight: '900', marginTop: 8 },
  sectionTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '900', marginBottom: 12 },
  formCard: { backgroundColor: COLORS.paper, borderRadius: 16, padding: 16, marginBottom: 24 },
  inputLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: { height: 50, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 14, fontSize: 15, color: COLORS.ink, marginBottom: 14, backgroundColor: '#FAFAF8' },
  submitButton: { height: 50, borderRadius: 12, backgroundColor: COLORS.yellow, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: COLORS.ink, fontWeight: '800', fontSize: 15 },
  empty: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { color: COLORS.muted, fontSize: 13 },
  payoutRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.paper, borderRadius: 14, padding: 14, marginBottom: 10 },
  payoutAmount: { color: COLORS.ink, fontWeight: '800', fontSize: 15 },
  payoutDate: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  statusPill: { backgroundColor: '#FFF8DC', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { color: COLORS.muted, fontSize: 11, fontWeight: '800' },
});
