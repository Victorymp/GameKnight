import { useEffect, useState } from "react";
import type { GameData, Player, Image } from "../../models/model";
import { Screen, Header } from "../../components/ui/Screen";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import gameController from "../../components/controllers/game-controller";
import playerController from "../../components/controllers/player-controller";
import SideBar from "../../components/ui/SideBar";
import { fetchGame } from "../../api/api-controller";
import { useParams, useNavigate } from "react-router-dom";
import { connectWebSocket, sendGameSocketMessage, subscribeToGame } from "../../websocket/websocket";
import { ImageView } from "../../components/ui/ImageView";

export default function GameLobby() {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<GameData | null>(null);
  const [, setGameCodeQr] = useState<string | undefined>();
  const [, setIsLoading] = useState(false);
  const [, setError] = useState<string | undefined>();
  const [, setPlayers] = useState<Player[]>(playerController.getPlayers());
  const [, setThumbnail] = useState<Image | null>(null);
  const navigate = useNavigate();

  const gameCode = game?.gameCode;

  // 1. player controller subscription
  useEffect(() => {
    setPlayers(playerController.getPlayers());
    return playerController.subscribe(setPlayers);
  }, []);

  // 2. load the game by id — single source of truth for gameCode
  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;

    fetchGame(Number(gameId))
      .then((data) => {
        if (cancelled) return;
        setGame(data);
        const thumb = data.images?.find((im) => im.isThumbnails && im.isPrimary);
        setThumbnail(thumb ?? null);
      })
      .catch(() => setError("Failed to load game."));

    return () => { cancelled = true; };
  }, [gameId]);

  // 3. start the game — only once we have the CODE
  useEffect(() => {
    if (!gameCode) return;
    let cancelled = false;

    (async () => {
      setError(undefined);
      setIsLoading(true);
      try {
        const started = await gameController.startGame(gameCode);
        if (cancelled) return;

        const b64 = (started?.gameQrB64 ?? started?.qrImageBase64 ?? "") as string;
        setGameCodeQr(
          b64 ? (b64.startsWith("data:") ? b64 : `data:image/png;base64,${b64}`) : undefined
        );
        if (!b64) setError("No QR available for this game.");
      } catch {
        if (!cancelled) { setError("Failed to create game."); setGameCodeQr(undefined); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [gameCode]);

  // 4. ONE websocket effect, keyed on the code
  useEffect(() => {
    if (!gameCode) return;
    let off: (() => void) | undefined;
    let cancelled = false;

    connectWebSocket().then(() => {
      if (cancelled) return;
      sendGameSocketMessage(`/app/game/${gameCode}/reset`, {});
      off = subscribeToGame(gameCode, (msg) => {
        switch (msg?.type) {
          case "player:list":
            playerController.setPlayers(msg.payload?.players ?? []);
            break;
          case "game:reset":
            playerController.clear();
            break;
        }
      });
    });

    return () => { cancelled = true; off?.(); playerController.clear(); };
  }, [gameCode]);

  function beginGame() {
    if (!gameCode) { setError("No game loaded."); return; }
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
              <Card className="mb-16">
                <div className="flex flex-col gap-2 items-center m-1">
                {game && game.images?.length > 0 && (
                    <ImageView
                      imageId={game.images[0].id ?? 0}
                      title={game.images[0].title ?? ""}
                    />
                )}
                  <div className="flex flex-col items-center">
                    <p>{game?.gameTitle}</p>
                    <a/>
                    <Button onClick={beginGame} className="w-55">
                      Start Game 
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </main>
        </div>
      </Screen>
  );
}

