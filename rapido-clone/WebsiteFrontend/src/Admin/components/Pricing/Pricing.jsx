import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Bike } from 'lucide-react';
import { Screen } from '../adminUi';
import api from '../../../api/axios';
import { showFormModal } from '../CouponsOffers/CouponsOffers';

const empty = {
  code: '', name: '', description: '', capacity: 1, base_fare: 30, per_km_fare: 8, per_min_fare: 1.5,
  minimum_fare: 30, cancellation_fee: 10, commission_percent: 15, sort_order: 0, is_active: true,
};

export default function Pricing() {
  const qc = useQueryClient();
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['admin-vehicles'],
    queryFn: async () => (await api.get('/admin/vehicle-types')).data.vehicles,
  });

  const createMut = useMutation({ mutationFn: (p) => api.post('/admin/vehicle-types', p), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-vehicles'] }) });
  const updateMut = useMutation({ mutationFn: ({ id, p }) => api.patch(`/admin/vehicle-types/${id}`, p), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-vehicles'] }) });
  const deleteMut = useMutation({ mutationFn: (id) => api.delete(`/admin/vehicle-types/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-vehicles'] }) });

  const openForm = (v = null) => {
    showFormModal({
      title: v ? `Edit ${v.code}` : 'New vehicle type',
      fields: [
        ['code', 'Code (BIKE/AUTO/CAB)', 'text', !v],
        ['name', 'Display name', 'text', true],
        ['description', 'Description', 'text', false],
        ['capacity', 'Capacity', 'number', true],
        ['base_fare', 'Base fare (₹)', 'number', true],
        ['per_km_fare', 'Per km (₹)', 'number', true],
        ['per_min_fare', 'Per minute (₹)', 'number', true],
        ['minimum_fare', 'Minimum fare (₹)', 'number', true],
        ['cancellation_fee', 'Cancellation fee (₹)', 'number', true],
        ['commission_percent', 'Commission %', 'number', true],
        ['sort_order', 'Sort order', 'number', false],
      ],
      initial: v || empty,
      onSubmit: (vals) => {
        const payload = { ...vals, capacity: Number(vals.capacity), base_fare: Number(vals.base_fare), per_km_fare: Number(vals.per_km_fare), per_min_fare: Number(vals.per_min_fare), minimum_fare: Number(vals.minimum_fare), cancellation_fee: Number(vals.cancellation_fee), commission_percent: Number(vals.commission_percent), sort_order: Number(vals.sort_order || 0) };
        if (v) updateMut.mutate({ id: v.id, p: payload });
        else createMut.mutate(payload);
      },
    });
  };

  return (
    <Screen className="bg-amber-50/60">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Catalog</p>
          <h1 className="text-3xl font-black text-zinc-900">Vehicle types & pricing</h1>
        </div>
        <button onClick={() => openForm()} className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-amber-700">
          <Plus className="h-4 w-4" /> New vehicle
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && <p className="text-sm text-zinc-400">Loading…</p>}
        {vehicles.map((v) => (
          <div key={v.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${v.is_active ? 'border-amber-100' : 'border-zinc-200 opacity-60'}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="flex items-center gap-2 text-lg font-black"><Bike className="h-5 w-5 text-amber-600" />{v.name}</p>
                <p className="text-xs font-bold uppercase text-zinc-400">{v.code} · capacity {v.capacity}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openForm(v)} className="rounded-lg bg-zinc-100 p-2 hover:bg-zinc-200"><Pencil className="h-3 w-3" /></button>
                <button onClick={() => { if (confirm(`Delete ${v.code}?`)) deleteMut.mutate(v.id); }} className="rounded-lg bg-rose-100 p-2 text-rose-700 hover:bg-rose-200"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
            {v.description && <p className="mt-2 text-xs text-zinc-500">{v.description}</p>}
            <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <Row k="Base fare" v={`₹${v.base_fare}`} />
              <Row k="Per km" v={`₹${v.per_km_fare}`} />
              <Row k="Per min" v={`₹${v.per_min_fare}`} />
              <Row k="Minimum" v={`₹${v.minimum_fare}`} />
              <Row k="Cancel fee" v={`₹${v.cancellation_fee}`} />
              <Row k="Commission" v={`${v.commission_percent}%`} />
            </dl>
          </div>
        ))}
      </div>
    </Screen>
  );
}

const Row = ({ k, v }) => (
  <div className="rounded-lg bg-amber-50 px-2 py-1.5">
    <dt className="text-zinc-500">{k}</dt>
    <dd className="font-black text-amber-900">{v}</dd>
  </div>
);
