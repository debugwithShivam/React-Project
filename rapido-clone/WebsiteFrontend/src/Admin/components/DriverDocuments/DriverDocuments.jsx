import React, { useState } from 'react';
import { Ban, Check, FileText } from 'lucide-react';
import { Initials, Screen, Tone } from '../adminUi';

const queue = [
  { id: 'KYC-441', name: 'Vikram Singh', city: 'Bengaluru', docs: ['Driving License', 'RC', 'Selfie','Adhar card'], submitted: 'Today 10:24 AM', status: 'Pending' },
  { id: 'KYC-438', name: 'Ramesh Kumar', city: 'Bengaluru', docs: ['Aadhaar', 'Insurance'], submitted: 'Today 09:12 AM', status: 'Approved' },
  { id: 'KYC-430', name: 'Sanjay Patil', city: 'Pune', docs: ['Driving License'], submitted: 'Yesterday', status: 'Rejected' },
  { id: 'KYC-429', name: 'Imran Khan', city: 'Chennai', docs: ['PAN', 'RC', 'Insurance'], submitted: 'Yesterday', status: 'Pending' }
];

export default function DriverDocuments() {
  const [selected, setSelected] = useState(queue[0]);

  return (
    <Screen className="bg-sky-50">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">KYC desk</p>
        <h1 className="text-3xl font-black text-zinc-900">Driver documents</h1>
        <p className="mt-1 text-sm text-zinc-500">Approve captains only after license, RC and identity checks.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <aside className="space-y-3">
          {queue.map((item) => (
            <button key={item.id} type="button" onClick={() => setSelected(item)} className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm ${selected.id === item.id ? 'border-sky-500 ring-2 ring-sky-100' : 'border-sky-100'}`}>
              <div className="flex items-center justify-between">
                <p className="font-black">{item.name}</p>
                <Tone value={item.status} />
              </div>
              <p className="mt-1 text-xs font-semibold text-zinc-500">{item.id} · {item.submitted}</p>
            </button>
          ))}
        </aside>

        <section className="rounded-3xl border border-sky-100 bg-white p-6 shadow-card">
          <div className="flex items-center gap-3">
            <Initials name={selected.name} className="bg-sky-700 text-white" />
            <div>
              <p className="text-xl font-black">{selected.name}</p>
              <p className="text-sm text-zinc-500">{selected.city} · submitted {selected.submitted}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {selected.docs.map((doc) => (
              <div key={doc} className="rounded-2xl border border-dashed border-sky-200 bg-sky-50 p-4">
                <FileText className="h-5 w-5 text-sky-700" />
                <p className="mt-3 font-black text-sm">{doc}</p>
                <div className="mt-3 h-24 rounded-xl bg-gradient-to-br from-white to-sky-100" />
                <p className="mt-2 text-[11px] font-semibold text-zinc-400">Preview attached</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"><Check className="h-4 w-4" /> Approve KYC</button>
            <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white"><Ban className="h-4 w-4" /> Reject & request reupload</button>
          </div>
        </section>
      </div>
    </Screen>
  );
}
