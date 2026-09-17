import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Typography, BorderRadius, Spacing } from '../theme';

// Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { ActivityScreen } from '../screens/activity/ActivityScreen';
import { SafetyScreen } from '../screens/safety/SafetyScreen';
import { WalletScreen } from '../screens/settings/WalletScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { ProfileScreen } from '../screens/settings/ProfileScreen';
import { SavedPlacesScreen } from '../screens/settings/SavedPlacesScreen';
import { PreferencesScreen } from '../screens/settings/PreferencesScreen';
import { HelpSupportScreen } from '../screens/settings/HelpSupportScreen';

export const AppNavigator = () => {
  const { colors, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('HOME'); // 'HOME' | 'ACTIVITY' | 'SAFETY' | 'WALLET' | 'SETTINGS'
  const [settingsSubScreen, setSettingsSubScreen] = useState(null); // 'PROFILE' | 'SAVED_PLACES' | 'WALLET' | 'SAFETY' | 'PREFERENCES' | 'HELP'

  const navigateToTab = (tabName) => {
    setActiveTab(tabName);
    setSettingsSubScreen(null);
  };

  const navigationProp = {
    navigate: (target) => {
      if (target === 'HomeTab') navigateToTab('HOME');
      else if (target === 'ActivityTab') navigateToTab('ACTIVITY');
      else if (target === 'SafetyTab') navigateToTab('SAFETY');
      else if (target === 'WalletTab') navigateToTab('WALLET');
      else if (target === 'SettingsTab') navigateToTab('SETTINGS');
      else if (target === 'Profile') setSettingsSubScreen('PROFILE');
      else if (target === 'SavedPlaces') setSettingsSubScreen('SAVED_PLACES');
    },
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'ACTIVITY':
        return <ActivityScreen navigation={navigationProp} />;
      case 'SAFETY':
        return <SafetyScreen navigation={navigationProp} />;
      case 'WALLET':
        return <WalletScreen navigation={navigationProp} />;
      case 'SETTINGS':
        if (settingsSubScreen === 'PROFILE') {
          return (
            <View style={{ flex: 1 }}>
              <ProfileScreen />
              <TouchableOpacity
                style={[styles.floatingBackBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setSettingsSubScreen(null)}
              >
                <MaterialCommunityIcons name="arrow-left" size={20} color={colors.textPrimary} />
                <Text style={[Typography.caption, { color: colors.textPrimary, marginLeft: 4, fontWeight: '700' }]}>
                  Back to Settings
                </Text>
              </TouchableOpacity>
            </View>
          );
        }
        if (settingsSubScreen === 'SAVED_PLACES') {
          return (
            <View style={{ flex: 1 }}>
              <SavedPlacesScreen />
              <TouchableOpacity
                style={[styles.floatingBackBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setSettingsSubScreen(null)}
              >
                <MaterialCommunityIcons name="arrow-left" size={20} color={colors.textPrimary} />
                <Text style={[Typography.caption, { color: colors.textPrimary, marginLeft: 4, fontWeight: '700' }]}>
                  Back to Settings
                </Text>
              </TouchableOpacity>
            </View>
          );
        }
        if (settingsSubScreen === 'PREFERENCES') {
          return (
            <View style={{ flex: 1 }}>
              <PreferencesScreen />
              <TouchableOpacity
                style={[styles.floatingBackBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setSettingsSubScreen(null)}
              >
                <MaterialCommunityIcons name="arrow-left" size={20} color={colors.textPrimary} />
                <Text style={[Typography.caption, { color: colors.textPrimary, marginLeft: 4, fontWeight: '700' }]}>
                  Back to Settings
                </Text>
              </TouchableOpacity>
            </View>
          );
        }
        if (settingsSubScreen === 'HELP') {
          return (
            <View style={{ flex: 1 }}>
              <HelpSupportScreen />
              <TouchableOpacity
                style={[styles.floatingBackBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setSettingsSubScreen(null)}
              >
                <MaterialCommunityIcons name="arrow-left" size={20} color={colors.textPrimary} />
                <Text style={[Typography.caption, { color: colors.textPrimary, marginLeft: 4, fontWeight: '700' }]}>
                  Back to Settings
                </Text>
              </TouchableOpacity>
            </View>
          );
        }
        if (settingsSubScreen === 'WALLET') {
          return (
            <View style={{ flex: 1 }}>
              <WalletScreen navigation={navigationProp} />
              <TouchableOpacity
                style={[styles.floatingBackBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setSettingsSubScreen(null)}
              >
                <MaterialCommunityIcons name="arrow-left" size={20} color={colors.textPrimary} />
                <Text style={[Typography.caption, { color: colors.textPrimary, marginLeft: 4, fontWeight: '700' }]}>
                  Back to Settings
                </Text>
              </TouchableOpacity>
            </View>
          );
        }
        if (settingsSubScreen === 'SAFETY') {
          return (
            <View style={{ flex: 1 }}>
              <SafetyScreen />
              <TouchableOpacity
                style={[styles.floatingBackBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setSettingsSubScreen(null)}
              >
                <MaterialCommunityIcons name="arrow-left" size={20} color={colors.textPrimary} />
                <Text style={[Typography.caption, { color: colors.textPrimary, marginLeft: 4, fontWeight: '700' }]}>
                  Back to Settings
                </Text>
              </TouchableOpacity>
            </View>
          );
        }
        return (
          <SettingsScreen
            navigation={navigationProp}
            onNavigateSubScreen={(sub) => setSettingsSubScreen(sub)}
          />
        );
      case 'HOME':
      default:
        return <HomeScreen navigation={navigationProp} />;
    }
  };

  const tabs = [
    { id: 'HOME', label: 'Ride', icon: 'motorbike' },
    { id: 'ACTIVITY', label: 'Activity', icon: 'history' },
    { id: 'SAFETY', label: 'Safety', icon: 'shield-check-outline' },
    { id: 'WALLET', label: 'Wallet', icon: 'wallet-outline' },
    { id: 'SETTINGS', label: 'Account', icon: 'account-circle-outline' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Screen Display */}
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Bottom Navigation Bar */}
      <View
        style={[
          styles.bottomTabBar,
          {
            backgroundColor: isDark ? colors.surface : '#FFFFFF',
            borderTopColor: colors.border,
          },
        ]}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => navigateToTab(tab.id)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.tabIconWrap,
                  isActive && {
                    backgroundColor: colors.primaryLight,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={tab.icon}
                  size={22}
                  color={isActive ? colors.primary : colors.textMuted}
                />
              </View>
              <Text
                style={[
                  Typography.captionSmall,
                  {
                    color: isActive ? colors.primary : colors.textMuted,
                    fontWeight: isActive ? '800' : '500',
                    marginTop: 2,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  bottomTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabIconWrap: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingBackBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 36 : 14,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 999,
  },
});
