import React from "react";
import AuthLogin from "./AuthLogin";
import gradient from "./gradient.png";
import SplineScene from "./Module";
export default function LoginPage() {
  return (
    <div className=" bg-black  text-white leading-[1.5] h-screen  ">
      <img
        src={gradient}
        className="absolute top-0 right-0 opacity-[0.5] "
        alt="gradient"
      />
      <div className="absolute right-0 top-[20%] h-40 w-40 rounded-full bg-white blur-[120px] opacity-80"></div>
      <div className="text-white  w-screen margin-[0 auto] p-2 relative overflow-hidden">
        
        <div className="flex flex-1 items-center overflow-hidden">


          <div className="w-full flex items-center justify-center pr-16">
            <AuthLogin />
          </div>
          <div className="flex h-full ">
            <SplineScene />
          </div>

        </div>
      </div>
    </div>
  );
}
