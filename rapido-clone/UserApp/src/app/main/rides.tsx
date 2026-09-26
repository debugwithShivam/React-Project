import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/api/axios';

type Ride = {
  id: string;
  vehicle: string;
  pickup: string;
  drop: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Cancelled' | 'Ongoing';
};

const RIDES: Ride[] = [
  {
    id: '1',
    vehicle: 'Bike',
    pickup: 'Connaught Place',
    drop: 'India Gate',
    date: 'Today, 10:30 AM',
    amount: 85,
    status: 'Completed',
  },
  {
    id: '2',
    vehicle: 'Auto',
    pickup: 'Karol Bagh',
    drop: 'Rajendra Place',
    date: 'Yesterday, 6:15 PM',
    amount: 120,
    status: 'Completed',
  },
];

export default function RidesScreen() {
  const [rides, setRides] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  useFocusEffect(React.useCallback(() => {
    let active = true;
    api.get('/rides/my').then((response) => {
      if (active) setRides(response.data.rides || []);
    }).catch(() => {}).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []));
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/main/home');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={22} color="#111111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Rides</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Ride History</Text>
        <Text style={styles.pageSubtitle}>
          View your previous and ongoing rides
        </Text>

        {loading ? (
          <Text style={styles.emptyText}>Loading your rides...</Text>
        ) : rides.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="receipt-outline"
                size={28}
                color="#999999"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No rides yet
            </Text>

            <Text style={styles.emptyText}>
              Your completed rides will appear here.
            </Text>

            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => router.push('/main/home')}
            >
              <Text style={styles.bookButtonText}>
                Book a Ride
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          rides.map((ride) => (
            <TouchableOpacity
              key={ride.id}
              style={styles.rideCard}
              activeOpacity={0.85}
            >
              <View style={styles.rideTopRow}>
                <View style={styles.vehicleRow}>
                  <View style={styles.vehicleIconBox}>
                    <Ionicons
                      name={
                        ride.vehicle_type === 'BIKE'
                          ? 'bicycle'
                          : 'car-outline'
                      }
                      size={22}
                      color="#111111"
                    />
                  </View>

                  <View>
                    <Text style={styles.vehicleName}>
                      {ride.vehicle_type}
                    </Text>

                    <Text style={styles.rideDate}>
                      {new Date(ride.created_at).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.amount}>
                  ₹{ride.final_fare || ride.estimated_fare || 0}
                </Text>
              </View>

              <View style={styles.locationRow}>
                <View style={styles.locationLine}>
                  <View style={styles.pickupDot} />
                  <View style={styles.verticalLine} />
                  <View style={styles.dropDot} />
                </View>

                <View style={styles.locationText}>
                  <Text style={styles.locationLabel}>
                    Pickup
                  </Text>

                  <Text style={styles.locationValue}>
                    {ride.pickup_address}
                  </Text>

                  <View style={styles.locationGap} />

                  <Text style={styles.locationLabel}>
                    Drop
                  </Text>

                  <Text style={styles.locationValue}>
                    {ride.dropoff_address}
                  </Text>
                </View>
              </View>

              <View style={styles.rideBottomRow}>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />

                  <Text style={styles.statusText}>
                    {ride.status}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#999999"
                />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/main/home')}
        >
          <Ionicons name="home-outline" size={22} color="#999999" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="receipt" size={22} color="#111111" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Rides</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/main/wallet')}
        >
          <Ionicons name="wallet-outline" size={22} color="#999999" />
          <Text style={styles.navLabel}>Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/main/profile')}
        >
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

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
  },

  headerSpacer: {
    width: 40,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
  },

  pageSubtitle: {
    marginTop: 5,
    marginBottom: 22,
    fontSize: 14,
    color: '#666666',
  },

  rideCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#eeeeee',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  rideTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  vehicleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  vehicleName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111111',
  },

  rideDate: {
    marginTop: 3,
    fontSize: 12,
    color: '#888888',
  },

  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111111',
  },

  locationRow: {
    flexDirection: 'row',
    marginTop: 18,
  },

  locationLine: {
    width: 18,
    alignItems: 'center',
    paddingTop: 5,
  },

  pickupDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#111111',
  },

  verticalLine: {
    width: 1,
    height: 28,
    backgroundColor: '#dddddd',
  },

  dropDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FACC15',
  },

  locationText: {
    flex: 1,
    marginLeft: 8,
  },

  locationLabel: {
    fontSize: 11,
    color: '#999999',
    fontWeight: '600',
  },

  locationValue: {
    marginTop: 2,
    fontSize: 14,
    color: '#111111',
    fontWeight: '600',
  },

  locationGap: {
    height: 12,
  },

  rideBottomRow: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 25,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f3f3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
  },

  emptyText: {
    marginTop: 6,
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
  },

  bookButton: {
    marginTop: 20,
    backgroundColor: '#111111',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 12,
  },

  bookButtonText: {
    color: '#FACC15',
    fontSize: 14,
    fontWeight: '800',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    backgroundColor: '#ffffff',
    paddingTop: 10,
    paddingBottom: 14,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    color: '#999999',
    fontSize: 11,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#111111',
    fontWeight: '700',
  },
});
