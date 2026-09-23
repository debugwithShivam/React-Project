import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Bell, Send, Users, Bike, Megaphone } from 'lucide-react';
import { Screen } from '../adminUi';
import api from '../../../api/axios';

export default function Notifications() {
  const [form, setForm] = useState({ title: '', body: '', role: '', userIds: '' });
  const [sent, setSent] = useState(null);

  const send = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        body: form.body,
        type: 'BROADCAST',
        role: form.role || null,
        userIds: form.userIds ? form.userIds.split(',').map((s) => Number(s.trim())).filter(Boolean) : null,
      };
      return (await api.post('/admin/notifications/send', payload)).data;
    },
    onSuccess: (data) => {
      setSent(data.sent || 0);
      setForm({ title: '', body: '', role: '', userIds: '' });
    },
  });

  return (
    <Screen className="bg-sky-50/60">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">Communication</p>
        <h1 className="text-3xl font-black text-zinc-900">Send notification</h1>
        <p className="mt-1 text-sm text-zinc-500">Push a notification to all users, a role, or specific user IDs.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          onSubmit={(e) => { e.preventDefault(); send.mutate(); }}
          className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm"
        >
          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-bold uppercase text-zinc-500">Title</span>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                   className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-sky-500" />
          </label>
          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-bold uppercase text-zinc-500">Body</span>
            <textarea required rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-sky-500" />
          </label>
          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-bold uppercase text-zinc-500">Audience</span>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none">
              <option value="">All users</option>
              <option value="USER">Only customers</option>
              <option value="DRIVER">Only drivers</option>
            </select>
          </label>
          <label className="mb-4 block">
            <span className="mb-1 block text-xs font-bold uppercase text-zinc-500">Or specific user IDs (comma-separated)</span>
            <input value={form.userIds} onChange={(e) => setForm({ ...form, userIds: e.target.value })}
                   placeholder="12, 34, 56"
                   className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none" />
          </label>
          <button type="submit" disabled={send.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-50">
            <Send className="h-4 w-4" /> {send.isPending ? 'Sending…' : 'Send notification'}
          </button>
          {sent !== null && <p className="mt-3 text-sm font-bold text-emerald-600">✓ Sent to {sent} user(s)</p>}
          {send.isError && <p className="mt-3 text-sm font-bold text-rose-600">✗ {send.error.message}</p>}
        </form>

        <aside className="rounded-3xl bg-sky-950 p-6 text-white shadow-card">
          <Megaphone className="mb-3 h-8 w-8 text-brand-yellow" />
          <h3 className="text-lg font-black">Tips</h3>
          <ul className="mt-3 space-y-2 text-sm text-sky-200">
            <li>• Use specific user IDs for targeted offers (e.g. win-back campaigns).</li>
            <li>• Notifications appear in-app instantly via socket and persist in the user's notification list.</li>
            <li>• Keep titles under 40 characters for mobile push compatibility.</li>
          </ul>
        </aside>
      </div>
    </Screen>
  );
}
