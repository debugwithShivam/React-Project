import React from 'react'
import Logo from './Logo'
import LikedTodoContainer from './LikedTodoContainer'
import Pasued_comple_myDay from './Pasued_comple_myDay'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
export default function Header() {
    const closeBoxToggle = useSelector((state)=>state.states.close)
    console.log(closeBoxToggle);
    
  return (
    <>
    <div className='header' style={{width:closeBoxToggle?'30%':'5%'}} >
      <Logo/>
      <Pasued_comple_myDay/>
      <LikedTodoContainer/>
    </div>
    <Outlet/>
    </>
  )
}

