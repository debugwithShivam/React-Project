import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Typography, BorderRadius, Spacing } from '../../theme';
import { CustomButton } from '../common/CustomButton';

export const FareBreakdownModal = ({
  visible,
  onClose,
  vehicle,
  fare,
  paymentMethod,
  onChangePayment,
}) => {
  const { colors, isDark } = useTheme();

  if (!vehicle) return null;

  const base = vehicle.basePrice;
  const distanceFare = Math.max(0, fare - base - 15);
  const platformSafetyFee = 15;
  const total = fare;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDark ? '#131C2E' : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[Typography.headerSmall, { color: colors.textPrimary }]}>
                Fare Breakdown
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                {vehicle.name} • 6.4 km estimated
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceSubtle }]}
            >
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Breakdown Items */}
          <ScrollView style={styles.scrollArea}>
            <View style={styles.breakdownRow}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>
                Base Fare (Includes first 1.5 km)
              </Text>
              <Text style={[Typography.bodyMedium, { color: colors.textPrimary }]}>
                ₹{base}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>
                Distance Fare (4.9 km @ ₹{vehicle.perKm}/km)
              </Text>
              <Text style={[Typography.bodyMedium, { color: colors.textPrimary }]}>
                ₹{distanceFare}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>
                Safety & Platform Insurance Fee
              </Text>
              <Text style={[Typography.bodyMedium, { color: colors.textPrimary }]}>
                ₹{platformSafetyFee}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={[Typography.body, { color: '#10B981' }]}>
                Promo Discount (FIRST_RIDE20)
              </Text>
              <Text style={[Typography.bodyMedium, { color: '#10B981', fontWeight: '700' }]}>
                - ₹15
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.totalRow}>
              <Text style={[Typography.title, { color: colors.textPrimary, fontWeight: '800' }]}>
                Total Estimated Fare
              </Text>
              <Text style={[Typography.headerSmall, { color: colors.primary, fontWeight: '800' }]}>
                ₹{total}
              </Text>
            </View>

            {/* Payment Mode */}
            <View
              style={[
                styles.paymentBox,
                {
                  backgroundColor: isDark ? '#1A243B' : '#F8FAFC',
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.paymentLeft}>
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={24}
                  color={colors.primary}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[Typography.captionSmall, { color: colors.textSecondary }]}>
                    Payment Option
                  </Text>
                  <Text style={[Typography.title, { color: colors.textPrimary, fontSize: 14 }]}>
                    {paymentMethod?.title || 'UrbanRide Wallet'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onChangePayment}>
                <Text style={[Typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                  CHANGE
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <CustomButton
            title="Done"
            variant="primary"
            onPress={onClose}
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 1,
    padding: Spacing.xl,
    maxHeight: '75%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    marginBottom: Spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  paymentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.lg,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
