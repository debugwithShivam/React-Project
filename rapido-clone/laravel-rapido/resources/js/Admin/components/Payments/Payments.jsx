import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Wallet, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Screen, Tone } from '../adminUi';
import api from '../../../api/axios';

const fmt = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

export default function Payments() {
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [search, setSearch] = useState('');

  const { data: payments = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-payments', status, method],
    queryFn: async () =>
      (await api.get('/admin/payments', { params: { status: status || undefined, method: method || undefined, limit: 200 } })).data.payments,
  });

  const refund = async (id) => {
    const amount = prompt('Refund amount (blank = full):');
    const reason = prompt('Reason:') || 'Admin refund';
    try {
      await api.post(`/admin/payments/${id}/refund`, { amount: amount ? Number(amount) : null, reason });
      alert('Refund processed');
      refetch();
    } catch (e) {
      alert('Refund failed: ' + (e.response?.data?.message || e.message));
    }
  };

  const total = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const successful = payments.filter((p) => p.status === 'SUCCESS').reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <Screen className="bg-indigo-50/60">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">Finance</p>
          <h1 className="text-3xl font-black text-zinc-900">Payments</h1>
        </div>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm font-bold"><RefreshCw className="h-4 w-4" />Refresh</button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={Wallet} label="Total transactions" value={payments.length} />
        <Stat icon={CheckCircle2} label="Successful amount" value={`₹${successful.toFixed(0)}`} />
        <Stat icon={Wallet} label="Gross volume" value={`₹${total.toFixed(0)}`} />
        <Stat icon={XCircle} label="Failed" value={payments.filter((p) => p.status === 'FAILED').length} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {['', 'SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'].map((s) => (
          <button key={s || 'ALL'} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${status === s ? 'bg-indigo-700 text-white' : 'bg-white text-zinc-600 border border-indigo-100'}`}>{s || 'All'}</button>
        ))}
        <span className="mx-2 border-l border-indigo-200" />
        {['', 'CASH', 'RAZORPAY', 'WALLET'].map((m) => (
          <button key={m || 'ALL'} onClick={() => setMethod(m)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${method === m ? 'bg-indigo-700 text-white' : 'bg-white text-zinc-600 border border-indigo-100'}`}>{m || 'All methods'}</button>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-indigo-50 text-xs font-black uppercase text-indigo-900">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Ride</th>
              <th className="px-4 py-3 text-left">Method</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-left">When</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-400">Loading…</td></tr>}
            {!isLoading && payments.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-400">No payments found.</td></tr>}
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-indigo-50 hover:bg-indigo-50/40">
                <td className="px-4 py-3 font-black">#{p.id}</td>
                <td className="px-4 py-3">
                  <p className="font-bold">{p.user_name}</p>
                  <p className="text-xs text-zinc-500">{p.user_phone}</p>
                </td>
                <td className="px-4 py-3 text-xs">
                  {p.ride_id ? `#${p.ride_id} · ${p.vehicle_type || ''}` : 'Wallet topup'}
                  {p.pickup_address && <p className="truncate text-zinc-400">{p.pickup_address}</p>}
                </td>
                <td className="px-4 py-3"><span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-bold">{p.method}</span></td>
                <td className="px-4 py-3"><Tone value={p.status === 'SUCCESS' ? 'Paid' : p.status === 'REFUNDED' ? 'Cancelled' : p.status === 'FAILED' ? 'Failed' : 'Pending'} /></td>
                <td className="px-4 py-3 text-right font-black">₹{Number(p.amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-xs text-zinc-500">{fmt(p.paid_at || p.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  {p.status === 'SUCCESS' && (
                    <button onClick={() => refund(p.id)} className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-bold text-white hover:bg-rose-700">Refund</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Screen>
  );
}

const Stat = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
    <Icon className="h-5 w-5 text-indigo-600" />
    <p className="mt-2 text-2xl font-black">{value}</p>
    <p className="text-xs font-semibold text-zinc-500">{label}</p>
  </div>
);
