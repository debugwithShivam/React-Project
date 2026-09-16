import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Screen, Tone } from '../adminUi';

const reports = [
  { name: 'Daily ride operations', period: '16 Sep 2026', owner: 'Ops', status: 'Completed', insight: '86.2% completion' },
  { name: 'Captain earnings', period: '01–15 Sep', owner: 'Finance', status: 'Completed', insight: '₹42.8L payouts' },
  { name: 'City performance', period: 'Q3 2026', owner: 'Strategy', status: 'Pending', insight: 'Draft in review' },
  { name: 'Cancellation reasons', period: 'Last 7 days', owner: 'Quality', status: 'Completed', insight: '6.4% cancelled' }
];

export default function Reports() {
  return (
    <Screen className="bg-indigo-50">
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">Insights</p>
        <h1 className="text-3xl font-black text-zinc-900">Reports</h1>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-4">
        {[
          ['Ride completion', '86.2%'],
          ['Avg pickup', '4.8 min'],
          ['Customer rating', '4.8 ★'],
          ['Exports this month', '18']
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-indigo-900 p-4 text-white">
            <p className="text-xs font-semibold text-indigo-200">{label}</p>
            <p className="mt-1 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <article key={report.name} className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <FileSpreadsheet className="h-8 w-8 text-indigo-600" />
              <Tone value={report.status} />
            </div>
            <h2 className="mt-3 text-xl font-black">{report.name}</h2>
            <p className="text-sm font-semibold text-zinc-500">{report.period} · {report.owner}</p>
            <p className="mt-3 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-900">{report.insight}</p>
            <button type="button" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white">
              <Download className="h-3.5 w-3.5" /> Download CSV
            </button>
          </article>
        ))}
      </div>
    </Screen>
  );
}
