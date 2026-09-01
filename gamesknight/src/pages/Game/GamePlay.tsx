import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import gameController from "../../components/controllers/game-controller";
import playerController from "../../components/controllers/player-controller";
import { connectWebSocket, subscribeToGame } from "../../websocket/websocket";
import { fetchQuestionImage } from "../../api/api-controller";
import { Screen, Header } from "../../components/ui/Screen";
import { Button } from "../../components/ui/Button";
import { PixelTimer } from "../../components/ui/AnswerCard";
import { QuestionCard } from "../../components/ui/QuestionCard";
import Leaderboard from "../../components/ui/Leaderboard";
import LobbyLeaderboard from "../../components/ui/LobbyLeaderboard";
import type { Player, QuestionView, QuestionImage, HostPhase as Phase } from "../../models/model";


export default function GamePlay() {
  const game = gameController.getGame();
  const [phase, setPhase] = useState<Phase>("lobby");
  const [, setPlayerCount] = useState<number>(0);
  const [question, setQuestion] = useState<QuestionView | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(game?.questions.length ?? 0);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [voterCount, setVoterCount] = useState(0);
  const [players, setPlayers] = useState<Player[]>(playerController.getPlayers());
  const [correctAnswerId, setCorrectAnswerId] = useState<number | null>(null);
  const [phaseStart, setPhaseStart] = useState<number>(0);
  const [phaseDuration, setPhaseDuration] = useState<number>(30_000);
  const [msLeft, setMsLeft] = useState<number>(30_000);
  const [questionImage, setQuestionImage] = useState<QuestionImage | null>(null);

  useEffect(() => {
    setTotalQuestions(game?.questions.length ?? 0);
  }, [game?.questions.length]);

  useEffect(() => {
    if (phase !== "question") return;
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - phaseStart;
      setMsLeft(Math.max(0, phaseDuration - elapsed));
    }, 100);
    return () => window.clearInterval(interval);
  }, [phase, phaseStart, phaseDuration]);

  useEffect(() => {
    return playerController.subscribe(setPlayers);
  }, []);

  useEffect(() => {
    if (!question?.id || !question.hasImage) {
      setQuestionImage(null);
      return;
    }
    let cancelled = false;
    fetchQuestionImage(question.id).then((data) => {
      if (cancelled) return;
      setQuestionImage(data);
    });
    return () => { cancelled = true; };
  }, [question?.id, question?.hasImage]);

  useEffect(() => {
    if (!game?.gameCode) return;

    let off: (() => void) | undefined;
    connectWebSocket().then(() => {
      off = subscribeToGame(game.gameCode, (msg) => {
        console.log(`Msg type: ${msg.type}`);
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
          case "question:preload":
            setQuestion(msg.payload.question);
            setQuestionIndex(msg.payload.questionIndex);
            setTotalQuestions(msg.payload.totalQuestions);
            setPhaseDuration(msg.payload.phaseDurationMs);
            setPhaseStart(Date.now());
            setMsLeft(msg.payload.phaseDurationMs);
            setCounts({});
            setVoterCount(0);
            setCorrectAnswerId(null);
            setPhase("get_ready");
            break;
          case "score:show":
            if (msg.payload.players) {
              playerController.setPlayers(msg.payload.players);
            }
            setPhaseDuration(msg.payload.phaseDurationMs);
            setPhaseStart(Date.now());
            setPhase("score");
            break;
          case "question:show":
            setQuestion(msg.payload.question);
            setQuestionIndex(msg.payload.questionIndex);
            setTotalQuestions(msg.payload.totalQuestions);
            setPhaseDuration(msg.payload.phaseDurationMs);
            setPhaseStart(Date.now());
            setMsLeft(msg.payload.phaseDurationMs);
            setCounts({});
            setVoterCount(0);
            setCorrectAnswerId(null);
            setPhase("question");
            break;
          case "vote:update":
            setCounts(msg.payload.counts ?? {});
            setVoterCount(msg.payload.voterCount ?? 0);
            setPlayerCount(msg.payload.playerCount ?? 0);
            break;
          case "question:reveal":
            setCounts(msg.payload.counts ?? {});
            setCorrectAnswerId(msg.payload.correctAnswerId ?? null);
            if (msg.payload.players) {
              playerController.setPlayers(msg.payload.players);
            }
            setPhase("reveal");
            break;
          case "game:end":
            setPhase("ended");
            break;
        }
      });
    });

    return () => {
      off?.();
      playerController.clear();
    };
  }, [game?.gameCode]);

  function startGame() {
    gameController.send({
      destination: `/app/game/${game?.gameCode}/start`,
      body: {},
    });
  }

  if (!game) {
    return (
      <Screen>
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="font-pixel text-pixel-sm text-text-muted">
            No game loaded
          </p>
        </main>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header />

      <main className="flex flex-1 flex-col gap-6 px-6 py-6">
        {/* Code + player count. Hard-bordered tiles, no rounded chips. */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="font-pixel text-pixel-xs text-text-muted">
              GAME CODE
            </span>
            <div className="flex gap-1.5">
              {game.gameCode.split("").map((char, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex h-11 w-9 items-center justify-center",
                    "border-4 border-ink bg-surface shadow-pixel-sm",
                    "font-pixel text-pixel-base text-ink"
                  )}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="font-pixel text-pixel-xs text-text-muted">
              PLAYERS
            </span>
            <span
              className={cn(
                "flex h-11 min-w-11 items-center justify-center px-3",
                "border-4 border-ink bg-primary shadow-pixel-sm",
                "font-pixel text-pixel-base text-ink"
              )}
            >
              {players.length}
            </span>
          </div>
        </div>

        {phase === "lobby" && (
          <div className="flex flex-1 flex-col items-center gap-6">
            <h1 className="font-pixel text-pixel-lg text-ink">Scan to join</h1>

            {game.qrImageBase64 && (
              <img
                src={`data:image/png;base64,${game.qrImageBase64}`}
                alt="Scan this code to join the game"
                className="h-64 w-64 border-4 border-ink bg-cloud p-2 shadow-pixel"
                style={{ imageRendering: "pixelated" }}
              />
            )}

            <div className="w-full max-w-md">
              <LobbyLeaderboard players={playerController.getPlayers()} />
            </div>

            <Button
              size="lg"
              onClick={startGame}
              disabled={players.length === 0}
            >
              {players.length === 0 ? "Waiting for players" : "Start game"}
            </Button>
          </div>
        )}

        {phase === "get_ready" && question && (
          <div className="flex flex-1 flex-col items-center gap-5">
            <span className="font-pixel text-pixel-xs text-text-muted">
              GET READY
            </span>

            <h2
              className={cn(
                "w-full border-4 border-ink bg-surface shadow-pixel-lg",
                "px-6 py-8 text-center font-pixel text-pixel-lg leading-relaxed text-ink"
              )}
            >
              {question.text}
            </h2>

            {questionImage && (
              <img
                src={`data:${questionImage.type};base64,${questionImage.content}`}
                alt=""
                className="max-h-64 border-4 border-ink"
                style={{ imageRendering: "pixelated" }}
              />
            )}
            <div className="flex flex-1 flex-col items-center gap-5">
              <span className="font-pixel text-pixel-xs text-text-muted">
                STANDINGS
              </span>
              <div className="w-full max-w-3xl flex-1 min-h-0 overflow-y-auto">
                <Leaderboard players={playerController.getPlayers()} />
              </div>
            </div>
          </div>
        )}

        {(phase === "question" || phase === "reveal") && question && (
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex justify-between font-pixel text-pixel-xs text-text-muted">
              <span>
                QUESTION {questionIndex + 1} / {totalQuestions}
              </span>
              <span>
                {voterCount} / {players.length} VOTED
              </span>
            </div>

            <PixelTimer msLeft={msLeft} totalMs={phaseDuration} />

            <QuestionCard
              question={question}
              counts={counts}
              correctAnswerId={correctAnswerId}
              revealed={phase === "reveal"}
              image={questionImage}
            />
          </div>
        )}

        {phase === "ended" && (
          <div className="flex flex-1 flex-col items-center gap-6">
            <h1 className="font-pixel text-pixel-xl text-ink">Results</h1>
            <div className="w-full max-w-3xl flex-1 min-h-0 overflow-y-auto">
              <Leaderboard players={playerController.getPlayers()} />
            </div>
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
