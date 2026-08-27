import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import gameController from "../../components/controllers/game-controller";
import playerController from "../../components/controllers/player-controller";
import { subscribeToGame, connectWebSocket } from "../../websocket/websocket";
import { Screen, Header } from "../../components/ui/Screen";
import { AnswerCard } from "../../components/ui/AnswerCard";
import Leaderboard from "../../components/ui/Leaderboard";
import LobbyLeaderboard from "../../components/ui/LobbyLeaderboard";
import type { PlayerQuestion, PlayerPhase as Phase } from "../../models/model";



function getStoredPlayer(gameCode: string): { playerId: string; name: string } | null {
  const raw = sessionStorage.getItem(`player:${gameCode}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.playerId === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

export default function PlayerVotePage() {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();

  const playerId = useMemo(
    () => (gameCode ? getStoredPlayer(gameCode)?.playerId ?? null : null),
    [gameCode]
  );

  const playerName = useMemo(
    () => (gameCode ? getStoredPlayer(gameCode)?.name ?? null : null),
    [gameCode]
  );

  const [phase, setPhase] = useState<Phase>("waiting");
  const [question, setQuestion] = useState<PlayerQuestion | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [correctAnswerId, setCorrectAnswerId] = useState<number | null>(null);

  useEffect(() => {
    if (!gameCode) return;
    let off: (() => void) | undefined;
    connectWebSocket().then(() => {
      off = subscribeToGame(gameCode, (msg) => {
        switch (msg?.type) {
          case "player:list":
            playerController.setPlayers(
              (msg.payload?.players ?? []).map((player: { id: string; name?: string; score?: number, rank?: number }) => ({
                id: player.id,
                name: player.name ?? "Player",
                score: player.score ?? 0,
                rank: player.rank ?? 0
              })),
            );
            break;
          case "question:show":
            setQuestion(msg.payload.question);
            setSelectedAnswerId(null);
            setCorrectAnswerId(null);
            setPhase("voting");
            break;
          case "score:show":
            if (msg.payload.players) {
              playerController.setPlayers(msg.payload.players);
            }
            setPhase("score");
            break;
          case "leaderboard:update":
            if (msg.payload.players) {
              playerController.setPlayers(msg.payload.players);
            }
            break;
          case "question:preload":
            setQuestion(msg.payload.question);
            setSelectedAnswerId(null);
            setCorrectAnswerId(null);
            setPhase("get_ready");
            break;
          case "question:reveal":
            setCorrectAnswerId(msg.payload.correctAnswerId);
            if (msg.payload.players) {
              playerController.setPlayers(msg.payload.players);
            }
            setPhase("reveal");
            break;
          case "game:end":
            setPhase("ended");
            break;
          case "game:reset":
            sessionStorage.removeItem(`player:${gameCode}`);
            navigate(`/player/join/${gameCode}`);
            break;
        }
      });
    });

    return () => { off?.(); };
  }, [gameCode]);

  if (!playerId || !gameCode) {
    return <Navigate to={`/player/join/${gameCode ?? ""}`} replace />;
  }

  function submitVote(answerId: number) {
    if (!question || selectedAnswerId !== null) return;
    setSelectedAnswerId(answerId);
    setPhase("voted");
    gameController.send({
      destination: `/app/game/${gameCode}/vote`,
      body: { playerId, questionId: question.id, answerId },
    });
  }

  const revealed = phase === "reveal";
  const gotItRight = revealed && selectedAnswerId === correctAnswerId;

  return (
    <Screen>
      <Header
        playerName={playerName?? ""}
        initial={playerName ?? "?"}
      />

      <main className="flex flex-1 flex-col px-4 py-4">
        {phase === "waiting" && (
          <div className="m-auto flex w-full max-w-md flex-col items-center gap-6">
            <p className="font-pixel text-pixel-base text-center text-ink">
              Waiting for the host
            </p>
            <LobbyLeaderboard
              players={playerController.getPlayers()}
              currentPlayerId={playerId}
            />
          </div>
        )}

        {phase === "get_ready" && question && (
          <div className="flex flex-1 flex-col items-center gap-5">
            <span className="font-pixel text-pixel-xs text-text-muted">
              GET READY
            </span>
            <h2
              className={cn(
                "w-full border-4 border-ink bg-surface shadow-pixel",
                "px-5 py-6 text-center font-pixel text-pixel-base leading-relaxed text-ink"
              )}
            >
              {question.text}
            </h2>
          </div>
        )}

        {(phase === "voting" || phase === "voted" || revealed) && question && (
          <div className="flex flex-1 flex-col gap-4">
            {/* Small — the full question is on the big screen. The
                phone's job is four large tap targets. */}
            <p className="px-1 text-center text-sm text-text-muted">
              {question.text}
            </p>

            <div className="grid flex-1 grid-cols-2 gap-3">
              {question.answers.map((a, i) => (
                <AnswerCard
                  key={a.id}
                  index={i}
                  selected={a.id === selectedAnswerId}
                  correct={revealed && a.id === correctAnswerId}
                  revealed={revealed}
                  disabled={phase !== "voting"}
                  onClick={() => submitVote(a.id)}
                  className="h-full"
                />
              ))}
            </div>

            {phase === "voted" && (
              <div
                role="status"
                className={cn(
                  "border-4 border-ink bg-surface px-4 py-3 text-center",
                  "font-pixel text-pixel-xs uppercase text-ink"
                )}
              >
                Locked in — waiting for everyone else
              </div>
            )}

            {revealed && selectedAnswerId !== null && (
              <div
                role="status"
                className={cn(
                  "border-4 border-ink px-4 py-3 text-center",
                  "font-pixel text-pixel-sm uppercase text-cloud",
                  gotItRight ? "bg-success" : "bg-accent"
                )}
              >
                {gotItRight ? "Correct" : "Not this time"}
              </div>
            )}

            {revealed && selectedAnswerId === null && (
              <div
                role="status"
                className={cn(
                  "border-4 border-ink bg-surface px-4 py-3 text-center",
                  "font-pixel text-pixel-xs uppercase text-text-muted"
                )}
              >
                No answer this round
              </div>
            )}
          </div>
        )}

        {phase === "ended" && (
          <div className="m-auto flex w-full max-w-md flex-col items-center gap-6">
            <p className="font-pixel text-pixel-lg text-ink">Game over</p>
            <Leaderboard
              players={playerController.getPlayers()}
              currentPlayerId={playerId}
            />
          </div>
        )}

        {phase === "score" && (
          <div className="flex flex-1 flex-col items-center gap-5">
            <span className="font-pixel text-pixel-xs text-text-muted">
              STANDINGS
            </span>
            <div className="w-full max-w-3xl flex-1 min-h-0 overflow-y-auto">
              <Leaderboard players={playerController.getPlayers()} />
            </div>
          </div>
        )}
        
      </main>
    </Screen>
  );
}
