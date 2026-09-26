import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

export default function Pasued_comple_myDay() {
  const closeBox = useSelector((state) => state.states.close)
  return (
    <div className='Pasued_comple_myDay' style={{ display: closeBox ? 'block' : 'none' }}>
      <div className="My-todo">
        <Link to='/'><h3>My Page</h3></Link>
      </div>
      <div className="My-todo">
        <Link to='/pause'><h3>Pause</h3></Link>
      </div>
      <div className="My-todo">
        <Link to='/timer'>
          <h3>Timer</h3>
        </Link>
      </div>
      <div className="My-todo">
        <Link to='/CustomTodopage'>
          <h3>Page</h3>
        </Link>
      </div>
    </div>
  )
}
