import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useRide } from '../../context/RideContext';
import { Typography, BorderRadius, Spacing } from '../../theme';
import { CustomHeader } from '../../components/common/CustomHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CustomButton } from '../../components/common/CustomButton';

export const ActivityScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { pastRides, rebookRide } = useRide();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'COMPLETED' | 'CANCELLED'

  const filteredRides = pastRides.filter((ride) => {
    if (activeTab === 'ALL') return true;
    return ride.status === activeTab;
  });

  const handleRebook = (ride) => {
    rebookRide(ride);
    Alert.alert(
      'Route Selected',
      `Rebooking ride from ${ride.pickup} to ${ride.dropoff}`,
      [
        {
          text: 'Go to Map',
          onPress: () => navigation && navigation.navigate('HomeTab'),
        },
      ]
    );
  };

  const handleViewReceipt = (ride) => {
    Alert.alert(
      `Trip Receipt #${ride.id}`,
      `Date: ${ride.date}\nVehicle: ${ride.vehicleTitle}\nDistance: ${ride.distance}\nFare: ₹${ride.fare}\nPayment: ${ride.paymentMethod}\nStatus: ${ride.status}`
    );
  };

  const getVehicleIcon = (type) => {
    switch (type) {
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
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? colors.background : '#F8FAFC' },
      ]}
    >
      <CustomHeader
        title="My Rides Activity"
        subtitle="View your past rides and rebook instantly"
      />

      {/* Tabs Filter */}
      <View
        style={[
          styles.tabRow,
          {
            backgroundColor: isDark ? colors.surface : '#FFFFFF',
            borderBottomColor: colors.border,
          },
        ]}
      >
        {['ALL', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabItem,
              activeTab === tab && {
                borderBottomColor: colors.primary,
                borderBottomWidth: 3,
              },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                Typography.caption,
                {
                  color: activeTab === tab ? colors.primary : colors.textSecondary,
                  fontWeight: activeTab === tab ? '800' : '600',
                },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Rides List */}
      <FlatList
        data={filteredRides}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="history"
              size={56}
              color={colors.textMuted}
            />
            <Text style={[Typography.title, { color: colors.textSecondary, marginTop: 12 }]}>
              No rides found in this category
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.rideCard,
              {
                backgroundColor: isDark ? colors.surface : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            {/* Card Header: Vehicle, Date, Status */}
            <View style={styles.cardHeader}>
              <View style={styles.vehicleHeaderLeft}>
                <View
                  style={[
                    styles.vehicleIconBadge,
                    { backgroundColor: isDark ? colors.surfaceSubtle : colors.primaryLight },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={getVehicleIcon(item.vehicleType)}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text
                    style={[
                      Typography.title,
                      { color: colors.textPrimary, fontWeight: '700' },
                    ]}
                  >
                    {item.vehicleTitle}
                  </Text>
                  <Text
                    style={[
                      Typography.captionSmall,
                      { color: colors.textMuted, marginTop: 2 },
                    ]}
                  >
                    {item.date}
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text
                  style={[
                    Typography.headerSmall,
                    { color: colors.textPrimary, fontWeight: '800' },
                  ]}
                >
                  ₹{item.fare}
                </Text>
                <StatusBadge
                  text={item.status}
                  color={item.status === 'COMPLETED' ? '#10B981' : '#EF4444'}
                  size="small"
                  style={{ marginTop: 4 }}
                />
              </View>
            </View>

            {/* Route Points */}
            <View
              style={[
                styles.routeBox,
                { backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC' },
              ]}
            >
              <View style={styles.routeRow}>
                <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                <Text
                  style={[
                    Typography.body,
                    { color: colors.textPrimary, marginLeft: 8, fontSize: 13 },
                  ]}
                  numberOfLines={1}
                >
                  {item.pickup}
                </Text>
              </View>

              <View style={[styles.routeRow, { marginTop: 6 }]}>
                <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                <Text
                  style={[
                    Typography.bodyMedium,
                    { color: colors.textPrimary, marginLeft: 8, fontSize: 13, fontWeight: '600' },
                  ]}
                  numberOfLines={1}
                >
                  {item.dropoff}
                </Text>
              </View>
            </View>

            {/* Driver & Rating Info */}
            <View style={styles.driverRow}>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                Captain: {item.driverName}
              </Text>
              {item.ratingGiven && (
                <View style={styles.ratingInline}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text
                    style={[
                      Typography.caption,
                      { color: colors.textPrimary, marginLeft: 3, fontWeight: '700' },
                    ]}
                  >
                    {item.ratingGiven}.0
                  </Text>
                </View>
              )}
            </View>

            {/* Actions: Rebook and Receipt */}
            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                style={[styles.receiptBtn, { borderColor: colors.border }]}
                onPress={() => handleViewReceipt(item)}
              >
                <MaterialCommunityIcons
                  name="receipt"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    Typography.caption,
                    { color: colors.textSecondary, marginLeft: 4, fontWeight: '600' },
                  ]}
                >
                  Receipt
                </Text>
              </TouchableOpacity>

              <CustomButton
                title="Rebook Ride"
                variant="outline"
                size="small"
                icon="reload"
                onPress={() => handleRebook(item)}
              />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  listContainer: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  rideCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  vehicleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
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
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  ratingInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: '#E2E8F0',
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
});
