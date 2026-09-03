import { useState } from 'react'
import { Routes,Route } from 'react-router-dom'
import LobbyScreen from './screens/LobbyScreen'
function App() {

  return (
    <div>
    <Routes>
     <Route path='/' element={<LobbyScreen/>} />
    </Routes>
    </div>
  )
}

export default App
