// src/components/game/AnswerGrid.tsx
import type { AnswerView } from "./QuestionCard";

const ANSWER_COLORS = ["bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-green-500"];
const ANSWER_LETTERS = ["A", "B", "C", "D"];

type Props = {
  answers: AnswerView[];
  selectedAnswerId?: number | null;
  correctAnswerId?: number | null;
  disabled?: boolean;
  onSelect: (answerId: number) => void;
  showText?: boolean;
};

export function AnswerGrid({
  answers,
  selectedAnswerId = null,
  correctAnswerId = null,
  disabled = false,
  onSelect,
  showText = false,
}: Props) {
  const isRevealed = correctAnswerId !== null;

  return (
    <div className="grid grid-cols-2 gap-3 flex-1 max-h-[70vh]">
      {answers.map((a, i) => {
        const isSelected = a.id === selectedAnswerId;
        const isCorrect = a.id === correctAnswerId;

        return (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            disabled={disabled || selectedAnswerId !== null}
            className={`${ANSWER_COLORS[i]} rounded-lg text-white font-bold flex flex-col items-center justify-center transition-all
              ${selectedAnswerId !== null && !isSelected ? "opacity-30" : ""}
              ${isRevealed && !isCorrect ? "opacity-30" : ""}
              ${isRevealed && isCorrect ? "ring-4 ring-white" : ""}
              ${isSelected ? "ring-4 ring-white" : ""}
              disabled:cursor-not-allowed
            `}
          >
            <div className="text-4xl">{ANSWER_LETTERS[i]}</div>
            {showText && <div className="text-base font-normal mt-2 px-2">{a.text}</div>}
          </button>
        );
      })}
    </div>
  );
}