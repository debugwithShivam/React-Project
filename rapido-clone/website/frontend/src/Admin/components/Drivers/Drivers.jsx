import React, { useState } from 'react';
import { AlertTriangle, Bike, Car, Truck } from 'lucide-react';
import { Screen, Tone } from '../adminUi';

const fleet = [
  { id: 'DRV-1021', name: 'Ramesh Kumar', type: 'Bike', plate: 'KA-03-AB-2211', model: 'Honda Activa 6G', insurance: '12 Nov 2026', rc: 'Valid', status: 'Active' },
  { id: 'DRV-1184', name: 'Deepak Rao', type: 'Auto', plate: 'KA-05-CD-8821', model: 'Bajaj RE', insurance: '02 Oct 2026', rc: 'Valid', status: 'Active' },
  { id: 'DRV-0902', name: 'Arjun Das', type: 'Cab', plate: 'TS-09-EF-4410', model: 'WagonR', insurance: '18 Sep 2026', rc: 'Expiring', status: 'Inactive' },
  { id: 'DRV-1310', name: 'Imran Khan', type: 'Cab', plate: 'TN-07-GH-2298', model: 'Swift Dzire', insurance: '04 Jan 2027', rc: 'Valid', status: 'Active' },
  { id: 'DRV-0771', name: 'Sanjay Patil', type: 'Bike', plate: 'MH-12-JK-7732', model: 'TVS Jupiter', insurance: '28 Sep 2026', rc: 'Expiring', status: 'Paused' }
];

const iconMap = { Bike, Auto: Truck, Cab: Car };

export default function Drivers() {
  const [type, setType] = useState('All');
  const rows = fleet.filter((item) => type === 'All' || item.type === type);

  return (
    <Screen className="bg-white">
      <div className="mb-6 rounded-3xl bg-zinc-900 p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-yellow">Fleet registry</p>
        <h1 className="mt-1 text-3xl font-black">Driver vehicles</h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">Track plates, RC, insurance and which vehicle class each driver is allowed to run.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['All', 'Bike', 'Auto', 'Cab'].map((item) => (
            <button key={item} type="button" onClick={() => setType(item)} className={`rounded-full px-4 py-1.5 text-xs font-bold ${type === item ? 'bg-brand-yellow text-zinc-900' : 'bg-white/10 text-white'}`}>{item}</button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200">
        {rows.map((driver, index) => {
          const Icon = iconMap[driver.type];
          return (
            <div key={driver.id} className={`grid gap-4 p-4 md:grid-cols-[1.1fr_0.8fr_0.8fr_0.6fr] md:items-center ${index % 2 ? 'bg-zinc-50' : 'bg-white'}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-100 text-amber-800"><Icon className="h-5 w-5" /></span>
                <div>
                  <p className="font-black text-zinc-900">{driver.name}</p>
                  <p className="text-xs font-semibold text-zinc-500">{driver.id} · {driver.type}</p>
                </div>
              </div>
              <div>
                <p className="font-mono text-sm font-bold">{driver.plate}</p>
                <p className="text-xs text-zinc-500">{driver.model}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Insurance {driver.insurance}</p>
                {driver.rc === 'Expiring' && <p className="mt-1 flex items-center gap-1 text-xs font-bold text-amber-700"><AlertTriangle className="h-3 w-3" /> RC expiring</p>}
              </div>
              <div className="md:text-right"><Tone value={driver.status} /></div>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}
