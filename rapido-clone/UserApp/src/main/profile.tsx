import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import api from '@/api/axios';
import { clearTokens } from '@/storage/authStorage';

type RiderProfile = {
  id: number;
  name: string;
  phone: string;
  email: string;
  role?: string;
  profile_image?: string | null;
};

export default function ProfileScreen() {
  const [rider, setRider] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/users/me');

      setRider(response.data?.user ?? null);
    } catch (error: any) {
      console.log(
        'PROFILE FETCH ERROR:',
        error?.response?.data || error?.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProfile]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post('/auth/logout');
            } catch (error) {
              console.log('LOGOUT API ERROR:', error);
            } finally {
              await clearTokens();
              router.replace('/');
            }
          },
        },
      ]
    );
  };

  const firstLetter =
    rider?.name?.charAt(0)?.toUpperCase() || 'S';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>

          <TouchableOpacity
            style={styles.settingsButton}
            activeOpacity={0.8}
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color="#111111"
            />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {loading ? (
              <ActivityIndicator
                color="#FACC15"
                size="small"
              />
            ) : (
              <Text style={styles.avatarText}>
                {firstLetter}
              </Text>
            )}
          </View>

          <View style={styles.profileInfo}>
            {loading ? (
              <>
                <View style={styles.loadingName} />
                <View style={styles.loadingText} />
              </>
            ) : (
              <>
                <Text style={styles.name}>
                  {rider?.name || 'Rider'}
                </Text>

                <Text style={styles.email}>
                  {rider?.email || 'No email added'}
                </Text>

                <View style={styles.phoneRow}>
                  <Ionicons
                    name="call-outline"
                    size={14}
                    color="#777777"
                  />

                  <Text style={styles.phone}>
                    {rider?.phone || 'No phone added'}
                  </Text>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.8}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#111111"
            />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.menuCard}>
          <ProfileMenuItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your personal information"
          />

          <ProfileMenuItem
            icon="location-outline"
            title="Saved Places"
            subtitle="Manage Home, Work and other places"
          />

          <ProfileMenuItem
            icon="card-outline"
            title="Payment Methods"
            subtitle="Manage your payment options"
          />
        </View>

        {/* Support */}
        <Text style={styles.sectionTitle}>Support</Text>

        <View style={styles.menuCard}>
          <ProfileMenuItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help with your rides"
          />

          <ProfileMenuItem
            icon="document-text-outline"
            title="Terms & Conditions"
            subtitle="Read Sawaari terms"
          />

          <ProfileMenuItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            subtitle="Learn how we protect your data"
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Sawaari</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons
            name="log-out-outline"
            size={21}
            color="#DC2626"
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/main/home')}
        >
          <Ionicons
            name="home-outline"
            size={22}
            color="#999999"
          />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/main/rides')}
        >
          <Ionicons
            name="receipt-outline"
            size={22}
            color="#999999"
          />
          <Text style={styles.navLabel}>Rides</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/main/wallet')}
        >
          <Ionicons
            name="wallet-outline"
            size={22}
            color="#999999"
          />
          <Text style={styles.navLabel}>Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="person"
            size={22}
            color="#111111"
          />
          <Text
            style={[
              styles.navLabel,
              styles.navLabelActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ProfileMenuItem({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      activeOpacity={0.7}
    >
      <View style={styles.menuIcon}>
        <Ionicons
          name={icon}
          size={21}
          color="#111111"
        />
      </View>

      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>
          {title}
        </Text>

        <Text style={styles.menuSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#AAAAAA"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111111',
  },

  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 18,
    padding: 18,
    marginBottom: 28,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 3,
  },

  email: {
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 5,
  },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  phone: {
    fontSize: 12,
    color: '#cccccc',
    marginLeft: 5,
  },

  editButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingName: {
    width: 100,
    height: 17,
    borderRadius: 5,
    backgroundColor: '#333333',
    marginBottom: 7,
  },

  loadingText: {
    width: 140,
    height: 12,
    borderRadius: 5,
    backgroundColor: '#333333',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 10,
  },

  menuCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#eeeeee',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuContent: {
    flex: 1,
    marginLeft: 12,
  },

  menuTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111111',
  },

  menuSubtitle: {
    fontSize: 11,
    color: '#888888',
    marginTop: 3,
  },

  appInfo: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },

  appName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111111',
  },

  version: {
    fontSize: 11,
    color: '#999999',
    marginTop: 3,
  },

  logoutButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#DC2626',
    marginLeft: 8,
  },

  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
  },

  navLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#999999',
  },

  navLabelActive: {
    color: '#111111',
    fontWeight: '800',
  },
});
