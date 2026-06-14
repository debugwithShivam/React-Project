import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { shiftTodoFun } from '../Redux/Slice'
import ShiftTodo from './ShiftTodo'
import AllpauseComplet from './AllpauseComplet'
export default function AddTodo() {
  let [title, setTitle] = useState('')
  let queryClient = useQueryClient()
  let currant = Date.now()
  let pageId = JSON.parse(localStorage.getItem('pageData'))

  let date = Date.now()
  let sendTodoData = async () => {
    try {
      let res = await axios.post('http://localhost:3000/SetTodo', {
        title: title,
        Pasued: false,
        complet: false,
        createdAt: currant,
        pageId: pageId.id,
        duration: 0,
        date: date
      })
    } catch (err) {
      console.error(err)
    }
  }

  const mutation = useMutation({
    mutationFn: sendTodoData,
    onSuccess: () => {
      setTitle('')
      queryClient.invalidateQueries({ queryKey: ['everyPagesTodos'] })
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    mutation.mutate()
  }

  let dispatch = useDispatch()


  return (
    <div className='add-todos-for-everyPages'>
      <form action="" onSubmit={handleSubmit}>
        <input type="search"
          name="searchInput"
          style={{ color: "--placeholder-color" }}
          value={title} onChange={(e) => { setTitle(e.target.value) }}
          placeholder='Add Todo'
        />
      </form>
      <div className="make-option-container">
        <div className="week todo-make-option" style={{ color: 'white' }} >
          <ShiftTodo />
          <h2 onClick={() => { dispatch(shiftTodoFun()) }} >
            ⇅
          </h2>
        </div>
        <AllpauseComplet />
      </div>
    </div>
  )
}
