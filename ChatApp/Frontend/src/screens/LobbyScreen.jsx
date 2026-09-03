import React, { useCallback, useState } from 'react'
import { useSocket } from '../context/SocketProvider'

export default function LobbyScreen() {
  const [email, setEmail] = useState()
  const [room, setRoom] = useState()

  const socket = useSocket()
  console.log(socket)

  const handleSubmitForm = useCallback((e) => {
    e.preventDefault();
  socket.emit("room:join",{email,room})
  },[email,room,socket])

  return (
    <div>
      <h1>Lobby</h1>
      <form action="" onSubmit={handleSubmitForm}>
        <label htmlFor="email">Email ID</label>
        <input type="email" id='email' value={email} onChange={(e) => {
          setEmail(e.target.value);
        }} />
        <br />
        <label htmlFor="RoomNumber">Room Number</label>
        <input type="text" id='RoomNumber' value={room} onChange={(e) => {
          setRoom(e.target.value)
        }} />
        <br />
        <button>Join</button>
      </form>
    </div>
  )
}
