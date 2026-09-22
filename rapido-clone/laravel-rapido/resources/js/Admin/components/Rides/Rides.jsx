import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation, Phone, ShieldAlert } from 'lucide-react';
import { Initials, Screen, Tone } from '../adminUi';
import api from '../../../api/client';

const liveRides = [
  { id: 'SW-10428', customer: 'Aarav Mehta', captain: 'Ramesh Kumar', vehicle: 'KA-03-AB-2211', from: 'Indiranagar', to: 'Koramangala', progress: 62, status: 'Ongoing', step: 3, fare: '₹84' },
  { id: 'SW-10424', customer: 'Nikhil Jain', captain: 'Deepak Rao', vehicle: 'KA-05-CD-8821', from: 'Jayanagar', to: 'Lalbagh', progress: 28, status: 'Ongoing', step: 2, fare: '₹78' },
  { id: 'SW-10421', customer: 'Sana Iqbal', captain: '-', vehicle: '-', from: 'HSR', to: 'Bellandur', progress: 8, status: 'Pending', step: 1, fare: '₹112' }
];

const steps = ['Requested', 'Assigned', 'Pickup', 'On trip', 'Drop'];

export default function Rides() {
  const { data: apiRides = [] } = useQuery({
    queryKey: ['admin-rides'],
    queryFn: async () => (await api.get('/admin/rides')).data.rides,
  });
  const rideRows = apiRides.length ? apiRides.map((ride) => ({
    id: `SW-${ride.id}`,
    customer: ride.rider_name || 'Rider',
    captain: ride.driver_name || '-',
    vehicle: ride.vehicle_type || '-',
    from: ride.pickup_address,
    to: ride.dropoff_address,
    progress: ride.status === 'COMPLETED' ? 100 : ride.status === 'STARTED' ? 70 : 25,
    status: ride.status,
    step: ride.status === 'COMPLETED' ? 5 : 2,
    fare: `₹${ride.final_fare || ride.estimated_fare || 0}`,
  })) : liveRides;
  const [active, setActive] = useState(rideRows[0]);

  return (
    <Screen className="bg-zinc-950 text-white">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-yellow">Live operations</p>
          <h1 className="text-3xl font-black">Ride control room</h1>
        </div>
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">{liveRides.filter((ride) => ride.status === 'Ongoing').length} trips in motion</span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-3">
          {rideRows.map((ride) => (
            <button key={ride.id} type="button" onClick={() => setActive(ride)} className={`w-full rounded-2xl border p-4 text-left ${active.id === ride.id ? 'border-brand-yellow bg-white/10' : 'border-white/10 bg-white/5'}`}>
              <div className="flex items-center justify-between">
                <p className="font-black">{ride.id}</p>
                <Tone value={ride.status} />
              </div>
              <p className="mt-2 text-sm text-zinc-300">{ride.from} → {ride.to}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-brand-yellow" style={{ width: `${ride.progress}%` }} />
              </div>
            </button>
          ))}
        </aside>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Initials name={active.customer} />
              <div>
                <p className="text-xl font-black">{active.customer}</p>
                <p className="text-sm text-zinc-400">Captain {active.captain} · {active.vehicle}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold"><Phone className="mr-1 inline h-3 w-3" /> Call</button>
              <button type="button" className="rounded-xl bg-rose-500/20 px-3 py-2 text-xs font-bold text-rose-200"><ShieldAlert className="mr-1 inline h-3 w-3" /> SOS</button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-5">
            {steps.map((step, index) => (
              <div key={step} className={`rounded-2xl px-3 py-3 text-center text-xs font-black ${index < active.step ? 'bg-brand-yellow text-zinc-900' : 'bg-white/5 text-zinc-400'}`}>
                {step}
              </div>
            ))}
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-dashed border-white/20 bg-[linear-gradient(180deg,rgba(249,201,51,0.08),transparent)] p-6">
            <p className="flex items-center gap-2 text-sm font-bold text-brand-yellow"><Navigation className="h-4 w-4" /> Live route</p>
            <p className="mt-3 text-2xl font-black">{active.from} → {active.to}</p>
            <p className="mt-2 text-sm text-zinc-400">Fare {active.fare} · trip progress {active.progress}%</p>
            <div className="mt-6 h-40 rounded-2xl bg-[radial-gradient(circle_at_30%_40%,#F9C93333,transparent_35%),radial-gradient(circle_at_70%_60%,#22c55e33,transparent_32%)]">
              <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">City map overlay</div>
            </div>
          </div>
        </section>
      </div>
    </Screen>
  );
}
