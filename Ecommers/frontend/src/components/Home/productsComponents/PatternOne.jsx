import React from "react";

function Card(props) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">

        {/* Discount Badge */}
        <div className="absolute left-4 top-4 z-20 rounded-md bg-red-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
          Hot Deal
        </div>

        <img
          src={props.image}
          alt={props.name}
          className="h-full w-full object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Small bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/5 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">

        {/* Product Name */}
        <h2 className="min-h-[3.5rem] text-lg font-semibold leading-7 text-slate-900 transition-colors group-hover:text-blue-600">
          {props.name}
        </h2>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex text-sm text-amber-400">
            ★★★★★
          </div>

          <span className="text-xs text-slate-400">
            4.8
          </span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            ₹{props.price}
          </span>

          <span className="text-xs font-medium text-emerald-600">
            Best price
          </span>
        </div>

        {/* Description */}
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
          {props.description}
        </p>

        {/* Actions */}
        <div className="mt-5 flex gap-2">

          <button
            type="button"
            className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-600"
          >
            Buy Now
          </button>

          <button
            type="button"
            aria-label="Add to wishlist"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-500 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          >
            ♡
          </button>

        </div>
      </div>
    </article>
  );
}

export default function PatternOne(props) {
  return (
    <div className="h-full">
      <Card {...props} />
    </div>
  );
}