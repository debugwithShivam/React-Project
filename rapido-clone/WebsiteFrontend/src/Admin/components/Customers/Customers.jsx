import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Phone, ShieldAlert, ShieldCheck, Search, RefreshCw } from 'lucide-react';
import { Initials, Screen, Tone } from '../adminUi';
import api from '../../../api/axios';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', 'USER', search],
    queryFn: async () =>
      (await api.get('/admin/users', { params: { role: 'USER', search: search || undefined, limit: 200 } })).data.users,
  });

  const { data: detail } = useQuery({
    queryKey: ['admin-user', selectedId],
    queryFn: async () => (await api.get(`/admin/users/${selectedId}`)).data.user,
    enabled: !!selectedId,
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }) =>
      (await api.patch(`/admin/users/${id}/toggle-active`, { isActive })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const adjustWallet = useMutation({
    mutationFn: async ({ id, amount, type, reason }) =>
      (await api.post(`/admin/users/${id}/wallet`, { amount, type, reason })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-user'] });
    },
  });

  const selected = detail || users.find((u) => u.id === selectedId);

  return (
    <Screen className="bg-violet-50/70">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Rider CRM</p>
          <h1 className="text-3xl font-black text-zinc-900">Customers</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name / phone / email…"
            className="rounded-xl border border-violet-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-violet-500"
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm">
          {isLoading && <p className="p-4 text-sm text-zinc-500">Loading…</p>}
          {!isLoading && users.length === 0 && <p className="p-4 text-sm text-zinc-500">No customers found.</p>}
          {users.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setSelectedId(u.id)}
              className={`flex w-full items-center gap-3 border-b border-violet-50 px-4 py-3 text-left hover:bg-violet-50 ${selectedId === u.id ? 'bg-violet-50' : ''}`}
            >
              <Initials name={u.name} className="bg-violet-700 text-white" />
              <div className="min-w-0 flex-1">
                <p className="font-black text-zinc-900">{u.name}</p>
                <p className="truncate text-xs text-zinc-500">{u.phone} · {u.email || '—'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black">₹{Number(u.wallet_balance || 0).toFixed(0)}</p>
                <Tone value={u.is_active ? 'Active' : 'Inactive'} />
              </div>
            </button>
          ))}
        </div>

        {selected ? (
          <aside className="rounded-3xl bg-violet-950 p-6 text-white shadow-card">
            <div className="flex items-center gap-3">
              <Initials name={selected.name} size="lg" className="bg-brand-yellow text-violet-950" />
              <div>
                <p className="text-2xl font-black">{selected.name}</p>
                <p className="text-sm text-violet-200">₹{Number(selected.wallet_balance || 0).toFixed(2)} wallet · ★ {Number(selected.rating_avg || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-6 space-y-2 text-sm">
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand-yellow" /> {selected.phone}</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand-yellow" /> {selected.email || '—'}</p>
              {!selected.is_active && (
                <p className="flex items-center gap-2 rounded-xl bg-rose-500/20 p-3 text-rose-100">
                  <ShieldAlert className="h-4 w-4" /> Account is currently blocked
                </p>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => toggleActive.mutate({ id: selected.id, isActive: !selected.is_active })}
                className={`rounded-xl px-3 py-2 text-sm font-bold ${selected.is_active ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}
              >
                {selected.is_active ? 'Block user' : 'Unblock user'}
              </button>
              <button
                onClick={() => {
                  const amt = prompt('Amount to credit (₹):');
                  if (!amt) return;
                  const reason = prompt('Reason (e.g. GOODWILL):') || 'ADMIN_CREDIT';
                  adjustWallet.mutate({ id: selected.id, amount: Number(amt), type: 'CREDIT', reason });
                }}
                className="rounded-xl bg-brand-yellow px-3 py-2 text-sm font-bold text-violet-950"
              >
                Credit wallet
              </button>
            </div>

            {detail?.rides?.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-black uppercase text-violet-300">Recent rides</p>
                <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                  {detail.rides.map((r) => (
                    <div key={r.id} className="rounded-xl bg-white/10 p-3 text-xs">
                      <p className="font-bold">#{r.id} · {r.status}</p>
                      <p className="text-violet-200">{r.pickup_address} → {r.dropoff_address}</p>
                      <p className="mt-1 text-violet-300">{r.vehicle_type} · ₹{r.final_fare || r.estimated_fare || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        ) : (
          <aside className="flex items-center justify-center rounded-3xl border border-dashed border-violet-200 bg-white p-12 text-sm text-zinc-400">
            Select a customer to view details
          </aside>
        )}
      </div>
    </Screen>
  );
}
