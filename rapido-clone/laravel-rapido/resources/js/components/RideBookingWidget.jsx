import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Bike, Zap, Car, ArrowRight, Clock, Calendar, Shield } from 'lucide-react';
import { POPULAR_LOCATIONS, VEHICLES } from '../data/mockData';
import { useSiteContent } from '../context/SiteContentContext';

export default function RideBookingWidget({ onBookDirect }) {
  const navigate = useNavigate();
  const { content } = useSiteContent();
  const vehicles = content.vehicles || VEHICLES;
  const [bookingMode, setBookingMode] = useState('now'); // 'now' | 'schedule'
  const [scheduleDate, setScheduleDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduleTime, setScheduleTime] = useState('09:30');

  const [pickup, setPickup] = useState('Indiranagar Metro Station, Bangalore');
  const [dropoff, setDropoff] = useState('Koramangala 5th Block, Bangalore');
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]);
  const [showPickupList, setShowPickupList] = useState(false);
  const [showDropoffList, setShowDropoffList] = useState(false);

  const handleAction = (e) => {
    e.preventDefault();
    if (!pickup || !dropoff) {
      alert('Please enter both pickup and destination locations!');
      return;
    }
    const queryParams = new URLSearchParams({
      pickup,
      dropoff,
      type: selectedVehicle.id,
      mode: bookingMode,
      ...(bookingMode === 'schedule' ? { date: scheduleDate, time: scheduleTime } : {})
    });

    if (onBookDirect) {
      onBookDirect({
        pickup,
        dropoff,
        vehicle: selectedVehicle,
        bookingMode,
        scheduleDate,
        scheduleTime
      });
    } else {
      navigate(`/book?${queryParams.toString()}`);
    }
  };

  const calculatedFare = Math.round(selectedVehicle.basePrice + (selectedVehicle.perKmRate * 6.5));

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-7 max-w-xl w-full">
      
      {/* Header Tag & Booking Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100">
        <div>
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-brand-dark bg-brand-yellow px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md">
            Fastest Booking
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1 sm:mt-2">Where to next?</h2>
        </div>

        {/* Ride Now vs Schedule Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setBookingMode('now')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              bookingMode === 'schedule'
                ? 'bg-brand-yellow text-brand-dark shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Schedule
          </button>
        </div>
      </div>

      <form onSubmit={handleAction} className="space-y-3.5 sm:space-y-4">
        
        {/* Pickup Input */}
        <div className="relative">
          <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span> Pickup Location
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 sm:left-3.5 text-gray-400">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
            </div>
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              onFocus={() => setShowPickupList(true)}
              placeholder="Enter pickup point"
              className="w-full pl-9 sm:pl-11 pr-3 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:bg-white transition-all"
            />
          </div>

          {/* Autocomplete suggestions */}
          {showPickupList && (
            <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Popular Hubs
              </div>
              {POPULAR_LOCATIONS.map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setPickup(loc);
                    setShowPickupList(false);
                  }}
                  className="px-3 py-2 text-xs font-medium text-gray-700 hover:bg-yellow-50 hover:text-black rounded-lg cursor-pointer flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{loc}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Destination Input */}
        <div className="relative">
          <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span> Dropoff Destination
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 sm:left-3.5 text-gray-400">
              <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
            </div>
            <input
              type="text"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              onFocus={() => setShowDropoffList(true)}
              placeholder="Where are you heading?"
              className="w-full pl-9 sm:pl-11 pr-3 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:bg-white transition-all"
            />
          </div>

          {/* Autocomplete suggestions */}
          {showDropoffList && (
            <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Popular Destinations
              </div>
              {POPULAR_LOCATIONS.map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setDropoff(loc);
                    setShowDropoffList(false);
                  }}
                  className="px-3 py-2 text-xs font-medium text-gray-700 hover:bg-yellow-50 hover:text-black rounded-lg cursor-pointer flex items-center gap-2"
                >
                  <Navigation className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{loc}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Ride Date & Time Pickers */}
        {bookingMode === 'schedule' && (
          <div className="p-3 bg-yellow-50/70 border border-brand-yellow/60 rounded-2xl space-y-2 animate-in fade-in">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
              <Calendar className="w-4 h-4 text-brand-dark" />
              <span>Schedule Pickup in Advance</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Pickup Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Pickup Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-500">
              ⚡ Guaranteed captain assigned 15 minutes before scheduled departure.
            </p>
          </div>
        )}

        {/* Vehicle Selector Pills */}
        <div className="pt-1">
          <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 sm:mb-2">
            Select Ride Type
          </label>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {vehicles.slice(0, 3).map((veh) => (
              <button
                key={veh.id}
                type="button"
                onClick={() => setSelectedVehicle(veh)}
                className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  selectedVehicle.id === veh.id
                    ? 'border-brand-dark bg-yellow-50 shadow-sm ring-2 ring-brand-yellow text-brand-dark font-bold'
                    : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100 text-gray-600 font-semibold'
                }`}
              >
                {veh.id === 'bike' && <Bike className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1 text-brand-dark" />}
                {veh.id === 'auto' && <Zap className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1 text-emerald-600" />}
                {veh.id === 'cab_economy' && <Car className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1 text-blue-600" />}
                <span className="text-[10px] sm:text-xs truncate max-w-full">{veh.name.replace('Rapido ', '')}</span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 font-mono mt-0.5">
                  ₹{Math.round(veh.basePrice + veh.perKmRate * 6.5)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Summary & Button */}
        <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-gray-100">
          <div className="flex items-center justify-between sm:block">
            <div className="text-[11px] sm:text-xs text-gray-500 font-medium">Guaranteed Fare:</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-gray-900">₹{calculatedFare}</span>
              <span className="text-[11px] sm:text-xs text-gray-400 line-through">₹{Math.round(calculatedFare * 1.25)}</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">No Surge</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 sm:px-7 py-3 sm:py-3.5 bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark font-black rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group text-xs sm:text-sm active:scale-95"
          >
            <span>
              {bookingMode === 'schedule' ? 'Schedule Ride' : `Book ${selectedVehicle.name.replace('Rapido ', '')}`}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </form>
    </div>
  );
}
