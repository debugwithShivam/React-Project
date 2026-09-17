import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Typography, BorderRadius, Spacing } from '../../theme';

const { width } = Dimensions.get('window');

export const SimulatedMap = ({
  height = 280,
  showRoute = true,
  pickupTitle = 'My Location',
  dropTitle = 'Destination',
  eta = '18 mins (6.4 km)',
  activeVehicleType = 'bike',
}) => {
  const { colors, isDark } = useTheme();

  // Pulse animation for pickup marker
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Moving vehicle animation along the route
  const carProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.35,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Vehicle traveling along the mock route
    const carLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(carProgress, {
          toValue: 1,
          duration: 7000,
          useNativeDriver: true,
        }),
        Animated.timing(carProgress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    carLoop.start();

    return () => {
      pulseLoop.stop();
      carLoop.stop();
    };
  }, []);

  const carTranslateX = carProgress.interpolate({
    inputRange: [0, 0.4, 0.7, 1],
    outputRange: [50, 140, 220, 280],
  });

  const carTranslateY = carProgress.interpolate({
    inputRange: [0, 0.4, 0.7, 1],
    outputRange: [160, 110, 80, 55],
  });

  const getVehicleIcon = () => {
    switch (activeVehicleType) {
      case 'auto':
        return 'rickshaw';
      case 'cab_mini':
        return 'car-hatchback';
      case 'cab_sedan':
        return 'car-side';
      case 'cab_xl':
        return 'car-estate';
      case 'bike':
      default:
        return 'motorbike';
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: isDark ? '#0F172A' : '#E2E8F0',
        },
      ]}
    >
      {/* City Road Grid Simulation */}
      <View style={StyleSheet.absoluteFill}>
        {/* Park area */}
        <View
          style={[
            styles.parkArea,
            {
              backgroundColor: isDark ? '#064E3B40' : '#DCFCE7',
              borderColor: isDark ? '#05966950' : '#86EFAC',
            },
          ]}
        />

        {/* Lake / Water body */}
        <View
          style={[
            styles.lakeArea,
            {
              backgroundColor: isDark ? '#0C4A6E40' : '#BAE6FD',
              borderColor: isDark ? '#0284C740' : '#7DD3FC',
            },
          ]}
        />

        {/* Diagonal Arterial Highway */}
        <View
          style={[
            styles.highway,
            {
              backgroundColor: isDark ? '#1E293B' : '#CBD5E1',
              borderColor: isDark ? '#334155' : '#94A3B8',
            },
          ]}
        />
        <View
          style={[
            styles.highwayHorizontal,
            {
              backgroundColor: isDark ? '#1E293B' : '#CBD5E1',
            },
          ]}
        />
        <View
          style={[
            styles.highwayVertical,
            {
              backgroundColor: isDark ? '#1E293B' : '#CBD5E1',
            },
          ]}
        />
        <View
          style={[
            styles.secondaryRoad1,
            {
              backgroundColor: isDark ? '#1A2436' : '#E2E8F0',
            },
          ]}
        />
      </View>

      {/* Simulated Active Route Polyline */}
      {showRoute && (
        <View style={styles.routeContainer}>
          {/* Route dashed / glow effect line */}
          <View
            style={[
              styles.routePath,
              {
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
              },
            ]}
          />

          {/* ETA Floating Pill */}
          <View
            style={[
              styles.etaBadge,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: colors.primary,
              },
            ]}
          >
            <MaterialCommunityIcons name="clock-fast" size={14} color={colors.primary} />
            <Text
              style={[
                Typography.captionSmall,
                { color: colors.textPrimary, marginLeft: 4, fontWeight: '700' },
              ]}
            >
              {eta}
            </Text>
          </View>
        </View>
      )}

      {/* Ambient Nearby Vehicles */}
      <View style={[styles.ambientCab, { top: 70, left: 60 }]}>
        <View style={[styles.vehicleMarkerPill, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
          <MaterialCommunityIcons name="motorbike" size={16} color="#0EA5E9" />
        </View>
      </View>

      <View style={[styles.ambientCab, { top: 180, right: 70 }]}>
        <View style={[styles.vehicleMarkerPill, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
          <MaterialCommunityIcons name="rickshaw" size={16} color="#F59E0B" />
        </View>
      </View>

      <View style={[styles.ambientCab, { bottom: 35, left: 110 }]}>
        <View style={[styles.vehicleMarkerPill, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
          <MaterialCommunityIcons name="car-hatchback" size={16} color="#10B981" />
        </View>
      </View>

      {/* Dynamic Animated Active Ride Vehicle */}
      {showRoute && (
        <Animated.View
          style={[
            styles.movingVehicle,
            {
              transform: [
                { translateX: carTranslateX },
                { translateY: carTranslateY },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.activeVehicleBubble,
              {
                backgroundColor: colors.primary,
                borderColor: '#FFFFFF',
              },
            ]}
          >
            <MaterialCommunityIcons name={getVehicleIcon()} size={18} color="#FFFFFF" />
          </View>
        </Animated.View>
      )}

      {/* Pickup Location Marker (Bottom Left) */}
      <View style={[styles.markerContainer, { left: 45, top: 165 }]}>
        <Animated.View
          style={[
            styles.pulseCircle,
            {
              transform: [{ scale: pulseAnim }],
              backgroundColor: '#10B98133',
            },
          ]}
        />
        <View style={[styles.pickupDot, { backgroundColor: '#10B981' }]}>
          <View style={styles.innerWhiteDot} />
        </View>
        <View
          style={[
            styles.pinLabel,
            {
              backgroundColor: isDark ? '#131C2E' : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              Typography.captionSmall,
              { color: colors.textPrimary, fontWeight: '700' },
            ]}
            numberOfLines={1}
          >
            {pickupTitle}
          </Text>
        </View>
      </View>

      {/* Drop-off Location Marker (Top Right) */}
      {showRoute && (
        <View style={[styles.markerContainer, { right: 55, top: 40 }]}>
          <View style={[styles.dropPin, { backgroundColor: '#EF4444' }]}>
            <MaterialCommunityIcons name="map-marker-check" size={18} color="#FFFFFF" />
          </View>
          <View
            style={[
              styles.pinLabel,
              {
                backgroundColor: isDark ? '#131C2E' : '#FFFFFF',
                borderColor: colors.border,
                right: -20,
              },
            ]}
          >
            <Text
              style={[
                Typography.captionSmall,
                { color: colors.textPrimary, fontWeight: '700' },
              ]}
              numberOfLines={1}
            >
              {dropTitle}
            </Text>
          </View>
        </View>
      )}

      {/* Compass / Recenter Watermark */}
      <View
        style={[
          styles.compassBadge,
          {
            backgroundColor: isDark ? '#131C2E99' : '#FFFFFFCC',
            borderColor: colors.border,
          },
        ]}
      >
        <MaterialCommunityIcons name="navigation-variant" size={16} color={colors.primary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  parkArea: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 90,
    height: 70,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  lakeArea: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    width: 100,
    height: 60,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  highway: {
    position: 'absolute',
    width: 380,
    height: 18,
    top: 110,
    left: -20,
    transform: [{ rotate: '-25deg' }],
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  highwayHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 12,
    top: 175,
  },
  highwayVertical: {
    position: 'absolute',
    width: 14,
    height: '100%',
    left: 170,
  },
  secondaryRoad1: {
    position: 'absolute',
    width: 8,
    height: '100%',
    right: 90,
  },
  routeContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  routePath: {
    position: 'absolute',
    top: 115,
    left: 60,
    width: 250,
    height: 5,
    borderRadius: 3,
    transform: [{ rotate: '-26deg' }],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  etaBadge: {
    position: 'absolute',
    top: 85,
    left: 145,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  ambientCab: {
    position: 'absolute',
  },
  vehicleMarkerPill: {
    padding: 5,
    borderRadius: BorderRadius.full,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  movingVehicle: {
    position: 'absolute',
    zIndex: 20,
  },
  activeVehicleBubble: {
    padding: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 15,
  },
  pulseCircle: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    top: -6,
    left: -6,
  },
  pickupDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  innerWhiteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  dropPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  pinLabel: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    maxWidth: 130,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compassBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
});
