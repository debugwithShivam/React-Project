import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getSocket } from '@/api/socket';
import api from '@/api/axios';

const BRAND_YELLOW = '#FACC15';
const BRAND_BLACK = '#111111';

export default function SearchingScreen() {
  const params = useLocalSearchParams<{ rideId?: string }>();
  const rideId = params.rideId;
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!rideId) return;
    let socket: any;
    let mounted = true;

    (async () => {
      socket = await getSocket();
      socket.emit('ride:join', { rideId });

      socket.on('ride:accepted', (data: any) => {
        if (!mounted) return;
        router.replace({ pathname: '/ride/tracking', params: { rideId: String(data?.ride?.id || rideId) } });
      });

      socket.on('ride:cancelled', (data: any) => {
        if (!mounted) return;
        Alert.alert('Ride cancelled', data?.reason || 'The ride was cancelled.', [
          { text: 'OK', onPress: () => router.replace('/main/home') },
        ]);
      });
    })();

    return () => {
      mounted = false;
      if (socket) {
        socket.off('ride:accepted');
        socket.off('ride:cancelled');
        socket.emit('ride:leave', { rideId });
      }
    };
  }, [rideId]);

  const handleCancel = async () => {
    if (!rideId) { router.back(); return; }
    try {
      await api.patch(`/rides/${rideId}/cancel`, { reason: 'User cancelled while searching' });
    } catch (e: any) {
      console.log('CANCEL ERROR', e?.response?.data || e?.message);
    } finally {
      router.replace('/main/home');
    }
  };

  useEffect(() => {
    const makePulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 2200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

    const anim1 = makePulse(pulse1, 0);
    const anim2 = makePulse(pulse2, 730);
    const anim3 = makePulse(pulse3, 1460);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatElapsed = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;

    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const pulseStyle = (value: Animated.Value) => ({
    opacity: value.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0.30, 0.12, 0],
    }),

    transform: [
      {
        scale: value.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.5],
        }),
      },
    ],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={BRAND_BLACK}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Finding a Ride
        </Text>

        <View style={styles.timerPill}>
          <Text style={styles.timerText}>
            {formatElapsed(elapsedSeconds)}
          </Text>
        </View>
      </View>

      {/* MAIN CONTENT */}
      <View style={styles.content}>

        {/* RADAR */}
        <View style={styles.radarWrap}>
          <Animated.View
            style={[
              styles.pulseRing,
              pulseStyle(pulse1),
            ]}
          />

          <Animated.View
            style={[
              styles.pulseRing,
              pulseStyle(pulse2),
            ]}
          />

          <Animated.View
            style={[
              styles.pulseRing,
              pulseStyle(pulse3),
            ]}
          />

          <View style={styles.searchCircle}>
            <View style={styles.innerCircle}>
              <Ionicons
                name="car-sport"
                size={38}
                color={BRAND_BLACK}
              />
            </View>
          </View>
        </View>

        {/* TITLE */}
        <Text style={styles.title}>
          Finding your captain
        </Text>

        <Text style={styles.subtitle}>
          Matching you with the nearest driver.{'\n'}
          Usually takes under a minute.
        </Text>

        {/* ROUTE CARD */}
        <View style={styles.routeCard}>

          {/* PICKUP */}
          <View style={styles.routeRow}>
            <View style={styles.iconDotWrap}>
              <View style={styles.pickupDot} />
            </View>

            <View style={styles.routeText}>
              <Text style={styles.label}>
                Pickup
              </Text>

              <Text
                style={styles.location}
                numberOfLines={1}
              >
                Current location
              </Text>
            </View>
          </View>

          {/* CONNECTOR */}
          <View style={styles.routeLineWrap}>
            <View style={styles.routeLine} />
          </View>

          {/* DESTINATION */}
          <View style={styles.routeRow}>
            <View style={styles.iconDotWrap}>
              <Ionicons
                name="flag"
                size={13}
                color={BRAND_BLACK}
              />
            </View>

            <View style={styles.routeText}>
              <Text style={styles.label}>
                Destination
              </Text>

              <Text
                style={styles.location}
                numberOfLines={1}
              >
                Your destination
              </Text>
            </View>
          </View>

        </View>
      </View>

      {/* BOTTOM */}
      <View style={styles.bottom}>

        <View style={styles.safetyRow}>
          <Ionicons
            name="shield-checkmark-outline"
            size={15}
            color="#666666"
          />

          <Text style={styles.safeText}>
            Every ride is tracked and shareable with your contacts
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.8}
          onPress={handleCancel}
        >
          <Text style={styles.cancelText}>
            Cancel Ride
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  /* ================= HEADER ================= */

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 20,

    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },

  headerButton: {
    width: 34,
    height: 34,

    borderRadius: 17,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#f5f5f5',
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: BRAND_BLACK,
    letterSpacing: -0.2,
  },

  timerPill: {
    minWidth: 42,

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 12,

    backgroundColor: '#f5f5f5',

    alignItems: 'center',
    justifyContent: 'center',
  },

  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
  },

  /* ================= CONTENT ================= */

  content: {
    flex: 1,

    alignItems: 'center',

    paddingHorizontal: 16,
    paddingTop: 28,

    // Important:
    // Prevent children from being visually pushed
    // underneath the bottom section.
    minHeight: 0,
  },

  /* ================= RADAR ================= */

  radarWrap: {
    width: 150,
    height: 150,

    alignItems: 'center',
    justifyContent: 'center',

    flexShrink: 0,
  },

  pulseRing: {
    position: 'absolute',

    width: 150,
    height: 150,

    borderRadius: 75,

    backgroundColor: BRAND_YELLOW,
  },

  searchCircle: {
    width: 128,
    height: 128,

    borderRadius: 64,

    backgroundColor: '#f7f4e9',

    alignItems: 'center',
    justifyContent: 'center',
  },

  innerCircle: {
    width: 86,
    height: 86,

    borderRadius: 43,

    backgroundColor: '#ffffff',

    alignItems: 'center',
    justifyContent: 'center',

    elevation: 3,

    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  /* ================= TEXT ================= */

  title: {
    fontSize: 22,
    fontWeight: '800',

    color: BRAND_BLACK,

    marginTop: 20,

    letterSpacing: -0.3,

    textAlign: 'center',
  },

  subtitle: {
    textAlign: 'center',

    fontSize: 13.5,
    lineHeight: 19,

    color: '#777777',

    marginTop: 7,
  },

  /* ================= ROUTE CARD ================= */

  routeCard: {
    width: '100%',

    marginTop: 24,

    borderWidth: 1,
    borderColor: '#eeeeee',

    borderRadius: 16,

    paddingHorizontal: 16,
    paddingVertical: 13,

    backgroundColor: '#fafafa',

    // Don't allow this element to consume
    // unexpected vertical space.
    flexShrink: 1,
  },

  routeRow: {
    flexDirection: 'row',

    alignItems: 'center',

    minHeight: 42,
  },

  iconDotWrap: {
    width: 22,

    alignItems: 'center',
    justifyContent: 'center',

    flexShrink: 0,
  },

  routeText: {
    flex: 1,

    marginLeft: 12,

    // Removed the old marginBottom: -4
    // because it was causing vertical alignment issues.
  },

  label: {
    fontSize: 11.5,

    color: '#999999',

    fontWeight: '600',

    marginBottom: 2,
  },

  location: {
    fontSize: 14.5,

    fontWeight: '700',

    color: BRAND_BLACK,
  },

  pickupDot: {
    width: 11,
    height: 11,

    borderRadius: 5.5,

    backgroundColor: BRAND_BLACK,
  },

  routeLineWrap: {
    marginLeft: 10,

    height: 18,

    justifyContent: 'center',
  },

  routeLine: {
    height: 18,

    width: 1,

    backgroundColor: '#d4d4d4',
  },

  /* ================= BOTTOM ================= */

  bottom: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,

    backgroundColor: '#ffffff',
  },

  safetyRow: {
    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 10,

    paddingHorizontal: 8,
  },

  safeText: {
    flex: 1,

    fontSize: 11.5,

    lineHeight: 16,

    color: '#666666',

    marginLeft: 6,

    textAlign: 'center',
  },

  cancelButton: {
    height: 52,

    borderRadius: 14,

    borderWidth: 1.5,
    borderColor: '#dddddd',

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#ffffff',
  },

  cancelText: {
    fontSize: 15,

    fontWeight: '800',

    color: BRAND_BLACK,
  },
});