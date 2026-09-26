import React, { memo } from 'react'
import { useContext } from 'react'
import centerTodoData from '../../../contexts/CenterTodoata'
import TodoTimer from './TodoTimer'
import MakeTodo from './MakeTodo'
import { MyBackgroundImg } from '../../../contexts/ChangeBackgroungImg'
import Todo from './Todo'
import { useEffect } from 'react'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import api from '../../../services/api'
 function ShowPauseTodo() {
    let { todoData, setTodoData } = useContext(centerTodoData)
    const { backimg, setBackImg } = useContext(MyBackgroundImg)

    
    const fetchPausedTodo = async () => {
        let res = await api.get('/searchTask')
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
    
    data.map((item)=>{
            
        })
  
    
    return (
        <div className='Pause-todo-page-container'>
            <img src={backimg} alt="" />
            <div className="pause-todo-page-title">
                <h1>Paused Todos</h1>
            </div>
            <div className="pause-todo-box">
                {
                    data.map((item) => (
                        item.paused === true ? <div className="todo" key={item._id}>
                            <h3>{item.searchInput}</h3>
                        </div> : null
                        
                    ))
                }
            </div>
        </div>
    )
}

export default memo(ShowPauseTodo)