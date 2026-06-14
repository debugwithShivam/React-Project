import React, { useContext } from 'react'
import MakeTodo from './MakeTodo'
import TodoContainer from './TodoContainer'
import SearchBar from './SearchBar'
import img1 from '../images/img1.png'
import img2 from '../images/img2.jpg'
import { MyBackgroundImg } from '../stateManag/ChangeBackgroungImg'
import { CenterTodoDataProvider } from '../stateManag/CenterTodoata'
import TodoTimer from './TodoTimer'
export default function Section() {
  const { backimg, setBackImg } = useContext(MyBackgroundImg)
  let backgroundImg = JSON.parse(localStorage.getItem('backgroungImg'))


  return (
    <div className='section' >
      <img src={backimg} alt="" />
      <TodoTimer />
      <MakeTodo />
      <TodoContainer />
      <SearchBar />
    </div>
  )
}
