import './App.css'
import Home from './pages/Home'
import Game from './pages/Game/Game'
import GameMake from './pages/Game/GameMake'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { PlayerJoining } from './pages/Player/PlayerJoining'
import GamePlay from './pages/Game/GamePlay'
import PlayerVotePage from './pages/Player/PlayerVotePage'
import GameLobby from './pages/Game/GameLobby'
import AlbumMake from './pages/Albums/AlbumMake'
import AlbumEdit from './pages/Albums/AlbumEdit'
import AlbumList from './pages/Albums/AlbumList'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/game' element={<Game />} />
        <Route path='/discover' element={<AlbumList/>} />
        <Route path='/game/make' element={<GameMake />} />
        <Route path='/game/:gameId' element={<GameLobby/>}/>
        <Route path='/game/:gameCode/host' element={<GamePlay/>} />
        <Route path="/albums" element={<AlbumList />} />  {/* list all albums, links to /new */}
        <Route path="/albums/new" element={<AlbumMake />} />
        <Route path="/albums/:id/edit" element={<AlbumEdit />} />
        <Route path='/player/join/:gameId' element={<PlayerJoining/>} />
        <Route path='/player/game/:gameCode' element={<PlayerVotePage />} />
        <Route path='/' element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
