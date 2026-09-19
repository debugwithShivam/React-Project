import React from 'react';
import { IndianRupee } from 'lucide-react';
import { Screen } from '../adminUi';

const mix = [
  { name: 'Bike', gross: 14820, take: 2223, w: 28 },
  { name: 'Auto', gross: 18440, take: 2766, w: 34 },
  { name: 'Cab', gross: 20100, take: 3015, w: 38 }
];

const week = [62, 70, 58, 81, 76, 90, 84];

export default function Revenue() {
  return (
    <Screen className="bg-gradient-to-b from-zinc-900 to-zinc-800 text-white">
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-yellow">Finance</p>
        <h1 className="text-3xl font-black">Revenue</h1>
        <p className="mt-1 text-sm text-zinc-400">GMV, take-rate and captain payouts for today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-brand-yellow p-5 text-zinc-900">
          <p className="text-xs font-black uppercase">Gross bookings</p>
          <p className="mt-2 text-4xl font-black">₹8.42L</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-black uppercase text-zinc-400">Platform take</p>
          <p className="mt-2 text-4xl font-black">₹1.26L</p>
          <p className="text-xs font-semibold text-emerald-400">15% take rate</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-black uppercase text-zinc-400">Captain payouts</p>
          <p className="mt-2 text-4xl font-black">₹6.88L</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-black">This week</h2>
          <div className="mt-4 flex h-40 items-end gap-3">
            {week.map((value, index) => (
              <div key={index} className="flex-1 rounded-t-xl bg-brand-yellow" style={{ height: `${value}%` }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-bold uppercase text-zinc-500">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d}>{d}</span>)}
          </div>
        </section>
        <section className="rounded-3xl bg-white p-5 text-zinc-900">
          <h2 className="flex items-center gap-2 font-black"><IndianRupee className="h-4 w-4" /> Mix by vehicle</h2>
          {mix.map((item) => (
            <div key={item.name} className="mt-4">
              <div className="flex justify-between text-sm font-bold">
                <span>{item.name}</span>
                <span>₹{item.take.toLocaleString()} take</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full bg-zinc-900" style={{ width: `${item.w}%` }} />
              </div>
            </div>
          ))}
        </section>
      </div>
    </Screen>
  );
}
