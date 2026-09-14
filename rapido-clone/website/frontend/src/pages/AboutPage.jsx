import React from 'react';
import { Bike, Target, Eye, Award, Users, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IMPACT_STATS } from '../data/mockData';

export default function AboutPage() {
  const values = [
    {
      title: 'Customer Speed & Agility',
      desc: 'Urban traffic should never stand between you and your aspirations. We optimize every millisecond of pickup time.',
      icon: '⚡'
    },
    {
      title: 'Captain First Culture',
      desc: 'We consider our drivers our captains and business partners. We ensure dignity, fair commissions, and transparent payouts.',
      icon: '🤝'
    },
    {
      title: 'Uncompromised Safety',
      desc: 'From two-wheeler helmets to real-time telemetry and 24x7 emergency response centers, safety is deeply woven into our DNA.',
      icon: '🛡️'
    },
    {
      title: 'Bharat First Innovation',
      desc: 'Built specifically for Indian road conditions, tier-2/3 transit hubs, and price-conscious daily commuters.',
      icon: '🇮🇳'
    }
  ];

  const milestones = [
    { year: '2015', title: 'The Genesis', desc: 'Started with a simple vision: two friends solving the Bangalore traffic deadlock using bike taxis.' },
    { year: '2018', title: '1 Million Rides', desc: 'Expanded to 16 major Indian metropolitan cities and onboarded over 50,000 captains.' },
    { year: '2021', title: 'Auto & Parcel Rollout', desc: 'Launched contactless metered Auto rides and hyper-local parcel delivery across 75+ cities.' },
    { year: '2024+', title: '100M+ Milestone', desc: 'Now Bharat’s leading micro-mobility network with cabs, autos, bikes, and green EV fleets.' }
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. Hero Banner */}
      <section className="bg-gradient-to-b from-yellow-100/60 via-yellow-50/20 to-white py-16 sm:py-24 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow text-brand-dark text-xs font-black uppercase tracking-wider">
            Our Journey & Vision
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight">
            Making daily urban mobility <br />
            <span className="underline decoration-brand-yellow decoration-8 underline-offset-4">
              faster, affordable & accessible.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Sawaari was born with a mission to bring order to chaotic city roads. Today, we empower millions of daily riders to commute without stress and enable over 1.5 million captains to earn an honorable living.
          </p>
        </div>
      </section>

      {/* 2. Mission & Vision Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-yellow text-brand-dark flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Our Mission</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              To democratize urban transit by giving every commuter a rapid, reliable, and affordable travel alternative while building micro-entrepreneurship opportunities for millions of vehicle owners across every tier of Bharat.
            </p>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-dark text-brand-yellow flex items-center justify-center font-bold">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Our Vision</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              A country where no commuter spends hours stranded at bus stops or stuck in bumper-to-bumper car lines; creating seamless last-mile connectivity from metro stops to doorstep.
            </p>
          </div>

        </div>
      </section>

      {/* 3. Key Numbers Impact */}
      <section className="bg-brand-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-yellow uppercase tracking-widest">
              Scale of Bharat
            </span>
            <h2 className="text-3xl font-black text-white mt-2">
              Transforming Transit at Massive Scale
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {IMPACT_STATS.map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-gray-900 border border-gray-800">
                <div className="text-4xl font-black text-brand-yellow font-mono">{stat.value}</div>
                <div className="text-sm font-bold text-white mt-2">{stat.label}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-brand-yellow bg-brand-dark px-3 py-1 rounded-full">
            What Guides Us
          </span>
          <h2 className="text-3xl font-black text-gray-900 mt-3">Our Core Pillars</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="text-3xl">{val.icon}</div>
              <h4 className="text-base font-black text-gray-900">{val.title}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Company Milestones Timeline */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900">How We Got Here</h2>
          <p className="text-sm text-gray-500 mt-1">A decade of engineering and ground execution.</p>
        </div>

        <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 md:before:left-1/2 before:w-0.5 before:bg-gray-200">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col md:flex-row items-start gap-6 ${
                idx % 2 === 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="hidden md:block md:w-1/2"></div>
              
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-yellow border-4 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-brand-dark z-10">
                •
              </div>

              <div className=" md:pl-0 md:w-1/2  bg-white p-5 rounded-2xl border border-gray-800  shadow-sm">
                <span className="ml-2.5 text-xs font-black text-brand-dark bg-yellow-100 px-2 py-0.5 rounded">
                  {m.year}
                </span>
                <h4 className="ml-2.5 text-base font-bold text-gray-900 mt-1.5">{m.title}</h4>
                <p className="ml-2.5 text-xs text-gray-600 mt-1">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Bottom CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-yellow-50 rounded-3xl p-8 sm:p-12 border-2 border-brand-yellow text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
            Ready to experience a faster daily commute?
          </h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Try your first ride today and say goodbye to stressful peak traffic jams.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/book"
              className="px-6 py-3 bg-brand-dark text-brand-yellow font-black rounded-xl text-sm shadow-md hover:scale-105 transition-all"
            >
              Book a Ride Now
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
