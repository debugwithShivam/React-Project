import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { data } from 'react-router-dom'
export default function ShiftTodo() {
  let seleted = useSelector((state) => state.states.shiftTodo)


  let pageData = JSON.parse(localStorage.getItem('getpageData'))
  let pageId = JSON.parse(localStorage.getItem('pageData')) || []
  let todoData = useSelector((state) => state.states.shiftPageAndTodoData.todoData)

  let [pageIdNum, setPageId] = useState(null)
  let [todoId, setTodoId] = useState(null)

  let queryClient = useQueryClient()

  let changeTodoPage = useMutation({
    mutationFn: ({ id, pageId }) =>
      axios.patch('http://localhost:3000/changePageId', {
        id, pageId
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['everyPagesTodos']
      })
    }
  })



  useEffect(()=>{
    console.log(todoId)
    console.log(pageIdNum)
  },[pageIdNum,todoId])


  return (
    <div className='Shift-todo-container' style={{ display: seleted ? 'block' : 'none' }}>
      <div className="shift-todo">
        <div className="shift-todo-data shift">
          <h3>Pages</h3>
          {pageData.filter(item => item._id !== pageId?.id).map((item, i) => (
            <div className="shift-todo-name"
              key={i}
              onClick={() => setPageId(item._id)}
            >
              <h4>{item.pageName}</h4>
            </div>
          ))}
        </div>
        <div className="shift-page-data shift">
          <h3>Todos</h3>
          {todoData.filter(item => item.pageId === pageId?.id).map((item, i) => (
            <div className="shift-page-name"
              key={i}
              disabled={!todoId || !pageIdNum}
              onClick={() => setTodoId(item._id)}
            >
              <h4>{item.title}</h4>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() =>
          changeTodoPage.mutate({
            id: todoId,
            pageId: pageIdNum
          })
        }
      >Shift Todo</button>
    </div>
  )
}
