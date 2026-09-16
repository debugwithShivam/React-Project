import React from 'react';
import { Bike, Zap, Car, ShieldCheck, Package, Check, Users } from 'lucide-react';

const iconMap = {
  Bike: Bike,
  Zap: Zap,
  Car: Car,
  ShieldCheck: ShieldCheck,
  Package: Package
};

export default function VehicleCard({ vehicle, isSelected, onSelect, distance = 5 }) {
  const IconComponent = iconMap[vehicle.icon] || Car;
  const calculatedFare = Math.round(vehicle.basePrice + (vehicle.perKmRate * distance));

  return (
    <div
      onClick={() => onSelect(vehicle)}
      className={`relative p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer select-none flex items-center justify-between gap-2.5 sm:gap-4 ${
        isSelected
          ? 'border-brand-dark bg-yellow-50/70 shadow-md ring-2 ring-brand-yellow'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Selection pill */}
      {isSelected && (
        <div className="absolute -top-2.5 right-3 sm:right-4 bg-brand-dark text-brand-yellow text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" /> Selected
        </div>
      )}

      {/* Left: Vehicle Icon & Details */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
        <div
          className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
            isSelected ? 'bg-brand-yellow text-brand-dark' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2.2]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-bold text-gray-900 text-xs sm:text-base truncate">{vehicle.name}</h4>
            <span className="inline-flex items-center text-[10px] sm:text-xs text-gray-500 font-medium gap-0.5 bg-gray-100 px-1.5 py-0.2 rounded shrink-0">
              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {vehicle.capacity}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-gray-500 truncate mt-0.5">{vehicle.tagline}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
              {vehicle.eta}
            </span>
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium hidden xs:inline truncate">
              {vehicle.tag}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Price */}
      <div className="text-right shrink-0 pl-1">
        <div className="text-base sm:text-lg font-black text-gray-900">
          ₹{calculatedFare}
        </div>
        <div className="text-[10px] sm:text-[11px] text-gray-400 line-through">
          ₹{Math.round(calculatedFare * 1.25)}
        </div>
        <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1 py-0.2 rounded inline-block">
          25% OFF
        </span>
      </div>
    </div>
  );
}
