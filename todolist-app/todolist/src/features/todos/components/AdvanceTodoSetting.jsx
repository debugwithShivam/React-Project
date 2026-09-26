import React, { useEffect, useRef, useState } from 'react'
import api from '../../../services/api'
import { useQueryClient } from '@tanstack/react-query'
import ClickAudioFun from '../../../shared/utils/clickAudio'
import { setVoice } from '../../../store/Slice'
import { useDispatch } from 'react-redux'
export default function AdvanceTodoSetting() {

    let [paused, setPaused] = React.useState(false)
    let [complet, setComplet] = React.useState(false)
    const queryClient = useQueryClient()
    const firstRun = useRef(true)
    const sendToDB = async (pausedVal, completVal) => {
        let res = await api.patch('/allChange', {
            paused: pausedVal,
            complet: completVal
        })
        queryClient.invalidateQueries(['todoData'])
        return res.data
    }

    let pausedFun = () => {
        if (complet == true) { alert("Cannot pause a completed task"); return }
        let newpaused = !paused
        setPaused(newpaused)
        sendToDB(newpaused, false)
        ClickAudioFun('two')
    }

    let completFun = () => {
        if (paused == true) { alert("Cannot pause a completed task"); return }
        let newcomplet = !complet
        setComplet(newcomplet)
        sendToDB(false, newcomplet)
        ClickAudioFun('two')
    }



    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    let dispatch = useDispatch()

    useEffect(() => {
        const loadVoices = () => {
            const v = speechSynthesis.getVoices();
            setVoices(v);

            if (v.length > 0) {
                setSelectedVoice(v[0]);
            }
        };

        speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    }, []);


    return (
        <div className="make-option-container">
            <div className="Timer todo-make-option">
                <select onChange={(e) => dispatch(setVoice(voices[e.target.value]))}>
                    {voices.map((voice, i) => (
                        <option key={i} value={i}>
                            {voice.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="AllPaused todo-make-option" onClick={() => {
                pausedFun()
            }}>
                ❚❚
            </div>
            <div className="AllCompleted todo-make-option" onClick={() => {
                completFun()
            }}>
                ☑
            </div>
        </div>
    )
}
