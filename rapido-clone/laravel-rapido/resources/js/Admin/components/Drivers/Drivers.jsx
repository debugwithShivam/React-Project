import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Bike, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Initials, Screen, Tone } from '../adminUi';
import api from '../../../api/axios';

export default function Drivers() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['admin-drivers', status, search],
    queryFn: async () =>
      (await api.get('/admin/drivers', { params: { status: status || undefined, search: search || undefined } })).data.drivers,
  });

  const counts = drivers.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <Screen className="bg-emerald-50/60">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Fleet</p>
        <h1 className="text-3xl font-black text-zinc-900">Drivers</h1>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3 md:grid-cols-4">
        {[
          { label: 'Pending', value: counts.PENDING || 0, icon: Clock, color: 'text-amber-600' },
          { label: 'Approved', value: counts.APPROVED || 0, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Rejected', value: counts.REJECTED || 0, icon: XCircle, color: 'text-rose-600' },
          { label: 'Total', value: drivers.length, icon: Bike, color: 'text-zinc-700' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
              <Icon className={`h-5 w-5 ${s.color}`} />
              <p className="mt-2 text-2xl font-black">{s.value}</p>
              <p className="text-xs font-semibold text-zinc-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
          <button
            key={s || 'ALL'}
            onClick={() => setStatus(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold ${status === s ? 'bg-emerald-700 text-white' : 'bg-white text-zinc-600 border border-emerald-100'}`}
          >
            {s || 'All'}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="rounded-xl border border-emerald-200 bg-white py-2 pl-9 pr-4 text-sm outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-emerald-50 text-xs font-black uppercase text-emerald-900">
            <tr>
              <th className="px-4 py-3 text-left">Driver</th>
              <th className="px-4 py-3 text-left">Vehicle</th>
              <th className="px-4 py-3 text-left">City</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Online</th>
              <th className="px-4 py-3 text-right">Rides / Earnings</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-400">Loading…</td></tr>}
            {!isLoading && drivers.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-400">No drivers found.</td></tr>}
            {drivers.map((d) => (
              <tr key={d.id} className="border-t border-emerald-50 hover:bg-emerald-50/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Initials name={d.name} className="bg-emerald-700 text-white" />
                    <div>
                      <p className="font-black">{d.name}</p>
                      <p className="text-xs text-zinc-500">{d.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-bold">{d.vehicle_plate}</p>
                  <p className="text-xs text-zinc-500">{d.vehicle_type} · {d.vehicle_model}</p>
                </td>
                <td className="px-4 py-3">{d.city}</td>
                <td className="px-4 py-3"><Tone value={d.status === 'APPROVED' ? 'Approved' : d.status === 'PENDING' ? 'Pending' : 'Rejected'} /></td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${d.is_online ? 'text-emerald-600' : 'text-zinc-400'}`}>
                    <span className={`h-2 w-2 rounded-full ${d.is_online ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                    {d.is_online ? 'Online' : 'Offline'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="font-black">{d.total_rides || 0}</p>
                  <p className="text-xs text-zinc-500">₹{Number(d.total_earnings || 0).toFixed(0)}</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/Admin/DriverDocuments`} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800">
                    Review KYC
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Screen>
  );
}
