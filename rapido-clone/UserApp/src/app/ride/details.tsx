import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/api/axios';

export default function RideDetailsScreen() {
  const params = useLocalSearchParams<{ pickup?: string; destination?: string; pickupLat?: string; pickupLng?: string; dropoffLat?: string; dropoffLng?: string }>();
  const [vehicleType, setVehicleType] = React.useState<'BIKE' | 'AUTO' | 'CAB'>('BIKE');
  const [booking, setBooking] = React.useState(false);
  const [estimates, setEstimates] = React.useState<Record<string, any>>({});
  const [loadingEstimates, setLoadingEstimates] = React.useState(false);

  const pickupLat = params.pickupLat ? Number(params.pickupLat) : 0;
  const pickupLng = params.pickupLng ? Number(params.pickupLng) : 0;
  const dropoffLat = params.dropoffLat ? Number(params.dropoffLat) : 0;
  const dropoffLng = params.dropoffLng ? Number(params.dropoffLng) : 0;

  React.useEffect(() => {
    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) return;
    let mounted = true;
    setLoadingEstimates(true);
    api.post('/rides/estimate-all', { pickupLat, pickupLng, dropoffLat, dropoffLng })
      .then((r) => { if (mounted) setEstimates(r.data?.estimates || {}); })
      .catch((e) => console.log('ESTIMATE ERROR', e?.response?.data || e?.message))
      .finally(() => { if (mounted) setLoadingEstimates(false); });
    return () => { mounted = false; };
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng]);

  const fareFor = (vt: string) => estimates[vt]?.finalFare ?? (vt === 'BIKE' ? 49 : vt === 'AUTO' ? 89 : 149);
  const fare = fareFor(vehicleType);

  
const handleConfirmRide = async () => {
  if (!params.pickup || !params.destination) {
    Alert.alert('Missing details', 'Please select pickup and destination.');
    return;
  }

  try {
    setBooking(true);

    const res = await api.post('/rides', {
      pickupAddress: params.pickup,
      dropoffAddress: params.destination,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      vehicleType,
    });

    console.log('CREATE RIDE RESPONSE:', res.data);

    const rideId = res.data?.ride?.id;

    if (!rideId) {
      console.log('CREATE RIDE ERROR: ride ID missing', res.data);
      Alert.alert(
        'Booking failed',
        'Ride was created but no ride ID was returned.'
      );
      return;
    }

    console.log('CREATED RIDE ID:', rideId);

    router.replace({
      pathname: '/ride/searching',
      params: {
        rideId: String(rideId),
      },
    });
  } catch (error: any) {
    console.log(
      'CREATE RIDE ERROR:',
      error?.response?.data || error?.message
    );

    Alert.alert(
      'Booking failed',
      error?.response?.data?.message || 'Please try again.'
    );
  } finally {
    setBooking(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Ride Details</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Confirm your ride</Text>
        <Text style={styles.subtitle}>
          Review your ride details before booking
        </Text>

        {/* Route */}
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <View style={styles.pickupDot} />

            <View style={styles.locationContainer}>
              <Text style={styles.label}>Pickup</Text>
              <Text style={styles.location}>
                {params.pickup || 'Current location'}
              </Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routeRow}>
            <View style={styles.destinationDot} />

            <View style={styles.locationContainer}>
              <Text style={styles.label}>Destination</Text>
              <Text style={styles.location}>
                {params.destination || 'Your destination'}
              </Text>
            </View>
          </View>
        </View>

        {/* Vehicle */}
        <Text style={styles.sectionTitle}>Choose your ride</Text>

        <TouchableOpacity style={[styles.vehicleCard, vehicleType === 'BIKE' && styles.selectedVehicle]} onPress={() => setVehicleType('BIKE')} activeOpacity={0.8}>
          <View style={styles.vehicleIcon}>
            <Ionicons name="bicycle" size={28} color="#111111" />
          </View>

          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>Bike</Text>
            <Text style={styles.vehicleDescription}>
              Affordable and quick
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{fareFor('BIKE')}</Text>
            <View style={styles.selectedCircle}>
              <Ionicons name="checkmark" size={14} color="#ffffff" />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.vehicleCard, vehicleType === 'AUTO' && styles.selectedVehicle]} onPress={() => setVehicleType('AUTO')} activeOpacity={0.8}>
          <View style={styles.vehicleIcon}>
            <Ionicons name="car-outline" size={28} color="#111111" />
          </View>

          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>Auto</Text>
            <Text style={styles.vehicleDescription}>
              Comfortable everyday ride
            </Text>
          </View>

          <Text style={styles.price}>₹{fareFor('AUTO')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.vehicleCard, vehicleType === 'CAB' && styles.selectedVehicle]} onPress={() => setVehicleType('CAB')} activeOpacity={0.8}>
          <View style={styles.vehicleIcon}>
            <Ionicons name="car-sport-outline" size={28} color="#111111" />
          </View>

          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>Cab</Text>
            <Text style={styles.vehicleDescription}>
              Comfortable car ride
            </Text>
          </View>

          <Text style={styles.price}>₹{fareFor('CAB')}</Text>
        </TouchableOpacity>

        {/* Fare */}
        <View style={styles.fareCard}>
          <View>
            <Text style={styles.fareLabel}>Estimated fare</Text>
            <Text style={styles.fareNote}>
              Final fare may vary based on distance
            </Text>
          </View>

            <Text style={styles.totalFare}>₹{fare}</Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.confirmButton}
          activeOpacity={0.8}
          onPress={handleConfirmRide}
          disabled={booking}
        >
          {booking ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.confirmText}>Confirm Ride</Text>}
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111111',
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginTop: 6,
    marginBottom: 24,
  },

  routeCard: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#fafafa',
  },

  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationContainer: {
    marginLeft: 14,
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 3,
  },

  location: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },

  pickupDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#111111',
  },

  destinationDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#111111',
  },

  routeLine: {
    height: 28,
    width: 1,
    backgroundColor: '#cccccc',
    marginLeft: 6,
    marginVertical: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
    marginTop: 28,
    marginBottom: 12,
  },

  vehicleCard: {
    minHeight: 76,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedVehicle: {
    borderColor: '#FACC15',
    borderWidth: 2,
    backgroundColor: '#fffbea',
  },

  vehicleIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  vehicleInfo: {
    flex: 1,
    marginLeft: 14,
  },

  vehicleName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },

  vehicleDescription: {
    fontSize: 12,
    color: '#888888',
    marginTop: 3,
  },

  priceContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },

  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111111',
  },

  selectedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fareCard: {
    marginTop: 18,
    padding: 18,
    borderRadius: 15,
    backgroundColor: '#f7f7f7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  fareLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },

  fareNote: {
    fontSize: 11,
    color: '#888888',
    marginTop: 4,
  },

  totalFare: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
  },

  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },

  confirmButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#111111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  confirmText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});