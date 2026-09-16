import React, { useState } from 'react';
import { MapPinned, Pause, Play } from 'lucide-react';
import { Screen, Tone } from '../adminUi';

const cities = [
  { name: 'Bengaluru', zones: ['Indiranagar', 'HSR', 'Whitefield', 'Koramangala', 'Jayanagar'], captains: 428, coverage: 94, status: 'Live' },
  { name: 'Hyderabad', zones: ['Hitech City', 'Banjara Hills', 'Gachibowli'], captains: 264, coverage: 81, status: 'Live' },
  { name: 'Pune', zones: ['Hinjewadi', 'Kothrud', 'Viman Nagar'], captains: 118, coverage: 62, status: 'Pending' },
  { name: 'Chennai', zones: ['OMR', 'T Nagar', 'Anna Nagar'], captains: 96, coverage: 48, status: 'Paused' }
];

export default function CitiesZones() {
  const [active, setActive] = useState(cities[0]);

  return (
    <Screen className="bg-emerald-50/70">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Service map</p>
        <h1 className="text-3xl font-black text-zinc-900">Cities & zones</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cities.map((city) => (
          <button key={city.name} type="button" onClick={() => setActive(city)} className={`rounded-3xl border p-4 text-left shadow-sm ${active.name === city.name ? 'border-emerald-500 bg-white ring-2 ring-emerald-100' : 'border-emerald-100 bg-white'}`}>
            <div className="flex items-center justify-between">
              <p className="font-black">{city.name}</p>
              <Tone value={city.status} />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-3xl font-black text-emerald-700">{city.coverage}%</p>
                <p className="text-xs font-semibold text-zinc-500">zone coverage</p>
              </div>
              <p className="text-xs font-bold text-zinc-400">{city.captains} captains</p>
            </div>
          </button>
        ))}
      </div>

      <section className="mt-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-black"><MapPinned className="h-5 w-5 text-emerald-600" /> {active.name} operating zones</h2>
          <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white">
            {active.status === 'Paused' ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {active.status === 'Paused' ? 'Resume city' : 'Pause city'}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {active.zones.map((zone) => (
            <span key={zone} className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-900">{zone}</span>
          ))}
        </div>
      </section>
    </Screen>
  );
}
