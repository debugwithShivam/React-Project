import React from 'react'
import ClickAudioFun from '../../../shared/utils/clickAudio'
import { useDispatch, useSelector } from 'react-redux'
import { createPage } from '../../../store/Slice'
import { PagesLatest } from '../../../store/Slice'
import { searchPage } from '../../../store/Slice'
import { PagesPopular } from '../../../store/Slice'
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
