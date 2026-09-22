import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Bike, Car, Truck } from 'lucide-react';
import { Screen, Tone } from '../adminUi';
import api from '../../../api/client';

const iconMap = { Bike, Auto: Truck, Cab: Car };

export default function Drivers() {
  const [type, setType] = useState('All');
  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['admin-drivers'],
    queryFn: async () => (await api.get('/admin/drivers')).data.drivers,
  });
  const rows = drivers.map((driver) => ({
    id: `DRV-${driver.id}`,
    name: driver.name,
    type: driver.vehicle_type === 'bike' ? 'Bike' : driver.vehicle_type === 'auto' ? 'Auto' : 'Cab',
    plate: driver.vehicle_plate,
    model: driver.vehicle_model,
    insurance: driver.status,
    rc: 'Valid',
    status: driver.status,
  })).filter((item) => type === 'All' || item.type === type);

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
        {isLoading && <p className="p-6 text-sm text-zinc-500">Loading drivers…</p>}
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
