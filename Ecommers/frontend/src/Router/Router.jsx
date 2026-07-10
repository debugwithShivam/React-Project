import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import Home from "../components/Home/Home";
import Product from "../components/Product/Product";
import LoginPage from "../components/login/LoginPage";
import Setting from "../components/Setting/Setting";
import Order from "../components/Orders/Order";
import ProtectedRoute from "./ProtectedRoute";
import ChooseProduct from "../components/ChooseProduct/ChooseProduct";
import BuyOrder from "../components/Orders/BuyOrder";
import { useProducts } from "../CenterProductData";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/BuyOrder",
        element: <BuyOrder />,
      },
      {
        path: "/Product",
        element: <Product />,
      },
      {
        path: "/Order",
        element: <Order />,
      },
      {
        path: "/ChooseProduct",
        element: <ChooseProduct />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/setting",
        element: (
          <ProtectedRoute>
            <Setting />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
