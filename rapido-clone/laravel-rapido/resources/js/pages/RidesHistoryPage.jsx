import React, { useState } from 'react';
import { 
  Clock, MapPin, Navigation, Calendar, Receipt, Download, 
  Star, Wallet, ArrowRight, ShieldCheck, CheckCircle2, XCircle, AlertCircle, ChevronRight 
} from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';

export default function RidesHistoryPage() {
  const { user } = useOutletContext();
  const [activeTab, setActiveTab] = useState('completed'); // 'scheduled' | 'completed' | 'cancelled'
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const [scheduledRides, setScheduledRides] = useState([
    {
      id: 'SW-SCH-101',
      date: 'Tomorrow, 09:30 AM',
      pickup: 'Indiranagar Metro Station, Bangalore',
      dropoff: 'Kempegowda International Airport (BLR)',
      vehicle: 'Comfort Sedan',
      fare: 680,
      paymentMethod: 'UPI',
      status: 'Confirmed'
    }
  ]);

  const [completedRides, setCompletedRides] = useState([
    {
      id: 'SW-9821',
      date: '14 Sep 2026, 02:15 PM',
      pickup: 'Indiranagar Metro Station, Bangalore',
      dropoff: 'Koramangala 5th Block, Bangalore',
      vehicle: 'Rapido Bike',
      captain: 'Ramesh Kumar (Honda Activa 6G - KA 04 MX 7289)',
      fare: 65,
      baseFare: 45,
      distanceFare: 16.75,
      tax: 3.25,
      discount: 0,
      paymentMethod: 'UPI / Google Pay',
      rating: 5,
      compliments: ['Polite Captain', 'Clean Helmet']
    },
    {
      id: 'SW-9740',
      date: '12 Sep 2026, 07:45 PM',
      pickup: 'MG Road Trinity Metro',
      dropoff: 'HSR Layout Sector 2',
      vehicle: 'Rapido Auto',
      captain: 'Deepak Rao (Bajaj Auto - KA 03 MX 4410)',
      fare: 110,
      baseFare: 75,
      distanceFare: 29.5,
      tax: 5.5,
      discount: 25,
      paymentMethod: 'Cash on Ride',
      rating: 5,
      compliments: ['On-time Pickup', 'Smooth Route']
    },
    {
      id: 'SW-9612',
      date: '09 Sep 2026, 09:10 AM',
      pickup: 'Whitefield ITPL Main Gate',
      dropoff: 'Indiranagar 100 Feet Rd',
      vehicle: 'Cab Economy',
      captain: 'Arjun Das (Maruti WagonR - KA 01 JJ 2291)',
      fare: 185,
      baseFare: 120,
      distanceFare: 55.75,
      tax: 9.25,
      discount: 0,
      paymentMethod: 'Sawaari Wallet',
      rating: 4,
      compliments: ['AC Working', 'Safe Driver']
    }
  ]);

  const [cancelledRides, setCancelledRides] = useState([
    {
      id: 'SW-CAN-089',
      date: '05 Sep 2026, 11:20 AM',
      pickup: 'Koramangala 4th Block',
      dropoff: 'MG Road',
      vehicle: 'Rapido Bike',
      fee: 0,
      reason: 'Plan changed by user within 2 minutes'
    }
  ]);

  const handleCancelScheduled = (id) => {
    if (window.confirm('Are you sure you want to cancel this scheduled ride? Zero cancellation fee.')) {
      setScheduledRides(scheduledRides.filter((r) => r.id !== id));
      alert('Scheduled ride cancelled successfully.');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header & Wallet Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">My Rides & Receipts</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {user?.name ? `${user.name}, review your past commutes and receipts.` : 'Review your past commutes and receipts.'}
            </p>
          </div>

          {/* Sawaari Wallet Card */}
          <div className="bg-yellow-50/80 border border-brand-yellow/60 rounded-2xl p-3.5 flex items-center gap-3 self-stretch sm:self-auto shrink-0">
            <div className="w-10 h-10 rounded-xl bg-brand-yellow text-brand-dark flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Sawaari Wallet</span>
              <span className="text-base font-black text-gray-900">₹240.00</span>
            </div>
            <button
              onClick={() => alert('Add Money via UPI / Net Banking modal')}
              className="ml-2 px-3 py-1 bg-brand-dark hover:bg-black text-brand-yellow text-xs font-bold rounded-lg shadow-sm"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'completed'
                ? 'bg-brand-dark text-white shadow-sm'
                : 'text-gray-600 hover:text-black bg-white border border-gray-200'
            }`}
          >
            Completed Rides ({completedRides.length})
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'scheduled'
                ? 'bg-brand-dark text-white shadow-sm'
                : 'text-gray-600 hover:text-black bg-white border border-gray-200'
            }`}
          >
            Scheduled / Later
            {scheduledRides.length > 0 && (
              <span className="bg-brand-yellow text-brand-dark text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {scheduledRides.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'cancelled'
                ? 'bg-brand-dark text-white shadow-sm'
                : 'text-gray-600 hover:text-black bg-white border border-gray-200'
            }`}
          >
            Cancelled ({cancelledRides.length})
          </button>
        </div>

        {/* 1. COMPLETED RIDES */}
        {activeTab === 'completed' && (
          <div className="space-y-4 animate-in fade-in">
            {completedRides.map((ride) => (
              <div
                key={ride.id}
                className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                      {ride.id}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">{ride.date}</span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {ride.vehicle}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="font-medium text-gray-900">{ride.pickup}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                      <span className="font-medium text-gray-900">{ride.dropoff}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-500">
                    Captain: <strong className="text-gray-800">{ride.captain}</strong> • Paid via {ride.paymentMethod}
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between md:flex-col md:items-end w-full md:w-auto gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 shrink-0">
                  <div className="text-left md:text-right">
                    <div className="text-lg font-black text-gray-900">₹{ride.fare}</div>
                    <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {ride.rating}.0 Rated
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedReceipt(ride)}
                    className="px-3.5 py-1.5 bg-yellow-50 hover:bg-brand-yellow text-brand-dark font-bold text-xs rounded-xl border border-brand-yellow/60 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Digital Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. SCHEDULED RIDES */}
        {activeTab === 'scheduled' && (
          <div className="space-y-4 animate-in fade-in">
            {scheduledRides.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-gray-200">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 text-base">No Scheduled Rides Pending</h3>
                <p className="text-xs text-gray-500 mt-1">Book your early morning airport trips in advance.</p>
                <Link
                  to="/book?mode=schedule"
                  className="mt-4 inline-block px-5 py-2 bg-brand-yellow text-brand-dark font-bold text-xs rounded-xl shadow-sm"
                >
                  Schedule a Ride Now
                </Link>
              </div>
            ) : (
              scheduledRides.map((ride) => (
                <div
                  key={ride.id}
                  className="bg-white p-5 rounded-3xl border-2 border-brand-yellow/70 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-yellow-100 text-brand-dark px-2 py-0.5 rounded">
                        {ride.id}
                      </span>
                      <span className="text-xs font-bold text-brand-dark flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-brand-dark" /> {ride.date}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                        {ride.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="font-semibold text-gray-900">{ride.pickup}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                        <span className="font-semibold text-gray-900">{ride.dropoff}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500">
                      Vehicle: <strong>{ride.vehicle}</strong> • Guaranteed Fare: <strong>₹{ride.fare}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 self-end md:self-auto">
                    <button
                      onClick={() => handleCancelScheduled(ride.id)}
                      className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold"
                    >
                      Cancel Schedule
                    </button>
                    <button
                      onClick={() => alert('Captain assignment in progress. You will receive an SMS reminder 15 minutes before pickup.')}
                      className="px-4 py-2 bg-brand-dark text-brand-yellow font-bold text-xs rounded-xl shadow-sm"
                    >
                      View Live Tracker
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. CANCELLED RIDES */}
        {activeTab === 'cancelled' && (
          <div className="space-y-4 animate-in fade-in">
            {cancelledRides.map((ride) => (
              <div
                key={ride.id}
                className="bg-white p-5 rounded-3xl border border-gray-200 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-gray-400">{ride.id}</span>
                    <span className="text-xs text-gray-500">{ride.date}</span>
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                      CANCELLED
                    </span>
                  </div>
                  <div className="text-xs text-gray-700 mt-1">
                    {ride.pickup} → {ride.dropoff} ({ride.vehicle})
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Reason: {ride.reason}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-gray-700">Fee: ₹0</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">Waived Off</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DIGITAL RECEIPT INVOICE MODAL POPUP */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-brand-dark" />
                  <h3 className="font-black text-base text-gray-900">Tax Invoice Receipt</h3>
                </div>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1 text-gray-400 hover:text-black rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Invoice Meta */}
              <div className="bg-gray-50 p-3 rounded-2xl text-xs space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>Invoice ID:</span>
                  <span className="font-mono font-bold text-gray-900">{selectedReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trip Date:</span>
                  <span className="font-semibold text-gray-900">{selectedReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ride Category:</span>
                  <span className="font-semibold text-gray-900">{selectedReceipt.vehicle}</span>
                </div>
              </div>

              {/* Route */}
              <div className="space-y-1.5 text-xs text-gray-700 border-b border-gray-100 pb-3">
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                  <div><strong>Pickup:</strong> {selectedReceipt.pickup}</div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0"></span>
                  <div><strong>Destination:</strong> {selectedReceipt.dropoff}</div>
                </div>
              </div>

              {/* Itemized Charges */}
              <div className="space-y-1.5 text-xs text-gray-700 border-b border-gray-100 pb-3">
                <div className="flex justify-between">
                  <span>Base Fare</span>
                  <span>₹{selectedReceipt.baseFare}</span>
                </div>
                <div className="flex justify-between">
                  <span>Distance & Time Rate</span>
                  <span>₹{selectedReceipt.distanceFare}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Applicable Taxes (5%)</span>
                  <span>₹{selectedReceipt.tax}</span>
                </div>
                {selectedReceipt.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Promo Coupon Discount</span>
                    <span>-₹{selectedReceipt.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-gray-900 pt-1 border-t border-gray-100">
                  <span>Total Amount Paid</span>
                  <span className="text-emerald-700">₹{selectedReceipt.fare}</span>
                </div>
                <div className="text-[10px] text-gray-400">Payment Mode: {selectedReceipt.paymentMethod}</div>
              </div>

              {/* Driver & Compliments */}
              <div className="text-xs text-gray-600">
                <div>Captain: <strong>{selectedReceipt.captain}</strong></div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="font-semibold">Rating:</span>
                  <span className="flex text-amber-400">★★★★★</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => alert('Downloading official PDF Tax Invoice...')}
                  className="w-full py-2.5 bg-brand-dark hover:bg-black text-brand-yellow font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Tax Invoice (PDF)
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
