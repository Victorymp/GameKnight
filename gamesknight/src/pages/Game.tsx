import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getGameData } from "../api/api-controller";
import { type GameData } from "../models/model";
import { Screen, Header } from "../components/ui/Screen";
import { Card } from "../components/ui/Card";

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<GameData | null>(null);

  useEffect(() => {
    if (!gameId) return;

    getGameData(gameId)
      .then((data) => setGame(data))
      .catch((error) => {
        console.error("Failed to load game data", error);
      });
  }, [gameId]);

  return (
    <Screen>
      <Header/>
      {/* render game data */}
      <div>{game ? game.gameCode : "Loading..."}</div>
      <div>
        <Card className="flex">
          <div>
            <h3>Join With</h3>
            <p>{game?.gameId}</p>
            <img src= {game?.gameQrB64} alt="Scan Game Qr"></img>
          </div>
        </Card>
      </div>
    </Screen>
  );
}