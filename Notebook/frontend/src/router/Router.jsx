import Music from "../component/Music";
import Notes from "../component/Notes";
import Timer from "../component/Timer";
import Todo from "../component/Todo";
import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Notes />,
      },
      {
        path: "/Timer",
        element: <Timer />,
      },
      {
        path: "/Music",
        element: <Music />,
      },
      {
        path: "/Todo",
        element: <Todo />,
      },
    ],
  },
]);

export default router;
