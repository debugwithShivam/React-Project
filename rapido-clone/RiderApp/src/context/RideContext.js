import React, { createContext, useContext, useState } from 'react';
import { VEHICLE_OPTIONS, MOCK_CAPTAINS, MOCK_PAST_RIDES } from '../data/mockData';

const RideContext = createContext();

export const RideProvider = ({ children }) => {
  const [rideState, setRideState] = useState('IDLE'); // 'IDLE' | 'SEARCHING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'
  
  const [pickupLocation, setPickupLocation] = useState({
    title: 'My Current Location',
    address: 'Green Glen Layout, Outer Ring Rd, Bellandur',
    lat: 12.9279,
    lng: 77.6834,
  });

  const [dropLocation, setDropLocation] = useState({
    title: 'Forum Rex Walk, Brigade Road',
    address: 'Brigade Road, Ashok Nagar, Central Bengaluru',
    distance: '6.4 km',
    lat: 12.9719,
    lng: 77.6070,
  });

  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_OPTIONS[0]); // default Bike Taxi
  const [assignedCaptain, setAssignedCaptain] = useState(null);
  const [currentTripDetails, setCurrentTripDetails] = useState(null);
  const [pastRides, setPastRides] = useState(MOCK_PAST_RIDES);

  // Search timer ref
  const searchTimerRef = React.useRef(null);

  const calculateFare = (vehicle) => {
    const base = vehicle.basePrice;
    const distanceKm = 6.4;
    const total = base + Math.round(distanceKm * vehicle.perKm);
    return total;
  };

  const requestRide = () => {
    setRideState('SEARCHING');
    
    // Pick matching mock captain
    const captain = MOCK_CAPTAINS[selectedVehicle.id] || MOCK_CAPTAINS.bike;
    const fare = calculateFare(selectedVehicle);

    // Simulate captain match after 3.5 seconds
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setAssignedCaptain(captain);
      setCurrentTripDetails({
        id: `ride_${Math.floor(10000 + Math.random() * 90000)}`,
        vehicle: selectedVehicle,
        pickup: pickupLocation,
        dropoff: dropLocation,
        fare: fare,
        otp: captain.otp,
        distance: '6.4 km',
        estimatedDuration: '18 mins',
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setRideState('ASSIGNED');
    }, 3500);
  };

  const cancelRide = () => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    setRideState('IDLE');
    setAssignedCaptain(null);
    setCurrentTripDetails(null);
  };

  const startTrip = () => {
    setRideState('IN_PROGRESS');
  };

  const completeTrip = () => {
    setRideState('COMPLETED');
  };

  const finishAndRateTrip = (rating = 5, tip = 0, compliments = []) => {
    if (currentTripDetails) {
      const newRideEntry = {
        id: currentTripDetails.id,
        date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vehicleType: selectedVehicle.id,
        vehicleTitle: selectedVehicle.name,
        pickup: currentTripDetails.pickup.title,
        dropoff: currentTripDetails.dropoff.title,
        fare: currentTripDetails.fare + (tip || 0),
        status: 'COMPLETED',
        driverName: assignedCaptain?.name || 'Captain',
        ratingGiven: rating,
        distance: currentTripDetails.distance,
        duration: currentTripDetails.estimatedDuration,
        paymentMethod: 'UrbanRide Wallet',
      };
      setPastRides((prev) => [newRideEntry, ...prev]);
    }
    setRideState('IDLE');
    setAssignedCaptain(null);
    setCurrentTripDetails(null);
  };

  const rebookRide = (pastRide) => {
    setPickupLocation({
      title: pastRide.pickup,
      address: pastRide.pickup,
      lat: 12.9279,
      lng: 77.6834,
    });
    setDropLocation({
      title: pastRide.dropoff,
      address: pastRide.dropoff,
      distance: pastRide.distance,
      lat: 12.9719,
      lng: 77.6070,
    });
    const matchedVehicle = VEHICLE_OPTIONS.find(v => v.id === pastRide.vehicleType) || VEHICLE_OPTIONS[0];
    setSelectedVehicle(matchedVehicle);
    setRideState('IDLE');
  };

  return (
    <RideContext.Provider
      value={{
        rideState,
        setRideState,
        pickupLocation,
        setPickupLocation,
        dropLocation,
        setDropLocation,
        selectedVehicle,
        setSelectedVehicle,
        assignedCaptain,
        currentTripDetails,
        pastRides,
        calculateFare,
        requestRide,
        cancelRide,
        startTrip,
        completeTrip,
        finishAndRateTrip,
        rebookRide,
      }}
    >
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => useContext(RideContext);
