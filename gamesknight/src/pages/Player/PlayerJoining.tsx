import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Screen, Header } from "../../components/ui/Screen";
import gameController from "../../components/controllers/game-controller";
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

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-sm flex-col gap-6"
        >
          {/* Code arrives in the URL from the QR scan, so when it's
              already known we show it rather than ask for it again. */}
          {gameId ? (
            <div className="flex flex-col items-center gap-2">
              <span className="font-pixel text-pixel-xs text-text-muted">
                GAME CODE
              </span>
              <div className="flex gap-1.5">
                {gameId.split("").map((char, i) => (
                  <span
                    key={i}
                    className={cn(
                      "flex h-12 w-10 items-center justify-center",
                      "border-4 border-ink bg-surface shadow-pixel-sm",
                      "font-pixel text-pixel-base text-ink"
                    )}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="game-code"
                className="font-pixel text-pixel-xs text-ink"
              >
                GAME CODE
              </label>
              <Input
                id="game-code"
                value={manualCode}
                autoCapitalize="characters"
                autoComplete="off"
                onChange={(event) =>
                  setManualCode(event.target.value.toUpperCase())
                }
                className={cn(
                  "h-14 rounded-none border-4 border-ink bg-surface",
                  "text-center font-pixel text-pixel-base tracking-[0.25em]",
                  "focus-visible:ring-0 focus-visible:shadow-[0_0_0_4px_var(--color-ink)]"
                )}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="display-name"
              className="font-pixel text-pixel-xs text-ink"
            >
              WHAT SHOULD WE CALL YOU?
            </label>
            <Input
              id="display-name"
              value={name}
              maxLength={16}
              autoFocus={!!gameId}
              placeholder="Your name"
              onChange={(event) => setDisplayName(event.target.value)}
              className={cn(
                "h-14 rounded-none border-4 border-ink bg-surface",
                "text-center font-pixel text-pixel-sm",
                "focus-visible:ring-0 focus-visible:shadow-[0_0_0_4px_var(--color-ink)]"
              )}
            />
          </div>

          {error && (
            <p
              role="alert"
              className={cn(
                "border-4 border-ink bg-error px-4 py-3 text-center",
                "font-pixel text-pixel-xs text-cloud"
              )}
            >
              {error}
            </p>
          )}

          <Button type="submit" size="lg" fullWidth disabled={joining}>
            {joining ? "Joining" : "Enter"}
          </Button>
        </form>
      </main>
    </Screen>
  );
}
