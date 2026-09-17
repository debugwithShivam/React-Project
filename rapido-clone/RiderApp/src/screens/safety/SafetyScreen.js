import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { Typography, BorderRadius, Spacing } from '../../theme';
import { CustomHeader } from '../../components/common/CustomHeader';
import { SettingItem } from '../../components/settings/SettingItem';
import { CustomButton } from '../../components/common/CustomButton';
import { SAFETY_OPTIONS } from '../../data/mockData';

export const SafetyScreen = () => {
  const { colors, isDark } = useTheme();
  const { user } = useUser();

  const [audioShieldEnabled, setAudioShieldEnabled] = useState(true);
  const [nightShieldEnabled, setNightShieldEnabled] = useState(true);
  const [autoShareEmergency, setAutoShareEmergency] = useState(true);

  const handleTriggerSOS = () => {
    Alert.alert(
      '🚨 EMERGENCY SOS ACTIVATED',
      'Connecting to National Emergency Helpline (112) and sending live GPS coordinates to trusted emergency contacts.\n\nProceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'CALL 112 NOW',
          style: 'destructive',
          onPress: () => Alert.alert('Dialing', 'Connecting to 112 emergency services...'),
        },
      ]
    );
  };

  const handleShareTrip = () => {
    Alert.alert(
      'Share Live Tracking',
      `Live trip link copied and sent to trusted contact: ${user.emergencyContact.name} (${user.emergencyContact.phone})`
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
        title="Safety Toolkit & SOS"
        subtitle="Your safety is our top priority 24/7"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Urgent Emergency SOS Hero Button */}
        <TouchableOpacity
          style={styles.sosHeroCard}
          onPress={handleTriggerSOS}
          activeOpacity={0.88}
        >
          <View style={styles.sosIconCircle}>
            <MaterialCommunityIcons name="shield-alert" size={38} color="#FFFFFF" />
          </View>
          <View style={styles.sosTextCol}>
            <Text style={styles.sosTitle}>EMERGENCY SOS (DIAL 112)</Text>
            <Text style={styles.sosDesc}>
              Tap to alert 24x7 safety response team & emergency services
            </Text>
          </View>
        </TouchableOpacity>

        {/* Trusted Emergency Contacts Card */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account-heart" size={22} color={colors.primary} />
            <Text
              style={[
                Typography.title,
                { color: colors.textPrimary, marginLeft: 8, fontWeight: '700' },
              ]}
            >
              Trusted Contact
            </Text>
          </View>

          <View
            style={[
              styles.contactBox,
              { backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC' },
            ]}
          >
            <View>
              <Text style={[Typography.title, { color: colors.textPrimary, fontSize: 15 }]}>
                {user.emergencyContact.name} ({user.emergencyContact.relationship})
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                {user.emergencyContact.phone}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleShareTrip}
              style={[styles.sharePill, { backgroundColor: colors.primaryLight }]}
            >
              <MaterialCommunityIcons name="share-variant" size={16} color={colors.primary} />
              <Text
                style={[
                  Typography.caption,
                  { color: colors.primary, marginLeft: 4, fontWeight: '700' },
                ]}
              >
                Share Trip
              </Text>
            </TouchableOpacity>
          </View>

          <SettingItem
            icon="bell-ring-outline"
            title="Auto-share night rides (after 8 PM)"
            subtitle="Automatically sends ride tracking SMS to trusted contact"
            isSwitch
            switchValue={autoShareEmergency}
            onSwitchChange={setAutoShareEmergency}
            style={{ borderBottomWidth: 0, paddingHorizontal: 0 }}
          />
        </View>

        {/* Safety Tools & Shields */}
        <Text
          style={[
            Typography.caption,
            {
              color: colors.textSecondary,
              marginTop: Spacing.lg,
              marginBottom: Spacing.sm,
              fontWeight: '700',
              paddingHorizontal: Spacing.xs,
            },
          ]}
        >
          ACTIVE SHIELDS & MONITORING
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
            icon="radar"
            title="Audio Shield & Ride Check"
            subtitle="Detects unexpected route deviations or extended stoppages"
            badgeText="AI ACTIVE"
            badgeColor="#10B981"
            isSwitch
            switchValue={audioShieldEnabled}
            onSwitchChange={setAudioShieldEnabled}
            style={{ paddingHorizontal: 0 }}
          />

          <SettingItem
            icon="weather-night"
            title="Night Safety Shield"
            subtitle="Mandatory 4-digit PIN verification before every trip"
            badgeText="ACTIVE"
            badgeColor="#6366F1"
            isSwitch
            switchValue={nightShieldEnabled}
            onSwitchChange={setNightShieldEnabled}
            style={{ paddingHorizontal: 0, borderBottomWidth: 0 }}
          />
        </View>

        {/* Safety Guidelines Checklist */}
        <View
          style={[
            styles.checklistCard,
            {
              backgroundColor: isDark ? '#162238' : '#F0F9FF',
              borderColor: colors.primary,
            },
          ]}
        >
          <Text
            style={[
              Typography.title,
              { color: colors.textPrimary, fontWeight: '700', marginBottom: 8 },
            ]}
          >
            🛡️ Rider Safety Checklist
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginBottom: 6 }]}>
            • Always verify vehicle license plate number before onboarding.
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginBottom: 6 }]}>
            • Wear the sanitized helmet provided by your bike captain.
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginBottom: 6 }]}>
            • Confirm your destination only starts after giving the 4-digit OTP.
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary }]}>
            • 24x7 in-trip emergency support is always just 1 tap away.
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
  sosHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#DC2626',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  sosIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  sosTextCol: {
    flex: 1,
  },
  sosTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sosDesc: {
    color: '#FEE2E2',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  sectionCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  contactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  sharePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
  },
  checklistCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
});
