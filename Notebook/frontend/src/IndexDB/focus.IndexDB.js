import Dexie from 'dexie'

export const db = new Dexie("TimerDB")


db.version(1).stores({
    timerSettings: "id",
    customTimer: "id",
    timerScores: "id"
});

