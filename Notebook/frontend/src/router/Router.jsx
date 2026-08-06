import Music from "../component/Music.jsx";
import NotFound from "../component/NotFound.jsx";
import Notes from "../component/Notes.jsx";
import Timer from "../component/Timer.jsx";
import Todo from "../component/Todo.jsx";
import Login from "../auth/Login.jsx";
import Signin from "../auth/Singin.jsx";
import EmailVerifyOTP from "../auth/EmailVerifyOTP.jsx";
import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout.jsx";
import ProtectedRoutes from "../auth/ProtectedRoutes.jsx";
import CreateNotes from "../page/Notes/CreateNotes.jsx";
import UpdateNotes from "../page/Notes/UpdateNotes.jsx";
import ViewNotes from "../page/Notes/ViewNotes.jsx";

const router = createBrowserRouter([
  {
    path: "CreateNotes",
    element: <CreateNotes />,
  },
  {
    path: "UpdateNotes/:id",
    element: <UpdateNotes/>,
  },
  {
    path: "ViewNotes/:id",
    element: <ViewNotes/>,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        element: <ProtectedRoutes />,
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
        ],
      },

      { path: "login", element: <Login /> },
      { path: "signup", element: <Signin /> },
      { path: "Email", element: <EmailVerifyOTP /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
