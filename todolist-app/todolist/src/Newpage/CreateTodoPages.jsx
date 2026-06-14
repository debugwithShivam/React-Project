import React from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import TodoHeader from './TodoHeader'
import TodoContainerPages from './TodoContainerPages'
import AddTodo from './AddTodo'
import './everyTodoPages.css'
import { useDispatch } from 'react-redux'
import { shiftTodoFun } from '../Redux/Slice'
export default function CreateTodoPages() {
  let getPageData = useSelector((state) => state.states.getPageData)
  let data = JSON.parse(localStorage.getItem('pageData'))
  let navigate = useNavigate()

  let dispatch = useDispatch()
  let select = useSelector((state)=>state.states.shiftTodo)

  const closeShoftPanal = () =>{
    if(select == true){
      dispatch(shiftTodoFun())
    }
  }
  


  return (
    <div className='create-todo-pages'>
      <div className="page-details">
        <div className="back-home" onClick={()=>navigate('/CustomTodopage')}>
          <span onClick={()=>{
            closeShoftPanal()
          }}>
          ↩
          </span>
        </div>
        <div className="page-info-header">
        <h1>{data.pageName}</h1>
        <p>Tags: {data.pagetag.join(', ')}</p>
        </div>
      </div>
     <div className="single-pages-Todo">
      
      <TodoHeader/>
      <TodoContainerPages/>
      <AddTodo/>
     </div>
    </div>
  )
}
