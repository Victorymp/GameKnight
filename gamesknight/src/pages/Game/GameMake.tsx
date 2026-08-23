import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Screen, Header } from "../../components/ui/Screen";
import SideBar from "../../components/ui/SideBar";
import type { Question, Answer, Image, GameData } from "../../models/model";
import { createGame } from "../../api/api-controller";

const MAX_ANSWERS = 4;

function newAnswer(): Answer {
  return { id: generateUuidFallback(), text: "", correct: false };
}

function newQuestion(): Question {
  return {
    id: generateUuidFallback(),
    text: "",
    answers: [newAnswer(), newAnswer()],
    images: [],
  };
}

function generateUuidFallback(): string {
  const bytes = typeof crypto?.getRandomValues === "function"
    ? crypto.getRandomValues(new Uint8Array(16))
    : new Uint8Array(16).map(() => Math.floor(Math.random() * 256));

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return [...bytes].map((b, i) =>
    (b + 0x100).toString(16).slice(1) +
    ([4, 6, 8, 10].includes(i) ? "-" : "")
  ).join("");
}

function generateGameCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Extract MIME type and pure base64 from a data URL like "data:image/png;base64,iVBOR..."
function parseDataUrl(dataUrl: string): { type: string; content: string } {
  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!match) return { type: "image/png", content: dataUrl };
  return { type: match[1], content: match[2] };
}

export default function GameMake() {
  const [gameTitle, setGameTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([newQuestion()]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdGame, setCreatedGame] = useState<GameData | null>(null);

  function addQuestionCard() {
    setQuestions((qs) => [...qs, newQuestion()]);
  }

  function removeQuestion(questionId: string) {
    setQuestions((qs) => qs.filter((q) => q.id !== questionId));
  }

  function updateQuestionText(questionId: string, text: string) {
    setQuestions((qs) =>
      qs.map((q) => (q.id === questionId ? { ...q, text } : q))
    );
  }

  function handleImageChange(questionId: string, file: File | null) {
    if (!file) {
      setQuestions((qs) =>
        qs.map((q) =>
          q.id === questionId ? { ...q, images: [] } : q
        )
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const { type, content } = parseDataUrl(dataUrl);

      const image: Image = {
        isThumbnails: false,
        isPrimary: true,
        type,
        category: "IMAGE",
        title: file.name,
        content,
      };

      setQuestions((qs) =>
        qs.map((q) =>
          q.id === questionId ? { ...q, images: [image] } : q
        )
      );
    };
    reader.readAsDataURL(file);
  }

  function addAnswer(questionId: string) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === questionId && q.answers.length < MAX_ANSWERS
          ? { ...q, answers: [...q.answers, newAnswer()] }
          : q
      )
    );
  }

  function removeAnswer(questionId: string, answerId: string) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === questionId
          ? { ...q, answers: q.answers.filter((a) => a.id !== answerId) }
          : q
      )
    );
  }

  function updateAnswerText(questionId: string, answerId: string, text: string) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a.id === answerId ? { ...a, text } : a
              ),
            }
          : q
      )
    );
  }

  function setCorrectAnswer(questionId: string, answerId: string) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.map((a) => ({
                ...a,
                correct: a.id === answerId,
              })),
            }
          : q
      )
    );
  }

  function validate(): string | null {
    if (questions.length === 0) return "Add at least one question.";
    for (const q of questions) {
      if (!q.text.trim()) return "Every question needs text.";
      if (q.answers.length < 2) return "Every question needs at least 2 answers.";
      if (q.answers.some((a) => !a.text.trim())) return "Every answer needs text.";
      if (!q.answers.some((a) => a.correct)) return "Mark one correct answer per question.";
    }
    return null;
  }

  async function handleSave() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      const code = generateGameCode();

      const newGame: Omit<GameData, "id" | "gameQrB64"> = {
        gameCode: code,
        questions,
        images: [],  // game-level images (none for now)
      };

      const game = await createGame(newGame);

      if (!game?.id) {
        throw new Error("Game creation did not return an id");
      }

      setCreatedGame(game);
    } catch (err) {
      console.error(err);
      setError("Failed to save game.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleMakeAnother() {
    setCreatedGame(null);
    setQuestions([newQuestion()]);
    setGameTitle("");
    setError(null);
  }

  if (createdGame) {
    const qrSrc = createdGame.qrImageBase64
      ? `data:image/png;base64,${createdGame.qrImageBase64}`
      : undefined;

    return (
      <Screen>
        <Header />
        <div className="flex flex-1">
          <SideBar />
          <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto items-center">
            <Card className="flex flex-col gap-3 p-4 items-center">
              <p className="font-semibold">Game created!</p>
              {qrSrc && <img src={qrSrc} alt="Game QR" />}
              <p>Game code: {createdGame.gameCode}</p>
              <Button onClick={handleMakeAnother}>Make another game</Button>
            </Card>
          </div>
        </div>
      </Screen>
    );
  }

  // Helper to build image preview URL from stored Image
  function imagePreview(img: Image): string {
    return img.content.startsWith("data:")
      ? img.content
      : `data:${img.type};base64,${img.content}`;
  }

  return (
    <Screen>
      <Header />
      <div className="flex flex-1">
        <SideBar />
        <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
          <Card className="flex flex-col gap-2 p-4">
            <p className="font-semibold">Quiz Title</p>
            <Input
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              placeholder="Enter quiz title"
            />
          </Card>

          {questions.map((question, qIndex) => (
            <Card key={question.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Question {qIndex + 1}</p>
                {questions.length > 1 && (
                  <Button
                    className="text-sm"
                    onClick={() => removeQuestion(question.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <Input
                value={question.text}
                onChange={(e) => updateQuestionText(question.id, e.target.value)}
                placeholder="Question text"
              />

              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange(question.id, e.target.files?.[0] ?? null)
                  }
                />
                {question.images && question.images.length > 0 && (
                  <img
                    src={imagePreview(question.images[0])}
                    alt="Question"
                    className="max-h-40 rounded border"
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Answers (mark the correct one)</p>
                {question.answers.map((answer, aIndex) => (
                  <div key={answer.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={answer.correct}
                      onChange={() => setCorrectAnswer(question.id, answer.id)}
                    />
                    <Input
                      className="flex-1"
                      value={answer.text}
                      onChange={(e) =>
                        updateAnswerText(question.id, answer.id, e.target.value)
                      }
                      placeholder={`Answer ${aIndex + 1}`}
                    />
                    {question.answers.length > 2 && (
                      <Button
                        className="text-sm"
                        onClick={() => removeAnswer(question.id, answer.id)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                {question.answers.length < MAX_ANSWERS && (
                  <Button className="text-sm" onClick={() => addAnswer(question.id)}>
                    + Add answer
                  </Button>
                )}
              </div>
            </Card>
          ))}

          <Button onClick={addQuestionCard}>+ Add question</Button>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save game"}
          </Button>
        </div>
      </div>
    </Screen>
  );
}