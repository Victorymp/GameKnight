import { useEffect, useState } from "react";
import { type GameData, type Player } from "../../models/model";
import { Screen, Header } from "../../components/ui/Screen";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import gameController from "../../components/controllers/game-controller";
import playerController from "../../components/controllers/player-controller";
import SideBar from "../../components/ui/SideBar";
import { getGameData } from "../../api/api-controller";
import { useParams, useNavigate } from "react-router-dom";
import { onGameSocketMessage } from "../../websocket/websocket-controller";
import { connectWebSocket, subscribeToGame } from "../../websocket/websocket";

export default function GameLobby() {
  const { gameId } = useParams<{ gameId: string }>();
  const [, setGame] = useState<GameData | null>(null);
  const [gameCodeQr, setGameCodeQr] = useState<string | undefined>();
  const [gameCode, setGameCode] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [players, setPlayers] = useState<Player[]>(playerController.getPlayers());
  const navigate = useNavigate();

  useEffect(() => {
    setPlayers(playerController.getPlayers());
    const unsubscribe = playerController.subscribe(setPlayers);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!gameId) return;

    const off = onGameSocketMessage((msg) => {
      if (msg?.type === "player:list") {
        const incoming = (msg.payload?.players ?? []) as Player[];
        playerController.setPlayers(incoming);
      }
    });

    return () => { off?.(); };
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;

    let off: (() => void) | undefined;
    connectWebSocket().then(() => {
      off = subscribeToGame(gameId, (msg) => {
        if (msg?.type === "player:list") {
          playerController.setPlayers(msg.payload?.players ?? []);
        }
      });
    });

    return () => { off?.(); };
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;
    const getGame: Omit<GameData, "id" | "gameQrB64"> = {
        gameCode: gameId ?? "",
        questions: [],
      };
    getGameData(getGame)
      .then((data) => setGame(data))
      .catch((error) => {
        console.error("Failed to load game data", error);
      });
  }, [gameId]);

  async function prepareGame() {
    console.log(`Game chosen: ${gameId}`);
    if (!gameId) {
      setError("Please enter a game code before starting.");
      return;
    }

    setError(undefined);
    setIsLoading(true);
    try {
      const started = await gameController.startGame(gameId);
      let b64: string  = started?.gameQrB64 as string;
      if (!b64){
        b64 = `${started?.qrImageBase64 ?? ""}` as string;
      }
      setGameCode(started?.gameCode);
      console.log(typeof b64);
      if (b64 && typeof b64 === "string") {
        const src = b64.startsWith("data:") ? b64 : `data:image/png;base64,${b64}`;
        setGameCodeQr(src);
      } else {
        setGameCodeQr(undefined);
        setError("No QR available for this game.");
      }
    } catch (err) {
      setError("Failed to create game.");
      setGameCodeQr(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  function beginGame() {
    if (!gameCode) {
      setError("No game loaded.");
      return;
    }
    if (players.length === 0) {
      setError("Need at least one player to start.");
      return;
    }
    setError(undefined);
    
    navigate(`/game/${gameCode}/host`);
  }

  return (
      <Screen>
        <Header/>
        <div className="flex flex-1">
          <SideBar className="w-56 shrink-0" />
          <main>
            <div className="flex flex-1 gap-2 py-3 px-3">
              <Card>
                <div className="flex flex-col gap-2">
                  <p>{gameId}</p>
                  { !gameCodeQr ? (
                  <Button onClick={prepareGame}>
                    Start Game
                  </Button>
                  ):(
                  <Button onClick={beginGame}>
                    Begin Game 
                  </Button>
                  )}
                </div>
              </Card>
            </div>
            <div className="flex flex-1 gap-2 py-3 px-3">
              <Card>
                {isLoading ? (
                  <div><span>Loading QR...</span></div>
                ) : error ? (
                  <div><span>{error}</span></div>
                ) : gameCodeQr ? (
                  <div>
                    <img src={gameCodeQr} alt="Game QR" />
                    <span>Has code: {gameCode}</span>
                  </div>
                ) : (
                  <div><span>No code</span></div>
                )}
              </Card>
            </div>
            <div className="flex flex-1 gap-2 py-3 px-3">
              <Card>
                <div className="flex flex-col gap-2">
                  <span className="font-semibold">Players joined: {players.length}</span>
                  <ul>
                    {players.map((player) => (
                      <li key={player.id}>{player.displayName}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          </main>
        </div>
      </Screen>
  );
}

