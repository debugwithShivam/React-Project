import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TrackingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.map}>
        <View style={styles.mapHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#111111" />
          </TouchableOpacity>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Driver on the way</Text>
          </View>
        </View>

        {/* Fake Route */}
        <View style={styles.routePath} />

        <View style={styles.pickupMarker}>
          <Ionicons name="location" size={25} color="#ffffff" />
        </View>

        <View style={styles.driverMarker}>
          <Ionicons name="car" size={22} color="#ffffff" />
        </View>

        <View style={styles.destinationMarker}>
          <Ionicons name="flag" size={18} color="#ffffff" />
        </View>
      </View>

      {/* Ride Details */}
      <View style={styles.bottomSheet}>
        <View style={styles.handle} />

        <View style={styles.etaRow}>
          <View>
            <Text style={styles.arrivalLabel}>Arriving in</Text>
            <Text style={styles.arrivalTime}>5 min</Text>
          </View>

          <View style={styles.rideStatus}>
            <Text style={styles.rideStatusText}>On the way</Text>
          </View>
        </View>

        {/* Driver */}
        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}>
            <Ionicons name="person" size={28} color="#777777" />
          </View>

          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>Rajesh Kumar</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#111111" />
              <Text style={styles.rating}>4.8</Text>
              <Text style={styles.tripCount}> • 1,240 rides</Text>
            </View>
          </View>

          <View style={styles.carInfo}>
            <Text style={styles.carNumber}>DL 01 AB 1234</Text>
            <Text style={styles.carModel}>Honda Activa</Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.locationCard}>
          <View style={styles.locationRow}>
            <View style={styles.pickupDot} />

            <View style={styles.locationText}>
              <Text style={styles.locationLabel}>Pickup</Text>
              <Text style={styles.locationValue}>
                Current location
              </Text>
            </View>
          </View>

          <View style={styles.locationLine} />

          <View style={styles.locationRow}>
            <View style={styles.destinationDot} />

            <View style={styles.locationText}>
              <Text style={styles.locationLabel}>Destination</Text>
              <Text style={styles.locationValue}>
                Your destination
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="call-outline" size={20} color="#111111" />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#111111" />
            <Text style={styles.actionText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#111111" />
            <Text style={styles.actionText}>Safety</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.replace('/main/home')}
        >
          <Text style={styles.cancelText}>Cancel Ride</Text>
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

  map: {
    height: '48%',
    backgroundColor: '#eeeeee',
    position: 'relative',
    overflow: 'hidden',
  },

  mapHeader: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#111111',
    marginRight: 7,
  },

  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },

  routePath: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderWidth: 7,
    borderColor: '#999999',
    borderRadius: 115,
    transform: [{ rotate: '25deg' }],
    top: 100,
    left: 80,
  },

  pickupMarker: {
    position: 'absolute',
    top: 105,
    left: 45,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  driverMarker: {
    position: 'absolute',
    top: 210,
    left: '48%',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  destinationMarker: {
    position: 'absolute',
    bottom: 55,
    right: 55,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomSheet: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -18,
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  handle: {
    width: 45,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#dddddd',
    alignSelf: 'center',
    marginBottom: 16,
  },

  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  arrivalLabel: {
    fontSize: 13,
    color: '#888888',
  },

  arrivalTime: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111111',
    marginTop: 2,
  },

  rideStatus: {
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 15,
  },

  rideStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
  },

  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eeeeee',
  },

  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
    justifyContent: 'center',
  },

  driverInfo: {
    flex: 1,
    marginLeft: 12,
  },

  driverName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  rating: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  tripCount: {
    fontSize: 11,
    color: '#888888',
  },

  carInfo: {
    alignItems: 'flex-end',
  },

  carNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
  },

  carModel: {
    fontSize: 11,
    color: '#888888',
    marginTop: 3,
  },

  locationCard: {
    marginTop: 12,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111111',
  },

  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#111111',
    backgroundColor: '#ffffff',
  },

  locationText: {
    marginLeft: 12,
  },

  locationLabel: {
    fontSize: 11,
    color: '#888888',
  },

  locationValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
    marginTop: 2,
  },

  locationLine: {
    height: 18,
    width: 1,
    backgroundColor: '#cccccc',
    marginLeft: 4,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111111',
  },

  cancelButton: {
    height: 42,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dddddd',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },
});