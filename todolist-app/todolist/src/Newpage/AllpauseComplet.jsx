import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import React from 'react'
import { useState } from 'react'

export default function AllpauseComplet() {

    let [pasued, setpaused] = useState(false)
    let [completed, setCompleted] = useState(false)
    let pageId = JSON.parse(localStorage.getItem('pageData')) || []

    console.log(pageId);


    let queryClient = useQueryClient()



    const mutation  = useMutation({
        mutationFn: async ({ completVal, pausedVal }) => {
            return axios.patch('http://localhost:3000/updateMany', {
                pageId: pageId.id,
                complet: completVal,
                Pasued: pausedVal
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['everyPagesTodos']
            })
        }
    })

    const updatePauCom = (completVal, pausedVal) => {
        mutation.mutate({completVal,pausedVal})
    }

    let toggelPaused = (pageIdNum) => {
        if (completed == true) {
            alert('All todo was paused')
            return
        }
        let newValue = !pasued
        setpaused(newValue)
        updatePauCom(completed, newValue)
    }

    let toggelCompleted = (pageIdNum) => {
        if (pasued == true) {
            alert('All todo was paused')
            return
        }
        let newValue = !completed
        setCompleted(newValue)
        updatePauCom(newValue, pasued)
    }

    console.log(pasued);
    console.log(completed);


    return (
        <div style={{ display: 'flex' }}>
            <div className="every-pages-todos-paused todo-make-option" style={{ color: 'whitesmoke' }} onClick={() => {
                toggelPaused()
            }}>
                ❚❚
            </div>
            <div className="every-pages-todos-completed todo-make-option" style={{ color: 'whitesmoke' }} onClick={() => {
                toggelCompleted()
            }}>
                ☑
            </div>
        </div>
    )
}
