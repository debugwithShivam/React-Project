import React, { useState } from 'react';
import { Shield, ShieldAlert,ShieldCheck, PhoneCall, Lock, Heart, CheckCircle2, AlertOctagon, Share2, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SafetyPage() {
  const [sosTriggered, setSosTriggered] = useState(false);

  const safetySteps = [
    {
      stage: '1. Before the Ride',
      title: 'Vetted Captains & Vehicles',
      desc: '100% of captains undergo strict police verification, driving license authentication, and vehicle fitness inspections before taking their first ride.',
      points: ['Multi-step background KYC checks', 'Vehicle fitness & roadworthiness check', 'Mandatory captain safety training module']
    },
    {
      stage: '2. During the Ride',
      title: 'Live 24x7 Digital Guardian',
      desc: 'Every ride is tracked with real-time GPS telemetry. Any unexpected route deviation or prolonged standstill alerts our emergency response squad.',
      points: ['Share live location with friends/family via WhatsApp', 'Dual-masked phone calls to protect privacy', 'Dedicated in-ride SOS button with 90-sec response']
    },
    {
      stage: '3. After the Ride',
      title: 'Feedback & Accountability',
      desc: 'Our 2-way rating system ensures both riders and captains treat each other with respect. Unsafe behavior results in immediate platform offboarding.',
      points: ['24/7 dedicated grievance resolution desk', 'Mandatory helmet & hygiene compliance rating', 'Complimentary ₹5 Lakh trip insurance coverage']
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. Safety Hero */}
      <section className="bg-brand-dark text-white py-16 sm:py-24 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-brand-yellow/30 text-brand-yellow text-xs font-black uppercase tracking-wider">
            <Shield className="w-4 h-4" /> 360° Safety Shield
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Your safety is our <br />
            <span className="text-brand-yellow">#1 non-negotiable priority.</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            From the moment you request a ride until you reach your doorstep safely, our advanced technology and round-the-clock safety teams have you covered.
          </p>

          {/* Interactive SOS Test Simulator */}
          <div className="pt-4 max-w-md mx-auto">
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center justify-between gap-4">
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Try the Emergency SOS Simulator</span>
                <span className="text-[11px] text-gray-400">See how fast assistance is dispatched</span>
              </div>
              <button
                onClick={() => {
                  setSosTriggered(true);
                  setTimeout(() => setSosTriggered(false), 4000);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform shrink-0"
              >
                <AlertOctagon className="w-4 h-4" /> Test SOS
              </button>
            </div>
            {sosTriggered && (
              <div className="mt-3 bg-red-500/20 border border-red-500 text-red-300 text-xs p-3 rounded-xl animate-in fade-in flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>Simulation Active: Dispatching central safety control & police coordination!</span>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 2. Three Pillars of Safety */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-brand-yellow bg-brand-dark px-3 py-1 rounded-full">
            Our Protocol
          </span>
          <h2 className="text-3xl font-black text-gray-900 mt-3">Safety at Every Step of the Way</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {safetySteps.map((step, idx) => (
            <div key={idx} className="bg-white p-7 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-amber-600 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md">
                  {step.stage}
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-3">{step.title}</h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">{step.desc}</p>
                
                <div className="mt-6 space-y-2 border-t border-gray-100 pt-4">
                  {step.points.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-semibold text-gray-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Women Commuters Safety Focus */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-brand-dark text-white rounded-3xl p-8 sm:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="bg-purple-500/20 text-purple-300 text-xs font-bold uppercase px-3 py-1 rounded-full border border-purple-400/30">
              Women's Safety First
            </span>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              Late night or early morning, travel with absolute peace of mind.
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              We provide an exclusive night ride telemetry monitor, live emergency contacts sharing, and guaranteed verified captains for female commuters across India.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="font-bold text-white">Number Masking</div>
                <div className="text-[11px] text-gray-300 mt-0.5">Your phone number is never visible to drivers.</div>
              </div>
              <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="font-bold text-white">Live Tracking Link</div>
                <div className="text-[11px] text-gray-300 mt-0.5">1-click WhatsApp share with family.</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-4 text-center">
            <ShieldAlert className="w-16 h-16 text-brand-yellow mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-white">24x7 Safety Response Center</h3>
            <p className="text-xs text-gray-300 max-w-sm mx-auto">
              Our Bangalore Central Emergency Operations room monitors over 100,000 live rides concurrently with direct hotlines to local police departments.
            </p>
            <div className="inline-block bg-brand-yellow text-brand-dark font-black text-xs px-4 py-2 rounded-xl">
              Average Response Time: 45 Seconds
            </div>
          </div>
        </div>
      </section>

      {/* 4. Insurance & Helmet Compliance */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-emerald-50/70 border border-emerald-200 p-8 rounded-3xl flex items-start gap-4">
            <Heart className="w-8 h-8 text-emerald-600 shrink-0 mt-1" />
            <div>
              <h4 className="text-lg font-black text-gray-900">₹5,00,000 Free Ride Insurance</h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Every single ride booked on Sawaari is automatically backed by our comprehensive insurance policy covering medical emergencies and accidental liabilities for both passenger and captain.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50/70 border border-yellow-200 p-8 rounded-3xl flex items-start gap-4">
            <ShieldCheck className="w-8 h-8 text-brand-dark shrink-0 mt-1" />
            <div>
              <h4 className="text-lg font-black text-gray-900">Mandatory ISI-Certified Helmets</h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Every bike taxi captain carries an extra sanitized, ISI-marked helmet with disposable inner caps for passengers. Riding without a helmet is strictly prohibited.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
