import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
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
import { SettingItem } from '../../components/settings/SettingItem';

export const ProfileScreen = () => {
  const { colors, isDark } = useTheme();
  const { user, updateProfile } = useUser();

  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [emName, setEmName] = useState(user.emergencyContact.name);
  const [emPhone, setEmPhone] = useState(user.emergencyContact.phone);

  const handleSaveProfile = () => {
    updateProfile({
      name,
      email,
      phone,
      emergencyContact: {
        ...user.emergencyContact,
        name: emName,
        phone: emPhone,
      },
    });
    setShowEditModal(false);
    Alert.alert('Profile Updated', 'Your profile details have been successfully saved.');
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? colors.background : '#F8FAFC' },
      ]}
    >
      <CustomHeader
        title="My Profile"
        subtitle="Manage personal information & credentials"
        rightElement={
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: colors.surfaceSubtle }]}
            onPress={() => setShowEditModal(true)}
          >
            <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View
          style={[
            styles.userHeroCard,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' }}
              style={styles.avatar}
            />
            <View style={[styles.onlineBadge, { backgroundColor: '#10B981' }]} />
          </View>

          <Text style={[Typography.headerMedium, { color: colors.textPrimary, marginTop: 12 }]}>
            {user.name}
          </Text>
          <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            {user.phone} • {user.email}
          </Text>

          {/* Stats Row */}
          <View
            style={[
              styles.statsRow,
              { backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC' },
            ]}
          >
            <View style={styles.statItem}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.statVal}>{user.rating}</Text>
              </View>
              <Text style={[Typography.captionSmall, { color: colors.textMuted, marginTop: 2 }]}>
                Rating
              </Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

            <View style={styles.statItem}>
              <Text style={[Typography.title, { color: colors.textPrimary, fontWeight: '800' }]}>
                {user.totalRides}
              </Text>
              <Text style={[Typography.captionSmall, { color: colors.textMuted, marginTop: 2 }]}>
                Total Rides
              </Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

            <View style={styles.statItem}>
              <Text style={[Typography.title, { color: colors.textPrimary, fontWeight: '800' }]}>
                Level 3
              </Text>
              <Text style={[Typography.captionSmall, { color: colors.textMuted, marginTop: 2 }]}>
                Elite Rider
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Details List */}
        <Text
          style={[
            Typography.caption,
            {
              color: colors.textSecondary,
              marginTop: Spacing.xl,
              marginBottom: Spacing.sm,
              fontWeight: '700',
              paddingHorizontal: Spacing.xs,
            },
          ]}
        >
          ACCOUNT DETAILS
        </Text>

        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <SettingItem
            icon="account-outline"
            title="Full Name"
            rightValue={user.name}
            showChevron={false}
          />
          <SettingItem
            icon="phone-outline"
            title="Mobile Number"
            rightValue={user.phone}
            showChevron={false}
          />
          <SettingItem
            icon="email-outline"
            title="Email Address"
            rightValue={user.email}
            showChevron={false}
          />
          <SettingItem
            icon="gender-male-female"
            title="Gender"
            rightValue={user.gender}
            showChevron={false}
          />
          <SettingItem
            icon="cake-variant-outline"
            title="Date of Birth"
            rightValue={user.dob}
            showChevron={false}
            style={{ borderBottomWidth: 0 }}
          />
        </View>

        {/* Emergency Contact */}
        <Text
          style={[
            Typography.caption,
            {
              color: colors.textSecondary,
              marginTop: Spacing.xl,
              marginBottom: Spacing.sm,
              fontWeight: '700',
              paddingHorizontal: Spacing.xs,
            },
          ]}
        >
          EMERGENCY GUARDIAN CONTACT
        </Text>

        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <SettingItem
            icon="shield-account-outline"
            iconColor="#EF4444"
            title={user.emergencyContact.name}
            subtitle={`${user.emergencyContact.relationship} • ${user.emergencyContact.phone}`}
            badgeText="PRIMARY"
            badgeColor="#EF4444"
            showChevron={false}
            style={{ borderBottomWidth: 0 }}
          />
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
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
              Edit Profile
            </Text>

            <InputField
              label="Full Name"
              value={name}
              onChangeText={setName}
              icon="account-outline"
            />
            <InputField
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              icon="email-outline"
              keyboardType="email-address"
            />
            <InputField
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              icon="phone-outline"
              keyboardType="phone-pad"
            />
            <InputField
              label="Emergency Contact Name"
              value={emName}
              onChangeText={setEmName}
              icon="account-heart"
            />
            <InputField
              label="Emergency Contact Phone"
              value={emPhone}
              onChangeText={setEmPhone}
              icon="phone-alert"
              keyboardType="phone-pad"
            />

            <View style={styles.modalBtnRow}>
              <CustomButton
                title="Cancel"
                variant="outline"
                size="small"
                onPress={() => setShowEditModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <CustomButton
                title="Save Changes"
                variant="primary"
                size="small"
                onPress={handleSaveProfile}
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
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userHeroCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#B45309',
    marginLeft: 3,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  detailsCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
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
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
});
