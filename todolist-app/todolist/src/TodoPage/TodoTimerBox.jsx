import React from 'react'
import { useEffect, useState, useContext } from 'react'
import centerTodoData from '../stateManag/CenterTodoata'

export default function TodoTimerBox({ endTimer, id, onClick }) {


  let { todoData, setTodoData } = useContext(centerTodoData)
  let [timerDuration, setDuration] = useState(() => {
    const saved = localStorage.getItem("duration")
    return saved ? JSON.parse(saved) : {}
  })
  useEffect(() => {
    localStorage.setItem("duration", JSON.stringify(timerDuration))
  }, [timerDuration])

  useEffect(() => {
    setDuration((prem) => {
      let end = { ...prem }
      todoData.forEach((item) => {

        if (item.duration && !end[item._id]) {
          end[item._id] = Date.now() + item.duration
        }
      })
      return end
    })
  }, [todoData])

  let [now, setNow] = useState(Date.now())


  useEffect(() => {
    let timerBox = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(timerBox)

  }, [])

  let timer = Object.entries(timerDuration).reduce((acc, [item, id]) => {

    let remaining = Math.max(0, id - now)

    acc[item] = {
      hours: Math.floor(remaining / 3600000),
      minutes: Math.floor((remaining % 3600000) / 60000),
      seconds: Math.floor((remaining % 60000) / 1000),
    }
    return acc
  }, {})



  // Object.entries

  let currentTimer = timer[id] || { hours: 0, minutes: 0, seconds: 0 }

  function deleteDuration(deleteDurationKey) {
    setDuration((prev) => {
      let update = { ...prev }
      delete update[deleteDurationKey]
      localStorage.setItem('duration', JSON.stringify(update))
      return update
    })
  }



  return (
    <div className="timer-set" >
      <div className="timer-view-box current-timer-box">
        <h3 >{String(currentTimer.hours).padStart(2, '0')}</h3>
        <h3>:</h3>
        <h3 >{String(currentTimer.minutes).padStart(2, '0')}</h3>
        <h3>:</h3>
        <h3 >{String(currentTimer.seconds).padStart(2, '0')}</h3>
        <div className="pause-icon-box">
          <h3>
            ||
          </h3>
        </div>
      </div>
      <div className="timer-box-settings current-timer-box">
        <h3  >⟲</h3>
        <h3 onClick={() => { deleteDuration(id); onClick() }} >🗑️</h3>
      </div>
    </div>
  )
}
