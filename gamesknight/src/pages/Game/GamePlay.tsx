import { useEffect, useState } from "react";
import gameController from "../../components/controllers/game-controller";
import type { Player, QuestionView, QuestionImage } from "../../models/model";
import { connectWebSocket, subscribeToGame } from "../../websocket/websocket";
import playerController from "../../components/controllers/player-controller";
import { Timer } from "../../components/ui/Timer";
import { QuestionCard } from "../../components/ui/QuestionCard";
import { fetchQuestionImage } from "../../api/api-controller";
import Leaderboard from "../../components/ui/Leaderboard";
import LobbyLeaderboard from "../../components/ui/LobbyLeaderboard";

type Phase = "lobby" | "get_ready" | "question" | "reveal" | "ended";


// type PlayerView = { id: string; name: string };

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
  const [questionImage, setQuestionImage] = useState<QuestionImage |null>(null);

  

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
    if (!question?.id) {
      setQuestionImage(null);
      return;
    }
    if (!question.hasImage) {
      setQuestionImage(null);
      return;
    }
      let cancelled = false;
      fetchQuestionImage(question.id).then((data) => {
        if (cancelled) return;
        setQuestionImage(data);
      });
      console.log(`Question Image set: ${question.id}`);

      return () => { cancelled = true; };
    }, [question?.id, question?.hasImage]);

  useEffect(() => {
    if (!game?.gameCode) return;

    let off: (() => void) | undefined;
    connectWebSocket().then(() => {
      off = subscribeToGame(game.gameCode, (msg) => {
        console.log(`Message type: ${msg?.type}`);
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
          case "leaderboard:update":
            if (msg.payload.players) {
                playerController.setPlayers(msg.payload.players);
              }
            break
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

  if (!game) return <div className="p-8">No game loaded.</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <header className="flex justify-between items-center mb-6">
        <div>
          <div className="text-sm opacity-70">Game code</div>
          <div className="text-3xl font-mono font-bold">{game.gameCode}</div>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-70">Players</div>
          <div className="text-3xl font-bold">{players.length}</div>
        </div>
      </header>

      {phase === "lobby" && (
        <div className="text-center mt-20">
          <h1 className="text-4xl font-bold mb-6">Scan QR to join</h1>
          {game.qrImageBase64 && (
            <img
              src={`data:image/png;base64,${game.qrImageBase64}`}
              alt="Join QR"
              className="mx-auto w-64 h-64 rounded-lg bg-white p-2"
            />
          )}
          {/*<ul className="my-6 space-y-1">
            {players.map((p) => (
              <li key={p.id} className="text-lg">{p.name}</li>
            ))}
          </ul>*/}
          <div className="mx-auto py-4">
            <LobbyLeaderboard
              players={playerController.getPlayers()}
              />
          </div>
          <button
            onClick={startGame}
            disabled={players.length === 0}
            className="mt-4 px-8 py-3 bg-green-500 rounded-lg text-xl font-bold disabled:opacity-40"
          >
            Start Game
          </button>
        </div>
      )}

      {phase === "get_ready" && question && (
        <div className="flex flex-col items-center justify-center h-full w-full gap-4 px-6">
          <div className="text-2xl mb-4">Get ready...</div>
          <h2 className="text-3xl font-bold text-center">{question.text}</h2>
          {questionImage && (
            <img
              src={`data:${questionImage.type};base64,${questionImage.content}`}
              alt="Question"
              className="max-h-64 rounded mt-6"
            />
          )}
          <div className="w-full max-w-3xl flex-1 min-h-0 overflow-y-auto">
            <Leaderboard players={playerController.getPlayers()} />
          </div>       
        </div>
      )}

      {(phase === "question" || phase === "reveal") && question && (
        <>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Question {questionIndex + 1} of {totalQuestions}</span>
              <span>{voterCount} / {players.length} voted</span>
            </div>
            <Timer msLeft={msLeft} totalMs={phaseDuration} />
          </div>

          <QuestionCard
            question={question}
            counts={counts}
            correctAnswerId={correctAnswerId}
            revealed={phase === "reveal"}
            image={questionImage}
          />
        </>
      )}

      {phase === "ended" && (
        <div className="text-center mt-20 gap-4">
          <h1 className="text-5xl font-bold">Results</h1>
          <Leaderboard 
            players={playerController.getPlayers()}/>
        </div>
      )}
    </div>
  );
}