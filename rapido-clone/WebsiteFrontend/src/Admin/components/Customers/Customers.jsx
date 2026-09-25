import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Phone, ShieldAlert, ShieldCheck, Search, RefreshCw, AlertCircle, X, DollarSign } from 'lucide-react';
import { Initials, Screen, Tone } from '../adminUi';
import api from '../../../api/axios';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [walletModal, setWalletModal] = useState({ open: false, type: 'CREDIT' });
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('ADMIN_CREDIT');
  const [errorMessage, setErrorMessage] = useState('');
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
    onError: () => setErrorMessage('Failed to update user status'),
  });

  const adjustWallet = useMutation({
    mutationFn: async ({ id, amount, type, reason }) =>
      (await api.post(`/admin/users/${id}/wallet`, { amount, type, reason })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-user'] });
      setWalletModal({ open: false, type: 'CREDIT' });
      setWalletAmount('');
      setWalletReason('ADMIN_CREDIT');
    },
    onError: () => setErrorMessage('Failed to adjust wallet'),
  });

  const selected = detail || users.find((u) => u.id === selectedId);

  const handleWalletAction = (type) => {
    setWalletModal({ open: true, type });
    setWalletAmount('');
    setWalletReason('ADMIN_CREDIT');
  };

  const handleWalletSubmit = () => {
    const amount = Number(walletAmount);
    if (!amount || amount <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }
    adjustWallet.mutate({ id: selected.id, amount, type: walletModal.type, reason: walletReason });
  };

  return (
    <Screen className="bg-violet-50/70">
      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex items-center gap-2" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="ml-auto text-rose-500 hover:text-rose-700">✕</button>
        </div>
      )}

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
                onClick={() => handleWalletAction('CREDIT')}
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

      {walletModal.open && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setWalletModal({ open: false, type: 'CREDIT' })}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black">{walletModal.type} Wallet</h3>
              <button onClick={() => setWalletModal({ open: false, type: 'CREDIT' })} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Amount (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    min="1"
                    step="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Reason</label>
                <input
                  type="text"
                  value={walletReason}
                  onChange={(e) => setWalletReason(e.target.value)}
                  placeholder="e.g. GOODWILL, REFUND, PROMO"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>
              <button
                onClick={handleWalletSubmit}
                disabled={adjustWallet.isPending}
                className="w-full py-2.5 bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark font-black rounded-xl shadow-sm disabled:opacity-50"
              >
                {adjustWallet.isPending ? 'Processing...' : `Apply ${walletModal.type}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}