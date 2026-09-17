import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useRide } from '../../context/RideContext';
import { useUser } from '../../context/UserContext';
import { Typography, BorderRadius, Spacing } from '../../theme';
import { InputField } from '../../components/common/InputField';
import { POPULAR_DESTINATIONS } from '../../data/mockData';

export const LocationSearchModal = ({ visible, onClose, onLocationSelected }) => {
  const { colors, isDark } = useTheme();
  const { pickupLocation, setPickupLocation, dropLocation, setDropLocation } = useRide();
  const { savedPlaces } = useUser();

  const [pickupText, setPickupText] = useState(pickupLocation.title);
  const [dropText, setDropText] = useState(dropLocation.title);
  const [activeSearchFocus, setActiveSearchFocus] = useState('drop'); // 'pickup' or 'drop'

  const handleSelectPlace = (place) => {
    if (activeSearchFocus === 'pickup') {
      const newPickup = {
        title: place.title,
        address: place.subtitle || place.address,
        lat: place.lat || 12.9279,
        lng: place.lng || 77.6834,
      };
      setPickupLocation(newPickup);
      setPickupText(newPickup.title);
      setActiveSearchFocus('drop');
    } else {
      const newDrop = {
        title: place.title,
        address: place.subtitle || place.address,
        distance: place.distance || '5.8 km',
        lat: place.lat || 12.9719,
        lng: place.lng || 77.6070,
      };
      setDropLocation(newDrop);
      setDropText(newDrop.title);
      onLocationSelected && onLocationSelected(newDrop);
      onClose();
    }
  };

  const swapLocations = () => {
    const tempPickup = { ...pickupLocation };
    setPickupLocation({
      title: dropLocation.title,
      address: dropLocation.address,
      lat: dropLocation.lat,
      lng: dropLocation.lng,
    });
    setDropLocation({
      title: tempPickup.title,
      address: tempPickup.address,
      distance: '6.4 km',
      lat: tempPickup.lat,
      lng: tempPickup.lng,
    });
    setPickupText(dropLocation.title);
    setDropText(tempPickup.title);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? colors.background : '#FFFFFF',
          },
        ]}
      >
        {/* Top Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.surfaceSubtle }]}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[Typography.headerSmall, { color: colors.textPrimary }]}>
            Choose Route
          </Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Search Inputs Container */}
        <View
          style={[
            styles.inputsCard,
            {
              backgroundColor: isDark ? '#131C2E' : '#F8FAFC',
              borderColor: colors.border,
            },
          ]}
        >
          {/* Pickup and Drop indicators */}
          <View style={styles.inputsRow}>
            <View style={styles.indicatorCol}>
              <View style={[styles.pickupDot, { backgroundColor: '#10B981' }]} />
              <View style={[styles.dotLine, { borderColor: colors.border }]} />
              <View style={[styles.dropSquare, { backgroundColor: '#EF4444' }]} />
            </View>

            <View style={styles.fieldsCol}>
              {/* Pickup Input */}
              <TouchableOpacity
                style={[
                  styles.locationInputBox,
                  {
                    borderColor: activeSearchFocus === 'pickup' ? colors.primary : colors.border,
                    backgroundColor: isDark ? colors.surfaceSubtle : '#FFFFFF',
                  },
                ]}
                onPress={() => setActiveSearchFocus('pickup')}
              >
                <Text style={[Typography.captionSmall, { color: colors.textMuted }]}>
                  Pickup Location
                </Text>
                <Text
                  style={[
                    Typography.bodyMedium,
                    { color: colors.textPrimary, marginTop: 2 },
                  ]}
                  numberOfLines={1}
                >
                  {pickupText}
                </Text>
              </TouchableOpacity>

              {/* Drop Input */}
              <TouchableOpacity
                style={[
                  styles.locationInputBox,
                  {
                    marginTop: 10,
                    borderColor: activeSearchFocus === 'drop' ? colors.primary : colors.border,
                    backgroundColor: isDark ? colors.surfaceSubtle : '#FFFFFF',
                  },
                ]}
                onPress={() => setActiveSearchFocus('drop')}
              >
                <Text style={[Typography.captionSmall, { color: colors.textMuted }]}>
                  Drop-off Destination
                </Text>
                <Text
                  style={[
                    Typography.bodyMedium,
                    { color: colors.textPrimary, marginTop: 2 },
                  ]}
                  numberOfLines={1}
                >
                  {dropText}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Swap Button */}
            <TouchableOpacity
              style={[styles.swapBtn, { backgroundColor: colors.surfaceSubtle }]}
              onPress={swapLocations}
            >
              <MaterialCommunityIcons
                name="swap-vertical"
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Saved Places Pills */}
        <View style={styles.savedPillsWrapper}>
          <Text
            style={[
              Typography.caption,
              { color: colors.textSecondary, marginBottom: 8, fontWeight: '700' },
            ]}
          >
            QUICK SAVED DESTINATIONS
          </Text>
          <View style={styles.pillsRow}>
            {savedPlaces.map((place) => (
              <TouchableOpacity
                key={place.id}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isDark ? '#1A243B' : '#F1F5F9',
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleSelectPlace(place)}
              >
                <MaterialCommunityIcons
                  name={
                    place.type === 'home'
                      ? 'home'
                      : place.type === 'work'
                      ? 'briefcase'
                      : 'star'
                  }
                  size={16}
                  color={colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    Typography.caption,
                    { color: colors.textPrimary, fontWeight: '600' },
                  ]}
                >
                  {place.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular & Recent Destinations List */}
        <View style={styles.destListContainer}>
          <Text
            style={[
              Typography.caption,
              { color: colors.textSecondary, marginBottom: 12, fontWeight: '700' },
            ]}
          >
            POPULAR HOTSPOTS & HUBS
          </Text>

          <FlatList
            data={POPULAR_DESTINATIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.destItem,
                  {
                    backgroundColor: isDark ? colors.surface : '#FFFFFF',
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => handleSelectPlace(item)}
              >
                <View
                  style={[
                    styles.destIconWrapper,
                    { backgroundColor: isDark ? colors.surfaceSubtle : colors.primaryLight },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.destTextCol}>
                  <Text
                    style={[
                      Typography.title,
                      { color: colors.textPrimary, fontSize: 15 },
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      Typography.caption,
                      { color: colors.textSecondary, marginTop: 2 },
                    ]}
                    numberOfLines={1}
                  >
                    {item.subtitle}
                  </Text>
                </View>
                <Text
                  style={[
                    Typography.caption,
                    { color: colors.textMuted, fontWeight: '600', marginLeft: 8 },
                  ]}
                >
                  {item.distance}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 16,
    paddingBottom: 14,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputsCard: {
    margin: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorCol: {
    alignItems: 'center',
    marginRight: Spacing.md,
    paddingVertical: 10,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotLine: {
    width: 2,
    height: 38,
    borderStyle: 'dashed',
    borderLeftWidth: 1.5,
    marginVertical: 4,
  },
  dropSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  fieldsCol: {
    flex: 1,
  },
  locationInputBox: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  swapBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  savedPillsWrapper: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  destListContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  destItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  destIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  destTextCol: {
    flex: 1,
  },
});
