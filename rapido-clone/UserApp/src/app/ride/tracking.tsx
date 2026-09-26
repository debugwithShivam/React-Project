import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import MapView, { Marker, Polyline, LatLng } from 'react-native-maps';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/api/axios';
import { getSocket } from '@/api/socket';

type RideData = {
  id: number;
  status: string;

  pickup_address?: string;
  dropoff_address?: string;

  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_lat?: number;
  dropoff_lng?: number;

  estimated_fare?: number;
  final_fare?: number;

  ride_otp?: string;

  driver?: {
    id: number;
    name: string;
    phone?: string;
    rating?: number;
    total_rides?: number;
    vehicle_model?: string;
    vehicle_plate?: string;

    current_lat?: number;
    current_lng?: number;
  } | null;
};

const DEFAULT_REGION = {
  latitude: 28.6139,
  longitude: 77.209,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const calculateDistanceKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export default function TrackingScreen() {
  const params = useLocalSearchParams<{ rideId?: string }>();

  const rideId = params.rideId;

  const [ride, setRide] = useState<RideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [followingDriver, setFollowingDriver] = useState(true);

  const mapRef = useRef<MapView | null>(null);
  const hasFittedRef = useRef(false);

  const loadRide = useCallback(async () => {
    if (!rideId) return;

    try {
      const res = await api.get(`/rides/${rideId}`);

      setRide(res.data?.ride || null);
    } catch (e: any) {
      console.log(
        'RIDE LOAD ERROR',
        e?.response?.data || e?.message
      );
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadRide();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadRide]);

  useEffect(() => {
    if (!rideId) return;

    let socket: any;
    let mounted = true;

    (async () => {
      socket = await getSocket();

      if (!mounted) return;

      socket.emit('ride:join', {
        rideId,
      });

      socket.on('ride:status', (data: any) => {
        if (!mounted) return;

        if (data?.ride) {
          setRide(data.ride);
        } else {
          loadRide();
        }

        if (data?.status === 'COMPLETED') {
          router.replace({
            pathname: '/ride/receipt',
            params: {
              rideId: String(rideId),
            },
          });
        }

        if (data?.status === 'CANCELLED') {
          Alert.alert(
            'Ride cancelled',
            data?.reason || 'The ride was cancelled.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/main/home'),
              },
            ]
          );
        }
      });

      socket.on('ride:driver-location', (data: any) => {
        if (
          !mounted ||
          data?.lat == null ||
          data?.lng == null
        ) {
          return;
        }

        setRide((prev) =>
          prev?.driver
            ? {
                ...prev,
                driver: {
                  ...prev.driver,
                  current_lat: Number(data.lat),
                  current_lng: Number(data.lng),
                },
              }
            : prev
        );
      });

      socket.on('ride:cancelled', (data: any) => {
        if (!mounted) return;

        Alert.alert(
          'Ride cancelled',
          data?.reason || 'The ride was cancelled.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/main/home'),
            },
          ]
        );
      });
    })();

    return () => {
      mounted = false;

      if (socket) {
        socket.off('ride:status');
        socket.off('ride:driver-location');
        socket.off('ride:cancelled');

        socket.emit('ride:leave', {
          rideId,
        });
      }
    };
  }, [rideId, loadRide]);

  const pickupCoord: LatLng | null =
    ride?.pickup_lat != null && ride?.pickup_lng != null
      ? {
          latitude: Number(ride.pickup_lat),
          longitude: Number(ride.pickup_lng),
        }
      : null;

  const dropoffCoord: LatLng | null =
    ride?.dropoff_lat != null && ride?.dropoff_lng != null
      ? {
          latitude: Number(ride.dropoff_lat),
          longitude: Number(ride.dropoff_lng),
        }
      : null;

  const driverCoord: LatLng | null =
    ride?.driver?.current_lat != null &&
    ride?.driver?.current_lng != null
      ? {
          latitude: Number(ride.driver.current_lat),
          longitude: Number(ride.driver.current_lng),
        }
      : null;

  const fitAllMarkers = useCallback(() => {
    const coords = [
      pickupCoord,
      dropoffCoord,
      driverCoord,
    ].filter(Boolean) as LatLng[];

    if (!coords.length || !mapRef.current) return;

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: {
        top: 90,
        right: 50,
        bottom: 50,
        left: 50,
      },
      animated: true,
    });
  }, [pickupCoord, dropoffCoord, driverCoord]);

  // Fit the camera once, as soon as the first coordinates arrive.
  useEffect(() => {
    if (hasFittedRef.current) return;

    if (pickupCoord || driverCoord) {
      hasFittedRef.current = true;
      // Small delay so the map has finished laying out.
      const t = setTimeout(() => fitAllMarkers(), 300);
      return () => clearTimeout(t);
    }
  }, [pickupCoord, driverCoord, fitAllMarkers]);

  // Gently follow the driver as location updates arrive,
  // unless the user has taken control of the camera.
  useEffect(() => {
    if (
      !driverCoord ||
      !hasFittedRef.current ||
      !followingDriver ||
      !mapRef.current
    ) {
      return;
    }

    mapRef.current.animateCamera(
      { center: driverCoord },
      { duration: 750 }
    );
  }, [driverCoord, followingDriver]);

  const handleRecenter = () => {
    setFollowingDriver(true);
    fitAllMarkers();
  };

  const handleCall = async () => {
    if (!rideId) return;

    try {
      const res = await api.get(
        `/rides/${rideId}/contact-driver`
      );

      const phone = res.data?.driverPhone;

      if (phone) {
        Linking.openURL(`tel:${phone}`);
      } else {
        Alert.alert(
          'Unavailable',
          'Driver contact is not available yet.'
        );
      }
    } catch {
      Alert.alert(
        'Error',
        'Unable to reach driver.'
      );
    }
  };

  const handleSos = async () => {
    if (!rideId) return;

    Alert.alert(
      'SOS',
      'Send emergency alert to safety team?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send SOS',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/rides/${rideId}/sos`);

              Alert.alert(
                'SOS sent',
                'Our safety team has been alerted.'
              );
            } catch {
              Alert.alert(
                'Error',
                'Unable to send SOS.'
              );
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    if (!rideId) return;

    Alert.alert(
      'Cancel ride',
      'Are you sure? Cancellation charges may apply.',
      [
        {
          text: 'Keep ride',
          style: 'cancel',
        },
        {
          text: 'Cancel ride',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.patch(
                `/rides/${rideId}/cancel`,
                {
                  reason: 'User cancelled',
                }
              );

              const charges =
                res.data?.cancellationCharges;

              Alert.alert(
                'Ride cancelled',
                charges
                  ? `Cancellation charge: ₹${charges}`
                  : 'Your ride has been cancelled.',
                [
                  {
                    text: 'OK',
                    onPress: () =>
                      router.replace('/main/home'),
                  },
                ]
              );
            } catch (e: any) {
              Alert.alert(
                'Error',
                e?.response?.data?.message ||
                  'Unable to cancel.'
              );
            }
          },
        },
      ]
    );
  };

  const getDriverEta = () => {
    const driverLat = ride?.driver?.current_lat;
    const driverLng = ride?.driver?.current_lng;

    const pickupLat = ride?.pickup_lat;
    const pickupLng = ride?.pickup_lng;

    if (
      driverLat == null ||
      driverLng == null ||
      pickupLat == null ||
      pickupLng == null
    ) {
      return null;
    }

    const distanceKm = calculateDistanceKm(
      Number(driverLat),
      Number(driverLng),
      Number(pickupLat),
      Number(pickupLng)
    );

    const etaMinutes = Math.max(
      1,
      Math.ceil((distanceKm / 25) * 60)
    );

    return {
      distanceKm,
      etaMinutes,
    };
  };

  const driverEta = getDriverEta();

  const statusLabel =
    {
      SEARCHING: 'Finding driver',
      ACCEPTED: 'Driver on the way',
      ARRIVING: 'Driver arriving',
      STARTED: 'On trip',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      SCHEDULED: 'Scheduled',
    }[ride?.status || ''] ||
    ride?.status ||
    'Loading';

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color="#111111"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={
            pickupCoord
              ? {
                  ...pickupCoord,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }
              : DEFAULT_REGION
          }
          onPanDrag={() => {
            // User grabbed the map — stop auto-following.
            if (followingDriver) setFollowingDriver(false);
          }}
        >
          {pickupCoord && (
            <Marker coordinate={pickupCoord}>
              <View style={styles.pickupMarker}>
                <Ionicons
                  name="location"
                  size={22}
                  color="#ffffff"
                />
              </View>
            </Marker>
          )}

          {dropoffCoord && (
            <Marker coordinate={dropoffCoord}>
              <View style={styles.destinationMarker}>
                <Ionicons
                  name="flag"
                  size={18}
                  color="#ffffff"
                />
              </View>
            </Marker>
          )}

          {driverCoord && (
            <Marker coordinate={driverCoord}>
              <View style={styles.driverMarker}>
                <Ionicons
                  name="car"
                  size={22}
                  color="#ffffff"
                />
              </View>
            </Marker>
          )}

          {pickupCoord && dropoffCoord && (
            <Polyline
              coordinates={[pickupCoord, dropoffCoord]}
              strokeColor="#111111"
              strokeWidth={4}
            />
          )}
        </MapView>

        <View style={styles.mapHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.replace('/main/home')
            }
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#111111"
            />
          </TouchableOpacity>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />

            <Text style={styles.statusText}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {!followingDriver && (
          <TouchableOpacity
            style={styles.recenterButton}
            onPress={handleRecenter}
          >
            <Ionicons
              name="locate"
              size={20}
              color="#111111"
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.bottomSheet}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      >
        <View style={styles.handle} />

        <View style={styles.etaRow}>
          <View>
            <Text style={styles.arrivalLabel}>
              {ride?.status === 'STARTED'
                ? 'Trip fare'
                : 'Arriving in'}
            </Text>

            <Text style={styles.arrivalTime}>
              {ride?.status === 'STARTED' ||
              ride?.status === 'COMPLETED'
                ? `₹${
                    ride?.final_fare ??
                    ride?.estimated_fare ??
                    0
                  }`
                : driverEta
                  ? `~${driverEta.etaMinutes} min (est.)`
                  : 'Calculating...'}
            </Text>

            {ride?.status !== 'STARTED' &&
              ride?.status !== 'COMPLETED' &&
              driverEta && (
                <Text style={styles.distanceText}>
                  {driverEta.distanceKm.toFixed(1)} km
                  away
                </Text>
              )}
          </View>

          <View style={styles.rideStatus}>
            <Text style={styles.rideStatusText}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {ride?.ride_otp &&
          ride?.status === 'ACCEPTED' && (
            <View style={styles.otpCard}>
              <Text style={styles.otpLabel}>
                Share this OTP with driver to start
              </Text>

              <Text style={styles.otpValue}>
                {ride.ride_otp}
              </Text>
            </View>
          )}

        {ride?.driver && (
          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Ionicons
                name="person"
                size={28}
                color="#777777"
              />
            </View>

            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>
                {ride.driver.name}
              </Text>

              <View style={styles.ratingRow}>
                <Ionicons
                  name="star"
                  size={14}
                  color="#111111"
                />

                <Text style={styles.rating}>
                  {Number(
                    ride.driver.rating || 0
                  ).toFixed(1)}
                </Text>

                <Text style={styles.tripCount}>
                  {' '}
                  • {ride.driver.total_rides || 0}{' '}
                  rides
                </Text>
              </View>
            </View>

            <View style={styles.carInfo}>
              <Text style={styles.carNumber}>
                {ride.driver.vehicle_plate}
              </Text>

              <Text style={styles.carModel}>
                {ride.driver.vehicle_model}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.locationCard}>
          <View style={styles.locationRow}>
            <View style={styles.pickupDot} />

            <View style={styles.locationText}>
              <Text style={styles.locationLabel}>
                Pickup
              </Text>

              <Text style={styles.locationValue}>
                {ride?.pickup_address ||
                  'Current location'}
              </Text>
            </View>
          </View>

          <View style={styles.locationLine} />

          <View style={styles.locationRow}>
            <View style={styles.destinationDot} />

            <View style={styles.locationText}>
              <Text style={styles.locationLabel}>
                Destination
              </Text>

              <Text style={styles.locationValue}>
                {ride?.dropoff_address ||
                  'Your destination'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCall}
          >
            <Ionicons
              name="call-outline"
              size={20}
              color="#111111"
            />

            <Text style={styles.actionText}>
              Call
            </Text>
          </TouchableOpacity>

          {ride?.driver && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push({
                  pathname: '/ride/chat',
                  params: { rideId: String(rideId) },
                })
              }
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color="#111111"
              />

              <Text style={styles.actionText}>
                Chat
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSos}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#DC2626"
            />

            <Text
              style={[
                styles.actionText,
                {
                  color: '#DC2626',
                },
              ]}
            >
              SOS
            </Text>
          </TouchableOpacity>
        </View>

        {ride?.status !== 'COMPLETED' &&
          ride?.status !== 'CANCELLED' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelText}>
                Cancel Ride
              </Text>
            </TouchableOpacity>
          )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  mapContainer: {
    height: '48%',
    backgroundColor: '#eeeeee',
    position: 'relative',
    overflow: 'hidden',
  },

  map: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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

  recenterButton: {
    position: 'absolute',
    bottom: 34,
    right: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  pickupMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  driverMarker: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  destinationMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
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

  distanceText: {
    fontSize: 12,
    color: '#888888',
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

  otpCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fffbea',
    borderWidth: 1,
    borderColor: '#FACC15',
    alignItems: 'center',
  },

  otpLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 6,
  },

  otpValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: 6,
  },
});
