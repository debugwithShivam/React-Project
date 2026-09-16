import React, { useMemo, useState } from 'react';
import { Bike, Car, Clock, MapPin, Search } from 'lucide-react';
import { Screen, Tone } from '../adminUi';

const rides = [
  { id: 'SW-10428', customer: 'Aarav Mehta', from: 'Indiranagar Metro', to: 'Koramangala 5th Block', vehicle: 'Bike', fare: '₹84', eta: '8 min', status: 'Ongoing', time: '10:42 AM' },
  { id: 'SW-10427', customer: 'Pooja Verma', from: 'MG Road', to: 'HSR Layout', vehicle: 'Auto', fare: '₹142', eta: 'Done', status: 'Completed', time: '10:28 AM' },
  { id: 'SW-10426', customer: 'Rahul Sharma', from: 'Whitefield ITPL', to: 'BLR Airport', vehicle: 'Cab', fare: '₹680', eta: '12:10 PM', status: 'Scheduled', time: '11:40 AM' },
  { id: 'SW-10425', customer: 'Meera Shah', from: 'Electronic City', to: 'Silk Board', vehicle: 'Bike', fare: '₹96', eta: '-', status: 'Cancelled', time: '10:05 AM' },
  { id: 'SW-10424', customer: 'Nikhil Jain', from: 'Jayanagar 4th Block', to: 'Lalbagh', vehicle: 'Auto', fare: '₹78', eta: '4 min', status: 'Ongoing', time: '10:51 AM' }
];

const tabs = ['All', 'Ongoing', 'Completed', 'Scheduled', 'Cancelled'];

export default function AllBookRide() {
  const [tab, setTab] = useState('All');
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () => rides.filter((ride) => (tab === 'All' || ride.status === tab) && `${ride.id} ${ride.customer} ${ride.from} ${ride.to}`.toLowerCase().includes(query.toLowerCase())),
    [query, tab]
  );

  return (
    <Screen className="bg-slate-100">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Bookings ledger</p>
          <h1 className="text-3xl font-black text-slate-900">All booked rides</h1>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ride ID or rider" className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none" />
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-full px-4 py-1.5 text-sm font-bold ${tab === item ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 shadow-sm'}`}>
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((ride) => (
          <article key={ride.id} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[140px_1fr_auto] md:items-center">
            <div className="rounded-xl bg-slate-900 px-3 py-3 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ride</p>
              <p className="font-black">{ride.id}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-300"><Clock className="h-3 w-3" />{ride.time}</p>
            </div>
            <div>
              <p className="font-black text-slate-900">{ride.customer}</p>
              <div className="mt-2 flex items-start gap-3">
                <div className="flex flex-col items-center pt-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="h-8 w-px bg-slate-200" />
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-800">{ride.from}</p>
                  <p className="mt-4 font-semibold text-slate-800">{ride.to}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 md:flex-col md:items-end">
              <Tone value={ride.status} />
              <p className="flex items-center gap-1 text-sm font-bold text-slate-700">
                {ride.vehicle === 'Cab' ? <Car className="h-4 w-4" /> : ride.vehicle === 'Bike' ? <Bike className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                {ride.vehicle} · {ride.fare}
              </p>
              <p className="text-xs font-semibold text-slate-400">ETA {ride.eta}</p>
            </div>
          </article>
        ))}
      </div>
    </Screen>
  );
}
