import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '@/api/axios';
import { COLORS } from '@/constants';

export default function NotificationsScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/notifications');
      setItems(res.data?.notifications || []);
    } catch (e: any) {
      console.log('NOTIF ERROR', e?.response?.data || e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, []);

  const markAllRead = async () => {
    try { await api.patch('/notifications/read-all'); await load(); } catch {}
  };

  if (loading) {
    return <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color={COLORS.yellow} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}><Ionicons name="checkmark-done-outline" size={22} color={COLORS.yellow} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {items.length === 0 ? (
          <View style={styles.empty}><Ionicons name="notifications-off-outline" size={34} color={COLORS.muted} /><Text style={styles.emptyText}>No notifications</Text></View>
        ) : items.map((n) => (
          <TouchableOpacity key={n.id} style={[styles.row, !n.is_read && styles.rowUnread]} activeOpacity={0.7}>
            <View style={[styles.iconBox, !n.is_read && { backgroundColor: '#FFF8DC' }]}>
              <Ionicons name={n.type === 'RIDE' ? 'car-outline' : n.type === 'PAYMENT' ? 'wallet-outline' : 'information-circle-outline'} size={18} color={COLORS.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{n.title}</Text>
              <Text style={styles.body} numberOfLines={2}>{n.body}</Text>
              <Text style={styles.date}>{new Date(n.created_at).toLocaleString()}</Text>
            </View>
            {!n.is_read && <View style={styles.dot} />}
          </TouchableOpacity>
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
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: COLORS.muted, marginTop: 10, fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.paper, borderRadius: 14, padding: 14, marginBottom: 10, gap: 12 },
  rowUnread: { borderWidth: 1, borderColor: '#F5E6A8' },
  iconBox: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F0EFEB', alignItems: 'center', justifyContent: 'center' },
  title: { color: COLORS.ink, fontWeight: '800', fontSize: 14 },
  body: { color: COLORS.muted, fontSize: 12, marginTop: 3, lineHeight: 17 },
  date: { color: '#AAB0AD', fontSize: 10, marginTop: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.yellow, marginTop: 6 },
});
