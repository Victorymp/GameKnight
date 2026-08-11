import './App.css'
import Home from './pages/Home'
import Game from './pages/Game'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { PlayerJoining } from './components/players/PlayerJoining'
import { PlayerJoined } from './components/players/PlayerJoined'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/game' element={<Game />} />
        <Route path='/game/:gameId' element={<Game />} />
        <Route path='/player/join/:gameId' element={<PlayerJoining/>} />
        <Route path='/player/joined/:gameId' element={<PlayerJoined/>} />
        <Route path='/' element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
