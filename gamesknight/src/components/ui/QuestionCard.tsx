// src/components/game/QuestionCard.tsx
import { Card } from "../ui/Card";
import type { Image } from "../../models/model";
import { ImagePreview } from "./ImageView";
import { AnswerCard } from "./AnswerCard";

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
        <div className="flex justify-center mb-1">
          <ImagePreview 
            src={imgSrc}
            title={"Question"}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {question.answers.map((a, i) => {
          const count = counts[a.id] ?? 0;
          const isCorrect = revealed && a.id === correctAnswerId;
          return (
            <div>
              <AnswerCard 
                  key={a.id}
                  index={i}
                  correct={revealed && a.id === correctAnswerId}
                  revealed={revealed}
                  disabled={isCorrect}
                  className="h-full"
                  label={a.text}
                  count={count}
                />
            </div>
          );
        })}
      </div>
    </Card>
  );
}