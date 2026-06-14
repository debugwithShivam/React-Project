import React from 'react'
import img from './data.jpg'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createPage } from '../Redux/Slice'
import { useMutation, useQueryClient } from '@tanstack/react-query'
export default function CreatePageCard() {

  let dispatch = useDispatch()
  let [pageName, setPageName] = useState('')
  let [pageDescription, setPageDescription] = useState('')
  let [pageTags, setPageTags] = useState([])
  let queryClient = useQueryClient()

  let date = Date.now()
  let createTodopageFun = async (name, description, tags,) => {
    try {
      let res = await axios.post('http://localhost:3000/createPage', {
        pageName: name,
        pageDescription: description,
        pagetag: tags,
        favourite: false,
        date: date
      })
      setPageName('')
      setPageDescription('')
      setPageTags('')
      return res.data.data
    } catch (err) {
      console.log(err);
    }
  }

  const mutation = useMutation({
    mutationFn: createTodopageFun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageData'] })
    }
  })




  let selecter = useSelector((state) => state.states.createPage)
  return (
    <div className="create-page-wrapper" >
      <div className="create-page-card-container" style={{ display: selecter ? 'block' : 'none' }} >
        <div className="create-page-card">

          <div className="card-left">
            <img src={img} alt="visual" />
          </div>

          <div className="card-right">
            <div className="container-header">

              <h1>Create New Page</h1>
              <p>Build something powerful today</p>

              <div className="form-group">
                <input type="text" value={pageName} onChange={(e) => setPageName(e.target.value)} placeholder="Page Title" />
                <input type="text" value={pageDescription} onChange={(e) => setPageDescription(e.target.value)} placeholder="Page Description" />
                <input type="text" value={pageTags} onChange={(e) => setPageTags(e.target.value.split(','))} placeholder="Page Tags (comma separated)" />
              </div>

              <button onClick={() => {
                createTodopageFun(pageName, pageDescription, pageTags);
                dispatch(createPage());
                mutation.mutate()
              }
              }>Create Page</button>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
