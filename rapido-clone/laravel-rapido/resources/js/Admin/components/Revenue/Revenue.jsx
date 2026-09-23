import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { IndianRupee, TrendingUp } from 'lucide-react';
import { Screen } from '../adminUi';
import api from '../../../api/axios';

export default function Revenue() {
  const { data: report = [], isLoading } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: async () => (await api.get('/admin/reports/revenue', { params: { groupBy: 'day' } })).data.report,
  });

  const totals = report.reduce(
    (acc, r) => ({
      rides: acc.rides + Number(r.rides),
      gross: acc.gross + Number(r.gross),
      commission: acc.commission + Number(r.commission),
      payout: acc.payout + Number(r.driver_payout),
    }),
    { rides: 0, gross: 0, commission: 0, payout: 0 }
  );

  return (
    <Screen className="bg-emerald-50/60">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Finance</p>
        <h1 className="flex items-center gap-2 text-3xl font-black text-zinc-900"><IndianRupee className="h-7 w-7 text-emerald-600" />Revenue report</h1>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Completed rides" value={totals.rides} />
        <Stat label="Gross revenue" value={`₹${totals.gross.toFixed(0)}`} />
        <Stat label="Commission" value={`₹${totals.commission.toFixed(0)}`} tone="text-emerald-700" />
        <Stat label="Driver payouts" value={`₹${totals.payout.toFixed(0)}`} tone="text-rose-600" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-emerald-50 text-xs font-black uppercase text-emerald-900">
            <tr>
              <th className="px-4 py-3 text-left">Period</th>
              <th className="px-4 py-3 text-right">Rides</th>
              <th className="px-4 py-3 text-right">Gross</th>
              <th className="px-4 py-3 text-right">Commission</th>
              <th className="px-4 py-3 text-right">Driver payout</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-400">Loading…</td></tr>}
            {!isLoading && report.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-400">No completed rides yet.</td></tr>}
            {report.map((r) => (
              <tr key={r.period} className="border-t border-emerald-50 hover:bg-emerald-50/40">
                <td className="px-4 py-3 font-bold">{r.period}</td>
                <td className="px-4 py-3 text-right">{r.rides}</td>
                <td className="px-4 py-3 text-right font-black">₹{Number(r.gross).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-emerald-700">₹{Number(r.commission).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-rose-600">₹{Number(r.driver_payout).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Screen>
  );
}

const Stat = ({ label, value, tone = '' }) => (
  <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
    <p className={`text-2xl font-black ${tone}`}>{value}</p>
    <p className="mt-1 text-xs font-semibold text-zinc-500">{label}</p>
  </div>
);
