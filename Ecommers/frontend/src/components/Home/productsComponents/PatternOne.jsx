import React from "react";

function Card(props) {
  return (
<div className="group relative rounded-3xl bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 overflow-hidden h-full">

      <div className="  absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-cyan-100 opacity-70"></div>

      <div className="relative z-10 p-5 flex flex-col h-full">

        <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs px-3 py-1 rounded-full shadow-md">
          Hot Deal
        </div>

        <div className="w-full h-56 flex justify-center items-center overflow-hidden rounded-2xl bg-white shadow-inner">
          <img
            src={props.image}
            alt=""
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        <div className="mt-5 text-center flex flex-col flex-grow">
          <h1 className="text-2xl font-bold text-gray-800">
            {props.name}
          </h1>

          <h3 className="mt-2 text-3xl font-extrabold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            ₹{props.price}
          </h3>

          <p className="mt-3 text-gray-600 text-sm leading-relaxed line-clamp-3 m-2">
            {props.description}
          </p>

          <button className="relative mt-auto w-full overflow-hidden rounded-2xl py-4 font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg hover:scale-[1.03] transition duration-300">
            <span className="relative z-10">Buy Now</span>

            <span className="absolute top-0 left-[-100%] h-full w-full bg-white/20 skew-x-12 group-hover:left-[120%] transition-all duration-700"></span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PatternOne(props) {
  return (
    <div className="p-4 bg-gradient-to-br from-slate-100 to-blue-50 ">
      <Card {...props} />
    </div>
  );
}