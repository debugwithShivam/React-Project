import React from 'react';
import { Link } from 'react-router-dom';
import { Bike, Zap, Car, Shield, ShieldCheck, ArrowRight, Star, Clock, Users, Smartphone, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';
import RideBookingWidget from '../components/RideBookingWidget';
import { VEHICLES, IMPACT_STATS, TESTIMONIALS } from '../data/mockData';

export default function HomePage() {
  return (
    <div className="space-y-14 sm:space-y-20 pb-16 overflow-hidden w-full">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-yellow-50/50 via-white to-white pt-6 sm:pt-12 pb-10 sm:pb-14 border-b border-gray-100 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              
             

              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15]">
                Beat the traffic. <br />
                <span className="text-brand-dark underline decoration-brand-yellow decoration-6 sm:decoration-8 underline-offset-4">
                  Save time & money.
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed font-normal max-w-xl">
                Zip through rush-hour traffic on a bike taxi or book guaranteed zero-haggling autos and comfortable cabs in over 150+ cities across India.
              </p>

              {/* Key trust bullets */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-1">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-gray-800 bg-white p-2 sm:p-2.5 rounded-xl border border-gray-100 shadow-sm">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-yellow shrink-0 fill-brand-yellow" />
                  <span>2 Mins Pickup</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-gray-800 bg-white p-2 sm:p-2.5 rounded-xl border border-gray-100 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                  <span>100% Insured</span>
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-gray-800 bg-white p-2 sm:p-2.5 rounded-xl border border-gray-100 shadow-sm">
                  <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-dark shrink-0" />
                  <span>Fares from ₹25</span>
                </div>
              </div>

              {/* Mobile CTA prompt */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
                <Link
                  to="/book"
                  className="px-5 sm:px-6 py-3 sm:py-3.5 bg-brand-dark hover:bg-black text-brand-yellow font-black rounded-xl shadow-lg flex items-center gap-2 text-xs sm:text-sm transition-all active:scale-95"
                >
                  <Bike className="w-4 h-4" /> Book Instant Ride
                </Link>
                <Link
                  to="/signup?role=captain"
                  className="px-4 sm:px-5 py-3 sm:py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-xl border border-gray-200 shadow-sm text-xs sm:text-sm transition-all"
                >
                  Earn as Captain →
                </Link>
              </div>

            </div>

            {/* Right Hero Widget */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
              <RideBookingWidget />
            </div>

          </div>
        </div>
      </section>

      {/* 2. FLEET & SERVICES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-brand-yellow bg-brand-dark px-3 py-1 rounded-full">
            Our Smart Fleet
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-2 sm:mt-3">
            A Ride for Every Commute
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
            Whether navigating narrow streets or travelling with family, pick the ride tailored for you.
          </p>
        </div>

        {/* Responsive Fleet Grid: 1 col on xs, 2 on sm, 3 on md, 5 on xl */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {VEHICLES.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-yellow-50 text-brand-dark flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-brand-yellow transition-colors shadow-sm">
                  {item.id === 'bike' && <Bike className="w-6 h-6 sm:w-7 sm:h-7" />}
                  {item.id === 'auto' && <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />}
                  {item.id === 'cab_economy' && <Car className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />}
                  {item.id === 'cab_premium' && <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />}
                  {item.id === 'parcel' && <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-pink-600" />}
                </div>

                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                  {item.tag}
                </span>

                <h3 className="text-base sm:text-lg font-black text-gray-900 mt-2">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{item.tagline}</p>
              </div>

              <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400">Starting from</span>
                  <div className="text-sm sm:text-base font-black text-gray-900">₹{item.basePrice}</div>
                </div>
                <Link
                  to={`/book?type=${item.id}`}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-100 hover:bg-brand-yellow text-gray-700 hover:text-brand-dark flex items-center justify-center transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. WHY CHOOSE US SECTION */}
      <section className="bg-brand-dark text-white py-12 sm:py-16 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            
            <div className="space-y-4 sm:space-y-6">
              <span className="text-xs font-bold text-brand-yellow uppercase tracking-widest">
                The Smart Advantage
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                Designed to eliminate daily peak traffic delays.
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Traditional cabs get stuck in traffic for hours and meter-taxis often cancel rides. We fix both by making two-wheelers and metered autos accessible with one click.
              </p>

              <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
                <div className="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-gray-900/80 border border-gray-800">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-yellow text-brand-dark flex items-center justify-center shrink-0 font-bold text-sm sm:text-base">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">Cuts Travel Time by 50%</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Bike taxis easily filter through stagnant jams, helping you reach offices punctually.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-gray-900/80 border border-gray-800">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 font-bold text-sm sm:text-base">
                    ₹
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">Up to 60% Cheaper than Regular Cabs</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Fair pricing starting at just ₹25. Guaranteed transparent fares without surge surprises.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-gray-900/80 border border-gray-800">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 font-bold text-sm sm:text-base">
                    🛡️
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">Safety First Commute</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Sanitized helmets provided, background-verified captains, and live GPS tracking.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right statistics grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {IMPACT_STATS.map((stat, i) => (
                <div
                  key={i}
                  className="bg-gray-900/60 p-4 sm:p-6 rounded-3xl border border-gray-800 flex flex-col justify-between hover:border-brand-yellow/50 transition-colors"
                >
                  <span className="text-2xl sm:text-4xl font-black text-brand-yellow font-mono">
                    {stat.value}
                  </span>
                  <div className="mt-3 sm:mt-4">
                    <h5 className="font-bold text-white text-xs sm:text-sm">{stat.label}</h5>
                    <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">{stat.description}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* 4. BECOME A CAPTAIN BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-r from-brand-yellow via-yellow-400 to-amber-400 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl text-brand-dark flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
          
          <div className="space-y-2.5 sm:space-y-3 max-w-2xl">
            <span className="bg-brand-dark text-brand-yellow text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full">
              Partner With Us
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Turn your bike or auto into daily income.
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-gray-900 max-w-xl">
              Earn up to ₹35,000 per month with complete working freedom. Choose your hours, get daily instant cash payouts, and comprehensive insurance cover.
            </p>
            <div className="flex flex-wrap gap-2.5 sm:gap-4 pt-1 text-[11px] sm:text-xs font-extrabold">
              <span className="flex items-center gap-1">✓ Zero Joining Fee</span>
              <span className="flex items-center gap-1">✓ Daily Payouts</span>
              <span className="flex items-center gap-1">✓ ₹5 Lakh Accident Cover</span>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <Link
              to="/signup?role=captain"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-brand-dark hover:bg-black text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2.5 text-xs sm:text-base transition-all hover:scale-105 active:scale-95"
            >
              <Bike className="w-4 h-4 sm:w-5 sm:h-5 text-brand-yellow" />
              <span>Register as Captain</span>
              <ArrowRight className="w-4 h-4 text-brand-yellow" />
            </Link>
          </div>

        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            User Stories
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-2 sm:mt-3">
            Loved by Millions of Daily Commuters
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
            Read how we are transforming daily office and college commutes across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-2 sm:mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-xs sm:text-sm italic leading-relaxed">
                  "{t.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-brand-yellow shrink-0"
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{t.name}</h4>
                  <div className="text-[10px] sm:text-[11px] text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. APP DOWNLOAD PROMO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gray-100 rounded-3xl p-6 sm:p-10 border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          
          <div className="space-y-2 sm:space-y-3 max-w-lg text-center md:text-left">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">
              Get the App for 1-Tap Booking
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Unlock exclusive app coupons, live ride tracking on lock screen, and faster captain matches.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2.5 pt-2">
              <button
                onClick={() => alert('Download on Google Play Store initiated!')}
                className="px-4 py-2.5 bg-brand-dark hover:bg-black text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm active:scale-95"
              >
                <Smartphone className="w-4 h-4 text-brand-yellow" />
                Google Play Store
              </button>
              <button
                onClick={() => alert('Download on Apple App Store initiated!')}
                className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm active:scale-95"
              >
                Apple App Store
              </button>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-md border border-gray-200 flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-center">
            <div className="w-18 h-18 sm:w-20 sm:h-20 bg-gray-900 rounded-xl flex items-center justify-center text-brand-yellow font-black text-[10px] sm:text-xs text-center p-2 shrink-0">
              [QR DEMO]
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900 block">Scan to Install</span>
              <span className="text-[10px] sm:text-[11px] text-gray-500">Android & iOS ready</span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
