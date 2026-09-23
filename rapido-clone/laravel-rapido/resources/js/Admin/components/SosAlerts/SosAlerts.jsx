import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Screen, Tone } from '../adminUi';
import api from '../../../api/axios';

const fmt = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

export default function SosAlerts() {
  const qc = useQueryClient();
  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-sos'],
    queryFn: async () => (await api.get('/admin/sos')).data.alerts,
    refetchInterval: 10000,
  });
  const resolve = useMutation({
    mutationFn: ({ id, status, notes }) => api.patch(`/admin/sos/${id}`, { status, notes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-sos'] }),
  });

  const active = alerts.filter((a) => a.status === 'ACTIVE');

  return (
    <Screen className="bg-rose-50/60">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">Safety</p>
        <h1 className="flex items-center gap-2 text-3xl font-black text-zinc-900"><AlertTriangle className="h-7 w-7 text-rose-600" />SOS alerts</h1>
        <p className="mt-1 text-sm text-zinc-500">{active.length} active · auto-refreshes every 10s</p>
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-zinc-400">Loading…</p>}
        {!isLoading && alerts.length === 0 && <p className="rounded-2xl border border-dashed border-rose-200 bg-white p-8 text-center text-sm text-zinc-400">No SOS alerts. ✓</p>}
        {alerts.map((a) => (
          <div key={a.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${a.status === 'ACTIVE' ? 'border-rose-300 ring-2 ring-rose-100' : 'border-zinc-200'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-black">SOS #{a.id} · Ride #{a.ride_id}</span>
                  <Tone value={a.status === 'ACTIVE' ? 'Urgent' : a.status === 'RESOLVED' ? 'Resolved' : 'Inactive'} />
                </div>
                <p className="mt-2 text-sm">
                  <strong>User:</strong> {a.user_name} ({a.user_phone})
                  {a.driver_name && <> · <strong>Driver:</strong> {a.driver_name} ({a.driver_phone})</>}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Location: {a.lat ? `${Number(a.lat).toFixed(5)}, ${Number(a.lng).toFixed(5)}` : 'unknown'} · Triggered {fmt(a.created_at)}
                </p>
                {a.lat && (
                  <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${a.lat},${a.lng}`} className="mt-2 inline-block text-xs font-bold text-sky-600 underline">
                    Open in Google Maps →
                  </a>
                )}
                {a.notes && <p className="mt-2 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600">{a.notes}</p>}
              </div>
              {a.status === 'ACTIVE' && (
                <div className="flex flex-col gap-2">
                  <button onClick={() => { const n = prompt('Resolution notes:'); if (n !== null) resolve.mutate({ id: a.id, status: 'RESOLVED', notes: n }); }}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Resolve
                  </button>
                  <button onClick={() => { const n = prompt('Notes:'); if (n !== null) resolve.mutate({ id: a.id, status: 'FALSE_ALARM', notes: n }); }}
                          className="rounded-lg bg-zinc-200 px-3 py-1.5 text-xs font-bold hover:bg-zinc-300">
                    False alarm
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}
