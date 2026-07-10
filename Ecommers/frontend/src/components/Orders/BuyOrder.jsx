import axios from "axios";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const orderSteps = [
  { id: 1, label: "Information" },
  { id: 2, label: "Payment" },
  { id: 3, label: "Complete" },
];

function InputFields({ label, ...rest }) {
  return (
    <div className="w-full mb-4">
      <label
        htmlFor={label}
        className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A8377] mb-1.5"
      >
        {label}
      </label>
      <input
        {...rest}
        id={label}
        className="outline-none border border-[#DED7C7] bg-white rounded-md px-3 py-2.5 w-full text-[15px] text-[#1C1B1A] placeholder:text-[#B7B0A2] transition-colors focus:border-[#B23A2E] focus:ring-2 focus:ring-[#B23A2E]/10"
      />
    </div>
  );
}

function Perforation({ className = "" }) {
  const dots = Array.from({ length: 26 });
  return (
    <div
      className={`flex justify-between px-3 ${className}`}
      aria-hidden="true"
    >
      {dots.map((_, i) => (
        <span key={i} className="w-2 h-2 rounded-full bg-[#FAF8F3]" />
      ))}
    </div>
  );
}

function Barcode() {
  const widths = [
    2, 1, 3, 1, 1, 2, 4, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 1, 2,
  ];
  return (
    <div className="flex items-end gap-[2px] h-10" aria-hidden="true">
      {widths.map((w, i) => (
        <div
          key={i}
          style={{ width: `${w * 2}px` }}
          className="bg-[#1C1B1A] h-full"
        />
      ))}
    </div>
  );
}

export default function BuyOrder() {
  const [activeStep, setActiveStep] = useState(1);

  let productdata;
  try {
    productdata = JSON.parse(localStorage.getItem("chooseProduct")) || [];
  } catch {
    productdata = {};
  }

  const total =
    (Number(productdata.price) || 0) * (Number(productdata.quantity) || 1);
  const orderNumber =
    "ORD-" +
    String(Math.abs(hashCode(productdata.name || "order"))).slice(0, 6);

  const handleSubmit = () => {
    if (activeStep === 1) {
      // Step 1: sirf validation + agle step par jao, koi API call nahi
      setActiveStep(2);
    } else if (activeStep === 2) {
      // Step 2: yahi par sirf ek baar order place karo
      insertProduct.mutate(
        {
          username: fromData.name,
          product_id: productdata.id,
          quantity: fromData.Quantity,
          product_name: productdata.name,
          product_price: productdata.price,
          catogary: productdata.category,
          image: productdata.image,
          address_line2: fromData.address,
          city: fromData.city,
          state: fromData.state,
          payment_method: paymentMethod,
          pin_code: fromData.pincode,
          email_Address: fromData.email,
          Phone_number: fromData.phoneNumber,
        },
        {
          onSuccess: () => setActiveStep(3), // API success ke baad hi step 3
        },
      );
    }
  };

  const [fromData, setFromData] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    email: "",
    city: "",
    state: "",
    pincode: "",
    Quantity: productdata.quantity,
  });

  const changehandler = (e) => {
    let { name, value } = e.target;
    setFromData((res) => ({
      ...res,
      [name]: value,
    }));
  };

  const isFormValid =
    fromData.name && fromData.phoneNumber && fromData.address && fromData.email;
  const [paymentMethod, setPaymentMethod] = useState("cod");

  let queryClint = useQueryClient();
  const insertProduct = useMutation({
    mutationFn: (data) =>
      axios.post("http://localhost:4876/auth/buyorder", data, {
        withCredentials: true,
      }),
    onSuccess: () => {
      queryClint.invalidateQueries({
        queryKey: ["Orderdata"],
      });
    },
  });

  function orderPlaced() {}
  return (
    <div className="min-h-screen bg-[#FAF8F3] py-14 px-5">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-receipt { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        .font-ui { font-family: 'Inter', system-ui, sans-serif; }
        .dashed-row { border-bottom: 1.5px dashed #DED7C7; }
      `}</style>

      <div className="max-w-5xl mx-auto font-ui">
        <div className="mb-8">
          <p className="font-receipt text-[11px] tracking-[0.2em] text-[#8A8377] uppercase mb-1">
            Checkout · {orderNumber}
          </p>
          <h1 className="text-[32px] font-bold text-[#1C1B1A] tracking-tight">
            Complete your order
          </h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {orderSteps.map((step, idx) => (
            <div
              className="w-full flex justify-between items-center"
              key={step.id}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`font-receipt flex items-center justify-center w-8 h-8 rounded-full text-[13px] font-semibold border-2 transition-colors ${
                    activeStep >= step.id
                      ? "bg-[#1C1B1A] border-[#1C1B1A] text-white"
                      : "border-[#DED7C7] text-[#B7B0A2]"
                  }`}
                >
                  {String(step.id).padStart(2, "0")}
                </div>
                <span
                  className={`text-sm font-semibold uppercase tracking-wide ${
                    activeStep >= step.id ? "text-[#1C1B1A]" : "text-[#B7B0A2]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < orderSteps.length - 1 && (
                <div className="flex-1 h-px bg-[#DED7C7] mx-4" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-start">
          {/* Form card */}
          <div className="bg-white rounded-2xl border border-[#EFE9DC] shadow-sm p-7">
            <h2 className="text-lg font-bold text-[#1C1B1A] mb-5">
              Delivery details
            </h2>

            {activeStep == 1 && (
              <>
                <div className="flex gap-4">
                  <InputFields
                    label="Name"
                    value={fromData.name}
                    onChange={(e) => changehandler(e)}
                    name="name"
                    placeholder="Enter your name"
                  />
                  <InputFields
                    label="Phone No"
                    value={fromData.phoneNumber}
                    onChange={(e) => changehandler(e)}
                    name="phoneNumber"
                    placeholder="Enter phone number"
                  />
                </div>
                <InputFields
                  label="Delivery Address"
                  value={fromData.address}
                  onChange={(e) => changehandler(e)}
                  name="address"
                  placeholder="Enter address"
                />
                <InputFields
                  label="Email Address"
                  value={fromData.email}
                  onChange={(e) => changehandler(e)}
                  name="email"
                  placeholder="Enter email"
                />
                <div className="flex gap-4">
                  <InputFields
                    label="City"
                    value={fromData.city}
                    onChange={(e) => changehandler(e)}
                    name="city"
                    placeholder="Enter city"
                  />
                  <InputFields
                    label="State"
                    value={fromData.state}
                    onChange={(e) => changehandler(e)}
                    name="state"
                    placeholder="Enter state"
                  />
                </div>
                <div className="flex gap-4">
                  <InputFields
                    label="Pin Code"
                    value={fromData.pincode}
                    onChange={(e) => changehandler(e)}
                    name="pincode"
                    placeholder="Enter pin code"
                  />
                  <InputFields
                    label="Quantity"
                    value={fromData.Quantity}
                    onChange={(e) => changehandler(e)}
                    name="Quantity"
                    type="number"
                    placeholder="Enter quantity"
                  />
                </div>
              </>
            )}
            {activeStep == 2 && (
              <>
                <h2 className="text-lg font-bold text-[#1C1B1A] mb-5">
                  Select Payment Method
                </h2>

                <div className="space-y-4">
                  {/* Cash On Delivery */}
                  <label
                    className={`flex items-center justify-between border rounded-xl p-4 cursor-pointer transition ${
                      paymentMethod === "cod"
                        ? "border-[#B23A2E] bg-[#FFF7F5]"
                        : "border-[#DED7C7]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                      />

                      <div>
                        <h3 className="font-semibold">Cash On Delivery</h3>
                        <p className="text-sm text-gray-500">
                          Pay when your order arrives.
                        </p>
                      </div>
                    </div>

                    <span className="text-2xl">💵</span>
                  </label>

                  {/* UPI */}
                  <label
                    className={`flex items-center justify-between border rounded-xl p-4 cursor-pointer transition ${
                      paymentMethod === "upi"
                        ? "border-[#B23A2E] bg-[#FFF7F5]"
                        : "border-[#DED7C7]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "upi"}
                        onChange={() => setPaymentMethod("upi")}
                      />

                      <div>
                        <h3 className="font-semibold">UPI Payment</h3>
                        <p className="text-sm text-gray-500">
                          Google Pay, PhonePe, Paytm etc.
                        </p>
                      </div>
                    </div>

                    <span className="text-2xl">📱</span>
                  </label>

                  {/* Card */}
                  <label
                    className={`flex items-center justify-between border rounded-xl p-4 cursor-pointer transition ${
                      paymentMethod === "card"
                        ? "border-[#B23A2E] bg-[#FFF7F5]"
                        : "border-[#DED7C7]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                      />

                      <div>
                        <h3 className="font-semibold">Debit / Credit Card</h3>
                        <p className="text-sm text-gray-500">
                          Visa, MasterCard, RuPay
                        </p>
                      </div>
                    </div>

                    <span className="text-2xl">💳</span>
                  </label>
                </div>
              </>
            )}
            {activeStep == 3 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                {/* Success Icon */}
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <h2 className="text-3xl font-bold text-[#1C1B1A]">
                  Order Placed Successfully!
                </h2>

                <p className="text-gray-500 mt-3 max-w-md">
                  Thank you for your purchase. Your order has been confirmed and
                  will be shipped soon.
                </p>

                <div className="bg-[#FAF8F3] border border-[#DED7C7] rounded-xl p-5 mt-8 w-full max-w-md">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Order Number</span>
                    <span>{orderNumber}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Payment Method</span>
                    <span className="capitalize">{paymentMethod}</span>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="font-medium">Total Amount</span>
                    <span className="font-bold text-[#B23A2E]">
                      ₹ {total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="mt-8 bg-[#1C1B1A] hover:bg-[#B23A2E] text-white px-8 py-3 rounded-xl font-semibold transition"
                >
                  Continue Shopping
                </button>
              </div>
            )}

            <button
              disabled={!isFormValid || insertProduct.isPending}
              onClick={handleSubmit}
              className="bg-[#1C1B1A] hover:bg-[#B23A2E] text-white font-semibold text-sm uppercase tracking-wide py-3.5 w-full rounded-xl mt-3 transition-colors"
            >
              {activeStep === 1 && "Continue to Payment"}
              {activeStep === 2 && "Place Order"}
              {activeStep === 3 && "Order Placed"}
            </button>
          </div>

          {/* Receipt-style order summary */}
          <div>
            <div className="bg-white rounded-t-xl shadow-sm border border-[#EFE9DC] border-b-0 relative">
              <div className="p-7 font-receipt">
                <div className="text-center mb-5">
                  <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#1C1B1A]">
                    Order Receipt
                  </p>
                  <p className="text-[11px] text-[#8A8377] mt-1">
                    {orderNumber}
                  </p>
                </div>

                {productdata.image && (
                  <div className="flex justify-center mb-5">
                    <img
                      src={productdata.image}
                      alt={productdata.name}
                      className="h-40 object-contain"
                    />
                  </div>
                )}

                <div className="space-y-2.5 text-[13px]">
                  <Row label="Product" value={productdata.name} />
                  <Row label="Brand" value={productdata.brand} />
                  <Row label="Category" value={productdata.category} />
                  <Row label="Rating" value={`${productdata.rating} / 5`} />
                  <Row label="Unit price" value={`₹ ${productdata.price}`} />
                  <Row label="Quantity" value={`× ${productdata.quantity}`} />
                </div>

                <div className="dashed-row my-4" />

                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold uppercase tracking-wide text-[#1C1B1A]">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-[#B23A2E]">
                    ₹ {total.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-end mt-6">
                  <Barcode />
                  <span className="text-[10px] text-[#B7B0A2]">THANK YOU</span>
                </div>
              </div>
            </div>
            <div className="bg-white border border-[#EFE9DC] border-t-0 rounded-b-xl pt-1 pb-3 shadow-sm">
              <Perforation />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[#8A8377]">{label}</span>
      <span className="text-[#1C1B1A] font-medium text-right truncate max-w-[60%]">
        {value}
      </span>
    </div>
  );
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
