import React, { useMemo, useState } from 'react';
import { Bike, Calculator } from 'lucide-react';
import { Screen, Tone } from '../adminUi';

const services = [
  { name: 'Sawaari Bike', base: 25, km: 7, wait: 1, eta: '2 min', color: 'from-yellow-300 to-amber-400' },
  { name: 'Sawaari Auto', base: 40, km: 11, wait: 1.5, eta: '4 min', color: 'from-emerald-300 to-emerald-500' },
  { name: 'Cab Economy', base: 70, km: 14, wait: 2, eta: '6 min', color: 'from-sky-300 to-blue-500' },
  { name: 'Comfort Sedan', base: 110, km: 18, wait: 2.5, eta: '8 min', color: 'from-violet-300 to-violet-500' }
];

export default function Pricing() {
  const [km, setKm] = useState(8);
  const [service, setService] = useState(services[0]);
  const estimate = useMemo(() => service.base + km * service.km, [km, service]);

  return (
    <Screen className="bg-orange-50">
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">Fare engine</p>
        <h1 className="text-3xl font-black text-zinc-900">Pricing & fare rules</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {services.map((item) => (
          <button key={item.name} type="button" onClick={() => setService(item)} className={`rounded-3xl bg-gradient-to-br p-5 text-left text-zinc-900 shadow-card ${item.color} ${service.name === item.name ? 'ring-4 ring-zinc-900/20' : ''}`}>
            <p className="text-sm font-bold opacity-80">{item.eta} pickup</p>
            <p className="mt-2 text-xl font-black">{item.name}</p>
            <p className="mt-4 text-3xl font-black">₹{item.base}</p>
            <p className="text-sm font-semibold">+ ₹{item.km}/km · wait ₹{item.wait}/min</p>
          </button>
        ))}
      </div>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-black"><Calculator className="h-4 w-4" /> Sample fare calculator</h2>
          <p className="mt-2 text-sm text-zinc-500">Estimate for {service.name} over {km} km, no surge.</p>
          <input type="range" min="1" max="30" value={km} onChange={(event) => setKm(Number(event.target.value))} className="mt-6 w-full accent-amber-500" />
          <p className="mt-4 text-4xl font-black text-zinc-900">₹{estimate}</p>
        </div>
        <div className="rounded-3xl bg-zinc-900 p-6 text-white">
          <Bike className="h-6 w-6 text-brand-yellow" />
          <p className="mt-4 text-sm font-bold text-zinc-400">Peak multiplier</p>
          <p className="text-3xl font-black">1.4x</p>
          <p className="mt-2 text-xs text-zinc-400">Rain + office rush in Bengaluru</p>
          <Tone value="Active" />
        </div>
      </section>
    </Screen>
  );
}
