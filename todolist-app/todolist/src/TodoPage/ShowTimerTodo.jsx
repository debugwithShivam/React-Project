import React from 'react'
import { useContext } from 'react'
import { MyBackgroundImg } from '../stateManag/ChangeBackgroungImg'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
export default function ShowTimerTodo() {
   const { backimg, setBackImg } = useContext(MyBackgroundImg)
     const fetchPausedTodo = async () => {
           let res = await axios.get('http://localhost:3000/searchTask')
           if (!res.data.success) {
               throw new Error('API returned failure')
           }
           
           return res.data.data
       }
   
       const { isPending, error, data } = useQuery({
           queryKey: ['paused'],
           queryFn: fetchPausedTodo,
         
       })
        if (isPending) return <h2>Loading...</h2>
    if (error) return <h2>Error loading paused todos</h2>
    
   
  return (
      <div className='Pause-todo-page-container'>
            <img src={backimg} alt="" />
            <div className="pause-todo-page-title">
                <h1>Set Timer Todos</h1>
            </div>
            <div className="pause-todo-box">
                {data.some(item => item.isDisabled ==true)? data.map((item) => (
                        item.isDisabled === true ? <div className="todo" key={item._id}>
                            <h3>{item.searchInput}</h3>
                        </div> :null
                    )): <div className="no-timer-todo">
                      <h1>No timer set on any Todo</h1>
                    </div>
                   
                }
            </div>
        </div>
  )
}
