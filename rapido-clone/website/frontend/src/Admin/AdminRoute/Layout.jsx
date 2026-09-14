import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  const navItems = [
    "Dashboard",
    "AllBookRide",
    "Captains",
    "CitiesZones",
    "CouponsOffers",
    "Customers",
    "DriverDocuments",
    "Drivers",
    "Notifications",
    "Payments",
    "Pricing",
    "Reports",
    "Revenue",
    "Reviews",
    "Rides",
    "Settings",
    "StaffRoles",
    "Support",
  ];

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200">

        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">
            Rapido
          </h1>

          <span className="ml-2 rounded bg-gray-100 px-2 py-1 text-xs font-semibold">
            ADMIN
          </span>
        </div>

        {/* Links */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-64px)]">
          {navItems.map((item) => (
            <NavLink
              key={item}
              to={item}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              {item}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="ml-64 min-h-screen p-6">
        <Outlet />
      </main>

    </div>
  );
}