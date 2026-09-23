import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, RefreshCw } from 'lucide-react';
import { Screen } from '../adminUi';
import api from '../../../api/axios';

const GROUPS = ['GENERAL', 'RIDE', 'PAYMENT', 'PAYOUT', 'SAFETY'];
const EMPTY_SETTINGS = [];

export default function Settings() {
  const qc = useQueryClient();
  const { data: rows = EMPTY_SETTINGS, isLoading, refetch } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => (await api.get('/admin/settings')).data.settings,
  });

  const [draft, setDraft] = useState({});
  useEffect(() => {
    const map = {};
    for (const r of rows) map[r.setting_key] = r.setting_value;
    setDraft(map);
  }, [rows]);

  const save = useMutation({
    mutationFn: async () => (await api.put('/admin/settings/bulk', { settings: draft })).data,
    onSuccess: () => {
      alert('Settings saved');
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
    },
  });

  const grouped = rows.reduce((acc, r) => {
    const g = r.setting_group || 'GENERAL';
    acc[g] = acc[g] || [];
    acc[g].push(r);
    return acc;
  }, {});

  return (
    <Screen className="bg-zinc-50">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-700">Configuration</p>
          <h1 className="text-3xl font-black text-zinc-900">Settings</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-bold"><RefreshCw className="h-4 w-4" />Reset</button>
          <button onClick={() => save.mutate()} disabled={save.isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
            <Save className="h-4 w-4" /> {save.isPending ? 'Saving…' : 'Save all'}
          </button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}

      <div className="space-y-6">
        {GROUPS.filter((g) => grouped[g]).map((g) => (
          <section key={g} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-black uppercase tracking-wider text-zinc-700">{g}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {grouped[g].map((r) => (
                <label key={r.setting_key} className="block">
                  <span className="mb-1 block text-xs font-bold text-zinc-600">{r.setting_key}</span>
                  {r.value_type === 'BOOLEAN' ? (
                    <select
                      value={String(draft[r.setting_key] ?? r.setting_value)}
                      onChange={(e) => setDraft((current) => ({ ...current, [r.setting_key]: e.target.value }))}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none"
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : r.value_type === 'JSON' ? (
                    <textarea
                      rows={3}
                      value={draft[r.setting_key] ?? r.setting_value}
                      onChange={(e) => setDraft((current) => ({ ...current, [r.setting_key]: e.target.value }))}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 font-mono text-xs outline-none"
                    />
                  ) : (
                    <input
                      type={r.value_type === 'NUMBER' ? 'number' : 'text'}
                      step={r.value_type === 'NUMBER' ? '0.01' : undefined}
                      value={draft[r.setting_key] ?? r.setting_value}
                      onChange={(e) => setDraft((current) => ({ ...current, [r.setting_key]: e.target.value }))}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none"
                    />
                  )}
                  {r.description && <span className="mt-1 block text-xs text-zinc-400">{r.description}</span>}
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Screen>
  );
}
