import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import Product from "./Product";
import Footer from "./Footer";
import FeatureCards from "./FeatureCards";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import swiperImg1 from "./swiper1.png";
import swiperImg2 from "./swiper2.png";
import swiperImg3 from "./swiper3.png";
import swiperImg4 from "./swiper4.png";

const products = [
  {
    title: "Stylish Comfort Speaker",
    subtitle: "Immersive Audio Experience",
    price: "$249",
    image: swiperImg1,
    gradient:
      "bg-[radial-gradient(circle_at_top_left,_#8ab4ff_0%,_#4f46e5_45%,_#0f172a_100%)]",
    description:
      "Powerful bass, crystal-clear mids, and modern aesthetics designed for premium listening.",
    details: [
      "14h battery life",
      "USB-C fast charging",
      "30m wireless range",
    ],
  },
  {
    title: "Elegant Travel Light",
    subtitle: "Portable Luxury",
    price: "$189",
    image: swiperImg2,
    gradient:
      "bg-[radial-gradient(circle_at_top_left,_#d8b4fe_0%,_#9333ea_45%,_#1e1b4b_100%)]",
    description:
      "Minimal design with powerful smart features built for daily travel and mobility.",
    details: ["Lightweight", "Fast charging", "Durable shell"],
  },
  {
    title: "Bold Performance Kit",
    subtitle: "Built For Speed",
    price: "$499",
    image: swiperImg3,
    gradient:
      "bg-[radial-gradient(circle_at_top_left,_#fde68a_0%,_#f59e0b_45%,_#78350f_100%)]",
    description:
      "Premium performance hardware engineered for demanding workflows and elite speed.",
    details: ["Fast launch", "256GB memory", "Premium finish"],
  },
  {
    title: "Premium Style Accessory",
    subtitle: "Luxury Crafted",
    price: "$129",
    image: swiperImg4,
    gradient:
      "bg-[radial-gradient(circle_at_top_left,_#fda4af_0%,_#e11d48_45%,_#3f0014_100%)]",
    description:
      "Elegant craftsmanship and lightweight comfort for everyday luxury styling.",
    details: ["Premium blend", "Ultra light", "Flexible fit"],
  },
];

function ProductSlide({ product }) {
  return (
    <section
      className={`relative min-h-screen overflow-hidden text-white ${product.gradient}`}
    >
      <div className="absolute left-10 top-10 h-96 w-96 rounded-full bg-white/20 blur-[140px]" />
      <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-white/10 blur-[140px]" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 items-center gap-10 px-8 lg:grid-cols-3">

        <div className="">
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-xl">
            New Arrival
          </span>

          <h1 className="text-5xl font-bold leading-tight lg:text-7xl">
            {product.title}
          </h1>

          <p className="text-xl text-white/80">
            {product.subtitle}
          </p>

          <p className="max-w-md text-white/70">
            {product.description}
          </p>

          <div className="text-4xl font-bold">{product.price}</div>

          <div className="flex gap-4 mt-5">
            <button className="rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:scale-105">
              Buy Now
            </button>

            <button className="rounded-full border border-white/30 px-6 py-3 backdrop-blur-xl transition hover:bg-white/10">
              Details
            </button>
          </div>
        </div>

        <div className="relative flex justify-center">
          <div className="absolute h-[420px] w-[420px] rounded-full bg-white/20 blur-[120px]" />

          <img
            src={product.image}
            alt={product.title}
            className="relative z-10 w-[420px] object-contain drop-shadow-2xl transition duration-500 hover:scale-110 animate-[float_4s_ease-in-out_infinite]"
          />
        </div>

        <div className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl">
          <h3 className="mb-6 text-2xl font-semibold">
            Product Features
          </h3>

          <ul className="space-y-4">
            {product.details.map((detail, index) => (
              <li
                key={index}
                className="rounded-xl bg-white/10 p-4"
              >
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function Home() {

  return (
    <>
    <Swiper
        modules={[Autoplay, Pagination,  EffectFade]}
        pagination={{ clickable: true }}
        navigation
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop
        speed={1000}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        >
      {products.map((product) => (
        <SwiperSlide key={product.title}>
          <ProductSlide product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
    <div className="">
      <Product/>
    </div>
    <FeatureCards/>
    <Footer/>
      </>
  );
}