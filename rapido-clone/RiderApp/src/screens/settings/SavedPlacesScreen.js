import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { Typography, BorderRadius, Spacing } from '../../theme';
import { CustomHeader } from '../../components/common/CustomHeader';
import { CustomButton } from '../../components/common/CustomButton';
import { InputField } from '../../components/common/InputField';

export const SavedPlacesScreen = () => {
  const { colors, isDark } = useTheme();
  const { savedPlaces, addSavedPlace, deleteSavedPlace } = useUser();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newType, setNewType] = useState('favorite'); // 'home' | 'work' | 'favorite'

  const handleSavePlace = () => {
    if (!newTitle.trim() || !newAddress.trim()) {
      Alert.alert('Missing Info', 'Please enter a name and address.');
      return;
    }
    addSavedPlace({
      title: newTitle.trim(),
      address: newAddress.trim(),
      type: newType,
      lat: 12.93 + Math.random() * 0.05,
      lng: 77.62 + Math.random() * 0.05,
    });
    setShowAddModal(false);
    setNewTitle('');
    setNewAddress('');
    Alert.alert('Saved', 'New favorite location has been added!');
  };

  const handleDelete = (place) => {
    Alert.alert('Remove Saved Place', `Are you sure you want to remove "${place.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteSavedPlace(place.id) },
    ]);
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? colors.background : '#F8FAFC' },
      ]}
    >
      <CustomHeader
        title="Saved Places"
        subtitle="Quick one-tap destinations for easy booking"
        rightElement={
          <TouchableOpacity
            style={[styles.addTopBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          {savedPlaces.map((place) => (
            <View
              key={place.id}
              style={[
                styles.placeItem,
                { borderBottomColor: colors.border },
              ]}
            >
              <View style={styles.placeLeft}>
                <View
                  style={[
                    styles.iconWrapper,
                    {
                      backgroundColor:
                        place.type === 'home'
                          ? (isDark ? '#064E3B' : '#D1FAE5')
                          : place.type === 'work'
                          ? (isDark ? '#1E1B4B' : '#EEF2FF')
                          : (isDark ? colors.surfaceSubtle : colors.primaryLight),
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      place.type === 'home'
                        ? 'home'
                        : place.type === 'work'
                        ? 'briefcase'
                        : 'star'
                    }
                    size={22}
                    color={
                      place.type === 'home'
                        ? '#10B981'
                        : place.type === 'work'
                        ? '#6366F1'
                        : colors.primary
                    }
                  />
                </View>
                <View style={styles.textCol}>
                  <Text
                    style={[
                      Typography.title,
                      { color: colors.textPrimary, fontWeight: '700' },
                    ]}
                  >
                    {place.title}
                  </Text>
                  <Text
                    style={[
                      Typography.caption,
                      { color: colors.textSecondary, marginTop: 2 },
                    ]}
                    numberOfLines={2}
                  >
                    {place.address}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleDelete(place)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add New Destination Button */}
        <CustomButton
          title="Add New Favorite Place"
          variant="outline"
          size="medium"
          icon="plus-circle-outline"
          onPress={() => setShowAddModal(true)}
          style={{ marginTop: Spacing.xl }}
        />
      </ScrollView>

      {/* Add Place Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#131C2E' : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[Typography.headerSmall, { color: colors.textPrimary, marginBottom: 14 }]}>
              Add Saved Place
            </Text>

            {/* Type selector */}
            <View style={styles.typeSelectorRow}>
              {['favorite', 'home', 'work'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor:
                        newType === t
                          ? colors.primary
                          : (isDark ? colors.surfaceSubtle : '#F1F5F9'),
                    },
                  ]}
                  onPress={() => setNewType(t)}
                >
                  <Text
                    style={[
                      Typography.caption,
                      {
                        color: newType === t ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: '700',
                        textTransform: 'capitalize',
                      },
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <InputField
              label="Location Name"
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="e.g. Grandma's House, Tennis Court"
              icon="label-outline"
            />

            <InputField
              label="Full Street Address"
              value={newAddress}
              onChangeText={setNewAddress}
              placeholder="e.g. 14th Cross, 4th Sector, HSR Layout"
              icon="map-marker-outline"
              multiline
            />

            <View style={styles.modalBtnRow}>
              <CustomButton
                title="Cancel"
                variant="outline"
                size="small"
                onPress={() => setShowAddModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <CustomButton
                title="Save Place"
                variant="primary"
                size="small"
                onPress={handleSavePlace}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  addTopBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSection: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  placeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: Spacing.sm,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  textCol: {
    flex: 1,
  },
  deleteBtn: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  typeChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    marginRight: 8,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
});
