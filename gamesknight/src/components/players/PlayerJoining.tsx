import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import gameController from "../controllers/game-controller";
import { useParams, useNavigate } from "react-router-dom";
import type { GameData } from "../../models/model";

export function PlayerJoining() {
  const [displayName, setDisplayName] = useState<string>("");
  const [manualCode, setManualCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<GameData | null>(null);

  const navigate = useNavigate();

  const effectiveGameId = gameId ?? manualCode;

  useEffect(() => {
    if (!gameId) {
      console.log("No id in route");
      return;
    }
    console.log(gameId);
  }, [gameId]);

  function getOrCreatePlayerId(gameCode: string): string {
    const key = `player-id:${gameCode}`;
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  }

  const handleJoin = async () => {
    if (!effectiveGameId || !displayName) {
      setError("Enter a game code and display name.");
      return;
    }

    setError(null);
    setJoining(true);
    try {
      const playerId = getOrCreatePlayerId(effectiveGameId);
      await gameController.joinGame(effectiveGameId, { id: playerId, displayName });
      navigate(`/player/joined/${effectiveGameId}`);
    } catch (err) {
      console.error(err);
      setError("Couldn't join the game. Check the code and try again.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div>
      {!gameId && (
        <Card className="grid grid-cols-1 gap-4 justify-items-center">
          <p className="text-center">Enter game code</p>
          <Input
            className="text-center"
            value={manualCode}
            onChange={(event) => setManualCode(event.target.value)}
          />
        </Card>
      )}

      <Card className="grid grid-cols-1 gap-4 justify-items-center">
        <p className="text-center">Enter a display name</p>
        <Input
          className="text-center"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />
        {error && <p className="text-center text-red-500">{error}</p>}
        <Button onSelect={() => handleJoin()} disabled={joining}>
          {joining ? "Joining..." : "Enter"}
        </Button>
      </Card>
    </div>
  );
}