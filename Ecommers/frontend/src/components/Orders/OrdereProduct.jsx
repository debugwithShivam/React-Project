import React, { useState } from "react";
import { Truck, MapPin, Phone, CreditCard, Trash2 } from "lucide-react";
import OrderProduct from "./Orderproductdata";
import { Barcode } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700 border-amber-300",
  Shipped: "bg-blue-100 text-blue-700 border-blue-300",
  Delivered: "bg-emerald-100 text-emerald-700 border-emerald-300",
  Cancelled: "bg-red-100 text-red-700 border-red-300",
};

function OrderCard({ order }) {
  const statusClass =
    STATUS_STYLES[order.order_status] ||
    "bg-neutral-100 text-neutral-700 border-neutral-300";

  const queryClint = useQueryClient();
  const onDelete = useMutation({
    mutationFn: (order_id) =>
      axios.post(`http://localhost:4876/auth/deleteBuyOrder`, {
        order_id,
      }),
    onSuccess: () => {
      queryClint.invalidateQueries({
        queryKey: ["deleteBuyOrder"],
      });
    },
  });

  return (
    <div className="flex flex-col border border-neutral-900 bg-white text-neutral-900">
      {/* Header */}
      <div className="flex items-stretch justify-between border-b border-neutral-900">
        <div className="flex-1 px-4 py-3">
          <p className="text-xs text-neutral-400">Order #{order.order_id}</p>
          <p className="text-lg font-black leading-none tracking-tight">
            {order.product_name}
          </p>
        </div>

        <div
          className={`flex w-28 items-center justify-center border-l border-neutral-900 p-2 text-xs font-semibold ${statusClass}`}
        >
          {order.order_status}
        </div>
      </div>

      {/* Image */}
      <div className="aspect-[4/3] w-full border-b border-neutral-900 flex justify-center items-center bg-neutral-50">
        <img
          src={order.image}
          className="object-contain w-30 h-full"
          alt={order.product_name}
        />
      </div>

      {/* Price / Qty */}
      <div className="flex items-stretch justify-between text-xs border-b border-neutral-900">
        <div className="flex-1 space-y-1 px-4 py-3 text-neutral-500">
          <p>
            Qty{" "}
            <span className="text-neutral-900 font-medium">
              {order.quantity}
            </span>
          </p>
          <p>
            Price{" "}
            <span className="text-neutral-900 font-medium">
              ₹{order.product_price}
            </span>
          </p>
        </div>

        <div className="flex-1 space-y-1 px-4 py-3 text-neutral-500 border-l border-neutral-900">
          <p>
            Total{" "}
            <span className="text-neutral-900 font-medium">
              ₹{order.total_price}
            </span>
          </p>
          <p className="flex items-center gap-1">
            <CreditCard size={12} /> {order.payment_method}
          </p>
        </div>
      </div>

      {/* Delivery / Address */}
      <div className="px-4 py-3 space-y-1.5 text-xs text-neutral-500">
        <p className="flex items-center gap-1.5">
          <Truck size={13} className="text-neutral-900 shrink-0" />
          {order.delivery_estimate} · ordered on{" "}
          {new Date(order.order_date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>

        <p className="flex items-start gap-1.5">
          <MapPin size={13} className="text-neutral-900 shrink-0 mt-0.5" />
          <span>
            {order.address_line2}, {order.city}, {order.state} -{" "}
            {order.pin_code}
          </span>
        </p>

        <p className="flex items-center gap-1.5">
          <Phone size={13} className="text-neutral-900 shrink-0" />
          {order.Phone_number} · {order.username}
        </p>
      </div>

      {/* Delete Button */}
      <div className="border-t border-neutral-900 p-3">
        <button
          onClick={() => onDelete.mutate(order.order_id)}
          className="flex w-full items-center justify-center gap-2 border border-red-600 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98]"
        >
          <Trash2 size={16} />
          Delete Order
        </button>
      </div>
    </div>
  );
}

export default function OrdereProduct({ category }) {
  console.log(category);
  const [viewAll, setViewAll] = useState(true);
  const { data, isLoading } = OrderProduct();
  console.log(data);
  if (isLoading) {
    return (
      <p className="px-6 py-10 text-sm text-neutral-400">Loading orders…</p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="px-6 py-10 text-sm text-neutral-400">No orders found.</p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 px-6 py-5 sm:grid-cols-4 lg:grid-cols-7">
        {(viewAll
          ? data?.filter((item) => item.catogary == category)
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
              className={`text-xs font-medium ${i === 0 ? "text-neutral-300" : "text-neutral-400"}`}
            >
              {s.product_name}
            </p>
            <p className="mt-1 text-lg font-semibold">{s.product_price}</p>
          </div>
        ))}
      </div>
      <div className="px-6 pb-8 pt-2">
        <div className="flex  justify-between">
          <h2 className="mb-4 text-base font-semibold text-neutral-900">
            Ordered Products ({data.length})
          </h2>
          <div className="mb-4 flex items-center justify-between">
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
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(viewAll
            ? data?.filter((item) => item.catogary == category)
            : data
          )?.map((item, i) => (
            <OrderCard key={i} order={item} />
          ))}
        </div>
      </div>
    </>
  );
}
