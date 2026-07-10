import React, { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
async function getCartData() {
  try {
    const token = localStorage.getItem("accessToken");
    let response = await axios.get("http://localhost:4876/auth/getCartProduct", {
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

function cardData() {
  return useQuery({
    queryKey: ["cartdata"],
    queryFn: getCartData,
  });
}

export default function Layout() {
  const{data}= cardData()
  let dataLenght = data ? Object.keys(data).length : 0;

  const authStatus = localStorage.getItem("authStatus");
  const location = useLocation();
  return (
    <div className=" ">
      <header className=" absolute top-0 left-0 text-white  w-full flex z-[999] justify-between items-center p-[1rem 5rem]">
        <h1
          className={`ml-2 text-[3rem] font-light  ${location.pathname == "/setting" ? "text-white" : "text-black"}`}
        >
          MCODE
        </h1>
        <nav className="flex items-center gap-6 bg-white text-black p-2 rounded-xl font-bold font-medium">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "bg-black p-2 rounded-xl text-white"
                : "text-black bg-white"
            }
          >
            <h1>Home</h1>
          </NavLink>
          <NavLink
            to="/Product"
            className={({ isActive }) =>
              isActive
                ? "bg-black p-2 rounded-xl text-white"
                : "text-black bg-white"
            }
          >
            <h1>Product</h1>
          </NavLink>
          <NavLink
            to="/Order"
            className={({ isActive }) =>
              isActive
                ? "bg-black p-2 rounded-xl text-white"
                : "text-black bg-white"
            }
          >
            <h1>Order</h1>
          </NavLink>
          <NavLink
            to="/setting"
            className={({ isActive }) =>
              isActive
                ? "bg-black p-2 rounded-xl text-white"
                : "text-black bg-white"
            }
          >
            <h1>Setting</h1>
          </NavLink>
        </nav>
        {authStatus === null ? (
          <button className="bg-[#a7a7a7] rounded-2xl text-black pl-1 pr-1 p-1 border-none text-[1rem] font-medium transition-backgroung-color duration-[0.2] ease pointer-events-auto hover:bg-white">
            SINGING
          </button>
        ) : (
          <div className="flex m-2 mr-3 gap-4">
            <div className="p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill={
                  ["/", "/setting"].includes(location.pathname)
                    ? "#fff"
                    : "#000"
                }
              >
                <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm146.5-204.5Q340-521 340-580t40.5-99.5Q421-720 480-720t99.5 40.5Q620-639 620-580t-40.5 99.5Q539-440 480-440t-99.5-40.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm100-95.5q47-15.5 86-44.5-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160q53 0 100-15.5ZM523-537q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17Zm-43-43Zm0 360Z" />
              </svg>
            </div>
            <div className=" relative p-2">
              <div className="bg-red-500 text-white w-3 h-3 flex rounded-full justify-center items-center p-2 font-mono absolute top-0 mb-5 right-0">
                <h1>{dataLenght}</h1>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill={
                  ["/", "/setting"].includes(location.pathname)
                    ? "#fff"
                    : "#000"
                }
              >
                <path d="M200-80q-33 0-56.5-23.5T120-160v-480q0-33 23.5-56.5T200-720h80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720h80q33 0 56.5 23.5T840-640v480q0 33-23.5 56.5T760-80H200Zm0-80h560v-480H200v480Zm421.5-298.5Q680-517 680-600h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85h-80q0 83 58.5 141.5T480-400q83 0 141.5-58.5ZM360-720h240q0-50-35-85t-85-35q-50 0-85 35t-35 85ZM200-160v-480 480Z" />
              </svg>
            </div>
          </div>
        )}
      </header>
      <div className="">
        <Outlet />
      </div>
    </div>
  );
}
