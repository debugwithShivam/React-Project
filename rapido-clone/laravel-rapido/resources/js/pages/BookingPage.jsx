import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, ArrowUpDown, Tag, ShieldCheck, Check, Sparkles, Map as MapIcon, Clock, Calendar } from 'lucide-react';
import { VEHICLES, POPULAR_LOCATIONS } from '../data/mockData';
import VehicleCard from '../components/VehicleCard';
import MapPreview from '../components/MapPreview';
import RideStatusModal from '../components/RideStatusModal';
import { useSiteContent } from '../context/SiteContentContext';
import api from '../api/client';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const { content } = useSiteContent();
  const vehicles = content.vehicles || VEHICLES;

  const [bookingMode, setBookingMode] = useState(searchParams.get('mode') === 'schedule' ? 'schedule' : 'now');
  const [scheduleDate, setScheduleDate] = useState(() => {
    const d = searchParams.get('date');
    if (d) return d;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduleTime, setScheduleTime] = useState(searchParams.get('time') || '09:30');

  const [pickup, setPickup] = useState(
    searchParams.get('pickup') || 'Indiranagar Metro Station, Bangalore'
  );
  const [dropoff, setDropoff] = useState(
    searchParams.get('dropoff') || 'Koramangala 5th Block, Bangalore'
  );

  const initialType = searchParams.get('type') || 'bike';
  const foundVehicle = vehicles.find((v) => v.id === initialType) || vehicles[0];
  const [selectedVehicle, setSelectedVehicle] = useState(foundVehicle);

  const [distance] = useState(6.4); // km
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'cash' | 'upi' | 'wallet'
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [createdRide, setCreatedRide] = useState(null);
  const [showMobileMap, setShowMobileMap] = useState(true);

  // Sync if URL params change
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      const match = vehicles.find((v) => v.id === typeParam);
      if (match) setSelectedVehicle(match);
    }
  }, [searchParams, vehicles]);

  // Swap pickup & dropoff
  const handleSwap = () => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'RAPIDO50' || promoCode.trim().toUpperCase() === 'WELCOME') {
      setPromoApplied(true);
      alert('Promo Code Applied! ₹25 Flat Discount added.');
    } else {
      alert('Invalid coupon! Try using RAPIDO50 or WELCOME');
    }
  };

  const baseFare = Math.round(selectedVehicle.basePrice + (selectedVehicle.perKmRate * distance));
  const discount = promoApplied ? 25 : 0;
  const finalFare = Math.max(15, baseFare - discount);

  const handleConfirmBooking = async () => {
    if (!pickup || !dropoff) {
      alert('Please choose both pickup and dropoff locations.');
      return;
    }

    setBookingError('');
    setIsBooking(true);

    try {
      const response = await api.post('/rides/book', {
        pickup_title: pickup,
        pickup_address: pickup,
        drop_title: dropoff,
        drop_address: dropoff,
        vehicle_type: selectedVehicle.id,
        distance: `${distance} km`,
        duration: '18 mins',
        fare: finalFare,
        payment_method: paymentMethod.toUpperCase(),
      });

      setCreatedRide(response.data.ride);
      setIsBookingModalOpen(true);
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Unable to book this ride. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Header & Mode Switcher */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
              Book Your Ride <span className="text-brand-dark bg-brand-yellow px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase">Express</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Guaranteed lowest fares, zero hidden surge, verified captains.
            </p>
          </div>

          {/* Ride Now vs Schedule Switcher & Map Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-200 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setBookingMode('now')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  bookingMode === 'now'
                    ? 'bg-brand-dark text-white shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Ride Now
              </button>
              <button
                type="button"
                onClick={() => setBookingMode('schedule')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  bookingMode === 'schedule'
                    ? 'bg-brand-yellow text-brand-dark shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Schedule Later
              </button>
            </div>

            <div className="lg:hidden">
              <button
                onClick={() => setShowMobileMap(!showMobileMap)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white rounded-xl border border-gray-200 text-xs font-bold text-gray-800 shadow-sm"
              >
                <MapIcon className="w-3.5 h-3.5 text-brand-yellow" />
                <span>{showMobileMap ? 'Hide Map' : 'Map'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Form & Vehicle Pickers (7 Cols) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            
            {/* 1. Location Inputs Card */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-sm space-y-3.5 sm:space-y-4">
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  Select Ride Route
                </span>
                <button
                  type="button"
                  onClick={handleSwap}
                  className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-gray-600 hover:text-black bg-gray-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" /> Swap
                </button>
              </div>

              {/* Pickup Input */}
              <div className="relative">
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span> Pickup Location
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 absolute left-3.5 shrink-0" />
                  <input
                    type="text"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="Enter pickup point"
                    className="w-full pl-10 sm:pl-11 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:bg-white"
                  />
                </div>
              </div>

              {/* Dropoff Input */}
              <div className="relative">
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span> Dropoff Destination
                </label>
                <div className="relative flex items-center">
                  <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 absolute left-3.5 shrink-0" />
                  <input
                    type="text"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    placeholder="Enter destination"
                    className="w-full pl-10 sm:pl-11 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:bg-white"
                  />
                </div>
              </div>

              {/* Scheduled Ride Inputs */}
              {bookingMode === 'schedule' && (
                <div className="p-3 bg-yellow-50/70 border border-brand-yellow/60 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                    <Calendar className="w-4 h-4 text-brand-dark" />
                    <span>Advance Booking Settings</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Date</label>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Time</label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Estimated trip distance & duration bar */}
              <div className="bg-yellow-50/70 border border-yellow-200 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between text-[11px] sm:text-xs font-bold text-gray-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-dark"></span>
                  <span>Trip: {distance} km</span>
                </div>
                <div className="text-emerald-700 font-semibold">
                  {bookingMode === 'schedule' ? `Pickup on ${scheduleDate} @ ${scheduleTime}` : 'ETA: ~18 mins'}
                </div>
              </div>

            </div>

            {/* Mobile View: Map preview conditionally shown */}
            {showMobileMap && (
              <div className="lg:hidden">
                <MapPreview
                  pickup={pickup}
                  dropoff={dropoff}
                  vehicleType={selectedVehicle.id}
                  isBookingActive={isBookingModalOpen}
                />
              </div>
            )}

            {/* 2. Available Vehicle Types */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-extrabold text-gray-900 text-xs sm:text-sm uppercase tracking-wider">
                  Select Ride Category
                </h3>
                <span className="text-[11px] sm:text-xs text-gray-400 font-medium">5 types available</span>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    isSelected={selectedVehicle.id === vehicle.id}
                    onSelect={(veh) => setSelectedVehicle(veh)}
                    distance={distance}
                  />
                ))}
              </div>
            </div>

            {/* 3. Payment Method & Promo Code */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-sm space-y-3 sm:space-y-4">
              <h3 className="font-extrabold text-gray-900 text-xs sm:text-sm uppercase tracking-wider">
                Payment Method
              </h3>

              {/* Responsive Payment Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-brand-dark bg-yellow-50/70 ring-2 ring-brand-yellow font-bold'
                      : 'border-gray-200 hover:bg-gray-50 font-medium text-gray-700'
                  }`}
                >
                  <div className="text-xs text-brand-dark flex items-center justify-between">
                    <span>UPI / GPay / Paytm</span>
                    {paymentMethod === 'upi' && <Check className="w-3.5 h-3.5 text-brand-dark shrink-0" />}
                  </div>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">Instant & Cashless</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-brand-dark bg-yellow-50/70 ring-2 ring-brand-yellow font-bold'
                      : 'border-gray-200 hover:bg-gray-50 font-medium text-gray-700'
                  }`}
                >
                  <div className="text-xs text-brand-dark flex items-center justify-between">
                    <span>Cash on Ride</span>
                    {paymentMethod === 'cash' && <Check className="w-3.5 h-3.5 text-brand-dark shrink-0" />}
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Pay Captain Directly</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'wallet'
                      ? 'border-brand-dark bg-yellow-50/70 ring-2 ring-brand-yellow font-bold'
                      : 'border-gray-200 hover:bg-gray-50 font-medium text-gray-700'
                  }`}
                >
                  <div className="text-xs text-brand-dark flex items-center justify-between">
                    <span>Sawaari Wallet</span>
                    {paymentMethod === 'wallet' && <Check className="w-3.5 h-3.5 text-brand-dark shrink-0" />}
                  </div>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Balance: ₹240.00</span>
                </button>
              </div>

              {/* Promo code input */}
              <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5 sm:top-3" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Coupon (e.g. RAPIDO50)"
                    className="w-full pl-8 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-3.5 py-2 bg-gray-900 text-brand-yellow text-xs font-bold rounded-xl hover:bg-black transition-colors shrink-0"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Coupon RAPIDO50 Applied: Saved ₹25!
                </span>
              )}
            </div>

            {/* 4. Fare Summary & Final Booking CTA */}
            <div className="bg-brand-dark text-white p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left w-full sm:w-auto">
                <div className="text-xs text-gray-400">Total Payable Fare:</div>
                <div className="flex items-baseline justify-center sm:justify-start gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-brand-yellow">₹{finalFare}</span>
                  {promoApplied && (
                    <span className="text-xs text-gray-400 line-through">₹{baseFare}</span>
                  )}
                  <span className="text-[11px] text-gray-300">({selectedVehicle.name})</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark font-black rounded-2xl shadow-md transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              >
                <span>
                  {isBooking ? 'Booking Ride...' : bookingMode === 'schedule' ? 'Schedule Booking for Later' : 'Confirm & Request Ride'}
                </span>
              </button>
            </div>

            {bookingError && (
              <p className="text-center text-xs font-semibold text-rose-600" role="alert">
                {bookingError}
              </p>
            )}

          </div>

          {/* Right Column: Desktop Live Map (5 Cols) */}
          <div className="hidden lg:block lg:col-span-5 sticky top-28 space-y-4">
            <MapPreview
              pickup={pickup}
              dropoff={dropoff}
              vehicleType={selectedVehicle.id}
              isBookingActive={isBookingModalOpen}
            />

            {/* Safe Ride Guarantees Card */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-xs text-gray-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Sawaari Ride Guarantee</span>
              </div>
              <ul className="space-y-1 text-[11px] text-gray-500 pl-5 list-disc">
                <li>Zero cancellation charge if captain takes &gt; 5 mins</li>
                <li>Masked contact numbers to protect personal privacy</li>
                <li>Free rider accidental insurance on every booking</li>
              </ul>
            </div>
          </div>

        </div>

      </div>

      {/* Ride Confirmation, Digital Receipt & Rating Modal */}
      <RideStatusModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        rideDetails={{
          pickup,
          dropoff,
          vehicle: selectedVehicle.name,
          fare: finalFare,
          paymentMethod,
          bookingMode,
          scheduleDate,
          scheduleTime,
          id: createdRide?.id,
          otp: createdRide?.otp,
        }}
      />
    </div>
  );
}
