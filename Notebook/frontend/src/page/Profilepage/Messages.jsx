import React from 'react'
import useUnreadMessages from './useUnreadMessages'

export default function Messages() {

  const {data: unreadData,} = useUnreadMessages();

const totalUnread = unreadData?.total ?? 0;
  return (
    <div className="flex gap-3 items-center">

    <h1 className="text-2xl">
        Messages
    </h1>

  

</div>
  )
}
