import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Screen, Header } from "../../components/ui/Screen";
import gameController from "../../components/controllers/game-controller";
import { useParams, useNavigate } from "react-router-dom";
import playerController from "../../components/controllers/player-controller";
import { connectWebSocket, subscribeToGame } from "../../websocket/websocket";

export function PlayerJoining() {
  const [name, setDisplayName] = useState<string>("");
  const [manualCode, setManualCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const effectiveGameId = gameId ?? manualCode;

  useEffect(() => {
    if (!effectiveGameId) return;
    let off: (() => void) | undefined;
    let cancelled = false;

    connectWebSocket().then(() => {
      if (cancelled) return;
      off = subscribeToGame(effectiveGameId, (msg) => {
        if (msg?.type === "player:list") {
          playerController.setPlayers(msg.payload?.players ?? []);
        }
      });
    });

    return () => { cancelled = true; off?.(); };
  }, [effectiveGameId]);

  const handleJoin = async () => {
    const trimmedName = name.trim();
    if (!effectiveGameId || !trimmedName) {
      setError("Enter a game code and display name.");
      return;
    }

    setError(null);
    setJoining(true);
    try {
      console.log(`Game Code: ${effectiveGameId}`);
      const { playerId, name: confirmedName } =
        await gameController.joinGame(effectiveGameId, trimmedName);

      sessionStorage.setItem(
        `player:${effectiveGameId}`,
        JSON.stringify({ playerId, name: confirmedName })
      );

      

      navigate(`/player/game/${effectiveGameId}`, {
        state: { playerId, name: confirmedName },
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
            value={name}
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