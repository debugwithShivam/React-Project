import React from 'react';

export function Screen({ children, className = '' }) {
  return <div className={`min-h-[calc(100vh-4.3rem)] p-4 md:p-6 lg:p-8 ${className}`}>{children}</div>;
}

export function Initials({ name, className = 'bg-brand-dark text-brand-yellow', size = 'md' }) {
  const letters = String(name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const sizes = { md: 'h-10 w-10 text-xs', lg: 'h-14 w-14 text-base' };
  return <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-black ${sizes[size] || sizes.md} ${className}`}>{letters}</span>;
}

export function Tone({ value }) {
  const map = {
    Active: 'bg-emerald-100 text-emerald-800',
    Online: 'bg-emerald-100 text-emerald-800',
    Completed: 'bg-emerald-100 text-emerald-800',
    Approved: 'bg-emerald-100 text-emerald-800',
    Paid: 'bg-emerald-100 text-emerald-800',
    Resolved: 'bg-emerald-100 text-emerald-800',
    Live: 'bg-emerald-100 text-emerald-800',
    Pending: 'bg-amber-100 text-amber-800',
    Scheduled: 'bg-sky-100 text-sky-800',
    Ongoing: 'bg-indigo-100 text-indigo-800',
    Urgent: 'bg-red-100 text-red-800',
    Rejected: 'bg-red-100 text-red-800',
    Failed: 'bg-red-100 text-red-800',
    Cancelled: 'bg-rose-100 text-rose-800',
    Inactive: 'bg-gray-100 text-gray-600',
    Offline: 'bg-gray-100 text-gray-600',
    Paused: 'bg-gray-100 text-gray-600',
    Draft: 'bg-slate-100 text-slate-600'
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${map[value] || 'bg-slate-100 text-slate-700'}`}>{value}</span>;
}
