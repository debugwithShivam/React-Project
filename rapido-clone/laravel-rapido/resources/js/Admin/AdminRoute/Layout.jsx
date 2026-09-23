import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ListOrdered,
  Radio,
  Users,
  Bike,
  Car,
  FileCheck2,
  MapPinned,
  TicketPercent,
  Wallet,
  IndianRupee,
  BadgeIndianRupee,
  BarChart3,
  Star,
  Bell,
  Headset,
  Shield,
  Settings,
  Banknote,
  FileText,
  Siren
} from 'lucide-react';
import logo from '../../image/topbar.png'

const groups = [
  {
    label: 'Operations',
    items: [
      { to: 'Dashboard', icon: LayoutDashboard },
      { to: 'AllBookRide', icon: ListOrdered },
      { to: 'Rides', icon: Radio },
      { to: 'ScheduledCabs', icon: Radio },
      { to: 'CustomCabs', icon: Car }
    ]
  },
  {
    label: 'People',
    items: [
      { to: 'Customers', icon: Users },
      { to: 'Captains', icon: Bike },
      { to: 'Drivers', icon: Car },
      { to: 'DriverDocuments', icon: FileCheck2 },
      { to: 'RiderHistory', icon: ListOrdered },
      { to: 'DriverRideHistory', icon: ListOrdered }
    ]
  },
  {
    label: 'City & Pricing',
    items: [
      { to: 'CitiesZones', icon: MapPinned },
      { to: 'Pricing', icon: BadgeIndianRupee },
      { to: 'CouponsOffers', icon: TicketPercent }
    ]
  },
  {
    label: 'Finance',
    items: [
      { to: 'Payments', icon: Wallet },
      { to: 'Wallet', icon: Wallet },
      { to: 'Revenue', icon: IndianRupee },
      { to: 'Refunds', icon: IndianRupee },
      { to: 'Payouts', icon: Banknote },
      { to: 'Reports', icon: BarChart3 }
    ]
  },
  {
    label: 'Care & Access',
    items: [
      { to: 'Reviews', icon: Star },
      { to: 'Support', icon: Headset },
      { to: 'SosAlerts', icon: Siren },
      { to: 'Notifications', icon: Bell },
      { to: 'DynamicPages', icon: FileText },
      { to: 'StaffRoles', icon: Shield },
      { to: 'Settings', icon: Settings },
      { to: 'Password', icon: Shield }
    ]
  }
];

export default function Layout() {
  const { t } = useTranslation();

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col border-r border-zinc-800 bg-brand-dark text-white">
      <div className="flex h-[4.3rem] items-center gap-2 border-b border-white/10 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-dark">
          <img src={logo} alt="" />
        </span>
        <div>
          <p className="text-lg font-black leading-none tracking-tight">Sawaari</p>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-yellow">Admin console</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-brand-yellow text-brand-dark shadow-yellow-glow'
                          : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {t(`nav.${item.to}`)}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
