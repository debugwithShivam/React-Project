import Dexie from 'dexie'

export const focusSetTimerDB = new Dexie("TimerDb")
export const setTiemrDB = new Dexie("SetTimer")
export const tiemrScoreDB = new Dexie("tiemrScore")

focusSetTimerDB.version(1).stores({
    time:"Focustimer, deepFocus, shortFocus, longFocus"
})


setTiemrDB.version(1).stores({
    setTimer:"hour, min, sec"
})

tiemrScoreDB.version(1).stores({
    score:"Sessions, Completed, focusTime"
})