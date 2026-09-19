import React from 'react';
import { Outlet } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Layout from './AdminRoute/Layout';
import i18n from '../i18n';

export default function Admin() {
  const { t } = useTranslation();

  const handleLanguageChange = (event) => {
    const language = event.target.value;
    i18n.changeLanguage(language);
    localStorage.setItem('admin-language', language);
  };

  return (
    <div lang={i18n.language} className="min-h-screen bg-zinc-100">
      <Layout />
      <div className="ml-64 flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-10 flex h-[4.3rem] items-center gap-4 border-b border-zinc-200 bg-white/95 px-5 backdrop-blur">
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              placeholder="Search rides, captains, tickets..."
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-yellow focus:bg-white focus:ring-2 focus:ring-yellow-100"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live ops
            </span>
            <label className="sr-only" htmlFor="admin-language">{t('language')}</label>
            <select
              id="admin-language"
              value={i18n.language}
              onChange={handleLanguageChange}
              className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm font-semibold outline-none"
            >
              <option value="hi">हिन्दी</option>
              <option value="en">English</option>
            </select>
            <button type="button" className="relative rounded-full border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-zinc-200 py-1 pl-1 pr-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-dark text-xs font-black text-brand-yellow">SA</span>
              <span className="hidden text-xs font-bold text-zinc-800 sm:block">Super Admin</span>
            </div>
          </div>
        </header>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
