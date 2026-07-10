import React, { useState } from "react";
import Hero from "./Hero";
import ProductsCard from "./Productscard";
import { useQuery } from "@tanstack/react-query";
import { useProducts } from "../../CenterProductData";

export default function Product() {
  const { data } = useProducts();
  const [catgory, setCatrory] = useState("Books");

  return (
    <div className="relative top-16">
      <div className="bg-[#D75A3C] h-10 text-center">
        <ul className="h-full flex justify-center items-center text-white gap-5 font-medium cursor-pointer">
          <li onClick={() => setCatrory("Books")}>Books</li>
          <li onClick={() => setCatrory("Clothing")}>Cothing</li>
          <li onClick={() => setCatrory("Electronics")}>electronics</li>
          <li onClick={() => setCatrory("Footwear")}>Footwear</li>
          <li onClick={() => setCatrory("Home & Kitchen")}>Kitchen</li>
        </ul>
      </div>
      <Hero />
      <div className="flex">
        <div className="w-[250px] shrink-0 m-2 p-3 font-bold text-[#D75A3C]">
          <ul>
            <li className="mb-3">BEST PRODUCT</li>
            <li className="mb-3">TOP 10 PRODUCT</li>
            <li className="mb-3">ALL CATGORY</li>
            <li className="mb-3">BAY ANY THING</li>
            <li className="mb-3">SHOP NOW</li>
          </ul>
        </div>
        <div className="grid grid-cols-3 gap-4 flex-1">
          {data
            ?.filter((item) => item.category == catgory)
            .map((item, i) => (
              <ProductsCard
                key={i}
                id={item.id}
                brand={item.brand}
                category={item.category}
                color={item.color}
                delivery={item.delivery}
                description={item.description}
                image={item.image}
                name={item.name}
                offer={item.offer}
                price={item.price}
                rating={item.rating}
                size={item.size}
                stock={item.stock}
                title={item.title}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
