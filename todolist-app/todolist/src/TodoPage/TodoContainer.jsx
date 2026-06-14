import React, { useContext, useMemo, useRef } from 'react'
import Todo from './Todo'
import { useState } from 'react'
import axios from 'axios'
import { useEffect } from 'react'
import { MyContext } from '../stateManag/UIchange'
import { useQuery } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { CheckStar } from '../Redux/Slice'
import { FilterCheckedTodo } from '../stateManag/FilterCheckedTodo'
import centerTodoData from '../stateManag/CenterTodoata'
import searchText from '../stateManag/searchBarText'
import TodoTimer from './TodoTimer'

export default function TodoContainer({ itemId }) {
  let { todoData, setTodoData } = useContext(centerTodoData)

  const getTodoData = async () => {
    const res = await axios.get('http://localhost:3000/searchTask')
    if (!res.data.success) {
      throw new Error('API returned failure')
    }
    return res.data.data
  }



  const { isPending, error, data } = useQuery({
    queryKey: ['todoData'],
    queryFn: getTodoData,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5000,
    staleTime: 0,
  })

  useEffect(() => {
    if (data) {
      setTodoData(data)
    }
  }, [data])


  

  const { checked, setChecked } = useContext(FilterCheckedTodo)
  let { state, setState } = useContext(MyContext)
  let { searchBarText, setSearchBarText } = useContext(searchText)

  let todoFilter = useMemo(() => {
    let list = [...todoData]


    if (searchBarText) {
      return list.filter((item) => item.searchInput.includes(searchBarText))
    }

    if (checked) {
      return list.filter((item) => item.complet == true)
    }

    if (state) {
      return list.sort(
        (a, b) => a.currantDate - b.currantDate)
    } else {
      return list.sort(
        (a, b) => b.currantDate - a.currantDate)
    }

  }, [todoData, checked, state, searchBarText])





  return (
    <>
      <div className='Todo-lists-container'>
      <div className="todo-list">
          {todoFilter.map((item, i) => (
            <Todo
              key={item._id}
              searchInput={item.searchInput}
              itemId={item._id}
              isComplet={item.complet}
              isPaused={item.paused}
              isTodoEdit={item.searchInput}
              isDisabled={item.isDisabled}
              timer={item.duration}
            />            
          ))}
        </div> 
      </div>
    </>
  )
}

