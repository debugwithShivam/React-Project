import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Banknote, CheckCircle2, XCircle } from 'lucide-react';
import { Screen, Tone } from '../adminUi';
import api from '../../../api/axios';

const fmt = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

export default function Payouts() {
  const qc = useQueryClient();
  const { data: payouts = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: async () => (await api.get('/admin/payouts')).data.payouts,
  });

  const process = useMutation({
    mutationFn: ({ id, status, notes, referenceNumber }) => api.patch(`/admin/payouts/${id}`, { status, notes, referenceNumber }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-payouts'] }),
  });

  const pending = payouts.filter((p) => p.status === 'REQUESTED' || p.status === 'PROCESSING');
  const pendingAmount = pending.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <Screen className="bg-emerald-50/60">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Finance</p>
        <h1 className="flex items-center gap-2 text-3xl font-black text-zinc-900"><Banknote className="h-7 w-7 text-emerald-600" />Driver payouts</h1>
        <p className="mt-1 text-sm text-zinc-500">{pending.length} pending requests worth ₹{pendingAmount.toFixed(2)}</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-emerald-50 text-xs font-black uppercase text-emerald-900">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Driver</th>
              <th className="px-4 py-3 text-left">UPI</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Requested</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-400">Loading…</td></tr>}
            {!isLoading && payouts.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-400">No payout requests yet.</td></tr>}
            {payouts.map((p) => (
              <tr key={p.id} className="border-t border-emerald-50 hover:bg-emerald-50/40">
                <td className="px-4 py-3 font-black">#{p.id}</td>
                <td className="px-4 py-3">
                  <p className="font-bold">{p.driver_name}</p>
                  <p className="text-xs text-zinc-500">{p.driver_phone} · {p.vehicle_plate}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{p.upi}</td>
                <td className="px-4 py-3 text-right font-black">₹{Number(p.amount).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <Tone value={p.status === 'PAID' ? 'Paid' : p.status === 'REJECTED' ? 'Rejected' : p.status === 'PROCESSING' ? 'Live' : 'Pending'} />
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">{fmt(p.requested_at)}</td>
                <td className="px-4 py-3 text-right">
                  {(p.status === 'REQUESTED' || p.status === 'PROCESSING') && (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => {
                        const ref = prompt('Reference number (UTR / txn id):');
                        if (ref === null) return;
                        process.mutate({ id: p.id, status: 'PAID', referenceNumber: ref, notes: 'Marked as paid' });
                      }} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-bold text-white hover:bg-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Mark paid
                      </button>
                      <button onClick={() => {
                        const reason = prompt('Rejection reason:');
                        if (reason === null) return;
                        process.mutate({ id: p.id, status: 'REJECTED', notes: reason });
                      }} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2 py-1 text-xs font-bold text-white hover:bg-rose-700">
                        <XCircle className="h-3 w-3" /> Reject
                      </button>
                    </div>
                  )}
                  {p.status === 'PAID' && p.reference_number && (
                    <span className="text-xs text-zinc-500">Ref: {p.reference_number}</span>
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
