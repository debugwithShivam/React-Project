import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '@/api/axios';
import { COLORS } from '@/constants';

export default function SupportScreen() {
  const [tab, setTab] = useState<'new' | 'history'>('new');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('RIDE');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints/mine');
      setTickets(res.data?.complaints || []);
    } catch (e: any) {
      console.log('TICKETS ERROR', e?.response?.data || e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (tab === 'history') loadTickets(); }, [tab]);

  const submit = async () => {
    if (!subject.trim() || !message.trim()) { Alert.alert('Missing details', 'Subject and message are required.'); return; }
    setSubmitting(true);
    try {
      await api.post('/complaints', { subject: subject.trim(), category, message: message.trim() });
      Alert.alert('Submitted', 'Our support team will get back to you.');
      setSubject(''); setMessage(''); setTab('history');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Unable to submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, tab === 'new' && styles.tabActive]} onPress={() => setTab('new')}>
          <Text style={[styles.tabText, tab === 'new' && styles.tabTextActive]}>New Ticket</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'history' && styles.tabActive]} onPress={() => setTab('history')}>
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>My Tickets</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'new' ? (
          <View style={styles.formCard}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.catRow}>
              {['RIDE', 'PAYMENT', 'ACCOUNT', 'OTHER'].map((c) => (
                <TouchableOpacity key={c} style={[styles.catChip, category === c && styles.catChipActive]} onPress={() => setCategory(c)}>
                  <Text style={[styles.catText, category === c && styles.catTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Subject</Text>
            <TextInput style={styles.input} value={subject} onChangeText={setSubject} placeholder="Brief summary" placeholderTextColor="#9A9E9B" />
            <Text style={styles.label}>Message</Text>
            <TextInput style={[styles.input, styles.textarea]} value={message} onChangeText={setMessage} placeholder="Describe your issue..." placeholderTextColor="#9A9E9B" multiline numberOfLines={5} textAlignVertical="top" />
            <TouchableOpacity style={[styles.submitButton, submitting && { opacity: 0.6 }]} onPress={submit} disabled={submitting}>
              {submitting ? <ActivityIndicator color={COLORS.ink} /> : <Text style={styles.submitText}>Submit Ticket</Text>}
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <ActivityIndicator size="large" color={COLORS.yellow} style={{ marginTop: 40 }} />
        ) : tickets.length === 0 ? (
          <View style={styles.empty}><Ionicons name="chatbubbles-outline" size={34} color={COLORS.muted} /><Text style={styles.emptyText}>No support tickets yet</Text></View>
        ) : tickets.map((t) => (
          <View key={t.id} style={styles.ticketRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ticketSubject}>{t.subject}</Text>
              <Text style={styles.ticketMeta}>{t.category} · {new Date(t.created_at).toLocaleDateString()}</Text>
              <Text style={styles.ticketMsg} numberOfLines={2}>{t.message}</Text>
            </View>
            <View style={[styles.statusPill, t.status === 'RESOLVED' && { backgroundColor: '#E1F2E9' }, t.status === 'CLOSED' && { backgroundColor: '#F0F0F0' }]}>
              <Text style={[styles.statusText, t.status === 'RESOLVED' && { color: COLORS.green }]}>{t.status}</Text>
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
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.ink, paddingHorizontal: 20, paddingBottom: 14, gap: 10 },
  tab: { flex: 1, height: 40, borderRadius: 10, backgroundColor: COLORS.inkSoft, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: COLORS.yellow },
  tabText: { color: '#929896', fontWeight: '700', fontSize: 13 },
  tabTextActive: { color: COLORS.ink },
  content: { padding: 20, paddingBottom: 40 },
  formCard: { backgroundColor: COLORS.paper, borderRadius: 16, padding: 16 },
  label: { color: COLORS.muted, fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  catRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F0EFEB' },
  catChipActive: { backgroundColor: COLORS.yellow },
  catText: { color: COLORS.muted, fontWeight: '700', fontSize: 12 },
  catTextActive: { color: COLORS.ink },
  input: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 14, fontSize: 14, color: COLORS.ink, backgroundColor: '#FAFAF8' },
  textarea: { height: 120, paddingTop: 12 },
  submitButton: { height: 50, borderRadius: 12, backgroundColor: COLORS.yellow, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  submitText: { color: COLORS.ink, fontWeight: '800', fontSize: 15 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: COLORS.muted, marginTop: 10, fontSize: 13 },
  ticketRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.paper, borderRadius: 14, padding: 14, marginBottom: 10, gap: 10 },
  ticketSubject: { color: COLORS.ink, fontWeight: '800', fontSize: 14 },
  ticketMeta: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  ticketMsg: { color: '#666', fontSize: 12, marginTop: 6, lineHeight: 17 },
  statusPill: { backgroundColor: '#FFF8DC', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { color: COLORS.muted, fontSize: 10, fontWeight: '800' },
});
