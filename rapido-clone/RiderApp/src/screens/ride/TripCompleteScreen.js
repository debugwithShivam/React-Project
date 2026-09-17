import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useRide } from '../../context/RideContext';
import { useUser } from '../../context/UserContext';
import { Typography, BorderRadius, Spacing } from '../../theme';
import { CustomButton } from '../../components/common/CustomButton';

export const TripCompleteScreen = () => {
  const { colors, isDark } = useTheme();
  const { assignedCaptain, currentTripDetails, finishAndRateTrip } = useRide();
  const { deductWallet } = useUser();

  const [rating, setRating] = useState(5);
  const [selectedTip, setSelectedTip] = useState(0);
  const [selectedCompliments, setSelectedCompliments] = useState(['Safe Driving', 'Clean Vehicle']);

  const complimentsList = [
    'Safe Driving',
    'Polite Captain',
    'Clean Vehicle',
    'Quick Route',
    'Great Music',
  ];

  const toggleCompliment = (item) => {
    if (selectedCompliments.includes(item)) {
      setSelectedCompliments(selectedCompliments.filter((c) => c !== item));
    } else {
      setSelectedCompliments([...selectedCompliments, item]);
    }
  };

  const handleFinish = () => {
    const totalFare = (currentTripDetails?.fare || 68) + selectedTip;
    deductWallet(totalFare, `Trip Fare #${currentTripDetails?.id || 'Ride'}`);
    finishAndRateTrip(rating, selectedTip, selectedCompliments);
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.background : '#F8FAFC' },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Top Success Badge */}
      <View style={styles.successHeader}>
        <View style={[styles.successIconWrapper, { backgroundColor: '#10B98120' }]}>
          <MaterialCommunityIcons name="check-decagram" size={54} color="#10B981" />
        </View>
        <Text style={[Typography.headerMedium, { color: colors.textPrimary, marginTop: 12 }]}>
          Trip Completed!
        </Text>
        <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
          Hope you enjoyed your ride with {assignedCaptain?.name || 'Captain'}
        </Text>
      </View>

      {/* Receipt Card */}
      <View
        style={[
          styles.receiptCard,
          {
            backgroundColor: isDark ? '#131C2E' : '#FFFFFF',
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.receiptTop}>
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>
            TOTAL FARE PAID
          </Text>
          <Text style={[Typography.headerLarge, { color: colors.primary, marginTop: 2 }]}>
            ₹{(currentTripDetails?.fare || 68) + selectedTip}
          </Text>
          <Text style={[Typography.captionSmall, { color: colors.textMuted, marginTop: 2 }]}>
            Paid via UrbanRide Wallet • ID: {currentTripDetails?.id || 'RIDE1094'}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Route Snapshot */}
        <View style={styles.tripSummaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[Typography.captionSmall, { color: colors.textMuted }]}>Distance</Text>
            <Text style={[Typography.title, { color: colors.textPrimary, fontSize: 14 }]}>
              {currentTripDetails?.distance || '6.4 km'}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[Typography.captionSmall, { color: colors.textMuted }]}>Duration</Text>
            <Text style={[Typography.title, { color: colors.textPrimary, fontSize: 14 }]}>
              {currentTripDetails?.estimatedDuration || '18 mins'}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[Typography.captionSmall, { color: colors.textMuted }]}>Vehicle</Text>
            <Text style={[Typography.title, { color: colors.textPrimary, fontSize: 14 }]}>
              {currentTripDetails?.vehicle?.name || 'Bike Taxi'}
            </Text>
          </View>
        </View>
      </View>

      {/* Driver Rating Card */}
      <View
        style={[
          styles.ratingCard,
          {
            backgroundColor: isDark ? '#131C2E' : '#FFFFFF',
            borderColor: colors.border,
          },
        ]}
      >
        <Image
          source={{ uri: assignedCaptain?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' }}
          style={styles.driverAvatar}
        />
        <Text style={[Typography.title, { color: colors.textPrimary, marginTop: 8 }]}>
          How was your ride with {assignedCaptain?.name || 'Rahul'}?
        </Text>

        {/* Interactive 5 Stars */}
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={{ padding: 6 }}
            >
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={32}
                color={star <= rating ? '#F59E0B' : colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Compliment Chips */}
        <Text
          style={[
            Typography.caption,
            { color: colors.textSecondary, marginTop: Spacing.md, marginBottom: 8, fontWeight: '700' },
          ]}
        >
          GIVE COMPLIMENTS
        </Text>
        <View style={styles.complimentsWrapper}>
          {complimentsList.map((comp) => {
            const isSelected = selectedCompliments.includes(comp);
            return (
              <TouchableOpacity
                key={comp}
                style={[
                  styles.compChip,
                  {
                    backgroundColor: isSelected
                      ? colors.primaryLight
                      : (isDark ? colors.surfaceSubtle : '#F1F5F9'),
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggleCompliment(comp)}
              >
                <Text
                  style={[
                    Typography.caption,
                    {
                      color: isSelected ? colors.primary : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {comp}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tip the Captain */}
        <Text
          style={[
            Typography.caption,
            { color: colors.textSecondary, marginTop: Spacing.lg, marginBottom: 8, fontWeight: '700' },
          ]}
        >
          TIP THE CAPTAIN (OPTIONAL)
        </Text>
        <View style={styles.tipRow}>
          {[0, 10, 20, 50].map((amount) => {
            const isSelected = selectedTip === amount;
            return (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.tipPill,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : (isDark ? colors.surfaceSubtle : '#F1F5F9'),
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedTip(amount)}
              >
                <Text
                  style={[
                    Typography.caption,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: '700',
                    },
                  ]}
                >
                  {amount === 0 ? 'No Tip' : `₹${amount}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Done Button */}
      <View style={styles.submitWrapper}>
        <CustomButton
          title="Done & Return to Map"
          variant="primary"
          size="large"
          onPress={handleFinish}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  successHeader: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  successIconWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  receiptTop: {
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  tripSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  ratingCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  driverAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  starRow: {
    flexDirection: 'row',
    marginVertical: Spacing.md,
  },
  complimentsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  compChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    margin: 4,
  },
  tipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tipPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  submitWrapper: {
    marginTop: Spacing.sm,
  },
});
