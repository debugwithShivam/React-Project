import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Bike, Headset, IndianRupee, MapPin, TrendingUp, Users } from 'lucide-react';
import { Screen } from '../adminUi';
import api from '../../../api/client';

const hours = [
  { t: '6a', v: 18 }, { t: '8a', v: 62 }, { t: '10a', v: 48 }, { t: '12p', v: 70 },
  { t: '2p', v: 44 }, { t: '4p', v: 58 }, { t: '6p', v: 92 }, { t: '8p', v: 76 }, { t: '10p', v: 34 }
];

const feed = [
  { id: 'SW-10428', text: 'Bike ride started · Indiranagar → Koramangala', time: '32s', tone: 'live' },
  { id: 'SW-10427', text: 'Auto drop completed · MG Road', time: '2m', tone: 'done' },
  { id: 'SUP-9281', text: 'Lost-item ticket assigned to Neha', time: '4m', tone: 'warn' },
  { id: 'CAP-882', text: 'Captain Ramesh went online in HSR', time: '6m', tone: 'ok' },
  { id: 'SW-10422', text: 'Airport cab waiting for assignment', time: '8m', tone: 'warn' }
];

const cities = [
  { name: 'Bengaluru', rides: 4820, load: 92 },
  { name: 'Hyderabad', rides: 2940, load: 74 },
  { name: 'Pune', rides: 1205, load: 58 },
  { name: 'Chennai', rides: 980, load: 41 }
];

export default function Dashboard() {
  const { data } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get('/admin/dashboard')).data.stats,
  });
  const stats = data || {};
  const kpis = [
    { label: 'Today GMV', value: `₹${Number(stats.revenue || 0).toLocaleString('en-IN')}`, note: `${stats.completed_rides || 0} completed rides`, icon: IndianRupee, tone: 'bg-brand-dark text-brand-yellow' },
    { label: 'Rides today', value: stats.rides_today || 0, note: `${stats.active_rides || 0} live · ${stats.cancelled_rides || 0} cancelled`, icon: Bike, tone: 'bg-yellow-100 text-amber-800' },
    { label: 'Captains online', value: stats.online_drivers || 0, note: `${stats.approved_drivers || 0} approved`, icon: Users, tone: 'bg-emerald-100 text-emerald-800' },
    { label: 'Open tickets', value: stats.open_complaints || 0, note: `${stats.pending_payouts || 0} payout requests pending`, icon: Headset, tone: 'bg-rose-100 text-rose-800' },
  ];
  return (
    <Screen className="bg-[radial-gradient(circle_at_top_left,_#FEF3C7_0%,_#F4F4F5_42%)]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Command center</p>
          <h1 className="mt-1 text-3xl font-black text-zinc-900">Good morning, operations</h1>
          <p className="mt-1 text-sm text-zinc-500">Live picture of Sawaari rides, captains and city demand.</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-white/80 px-4 py-2 text-sm font-bold text-zinc-700 shadow-sm">
          16 Sep 2026 · Peak hours 6–9 PM
        </div>
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
            <h2 className="flex items-center gap-2 text-base font-black"><Activity className="h-4 w-4 text-amber-500" /> Hourly demand</h2>
            <span className="text-xs font-bold text-zinc-400">Today · bike + auto + cab</span>
          </div>
          <div className="flex h-48 items-end gap-3">
            {hours.map((hour) => (
              <div key={hour.t} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end rounded-xl bg-amber-50">
                  <div className="w-full rounded-xl bg-gradient-to-t from-amber-500 to-brand-yellow" style={{ height: `${hour.v}%` }} />
                </div>
                <span className="text-[10px] font-bold text-zinc-500">{hour.t}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-brand-dark p-5 text-white shadow-card">
          <h2 className="mb-4 text-base font-black text-brand-yellow">Live pulse</h2>
          <div className="space-y-3">
            {feed.map((item) => (
              <div key={item.id} className="flex gap-3 rounded-2xl bg-white/5 p-3">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.tone === 'live' ? 'animate-pulse bg-brand-yellow' : item.tone === 'done' ? 'bg-emerald-400' : item.tone === 'ok' ? 'bg-sky-400' : 'bg-amber-400'}`} />
                <div>
                  <p className="text-xs font-black text-zinc-400">{item.id} · {item.time}</p>
                  <p className="text-sm font-semibold">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cities.map((city) => (
          <div key={city.name} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 font-black text-zinc-900"><MapPin className="h-4 w-4 text-amber-500" />{city.name}</p>
              <span className="text-xs font-bold text-zinc-400">{city.rides.toLocaleString()} rides</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-brand-yellow" style={{ width: `${city.load}%` }} />
            </div>
            <p className="mt-2 text-xs font-semibold text-zinc-500">{city.load}% demand load</p>
          </div>
        ))}
      </div>
    </Screen>
  );
}
