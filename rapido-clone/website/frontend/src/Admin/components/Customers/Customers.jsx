import React, { useState } from 'react';
import { Mail, Phone, ShieldAlert } from 'lucide-react';
import { Initials, Screen, Tone } from '../adminUi';

const customers = [
  { name: 'Aarav Mehta', phone: '+91 90000 11122', email: 'aarav@example.com', rides: 42, spend: '₹8,420', last: 'Today · Bike', status: 'Active', flag: false },
  { name: 'Pooja Verma', phone: '+91 98111 22110', email: 'pooja@example.com', rides: 18, spend: '₹3,140', last: 'Yesterday · Auto', status: 'Active', flag: false },
  { name: 'Nikhil Jain', phone: '+91 98888 00991', email: 'nikhil@example.com', rides: 3, spend: '₹420', last: '16 Sep · Bike', status: 'Pending', flag: true },
  { name: 'Meera Shah', phone: '+91 97654 33221', email: 'meera@example.com', rides: 27, spend: '₹6,880', last: 'Today · Cab', status: 'Active', flag: false },
  { name: 'Rahul Sharma', phone: '+91 91234 55667', email: 'rahul@example.com', rides: 9, spend: '₹4,210', last: 'Airport cab', status: 'Inactive', flag: true }
];

export default function Customers() {
  const [selected, setSelected] = useState(customers[0]);

  return (
    <Screen className="bg-violet-50/70">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Rider CRM</p>
        <h1 className="text-3xl font-black text-zinc-900">Customers</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm">
          {customers.map((customer) => (
            <button key={customer.email} type="button" onClick={() => setSelected(customer)} className={`flex w-full items-center gap-3 border-b border-violet-50 px-4 py-3 text-left hover:bg-violet-50 ${selected.email === customer.email ? 'bg-violet-50' : ''}`}>
              <Initials name={customer.name} className="bg-violet-700 text-white" />
              <div className="min-w-0 flex-1">
                <p className="font-black text-zinc-900">{customer.name}</p>
                <p className="truncate text-xs text-zinc-500">{customer.last}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black">{customer.rides} rides</p>
                <Tone value={customer.status} />
              </div>
            </button>
          ))}
        </div>

        <aside className="rounded-3xl bg-violet-950 p-6 text-white shadow-card">
          <div className="flex items-center gap-3">
            <Initials name={selected.name} size="lg" className="bg-brand-yellow text-violet-950" />
            <div>
              <p className="text-2xl font-black">{selected.name}</p>
              <p className="text-sm text-violet-200">{selected.spend} lifetime</p>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand-yellow" /> {selected.phone}</p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand-yellow" /> {selected.email}</p>
            {selected.flag && <p className="flex items-center gap-2 rounded-xl bg-rose-500/20 p-3 text-rose-100"><ShieldAlert className="h-4 w-4" /> Support flag: review last cancellation</p>}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4"><p className="text-2xl font-black">{selected.rides}</p><p className="text-xs text-violet-200">Completed rides</p></div>
            <div className="rounded-2xl bg-white/10 p-4"><p className="text-2xl font-black">{selected.spend}</p><p className="text-xs text-violet-200">Wallet + UPI</p></div>
          </div>
        </aside>
      </div>
    </Screen>
  );
}
