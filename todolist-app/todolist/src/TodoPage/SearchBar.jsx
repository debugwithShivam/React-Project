import React, { useEffect, useRef } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import logo from './logo.png'
import { useContext } from 'react'
import textColorContext from '../stateManag/TextColorContetx'
import Notif from './notification.wav'
import AdvanceTodoSetting from './AdvanceTodoSetting'
export default function SearchBar() {
    const [searchInput, setSearchInput] = useState("")
    const queryClient = useQueryClient()

    let currant = Date.now()

    const sendToDB = async (e) => {
        
        let res = await axios.post('http://localhost:3000/search', {
            searchInput,
            currantDate: currant,
            paused: false,
            complet: false,
            timer: 0
        })

        return res.data
    }


    const mutation = useMutation({
        mutationFn: sendToDB,
        onSuccess: () => {
            setSearchInput('')
            queryClient.invalidateQueries({ queryKey: ['todoData'] })
        }
    })


    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!searchInput.trim()) return
        mutation.mutate()
        if (Notification.permission == 'granted') {
            new Notification("New Todo Added", {
                body: searchInput,
                icon: logo,
                silent: true,
                renotify: true,
                tag: 'Todo',
            })
            let audtio = new Audio(Notif)
            audtio.play()
        } else {
            console.error('No permission');

        }
    }


    useEffect(() => {
        Notification.requestPermission().then(permission => {
            if (permission !== 'granted') {
                console.warn('Notification Blocked by user');
            }
        })
    }, [])

    const { textColor, setTextColor } = useContext(textColorContext);

    return (
        <div className='Todo-search' >
            <form action="" onSubmit={handleSubmit}>
                <input type="search"
                    name="searchInput"
                    style={{ color: textColor, "--placeholder-color": textColor }}
                    onChange={(e) => { setSearchInput(e.target.value) }} value={searchInput}
                    placeholder='Add Todo'
                />
            </form>
         <AdvanceTodoSetting/>
        </div>
    )
}

