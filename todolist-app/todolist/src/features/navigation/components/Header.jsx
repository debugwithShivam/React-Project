import React from 'react'
import Logo from './Logo'
import LikedTodoContainer from './LikedTodoContainer'
import PausedCompletedMyDay from './PausedCompletedMyDay'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
export default function Header() {
    const closeBoxToggle = useSelector((state)=>state.states.close)
    console.log(closeBoxToggle);
    
  return (
    <>
    <div className='header' style={{width:closeBoxToggle?'20%':'5%'}} >
      <Logo/>
      <PausedCompletedMyDay/>
      <LikedTodoContainer/>
    </div>
    <Outlet/>
    </>
  )
}

