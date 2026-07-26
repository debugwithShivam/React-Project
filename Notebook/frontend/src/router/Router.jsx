import Music from "../component/Music.jsx";
import NotFound from "../component/NotFound.jsx";
import Notes from "../component/Notes.jsx";
import Timer from "../component/Timer.jsx";
import Todo from "../component/Todo.jsx";
import Login from "../auth/Login.jsx";
import Signin from "../auth/Singin.jsx";
import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Notes />,
      },
      {
        path: "timer",
        element: <Timer />,
      },
      {
        path: "music",
        element: <Music />,
      },
      {
        path: "tasks",
        element: <Todo />,
      },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signin /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
