import { Card } from "../components/ui/Card"

import { Menu, Search } from "lucide-react";

// Ui items
import { Button } from "../components/ui/Button";
import { Header, Screen } from "../components/ui/Screen";

import gameController from "../components/controllers/game-controller";

import { useState } from "react";

export default function Home() {

  const [gameCodeQr, setGameCodeQr] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function createGame() {
    setError(undefined);
    setIsLoading(true);
    try {
      const created = await gameController.createGame();
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
      {/* Testing the multiplayer connection */}
      <div className="flex flex-1 gap-2 py-3 px-3">

        <Card>
          <Button
            onClick={() => createGame() }
          >
            Start Game
          </Button>
        </Card>
      </div>
      <div className="flex flex-1 gap-2 py-3 px-3">
        <Card>
          {isLoading ? (
              <div>
                <span>Loading QR...</span>
              </div>
            ) : error ? (
              <div>
                <span>{error}</span>
              </div>
            ) : gameCodeQr ? (
              <div>
                <img src={gameCodeQr} alt="Game QR" />
                <span>Has code</span>
              </div>
            ) : (
              <div>
                <span>No code</span>
              </div>
            )}
        </Card>
      </div>
    </Screen>
  )
}