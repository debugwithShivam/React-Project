import React from 'react'
import ProfilePageHeader from '../page/Profilepage/ProfilePageHeader'
import ChatSeaction from '../page/Profilepage/ChatSeaction'
import { useSelector } from 'react-redux'

export default function ProfilePage() {

  return (
    <div className='flex drag-region no-drag hide-scrollbar overflow-y-auto justify-center '>
      <ProfilePageHeader/>
    </div>
  )
}
