import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { emitLocationPicked } from './locationBus';

export default function MapPickerScreen() {
  const params = useLocalSearchParams();

  const type = params.type === 'destination'
    ? 'destination'
    : 'pickup';

  const [region, setRegion] = useState<Region>({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [resolving, setResolving] = useState(false);

  const handleConfirm = async () => {
    try {
      setResolving(true);
      let address: string | undefined;
      try {
        const results = await Location.reverseGeocodeAsync({
          latitude: region.latitude,
          longitude: region.longitude,
        });
        if (results[0]) {
          const a = results[0];
          address = [a.name, a.street, a.district, a.city, a.region].filter(Boolean).join(', ');
        }
      } catch {}
      emitLocationPicked(type, {
        latitude: region.latitude,
        longitude: region.longitude,
        address,
      });
      router.back();
    } catch (error) {
      Alert.alert(
        'Location Error',
        'Unable to select this location.'
      );
    } finally {
      setResolving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#111111"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {type === 'pickup'
            ? 'Choose Pickup Location'
            : 'Choose Destination'}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation
          showsMyLocationButton
        >
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
          />
        </MapView>

        <View style={styles.centerMarker}>
          <Ionicons
            name="location"
            size={42}
            color="#111111"
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Move the map to select location
          </Text>

          <Text style={styles.infoText}>
            Drag the map and place the location exactly where you want.
          </Text>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.coordinateBox}>
          <Text style={styles.coordinateLabel}>
            Selected Location
          </Text>

          <Text style={styles.coordinateText}>
            {region.latitude.toFixed(6)},{' '}
            {region.longitude.toFixed(6)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          activeOpacity={0.8}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmText}>
            Confirm Location
          </Text>

          <Ionicons
            name="checkmark"
            size={21}
            color="#ffffff"
          />
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
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
  },

  mapContainer: {
    flex: 1,
    position: 'relative',
  },

  map: {
    flex: 1,
  },

  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -21,
    marginTop: -42,
  },

  infoCard: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },

  infoText: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },

  bottomContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },

  coordinateBox: {
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  coordinateLabel: {
    fontSize: 12,
    color: '#777777',
  },

  coordinateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginTop: 4,
  },

  confirmButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#111111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  confirmText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});