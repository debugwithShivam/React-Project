import React, { useState } from 'react';
import { Star, Wallet } from 'lucide-react';
import { Initials, Screen, Tone } from '../adminUi';

const captains = [
  { name: 'Ramesh Kumar', city: 'Bengaluru', vehicle: 'Honda Activa 6G', rating: 4.9, rides: 18, earn: '₹2,140', status: 'Online', since: '8:12 AM' },
  { name: 'Deepak Rao', city: 'Bengaluru', vehicle: 'Bajaj Auto', rating: 4.8, rides: 11, earn: '₹1,860', status: 'Online', since: '7:40 AM' },
  { name: 'Arjun Das', city: 'Hyderabad', vehicle: 'WagonR', rating: 4.6, rides: 0, earn: '₹0', status: 'Offline', since: 'Yesterday' },
  { name: 'Sanjay Patil', city: 'Pune', vehicle: 'TVS Jupiter', rating: 4.7, rides: 9, earn: '₹980', status: 'Online', since: '9:02 AM' },
  { name: 'Imran Khan', city: 'Chennai', vehicle: 'Swift Dzire', rating: 4.5, rides: 4, earn: '₹1,220', status: 'Paused', since: 'Break' },
  { name: 'Vikram Singh', city: 'Bengaluru', vehicle: 'Access 125', rating: 4.8, rides: 14, earn: '₹1,540', status: 'Online', since: '6:55 AM' }
];

export default function Captains() {
  const [filter, setFilter] = useState('All');
  const rows = captains.filter((item) => filter === 'All' || item.status === filter);

  return (
    <Screen className="bg-amber-50/60">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Partner network</p>
          <h1 className="text-3xl font-black text-zinc-900">Captains on the road</h1>
          <p className="mt-1 text-sm text-zinc-500">Availability, ratings and today’s earnings by partner.</p>
        </div>
        <div className="flex gap-2">
          {['All', 'Online', 'Offline', 'Paused'].map((item) => (
            <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter === item ? 'bg-brand-dark text-brand-yellow' : 'bg-white text-zinc-600'}`}>{item}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((captain) => (
          <article key={captain.name} className="rounded-3xl border border-amber-100 bg-white p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <Initials name={captain.name} className="bg-brand-yellow text-brand-dark" />
                <div>
                  <p className="font-black text-zinc-900">{captain.name}</p>
                  <p className="text-xs font-semibold text-zinc-500">{captain.city} · {captain.vehicle}</p>
                </div>
              </div>
              <Tone value={captain.status} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-amber-50 p-3 text-center">
              <div>
                <p className="flex items-center justify-center gap-1 text-lg font-black"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{captain.rating}</p>
                <p className="text-[10px] font-bold uppercase text-zinc-500">Rating</p>
              </div>
              <div>
                <p className="text-lg font-black">{captain.rides}</p>
                <p className="text-[10px] font-bold uppercase text-zinc-500">Rides</p>
              </div>
              <div>
                <p className="flex items-center justify-center gap-1 text-lg font-black"><Wallet className="h-3.5 w-3.5" />{captain.earn}</p>
                <p className="text-[10px] font-bold uppercase text-zinc-500">Today</p>
              </div>
            </div>
            <p className="mt-3 text-xs font-semibold text-zinc-400">Duty since {captain.since}</p>
          </article>
        ))}
      </div>
    </Screen>
  );
}
