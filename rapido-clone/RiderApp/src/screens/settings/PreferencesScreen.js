import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { Typography, BorderRadius, Spacing } from '../../theme';
import { CustomHeader } from '../../components/common/CustomHeader';
import { SettingItem } from '../../components/settings/SettingItem';

export const PreferencesScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { preferences, updatePreferences } = useUser();

  const [quietRide, setQuietRide] = useState(preferences.quietRide);
  const [insurance, setInsurance] = useState(preferences.rideInsurance);
  const [rideUpdates, setRideUpdates] = useState(preferences.notifications.rideUpdates);
  const [promoAlerts, setPromoAlerts] = useState(preferences.notifications.promotions);
  const [selectedLang, setSelectedLang] = useState(preferences.language);

  const languages = ['English', 'हिन्दी (Hindi)', 'ಕನ್ನಡ (Kannada)', 'తెలుగు (Telugu)', 'தமிழ் (Tamil)', 'বাংলা (Bengali)'];

  const handleSelectLang = (lang) => {
    setSelectedLang(lang);
    updatePreferences({ language: lang });
    Alert.alert('Language Selected', `App language set to ${lang}`);
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? colors.background : '#F8FAFC' },
      ]}
    >
      <CustomHeader
        title="Ride & App Preferences"
        subtitle="Customize your ride comfort, theme & language"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Ride Comfort & Trip Settings */}
        <Text
          style={[
            Typography.caption,
            {
              color: colors.textSecondary,
              marginTop: Spacing.sm,
              marginBottom: Spacing.sm,
              fontWeight: '700',
              paddingHorizontal: Spacing.xs,
            },
          ]}
        >
          TRIP & COMFORT PREFERENCES
        </Text>

        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <SettingItem
            icon="volume-mute"
            title="Quiet Ride Mode"
            subtitle="Politely requests captain to keep cabin quiet & music muted"
            isSwitch
            switchValue={quietRide}
            onSwitchChange={(val) => {
              setQuietRide(val);
              updatePreferences({ quietRide: val });
            }}
          />

          <SettingItem
            icon="shield-check-outline"
            title="Trip Insurance Cover"
            subtitle="₹5,00,000 accidental & hospital coverage per ride for ₹2"
            badgeText="RECOMMENDED"
            badgeColor="#10B981"
            isSwitch
            switchValue={insurance}
            onSwitchChange={(val) => {
              setInsurance(val);
              updatePreferences({ rideInsurance: val });
            }}
            style={{ borderBottomWidth: 0 }}
          />
        </View>

        {/* Display & Visuals */}
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
          APPEARANCE & THEME
        </Text>

        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <SettingItem
            icon="theme-light-dark"
            title="Dark Mode"
            subtitle="Switch between deep obsidian dark and crisp light theme"
            isSwitch
            switchValue={isDark}
            onSwitchChange={toggleTheme}
            style={{ borderBottomWidth: 0 }}
          />
        </View>

        {/* Language Selection */}
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
          APP LANGUAGE
        </Text>

        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          {languages.map((lang, index) => {
            const isSelected = selectedLang.includes(lang.split(' ')[0]);
            return (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.langRow,
                  {
                    borderBottomWidth: index === languages.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => handleSelectLang(lang)}
              >
                <Text
                  style={[
                    Typography.title,
                    {
                      color: isSelected ? colors.primary : colors.textPrimary,
                      fontSize: 14,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {lang}
                </Text>
                {isSelected && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notifications */}
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
          NOTIFICATIONS
        </Text>

        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <SettingItem
            icon="bell-ring-outline"
            title="Ride Updates & Status"
            subtitle="Driver arrival, route progress & trip receipts"
            isSwitch
            switchValue={rideUpdates}
            onSwitchChange={setRideUpdates}
          />
          <SettingItem
            icon="tag-outline"
            title="Discount & Promotional Offers"
            subtitle="Exclusive weekend coupons & cashback rewards"
            isSwitch
            switchValue={promoAlerts}
            onSwitchChange={setPromoAlerts}
            style={{ borderBottomWidth: 0 }}
          />
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
  cardSection: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
  },
});
