import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const BRAND_YELLOW = '#FACC15';
const BRAND_BLACK = '#111111';

export default function SearchingScreen() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={BRAND_BLACK} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Finding a Ride</Text>

        <View style={styles.timerPill}>
          <Text style={styles.timerText}>{formatElapsed(elapsedSeconds)}</Text>
        </View>
      </View>

      {/* Main */}
      <View style={styles.content}>
        {/* Radar pulse animation */}
        <View style={styles.radarWrap}>
          <Animated.View style={[styles.pulseRing, pulseStyle(pulse1)]} />
          <Animated.View style={[styles.pulseRing, pulseStyle(pulse2)]} />
          <Animated.View style={[styles.pulseRing, pulseStyle(pulse3)]} />

          <View style={styles.searchCircle}>
            <View style={styles.innerCircle}>
              <Ionicons name="car-sport" size={38} color={BRAND_BLACK} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Finding your captain</Text>
        <Text style={styles.subtitle}>
          Matching you with the nearest driver.{'\n'}Usually takes under a minute.
        </Text>

        {/* Route card */}
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <View style={styles.iconDotWrap}>
              <View style={styles.pickupDot} />
            </View>

            <View style={styles.routeText}>
              <Text style={styles.label}>Pickup</Text>
              <Text style={styles.location} numberOfLines={1}>
                Current location
              </Text>
            </View>
          </View>

          <View style={styles.routeLineWrap}>
            <View style={styles.routeLine} />
          </View>

          <View style={styles.routeRow}>
            <View style={styles.iconDotWrap}>
              <Ionicons name="flag" size={13} color={BRAND_BLACK} />
            </View>

            <View style={styles.routeText}>
              <Text style={styles.label}>Destination</Text>
              <Text style={styles.location} numberOfLines={1}>
                Your destination
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <View style={styles.safetyRow}>
          <Ionicons name="shield-checkmark-outline" size={15} color="#666666" />
          <Text style={styles.safeText}>
            Every ride is tracked and shareable with your contacts
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>Cancel Ride</Text>
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
    minWidth: 34,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },

  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  radarWrap: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
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
    shadowOffset: { width: 0, height: 4 },
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: BRAND_BLACK,
    marginTop: 26,
    letterSpacing: -0.3,
  },

  subtitle: {
    textAlign: 'center',
    fontSize: 13.5,
    lineHeight: 20,
    color: '#777777',
    marginTop: 8,
  },

  routeCard: {
    width: '100%',
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#eeeeee',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#fafafa',
  },

  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconDotWrap: {
    width: 22,
    alignItems: 'center',
  },

  routeText: {
    marginLeft: 12,
    marginBottom:-4,
    flex: 1,
  },

  label: {
    fontSize: 11.5,
    color: '#999999',
    fontWeight: '600',
    marginBottom: 3,
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
  },

  routeLine: {
    height: 22,
    width: 1,
    backgroundColor: '#d4d4d4',
    marginVertical: 4,
  },

  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    paddingHorizontal: 8,
  },

  safeText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 6,
    flexShrink: 1,
    textAlign: 'center',
  },

  cancelButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#dddddd',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 15,
    fontWeight: '800',
    color: BRAND_BLACK,
  },
});
