import React, { useMemo, useState } from "react";
import {
  ShoppingCart,
  Globe,
  Moon,
  Sun,
  LogOut,
  Mail,
  AtSign,
  Package,
  ChevronDown,
  Bell,
  ShieldCheck,
  Trash2,
  Pencil,
  Check,
  MoreHorizontal,
  Truck,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import OrderProduct from "../Orders/Orderproductdata";
import useCartProduct from "./useCartProduct"; // path apne project ke hisab se adjust karein

const formatINR = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function Setting() {
  const {
    data: orderData,
    isLoading: ordersLoading,
    isError: ordersError,
  } = OrderProduct();

  const {
    data: cartData,
    isLoading: cartLoading,
    isError: cartError,
  } = useCartProduct();

  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("English");
  const [notifications, setNotifications] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedKey, setSelectedKey] = useState(null);

  const isDark = theme === "dark";

  const orders = orderData || [];
  const cart = cartData || [];

  const combinedItems = useMemo(() => {
    const orderItems = orders.map((o) => ({
      key: `order-${o.order_id}`,
      type: "ordered",
      id: `#OD-${o.order_id}`,
      name: o.product_name,
      category: o.catogary,
      image: o.image,
      qty: Number(o.quantity) || 1,
      unitPrice: Number(o.product_price) || 0,
      total: Number(o.total_price) || 0,
      status: o.order_status || "Pending",
      deliveryEstimate: o.delivery_estimate,
      paymentMethod: o.payment_method,
      orderDate: o.order_date,
      address: o.address_line2,
      city: o.city,
      state: o.state,
      pinCode: o.pin_code,
      username: o.username,
      email: o.email_Address,
      phone: o.Phone_number,
      raw: o,
    }));

    const cartItemsMapped = cart.map((c) => ({
      key: `cart-${c.order_id}-${c.product_id}`,
      type: "In cart",
      id: `#CT-${c.order_id}`,
      name: c.product_name,
      category: c.category,
      image: c.image,
      qty: Number(c.quantity) || 1,
      unitPrice: Number(c.product_price) || 0,
      total: Number(c.total_price) || 0,
      status: "In cart",
      raw: c,
    }));

    return [...orderItems, ...cartItemsMapped];
  }, [orders, cart]);

  const filters = ["All", "In cart", "Pending", "Delivered"];

  const filteredItems =
    activeFilter === "All"
      ? combinedItems
      : combinedItems.filter((i) => i.status === activeFilter);

  const selectedItem =
    combinedItems.find((i) => i.key === selectedKey) || filteredItems[0] || null;

  const cartTotal = cart.reduce((sum, c) => sum + (Number(c.total_price) || 0), 0);
  const orderedTotal = orders.reduce(
    (sum, o) => sum + (Number(o.total_price) || 0),
    0
  );
  const pendingOrders = orders.filter((o) => o.order_status === "Pending").length;

  const latestOrder = useMemo(() => {
    if (!orders.length) return null;
    return [...orders].sort(
      (a, b) => new Date(b.order_date) - new Date(a.order_date)
    )[0];
  }, [orders]);

  // Profile info: order data mein username/email available hai, cart mein nahi
  const profile = latestOrder
    ? { name: latestOrder.username, email: latestOrder.email_Address }
    : { name: "—", email: "—" };
  const initials = profile.name && profile.name !== "—"
    ? profile.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const isLoading = ordersLoading || cartLoading;
  const isError = ordersError || cartError;

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${
        isDark ? "bg-[#0D0E10] text-zinc-100" : "bg-[#F4F5F7] text-zinc-900"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
            <p className="text-sm mt-1 text-zinc-500">
              Manage your account, orders and preferences
            </p>
          </div>
          <button
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border transition-colors ${
              isDark
                ? "border-zinc-800 hover:bg-zinc-900 text-zinc-300"
                : "border-zinc-200 hover:bg-white text-zinc-600"
            }`}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        {isError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm px-4 py-3">
            <AlertTriangle size={16} />
            Data load karne mein problem hui. Backend / network check karein.
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-500 py-10 justify-center">
            <Loader2 size={16} className="animate-spin" />
            Loading your orders and cart…
          </div>
        ) : (
          <>
            {/* Top stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                isDark={isDark}
                icon={<ShoppingCart size={16} />}
                label="Items in cart"
                value={`₹${formatINR(cartTotal)}`}
                sub={`${cart.length} products`}
              />
              <StatCard
                isDark={isDark}
                icon={<Package size={16} />}
                label="Total ordered"
                value={`₹${formatINR(orderedTotal)}`}
                sub={`${orders.length} orders`}
              />
              <StatCard
                isDark={isDark}
                icon={<Truck size={16} />}
                label="Pending orders"
                value={pendingOrders}
                sub="Awaiting delivery"
              />
              <StatCard
                isDark={isDark}
                icon={<Truck size={16} />}
                label="Latest delivery est."
                value={latestOrder?.delivery_estimate || "—"}
                sub={latestOrder ? `Order #${latestOrder.order_id}` : "No orders yet"}
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`text-sm px-3.5 py-1.5 rounded-lg border transition-colors ${
                    activeFilter === f
                      ? "bg-[#C6F135] text-black border-[#C6F135] font-medium"
                      : isDark
                      ? "border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                      : "border-zinc-200 text-zinc-500 hover:bg-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* List + detail */}
            <div
              className={`rounded-2xl border overflow-hidden ${
                isDark ? "border-zinc-800" : "border-zinc-200"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-5">
                {/* List */}
                <div
                  className={`lg:col-span-2 border-r ${
                    isDark ? "border-zinc-800" : "border-zinc-200"
                  }`}
                >
                  <div
                    className={`px-5 py-3 text-xs font-medium uppercase tracking-wide ${
                      isDark ? "text-zinc-500 bg-[#141518]" : "text-zinc-500 bg-zinc-50"
                    }`}
                  >
                    My products ({filteredItems.length})
                  </div>

                  {filteredItems.length === 0 && (
                    <div className="px-5 py-8 text-sm text-zinc-500 text-center">
                      Yahan kuch nahi hai.
                    </div>
                  )}

                  {filteredItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setSelectedKey(item.key)}
                      className={`w-full text-left px-5 py-3.5 flex items-center justify-between border-t transition-colors ${
                        isDark ? "border-zinc-800" : "border-zinc-100"
                      } ${
                        selectedItem?.key === item.key
                          ? isDark
                            ? "bg-[#1A1B1E]"
                            : "bg-zinc-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center ${
                            isDark ? "bg-zinc-800" : "bg-zinc-100"
                          }`}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package size={14} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.id}</p>
                          <p className="text-xs text-zinc-500 truncate max-w-[140px]">
                            {item.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ₹{formatINR(item.total)}
                        </p>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full ${
                            item.status === "In cart"
                              ? isDark
                                ? "bg-zinc-800 text-zinc-300"
                                : "bg-zinc-200 text-zinc-600"
                              : item.status === "Pending"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-[#C6F135] text-black"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Detail */}
                <div className={`lg:col-span-3 p-5 ${isDark ? "bg-[#141518]" : "bg-white"}`}>
                  {!selectedItem ? (
                    <p className="text-sm text-zinc-500">
                      Detail dekhne ke liye ek product select karein.
                    </p>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <p className="text-xs text-zinc-500 mb-1">Product details</p>
                          <p className="text-lg font-semibold">{selectedItem.id}</p>
                          <p className="text-sm text-zinc-500">{selectedItem.name}</p>
                        </div>
                        {selectedItem.type === "ordered" && (
                          <div className="text-right">
                            <p className="text-xs text-zinc-500 mb-1">Customer</p>
                            <p className="text-sm font-medium">{selectedItem.username}</p>
                            <p className="text-xs text-zinc-500">{selectedItem.email}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-5">
                        <MiniStat
                          isDark={isDark}
                          label="Unit price"
                          value={`₹${formatINR(selectedItem.unitPrice)}`}
                        />
                        <MiniStat isDark={isDark} label="Quantity" value={selectedItem.qty} />
                        <MiniStat
                          isDark={isDark}
                          label="Category"
                          value={selectedItem.category || "—"}
                        />
                      </div>

                      {selectedItem.type === "ordered" && (
                        <div className="grid grid-cols-2 gap-3 mb-5">
                          <MiniStat
                            isDark={isDark}
                            label="Payment method"
                            value={selectedItem.paymentMethod || "—"}
                          />
                          <MiniStat
                            isDark={isDark}
                            label="Delivery estimate"
                            value={selectedItem.deliveryEstimate || "—"}
                          />
                          <MiniStat
                            isDark={isDark}
                            label="Delivery address"
                            value={`${selectedItem.address || ""}, ${selectedItem.city || ""}, ${
                              selectedItem.state || ""
                            } - ${selectedItem.pinCode || ""}`}
                          />
                          <MiniStat
                            isDark={isDark}
                            label="Order date"
                            value={
                              selectedItem.orderDate
                                ? new Date(selectedItem.orderDate).toLocaleDateString("en-IN")
                                : "—"
                            }
                          />
                        </div>
                      )}

                      <div
                        className={`rounded-xl p-4 flex items-center justify-between border ${
                          isDark ? "border-zinc-800" : "border-zinc-200"
                        }`}
                      >
                        <div>
                          <p className="text-xs text-zinc-500">Total</p>
                          <p className="text-xl font-semibold">
                            ₹{formatINR(selectedItem.total)}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                            selectedItem.status === "In cart"
                              ? isDark
                                ? "bg-zinc-800 text-zinc-300"
                                : "bg-zinc-200 text-zinc-600"
                              : selectedItem.status === "Pending"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-[#C6F135] text-black"
                          }`}
                        >
                          {selectedItem.status}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Profile + Preferences */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Profile */}
              <div
                className={`rounded-2xl p-5 border ${
                  isDark ? "bg-[#141518] border-zinc-800" : "bg-white border-zinc-200"
                }`}
              >
                <p className="text-sm font-medium mb-4">Profile</p>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-14 w-14 rounded-full bg-[#C6F135] flex items-center justify-center text-black font-semibold text-lg">
                    {initials}
                  </div>
                  <div>
                    <p className="font-medium">{profile.name}</p>
                    <p className="text-xs text-zinc-500">{profile.email}</p>
                  </div>
                  <button
                    className={`ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${
                      isDark ? "border-zinc-800 hover:bg-zinc-900" : "border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Pencil size={12} /> Edit
                  </button>
                </div>

                <div className="space-y-3">
                  <FieldRow isDark={isDark} icon={<AtSign size={14} />} label="Name" value={profile.name} />
                  <FieldRow isDark={isDark} icon={<Mail size={14} />} label="Email" value={profile.email} />
                </div>
              </div>

              {/* Preferences */}
              <div
                className={`rounded-2xl p-5 border space-y-1 ${
                  isDark ? "bg-[#141518] border-zinc-800" : "bg-white border-zinc-200"
                }`}
              >
                <p className="text-sm font-medium mb-3">Preferences</p>

                <PrefRow isDark={isDark} icon={<Globe size={16} />} label="Language">
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className={`appearance-none text-sm pl-3 pr-8 py-1.5 rounded-lg border cursor-pointer ${
                        isDark
                          ? "bg-[#1A1B1E] border-zinc-800 text-zinc-200"
                          : "bg-zinc-50 border-zinc-200 text-zinc-700"
                      }`}
                    >
                      <option>English</option>
                      <option>हिन्दी</option>
                      <option>Español</option>
                      <option>Français</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2.5 top-2 pointer-events-none opacity-60"
                    />
                  </div>
                </PrefRow>

                <PrefRow
                  isDark={isDark}
                  icon={isDark ? <Moon size={16} /> : <Sun size={16} />}
                  label="Appearance"
                >
                  <div
                    className={`flex items-center rounded-lg p-1 border ${
                      isDark ? "border-zinc-800 bg-[#1A1B1E]" : "border-zinc-200 bg-zinc-50"
                    }`}
                  >
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md ${
                        !isDark ? "bg-[#C6F135] text-black font-medium" : "text-zinc-400"
                      }`}
                    >
                      <Sun size={12} /> Light
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md ${
                        isDark ? "bg-[#C6F135] text-black font-medium" : "text-zinc-400"
                      }`}
                    >
                      <Moon size={12} /> Dark
                    </button>
                  </div>
                </PrefRow>

                <PrefRow isDark={isDark} icon={<Bell size={16} />} label="Order notifications">
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`w-10 h-6 rounded-full relative transition-colors ${
                      notifications ? "bg-[#C6F135]" : isDark ? "bg-zinc-800" : "bg-zinc-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        notifications ? "translate-x-[18px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </PrefRow>

                <PrefRow isDark={isDark} icon={<ShieldCheck size={16} />} label="Two-factor authentication">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    <Check size={12} /> Enabled
                  </span>
                </PrefRow>

                <div className={`h-px my-3 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />

                <button
                  className={`w-full flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl border transition-colors ${
                    isDark
                      ? "border-zinc-800 text-zinc-300 hover:bg-zinc-900"
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <LogOut size={15} /> Log out
                </button>

                <button className="w-full flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={15} /> Delete account
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ isDark, icon, label, value, sub }) {
  return (
    <div
      className={`rounded-2xl p-4 border ${
        isDark ? "bg-[#141518] border-zinc-800" : "bg-white border-zinc-200"
      }`}
    >
      <div className="flex items-center gap-2 text-zinc-500 text-xs mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-xl font-semibold mb-1">{value}</p>
      <p className="text-xs text-zinc-500">{sub}</p>
    </div>
  );
}

function MiniStat({ isDark, label, value }) {
  return (
    <div className={`rounded-xl p-3 border ${isDark ? "border-zinc-800" : "border-zinc-200"}`}>
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-sm font-semibold truncate">{value}</p>
    </div>
  );
}

function FieldRow({ isDark, icon, label, value }) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${
        isDark ? "border-zinc-800 bg-[#1A1B1E]" : "border-zinc-200 bg-zinc-50"
      }`}
    >
      <div className="flex items-center gap-2 text-zinc-500 text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function PrefRow({ isDark, icon, label, children }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5 text-sm">
        <span className="text-zinc-500">{icon}</span>
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}
