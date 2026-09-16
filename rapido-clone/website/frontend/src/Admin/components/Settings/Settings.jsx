import React, { useEffect, useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import { saveSiteContent } from '../../../api/content';
import { useSiteContent } from '../../../context/SiteContentContext';
import { Screen } from '../adminUi';

const tabs = ['Brand', 'Homepage', 'Ride pricing', 'Admin access'];

export default function Settings() {
  const { content, refreshContent } = useSiteContent();
  const [form, setForm] = useState(content);
  const [status, setStatus] = useState('');
  const [tab, setTab] = useState('Brand');
  const [withdrawal, setWithdrawal] = useState({ enabled: true, minimum: 500, reviewDays: 2, autoApprove: false });

  useEffect(() => setForm(content), [content]);

  const update = (section, field, value) => setForm((current) => ({ ...current, [section]: { ...current[section], [field]: value } }));
  const updateVehicle = (id, field, value) => setForm((current) => ({
    ...current,
    vehicles: current.vehicles.map((vehicle) => vehicle.id === id ? { ...vehicle, [field]: field === 'basePrice' || field === 'perKmRate' ? Number(value) : value } : vehicle)
  }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('saving');
    try {
      refreshContent(await saveSiteContent(form));
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  return (
    <Screen className="bg-zinc-50">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Website CMS</p>
            <h1 className="text-3xl font-black">Settings</h1>
          </div>
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand-dark px-4 py-2.5 text-sm font-bold text-brand-yellow">
            <Save className="h-4 w-4" /> Save changes
          </button>
        </div>

        {status === 'saved' && <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Published to the public website.</div>}
        {status === 'error' && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">Could not save. Is the backend running?</div>}

        <div className="mb-4 flex gap-2">
          {tabs.map((item) => (
            <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-full px-4 py-1.5 text-sm font-bold ${tab === item ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600'}`}>{item}</button>
          ))}
        </div>

        {tab === 'Brand' && (
          <section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="font-black">Brand identity</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold">Name<input className="mt-1 w-full rounded-xl border p-2.5 font-normal" value={form.brand.name} onChange={(event) => update('brand', 'name', event.target.value)} /></label>
              <label className="text-sm font-semibold">Tagline<input className="mt-1 w-full rounded-xl border p-2.5 font-normal" value={form.brand.tagline} onChange={(event) => update('brand', 'tagline', event.target.value)} /></label>
            </div>
          </section>
        )}

        {tab === 'Homepage' && (
          <section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="font-black">Homepage & support</h2>
            <label className="block text-sm font-semibold">Hero title<input className="mt-1 w-full rounded-xl border p-2.5 font-normal" value={form.home.heroTitle} onChange={(event) => update('home', 'heroTitle', event.target.value)} /></label>
            <label className="block text-sm font-semibold">Hero description<textarea rows="4" className="mt-1 w-full rounded-xl border p-2.5 font-normal" value={form.home.heroDescription} onChange={(event) => update('home', 'heroDescription', event.target.value)} /></label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold">Support phone<input className="mt-1 w-full rounded-xl border p-2.5 font-normal" value={form.home.supportPhone} onChange={(event) => update('home', 'supportPhone', event.target.value)} /></label>
              <label className="text-sm font-semibold">Support email<input className="mt-1 w-full rounded-xl border p-2.5 font-normal" value={form.home.supportEmail} onChange={(event) => update('home', 'supportEmail', event.target.value)} /></label>
            </div>
          </section>
        )}

        {tab === 'Ride pricing' && (
          <section className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="font-black">Public fare cards</h2>
            {form.vehicles.map((vehicle) => (
              <div key={vehicle.id} className="grid gap-3 rounded-2xl bg-zinc-50 p-4 md:grid-cols-[1fr_140px_140px] md:items-center">
                <span className="font-black">{vehicle.name}</span>
                <label className="text-xs font-bold text-zinc-500">Base fare<input type="number" min="0" className="mt-1 w-full rounded-lg border p-2 text-sm font-normal" value={vehicle.basePrice} onChange={(event) => updateVehicle(vehicle.id, 'basePrice', event.target.value)} /></label>
                <label className="text-xs font-bold text-zinc-500">Per km<input type="number" min="0" className="mt-1 w-full rounded-lg border p-2 text-sm font-normal" value={vehicle.perKmRate} onChange={(event) => updateVehicle(vehicle.id, 'perKmRate', event.target.value)} /></label>
              </div>
            ))}
          </section>
        )}

        {tab === 'Admin access' && (
          <section className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div><h2 className="font-black">Withdrawal controls</h2><p className="mt-1 text-sm text-zinc-500">Set the rules used when captains request a payout.</p></div>
            <label className="flex items-center justify-between rounded-xl bg-zinc-50 p-4 text-sm font-bold">Allow captain withdrawals<input type="checkbox" checked={withdrawal.enabled} onChange={(event) => setWithdrawal({ ...withdrawal, enabled: event.target.checked })} className="h-5 w-5 accent-brand-yellow" /></label>
            <div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-semibold">Minimum withdrawal (₹)<input type="number" min="0" value={withdrawal.minimum} onChange={(event) => setWithdrawal({ ...withdrawal, minimum: event.target.value })} className="mt-1 w-full rounded-xl border p-2.5 font-normal" /></label><label className="text-sm font-semibold">Review window (days)<input type="number" min="0" value={withdrawal.reviewDays} onChange={(event) => setWithdrawal({ ...withdrawal, reviewDays: event.target.value })} className="mt-1 w-full rounded-xl border p-2.5 font-normal" /></label></div>
            <label className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold">Auto-approve withdrawals below ₹5,000<input type="checkbox" checked={withdrawal.autoApprove} onChange={(event) => setWithdrawal({ ...withdrawal, autoApprove: event.target.checked })} className="h-5 w-5 accent-brand-yellow" /></label>
          </section>
        )}
      </form>
    </Screen>
  );
}
