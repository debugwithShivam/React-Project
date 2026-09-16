import React, { useState, useEffect } from 'react';
import { ShieldCheck, Phone, Star, X, CheckCircle, Navigation, AlertTriangle, Bike, Car, Download, ThumbsUp, Calendar, Clock, Receipt } from 'lucide-react';

export default function RideStatusModal({ isOpen, onClose, rideDetails }) {
  // 'searching' | 'matched' | 'completed'
  const [step, setStep] = useState('searching');
  const [otp] = useState(Math.floor(1000 + Math.random() * 9000));
  
  // Rating states
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['Polite Captain', 'Clean Helmet']);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const complimentTags = ['Polite Captain', 'Clean Helmet', 'Safe Driver', 'On-time Pickup', 'Smooth Route'];

  useEffect(() => {
    if (isOpen) {
      setStep('searching');
      setReviewSubmitted(false);
      const timer = setTimeout(() => {
        setStep('matched');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handlePrintReceipt = () => {
    alert('Printing/Downloading Sawaari Official Digital Tax Invoice (PDF)...');
  };

  const handleFinishReview = () => {
    setReviewSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const isScheduled = rideDetails?.bookingMode === 'schedule';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 transition-all max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-brand-dark text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-brand-dark font-bold text-sm">
              S
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {isScheduled
                  ? 'Ride Scheduled Successfully!'
                  : step === 'searching'
                  ? 'Finding Nearest Captain...'
                  : step === 'matched'
                  ? 'Captain En Route!'
                  : 'Trip Completed'}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400">
                {isScheduled
                  ? `Confirmed for ${rideDetails?.scheduleDate} at ${rideDetails?.scheduleTime}`
                  : step === 'searching'
                  ? 'Checking 14 captains around your location'
                  : step === 'matched'
                  ? 'Arriving in approx 2 minutes'
                  : 'Thank you for riding with Sawaari'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* SCHEDULED RIDE VIEW */}
          {isScheduled ? (
            <div className="space-y-4 text-center py-2 animate-in fade-in">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-brand-dark">
                <Calendar className="w-8 h-8 text-brand-dark" />
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900">Your Ride is Locked In!</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  A top-rated captain will be dispatched to your pickup spot 15 minutes before departure.
                </p>
              </div>

              <div className="bg-yellow-50/80 border border-brand-yellow/60 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-yellow-200/60 pb-2">
                  <span className="text-gray-500">Scheduled Date:</span>
                  <span className="font-bold text-gray-900">{rideDetails?.scheduleDate}</span>
                </div>
                <div className="flex justify-between border-b border-yellow-200/60 pb-2">
                  <span className="text-gray-500">Pickup Time:</span>
                  <span className="font-bold text-gray-900">{rideDetails?.scheduleTime}</span>
                </div>
                <div className="flex justify-between border-b border-yellow-200/60 pb-2">
                  <span className="text-gray-500">Vehicle Type:</span>
                  <span className="font-bold text-gray-900">{rideDetails?.vehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Guaranteed Max Fare:</span>
                  <span className="font-black text-emerald-700">₹{rideDetails?.fare}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark font-black rounded-xl text-xs shadow-md"
              >
                Done & View Active Bookings
              </button>
            </div>
          ) : step === 'searching' ? (
            /* STAGE 1: SEARCHING */
            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center space-y-4">
              <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">
                <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-brand-yellow/20 animate-ping"></div>
                <div className="absolute w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-brand-yellow/40 animate-pulse"></div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-yellow rounded-full flex items-center justify-center shadow-lg text-brand-dark">
                  <Bike className="w-6 h-6 sm:w-8 sm:h-8 animate-bounce" />
                </div>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-extrabold text-gray-900">Contacting Nearest Captains</h4>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xs">
                  We are finding the fastest rated captain near your pickup point for guaranteed zero cancellation.
                </p>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden max-w-xs">
                <div className="bg-brand-yellow h-2 rounded-full w-2/3 animate-pulse"></div>
              </div>
            </div>
          ) : step === 'matched' ? (
            /* STAGE 2: MATCHED & ON-THE-WAY */
            <div className="space-y-4 animate-in fade-in zoom-in-95">
              
              {/* OTP Banner */}
              <div className="bg-yellow-50 border-2 border-brand-yellow rounded-2xl p-3 sm:p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-yellow-800">
                    Share OTP with Captain to Start Ride
                  </span>
                  <div className="text-2xl sm:text-3xl font-black tracking-widest text-gray-900 font-mono">
                    {otp}
                  </div>
                </div>
                <div className="bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-yellow-200 text-xs font-bold text-gray-700 shadow-sm shrink-0">
                  Fare: ₹{rideDetails?.fare || 65}
                </div>
              </div>

              {/* Captain Profile Card */}
              <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gray-50 rounded-2xl border border-gray-200 gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                  <img
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80"
                    alt="Captain"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-brand-yellow shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="font-extrabold text-gray-900 text-sm sm:text-base truncate">Ramesh Kumar</h5>
                    <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 mr-0.5" /> 4.92
                      </span>
                      <span className="truncate">• 2,840+ rides</span>
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold text-gray-700 mt-0.5 sm:mt-1 truncate">
                      Activa 6G • <span className="font-mono bg-white px-1 py-0.2 rounded border border-gray-300">KA 04 MX 7289</span>
                    </div>
                  </div>
                </div>

                <a
                  href="tel:+919876543210"
                  onClick={(e) => { e.preventDefault(); alert("Simulating call to Captain Ramesh (+91 98765 43210) via masked bridge."); }}
                  className="w-10 h-10 sm:w-11 sm:h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95 shrink-0"
                  title="Call Captain"
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                </a>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  onClick={() => {
                    alert('Ride cancelled without cancellation charges.');
                    onClose();
                  }}
                  className="w-1/2 py-2.5 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel Ride
                </button>
                <button
                  onClick={() => setStep('completed')}
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                >
                  <span>Simulate Finish Trip</span>
                </button>
              </div>

            </div>
          ) : (
            /* STAGE 3: COMPLETED TRIP WITH DIGITAL RECEIPT & RATINGS */
            <div className="space-y-4 animate-in fade-in">
              
              {/* Receipt Header Card */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-brand-dark" />
                    <span className="font-black text-xs text-gray-900">Digital Tax Invoice Receipt</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">TRIP-#SW-9821</span>
                </div>

                {/* Itemized charges */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Base Ride Fare</span>
                    <span>₹{Math.round((rideDetails?.fare || 65) * 0.75)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Distance & Time Charge (6.4 km)</span>
                    <span>₹{Math.round((rideDetails?.fare || 65) * 0.25)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes & GST (5%)</span>
                    <span>₹3.25</span>
                  </div>
                  <div className="flex justify-between font-black text-gray-900 border-t border-gray-200 pt-1.5 text-sm">
                    <span>Total Paid ({rideDetails?.paymentMethod === 'cash' ? 'Cash' : 'UPI/Online'})</span>
                    <span className="text-emerald-700">₹{rideDetails?.fare || 65}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="w-full py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-gray-500" />
                  <span>Download / Print Digital Receipt</span>
                </button>
              </div>

              {/* Ratings & Compliments Section */}
              <div className="p-4 bg-yellow-50/60 border border-brand-yellow/60 rounded-2xl space-y-3">
                <div className="text-center">
                  <h4 className="font-black text-sm text-gray-900">Rate Captain Ramesh</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Your ratings help maintain superior ride standards</p>
                </div>

                {/* Stars selector */}
                <div className="flex justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Compliment Badges */}
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  {complimentTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                          isSelected
                            ? 'bg-brand-dark text-brand-yellow border-brand-dark'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{tag}
                      </button>
                    );
                  })}
                </div>

                {reviewSubmitted ? (
                  <div className="text-center py-2 text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Review Submitted! Thank you.</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishReview}
                    className="w-full py-2.5 bg-brand-dark hover:bg-black text-brand-yellow font-black rounded-xl text-xs shadow-md transition-all active:scale-95"
                  >
                    Submit Rating & Close
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
