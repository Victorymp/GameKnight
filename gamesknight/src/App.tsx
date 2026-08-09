import './App.css'
import Home from './pages/Home'
import Game from './pages/Game'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Player from './pages/Player'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/game' element={<Game />} />
        <Route path='/game/:gameId' element={<Game />} />
        <Route path='/player/join/:gameId' element={<Player/>} />
        <Route path='/player' element={<Player/>} />
        <Route path='/' element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
