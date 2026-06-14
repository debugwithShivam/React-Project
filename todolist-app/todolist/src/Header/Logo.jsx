import React from 'react'
import logo from '../TodoPage/logo.png'
import { useDispatch } from 'react-redux'
import { closeBox } from '../Redux/Slice'

import { useSelector } from 'react-redux'
export default function Logo() {
     const closeBoxToggle = useSelector((state)=>state.states.close)



  const closeBoxFun = useDispatch()
  return (
    <div className='Logo-container'>
      <div className="sub-logo-container" style={{display:'flex',justifyContent:'center',alignItems:'center',gap:'10px'}}>
        <img src={logo} alt="" onClick={()=>{closeBoxFun(closeBox())}}  className='laptop-icon'/>
        <h2 style={{display:closeBoxToggle?'block':'none'} } className='phone-icon' >Todo List</h2>
      </div>
    </div>
  )
}
