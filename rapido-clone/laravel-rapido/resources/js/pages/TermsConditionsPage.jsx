import React from 'react';
import { FileText, CheckCircle2, AlertCircle, RefreshCw, DollarSign } from 'lucide-react';

export default function TermsConditionsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-brand-dark text-xs font-black uppercase">
            <FileText className="w-3.5 h-3.5" /> User Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Terms & Conditions of Service
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Applicable to all Commuters, Captain Partners, and Platform Visitors
          </p>
        </div>

        {/* Terms Content */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-8 text-sm text-gray-700 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 1. Platform Intermediary Role
            </h2>
            <p>
              Sawaari provides a digital micro-mobility and ridesharing aggregation technology platform connecting independent vehicle owners ("Captains") with passengers seeking urban transit ("Commuters").
            </p>
          </section>

          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-brand-dark" /> 2. Fares, Tolls & Payment Settlements
            </h2>
            <p>
              Fares are dynamically calculated based on base distance, total trip duration, and vehicle category.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
              <li>Municipal parking fees and highway toll charges incurred during a trip are added to the final invoice.</li>
              <li>Customers agree to pay the complete fare upon trip completion via cash, UPI, or in-app wallet.</li>
              <li>Captains receive daily payouts to their designated bank accounts after deduction of standard platform fee.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-600" /> 3. Ride Cancellation Policy
            </h2>
            <p>
              Passengers may cancel a ride without fee within 3 minutes of booking. If cancellation occurs after a captain has traveled towards the pickup point or exceeded 5 minutes of waiting time, a nominal cancellation charge may apply. Zero cancellation fees apply if the captain is delayed beyond estimated pickup time.
            </p>
          </section>

          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" /> 4. Safety & Helmet Compliance
            </h2>
            <p>
              Passengers riding on two-wheeler bike taxis MUST wear the provided ISI-standard safety helmet throughout the duration of the trip. Failure to comply allows the captain to safely abort the trip.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
