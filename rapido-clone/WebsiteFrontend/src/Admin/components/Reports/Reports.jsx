import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download } from 'lucide-react';
import { Screen } from '../adminUi';
import api from '../../../api/axios';

export default function Reports() {
  const { data: revenue = [], isLoading: l1 } = useQuery({
    queryKey: ['report-revenue'],
    queryFn: async () => (await api.get('/admin/reports/revenue', { params: { groupBy: 'day' } })).data.report,
  });
  const { data: statusData = [], isLoading: l2 } = useQuery({
    queryKey: ['report-status'],
    queryFn: async () => (await api.get('/admin/reports/rides-by-status')).data.ridesByStatus,
  });
  const { data: dash } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get('/admin/dashboard')).data.stats,
  });

  const exportCsv = () => {
    const rows = [['period', 'rides', 'gross', 'commission', 'driver_payout'], ...revenue.map((r) => [r.period, r.rides, r.gross, r.commission, r.driver_payout])];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sawaari-revenue-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <Screen className="bg-zinc-50">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-700">Analytics</p>
          <h1 className="flex items-center gap-2 text-3xl font-black text-zinc-900"><BarChart3 className="h-7 w-7 text-amber-600" />Reports</h1>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-amber-700">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {dash && (
        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi label="Total users" value={dash.users} />
          <Kpi label="Total drivers" value={dash.drivers} />
          <Kpi label="Completed rides" value={dash.completed_rides} />
          <Kpi label="Revenue" value={`₹${Number(dash.revenue || 0).toFixed(0)}`} />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-base font-black">Rides by status</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-xs uppercase text-zinc-500"><th className="text-left py-2">Status</th><th className="text-right">Count</th></tr></thead>
            <tbody>
              {statusData.map((s) => (
                <tr key={s.status} className="border-t"><td className="py-2 font-bold">{s.status}</td><td className="text-right">{s.n}</td></tr>
              ))}
              {statusData.length === 0 && <tr><td colSpan={2} className="py-6 text-center text-zinc-400">No data</td></tr>}
            </tbody>
          </table>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-base font-black">Daily revenue (last {revenue.length} days)</h2>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white"><tr className="text-xs uppercase text-zinc-500"><th className="text-left py-2">Day</th><th className="text-right">Rides</th><th className="text-right">Gross</th></tr></thead>
              <tbody>
                {revenue.map((r) => (
                  <tr key={r.period} className="border-t"><td className="py-2 font-bold">{r.period}</td><td className="text-right">{r.rides}</td><td className="text-right">₹{Number(r.gross).toFixed(0)}</td></tr>
                ))}
                {revenue.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-zinc-400">No data</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Screen>
  );
}

const Kpi = ({ label, value }) => (
  <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
    <p className="text-2xl font-black">{value}</p>
    <p className="mt-1 text-xs font-semibold text-zinc-500">{label}</p>
  </div>
);
