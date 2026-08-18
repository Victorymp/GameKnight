import { useState } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Screen, Header } from "../ui/Screen";
import gameController from "../controllers/game-controller";
import { useParams, useNavigate } from "react-router-dom";

export function PlayerJoining() {
  const [displayName, setDisplayName] = useState<string>("");
  const [manualCode, setManualCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const effectiveGameId = gameId ?? manualCode;

  const handleJoin = async () => {
    const trimmedName = displayName.trim();
    if (!effectiveGameId || !trimmedName) {
      setError("Enter a game code and display name.");
      return;
    }

    setError(null);
    setJoining(true);
    try {
      const { playerId, displayName: confirmedName } =
        await gameController.joinGame(effectiveGameId, trimmedName);

      sessionStorage.setItem(
        `player:${effectiveGameId}`,
        JSON.stringify({ playerId, displayName: confirmedName })
      );

      

      navigate(`/player/game/${effectiveGameId}`, {
        state: { playerId, displayName: confirmedName },
      });
    } catch (err) {
      console.error(err);
      setError("Couldn't join the game. Check the code and try again.");
    } finally {
      setJoining(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleJoin();
  };

  return (
    <Screen>
      <Header />
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" disabled={joining}>
            {joining ? "Joining..." : "Enter"}
          </Button>
        </Card>
      </form>
    </Screen>
  );
}