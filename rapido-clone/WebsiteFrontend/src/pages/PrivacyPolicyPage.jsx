import React from 'react';
import { Shield, Lock, Eye, CheckCircle2, MapPin, Database } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-brand-dark text-xs font-black uppercase">
            <Shield className="w-3.5 h-3.5" /> Data Security & Compliance
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Privacy Policy & Data Protection
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Last Updated: September 2026 • Governing laws of India & Digital Personal Data Protection (DPDP) Act
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-8 text-sm text-gray-700 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-brand-dark" /> 1. Information We Collect
            </h2>
            <p>
              When you use our Customer App, Driver App, or Website, Sawaari collects essential information required to provide rapid urban transit, ensure rider safety, and process seamless payments:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
              <li><strong>Profile Information:</strong> Full Name, verified phone number, email address, and profile photo.</li>
              <li><strong>Real-Time Geolocation:</strong> Background and foreground GPS coordinates to locate nearby captains, calculate optimal routes, and monitor ride telemetry.</li>
              <li><strong>Captain KYC Information:</strong> Driving License, Vehicle Registration Certificate (RC), Aadhaar verification, and bank/UPI account for earnings payouts.</li>
              <li><strong>Payment Transactions:</strong> Method of payment (UPI, Cash, Wallet), transaction IDs, and invoice records. (Card details are tokenized by RBI-regulated gateways).</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" /> 2. Phone Number Masking & Rider Privacy
            </h2>
            <p>
              We protect passenger and captain privacy through virtual VoIP number masking. When a captain and rider communicate via voice calls or in-app messaging, personal phone numbers are never disclosed to either party.
            </p>
          </section>

          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" /> 3. How We Use Telemetry & SOS Emergency Data
            </h2>
            <p>
              Location telemetry is continuously recorded during an active trip. In the event of an SOS trigger or route deviation, data is immediately shared with our 24x7 Emergency Response Team and local police control rooms to ensure your safety.
            </p>
          </section>

          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" /> 4. Data Retention & Deletion
            </h2>
            <p>
              You maintain full ownership of your personal data. You may request account deactivation, ride history deletion, or export of your personal information at any time by contacting <span className="font-semibold text-brand-dark">privacy@rapidoride.com</span>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
