import {openDB} from 'idb'

export const dbPromise = openDB('BMIDB',1,{
    upgrade(db){
        db.createObjectStore('Bmi',{
            keyPath:'id',
            autoIncrement:true
        })
    }
})