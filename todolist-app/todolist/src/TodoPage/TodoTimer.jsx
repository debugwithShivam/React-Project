import React, { useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { saveTimer, timerComponentToggleFun } from '../Redux/Slice';
import centerTodoData from '../stateManag/CenterTodoata';
import axios from 'axios';

export default function TodoTimer() {

  // Disable TodoTimer Component
  const timerComponentToggleData = useSelector((state) => state.states.timerComponentToggle)

  // Select todo for add timer 
  const [optionValue, getOptionValue] = useState('')

  const dispatchFun = useDispatch()
  let { todoData, setTodoData } = useContext(centerTodoData);

  const updateTimer = async (id, duration, isDisabled) => {
    try {
      await axios.patch('http://localhost:3000/timer', {
        id,
        duration,
        isDisabled: true

      })
    } catch (err) {
      console.log(err);

    }
  }
  useEffect(() => {

    if (todoData.length === 1) {
      getOptionValue(todoData[0]._id)
    }

  }, [todoData])

  const timerData = useSelector((state) => state.states.timer)
  let duration = (timerData.hour * 60 * 60 * 1000) + (timerData.minutes * 60 * 1000) + (timerData.seconds * 1000)

  const changeTimer = () => {
    if (!optionValue || optionValue === '') {
      alert('Select Your Todo')
      return
    }
    if (timerData.hour === 0 && timerData.minutes == 0 && timerData.seconds == 0) {
      alert('Set a timer')
      return
    }




    updateTimer(optionValue, duration)

  }


  // set Timer and load in redux


  const [timer, setTimer] = useState({
    hour: 0,
    minutes: 0,
    seconds: 0,
  })

  const maxLimits = {
    hour: 12,
    minutes: 59,
    seconds: 59,
  }


  function increaseTimerFun(type) {
    setTimer(prev => {
      if (prev[type] >= maxLimits[type]) return prev

      return {
        ...prev,
        [type]: prev[type] + 1
      }
    })
  }
  function decreaseTimerFun(type) {
    setTimer(prev => {
      if (prev[type] <= 0) return prev

      return {
        ...prev,
        [type]: prev[type] - 1
      }
    })
  }

  useEffect(() => {
    dispatchFun(saveTimer(timer))
  }, [timer])

  function pad(value) {
    return String(value).padStart(2, 0)
  }



  function setTimerFun() {

    if (!optionValue || optionValue === '') {
      return alert('Select a todo first')
    }

    dispatchFun(timerComponentToggleFun())
    changeTimer();
    resetTimer()
  }

  const resetTimer = () => {
    setTimer({
      hour: 0,
      minutes: 0,
      seconds: 0,
    })
  }


  return (
    <div className='TodoTimer-container' style={{ visibility: timerComponentToggleData ? 'visible' : 'hidden' }} >
      <div className="setTimer-container">
        <div className="todo-name">
          <h3>
            SetTimer
          </h3>
          <h3 onClick={() => {
            dispatchFun(timerComponentToggleFun()); resetTimer()
          }}>X</h3>
        </div>
        <div className="timer-option">
          <button onClick={() => {
            setTimer({
              hour: 1,
              minutes: 0,
              seconds: 0,
            })
          }}>1 Houre</button>
          <button onClick={() => {
            setTimer({
              hour: 0,
              minutes: 10,
              seconds: 0,
            })
          }}>10min</button>
          <button onClick={() => {
            setTimer({
              hour: 0,
              minutes: 20,
              seconds: 0,
            })
          }}>20min</button>
          <button onClick={() => {
            setTimer({
              hour: 0,
              minutes: 30,
              seconds: 0,
            })
          }}>30min</button>
        </div>
        <div className="set-timer">
          <div className="set-timer-box hou"><h3 className='timer-inc-btn' onClick={() => { increaseTimerFun('hour') }} >˄</h3><h3 className='houre'>{pad(timer.hour)}</h3><h3 className='timer-dec-btn' onClick={() => { decreaseTimerFun('hour') }}>⌄</h3></div>
          <div className="set-timer-box min"><h3 className='timer-inc-btn' onClick={() => { increaseTimerFun('minutes') }} >˄</h3><h3 className='minutes'>{pad(timer.minutes)}</h3><h3 className='timer-dec-btn' onClick={() => { decreaseTimerFun('minutes') }}>⌄</h3></div>
          <div className="set-timer-box sec"><h3 className='timer-inc-btn' onClick={() => { increaseTimerFun('seconds') }} >˄</h3><h3 className='seconds'>{pad(timer.seconds)}</h3><h3 className='timer-dec-btn' onClick={() => { decreaseTimerFun('seconds') }}>⌄</h3></div>
        </div>
        <div className="timer-container-button">
          <button onClick={() => {
            setTimerFun()
          }} >Start</button>
          <button onClick={() => {
            resetTimer()
          }} >Reset</button>
        </div>
        <div className="choose-todo-setTimer">
          <select
            value={optionValue}
            onChange={(e) => {
              getOptionValue(e.target.value);;
            }} >
            <option value=" ">Select Your Todo</option>
            {todoData.filter(todo => !todo.isDisabled).map((todo, id) => (

              <option key={todo._id} disabled={todo.isDisabled} value={todo._id} >{todo.searchInput}</option>

            ))}
          </select>
        </div>
      </div>
    </div>
  )

}
