import React, { useEffect, useState } from 'react';
import { Ban, Check, FileText, Eye, X } from 'lucide-react';
import { Initials, Screen, Tone } from '../adminUi';
import api from '../../../api/axios';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export default function DriverDocuments() {
  const [drivers, setDrivers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/drivers', { params: { status: statusFilter || undefined } });
      const items = response.data.drivers || [];
      setDrivers(items);
      if (items[0]) selectDriver(items[0]);
      else setSelected(null);
    } catch (error) {
      console.error('DRIVER QUEUE ERROR', error);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadDrivers(); }, [statusFilter]);

  const selectDriver = async (driver) => {
    try {
      const response = await api.get(`/admin/drivers/${driver.id}`);
      setSelected(response.data.driver);
    } catch (error) { console.error('DRIVER DETAILS ERROR', error); }
  };

  const review = async (status) => {
    if (!selected) return;
    if (status === 'REJECTED' && !rejectionReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }
    setSaving(true);
    try {
      const response = await api.patch(`/admin/drivers/${selected.id}/review`, { status, rejectionReason });
      setSelected(response.data.driver);
      setDrivers((items) => items.map((item) => item.id === selected.id ? { ...item, status } : item));
      setRejectionReason('');
    } catch (error) { console.error('DRIVER REVIEW ERROR', error); }
    finally { setSaving(false); }
  };

  const openDocPreview = async (doc) => {
    try {
      const res = await api.get(`/admin/drivers/documents/${doc.id}/blob`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      setPreviewDoc({ ...doc, url });
    } catch (e) {
      alert('Failed to load document');
    }
  };

  return (
    <Screen className="bg-sky-50">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">KYC desk</p>
        <h1 className="text-3xl font-black text-zinc-900">Driver documents</h1>
        <p className="mt-1 text-sm text-zinc-500">Approve captains only after license, RC and identity checks.</p>
      </div>

      <div className="mb-4 flex gap-2">
        {['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
          <button key={s || 'ALL'} onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold ${statusFilter === s ? 'bg-sky-700 text-white' : 'bg-white border border-sky-200 text-zinc-600'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <aside className="space-y-3">
          {loading && <p className="p-4 text-sm text-zinc-500">Loading driver applications…</p>}
          {!loading && drivers.length === 0 && <p className="p-4 text-sm text-zinc-500">No driver applications found.</p>}
          {drivers.map((item) => (
            <button key={item.id} type="button" onClick={() => selectDriver(item)}
                    className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm ${selected?.id === item.id ? 'border-sky-500 ring-2 ring-sky-100' : 'border-sky-100'}`}>
              <div className="flex items-center justify-between">
                <p className="font-black">{item.name}</p>
                <Tone value={item.status === 'APPROVED' ? 'Approved' : item.status === 'PENDING' ? 'Pending' : 'Rejected'} />
              </div>
              <p className="mt-1 text-xs font-semibold text-zinc-500">Driver #{item.id} · {item.city}</p>
              <p className="mt-1 text-xs text-zinc-500">{item.vehicle_type} · {item.vehicle_plate}</p>
              <p className="mt-1 text-xs text-zinc-400">{item.document_count || 0} docs · {item.pending_document_count || 0} pending</p>
            </button>
          ))}
        </aside>

        {selected && (
          <section className="rounded-3xl border border-sky-100 bg-white p-6 shadow-card">
            <div className="flex items-center gap-3">
              <Initials name={selected.name} className="bg-sky-700 text-white" />
              <div className="flex-1">
                <p className="text-xl font-black">{selected.name}</p>
                <p className="text-sm text-zinc-500">{selected.phone} · {selected.email}</p>
                <p className="text-sm text-zinc-500">{selected.city} · {selected.vehicle_model} · {selected.vehicle_plate}</p>
              </div>
              <Tone value={selected.status === 'APPROVED' ? 'Approved' : selected.status === 'PENDING' ? 'Pending' : 'Rejected'} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <InfoBox k="License" v={selected.driving_license} />
              <InfoBox k="Aadhaar" v={selected.aadhaar_number || '—'} />
              <InfoBox k="UPI" v={selected.payout_upi || '—'} />
              <InfoBox k="Rating" v={`★ ${Number(selected.rating_avg || 0).toFixed(2)} (${selected.rating_count || 0})`} />
            </div>

            <h3 className="mt-6 text-sm font-black uppercase tracking-wide text-zinc-700">Documents ({selected.documents?.length || 0})</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {(selected.documents || []).map((doc) => (
                <div key={doc.id} className="rounded-2xl border border-dashed border-sky-200 bg-sky-50 p-4">
                  <div className="flex items-start justify-between">
                    <FileText className="h-5 w-5 text-sky-700" />
                    <Tone value={doc.verification_status === 'APPROVED' ? 'Approved' : doc.verification_status === 'REJECTED' ? 'Rejected' : 'Pending'} />
                  </div>
                  <p className="mt-3 text-sm font-black">{doc.document_type}{doc.document_side ? ` · ${doc.document_side}` : ''}</p>
                  <p className="text-xs text-zinc-500">{doc.file_name}</p>
                  <button onClick={() => openDocPreview(doc)}
                          className="mt-3 inline-flex items-center gap-1 rounded-lg bg-sky-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-800">
                    <Eye className="h-3 w-3" /> View
                  </button>
                </div>
              ))}
              {(selected.documents || []).length === 0 && <p className="col-span-3 text-sm text-zinc-400">No documents uploaded.</p>}
            </div>

            {selected.status === 'PENDING' && (
              <div className="mt-6">
                <label className="mb-3 block">
                  <span className="mb-1 block text-xs font-bold uppercase text-zinc-500">Rejection reason (required to reject)</span>
                  <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={2}
                            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
                            placeholder="e.g. Driving license image is blurry, please re-upload" />
                </label>
                <div className="flex flex-wrap gap-3">
                  <button type="button" disabled={saving} onClick={() => review('APPROVED')}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
                    <Check className="h-4 w-4" /> Approve KYC
                  </button>
                  <button type="button" disabled={saving} onClick={() => review('REJECTED')}
                          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50">
                    <Ban className="h-4 w-4" /> Reject & request reupload
                  </button>
                </div>
              </div>
            )}

            {selected.rejection_reason && (
              <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
                <strong>Rejection reason:</strong> {selected.rejection_reason}
              </div>
            )}

            {selected.recentRides?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-black uppercase tracking-wide text-zinc-700">Recent rides</h3>
                <div className="mt-2 space-y-1">
                  {selected.recentRides.map((r) => (
                    <p key={r.id} className="rounded-lg bg-zinc-50 px-3 py-2 text-xs">
                      #{r.id} · {r.status} · ₹{r.final_fare || r.estimated_fare || '—'} · {r.pickup_address} → {r.dropoff_address}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => { URL.revokeObjectURL(previewDoc.url); setPreviewDoc(null); }}>
          <div className="relative max-h-[90vh] max-w-4xl overflow-auto rounded-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <button className="absolute right-2 top-2 rounded-full bg-zinc-100 p-2 hover:bg-zinc-200" onClick={() => { URL.revokeObjectURL(previewDoc.url); setPreviewDoc(null); }}>
              <X className="h-4 w-4" />
            </button>
            <p className="mb-3 font-black">{previewDoc.document_type} · {previewDoc.document_side || ''}</p>
            {previewDoc.file_name?.toLowerCase().endsWith('.pdf') ? (
              <iframe src={previewDoc.url} title="doc" className="h-[70vh] w-full" />
            ) : (
              <img src={previewDoc.url} alt={previewDoc.file_name} className="max-h-[80vh] object-contain" />
            )}
          </div>
        </div>
      )}
    </Screen>
  );
}

const InfoBox = ({ k, v }) => (
  <div className="rounded-xl bg-zinc-50 p-3">
    <p className="text-xs text-zinc-500">{k}</p>
    <p className="mt-0.5 text-sm font-bold">{v}</p>
  </div>
);
