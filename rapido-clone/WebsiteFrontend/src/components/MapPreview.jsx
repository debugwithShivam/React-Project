import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, Bike, Car, Shield, RotateCw } from 'lucide-react';

export default function MapPreview({ pickup, dropoff, vehicleType = 'bike', isBookingActive = false }) {
  const [carStep, setCarStep] = useState(0);

  // Smooth car animation along route points
  useEffect(() => {
    const interval = setInterval(() => {
      setCarStep((prev) => (prev >= 4 ? 0 : prev + 1));
    }, 2000);
    return () => clearInterval(interval);
  }, [isBookingActive]);

  // Interpolated percentage coordinates along the route
  const carPositions = [
    { x: 22, y: 64 },
    { x: 38, y: 52 },
    { x: 50, y: 44 },
    { x: 62, y: 34 },
    { x: 74, y: 24 }
  ];

  const currentPos = carPositions[carStep];

  return (
    <div className="relative w-full h-[300px] sm:h-[380px] lg:h-[500px] bg-slate-100 rounded-3xl overflow-hidden border border-gray-200 shadow-inner select-none flex flex-col justify-between">
      
      {/* Background SVG styled city grid & roads - Fully responsive viewBox */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="1" />
          </pattern>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#F9C933" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>

        {/* Base background & grid */}
        <rect width="1000" height="600" fill="#F8FAFC" />
        <rect width="1000" height="600" fill="url(#city-grid)" />

        {/* City Blocks / Green Parks */}
        <rect x="80" y="80" width="220" height="160" rx="16" fill="#E2E8F0" opacity="0.7" />
        <rect x="680" y="60" width="240" height="180" rx="16" fill="#DCFCE7" opacity="0.8" />
        <rect x="120" y="380" width="260" height="160" rx="16" fill="#FEF3C7" opacity="0.6" />
        <rect x="650" y="360" width="260" height="180" rx="16" fill="#E2E8F0" opacity="0.7" />

        {/* Secondary Cross Streets */}
        <path d="M 0 200 Q 500 240 1000 180" stroke="#CBD5E1" strokeWidth="18" fill="none" strokeLinecap="round" />
        <path d="M 280 0 Q 300 300 320 600" stroke="#CBD5E1" strokeWidth="18" fill="none" strokeLinecap="round" />
        <path d="M 720 0 Q 700 300 740 600" stroke="#CBD5E1" strokeWidth="20" fill="none" strokeLinecap="round" />

        {/* Main Highway Road (Curved Route) */}
        <path
          d="M 160 440 C 320 440, 380 280, 520 280 S 680 340, 820 140"
          stroke="#334155"
          strokeWidth="24"
          fill="none"
          strokeLinecap="round"
        />
        {/* Road center dash */}
        <path
          d="M 160 440 C 320 440, 380 280, 520 280 S 680 340, 820 140"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeDasharray="10 10"
          fill="none"
          strokeLinecap="round"
        />

        {/* Active Route Colored Gradient Highlight */}
        <path
          d="M 160 440 C 320 440, 380 280, 520 280 S 680 340, 820 140"
          stroke="url(#routeGradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Landmark texts inside SVG so they scale responsively */}
        <text x="700" y="110" fill="#166534" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
          🌿 Eco Tech Park
        </text>
        <text x="140" y="490" fill="#854D0E" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
          🏢 Metro Hub Station
        </text>
      </svg>

      {/* Top Map Header Controls */}
      <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-sm border border-gray-200 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-gray-800">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Live Traffic: Clear
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setCarStep((prev) => (prev >= 4 ? 0 : prev + 1))}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 hover:text-black transition-colors"
            title="Simulate Movement"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-sm border border-gray-200 flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-gray-700">
            <Compass className="w-3.5 h-3.5 text-brand-dark" />
            <span className="hidden xs:inline">Bengaluru</span>
          </div>
        </div>
      </div>

      {/* 1. Pickup Pin (Green) - Responsive percentage positioning */}
      <div
        className="absolute z-10 flex flex-col items-center pointer-events-none transition-all duration-300 -translate-x-1/2 -translate-y-full"
        style={{ left: '16%', top: '74%' }}
      >
        <div className="bg-brand-dark text-white text-[9px] sm:text-[11px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md shadow-md border border-gray-700 mb-1 flex items-center gap-1 whitespace-nowrap max-w-[120px] sm:max-w-[180px] truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
          <span className="truncate">{pickup ? pickup.split(',')[0] : 'Pickup'}</span>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="absolute w-6 h-6 sm:w-8 sm:h-8 bg-emerald-400/40 rounded-full animate-ping"></div>
          <div className="w-7 h-7 sm:w-9 sm:h-9 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
          </div>
        </div>
      </div>

      {/* 2. Destination Pin (Red) - Visible on ALL screens with percentage positioning */}
      <div
        className="absolute z-10 flex flex-col items-center pointer-events-none transition-all duration-300 -translate-x-1/2 -translate-y-full"
        style={{ left: '82%', top: '24%' }}
      >
        <div className="bg-brand-dark text-white text-[9px] sm:text-[11px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md shadow-md border border-gray-700 mb-1 flex items-center gap-1 whitespace-nowrap max-w-[120px] sm:max-w-[180px] truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
          <span className="truncate">{dropoff ? dropoff.split(',')[0] : 'Dropoff'}</span>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="w-7 h-7 sm:w-9 sm:h-9 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <Navigation className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
          </div>
        </div>
      </div>

      {/* 3. Moving Captain Vehicle Marker - Smooth interpolation */}
      <div
        className="absolute z-20 flex flex-col items-center pointer-events-none transition-all duration-700 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${currentPos.x}%`, top: `${currentPos.y}%` }}
      >
        <div className="bg-brand-yellow text-brand-dark text-[8px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow border border-brand-dark mb-0.5 whitespace-nowrap">
          Captain ~2 min
        </div>
        <div className="w-7 h-7 sm:w-9 sm:h-9 bg-brand-dark text-brand-yellow rounded-full flex items-center justify-center shadow-lg border-2 border-brand-yellow">
          {vehicleType === 'bike' ? (
            <Bike className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          ) : (
            <Car className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          )}
        </div>
      </div>

      {/* Bottom Map Info Card - Compact & Fully responsive */}
      <div className="relative z-10 p-3 sm:p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 shadow-md border border-gray-200 flex items-center justify-between max-w-sm mx-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-yellow/30 flex items-center justify-center text-brand-dark shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-brand-dark" />
            </div>
            <div>
              <div className="text-[11px] sm:text-xs font-bold text-gray-900">Live GPS & SOS Guard</div>
              <div className="text-[9px] sm:text-[11px] text-gray-500">24x7 route telemetry</div>
            </div>
          </div>
          <div className="text-right pl-2 shrink-0">
            <span className="text-[11px] sm:text-xs font-black text-gray-900 block">Est. 18 mins</span>
            <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold">6.4 km</span>
          </div>
        </div>
      </div>

    </div>
  );
}
