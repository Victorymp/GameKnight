import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Header, Screen } from "../components/ui/Screen";
import gameController from "../components/controllers/game-controller";
import playerController from "../components/controllers/player-controller";
import type { Player } from "../models/model";
import { useEffect, useState } from "react";
import SideBar from "../components/ui/SideBar";

export default function Home() {
  const [gameCodeQr, setGameCodeQr] = useState<string | undefined>();
  const [gameCodeInput, setGameCodeInput] = useState<string>("");
  const [gameCode, setGameCode] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [players, setPlayers] = useState<Player[]>(playerController.getPlayers());

  useEffect(() => {
    setPlayers(playerController.getPlayers());
    const unsubscribe = playerController.subscribe(setPlayers);
    return unsubscribe;
  }, []);

  async function createGame() {
    if (!gameCodeInput) {
      setError("Please enter a game code before starting.");
      return;
    }

    setError(undefined);
    setIsLoading(true);
    try {
      const created = await gameController.createGame(gameCodeInput);
      setGameCode(created?.gameCode);
      const b64 = created?.gameQrB64;
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

  return (
    <Screen>
      <Header/>
      <div className="flex flex-1">
        <SideBar className="w-56 shrink-0" />
        <main>
          <div className="flex flex-1 gap-2 py-3 px-3">
            <Card>
              <div className="flex flex-col gap-2">
                <input
                  value={gameCodeInput}
                  onChange={(event) => setGameCodeInput(event.target.value)}
                  placeholder="Enter game code"
                  className="border p-2 rounded"
                />
                <Button onClick={() => createGame()}>
                  Start Game
                </Button>
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
                    <li key={player.id}>{player.name}</li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </Screen>
  )
}