import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { Typography, BorderRadius, Spacing } from '../../theme';
import { CustomHeader } from '../../components/common/CustomHeader';
import { SettingItem } from '../../components/settings/SettingItem';

export const SettingsScreen = ({ navigation, onNavigateSubScreen }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, walletBalance } = useUser();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => Alert.alert('Logged Out', 'You have been signed out safely.'),
        },
      ]
    );
  };

  const handleTerms = () => {
    Alert.alert(
      'Terms & Conditions',
      'UrbanRide Terms of Service:\n- Fair transparent upfront pricing\n- Zero tolerance for captain discrimination\n- In-trip insurance coverage under terms\n- Cancellation policy applies 3 mins after matching'
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'Your Privacy Matters:\n- Real-time location is shared strictly during active trips\n- Contact numbers are masked between riders and captains\n- Payment data is encrypted via RBI-compliant gateways'
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? colors.background : '#F8FAFC' },
      ]}
    >
      <CustomHeader
        title="Settings & Profile"
        subtitle="Manage your profile, safety, payments & preferences"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Summary */}
        <TouchableOpacity
          style={[
            styles.profileCard,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
          onPress={() => onNavigateSubScreen('PROFILE')}
          activeOpacity={0.85}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160' }}
            style={styles.profileAvatar}
          />
          <View style={styles.profileInfoCol}>
            <View style={styles.nameRow}>
              <Text style={[Typography.title, { color: colors.textPrimary, fontWeight: '800' }]}>
                {user.name}
              </Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.ratingText}>{user.rating}</Text>
              </View>
            </View>
            <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              {user.phone}
            </Text>
            <Text style={[Typography.captionSmall, { color: colors.primary, marginTop: 4, fontWeight: '700' }]}>
              View & Edit Profile →
            </Text>
          </View>
        </TouchableOpacity>

        {/* Account & Locations */}
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
          ACCOUNT & PLACES
        </Text>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <SettingItem
            icon="map-marker-multiple-outline"
            title="Saved Places"
            subtitle="Manage Home, Work, and favorite drop locations"
            onPress={() => onNavigateSubScreen('SAVED_PLACES')}
          />
          <SettingItem
            icon="wallet-outline"
            title="Payments & Wallet"
            subtitle="UrbanRide Wallet, Linked UPI, Cards"
            rightValue={`₹${walletBalance.toFixed(0)}`}
            onPress={() => onNavigateSubScreen('WALLET')}
            style={{ borderBottomWidth: 0 }}
          />
        </View>

        {/* Safety & Security */}
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
          SAFETY & EMERGENCY
        </Text>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <SettingItem
            icon="shield-alert-outline"
            iconColor="#EF4444"
            title="Emergency SOS & Toolkit"
            subtitle="112 National Helpline & Trusted Contacts"
            badgeText="24/7 ACTIVE"
            badgeColor="#EF4444"
            onPress={() => onNavigateSubScreen('SAFETY')}
            style={{ borderBottomWidth: 0 }}
          />
        </View>

        {/* Ride & App Preferences */}
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
          PREFERENCES & CUSTOMIZATION
        </Text>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <SettingItem
            icon="tune-vertical"
            title="Ride Preferences"
            subtitle="Quiet ride, insurance cover & notifications"
            onPress={() => onNavigateSubScreen('PREFERENCES')}
          />
          <SettingItem
            icon="theme-light-dark"
            title="Dark Mode"
            subtitle="Toggle deep obsidian dark theme"
            isSwitch
            switchValue={isDark}
            onSwitchChange={toggleTheme}
            style={{ borderBottomWidth: 0 }}
          />
        </View>

        {/* Customer Support & Legal */}
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
          SUPPORT & LEGAL
        </Text>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <SettingItem
            icon="headset"
            title="Help & Support"
            subtitle="24/7 customer chat, FAQs & lost items"
            onPress={() => onNavigateSubScreen('HELP')}
          />
          <SettingItem
            icon="file-document-outline"
            title="Terms of Service"
            onPress={handleTerms}
          />
          <SettingItem
            icon="shield-check-outline"
            title="Privacy Policy"
            onPress={handlePrivacy}
            style={{ borderBottomWidth: 0 }}
          />
        </View>

        {/* Sign Out & App Version */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
              marginTop: Spacing.xl,
            },
          ]}
        >
          <SettingItem
            icon="logout"
            title="Sign Out"
            subtitle="Sign out from this device"
            isDestructive
            onPress={handleLogout}
            style={{ borderBottomWidth: 0 }}
          />
        </View>

        <View style={styles.footerVersion}>
          <Text style={[Typography.caption, { color: colors.textMuted }]}>
            UrbanRide Mobile • v2.4.0 (Build 108)
          </Text>
          <Text style={[Typography.captionSmall, { color: colors.textMuted, marginTop: 2 }]}>
            Designed with Neo-Mobility UI Architecture
          </Text>
        </View>
      </ScrollView>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  profileAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginRight: Spacing.md,
  },
  profileInfoCol: {
    flex: 1,
  },
  nameRow: {
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
  sectionCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  footerVersion: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
});
