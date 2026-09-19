import React, { useState } from 'react';
import { Initials, Screen, Tone } from '../adminUi';

const staff = [
  { name: 'Ananya Kapoor', email: 'ananya@sawaari.in', role: 'Super Admin', last: 'Just now', status: 'Active' },
  { name: 'Rohit Jain', email: 'rohit@sawaari.in', role: 'Operations', last: '10 min ago', status: 'Active' },
  { name: 'Neha Gupta', email: 'neha@sawaari.in', role: 'Support', last: 'Yesterday', status: 'Inactive' },
  { name: 'Karan Malik', email: 'karan@sawaari.in', role: 'Finance', last: '1 hour ago', status: 'Active' }
];

const matrix = [
  { role: 'Super Admin', rides: true, payouts: true, kyc: true, settings: true },
  { role: 'Operations', rides: true, payouts: false, kyc: true, settings: false },
  { role: 'Support', rides: true, payouts: false, kyc: false, settings: false },
  { role: 'Finance', rides: false, payouts: true, kyc: false, settings: false }
];

function Cell({ on }) {
  return <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-black ${on ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-400'}`}>{on ? '✓' : '–'}</span>;
}

export default function StaffRoles() {
  const [role, setRole] = useState('Operations');

  return (
    <Screen className="bg-slate-50">
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Access control</p>
        <h1 className="text-3xl font-black">Staff & roles</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {staff.map((person) => (
          <article key={person.email} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <Initials name={person.name} className="bg-slate-800 text-white" />
            <p className="mt-3 font-black">{person.name}</p>
            <p className="text-xs font-semibold text-slate-500">{person.email}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">{person.role}</span>
              <Tone value={person.status} />
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Last login {person.last}</p>
          </article>
        ))}
      </div>

      <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-black">Permission matrix</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {matrix.map((item) => (
              <button key={item.role} type="button" onClick={() => setRole(item.role)} className={`rounded-full px-3 py-1 text-xs font-bold ${role === item.role ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>{item.role}</button>
            ))}
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Rides</th>
              <th className="px-5 py-3">Payouts</th>
              <th className="px-5 py-3">KYC</th>
              <th className="px-5 py-3">Settings</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((item) => (
              <tr key={item.role} className={role === item.role ? 'bg-amber-50' : ''}>
                <td className="px-5 py-3 font-bold">{item.role}</td>
                <td className="px-5 py-3"><Cell on={item.rides} /></td>
                <td className="px-5 py-3"><Cell on={item.payouts} /></td>
                <td className="px-5 py-3"><Cell on={item.kyc} /></td>
                <td className="px-5 py-3"><Cell on={item.settings} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Screen>
  );
}
