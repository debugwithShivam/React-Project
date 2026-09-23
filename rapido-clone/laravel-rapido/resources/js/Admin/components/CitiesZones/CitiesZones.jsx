import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { Screen } from '../adminUi';
import api from '../../../api/axios';
import { showFormModal } from '../CouponsOffers/CouponsOffers';

export default function CitiesZones() {
  const qc = useQueryClient();
  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['admin-cities'],
    queryFn: async () => (await api.get('/admin/cities')).data.cities,
  });

  const createMut = useMutation({ mutationFn: (p) => api.post('/admin/cities', p), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-cities'] }) });
  const updateMut = useMutation({ mutationFn: ({ id, p }) => api.patch(`/admin/cities/${id}`, p), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-cities'] }) });
  const deleteMut = useMutation({ mutationFn: (id) => api.delete(`/admin/cities/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-cities'] }) });

  const openForm = (c = null) => {
    showFormModal({
      title: c ? `Edit ${c.name}` : 'New city',
      fields: [
        ['name', 'City name', 'text', true],
        ['state', 'State', 'text', false],
        ['country', 'Country', 'text', false],
        ['center_lat', 'Center latitude', 'number', false],
        ['center_lng', 'Center longitude', 'number', false],
        ['radius_km', 'Service radius (km)', 'number', true],
      ],
      initial: c || { name: '', state: '', country: 'India', center_lat: '', center_lng: '', radius_km: 25 },
      onSubmit: (vals) => {
        const payload = { ...vals, center_lat: vals.center_lat ? Number(vals.center_lat) : null, center_lng: vals.center_lng ? Number(vals.center_lng) : null, radius_km: Number(vals.radius_km) };
        if (c) updateMut.mutate({ id: c.id, p: payload });
        else createMut.mutate(payload);
      },
    });
  };

  return (
    <Screen className="bg-teal-50/60">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">Coverage</p>
          <h1 className="text-3xl font-black text-zinc-900">Cities & zones</h1>
        </div>
        <button onClick={() => openForm()} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-teal-700">
          <Plus className="h-4 w-4" /> Add city
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && <p className="text-sm text-zinc-400">Loading…</p>}
        {cities.map((c) => (
          <div key={c.id} className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="flex items-center gap-2 text-lg font-black"><MapPin className="h-5 w-5 text-teal-600" />{c.name}</p>
                <p className="text-xs text-zinc-500">{c.state}, {c.country}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openForm(c)} className="rounded-lg bg-zinc-100 p-2 hover:bg-zinc-200"><Pencil className="h-3 w-3" /></button>
                <button onClick={() => { if (confirm(`Delete ${c.name}?`)) deleteMut.mutate(c.id); }} className="rounded-lg bg-rose-100 p-2 text-rose-700 hover:bg-rose-200"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              {c.center_lat && c.center_lng ? `Center: ${c.center_lat}, ${c.center_lng}` : 'Center not set'}
            </p>
            <p className="mt-1 text-sm font-bold text-teal-700">Radius: {c.radius_km} km</p>
            <p className="mt-2 text-xs">{c.is_active ? <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700">Active</span> : <span className="rounded bg-zinc-100 px-2 py-0.5 font-bold text-zinc-500">Inactive</span>}</p>
          </div>
        ))}
      </div>
    </Screen>
  );
}
