import React, { useEffect, useMemo, useState } from 'react'
import BackgroundImages from '../images/img9.jpg'
import CreateTodoHeader from './CreateTodoHeader'
import CreatePageCard from './CreatePageCard'
import { useQuery } from '@tanstack/react-query'
import PageCard from './PageCard'
import axios from 'axios'
import getPageData from './FetchData'
import { useDispatch, useSelector } from 'react-redux'
import { getShiftPageData } from '../Redux/Slice'
export default function CustomTodopage() {


  let latest = useSelector((state) => state.states.latest)
  let Popular = useSelector((state) => state.states.Popular)
  let search = useSelector((state) => state.states.searchText)

  let dispatch = useDispatch()
  
  
  let { data=[], isLoading, isError } = useQuery({
    queryKey: ['pageData'],
    queryFn: getPageData,
  })


  let pagesTodo = useMemo(() => {
    let list = [...data]

    if (search) {
      return list.filter((item) =>item.pageName.toLowerCase().includes(search.toLowerCase()))
    }

    if (Popular) {
      return list.filter((item) => item.favourite == true)
    }

    if (latest) {
      return list.sort((a, b) => b.date - a.date)
    }
    return list

  }, [data, latest, Popular, search])


  
useEffect(() => {
  if (pagesTodo.length) {
    dispatch(getShiftPageData(pagesTodo))
  }
}, [pagesTodo, dispatch])

  

  return (
    <div className='custom-todo-pages' >
      <img src={BackgroundImages} alt="Custom background" width="100%" />
      <CreateTodoHeader />
      <CreatePageCard />
      <div className="todo-pages-container">
        {pagesTodo.map((page) =>
        (
          <PageCard
            key={page._id}
            favourite={page.favourite}
            id={page._id}
            pageName={page.pageName}
            pageDescription={page.pageDescription}
            pagetag={page.pagetag}
          />)
        )}
      </div>
    </div>
  )
}
