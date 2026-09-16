import React, { useState } from 'react';
import { Copy, TicketPercent } from 'lucide-react';
import { Screen, Tone } from '../adminUi';

const coupons = [
  { name: 'Welcome offer', code: 'WELCOME', offer: '₹25 flat', used: 2481, cap: 5000, status: 'Active', audience: 'New riders' },
  { name: 'First ride', code: 'RAPIDO50', offer: '50% up to ₹50', used: 4210, cap: 10000, status: 'Active', audience: 'All cities' },
  { name: 'Monsoon rides', code: 'MONSOON26', offer: '20% up to ₹100', used: 0, cap: 2000, status: 'Draft', audience: 'Bengaluru rain' },
  { name: 'Airport drop', code: 'AIRPORT80', offer: '₹80 off cab', used: 640, cap: 1500, status: 'Active', audience: 'Cab only' }
];

export default function CouponsOffers() {
  const [copied, setCopied] = useState('');

  return (
    <Screen className="bg-rose-50">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">Growth</p>
          <h1 className="text-3xl font-black text-zinc-900">Coupons & offers</h1>
        </div>
        <button type="button" className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white">Create coupon</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {coupons.map((coupon) => {
          const pct = Math.round((coupon.used / coupon.cap) * 100);
          return (
            <article key={coupon.code} className="relative overflow-hidden rounded-3xl border border-dashed border-rose-200 bg-white p-5 shadow-sm">
              <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-rose-50" />
              <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-rose-50" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold text-rose-600"><TicketPercent className="h-4 w-4" /> {coupon.audience}</p>
                  <h2 className="mt-1 text-2xl font-black">{coupon.name}</h2>
                  <p className="text-sm font-semibold text-zinc-500">{coupon.offer}</p>
                </div>
                <Tone value={coupon.status} />
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-rose-50 px-4 py-3">
                <p className="font-mono text-lg font-black tracking-[0.2em]">{coupon.code}</p>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard?.writeText(coupon.code); setCopied(coupon.code); }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-700"
                >
                  <Copy className="h-3.5 w-3.5" /> {copied === coupon.code ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-rose-100">
                <div className="h-full bg-rose-500" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs font-semibold text-zinc-500">{coupon.used.toLocaleString()} / {coupon.cap.toLocaleString()} redeemed</p>
            </article>
          );
        })}
      </div>
    </Screen>
  );
}
