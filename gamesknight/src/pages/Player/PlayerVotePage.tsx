import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import gameController from "../../components/controllers/game-controller";
import { onGameSocketMessage } from "../../websocket/websocket-controller";

const ANSWER_COLORS = ["bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-green-500"];
const ANSWER_LETTERS = ["A", "B", "C", "D"];

type PlayerQuestion = {
  id: number;
  text: string;
  answers: { id: number; text: string }[];
};

type Phase = "waiting" | "voting" | "voted" | "reveal" | "ended";

function getStoredPlayer(gameCode: string): { playerId: string; displayName: string } | null {
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
  const game = gameController.getGame();
  const { gameCode } = useParams<{ gameCode: string }>();
  // const gameCode = game?.gameCode;

  console.log(`Current Session: ${sessionStorage.getItem(`player:${gameCode}`)}`)

  // Read once at mount from sessionStorage — no state needed
  const playerId = useMemo(
    () => (gameCode ? getStoredPlayer(gameCode)?.playerId ?? null : null),
    [gameCode]
  );

  const [phase, setPhase] = useState<Phase>("waiting");
  const [question, setQuestion] = useState<PlayerQuestion | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [correctAnswerId, setCorrectAnswerId] = useState<number | null>(null);

  useEffect(() => {
    const off = onGameSocketMessage((msg) => {
      switch (msg?.type) {
        case "question:show":
          setQuestion(msg.payload.question);
          setSelectedAnswerId(null);
          setCorrectAnswerId(null);
          setPhase("voting");
          break;
        case "question:reveal":
          setCorrectAnswerId(msg.payload.correctAnswerId);
          setPhase("reveal");
          break;
        case "game:end":
          setPhase("ended");
          break;
      }
    });
    return () => { off?.(); };
  }, []);

  // If no identity, kick back to the join page
  console.log(`Player Id: ${playerId} and Game Code: ${gameCode}`)
  if (!playerId || !gameCode) {
    return <Navigate to={`/player/join/${gameCode ?? ""}`} replace />;
  }

  function submitVote(answerId: number) {
    if (!question || selectedAnswerId !== null) return;
    setSelectedAnswerId(answerId);
    setPhase("voted");
    gameController.send({
      destination: `/app/game/${gameCode}/vote`,
      body: {
        playerId,
        questionId: question.id,
        answerId,
      },
    });
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col p-4">
      {phase === "waiting" && (
        <div className="m-auto text-center">
          <div className="text-2xl">Waiting for the game to start...</div>
        </div>
      )}

      {(phase === "voting" || phase === "voted" || phase === "reveal") && question && (
        <>
          <div className="text-center text-lg mb-6">{question.text}</div>
          <div className="grid grid-cols-2 gap-3 flex-1 max-h-[70vh]">
            {question.answers.map((a, i) => {
              const isSelected = a.id === selectedAnswerId;
              const isCorrect = a.id === correctAnswerId;
              const isRevealed = phase === "reveal";
              return (
                <button
                  key={a.id}
                  onClick={() => submitVote(a.id)}
                  disabled={phase !== "voting"}
                  className={`${ANSWER_COLORS[i]} rounded-lg text-white font-bold text-2xl flex items-center justify-center
                    ${phase === "voted" && !isSelected ? "opacity-30" : ""}
                    ${isRevealed && !isCorrect ? "opacity-30" : ""}
                    ${isRevealed && isCorrect ? "ring-4 ring-white" : ""}
                    ${isSelected ? "ring-4 ring-white" : ""}
                    disabled:cursor-not-allowed transition-all
                  `}
                >
                  {ANSWER_LETTERS[i]}
                </button>
              );
            })}
          </div>
          {phase === "voted" && (
            <div className="text-center mt-4 text-lg">
              Answer locked in — waiting for others...
            </div>
          )}
          {phase === "reveal" && selectedAnswerId === correctAnswerId && (
            <div className="text-center mt-4 text-2xl text-green-400 font-bold">
              Correct! 🎉
            </div>
          )}
          {phase === "reveal" && selectedAnswerId !== correctAnswerId && selectedAnswerId !== null && (
            <div className="text-center mt-4 text-2xl text-red-400 font-bold">
              Not this time
            </div>
          )}
        </>
      )}

      {phase === "ended" && (
        <div className="m-auto text-center">
          <div className="text-4xl font-bold">Game Over!</div>
        </div>
      )}
    </div>
  );
}