import React from 'react'
import { TodosLatest } from '../../../store/todoSlice'
import { TodosPopular } from '../../../store/todoSlice'
import { TodoSearch } from '../../../store/todoSlice'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
export default function TodoHeader() {
   let selector = useSelector((state) => state.states.todoSetting)
  
  let dispatch = useDispatch()
  return (
    <div className='todo-header-for-everyPage'>
      <div className="everyPages-Btn">
        <button onClick={()=>{
          dispatch(TodosLatest())
        }} >Latest</button>
        <button onClick={()=>{
           dispatch(TodosLatest())
        }} >Oldest</button>
        <button onClick={()=>{
          dispatch(TodosPopular())
        }} >Popular</button>
      </div>
      <div className="everyPages-Search-bar">
        <input type="text" value={selector.searchText} onChange={(e)=>{dispatch(TodoSearch(e.target.value))}} placeholder='Search Your Todo'/>
      </div>
    </div>
  )
}
