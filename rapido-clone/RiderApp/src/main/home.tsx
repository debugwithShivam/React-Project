import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import api from '@/api/axios';

type RiderProfile = {
  id: number;
  name: string;
  phone: string;
  email: string;
  role?: string;
  profile_image?: string | null;
};

type VehicleOption = {
  id: string;
  name: string;
  tagline: string;
  eta: string;
  basePrice: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
};

const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'bike',
    name: 'Bike',
    tagline: 'Fastest & pocket friendly',
    eta: '2 mins away',
    basePrice: 25,
    icon: 'motorbike',
    color: '#F59E0B',
  },
  {
    id: 'auto',
    name: 'Auto',
    tagline: 'Guaranteed pickup, no haggling',
    eta: '4 mins away',
    basePrice: 40,
    icon: 'rickshaw',
    color: '#10B981',
  },
  {
    id: 'cab_economy',
    name: 'Cab Economy',
    tagline: 'AC hatchback for daily commute',
    eta: '6 mins away',
    basePrice: 70,
    icon: 'car-hatchback',
    color: '#3B82F6',
  },
  {
    id: 'cab_premium',
    name: 'Comfort Sedan',
    tagline: 'Top rated captains, extra legroom',
    eta: '8 mins away',
    basePrice: 110,
    icon: 'car',
    color: '#8B5CF6',
  },
  {
    id: 'parcel',
    name: 'Parcel',
    tagline: 'Send packages & essentials safely',
    eta: '3 mins away',
    basePrice: 35,
    icon: 'package-variant-closed',
    color: '#EC4899',
  },
];

const SAVED_PLACES: {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'home', label: 'Home', icon: 'home-outline' },
  { id: 'work', label: 'Work', icon: 'briefcase-outline' },
  { id: 'add', label: 'Add Place', icon: 'add-outline' },
];

export default function HomeScreen() {
  const [rider, setRider] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/me');

        if (mounted) {
          setRider(response.data?.user ?? null);
        }
      } catch (error: any) {
        console.log(
          'HOME PROFILE FETCH ERROR:',
          error?.response?.data || error?.message
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const firstName = rider?.name ? rider.name.split(' ')[0] : 'Rider';
  const initial = rider?.name ? rider.name.charAt(0).toUpperCase() : 'S';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {loading ? 'Hi there' : `Hi, ${firstName}`}
            </Text>
            <Text style={styles.subGreeting}>Where would you like to go?</Text>
          </View>

          <TouchableOpacity style={styles.avatar} activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator color="#FACC15" size="small" />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.8} onPress={() => router.push('/ride/booking')}>
          <View style={styles.searchIconBox}>
            <Ionicons name="search" size={16} color="#111111" />
          </View>
          <Text style={styles.searchPlaceholder}>Where to?</Text>
        </TouchableOpacity>

        {/* Saved places */}
        <View style={styles.placesRow}>
          {SAVED_PLACES.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.placeChip}
              activeOpacity={0.75}
            >
              <Ionicons
                name={place.icon}
                size={15}
                color="#111111"
                style={styles.placeIcon}
              />
              <Text style={styles.placeLabel}>{place.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promo banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoIconBox}>
            <Ionicons name="pricetag" size={20} color="#FACC15" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.promoTitle}>Save on every ride</Text>
            <Text style={styles.promoSubtitle}>
              Use code SAWAARI50 & get flat ₹50 off your first ride
            </Text>
          </View>
        </View>

        {/* Ride options */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Choose a ride</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.vehicleRow}
        >
          {VEHICLE_OPTIONS.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              style={styles.vehicleCard}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.vehicleIconBox,
                  { backgroundColor: `${vehicle.color}1A` },
                ]}
              >
                <MaterialCommunityIcons
                  name={vehicle.icon}
                  size={24}
                  color={vehicle.color}
                />
              </View>

              <Text style={styles.vehicleName}>{vehicle.name}</Text>
              <Text style={styles.vehicleTagline} numberOfLines={2}>
                {vehicle.tagline}
              </Text>

              <View style={styles.vehicleMetaRow}>
                <View style={styles.etaRow}>
                  <View style={styles.etaDot} />
                  <Text style={styles.vehicleEta}>{vehicle.eta}</Text>
                </View>
                <Text style={styles.vehiclePrice}>₹{vehicle.basePrice}+</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent rides */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent rides</Text>

          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyStateIconBox}>
            <Ionicons name="time-outline" size={22} color="#999999" />
          </View>
          <Text style={styles.emptyStateText}>
            Your recent rides will show up here once you book your first trip.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() =>  router.push('/main/home')}>
          <Ionicons name="home" size={22} color="#111111" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/main/rides')}>
          <Ionicons name="receipt-outline" size={22} color="#999999" />
          <Text style={styles.navLabel}>Rides</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/main/wallet')}>
          <Ionicons name="wallet-outline" size={22} color="#999999" />
          <Text style={styles.navLabel}>Wallet</Text>
        </TouchableOpacity>

       <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/main/profile')}>
          <Ionicons name="person-outline" size={22} color="#999999" />
          <Text style={styles.navLabel}>Profile</Text>
       </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingBottom: 24,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -0.3,
  },

  subGreeting: {
    marginTop: 4,
    fontSize: 14,
    color: '#666666',
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#FACC15',
    fontSize: 18,
    fontWeight: '800',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 14,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 14,
    marginBottom: 16,
  },

  searchIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  searchPlaceholder: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },

  placesRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  placeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#eeeeee',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
  },

  placeIcon: {
    marginRight: 6,
  },

  placeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },

  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },

  promoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(250,204,21,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  promoTitle: {
    color: '#FACC15',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },

  promoSubtitle: {
    color: '#d4d4d4',
    fontSize: 12.5,
    lineHeight: 18,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -0.2,
  },

  seeAll: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
  },

  vehicleRow: {
    paddingBottom: 8,
    paddingRight: 8,
  },

  vehicleCard: {
    width: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eeeeee',
    backgroundColor: '#ffffff',
    padding: 14,
    marginRight: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },

  vehicleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  vehicleName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 4,
  },

  vehicleTagline: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
    marginBottom: 12,
  },

  vehicleMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  etaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },

  vehicleEta: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },

  vehiclePrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111111',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eeeeee',
    backgroundColor: '#fafafa',
    paddingVertical: 28,
    paddingHorizontal: 24,
    marginBottom: 12,
  },

  emptyStateIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  emptyStateText: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
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
