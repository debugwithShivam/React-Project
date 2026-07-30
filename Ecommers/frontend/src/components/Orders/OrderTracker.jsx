import React from "react";
import OrderProduct from "./Orderproductdata";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";


export default function OrderTracker() {
  const { data, isLoading } = OrderProduct();



  const Orderdata = JSON.parse(localStorage.getItem("order"));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <h1 className="text-xl font-semibold">Loading...</h1>
      </div>
    );
  }

  const stages = [
    "Order Placed",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Heading */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h1 className="text-2xl font-bold">Order #{Orderdata.order_id}</h1>

        <p className="text-gray-500 mt-1">
          Ordered on {new Date(Orderdata.order_date).toLocaleDateString()}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2">
          {/* Product */}
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex gap-5">
              <img
                src={Orderdata.image}
                alt={Orderdata.product_name}
                className="w-32 h-32 rounded-lg object-cover border"
              />

              <div className="flex-1">
                <h2 className="text-xl font-bold">{Orderdata.product_name}</h2>

                <p className="text-gray-500">Category : {Orderdata.catogary}</p>

                <p className="mt-3">
                  Quantity :
                  <span className="font-semibold"> {Orderdata.quantity}</span>
                </p>

                <p className="mt-2">
                  Price :
                  <span className="font-bold text-green-600">
                    ₹{Orderdata.product_price}
                  </span>
                </p>

                <p className="mt-2">
                  Total :
                  <span className="font-bold text-green-600">
                    ₹{Orderdata.total_price}
                  </span>
                </p>

                <span className="inline-block mt-4 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                  {Orderdata.order_status}
                </span>
              </div>
            </div>
          </div>

          {/* Tracker */}

          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <h2 className="text-xl font-bold mb-8">Order Tracking</h2>

            <div className="flex justify-between relative">
              {/* Line */}
              <div className="absolute top-4 left-0 w-full h-1 bg-gray-300"></div>

              <div
                className="absolute top-4 left-0 h-1 bg-green-500 transition-all"
                style={{
                  width: `${((Orderdata.orderTrack - 1) / 4) * 100}%`,
                }}
              ></div>

              {stages.map((stage, index) => {
                const active = index + 1 <= Orderdata.orderTrack;

                return (
                  <div
                    key={index}
                    className="relative z-10 flex flex-col items-center w-full"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold border-4
                      ${
                        active
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-white border-gray-300 text-gray-500"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <p
                      className={`mt-3 text-sm text-center font-medium ${
                        active ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {stage}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right */}

        <div className="space-y-6">
          {/* Customer */}

          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-bold text-lg mb-4">Customer Details</h2>

            <p>
              <strong>Name :</strong> {Orderdata.username}
            </p>

            <p>
              <strong>Phone :</strong> {Orderdata.Phone_number}
            </p>

            <p>
              <strong>Email :</strong> {Orderdata.email_Address}
            </p>
          </div>

          {/* Address */}

          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-bold text-lg mb-4">Delivery Address</h2>

            <p>{Orderdata.address_line2}</p>
            <p>{Orderdata.city}</p>
            <p>{Orderdata.state}</p>
            <p>{Orderdata.pin_code}</p>
          </div>

          {/* Payment */}

          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-bold text-lg mb-4">Payment</h2>

            <p>
              <strong>Method :</strong> {Orderdata.payment_method}
            </p>

            <p>
              <strong>Estimated :</strong> {Orderdata.delivery_estimate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
