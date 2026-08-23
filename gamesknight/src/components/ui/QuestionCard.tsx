// src/components/game/QuestionCard.tsx
import { Card } from "../ui/Card";
import type { Image } from "../../models/model";

const ANSWER_COLORS = ["bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-green-500"];
const ANSWER_LETTERS = ["A", "B", "C", "D"];

export type AnswerView = { id: number; text: string };
export type QuestionView = {
  id: number;
  text: string;
  answers: AnswerView[];
  images: Image[]
};

type QuestionImage = {
  type: string;
  content: string;
};

type Props = {
  question: QuestionView;
  counts?: Record<number, number>;
  correctAnswerId?: number | null;
  revealed?: boolean;
  image?: QuestionImage | null;
};

export function QuestionCard({
  question,
  counts = {},
  correctAnswerId = null,
  revealed = false,
  image = null,
}: Props) {
  const imgSrc = image
    ? image.content.startsWith("data:")
      ? image.content
      : `data:${image.type};base64,${image.content}`
    : null;

  return (
    <Card>
      <h2 className="text-3xl font-bold text-center my-6 text-black">{question.text}</h2>

      {imgSrc && (
        <div className="flex justify-center mb-6">
          <img src={imgSrc} alt="Question" className="max-h-64 rounded" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {question.answers.map((a, i) => {
          const count = counts[a.id] ?? 0;
          const isCorrect = revealed && a.id === correctAnswerId;
          return (
            <div
              key={a.id}
              className={`${ANSWER_COLORS[i]} rounded-lg p-6 flex flex-col text-white
                ${revealed && !isCorrect ? "opacity-40" : ""}
                ${isCorrect ? "ring-4 ring-white" : ""}
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl font-black">{ANSWER_LETTERS[i]}</span>
                <span className="text-xl">{a.text}</span>
              </div>
              <div className="text-3xl font-bold text-right mt-auto">{count}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}