import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import Section from './TodoPage/Section'
import Header from './Header/Header'
import { useDispatch, useSelector } from 'react-redux'
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom'
import ShowPauseTodo from './TodoPage/ShowPauseTodo'
import ShowTimerTodo from './TodoPage/ShowTimerTodo'
import CustomTodopage from './Newpage/CustomTodopage'
import CreateTodoPages from './Newpage/CreateTodoPages'
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
