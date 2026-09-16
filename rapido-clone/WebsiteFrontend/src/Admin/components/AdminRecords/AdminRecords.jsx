import React, { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { Screen, Tone } from '../adminUi';

const configs = {
  Wallet: {
    eyebrow: 'Finance', title: 'Wallet ledger', description: 'Review rider wallet balances, credits and debits.',
    columns: ['Rider', 'Wallet balance', 'Last activity', 'Status'],
    rows: [
      ['Aarav Mehta', '₹1,240', 'Added ₹500 · 10:42 AM', 'Active'],
      ['Meera Shah', '₹180', 'Ride debit · 10:05 AM', 'Active'],
      ['Rahul Sharma', '₹0', 'Refund requested · 09:50 AM', 'Pending'],
      ['Pooja Verma', '₹2,860', 'Added ₹1,000 · Yesterday', 'Active']
    ]
  },
  ScheduledCabs: {
    eyebrow: 'Operations', title: 'Scheduled cabs', description: 'Manage upcoming cab bookings and driver assignments.',
    columns: ['Booking', 'Rider', 'Pickup time', 'Vehicle', 'Status'],
    rows: [
      ['SCH-2048', 'Ananya Rao', 'Today · 6:30 PM', 'Cab · Sedan', 'Scheduled'],
      ['SCH-2047', 'Vikram Singh', 'Tomorrow · 7:15 AM', 'Cab · SUV', 'Pending'],
      ['SCH-2041', 'Neha Kapoor', 'Tomorrow · 9:00 AM', 'Cab · Sedan', 'Scheduled'],
      ['SCH-2032', 'Imran Khan', '18 Sep · 5:45 AM', 'Cab · Sedan', 'Completed']
    ]
  },
  CustomCabs: {
    eyebrow: 'Operations', title: 'Custom cab requests', description: 'Review special vehicle requests before dispatch.',
    columns: ['Request', 'Rider', 'Requirement', 'Estimate', 'Status'],
    rows: [
      ['CAB-918', 'Sonal Jain', '6-seater · Airport', '₹1,240', 'Pending'],
      ['CAB-914', 'Kabir Shah', 'Child seat · Sedan', '₹680', 'Approved'],
      ['CAB-909', 'Ritu Menon', 'Wheelchair accessible', '₹920', 'Scheduled'],
      ['CAB-901', 'Dev Patel', 'Premium SUV', '₹1,850', 'Completed']
    ]
  },
  RiderHistory: {
    eyebrow: 'People', title: 'Rider ride history', description: 'Search completed and cancelled trips for any rider.',
    columns: ['Ride', 'Rider', 'Route', 'Fare', 'Status'],
    rows: [
      ['SW-10428', 'Aarav Mehta', 'Indiranagar → Koramangala', '₹84', 'Completed'],
      ['SW-10425', 'Meera Shah', 'Electronic City → Silk Board', '₹96', 'Cancelled'],
      ['SW-10421', 'Pooja Verma', 'HSR Layout → MG Road', '₹142', 'Completed'],
      ['SW-10412', 'Rahul Sharma', 'Whitefield → Marathahalli', '₹118', 'Completed']
    ]
  },
  DriverRideHistory: {
    eyebrow: 'People', title: 'Driver ride history', description: 'Review driver trips, earnings and service quality.',
    columns: ['Ride', 'Driver', 'Vehicle', 'Earnings', 'Status'],
    rows: [
      ['SW-10428', 'Ramesh Kumar', 'Bike · KA-03-AB-2211', '₹62', 'Completed'],
      ['SW-10425', 'Sanjay Patil', 'Bike · MH-12-JK-7732', '₹0', 'Cancelled'],
      ['SW-10421', 'Vikram Singh', 'Auto · KA-05-CD-8801', '₹108', 'Completed'],
      ['SW-10412', 'Imran Khan', 'Cab · TN-09-XY-4410', '₹182', 'Completed']
    ]
  },
  Refunds: {
    eyebrow: 'Finance', title: 'Refunds', description: 'Approve, reject and track rider refund requests.',
    columns: ['Request', 'Rider', 'Reason', 'Amount', 'Status'],
    rows: [
      ['RFD-2291', 'Meera Shah', 'Ride cancelled after payment', '₹96', 'Pending'],
      ['RFD-2288', 'Rahul Sharma', 'Duplicate wallet debit', '₹142', 'Approved'],
      ['RFD-2281', 'Aarav Mehta', 'Driver did not arrive', '₹84', 'Paid'],
      ['RFD-2274', 'Pooja Verma', 'Fare adjustment', '₹38', 'Rejected']
    ]
  }
};

export default function AdminRecords({ type }) {
  const config = configs[type];
  const [query, setQuery] = useState('');
  const rows = useMemo(() => config.rows.filter((row) => row.join(' ').toLowerCase().includes(query.toLowerCase())), [config, query]);

  return (
    <Screen className="bg-zinc-50">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{config.eyebrow}</p><h1 className="text-3xl font-black text-zinc-900">{config.title}</h1><p className="mt-1 text-sm text-zinc-500">{config.description}</p></div>
        <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-brand-dark px-4 py-2.5 text-sm font-bold text-brand-yellow"><Download className="h-4 w-4" /> Export</button>
      </div>
      <div className="mb-4 flex max-w-sm items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5"><Search className="h-4 w-4 text-zinc-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records..." className="w-full bg-transparent text-sm outline-none" /></div>
      <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white shadow-sm"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-zinc-50 text-[11px] uppercase tracking-wider text-zinc-500"><tr>{config.columns.map((column) => <th key={column} className="px-5 py-3 font-black">{column}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row[0]} className="border-t border-zinc-100"><td className="px-5 py-4 font-black text-zinc-900">{row[0]}</td>{row.slice(1).map((value, index) => <td key={`${row[0]}-${index}`} className="px-5 py-4 font-semibold text-zinc-600">{index === row.length - 2 ? <Tone value={value} /> : value}</td>)}</tr>)}</tbody></table>{rows.length === 0 && <p className="p-8 text-center text-sm font-semibold text-zinc-500">No records found.</p>}</div>
    </Screen>
  );
}