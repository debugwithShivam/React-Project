import React, { useState } from "react";
import {
  LayoutGrid,
  ShoppingCart,
  BarChart3,
  Wallet,
  ShoppingBag,
  Users,
  Banknote,
  FileText,
  Settings,
  HelpCircle,
  Search,
  Barcode,
  Moon,
  Bell,
  Menu,
} from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import OrderProductList from "./OrderProductList.jsx";
import axios from "axios";
import OrdereProduct from "./OrdereProduct.jsx";

async function getOrderdata() {
  try {
    let response = await axios.get("http://localhost:4876/auth/getCartProduct",{withCredentials:true});
    return response.data.data;
  } catch (error) {
    console.error(error);
  }
}

function cardData() {
  return useQuery({
    queryKey: ["cartdata"],
    queryFn: getOrderdata,
  });
}

const SIDEBAR_ITEMS = [
  { label: "Books", icon: LayoutGrid },
  { label: "Electronics", icon: ShoppingCart, active: true },
  { label: "Home & Kitchen", icon: BarChart3 },
  { label: "Clothing", icon: Wallet },
  { label: "Footwear", icon: ShoppingBag },
];

/**
 * Catalog-sheet style product card — modeled on the clean, bordered
 * lookbook layout (bold word mark, hairline dividers, sharp corners,
 * a single flat accent block instead of a photo).
 */
function ProductCard({ product }) {
  const queryClint = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (order_id) =>
      axios.post(`http://localhost:4876/auth/deleteCart`, {
        order_id,
      },{withCredentials:true}),
    onSuccess: () => {
      queryClint.invalidateQueries({
        queryKey: ["cartdata"],
      });
    },
  });

  return (
    <div className="flex flex-col border border-neutral-900 bg-white text-neutral-900">
      <div className="flex items-stretch justify-between border-b border-neutral-900">
        <div className="flex-1 px-4 py-3">
          <p className="text-lg font-black leading-none tracking-tight">
            {product.product_name}
          </p>
        </div>
        <div className="flex w-20 items-center justify-center border-l border-neutral-900 p-2 text-sm font-semibold">
          {product.category}
        </div>
      </div>

      <div
        className="aspect-[4/3] w-full border-b border-neutral-900  flex justify-center items-center"
        style={{ backgroundColor: product.color }}
      >
        <img src={product.image} className="object-contain w-30" alt="" />
      </div>

      <div className="flex items-stretch justify-between text-xs">
        <div className="flex-1 space-y-1 px-4 py-3 text-neutral-500">
          <p>
            Code <span className="text-neutral-900">{product.quantity}</span>
          </p>
          <p>
            Available
            <span className="text-neutral-900">{product.total_price}</span>
          </p>
        </div>
        <div className="flex w-20 h-full items-center justify-center border-l border-neutral-900">
          <span
            className="h-3 w-3 rounded-full bg-red-500"
            onClick={() => deleteMutation.mutate(product.order_id)}
          />
        </div>
      </div>
    </div>
  );
}

function ProductGrid({ category }) {
  
  const [viewAll, setViewAll] = useState(false);
  const { data } = cardData();
  return (
    <>
      <div className="grid grid-cols-2 gap-3 px-6 py-5 sm:grid-cols-4 lg:grid-cols-7">
        {(viewAll
          ? data?.filter((item) => item.category === category)
          : data
        )?.map((s, i) => (
          <div
            key={i}
            className={`rounded-2xl border px-4 py-3 ${
              i === 0
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white text-neutral-900"
            }`}
          >
            <p
              className={`text-xs font-medium ${
                i === 0 ? "text-neutral-300" : "text-neutral-400"
              }`}
            >
              {s.product_name}
            </p>

            <p className="mt-1 text-lg font-semibold">{s.product_price}</p>
          </div>
        ))}
      </div>
      <div className="px-6 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900">
            Choose Products
          </h2>
          <div className="flex items-center gap-3">
            <button
               className={`rounded-full border border-neutral-200  px-4 py-2 text-sm text-neutral-600 ${viewAll ? "bg-white text-black" : "bg-black text-white"}`}
              onClick={() => setViewAll(false)}
            >
              View All Orders
            </button>
            <button
                className={`flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm  ${viewAll ? "bg-black text-white" : "bg-white text-black"}`}
              onClick={() => setViewAll(true)}
            >
              <Barcode size={16} /> Scan Barcode
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(viewAll
            ? data?.filter((item) => item.category == category)
            : data
          )?.map((p, i) => (
            <ProductCard key={i} product={p} />
          ))}
        </div>
      </div>
    </>
  );
}

function CartPanel() {
  let { data } = cardData();
  let sum = 0;

  let totalPrice = data?.reduce((sum, item) => {
    return sum + item.total_price * item.quantity;
  }, 0);

  const discount = totalPrice * 0.05;
  const tax = totalPrice * 0.02;
  const total = totalPrice - discount + tax;
  return (
    <aside className="flex w-full max-w-sm shrink-0 flex-col border-l border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-5 py-4">
        <p className="text-sm text-neutral-400">Order</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {data?.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 rounded-lg bg-neutral-100">
              <img
                src={item.image}
                className="w-full h-full object-contain"
                alt=""
              />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium text-neutral-900">
                {item.product_name}
              </p>
              <p className="text-xs text-neutral-400">
                quantity {item.size} {item.quantity}
              </p>
            </div>
            <p className="text-sm font-semibold text-neutral-900">
              ${item.total_price}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 border-t border-neutral-200 px-5 py-4 text-sm">
        {data?.map((item) => (
          <div
            key={item.order_id}
            className="flex justify-between text-neutral-500"
          >
            <span>
              {item.product_name} ({item.quantity}x)
            </span>
            <span className="text-neutral-900">
              ${(item.product_price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}

        <div className="flex justify-between pt-1 text-base font-semibold text-neutral-900">
          <span>Total Amount</span>
          <span>${totalPrice}</span>
        </div>
      </div>
    </aside>
  );
}

export default function PosPage() {
  const [active, setActive] = useState("machine");
  const [category, setCategory] = useState("Books");

  return (
    <div className="flex h-screen w-full bg-neutral-50 font-sans mt-10">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-neutral-200 bg-white px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white">
            ✦
          </div>
          <span className="text-lg font-semibold tracking-tight text-neutral-900">
            Starline
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {SIDEBAR_ITEMS.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              onClick={() => {
                setCategory(label);
              }}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                category === label
        ? "bg-lime-300 text-neutral-900"
        : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex gap-8 border-b border-neutral-200 bg-white px-6 pt-4">
          {[
            { key: "machine", label: "Cart Products" },
            { key: "dashboard", label: "Orderd Product" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                active === tab.key ? "text-neutral-900" : "text-neutral-400"
              }`}
            >
              {tab.label}
              {active === tab.key && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-neutral-900" />
              )}
            </button>
          ))}
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {active == "machine" ? (
              <ProductGrid category={category} />
            ) : (
              <OrdereProduct category={category} />
            )}
          </div>
          {active == "machine" ? <CartPanel /> : <OrderProductList />}
        </div>
      </div>
    </div>
  );
}
