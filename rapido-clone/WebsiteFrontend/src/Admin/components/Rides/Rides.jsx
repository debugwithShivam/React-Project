import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCw, XCircle } from 'lucide-react';
import { Screen, Tone } from '../adminUi';
import api from '../../../api/axios';

const STATUSES = ['', 'SCHEDULED', 'SEARCHING', 'ACCEPTED', 'ARRIVING', 'STARTED', 'COMPLETED', 'CANCELLED'];

const fmt = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

export default function Rides() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data: rides = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-rides', status, search],
    queryFn: async () =>
      (await api.get('/admin/rides', { params: { status: status || undefined, search: search || undefined, limit: 200 } })).data.rides,
    refetchInterval: 20000,
  });

  const cancelRide = useMutation({
    mutationFn: async (id) => {
      const reason = prompt('Cancellation reason:') || 'Cancelled by admin';
      return (await api.patch(`/admin/rides/${id}/cancel`, { reason })).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-rides'] }),
  });

  return (
    <Screen className="bg-amber-50/60">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Live ops</p>
          <h1 className="text-3xl font-black text-zinc-900">All rides</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-bold"><RefreshCw className="h-4 w-4" />Refresh</button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s || 'ALL'}
            onClick={() => setStatus(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold ${status === s ? 'bg-amber-600 text-white' : 'bg-white text-zinc-600 border border-amber-100'}`}
          >
            {s || 'All'}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rider / address…"
            className="rounded-xl border border-amber-200 bg-white py-2 pl-9 pr-4 text-sm outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-50 text-xs font-black uppercase text-amber-900">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Rider</th>
                <th className="px-4 py-3 text-left">Driver</th>
                <th className="px-4 py-3 text-left">Route</th>
                <th className="px-4 py-3 text-left">Vehicle</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Fare</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-400">Loading…</td></tr>}
              {!isLoading && rides.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-400">No rides found.</td></tr>}
              {rides.map((r) => (
                <tr key={r.id} className="border-t border-amber-50 hover:bg-amber-50/40">
                  <td className="px-4 py-3 font-black">#{r.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold">{r.rider_name}</p>
                    <p className="text-xs text-zinc-500">{r.rider_phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    {r.driver_name ? (
                      <>
                        <p className="font-bold">{r.driver_name}</p>
                        <p className="text-xs text-zinc-500">{r.vehicle_plate}</p>
                      </>
                    ) : <span className="text-xs text-zinc-400">—</span>}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-xs">
                    <p className="truncate">{r.pickup_address}</p>
                    <p className="truncate text-zinc-500">→ {r.dropoff_address}</p>
                  </td>
                  <td className="px-4 py-3"><span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-bold">{r.vehicle_type}</span></td>
                  <td className="px-4 py-3"><Tone value={r.status === 'COMPLETED' ? 'Completed' : r.status === 'CANCELLED' ? 'Cancelled' : r.status === 'STARTED' ? 'Ongoing' : r.status === 'SEARCHING' ? 'Pending' : r.status === 'SCHEDULED' ? 'Scheduled' : 'Live'} /></td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-black">₹{Number(r.final_fare || r.estimated_fare || 0).toFixed(0)}</p>
                    {r.discount_amount > 0 && <p className="text-xs text-emerald-600">−₹{r.discount_amount}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{fmt(r.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    {!['COMPLETED', 'CANCELLED'].includes(r.status) && (
                      <button
                        onClick={() => cancelRide.mutate(r.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2 py-1 text-xs font-bold text-white hover:bg-rose-700"
                      >
                        <XCircle className="h-3 w-3" />Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Screen>
  );
}
