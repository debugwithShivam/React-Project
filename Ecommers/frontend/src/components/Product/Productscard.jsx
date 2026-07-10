import React from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {Link} from 'react-router-dom'

export default function ProductsCard({
  id,
  brand,
  category,
  color,
  delivery,
  description,
  image,
  name,
  offer,
  price,
  rating,
  size,
  stock,
  title,
}) {
  let productObject = {
    id:id,
    brand: brand,
    category: category,
    color: color,
    delivery: delivery,
    description: description,
    image: image,
    name: name,
    offer: offer,
    price: price,
    rating: rating,
    size:size,
    stock:stock,
    title: title,
  };


  return (
    <Link to='/ChooseProduct'>
    <div className="p-4 h-full flex flex-col " onClick={()=>localStorage.setItem('chooseProduct',JSON.stringify(productObject))}>
      <div className="bg-[#EDEAE5] p-4 h-100">
        <div className="border-2 border-[#D75A3C] w-20 h-8 flex justify-center items-center text-center text-[#d75a3c] m-1 rounded-xl text-[1rem] font-semibold">
          {brand}
        </div>
        <div className=" flex justify-center items-center w-full h-full p-3 pb-20">
          <img
            src={image}
            alt=""
            className="w-full h-full object-contain hover:scale-105"
            />
        </div>
      </div>
      <div className="mt-3 px-3 space-y-2">
        <h4 className="text-[#B8B6B5] text-sm font-semibold uppercase tracking-wider">
          {brand}
        </h4>

        <h2 className="text-[#D75A3C] text-xl font-medium uppercase tracking-wide">
          {name}
        </h2>

        <p className="text-gray-700 text-[18px] font-semibold uppercase tracking-widest leading-8 max-w-[280px]">
          {description}
        </p>

        <h1 className="text-gray-500 text-2xl font-bold mt-4">${price}</h1>
      </div>
    </div>
            </Link>
  );
}
