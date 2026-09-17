import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Typography, BorderRadius, Spacing } from '../../theme';
import { CustomButton } from '../common/CustomButton';

export const RadarDriverSearch = ({ vehicle, onCancel }) => {
  const { colors, isDark } = useTheme();

  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  const [statusIndex, setStatusIndex] = useState(0);

  const statusMessages = [
    'Locating nearby verified captains...',
    'Matching closest driver in 2 km radius...',
    'Checking captain acceptance & route...',
    'Finalizing your trip & vehicle details...',
  ];

  useEffect(() => {
    const createPulse = (anim, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createPulse(wave1, 0);
    const anim2 = createPulse(wave2, 600);
    const anim3 = createPulse(wave3, 1200);

    anim1.start();
    anim2.start();
    anim3.start();

    // Progress through status messages
    const timer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusMessages.length);
    }, 1800);

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
      clearInterval(timer);
    };
  }, []);

  const renderRadarWave = (anim) => {
    const scale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 2.2],
    });
    const opacity = anim.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0.8, 0.4, 0],
    });

    return (
      <Animated.View
        style={[
          styles.waveCircle,
          {
            borderColor: colors.primary,
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#131C2E' : '#FFFFFF',
          borderColor: colors.border,
        },
      ]}
    >
      {/* Radar Animation Area */}
      <View style={styles.radarWrapper}>
        {renderRadarWave(wave1)}
        {renderRadarWave(wave2)}
        {renderRadarWave(wave3)}

        {/* Center Vehicle Icon Pulse */}
        <View
          style={[
            styles.centerIconPill,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={vehicle?.iconName || 'motorbike'}
            size={36}
            color="#FFFFFF"
          />
        </View>
      </View>

      {/* Text Info */}
      <View style={styles.textBlock}>
        <Text
          style={[
            Typography.headerSmall,
            { color: colors.textPrimary, textAlign: 'center' },
          ]}
        >
          Finding Your {vehicle?.name || 'Ride'}
        </Text>
        <Text
          style={[
            Typography.body,
            {
              color: colors.primary,
              textAlign: 'center',
              marginTop: 6,
              fontWeight: '600',
            },
          ]}
        >
          {statusMessages[statusIndex]}
        </Text>
        <Text
          style={[
            Typography.caption,
            {
              color: colors.textMuted,
              textAlign: 'center',
              marginTop: 4,
            },
          ]}
        >
          Average confirmation time: &lt; 30 seconds
        </Text>
      </View>

      {/* Cancel Action */}
      <View style={styles.footerAction}>
        <CustomButton
          title="Cancel Search"
          variant="outline"
          size="medium"
          icon="close-circle-outline"
          onPress={onCancel}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  radarWrapper: {
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
    position: 'relative',
  },
  waveCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },
  centerIconPill: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  textBlock: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  footerAction: {
    width: '100%',
    marginTop: Spacing.md,
  },
});
