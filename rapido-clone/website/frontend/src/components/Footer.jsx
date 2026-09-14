import React from 'react';
import { Link } from 'react-router-dom';
import { Bike, Shield, Heart, MapPin, Mail, Phone, ArrowUpRight, Smartphone, LayoutDashboard } from 'lucide-react';
import logo from '../image/logo.png';

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-gray-300 pt-14 pb-8 border-t border-gray-800 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 border-b border-gray-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                <img src={logo} alt="Sawaari Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Sawaari <span className="text-brand-yellow">Ride</span>
              </span>
            </Link>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Bharat's premier bike taxi, auto, and cab-hailing platform. Eliminating traffic bottlenecks and enabling millions of commuters to reach their destinations quickly and economically.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-brand-yellow text-xs font-semibold border border-brand-yellow/20">
                <Shield className="w-3.5 h-3.5" /> 100% Insured Rides
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                ⚡ 2-Minute Average Pickup
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-brand-yellow transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-brand-yellow transition-colors flex items-center gap-1">
                  Book a Ride <span className="text-[10px] bg-brand-yellow text-black font-bold px-1.5 rounded">FAST</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-yellow transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-brand-yellow transition-colors">Safety Standards</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-yellow transition-colors">24x7 Help Center</Link>
              </li>
            </ul>
          </div>

          {/* Ride Services */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Our Fleet</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/book?type=bike" className="hover:text-brand-yellow transition-colors">
                  Sawaari Bike Taxi
                </Link>
              </li>
              <li>
                <Link to="/book?type=auto" className="hover:text-brand-yellow transition-colors">
                  Sawaari Auto
                </Link>
              </li>
              <li>
                <Link to="/book?type=cab_economy" className="hover:text-brand-yellow transition-colors">
                  Cab Economy Hatchback
                </Link>
              </li>
              <li>
                <Link to="/book?type=cab_premium" className="hover:text-brand-yellow transition-colors">
                  Comfort Sedan
                </Link>
              </li>
              <li>
                <Link to="/book?type=parcel" className="hover:text-brand-yellow transition-colors">
                  Parcel & Delivery
                </Link>
              </li>
            </ul>
          </div>

          {/* Partner & Legal */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Legal & Partner</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm mb-4">
              <li>
                <Link to="/signup?role=captain" className="text-brand-yellow font-semibold hover:underline flex items-center gap-1">
                  Captain Onboarding & KYC <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-brand-yellow transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-brand-yellow transition-colors">Terms of Service</Link>
              </li>
            </ul>

            <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Smartphone className="w-4 h-4 text-brand-yellow" />
                <span className="text-xs font-bold text-white">Get Mobile App</span>
              </div>
              <p className="text-[11px] text-gray-400">Available on iOS App Store and Google Play.</p>
            </div>
          </div>

        </div>

        {/* Cities */}
        <div className="py-5 border-b border-gray-800/80 text-[11px] sm:text-xs text-gray-400">
          <span className="font-semibold text-gray-300 mr-2">Top Hubs:</span>
          Bengaluru • Hyderabad • Delhi NCR • Mumbai • Pune • Chennai • Kolkata • Jaipur • Ahmedabad • Chandigarh • Lucknow
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] sm:text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Sawaari Technologies India Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/privacy" className="hover:text-gray-300">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-300">Terms</Link>
            <Link to="/contact" className="hover:text-gray-300">Support</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
