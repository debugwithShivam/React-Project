import { useState, useEffect } from 'react'
import '../styles/App.css'
import Section from '../features/todos/components/Section'
import Header from '../features/navigation/components/Header'
import { useDispatch, useSelector } from 'react-redux'
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom'
import ShowPauseTodo from '../features/todos/components/ShowPauseTodo'
import ShowTimerTodo from '../features/todos/components/ShowTimerTodo'
import CustomTodopage from '../features/pages/components/CustomTodopage'
import CreateTodoPages from '../features/pages/components/CreateTodoPages'
function App() {





  const closeBox = useSelector((state) => state.states.close)
  let router = createBrowserRouter([

    {
      path: "/",
      element: <Header />,
      children: [
        { index: true, element: <Section /> },
        { path: "pause", element: <ShowPauseTodo /> },
        { path: "timer", element: <ShowTimerTodo /> },
        { path: "CustomTodopage", element: <CustomTodopage /> },
        { path: "CreateTodoPages", element: <CreateTodoPages /> }
      ]
    }


  ]);

  return (
    <>
      <div
        className="todolist-Website"
      >
        <RouterProvider router={router} />
      </div>

    </>
  )
}

export default App
