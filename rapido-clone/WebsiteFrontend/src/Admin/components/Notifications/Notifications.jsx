import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Screen, Tone } from '../adminUi';

const history = [
  { name: 'Rain safety reminder', audience: 'All riders', channel: 'Push', sent: '12,240', status: 'Completed' },
  { name: 'Captain bonus update', audience: 'Captains', channel: 'SMS', sent: '3,420', status: 'Ongoing' },
  { name: 'Airport offer', audience: 'Bengaluru riders', channel: 'Push', sent: '-', status: 'Scheduled' }
];

export default function Notifications() {
  const [form, setForm] = useState({ title: '', audience: 'All riders', channel: 'Push', body: '' });

  return (
    <Screen className="bg-cyan-50">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Outreach</p>
        <h1 className="text-3xl font-black">Notifications</h1>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <form className="rounded-3xl bg-white p-6 shadow-card" onSubmit={(event) => event.preventDefault()}>
          <h2 className="text-lg font-black">Compose campaign</h2>
          <label className="mt-4 block text-xs font-bold uppercase text-zinc-500">Title
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-xl border border-cyan-100 p-2.5 text-sm font-semibold" placeholder="Peak hour bonus is live" />
          </label>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-xs font-bold uppercase text-zinc-500">Audience
              <select value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })} className="mt-1 w-full rounded-xl border border-cyan-100 p-2.5 text-sm font-semibold">
                <option>All riders</option>
                <option>Captains</option>
                <option>Bengaluru riders</option>
              </select>
            </label>
            <label className="text-xs font-bold uppercase text-zinc-500">Channel
              <select value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })} className="mt-1 w-full rounded-xl border border-cyan-100 p-2.5 text-sm font-semibold">
                <option>Push</option>
                <option>SMS</option>
                <option>WhatsApp</option>
              </select>
            </label>
          </div>
          <label className="mt-3 block text-xs font-bold uppercase text-zinc-500">Message
            <textarea rows="5" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} className="mt-1 w-full rounded-xl border border-cyan-100 p-2.5 text-sm" placeholder="Write the announcement..." />
          </label>
          <div className="mt-4 rounded-2xl bg-zinc-900 p-4 text-white">
            <p className="text-[10px] font-bold uppercase text-cyan-300">Phone preview</p>
            <p className="mt-2 font-black">{form.title || 'Campaign title'}</p>
            <p className="mt-1 text-sm text-zinc-300">{form.body || 'Your message will appear here.'}</p>
          </div>
          <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white"><Send className="h-4 w-4" /> Send now</button>
        </form>

        <div className="space-y-3">
          {history.map((item) => (
            <article key={item.name} className="rounded-3xl border border-cyan-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-black">{item.name}</h3>
                <Tone value={item.status} />
              </div>
              <p className="mt-2 text-sm font-semibold text-zinc-500">{item.audience} · {item.channel} · {item.sent} sent</p>
            </article>
          ))}
        </div>
      </div>
    </Screen>
  );
}
