import React, { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Menu,
  Star,
  Heart,
  ChevronRight,
} from "lucide-react";
import CartbuyProduct from "./Cart&buyProduct";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";
import { useProducts } from "../../CenterProductData";
import ProductsCard from "../Product/Productscard";
import ChooseCard from "./ChooseCard";

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
  </svg>
);
const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.6a4.1 4.1 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.6 3.3 4a4.1 4.1 0 0 1-1.9.1 4.1 4.1 0 0 0 3.8 2.8A8.2 8.2 0 0 1 2 18.4a11.6 11.6 0 0 0 6.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1Z" />
  </svg>
);
const InstagramIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const COLORS = [
  { id: "black", hex: "#1c1c1c" },
  { id: "rose", hex: "#c98a91" },
];

const SIZES = ["40", "41", "42", "44", "46", "48"];


export default function ChooseProduct() {
  const location = useLocation();
  
  let { data } = useProducts();
 

  const [getdata, setGetdata] = useState(() =>
    JSON.parse(localStorage.getItem("chooseProduct")),
  );

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("chooseProduct"));
    setGetdata(stored);
  }, [location.key]);



  const [color, setColor] = useState(COLORS[0].id);
  const [size, setSize] = useState("48");
  const [qty, setQty] = useState(1);

  return (
    <>
      <div className=" w-full bg-white mt-18">
        <main className="grid lg:grid-cols-2 ">
          <section className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-[#2b2f36] lg:min-h-[calc(100vh-73px)]">
            <span className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 select-none text-[64px] font-extrabold uppercase tracking-tight text-white/5 lg:text-[80px]">
              {getdata.brand}
            </span>
            <span className="pointer-events-none absolute bottom-10 right-6 select-none text-right text-[40px] font-extrabold uppercase leading-[0.85] tracking-tight text-white/5 lg:text-[56px]">
              For
              <br />
              Man
            </span>

            <div className="absolute h-72 w-72 rounded-full bg-white/5 blur-3xl" />

            <img
              src={getdata.image}
              alt="Gray running sneaker"
              className="relative z-10 w-[75%] max-w-md -rotate-6 object-contain drop-shadow-2xl"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

            <div className="absolute bottom-6 left-6 flex items-center gap-4 text-white/70">
              <FacebookIcon className="h-4 w-4 cursor-pointer hover:text-white" />
              <TwitterIcon className="h-4 w-4 cursor-pointer hover:text-white" />
              <InstagramIcon className="h-4 w-4 cursor-pointer hover:text-white" />
            </div>
          </section>

          <section className="flex flex-col justify-center px-6 py-10 lg:px-16 lg:py-0">
            <nav className="mb-4 flex items-center gap-2 text-xs text-neutral-400">
              <span>Man</span>
              <ChevronRight className="h-3 w-3" />
              <span>Shoes</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-neutral-500">{getdata.category}</span>
            </nav>

            <h1 className="max-w-sm text-4xl font-bold leading-tight text-neutral-900 lg:text-5xl">
              {getdata.title}
            </h1>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400"
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-neutral-700">
                {getdata.rating}
              </span>
              <span className="text-sm text-neutral-400">18 votes</span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-neutral-900">
                {getdata.price}
              </span>
              <span className="text-lg text-neutral-300 line-through">
                $69.99
              </span>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400">
              {getdata.description}
            </p>

            <div className="mt-8 flex flex-wrap items-start gap-10">
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Stock
                </p>
                <h1>{getdata.stock}</h1>
              </div>

              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
                  offer
                </p>

                {getdata.offer}
              </div>

              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Quantity
                </p>
                <div className="flex items-center gap-3 rounded-md border border-neutral-200 px-3 py-1.5">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="text-neutral-400 hover:text-neutral-900"
                  >
                    −
                  </button>
                  <span className="w-4 text-center text-sm text-neutral-700">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="text-neutral-400 hover:text-neutral-900"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <CartbuyProduct qty={qty}/>

            <div className="mt-6 text-xs text-neutral-400 flex gap-3">
              <h1>delivery :</h1>
              <h1 className="font-bold">{getdata.delivery}</h1>
            </div>
          </section>
        </main>
      </div>
      <ChooseCard/>
      <Footer />
    </>
  );
}
