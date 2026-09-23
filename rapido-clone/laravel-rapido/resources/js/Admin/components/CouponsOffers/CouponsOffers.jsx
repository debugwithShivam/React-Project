import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, TicketPercent } from 'lucide-react';
import { Screen, Tone } from '../adminUi';
import api from '../../../api/axios';

const emptyCoupon = {
  code: '', description: '', discount_type: 'FLAT', discount_value: 0, max_discount: null,
  min_fare: 0, valid_from: '', valid_until: '', usage_limit: 0, per_user_limit: 1,
  applicable_vehicle_types: '', applicable_roles: 'USER', is_active: true,
};

export default function CouponsOffers() {
  const qc = useQueryClient();
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => (await api.get('/admin/coupons', { params: { includeInactive: 'true' } })).data.coupons,
  });

  const createMut = useMutation({
    mutationFn: async (payload) => (await api.post('/admin/coupons', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });
  const updateMut = useMutation({
    mutationFn: async ({ id, payload }) => (await api.patch(`/admin/coupons/${id}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });
  const deleteMut = useMutation({
    mutationFn: async (id) => (await api.delete(`/admin/coupons/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });

  const openForm = (existing = null) => {
    const data = existing
      ? {
          ...existing,
          valid_from: existing.valid_from?.slice(0, 16) || '',
          valid_until: existing.valid_until?.slice(0, 16) || '',
          applicable_vehicle_types: existing.applicable_vehicle_types || '',
        }
      : emptyCoupon;
    const fields = [
      ['code', 'Code (e.g. FIRST50)', 'text', !existing],
      ['description', 'Description', 'text', true],
      ['discount_type', 'Type', 'select:FLAT,PERCENT', true],
      ['discount_value', 'Discount value', 'number', true],
      ['max_discount', 'Max discount (optional)', 'number', true],
      ['min_fare', 'Minimum fare', 'number', true],
      ['valid_from', 'Valid from', 'datetime-local', true],
      ['valid_until', 'Valid until', 'datetime-local', true],
      ['usage_limit', 'Total usage limit (0=unlimited)', 'number', true],
      ['per_user_limit', 'Per-user limit', 'number', true],
      ['applicable_vehicle_types', 'Vehicle types (comma-sep, blank=all)', 'text', true],
      ['applicable_roles', 'Roles (USER,DRIVER)', 'text', true],
    ];
    const buildPayload = (vals) => ({
      ...vals,
      discount_value: Number(vals.discount_value),
      max_discount: vals.max_discount ? Number(vals.max_discount) : null,
      min_fare: Number(vals.min_fare || 0),
      usage_limit: Number(vals.usage_limit || 0),
      per_user_limit: Number(vals.per_user_limit || 1),
      applicable_vehicle_types: vals.applicable_vehicle_types || null,
    });
    showFormModal({
      title: existing ? `Edit ${existing.code}` : 'New coupon',
      fields,
      initial: data,
      onSubmit: (vals) => {
        const payload = buildPayload(vals);
        if (existing) updateMut.mutate({ id: existing.id, payload });
        else createMut.mutate(payload);
      },
    });
  };

  return (
    <Screen className="bg-pink-50/60">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-700">Promotions</p>
          <h1 className="text-3xl font-black text-zinc-900">Coupons & offers</h1>
        </div>
        <button onClick={() => openForm()} className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-pink-700">
          <Plus className="h-4 w-4" /> New coupon
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-pink-50 text-xs font-black uppercase text-pink-900">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Discount</th>
              <th className="px-4 py-3 text-left">Min fare</th>
              <th className="px-4 py-3 text-left">Validity</th>
              <th className="px-4 py-3 text-left">Usage</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-400">Loading…</td></tr>}
            {!isLoading && coupons.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-400">No coupons yet. Create your first offer.</td></tr>}
            {coupons.map((c) => {
              const expired = new Date(c.valid_until) < new Date();
              return (
                <tr key={c.id} className="border-t border-pink-50 hover:bg-pink-50/40">
                  <td className="px-4 py-3">
                    <p className="font-black">{c.code}</p>
                    <p className="text-xs text-zinc-500">{c.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    {c.discount_type === 'FLAT' ? `₹${c.discount_value}` : `${c.discount_value}%`}
                    {c.max_discount ? <span className="text-xs text-zinc-500"> (max ₹{c.max_discount})</span> : null}
                  </td>
                  <td className="px-4 py-3">₹{c.min_fare}</td>
                  <td className="px-4 py-3 text-xs">
                    {new Date(c.valid_from).toLocaleDateString()} → {new Date(c.valid_until).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{c.used_count} / {c.usage_limit || '∞'}</td>
                  <td className="px-4 py-3">
                    <Tone value={!c.is_active ? 'Inactive' : expired ? 'Cancelled' : 'Active'} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openForm(c)} className="mr-2 inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1 text-xs font-bold hover:bg-zinc-200"><Pencil className="h-3 w-3" />Edit</button>
                    <button onClick={() => { if (confirm(`Delete ${c.code}?`)) deleteMut.mutate(c.id); }} className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700 hover:bg-rose-200"><Trash2 className="h-3 w-3" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Screen>
  );
}

// ---------- lightweight modal form helper ----------
export function showFormModal({ title, fields, initial, onSubmit }) {
  const root = document.createElement('div');
  root.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4';
  const form = document.createElement('form');
  form.className = 'max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl';
  form.innerHTML = `<h3 class="mb-4 text-xl font-black">${title}</h3>`;
  const inputs = {};
  for (const [key, label, type, required] of fields) {
    const wrap = document.createElement('label');
    wrap.className = 'mb-3 block';
    wrap.innerHTML = `<span class="mb-1 block text-xs font-bold uppercase text-zinc-500">${label}</span>`;
    let el;
    if (String(type).startsWith('select:')) {
      el = document.createElement('select');
      for (const opt of String(type).slice(7).split(',')) {
        const o = document.createElement('option');
        o.value = opt; o.textContent = opt;
        el.appendChild(o);
      }
    } else if (type === 'textarea') {
      el = document.createElement('textarea');
      el.rows = 4;
    } else {
      el = document.createElement('input');
      el.type = type;
    }
    el.className = 'w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-pink-500';
    el.value = initial?.[key] ?? '';
    if (required) el.required = true;
    inputs[key] = el;
    wrap.appendChild(el);
    form.appendChild(wrap);
  }
  const actions = document.createElement('div');
  actions.className = 'mt-4 flex justify-end gap-2';
  actions.innerHTML = `<button type="button" class="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold" data-act="cancel">Cancel</button>
                       <button type="submit" class="rounded-xl bg-pink-600 px-4 py-2 text-sm font-bold text-white">Save</button>`;
  form.appendChild(actions);
  root.appendChild(form);
  document.body.appendChild(root);

  const close = () => root.remove();
  actions.querySelector('[data-act=cancel]').onclick = close;
  root.onclick = (e) => { if (e.target === root) close(); };
  form.onsubmit = (e) => {
    e.preventDefault();
    const vals = Object.fromEntries(Object.entries(inputs).map(([k, el]) => [k, el.value]));
    close();
    onSubmit(vals);
  };
}
