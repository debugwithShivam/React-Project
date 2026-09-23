import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Headset, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Screen, Tone } from '../adminUi';
import api from '../../../api/axios';

const fmt = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

export default function Support() {
  const [status, setStatus] = useState('');
  const qc = useQueryClient();
  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['admin-complaints', status],
    queryFn: async () => (await api.get('/admin/complaints', { params: { status: status || undefined } })).data.complaints,
  });
  const update = useMutation({
    mutationFn: ({ id, payload }) => api.patch(`/admin/complaints/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-complaints'] }),
  });

  return (
    <Screen className="bg-rose-50/60">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">Customer care</p>
        <h1 className="flex items-center gap-2 text-3xl font-black text-zinc-900"><Headset className="h-7 w-7 text-rose-600" />Complaints & support</h1>
      </div>

      <div className="mb-4 flex gap-2">
        {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
          <button key={s || 'ALL'} onClick={() => setStatus(s)} className={`rounded-full px-4 py-1.5 text-xs font-bold ${status === s ? 'bg-rose-600 text-white' : 'bg-white border border-rose-200 text-zinc-600'}`}>{s || 'All'}</button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-zinc-400">Loading…</p>}
        {!isLoading && complaints.length === 0 && <p className="rounded-2xl border border-dashed border-rose-200 bg-white p-8 text-center text-sm text-zinc-400">No tickets.</p>}
        {complaints.map((c) => (
          <div key={c.id} className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-black">#{c.id} · {c.subject}</span>
                  <Tone value={c.status === 'OPEN' ? 'Pending' : c.status === 'RESOLVED' || c.status === 'CLOSED' ? 'Resolved' : 'Live'} />
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${c.priority === 'URGENT' ? 'bg-rose-100 text-rose-700' : c.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-zinc-100 text-zinc-600'}`}>{c.priority}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{c.user_name} · {c.user_phone} · {c.user_email}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">{c.description}</p>
                {c.resolution && <p className="mt-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"><strong>Resolution:</strong> {c.resolution}</p>}
                <p className="mt-2 text-xs text-zinc-400">Created {fmt(c.created_at)} · Category: {c.category}{c.ride_id ? ` · Ride #${c.ride_id}` : ''}</p>
              </div>
              <div className="flex flex-col gap-2">
                {c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                  <>
                    <button onClick={() => { const r = prompt('Resolution note:'); if (r !== null) update.mutate({ id: c.id, payload: { status: 'RESOLVED', resolution: r } }); }} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"><CheckCircle2 className="h-3 w-3" />Resolve</button>
                    <button onClick={() => update.mutate({ id: c.id, payload: { status: 'IN_PROGRESS' } })} className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600"><Clock className="h-3 w-3" />In progress</button>
                  </>
                )}
                {c.status === 'RESOLVED' && (
                  <button onClick={() => update.mutate({ id: c.id, payload: { status: 'CLOSED' } })} className="rounded-lg bg-zinc-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-700">Close ticket</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}
