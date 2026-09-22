import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { onLocationPicked } from './locationBus';

export default function BookingScreen() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');

  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [dropoffLat, setDropoffLat] = useState<number | null>(null);
  const [dropoffLng, setDropoffLng] = useState<number | null>(null);

  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    const offPickup = onLocationPicked('pickup', (r) => {
      setPickupLat(r.latitude);
      setPickupLng(r.longitude);
      setPickup(r.address || `${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}`);
    });
    const offDrop = onLocationPicked('destination', (r) => {
      setDropoffLat(r.latitude);
      setDropoffLng(r.longitude);
      setDestination(r.address || `${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}`);
    });
    return () => { offPickup(); offDrop(); };
  }, []);

  const handleCurrentLocation = async () => {
    try {
      setGettingLocation(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Please allow location permission to use your current location.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      setPickupLat(latitude);
      setPickupLng(longitude);

      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];

        const parts = [
          address.name,
          address.street,
          address.district,
          address.city,
          address.region,
        ].filter(Boolean);

        setPickup(parts.join(', '));
      } else {
        setPickup(`${latitude}, ${longitude}`);
      }
    } catch (error) {
      console.error('CURRENT LOCATION ERROR:', error);

      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again.'
      );
    } finally {
      setGettingLocation(false);
    }
  };

  const handleContinue = () => {
    if (!pickup.trim() || !destination.trim()) {
      return;
    }

    router.push({
      pathname: '/ride/details',
      params: {
        pickup,
        destination,
        pickupLat: pickupLat?.toString() ?? '',
        pickupLng: pickupLng?.toString() ?? '',
        dropoffLat: dropoffLat?.toString() ?? '',
        dropoffLng: dropoffLng?.toString() ?? '',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/main/home');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#111111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Book a Ride</Text>

        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Where are you going?</Text>

        <Text style={styles.subtitle}>
          Enter your pickup and destination
        </Text>

        <View style={styles.locationCard}>
          <View style={styles.inputRow}>
            <View style={styles.dotPickup} />

            <TextInput
              style={styles.input}
              placeholder="Pickup location"
              placeholderTextColor="#999999"
              value={pickup}
              onChangeText={(text) => {
                setPickup(text);
                setPickupLat(null);
                setPickupLng(null);
              }}
            />
          </View>

          <View style={styles.line} />

          <View style={styles.inputRow}>
            <View style={styles.dotDestination} />

            <TextInput
              style={styles.input}
              placeholder="Where to?"
              placeholderTextColor="#999999"
              value={destination}
              onChangeText={setDestination}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.currentLocationButton}
          activeOpacity={0.8}
          onPress={handleCurrentLocation}
          disabled={gettingLocation}
        >
          {gettingLocation ? (
            <ActivityIndicator size="small" color="#111111" />
          ) : (
            <Ionicons
              name="locate-outline"
              size={21}
              color="#111111"
            />
          )}

          <Text style={styles.currentLocationText}>
            {gettingLocation
              ? 'Getting your location...'
              : 'Use my current location'}
          </Text>
        </TouchableOpacity>
<TouchableOpacity
  style={styles.mapButton}
  onPress={() => router.push('/ride/map-picker?type=pickup')}
>
  <Ionicons name="map-outline" size={20} color="#111111" />
  <Text style={styles.mapButtonText}>
    Pick Pickup on Map
  </Text>
</TouchableOpacity>
<TouchableOpacity
  style={styles.mapButton}
  onPress={() => router.push('/ride/map-picker?type=destination')}
>
  <Ionicons name="flag-outline" size={20} color="#111111" />
  <Text style={styles.mapButtonText}>
    Pick Destination on Map
  </Text>
</TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!pickup.trim() || !destination.trim()) &&
              styles.continueButtonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={handleContinue}
          disabled={!pickup.trim() || !destination.trim()}
        >
          <Text style={styles.continueText}>Continue</Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mapButton: {
  marginTop: 16,
  height: 50,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#dddddd',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
},

mapButtonText: {
  fontSize: 15,
  fontWeight: '600',
  color: '#111111',
},
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

  locationCard: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#111111',
    paddingHorizontal: 12,
  },

  dotPickup: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#111111',
  },

  dotDestination: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: '#ffffff',
  },

  line: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginLeft: 5,
  },

  currentLocationButton: {
    marginTop: 16,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dddddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
  },

  currentLocationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },

  continueButton: {
    marginTop: 20,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#111111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  continueButtonDisabled: {
    backgroundColor: '#aaaaaa',
  },

  continueText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});