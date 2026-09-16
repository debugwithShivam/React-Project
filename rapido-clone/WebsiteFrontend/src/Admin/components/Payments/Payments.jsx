import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, RefreshCcw } from 'lucide-react';
import { Screen, Tone } from '../adminUi';

const txns = [
  { id: 'TXN-88214', name: 'Aarav Mehta', method: 'UPI · GPay', amount: 84, type: 'in', status: 'Paid', time: '10:42 AM' },
  { id: 'TXN-88213', name: 'Pooja Verma', method: 'Wallet', amount: 142, type: 'in', status: 'Paid', time: '10:28 AM' },
  { id: 'TXN-88212', name: 'Rahul Sharma', method: 'UPI', amount: 680, type: 'in', status: 'Pending', time: '10:11 AM' },
  { id: 'RFD-2291', name: 'Meera Shah', method: 'Refund to UPI', amount: 96, type: 'out', status: 'Pending', time: '09:50 AM' },
  { id: 'TXN-88190', name: 'Captain payout', method: 'Bank NEFT', amount: 2140, type: 'out', status: 'Paid', time: '09:00 AM' }
];

export default function Payments() {
  const [view, setView] = useState('All');
  const rows = txns.filter((item) => view === 'All' || (view === 'In' && item.type === 'in') || (view === 'Out' && item.type === 'out'));

  return (
    <Screen className="bg-zinc-100">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Treasury</p>
          <h1 className="text-3xl font-black">Payments ledger</h1>
        </div>
        <div className="flex gap-2">
          {['All', 'In', 'Out'].map((item) => (
            <button key={item} type="button" onClick={() => setView(item)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${view === item ? 'bg-zinc-900 text-white' : 'bg-white'}`}>{item}</button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-emerald-600 p-4 text-white"><p className="text-xs font-bold uppercase">Collected today</p><p className="mt-2 text-3xl font-black">₹4.82L</p></div>
        <div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-xs font-bold uppercase text-zinc-500">UPI share</p><p className="mt-2 text-3xl font-black">68%</p><div className="mt-3 h-2 rounded-full bg-zinc-100"><div className="h-full w-[68%] rounded-full bg-emerald-500" /></div></div>
        <div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-xs font-bold uppercase text-zinc-500">Refunds open</p><p className="mt-2 text-3xl font-black text-rose-600">₹12.4K</p></div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
        {rows.map((txn) => (
          <div key={txn.id} className="flex flex-wrap items-center gap-3 border-b border-zinc-100 px-4 py-3 last:border-0">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${txn.type === 'in' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {txn.type === 'in' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-black">{txn.name}</p>
              <p className="text-xs font-semibold text-zinc-500">{txn.id} · {txn.method} · {txn.time}</p>
            </div>
            <p className={`font-black ${txn.type === 'out' ? 'text-rose-600' : 'text-zinc-900'}`}>{txn.type === 'out' ? '-' : '+'}₹{txn.amount}</p>
            <Tone value={txn.status} />
            {txn.status === 'Pending' && <button type="button" className="rounded-lg border px-2 py-1 text-[11px] font-bold"><RefreshCcw className="mr-1 inline h-3 w-3" />Retry</button>}
          </div>
        ))}
      </div>
    </Screen>
  );
}
