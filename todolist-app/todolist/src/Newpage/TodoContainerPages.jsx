import { useQuery } from '@tanstack/react-query';
import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import EveryTodo from './EveryTodo';
import { useSelector } from 'react-redux';
import { getShiftTodoData } from '../Redux/Slice';
import { useDispatch } from 'react-redux';
export default function TodoContainerPages() {
    let getTodosData = async () => {
        try {
            let res = await axios.get('http://localhost:3000/GetTodo')
            return res.data.data
        } catch (err) {
            console.log(err)
        }
    }

    const { isLoading, error, data = [] } = useQuery({
        queryKey: ['everyPagesTodos'],
        queryFn: getTodosData
    })
    let pageId = JSON.parse(localStorage.getItem('pageData'))

    let selector = useSelector((state) => state.states.todoSetting)



    let Todo = useMemo(() => {
        let list = [...data]
        if (selector.searchText) {
            return list.filter((item) => item.title.toLowerCase().includes(selector.searchText.toLowerCase()))
        }

        if (selector.Popular) {
            return list.filter((item) => item.complet == true)
        }

        if (selector.latest) {
            return list.sort((a, b) => b.date - a.date)
        }
        return list
    }, [data,selector.searchText, selector.latest,selector.Popular])



    let dispatch = useDispatch()

  
   
    

    useEffect(()=>{
        if(Todo.length){
            dispatch(getShiftTodoData(Todo))
        }
    },[Todo,dispatch])

    if (isLoading) return <h1>Loading...</h1>
    if (error) return <h1>Error...</h1>



    return (
        <div className='container-for-every-todos-page'>
            {Todo.filter(item => item.pageId === pageId?.id).map((item) => (
                <EveryTodo
                    key={item._id}
                    id={item._id}
                    title={item.title}
                    pageId={item.pageId}
                    Pasued={item.Pasued}
                    complet={item.complet}
                    createdAt={item.createdAt}
                    duration={item.duration}
                />
            ))}
        </div>
    )
}
