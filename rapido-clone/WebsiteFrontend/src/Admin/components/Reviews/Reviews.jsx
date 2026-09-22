import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, MessageSquare } from 'lucide-react';
import { Screen, Tone } from '../adminUi';
import api from '../../../api/axios';

export default function Reviews() {
  const [filter, setFilter] = useState('');
  const qc = useQueryClient();
  const { data: ratings = [], isLoading } = useQuery({
    queryKey: ['admin-ratings', filter],
    queryFn: async () => (await api.get('/admin/ratings', { params: { rating: filter || undefined } })).data.ratings,
  });
  const deleteMut = useMutation({
    mutationFn: async (id) => (await api.delete(`/admin/ratings/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-ratings'] }),
  });

  const avg = ratings.length ? (ratings.reduce((s, r) => s + Number(r.rating), 0) / ratings.length).toFixed(2) : '—';

  return (
    <Screen className="bg-yellow-50/60">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-700">Quality</p>
        <h1 className="text-3xl font-black text-zinc-900">Ratings & reviews</h1>
        <p className="mt-1 text-sm text-zinc-500">{ratings.length} reviews · average {avg} ★</p>
      </div>

      <div className="mb-4 flex gap-2">
        {['', '5', '4', '3', '2', '1'].map((r) => (
          <button key={r || 'ALL'} onClick={() => setFilter(r)} className={`rounded-full px-4 py-1.5 text-xs font-bold ${filter === r ? 'bg-yellow-600 text-white' : 'bg-white border border-yellow-200 text-zinc-600'}`}>
            {r ? `${r}★` : 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-zinc-400">Loading…</p>}
        {!isLoading && ratings.length === 0 && <p className="rounded-2xl border border-dashed border-yellow-200 bg-white p-8 text-center text-sm text-zinc-400">No reviews yet.</p>}
        {ratings.map((r) => (
          <div key={r.id} className="rounded-2xl border border-yellow-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-yellow-600">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className="text-xs text-zinc-400">ride #{r.ride_id} · {r.vehicle_type}</span>
                  <Tone value={r.rater_role === 'USER' ? 'Active' : 'Live'} />
                </div>
                <p className="mt-2 text-sm font-bold">{r.rater_name} <span className="font-normal text-zinc-500">rated</span> {r.ratee_name}</p>
                {r.comment && <p className="mt-1 flex items-start gap-2 text-sm text-zinc-600"><MessageSquare className="mt-0.5 h-4 w-4 text-zinc-400" />{r.comment}</p>}
                <p className="mt-2 text-xs text-zinc-400">{r.pickup_address} → {r.dropoff_address}</p>
              </div>
              <button onClick={() => { if (confirm('Delete this review?')) deleteMut.mutate(r.id); }} className="rounded-lg bg-rose-100 p-2 text-rose-700 hover:bg-rose-200"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}
