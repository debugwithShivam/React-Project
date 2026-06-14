import React from 'react'
import ClickAudioFun from '../ClickAudioFun'
import { useDispatch, useSelector } from 'react-redux'
import { createPage } from '../Redux/Slice'
import { PagesLatest } from '../Redux/Slice'
import { searchPage } from '../Redux/Slice'
import { PagesPopular } from '../Redux/Slice'
export default function CreateTodoHeader({displayvalue}) {

  let search = useSelector((state)=>state.states.searchText)

  
  
  let dispatch = useDispatch()
  return (
    <div className='create-todo-header' >
        <div className="create-todo-page-header-nav">
            <button onClick={()=>{ClickAudioFun('two');dispatch(PagesLatest())}}>Latest</button>
            <button onClick={()=>{ClickAudioFun('two');dispatch(PagesLatest())}}>Oldest</button>
            <button onClick={()=>{ClickAudioFun('two');dispatch(PagesPopular())}}>Popular</button>
            <button onClick={()=>{dispatch(createPage());ClickAudioFun('two')}}>Page</button>
        </div>
        <div className="create-todo-page-header-title">
            <input type="search" name="search" value={search} onChange={(e)=>{dispatch(searchPage(e.target.value))}}  id="search-input" placeholder="Search Page" />
        </div>
    </div>
  )
}
