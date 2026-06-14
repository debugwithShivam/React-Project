import React from 'react'
import './Todo.css'
import axios from 'axios'
import { useEffect } from 'react'
import { useState } from 'react'
import ClickAudioFun from '../ClickAudioFun'
import { useMutation, useQueryClient } from '@tanstack/react-query'
export default function EveryTodo({ id, title, Pasued, complet, createdAt, duration, pageId }) {

  let [completedValue, SetCompletedValue] = useState(false)
  let [pausedValue, SetPausedValue] = useState(false)
  let data = JSON.parse(localStorage.getItem('pageData'))



  let queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axios.delete('http://localhost:3000/removeTodo', {
        data: { id }
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['everyPagesTodos']
      })
    }

  })
  const deleteTodo = (id) => {
    deleteMutation.mutate(id)
  }



  const [completed, setComplet] = useState(false)
  const [pausedVal, setPaused] = useState(false)
  const [editValue, setEditValue] = useState(false)
  const [toggleTodo, setToggleTodo] = useState(false)
  let update = async (id, userPasued, userCompleted, userTitle) => {
    try {
      let updateTodo = await axios.patch('http://localhost:3000/todoChange', {
        id,
        title: userTitle,
        Pasued: userPasued,
        complet: userCompleted
      });
      setComplet(userCompleted);
      setPaused(userPasued);
      setEditValue(userTitle);
      queryClient.invalidateQueries({
        queryKey: ['everyPagesTodos']
      })
    } catch (err) {
      console.log(err)
    }
  }



  const toggle = () => {
    if (pausedVal == true) { alert('Todo Was Pasueded'); return }
    const newValue = !completed
    update(id, Pasued, newValue,title);
    ClickAudioFun('one')
  }

  const pausedToggle = () => {
    if (completed == true) { alert('Todo Was Completed'); return }
    const togglePaused = !pausedVal
    update(id, togglePaused, complet,title);
    ClickAudioFun('one')
  }



  useEffect(() => {
    setComplet(complet);
    setPaused(Pasued);
    setEditValue(title);
  }, [complet, Pasued, title,]);

  return (
    <div>
      <section className="your_todo_container">
        <div className="todo_box">
          <div className="todo_complete" style={{ color: completed ? '#ebb128ff' : '#ffffffff', fontSize: '1.4rem' }} onClick={() => { toggle() }} >★</div>
          <div className="task_text">
            <label className="task_title">
              {toggleTodo ? <input type="text" placeholder='Edit Toto' value={editValue} onChange={(e) => { setEditValue(e.target.value) }} onBlur={() => { update(id, Pasued, complet, editValue); setToggleTodo(true) }} /> : <h3 >
                {editValue}
              </h3>}

              <span className={pausedVal ? 'paused' : ''}>{pausedVal ? 'Paused' : ''}</span>
            </label>
          </div>
          <div className="pause_icon" onClick={() => { pausedToggle() }} >{pausedVal ? '⏸' : '▶'}

          </div>
          <div className="edit_icon" onClick={() => { setToggleTodo(prev => !prev); ClickAudioFun('one') }} >✎ </div>
          <div className="delete_icon" onClick={() => { deleteTodo(id); ClickAudioFun('one') }} >🗑️</div>
          <div className="audio_icon" onClick={() => { window.speechSynthesis.speak(new SpeechSynthesisUtterance(editValue)) }} >🎧</div>
        </div>
      </section>
    </div>
  )
}
