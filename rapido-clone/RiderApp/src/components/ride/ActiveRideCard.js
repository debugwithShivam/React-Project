import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Typography, BorderRadius, Spacing } from '../../theme';
import { CustomButton } from '../common/CustomButton';

export const ActiveRideCard = ({
  rideState,
  captain,
  tripDetails,
  onStartTrip,
  onCompleteTrip,
  onCancelRide,
  onOpenSafety,
}) => {
  const { colors, isDark } = useTheme();

  const isAssigned = rideState === 'ASSIGNED';
  const isInProgress = rideState === 'IN_PROGRESS';

  const handleCall = () => {
    Alert.alert('Calling Captain', `Dialing ${captain?.name} at ${captain?.phone || '+91 98450 11992'}...`);
  };

  const handleChat = () => {
    Alert.alert('Captain Chat', `Opening encrypted chat with ${captain?.name}...`);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#131C2E' : '#FFFFFF',
          borderColor: colors.border,
        },
      ]}
    >
      {/* Top Banner with OTP and Status */}
      <View
        style={[
          styles.statusBanner,
          {
            backgroundColor: isAssigned
              ? (isDark ? '#082F49' : '#E0F2FE')
              : (isDark ? '#064E3B' : '#D1FAE5'),
          },
        ]}
      >
        <View style={styles.statusBannerLeft}>
          <View
            style={[
              styles.pulseDot,
              { backgroundColor: isAssigned ? '#0EA5E9' : '#10B981' },
            ]}
          />
          <Text
            style={[
              Typography.caption,
              {
                color: isAssigned ? '#0284C7' : '#059669',
                fontWeight: '700',
              },
            ]}
          >
            {isAssigned
              ? `Captain arriving in ${captain?.etaMins || 3} mins`
              : 'Trip In Progress • On Route'}
          </Text>
        </View>

        {/* Start-Trip PIN / OTP */}
        <View
          style={[
            styles.otpBox,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: colors.primary,
            },
          ]}
        >
          <Text style={[Typography.captionSmall, { color: colors.textMuted }]}>
            PIN:
          </Text>
          <Text
            style={[
              Typography.title,
              {
                color: colors.primary,
                fontWeight: '800',
                marginLeft: 4,
                letterSpacing: 2,
              },
            ]}
          >
            {tripDetails?.otp || captain?.otp || '4819'}
          </Text>
        </View>
      </View>

      {/* Captain Profile & Vehicle Section */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: captain?.avatar }}
          style={[styles.avatar, { borderColor: colors.primary }]}
        />
        <View style={styles.driverInfo}>
          <View style={styles.driverNameRow}>
            <Text
              style={[
                Typography.headerSmall,
                { color: colors.textPrimary },
              ]}
              numberOfLines={1}
            >
              {captain?.name || 'Rahul Verma'}
            </Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingText}>{captain?.rating || '4.9'}</Text>
            </View>
          </View>

          <Text
            style={[
              Typography.bodyMedium,
              { color: colors.textSecondary, marginTop: 2 },
            ]}
          >
            {captain?.vehicleName || 'TVS Raider 125 (Black)'}
          </Text>

          {/* Vehicle Number Plate Badge */}
          <View
            style={[
              styles.numberPlate,
              {
                backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                Typography.caption,
                {
                  color: colors.textPrimary,
                  fontWeight: '800',
                  letterSpacing: 1,
                },
              ]}
            >
              {captain?.vehicleNumber || 'KA 03 JP 4921'}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons: Call, Chat, Safety Toolkit */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isDark ? '#1A243B' : '#F1F5F9' },
          ]}
          onPress={handleCall}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={18} color={colors.primary} />
          <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
            Call
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isDark ? '#1A243B' : '#F1F5F9' },
          ]}
          onPress={handleChat}
          activeOpacity={0.8}
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={18}
            color={colors.primary}
          />
          <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
            Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isDark ? '#450A0A' : '#FEE2E2' },
          ]}
          onPress={onOpenSafety}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="shield-alert"
            size={18}
            color="#EF4444"
          />
          <Text style={[styles.actionLabel, { color: '#EF4444', fontWeight: '700' }]}>
            SOS Safety
          </Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Simulation Controls */}
      <View
        style={[
          styles.simControlsBox,
          {
            backgroundColor: isDark ? '#1A243B' : '#F8FAFC',
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[Typography.captionSmall, { color: colors.textMuted, marginBottom: 8 }]}>
          ⚡ DEMO SIMULATION CONTROLS:
        </Text>
        {isAssigned ? (
          <View style={styles.simBtnRow}>
            <CustomButton
              title="Simulate: Captain Arrived & Start"
              variant="primary"
              size="small"
              icon="play-circle-outline"
              onPress={onStartTrip}
              style={{ flex: 2, marginRight: 8 }}
            />
            <CustomButton
              title="Cancel"
              variant="outline"
              size="small"
              onPress={onCancelRide}
              style={{ flex: 1 }}
            />
          </View>
        ) : (
          <View style={styles.simBtnRow}>
            <CustomButton
              title="Simulate: Destination Reached"
              variant="success"
              size="small"
              icon="check-decagram-outline"
              onPress={onCompleteTrip}
              style={{ flex: 1 }}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
  },
  statusBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  otpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    marginRight: Spacing.md,
  },
  driverInfo: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.full,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    marginLeft: 3,
  },
  numberPlate: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    marginHorizontal: 4,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  simControlsBox: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  simBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
