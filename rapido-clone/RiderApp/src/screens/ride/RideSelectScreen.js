import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useRide } from '../../context/RideContext';
import { useUser } from '../../context/UserContext';
import { Typography, BorderRadius, Spacing } from '../../theme';
import { VehicleSelectCard } from '../../components/ride/VehicleSelectCard';
import { FareBreakdownModal } from '../../components/ride/FareBreakdownModal';
import { CustomButton } from '../../components/common/CustomButton';
import { VEHICLE_OPTIONS } from '../../data/mockData';

export const RideSelectScreen = ({ onChangeRoute, onBackToMap }) => {
  const { colors, isDark } = useTheme();
  const {
    pickupLocation,
    dropLocation,
    selectedVehicle,
    setSelectedVehicle,
    calculateFare,
    requestRide,
  } = useRide();
  const { selectedPaymentMethod, setSelectedPaymentMethod } = useUser();

  const [showFareModal, setShowFareModal] = useState(false);

  const handleBookNow = () => {
    requestRide();
  };

  const cyclePaymentMethod = () => {
    if (selectedPaymentMethod.type === 'wallet') {
      setSelectedPaymentMethod({
        type: 'upi',
        title: 'Google Pay (UPI)',
        detail: 'Instant payment after trip',
      });
    } else if (selectedPaymentMethod.type === 'upi') {
      setSelectedPaymentMethod({
        type: 'cash',
        title: 'Cash on Delivery',
        detail: 'Pay cash to captain after trip',
      });
    } else {
      setSelectedPaymentMethod({
        type: 'wallet',
        title: 'UrbanRide Wallet',
        detail: '₹420.00 available',
      });
    }
  };

  const activeFare = calculateFare(selectedVehicle);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#131C2E' : '#FFFFFF',
          borderTopColor: colors.border,
        },
      ]}
    >
      {/* Route Mini-Bar */}
      <View
        style={[
          styles.routeBar,
          {
            backgroundColor: isDark ? '#1A243B' : '#F8FAFC',
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.routeTextCol}>
          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <Text
              style={[
                Typography.caption,
                { color: colors.textSecondary, marginLeft: 6 },
              ]}
              numberOfLines={1}
            >
              From: {pickupLocation.title}
            </Text>
          </View>
          <View style={[styles.routeRow, { marginTop: 4 }]}>
            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
            <Text
              style={[
                Typography.title,
                { color: colors.textPrimary, marginLeft: 6, fontSize: 13, fontWeight: '700' },
              ]}
              numberOfLines={1}
            >
              To: {dropLocation.title} ({dropLocation.distance || '6.4 km'})
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.editRouteBtn, { backgroundColor: colors.surfaceSubtle }]}
          onPress={onChangeRoute}
        >
          <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Vehicle Category Scroll */}
      <Text
        style={[
          Typography.caption,
          {
            color: colors.textSecondary,
            fontWeight: '700',
            marginTop: Spacing.md,
            marginBottom: Spacing.sm,
          },
        ]}
      >
        AVAILABLE RIDE OPTIONS
      </Text>

      <ScrollView
        style={styles.vehicleList}
        showsVerticalScrollIndicator={false}
      >
        {VEHICLE_OPTIONS.map((v) => (
          <VehicleSelectCard
            key={v.id}
            vehicle={v}
            isSelected={selectedVehicle.id === v.id}
            onSelect={setSelectedVehicle}
            calculatedFare={calculateFare(v)}
          />
        ))}
      </ScrollView>

      {/* Payment & Promos Bottom Bar */}
      <View
        style={[
          styles.paymentRow,
          {
            borderTopColor: colors.border,
            backgroundColor: isDark ? '#0B0F19' : '#F8FAFC',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.paymentSelector}
          onPress={cyclePaymentMethod}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={
              selectedPaymentMethod.type === 'wallet'
                ? 'wallet-outline'
                : selectedPaymentMethod.type === 'upi'
                ? 'lightning-bolt'
                : 'cash-multiple'
            }
            size={20}
            color={colors.primary}
          />
          <View style={{ marginLeft: 8 }}>
            <Text style={[Typography.captionSmall, { color: colors.textSecondary }]}>
              Pay via
            </Text>
            <Text
              style={[
                Typography.title,
                { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
              ]}
            >
              {selectedPaymentMethod.title}
            </Text>
          </View>
          <Ionicons name="swap-horizontal" size={16} color={colors.textMuted} style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fareInfoBtn}
          onPress={() => setShowFareModal(true)}
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={[Typography.caption, { color: colors.primary, marginLeft: 4, fontWeight: '700' }]}>
            Fare Details
          </Text>
        </TouchableOpacity>
      </View>

      {/* Confirm & Book CTA */}
      <View style={styles.bookingCtaWrapper}>
        <CustomButton
          title={`Book ${selectedVehicle.name} • ₹${activeFare}`}
          variant="primary"
          size="large"
          icon="check-bold"
          onPress={handleBookNow}
          style={{ width: '100%' }}
        />
      </View>

      {/* Itemized Fare Modal */}
      <FareBreakdownModal
        visible={showFareModal}
        onClose={() => setShowFareModal(false)}
        vehicle={selectedVehicle}
        fare={activeFare}
        paymentMethod={selectedPaymentMethod}
        onChangePayment={() => {
          cyclePaymentMethod();
          setShowFareModal(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    maxHeight: 460,
  },
  routeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  routeTextCol: {
    flex: 1,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  editRouteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  vehicleList: {
    maxHeight: 220,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
  },
  paymentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fareInfoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  bookingCtaWrapper: {
    marginTop: Spacing.md,
  },
});
