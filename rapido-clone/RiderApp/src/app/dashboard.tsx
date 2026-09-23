import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { COLORS } from '@/constants';
import api from '@/api/axios';
import { getSocket, disconnectSocket } from '@/api/socket';
import { clearTokens } from '@/storage/authStorage';
import * as Location from 'expo-location';

type Tab = 'home' | 'rides' | 'earnings' | 'profile';
type RideRequest = { id: number; pickup_address: string; dropoff_address: string; estimated_fare: number; distance_km?: number; eta_minutes?: number; vehicle_type?: string; expiresAt?: number };
type ActiveRide = { id: number; status: string; pickup_address: string; dropoff_address: string; pickup_lat?: number; pickup_lng?: number; dropoff_lat?: number; dropoff_lng?: number; ride_otp?: string; estimated_fare?: number; final_fare?: number; user?: { name: string; phone?: string } };

// The API returns the driver's KYC decision as `status`. Older API versions
// used `kyc_status`, so accept either shape while clients are being updated.
const isDriverApproved = (driver: any) =>
  String(driver?.status ?? driver?.kyc_status ?? '').toUpperCase() === 'APPROVED';

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('home');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isOnline , setOnline] = useState(false);
  const [request, setRequest] = useState<RideRequest | null>(null);
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const locationSub = useRef<Location.LocationSubscription | null>(null);
  const requestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const res = await api.get('/driver/profile');
      const driver = res.data?.driver;
      setProfile(driver);
      setOnline(driver?.is_online === 1 || driver?.is_online === true);
      if (!isDriverApproved(driver)) {
        Alert.alert('KYC pending', 'Upload and get your documents approved before going online.', [
          { text: 'Go to KYC', onPress: () => router.push('/kyc') },
          { text: 'Later', style: 'cancel' },
        ]);
      }
    } catch (e: any) {
      if (e?.response?.status === 401) { await clearTokens(); router.replace('/'); return; }
      console.log('PROFILE ERROR', e?.response?.data || e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActiveRide = useCallback(async () => {
    try {
      const res = await api.get('/driver/rides/active');
      const ride = res.data?.ride;
      if (ride && !['COMPLETED', 'CANCELLED'].includes(ride.status)) setActiveRide(ride);
      else setActiveRide(null);
    } catch { setActiveRide(null); }
  }, []);

  useEffect(() => {
    loadProfile();
    loadActiveRide();
  }, [loadProfile, loadActiveRide]);

  useEffect(() => {
    if (tab === 'rides') api.get('/driver/trips').then((r) => setTrips(r.data?.trips || [])).catch(() => {});
    if (tab === 'earnings') api.get('/driver/earnings').then((r) => setEarnings(r.data?.earnings || r.data)).catch(() => {});
  }, [tab]);

  useEffect(() => {
    let socket: any;
    let mounted = true;
    (async () => {
      socket = await getSocket();
      socket.on('ride:request', (data: any) => {
        if (!mounted || activeRide) return;
        const req: RideRequest = {
          id: data?.ride?.id,
          pickup_address: data?.ride?.pickup_address,
          dropoff_address: data?.ride?.dropoff_address,
          estimated_fare: data?.ride?.estimated_fare,
          distance_km: data?.ride?.distance_km,
          eta_minutes: data?.ride?.eta_minutes,
          vehicle_type: data?.ride?.vehicle_type,
        };
        setRequest(req);
        if (requestTimer.current) clearTimeout(requestTimer.current);
        requestTimer.current = setTimeout(() => setRequest(null), 30000);
      });
      socket.on('ride:cancelled', () => { if (mounted) { setActiveRide(null); setRequest(null); } });
    })();
    return () => {
      mounted = false;
      if (requestTimer.current) clearTimeout(requestTimer.current);
      if (socket) { socket.off('ride:request'); socket.off('ride:cancelled'); }
    };
  }, [activeRide]);

  const startLocationWatch = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Location needed', 'Allow location to receive rides.'); setOnline(false); return; }
    const bg = await Location.requestBackgroundPermissionsAsync().catch(() => ({ status: 'denied' }));
    locationSub.current?.remove();
    locationSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 10 },
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          await api.post('/driver/location', { lat: latitude, lng: longitude });
          const socket = await getSocket();
          socket.emit('driver:location', { lat: latitude, lng: longitude });
        } catch {}
      }
    );
  }, []);

  const toggleOnline = async () => {
    if (busy) return;
    if (!isDriverApproved(profile)) {
      Alert.alert('KYC not approved', 'Wait for admin approval before going online.');
      return;
    }
    setBusy(true);
    const next = !isOnline ;
    try {
      await api.post('/driver/online', { isOnline: next });
      setOnline(next);
      const socket = await getSocket();
      socket.emit('driver:online', { isOnline : next });
      if (next) await startLocationWatch();
      else locationSub.current?.remove();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Unable to change status.');
    } finally {
      setBusy(false);
    }
  };

  const acceptRequest = async () => {
    if (!request || busy) return;
    setBusy(true);
    try {
      const res = await api.post(`/driver/rides/${request.id}/accept`);
      setRequest(null);
      if (requestTimer.current) clearTimeout(requestTimer.current);
      setActiveRide(res.data?.ride || { id: request.id, status: 'ACCEPTED', pickup_address: request.pickup_address, dropoff_address: request.dropoff_address });
    } catch (e: any) {
      Alert.alert('Accept failed', e?.response?.data?.message || 'Try again.');
      setRequest(null);
    } finally {
      setBusy(false);
    }
  };

  const rejectRequest = async () => {
    if (!request) return;
    setRequest(null);
    if (requestTimer.current) clearTimeout(requestTimer.current);
    try { await api.post(`/driver/rides/${request.id}/reject`); } catch {}
  };

  const rideAction = async (action: 'arrive' | 'start' | 'complete' | 'cancel') => {
    if (!activeRide || busy) return;
    if (action === 'start' && otpInput.trim().length < 4) { Alert.alert('OTP required', 'Ask the rider for the 4-digit OTP.'); return; }
    if (action === 'cancel') {
      Alert.alert('Cancel ride', 'Are you sure? This may affect your rating.', [
        { text: 'Keep', style: 'cancel' },
        { text: 'Cancel ride', style: 'destructive', onPress: async () => {
          setBusy(true);
          try { await api.post(`/driver/rides/${activeRide.id}/cancel`, { reason: 'Driver cancelled' }); setActiveRide(null); }
          catch (e: any) { Alert.alert('Error', e?.response?.data?.message || 'Unable to cancel.'); }
          finally { setBusy(false); }
        } },
      ]);
      return;
    }
    setBusy(true);
    try {
      const body = action === 'start' ? { otp: otpInput.trim() } : {};
      const res = await api.post(`/driver/rides/${activeRide.id}/${action}`, body);
      if (action === 'complete') {
        const fare = res.data?.ride?.final_fare;
        Alert.alert('Trip completed', fare ? `₹${fare} added to your wallet.` : 'Great job!');
        setActiveRide(null);
        setOtpInput('');
        setTab('earnings');
      } else {
        setActiveRide(res.data?.ride || { ...activeRide, status: action === 'arrive' ? 'ARRIVING' : 'STARTED' });
      }
    } catch (e: any) {
      Alert.alert('Action failed', e?.response?.data?.message || 'Try again.');
    } finally {
      setBusy(false);
    }
  };

  const navigateTo = (lat?: number, lng?: number) => {
    if (!lat || !lng) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Sign out of captain app?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        try { await api.post('/auth/logout'); } catch {}
        locationSub.current?.remove();
        disconnectSocket();
        await clearTokens();
        router.replace('/');
      } },
    ]);
  };

  if (loading) {
    return <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color={COLORS.yellow} /></SafeAreaView>;
  }

  const firstName = profile?.name?.split(' ')[0] || 'Captain';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.kicker}>SAWAARI <Text style={styles.yellow}>CAPTAIN</Text></Text>
          <Text style={styles.greeting}>Hi, {firstName}</Text>
        </View>
        <Pressable style={styles.bell} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={21} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {tab === 'home' && (
          <>
            <View style={styles.statusCard}>
              <View>
                <Text style={styles.muted}>STATUS</Text>
                <View style={styles.statusLine}>
                  <View style={[styles.statusDot, { backgroundColor: isOnline  ? COLORS.green : COLORS.red }]} />
                  <Text style={styles.statusText}>{isOnline  ? 'Online' : 'Offline'}</Text>
                </View>
                <Text style={styles.statusHint}>{isOnline  ? 'Receiving ride requests' : 'Go online to earn'}</Text>
              </View>
              <Pressable style={[styles.toggle, isOnline  && styles.toggleOn]} onPress={toggleOnline} disabled={busy}>
                <View style={[styles.toggleThumb, isOnline  && styles.toggleThumbOn]} />
              </Pressable>
            </View>

            {!isDriverApproved(profile) && (
              <Pressable style={styles.kycBanner} onPress={() => router.push('/kyc')}>
                <Ionicons name="document-text-outline" size={20} color={COLORS.ink} />
                <Text style={styles.kycBannerText}>Complete KYC to start earning</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.ink} />
              </Pressable>
            )}

            {request && !activeRide && (
              <View style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View>
                    <Text style={styles.yellowKicker}>NEW RIDE REQUEST</Text>
                    <Text style={styles.requestTimer}>
                      {request.vehicle_type || 'Ride'}
                      {request.distance_km != null ? ` · ${Number(request.distance_km).toFixed(1)} km away` : ''}
                      {request.eta_minutes != null ? ` · ~${request.eta_minutes} min` : ''}
                    </Text>
                  </View>
                  <View style={styles.fare}>
                    <Text style={styles.fareValue}>₹{request.estimated_fare ?? 0}</Text>
                  </View>
                </View>
                <View style={styles.route}>
                  <View style={styles.routeRail}>
                    <View style={styles.routeDot} />
                    <View style={styles.routeLine} />
                    <View style={[styles.routeDot, styles.routeDrop]} />
                  </View>
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeLabel}>PICKUP</Text>
                    <Text style={styles.routeValue} numberOfLines={2}>{request.pickup_address}</Text>
                    <Text style={[styles.routeLabel, { marginTop: 10 }]}>DROP</Text>
                    <Text style={styles.routeValue} numberOfLines={2}>{request.dropoff_address}</Text>
                  </View>
                </View>
                <View style={styles.requestActions}>
                  <Pressable style={styles.rejectButton} onPress={rejectRequest} disabled={busy}><Text style={styles.rejectText}>Reject</Text></Pressable>
                  <Pressable style={styles.acceptButton} onPress={acceptRequest} disabled={busy}>
                    {busy ? <ActivityIndicator color={COLORS.ink} /> : <Text style={styles.acceptText}>Accept</Text>}
                  </Pressable>
                </View>
              </View>
            )}

            {activeRide && (
              <View style={styles.activeCard}>
                <Text style={styles.yellowKicker}>ACTIVE TRIP · {activeRide.status}</Text>
                <View style={styles.route}>
                  <View style={styles.routeRail}>
                    <View style={styles.routeDot} />
                    <View style={styles.routeLine} />
                    <View style={[styles.routeDot, styles.routeDrop]} />
                  </View>
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeLabel}>PICKUP</Text>
                    <Text style={styles.routeValue} numberOfLines={2}>{activeRide.pickup_address}</Text>
                    <Text style={[styles.routeLabel, { marginTop: 10 }]}>DROP</Text>
                    <Text style={styles.routeValue} numberOfLines={2}>{activeRide.dropoff_address}</Text>
                  </View>
                </View>

                {activeRide.user && (
                  <View style={styles.passenger}>
                    <View style={styles.passengerAvatar}><Text style={styles.avatarLetter}>{activeRide.user.name?.charAt(0) || 'R'}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.routeValue}>{activeRide.user.name}</Text>
                      {activeRide.user.phone && <Text style={styles.metaText}>{activeRide.user.phone}</Text>}
                    </View>
                    {activeRide.user.phone && (
                      <Pressable style={styles.callButton} onPress={() => Linking.openURL(`tel:${activeRide.user!.phone}`)}>
                        <Ionicons name="call" size={18} color={COLORS.green} />
                      </Pressable>
                    )}
                  </View>
                )}

                {activeRide.status === 'ACCEPTED' && (
                  <Pressable style={styles.navButton} onPress={() => navigateTo(activeRide.pickup_lat, activeRide.pickup_lng)}>
                    <Ionicons name="navigate-outline" size={18} color={COLORS.ink} />
                    <Text style={styles.navButtonText}>Navigate to pickup</Text>
                  </Pressable>
                )}

                {activeRide.status === 'STARTED' && (
                  <Pressable style={styles.navButton} onPress={() => navigateTo(activeRide.dropoff_lat, activeRide.dropoff_lng)}>
                    <Ionicons name="navigate-outline" size={18} color={COLORS.ink} />
                    <Text style={styles.navButtonText}>Navigate to drop</Text>
                  </Pressable>
                )}

                {activeRide.status === 'ACCEPTED' && (
                  <View style={styles.otpRow}>
                    <Text style={styles.otpLabel}>Rider OTP</Text>
                    <View style={styles.otpInputWrap}>
                      <TextInputOtp value={otpInput} onChangeText={setOtpInput} />
                    </View>
                  </View>
                )}

                <View style={styles.requestActions}>
                  {activeRide.status === 'ACCEPTED' && (
                    <Pressable style={styles.acceptButton} onPress={() => rideAction('arrive')} disabled={busy}>
                      <Text style={styles.acceptText}>Mark Arrived</Text>
                    </Pressable>
                  )}
                  {activeRide.status === 'ARRIVING' && (
                    <Pressable style={styles.acceptButton} onPress={() => rideAction('start')} disabled={busy}>
                      {busy ? <ActivityIndicator color={COLORS.ink} /> : <Text style={styles.acceptText}>Start Trip (OTP)</Text>}
                    </Pressable>
                  )}
                  {activeRide.status === 'STARTED' && (
                    <Pressable style={styles.acceptButton} onPress={() => rideAction('complete')} disabled={busy}>
                      {busy ? <ActivityIndicator color={COLORS.ink} /> : <Text style={styles.acceptText}>Complete Trip</Text>}
                    </Pressable>
                  )}
                  <Pressable style={styles.rejectButton} onPress={() => rideAction('cancel')} disabled={busy}>
                    <Text style={styles.rejectText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {!request && !activeRide && (
              <View style={styles.waiting}>
                <Ionicons name={isOnline  ? 'radio-outline' : 'moon-outline'} size={30} color={COLORS.muted} />
                <Text style={styles.waitingTitle}>{isOnline  ? 'Waiting for rides...' : 'You are offline'}</Text>
                <Text style={styles.waitingText}>{isOnline  ? 'New requests will appear here automatically.' : 'Toggle online to start receiving requests.'}</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Quick actions</Text>
            <View style={styles.actionRow}>
              <Pressable style={styles.quick} onPress={() => router.push('/kyc')}>
                <Ionicons name="document-text-outline" size={22} color={COLORS.ink} />
                <Text style={styles.quickText}>KYC</Text>
              </Pressable>
              <Pressable style={styles.quick} onPress={() => router.push('/wallet')}>
                <Ionicons name="wallet-outline" size={22} color={COLORS.ink} />
                <Text style={styles.quickText}>Wallet</Text>
              </Pressable>
              <Pressable style={styles.quick} onPress={() => router.push('/support')}>
                <Ionicons name="help-circle-outline" size={22} color={COLORS.ink} />
                <Text style={styles.quickText}>Support</Text>
              </Pressable>
            </View>
          </>
        )}

        {tab === 'rides' && (
          <>
            <Text style={styles.pageTitle}>Trips</Text>
            <Text style={styles.pageSubtitle}>Your recent completed and cancelled rides</Text>
            {trips.length === 0 ? (
              <View style={styles.waiting}><Ionicons name="navigate-outline" size={30} color={COLORS.muted} /><Text style={styles.waitingTitle}>No trips yet</Text><Text style={styles.waitingText}>Completed rides will appear here.</Text></View>
            ) : trips.map((t: any) => (
              <View key={t.id} style={styles.rideRow}>
                <View style={styles.rideIcon}><Ionicons name="car-outline" size={20} color={COLORS.ink} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rideTime}>{t.vehicle_type} · {new Date(t.created_at).toLocaleDateString()}</Text>
                  <Text style={styles.ridePlace} numberOfLines={1}>{t.pickup_address} → {t.dropoff_address}</Text>
                  <Text style={t.status === 'COMPLETED' ? styles.completed : styles.rideTime}>{t.status}</Text>
                </View>
                <Text style={styles.rideFare}>₹{t.final_fare ?? t.estimated_fare ?? 0}</Text>
              </View>
            ))}
          </>
        )}

        {tab === 'earnings' && (
          <>
            <Text style={styles.pageTitle}>Earnings</Text>
            <Text style={styles.pageSubtitle}>Wallet balance and payout summary</Text>
            <View style={styles.earningHero}>
              <Text style={styles.mutedLight}>WALLET BALANCE</Text>
              <Text style={styles.earningValue}>₹{earnings?.walletBalance ?? profile?.wallet_balance ?? 0}</Text>
              <Text style={styles.earningChange}>Total earned: ₹{earnings?.totalEarned ?? 0} · {earnings?.totalTrips ?? 0} trips</Text>
            </View>
            <Pressable style={styles.payout} onPress={() => router.push('/payout')}>
              <View>
                <Text style={styles.menuTitle}>Request payout</Text>
                <Text style={styles.payoutDate}>Withdraw earnings to your bank/UPI</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
            </Pressable>
          </>
        )}

        {tab === 'profile' && (
          <>
            <View style={styles.profileHero}>
              <View style={styles.bigAvatar}><Text style={styles.bigAvatarText}>{profile?.name?.charAt(0) || 'C'}</Text></View>
              <Text style={styles.profileName}>{profile?.name}</Text>
              <View style={styles.rating}>
                <Ionicons name="star" size={14} color={COLORS.yellow} />
                <Text style={styles.ratingText}>{Number(profile?.rating || 0).toFixed(1)} · {profile?.total_rides || 0} rides</Text>
              </View>
            </View>
            <Pressable style={styles.menuRow} onPress={() => router.push('/kyc')}>
              <View style={styles.menuIcon}><Ionicons name="document-text-outline" size={18} color={COLORS.ink} /></View>
              <View style={{ flex: 1 }}><Text style={styles.menuTitle}>KYC Documents</Text><Text style={styles.muted}>{profile?.status ?? profile?.kyc_status ?? 'PENDING'}</Text></View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
            </Pressable>
            <Pressable style={styles.menuRow} onPress={() => router.push('/vehicle')}>
              <View style={styles.menuIcon}><Ionicons name="car-outline" size={18} color={COLORS.ink} /></View>
              <View style={{ flex: 1 }}><Text style={styles.menuTitle}>Vehicle</Text><Text style={styles.muted}>{profile?.vehicle_model} · {profile?.vehicle_plate}</Text></View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
            </Pressable>
            <Pressable style={styles.menuRow} onPress={() => router.push('/support')}>
              <View style={styles.menuIcon}><Ionicons name="help-circle-outline" size={18} color={COLORS.ink} /></View>
              <View style={{ flex: 1 }}><Text style={styles.menuTitle}>Help & Support</Text></View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
            </Pressable>
            <Pressable style={styles.logout} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color={COLORS.red} />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <View style={styles.nav}>
        {([['home', 'Home', 'grid-outline'], ['rides', 'Trips', 'navigate-outline'], ['earnings', 'Earnings', 'bar-chart-outline'], ['profile', 'Profile', 'person-outline']] as const).map(([key, label, icon]) => (
          <Pressable key={key} style={styles.navItem} onPress={() => setTab(key)}>
            <Ionicons name={icon} size={21} color={tab === key ? COLORS.yellow : '#79817D'} />
            <Text style={[styles.navText, tab === key && styles.navTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function TextInputOtp({ value, onChangeText }: { value: string; onChangeText: (t: string) => void }) {
  const { TextInput } = require('react-native');
  return <TextInput value={value} onChangeText={(t: string) => onChangeText(t.replace(/[^0-9]/g, '').slice(0, 4))} placeholder="----" placeholderTextColor="#9A9E9B" keyboardType="number-pad" style={{ flex: 1, fontSize: 20, fontWeight: '900', color: COLORS.ink, letterSpacing: 8, textAlign: 'center' }} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  topBar: { backgroundColor: COLORS.ink, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { color: '#B6BCB9', fontSize: 11, fontWeight: '900', letterSpacing: 1.7 },
  yellow: { color: COLORS.yellow },
  greeting: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 6 },
  bell: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.inkSoft, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingBottom: 110 },
  statusCard: { backgroundColor: COLORS.paper, borderRadius: 20, padding: 17, marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  muted: { color: COLORS.muted, fontSize: 11, fontWeight: '700' },
  mutedLight: { color: '#AAB0AD', fontSize: 11, fontWeight: '700' },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 7 },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  statusText: { color: COLORS.ink, fontSize: 16, fontWeight: '900' },
  statusHint: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  toggle: { width: 49, height: 29, borderRadius: 17, backgroundColor: '#D9DDDA', padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: COLORS.green },
  toggleThumb: { width: 23, height: 23, borderRadius: 12, backgroundColor: '#fff' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  kycBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF8DC', borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#F5E6A8' },
  kycBannerText: { flex: 1, color: COLORS.ink, fontWeight: '700', fontSize: 13 },
  requestCard: { backgroundColor: COLORS.ink, borderRadius: 22, padding: 18, marginTop: 14 },
  activeCard: { backgroundColor: COLORS.ink, borderRadius: 22, padding: 18, marginTop: 14 },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  yellowKicker: { color: COLORS.yellow, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  requestTimer: { color: '#C4CAC7', fontSize: 13, marginTop: 5 },
  fare: { alignItems: 'flex-end' },
  fareValue: { color: '#fff', fontSize: 24, fontWeight: '900' },
  route: { flexDirection: 'row', marginTop: 18 },
  routeRail: { width: 17, alignItems: 'center', paddingTop: 3 },
  routeDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.yellow },
  routeDrop: { backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.yellow },
  routeLine: { height: 32, borderLeftWidth: 1, borderLeftColor: '#59615E' },
  routeInfo: { flex: 1, marginLeft: 11 },
  routeLabel: { color: '#8D9691', fontSize: 10, fontWeight: '800', letterSpacing: .8 },
  routeValue: { color: '#fff', fontSize: 15, fontWeight: '800', marginTop: 4 },
  metaText: { color: '#BDC3C0', fontSize: 11 },
  passenger: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#343A39' },
  passengerAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F2D96F', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: COLORS.ink, fontSize: 15, fontWeight: '900' },
  callButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E1F2E9', alignItems: 'center', justifyContent: 'center' },
  navButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderRadius: 12, backgroundColor: COLORS.yellow, marginTop: 14 },
  navButtonText: { color: COLORS.ink, fontWeight: '800', fontSize: 13 },
  otpRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  otpLabel: { color: '#8D9691', fontSize: 12, fontWeight: '700' },
  otpInputWrap: { flex: 1, height: 48, borderRadius: 12, backgroundColor: '#202526', borderWidth: 1, borderColor: '#303636', paddingHorizontal: 12, justifyContent: 'center' },
  requestActions: { flexDirection: 'row', gap: 10, marginTop: 17 },
  acceptButton: { flex: 2, height: 52, borderRadius: 14, backgroundColor: COLORS.yellow, alignItems: 'center', justifyContent: 'center' },
  acceptText: { color: COLORS.ink, fontSize: 15, fontWeight: '900' },
  rejectButton: { flex: 1, height: 52, borderRadius: 14, backgroundColor: '#343A39', alignItems: 'center', justifyContent: 'center' },
  rejectText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  waiting: { backgroundColor: COLORS.paper, borderRadius: 20, padding: 26, marginTop: 14, alignItems: 'center' },
  waitingTitle: { color: COLORS.ink, fontSize: 17, fontWeight: '900', marginTop: 10 },
  waitingText: { color: COLORS.muted, fontSize: 13, marginTop: 5, textAlign: 'center' },
  sectionTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '900', marginTop: 22, marginBottom: 11 },
  actionRow: { flexDirection: 'row', gap: 9 },
  quick: { flex: 1, backgroundColor: COLORS.paper, borderRadius: 16, paddingVertical: 16, alignItems: 'center', gap: 8 },
  quickText: { color: COLORS.ink, fontSize: 11, fontWeight: '800' },
  pageTitle: { color: COLORS.ink, fontSize: 28, fontWeight: '900', marginTop: 7 },
  pageSubtitle: { color: COLORS.muted, fontSize: 13, marginTop: 5, marginBottom: 21 },
  rideRow: { backgroundColor: COLORS.paper, borderRadius: 18, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  rideIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#F2D96F', alignItems: 'center', justifyContent: 'center' },
  rideTime: { color: COLORS.muted, fontSize: 11, fontWeight: '700' },
  ridePlace: { color: COLORS.ink, fontSize: 14, fontWeight: '800', marginTop: 5 },
  rideFare: { color: COLORS.ink, fontSize: 16, fontWeight: '900' },
  completed: { color: COLORS.green, fontSize: 10, fontWeight: '800', marginTop: 5 },
  earningHero: { backgroundColor: COLORS.ink, borderRadius: 22, padding: 20, marginTop: 10 },
  earningValue: { color: '#fff', fontSize: 38, fontWeight: '900', marginTop: 6 },
  earningChange: { color: '#C4CAC7', fontSize: 12, marginTop: 7 },
  payout: { backgroundColor: COLORS.paper, borderRadius: 17, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  payoutDate: { color: COLORS.muted, fontSize: 11, marginTop: 5 },
  profileHero: { backgroundColor: COLORS.ink, borderRadius: 22, padding: 22, alignItems: 'center', marginTop: 10 },
  bigAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.yellow, alignItems: 'center', justifyContent: 'center' },
  bigAvatarText: { color: COLORS.ink, fontSize: 30, fontWeight: '900' },
  profileName: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 12 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  ratingText: { color: '#D3D8D5', fontSize: 12 },
  menuRow: { backgroundColor: COLORS.paper, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  menuIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F0EFEB', alignItems: 'center', justifyContent: 'center' },
  menuTitle: { color: COLORS.ink, fontSize: 14, fontWeight: '800', marginBottom: 4 },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 27, padding: 14 },
  logoutText: { color: COLORS.red, fontSize: 14, fontWeight: '800' },
  nav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 74, backgroundColor: COLORS.ink, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12 },
  navItem: { alignItems: 'center', width: '25%' },
  navText: { color: '#79817D', fontSize: 10, fontWeight: '700', marginTop: 4 },
  navTextActive: { color: COLORS.yellow },
});
