import React, { useEffect, useRef, useState, memo, useContext } from 'react'
import { useDispatch } from 'react-redux'
import { CheckStar } from '../Redux/Slice'
import { useSelector } from 'react-redux'
import { autoBatchEnhancer } from '@reduxjs/toolkit'
import axios from 'axios'
import textColorContext from '../stateManag/TextColorContetx'
import TodoTimer from './TodoTimer'
import centerTodoData from '../stateManag/CenterTodoata'
import TodoTimerBox from './TodoTimerBox'
import ClickAudioFun from '../ClickAudioFun'
import { useMutation, useQueryClient } from '@tanstack/react-query'
function Todo({ searchInput, itemId, isComplet, isPaused, isTodoEdit, isDisabled, timer }) {




  let queryClient = useQueryClient()
  const deleteTimer = async (id, duration, isDisabled) => {
    try {
      await axios.patch('http://localhost:3000/updateTimer', {
        id, duration, isDisabled
      })

    } catch (err) {
      console.log(err);

    }
  }


  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axios.delete(`http://localhost:3000/deteleTodo/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['todoData']
      })
    }
  })
  const deleteTodo = (id) => {
    deleteMutation.mutate(id)
  }


  const [showDeleteUI, setShowDeleteUI] = useState(false)
  useEffect(() => {
    if (timer != 0 && isDisabled) {
      setShowDeleteUI(true)
    }
  }, [timer, isDisabled])


  const [completed, setComplet] = useState(false)
  const [paused, setPaused] = useState(false)
  const [editValue, setEditValue] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [toggleTodo, setToggleTodo] = useState(false)

  const handle = async (id, completValue, pausedValue, Input, disabled) => {
    try {
      const res = await axios.patch('http://localhost:3000/completed', {
        id,
        complet: completValue,
        paused: pausedValue,
        searchInput: Input,
        isDisabled: disabled
      })
      setComplet(completValue)
      setPaused(pausedValue)
      setEditValue(Input)
      setDisabled(disabled)
    } catch (err) {
      console.log(err);
    }
  }



  const toggle = () => {
    if (paused == true) { alert('Todo Was Pasueded'); return }
    const newValue = !completed
    handle(itemId, newValue, paused, searchInput);
    ClickAudioFun('one')
  }

  const pausedToggle = () => {
    if (completed) { alert('Todo Was Completed'); return }
    const togglePaused = !paused
    handle(itemId, completed, togglePaused, searchInput);
    ClickAudioFun('one')
  }


  useEffect(() => {
    setComplet(isComplet);
    setPaused(isPaused);
    setEditValue(isTodoEdit);
    setDisabled(isDisabled)
  }, [isComplet, isPaused, isTodoEdit, isDisabled]);

  const { textColor, setTextColor } = useContext(textColorContext)





  let [audioText, setAudioText] = useState('')
  
  
  
  const selectedVoice = useSelector(state => state.states.selectedVoice)
  
  let audioOfTodo = () => {
  const utterance = new SpeechSynthesisUtterance(searchInput)

  if(selectedVoice){
    utterance.voice = selectedVoice
  }

  speechSynthesis.speak(utterance)
}

  return (
    <>
      <div className="Your_todo-container">
        <div className='Your_Todo Box'>
          <div className="completed" style={{ color: completed ? '#ebb128ff' : '#ffffffff', fontSize: '1.4rem' }} onClick={() => { toggle() }}>
            ★
          </div>
          <div className="you-task">
            {toggleTodo ? <input type="text" placeholder='Edit Toto' style={{ color: textColor, "--placeholder-color": textColor }} value={editValue} onChange={(e) => { setEditValue(e.target.value) }} onBlur={() => { handle(itemId, completed, paused, editValue); }} /> : <h3 style={{ color: textColor }}>
              {searchInput} <span className={paused ? 'paused' : ''}>{paused ? 'Paused' : ''}</span>
            </h3>}
          </div>
          <div className="paused todo-icon" style={{ marginRight: '9px' }} onClick={() => { pausedToggle() }}>
            {paused ? '⏸' : '▶'}
          </div>
          <div className="edit" style={{ color: '#734df1ff', fontSize: '1.4rem' }} onClick={() => { setToggleTodo(prev => !prev); ClickAudioFun('one') }}>
            ✎
          </div>
          <div className="delete todo-icon">
            <h3 onClick={() => { deleteTodo(itemId); ClickAudioFun('one') }} style={{ cursor: 'pointer' }} >🗑️</h3>
          </div>
          <div className="audio todo-icon">
            <h3 onClick={() => { audioOfTodo() }}  >🎧</h3>
          </div>
        </div>


        {isDisabled &&
          <TodoTimerBox endTimer={timer} id={itemId} onClick={() => { deleteTimer(itemId, 0, false) }} />
        }

      </div>
    </>
  )
}

export default memo(Todo)


// ▶︎

