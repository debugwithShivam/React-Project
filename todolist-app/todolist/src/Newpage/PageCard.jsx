import React, { useState } from 'react'
import { getPageDataFun } from '../Redux/Slice'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
export default function PageCard(props) {

  let queryClient = useQueryClient()
  let dispatch = useDispatch()
  let getPageData = useSelector((state) => state.states.getPageData)
  let navigate = useNavigate()
  let id = props.id
  let fav = props.Favourite


  let deleteFun = async (id) => {
    try {
      let res = await axios.delete(
        'http://localhost:3000/pageTodoDelet',
        {
          data: { id }
        }
      )

    } catch (err) {
      console.error(err)
    }
  }
  const mutation = useMutation({
    mutationFn: deleteFun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageData'] })
    }
  })

  let [favourite, setFavourite] = useState(props.favourite)

  let FavouriteFun = async (favouriteValue) => {
    try {
      let res = await axios.patch(
        'http://localhost:3000/favouritePage',
        {
          favourite: favouriteValue, id
        }
      )
      setFavourite(favouriteValue)
      queryClient.invalidateQueries({ queryKey: ['pageData'] });
    } catch (err) {
      console.error(err)
    }
  }

  let Toggle = () => {
    let newValue = !favourite
    FavouriteFun(newValue)

  }

  return (
    <div className="page-card">
      <div className="page-name"  onClick={Toggle}>
        <h2 style={{ color: favourite ? 'yellow' : 'white' }} >★</h2>
        <h2 onClick={() => { dispatch(getPageDataFun(props)); navigate('/CreateTodoPages') }}>{props.pageName}</h2>
      </div>
      <div className="description">
        {props.pageDescription}
        </div>
      <div className="tag-container">
        <p>Tags: {props.pagetag.join(', ')}</p>
      </div>
      <div className="page-delete"
        onClick={(e) => { mutation.mutate(id) }}
      >
        <h2>🗑️</h2>
      </div>
    </div>
  )
}
