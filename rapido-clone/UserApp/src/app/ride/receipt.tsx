import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Share } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/api/axios';

export default function ReceiptScreen() {
  const params = useLocalSearchParams<{ rideId?: string }>();
  const rideId = params.rideId;
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (!rideId) return;
    api.get(`/rides/${rideId}/receipt`)
      .then((r) => setReceipt(r.data?.receipt || r.data))
      .catch((e) => console.log('RECEIPT ERROR', e?.response?.data || e?.message))
      .finally(() => setLoading(false));
  }, [rideId]);

  const pay = async (method: 'CASH' | 'WALLET') => {
    if (!rideId) return;
    setPaying(method);
    try {
      const res = await api.post(`/rides/${rideId}/pay`, { method });
      setReceipt((prev: any) => ({ ...prev, ...res.data?.receipt, paymentStatus: 'PAID' }));
      Alert.alert('Payment done', `Paid via ${method}.`);
    } catch (e: any) {
      Alert.alert('Payment failed', e?.response?.data?.message || 'Try again.');
    } finally {
      setPaying(null);
    }
  };

  const submitRating = async () => {
    if (!rideId || !rating) return;
    try {
      await api.post('/ratings', { rideId: Number(rideId), rating, targetType: 'DRIVER' });
      Alert.alert('Thanks', 'Your rating was submitted.');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Unable to submit rating.');
    }
  };

  const shareRide = async () => {
    if (!rideId) return;
    try {
      const res = await api.get(`/rides/${rideId}/share`);
      await Share.share({ message: res.data?.shareLink || `Track my ride: ${rideId}` });
    } catch { Alert.alert('Error', 'Unable to share ride.'); }
  };

  if (loading) {
    return <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color="#111111" /></SafeAreaView>;
  }

  const ride = receipt?.ride || receipt || {};
  const paid = ride.payment_status === 'PAID' || receipt?.paymentStatus === 'PAID';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="checkmark-circle" size={54} color="#10B981" />
          <Text style={styles.title}>Ride completed</Text>
          <Text style={styles.subtitle}>Reference #{ride.reference_number || rideId}</Text>
        </View>

        <View style={styles.card}>
          <Row label="Pickup" value={ride.pickup_address} />
          <Row label="Destination" value={ride.dropoff_address} />
          <Row label="Distance" value={ride.distance_km ? `${Number(ride.distance_km).toFixed(2)} km` : '-'} />
          <Row label="Duration" value={ride.duration_minutes ? `${ride.duration_minutes} min` : '-'} />
          <Row label="Vehicle" value={ride.vehicle_type} />
        </View>

        <View style={styles.fareCard}>
          <Row label="Base fare" value={`₹${ride.base_fare ?? 0}`} />
          <Row label="Distance" value={`₹${ride.distance_fare ?? 0}`} />
          <Row label="Time" value={`₹${ride.time_fare ?? 0}`} />
          {ride.coupon_discount > 0 && <Row label="Coupon discount" value={`-₹${ride.coupon_discount}`} />}
          <View style={styles.divider} />
          <Row label="Total fare" value={`₹${ride.final_fare ?? ride.estimated_fare ?? 0}`} bold />
        </View>

        {!paid && (
          <View style={styles.payRow}>
            <TouchableOpacity style={styles.payButton} disabled={paying === 'CASH'} onPress={() => pay('CASH')}>
              {paying === 'CASH' ? <ActivityIndicator color="#fff" /> : <Text style={styles.payText}>Pay Cash</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.payButton, { backgroundColor: '#FACC15' }]} disabled={paying === 'WALLET'} onPress={() => pay('WALLET')}>
              {paying === 'WALLET' ? <ActivityIndicator color="#111" /> : <Text style={[styles.payText, { color: '#111' }]}>Pay Wallet</Text>}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>Rate your captain</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setRating(n)}>
                <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={30} color="#FACC15" />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <TouchableOpacity style={styles.submitRating} onPress={submitRating}>
              <Text style={styles.submitRatingText}>Submit rating</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={shareRide}>
          <Ionicons name="share-outline" size={18} color="#111111" />
          <Text style={styles.shareText}>Share ride details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/main/home')}>
          <Text style={styles.homeText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, bold }: { label: string; value?: string | number | null; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.bold]} numberOfLines={2}>{value ?? '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#111111', marginTop: 10 },
  subtitle: { fontSize: 13, color: '#888888', marginTop: 4 },
  card: { borderWidth: 1, borderColor: '#eeeeee', borderRadius: 14, padding: 14, backgroundColor: '#fafafa', marginBottom: 14 },
  fareCard: { borderWidth: 1, borderColor: '#eeeeee', borderRadius: 14, padding: 14, backgroundColor: '#ffffff', marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { fontSize: 13, color: '#666666', flex: 1 },
  rowValue: { fontSize: 13, color: '#111111', fontWeight: '600', flex: 1, textAlign: 'right' },
  bold: { fontWeight: '800', fontSize: 15, color: '#111111' },
  divider: { height: 1, backgroundColor: '#eeeeee', marginVertical: 6 },
  payRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  payButton: { flex: 1, height: 48, borderRadius: 12, backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center' },
  payText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  ratingCard: { borderWidth: 1, borderColor: '#eeeeee', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 14 },
  ratingTitle: { fontSize: 15, fontWeight: '700', color: '#111111', marginBottom: 10 },
  stars: { flexDirection: 'row', gap: 6 },
  submitRating: { marginTop: 12, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: '#111111' },
  submitRatingText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  shareButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, borderRadius: 12, borderWidth: 1, borderColor: '#dddddd', marginBottom: 10 },
  shareText: { fontWeight: '700', color: '#111111', fontSize: 14 },
  homeButton: { height: 50, borderRadius: 12, backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center' },
  homeText: { color: '#ffffff', fontWeight: '800', fontSize: 15 },
});
