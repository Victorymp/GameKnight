import './App.css'
import Home from './pages/Home'
import Game from './pages/Game/Game'
import GameMake from './pages/Game/GameMake'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { PlayerJoining } from './components/players/PlayerJoining'
import { PlayerJoined } from './components/players/PlayerJoined'
import GamePlay from './pages/Game/GamePlay'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/game' element={<Game />} />
        <Route path='/game/make' element={<GameMake />} />
        <Route path='/game/:gameId' element={<GamePlay />} />
        <Route path='/player/join/:gameId' element={<PlayerJoining/>} />
        <Route path='/player/joined/:gameId' element={<PlayerJoined/>} />
        <Route path='/' element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
