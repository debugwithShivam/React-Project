import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Bike, Headset, IndianRupee, MapPin, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { Screen } from '../adminUi';
import api from '../../../api/axios';

const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get('/admin/dashboard')).data.stats,
    refetchInterval: 15000,
  });

  if (isLoading) return <Screen><p className="text-sm text-zinc-500">Loading dashboard…</p></Screen>;
  if (error) return <Screen><p className="text-sm text-rose-600">Failed to load: {error.message}</p></Screen>;

  const stats = data || {};
  const kpis = [
    { label: 'Total revenue', value: fmtMoney(stats.revenue), note: `${stats.completed_rides || 0} completed rides`, icon: IndianRupee, tone: 'bg-brand-dark text-brand-yellow' },
    { label: 'Rides today', value: stats.rides_today || 0, note: `${stats.active_rides || 0} live · ${stats.cancelled_rides || 0} cancelled`, icon: Bike, tone: 'bg-yellow-100 text-amber-800' },
    { label: 'Captains online', value: stats.online_drivers || 0, note: `${stats.approved_drivers || 0} approved · ${stats.pending_drivers || 0} pending KYC`, icon: Users, tone: 'bg-emerald-100 text-emerald-800' },
    { label: 'Open tickets', value: stats.open_complaints || 0, note: `${stats.pending_payouts || 0} payout requests pending`, icon: Headset, tone: 'bg-rose-100 text-rose-800' },
  ];

  const ridesByDay = (stats.ridesByDay || []).slice(0, 14).reverse();
  const maxRides = Math.max(1, ...ridesByDay.map((d) => Number(d.rides)));

  return (
    <Screen className="bg-[radial-gradient(circle_at_top_left,_#FEF3C7_0%,_#F4F4F5_42%)]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Command center</p>
          <h1 className="mt-1 text-3xl font-black text-zinc-900">Operations dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">Live picture of Sawaari rides, captains and revenue.</p>
        </div>
        <button onClick={() => refetch()} className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-700 shadow-sm hover:bg-zinc-50">
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-white/70 bg-white p-4 shadow-card">
              <div className={`mb-3 inline-flex rounded-xl p-2 ${item.tone}`}><Icon className="h-4 w-4" /></div>
              <p className="text-xs font-semibold text-zinc-500">{item.label}</p>
              <p className="mt-1 text-3xl font-black tracking-tight">{item.value}</p>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600"><TrendingUp className="h-3 w-3" />{item.note}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-black"><Activity className="h-4 w-4 text-amber-500" /> Last 14 days</h2>
            <span className="text-xs font-bold text-zinc-400">rides per day</span>
          </div>
          {ridesByDay.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-400">No ride data yet.</p>
          ) : (
            <div className="flex h-48 items-end gap-2">
              {ridesByDay.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end rounded-xl bg-amber-50">
                    <div
                      className="w-full rounded-xl bg-gradient-to-t from-amber-500 to-brand-yellow"
                      style={{ height: `${(Number(d.rides) / maxRides) * 100}%` }}
                      title={`${d.rides} rides · ${fmtMoney(d.revenue)}`}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-zinc-500">{String(d.day).slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-brand-dark p-5 text-white shadow-card">
          <h2 className="mb-4 text-base font-black text-brand-yellow">Rides by status</h2>
          <div className="space-y-2">
            {(stats.ridesByStatus || []).map((s) => (
              <div key={s.status} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                <span className="text-sm font-semibold">{s.status}</span>
                <span className="text-lg font-black text-brand-yellow">{s.n}</span>
              </div>
            ))}
            {(stats.ridesByStatus || []).length === 0 && (
              <p className="text-sm text-zinc-400">No rides yet.</p>
            )}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-black uppercase text-zinc-500"><Users className="h-4 w-4 text-amber-500" />Total customers</p>
          <p className="mt-2 text-3xl font-black">{stats.users || 0}</p>
          <p className="mt-1 text-xs text-zinc-500">+{stats.new_users_today || 0} today</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-black uppercase text-zinc-500"><Bike className="h-4 w-4 text-emerald-500" />Total drivers</p>
          <p className="mt-2 text-3xl font-black">{stats.drivers || 0}</p>
          <p className="mt-1 text-xs text-zinc-500">{stats.approved_drivers || 0} approved</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-black uppercase text-zinc-500"><IndianRupee className="h-4 w-4 text-rose-500" />Commission earned</p>
          <p className="mt-2 text-3xl font-black">{fmtMoney(stats.commission)}</p>
          <p className="mt-1 text-xs text-zinc-500">Driver payouts: {fmtMoney(stats.driver_payouts)}</p>
        </div>
      </div>

      {(stats.pending_payouts > 0 || stats.open_complaints > 0) && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-black text-amber-900">
            <AlertTriangle className="h-4 w-4" /> Action needed
          </p>
          <ul className="mt-2 space-y-1 text-sm text-amber-800">
            {stats.pending_payouts > 0 && <li>• {stats.pending_payouts} payout requests worth {fmtMoney(stats.pending_payout_amount)} waiting</li>}
            {stats.open_complaints > 0 && <li>• {stats.open_complaints} support tickets open</li>}
          </ul>
        </div>
      )}

      {stats.topDrivers?.length > 0 && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-base font-black"><MapPin className="h-4 w-4 text-amber-500" />Top drivers</h3>
          <div className="space-y-2">
            {stats.topDrivers.map((d, i) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2">
                <span className="text-sm font-bold">#{i + 1} {d.name} <span className="text-xs text-zinc-400">({d.vehicle_plate})</span></span>
                <span className="text-sm font-black">{d.total_rides} rides · {fmtMoney(d.total_earnings)} · ★ {Number(d.rating_avg).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Screen>
  );
}
