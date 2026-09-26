import React, { useContext, useMemo, useRef } from 'react'
import Todo from './Todo'
import { useState } from 'react'
import api from '../../../services/api'
import { useEffect } from 'react'
import { MyContext } from '../../../contexts/UIContext'
import { useQuery } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { CheckStar } from '../../../store/todoSlice'
import { FilterTodoContext } from '../../../contexts/FilterTodoContext'
import centerTodoData from '../../../contexts/CenterTodoContext'
import searchText from '../../../contexts/SearchTextContext'
import TodoTimer from './TodoTimer'

export default function TodoContainer({ itemId }) {
  let { todoData, setTodoData } = useContext(centerTodoData)

  const getTodoData = async () => {
    const res = await api.get('/searchTask')
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


  

  const { checked, setChecked } = useContext(FilterTodoContext)
  let { state, setState } = useContext(MyContext)
  let { SearchTextContext, setSearchBarText } = useContext(searchText)

  let todoFilter = useMemo(() => {
    let list = [...todoData]


    if (SearchTextContext) {
      return list.filter((item) => item.searchInput.includes(SearchTextContext))
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

  }, [todoData, checked, state, SearchTextContext])





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

