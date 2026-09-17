import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useRide } from '../../context/RideContext';
import { useUser } from '../../context/UserContext';
import { Typography, BorderRadius, Spacing } from '../../theme';
import { SimulatedMap } from '../../components/map/SimulatedMap';
import { LocationSearchModal } from '../search/LocationSearchModal';
import { RideSelectScreen } from '../ride/RideSelectScreen';
import { RadarDriverSearch } from '../../components/ride/RadarDriverSearch';
import { ActiveRideCard } from '../../components/ride/ActiveRideCard';
import { TripCompleteScreen } from '../ride/TripCompleteScreen';
import { StatusBadge } from '../../components/common/StatusBadge';
import { VEHICLE_OPTIONS } from '../../data/mockData';

export const HomeScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const {
    rideState,
    pickupLocation,
    dropLocation,
    selectedVehicle,
    setSelectedVehicle,
    assignedCaptain,
    currentTripDetails,
    cancelRide,
    startTrip,
    completeTrip,
  } = useRide();
  const { user, walletBalance, savedPlaces } = useUser();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showRideSelect, setShowRideSelect] = useState(false);

  const handleDestinationSelected = (dest) => {
    setShowRideSelect(true);
  };

  const handleSelectQuickCategory = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowRideSelect(true);
  };

  const handleQuickPlaceClick = (place) => {
    handleDestinationSelected(place);
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? colors.background : '#F8FAFC' },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? colors.surface : '#FFFFFF'}
      />

      {/* Top Navigation Bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDark ? colors.surface : '#FFFFFF',
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.userInfoCol}>
          <Text style={[Typography.captionSmall, { color: colors.textSecondary }]}>
            Good day,
          </Text>
          <Text
            style={[
              Typography.title,
              { color: colors.textPrimary, fontWeight: '800' },
            ]}
          >
            {user.name} 👋
          </Text>
        </View>

        <View style={styles.topActionsRow}>
          {/* Wallet Balance Badge */}
          <TouchableOpacity
            style={[
              styles.walletPill,
              {
                backgroundColor: isDark ? '#1A243B' : colors.primaryLight,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => navigation && navigation.navigate('WalletTab')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="wallet-outline"
              size={16}
              color={colors.primary}
            />
            <Text
              style={[
                Typography.caption,
                { color: colors.primary, fontWeight: '800', marginLeft: 4 },
              ]}
            >
              ₹{walletBalance.toFixed(0)}
            </Text>
          </TouchableOpacity>

          {/* Theme Toggle Button */}
          <TouchableOpacity
            style={[
              styles.themeToggleBtn,
              { backgroundColor: colors.surfaceSubtle },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={18}
              color={isDark ? '#F59E0B' : colors.textPrimary}
            />
          </TouchableOpacity>

          {/* Quick SOS Red Button */}
          <TouchableOpacity
            style={styles.sosButton}
            onPress={() => navigation && navigation.navigate('SafetyTab')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="shield-alert" size={18} color="#FFFFFF" />
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      {rideState === 'COMPLETED' ? (
        <TripCompleteScreen />
      ) : (
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Interactive Simulated Map */}
          <View style={styles.mapContainer}>
            <SimulatedMap
              height={rideState === 'IDLE' ? 240 : 200}
              showRoute={showRideSelect || rideState !== 'IDLE'}
              pickupTitle={pickupLocation.title}
              dropTitle={dropLocation.title}
              eta={dropLocation.distance ? `${dropLocation.distance} • 18 min` : '18 min'}
              activeVehicleType={selectedVehicle?.id || 'bike'}
            />
          </View>

          {/* DYNAMIC CARD BASED ON RIDE STATE */}
          {rideState === 'SEARCHING' ? (
            <View style={styles.overlaySection}>
              <RadarDriverSearch
                vehicle={selectedVehicle}
                onCancel={cancelRide}
              />
            </View>
          ) : rideState === 'ASSIGNED' || rideState === 'IN_PROGRESS' ? (
            <View style={styles.overlaySection}>
              <ActiveRideCard
                rideState={rideState}
                captain={assignedCaptain}
                tripDetails={currentTripDetails}
                onStartTrip={startTrip}
                onCompleteTrip={completeTrip}
                onCancelRide={cancelRide}
                onOpenSafety={() => navigation && navigation.navigate('SafetyTab')}
              />
            </View>
          ) : showRideSelect ? (
            /* Vehicle Selector Bottom Screen */
            <View style={styles.overlaySection}>
              <RideSelectScreen
                onChangeRoute={() => setShowSearchModal(true)}
                onBackToMap={() => setShowRideSelect(false)}
              />
            </View>
          ) : (
            /* Default Idle State: "Where to?" Search Card & Categories */
            <View style={styles.idleBookingCard}>
              {/* Destination Search Box */}
              <TouchableOpacity
                style={[
                  styles.searchBarContainer,
                  {
                    backgroundColor: isDark ? colors.surface : '#FFFFFF',
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowSearchModal(true)}
                activeOpacity={0.9}
              >
                <View style={styles.searchLeft}>
                  <View style={[styles.searchDot, { backgroundColor: colors.primary }]} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={[Typography.captionSmall, { color: colors.textMuted }]}>
                      Where are you heading?
                    </Text>
                    <Text
                      style={[
                        Typography.title,
                        { color: colors.textPrimary, fontWeight: '700' },
                      ]}
                      numberOfLines={1}
                    >
                      Search destination...
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.searchIconBtn,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Ionicons name="search" size={18} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              {/* Quick Vehicle Types Row */}
              <Text
                style={[
                  Typography.caption,
                  {
                    color: colors.textSecondary,
                    marginTop: Spacing.lg,
                    marginBottom: Spacing.sm,
                    fontWeight: '700',
                  },
                ]}
              >
                CHOOSE RIDE SERVICE
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {VEHICLE_OPTIONS.map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.categoryCard,
                      {
                        backgroundColor:
                          selectedVehicle.id === v.id
                            ? (isDark ? '#162238' : '#F0F9FF')
                            : (isDark ? colors.surface : '#FFFFFF'),
                        borderColor:
                          selectedVehicle.id === v.id ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => handleSelectQuickCategory(v)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.catIconWrap,
                        {
                          backgroundColor:
                            selectedVehicle.id === v.id
                              ? colors.primaryLight
                              : (isDark ? colors.surfaceSubtle : '#F1F5F9'),
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={v.iconName}
                        size={28}
                        color={selectedVehicle.id === v.id ? colors.primary : colors.textPrimary}
                      />
                    </View>
                    <Text
                      style={[
                        Typography.title,
                        { color: colors.textPrimary, fontSize: 13, fontWeight: '700', marginTop: 6 },
                      ]}
                    >
                      {v.name}
                    </Text>
                    <Text
                      style={[
                        Typography.captionSmall,
                        { color: colors.primary, fontWeight: '700', marginTop: 2 },
                      ]}
                    >
                      From ₹{v.basePrice}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Quick Saved Places */}
              <Text
                style={[
                  Typography.caption,
                  {
                    color: colors.textSecondary,
                    marginTop: Spacing.lg,
                    marginBottom: Spacing.sm,
                    fontWeight: '700',
                  },
                ]}
              >
                SAVED PLACES
              </Text>
              <View style={styles.savedPlacesRow}>
                {savedPlaces.slice(0, 3).map((place) => (
                  <TouchableOpacity
                    key={place.id}
                    style={[
                      styles.savedPlaceCard,
                      {
                        backgroundColor: isDark ? colors.surface : '#FFFFFF',
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => handleQuickPlaceClick(place)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name={
                        place.type === 'home'
                          ? 'home'
                          : place.type === 'work'
                          ? 'briefcase'
                          : 'star'
                      }
                      size={20}
                      color={colors.primary}
                    />
                    <Text
                      style={[
                        Typography.bodyMedium,
                        { color: colors.textPrimary, marginLeft: 8, fontWeight: '600' },
                      ]}
                    >
                      {place.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Safety Banner Card */}
              <TouchableOpacity
                style={[
                  styles.safetyPromoCard,
                  {
                    backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
                    borderColor: colors.accent,
                  },
                ]}
                onPress={() => navigation && navigation.navigate('SafetyTab')}
                activeOpacity={0.85}
              >
                <View style={styles.safetyPromoLeft}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={30}
                    color={colors.accent}
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text
                      style={[
                        Typography.title,
                        { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
                      ]}
                    >
                      Ride with 100% Safety Shield
                    </Text>
                    <Text
                      style={[
                        Typography.captionSmall,
                        { color: colors.textSecondary, marginTop: 2 },
                      ]}
                    >
                      Verified captains, 24/7 SOS helpline, and live trip tracking.
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.accent}
                />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Location Search Modal */}
      <LocationSearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onLocationSelected={handleDestinationSelected}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 6 : 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  userInfoCol: {
    flex: 1,
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: 8,
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 3,
  },
  contentScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  mapContainer: {
    width: '100%',
  },
  overlaySection: {
    marginHorizontal: Spacing.md,
    marginTop: -15,
  },
  idleBookingCard: {
    paddingHorizontal: Spacing.lg,
    marginTop: -20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  searchIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryCard: {
    width: 100,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedPlacesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  savedPlaceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  safetyPromoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginTop: Spacing.lg,
  },
  safetyPromoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: Spacing.sm,
  },
});
