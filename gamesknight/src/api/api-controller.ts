import apiClient from "./api-client";
import { type GameData, type GameQr, type UserData } from "../models/model";

interface CreateGameRequest {
  gameCode: string;
}

export interface AnswerPayload {
  text: string;
  correct: boolean;
}

export interface QuestionPayload {
  text: string;
  imageData?: string;
  answers: AnswerPayload[];
}

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const result = queue.then(() => fn());
  queue = result.catch(() => {});
  return result;
}

export const startGame = (gameCode: string): Promise<GameData> =>
  enqueue(() =>
    apiClient
      .post<GameData>(`/game/startgame`, { gameCode }satisfies CreateGameRequest)
      .then((r) => r.data)
  );

export const createGame = (newGame: Omit<GameData, "id" | "gameQrB64">): Promise<GameData> =>
  enqueue(() => 
    apiClient
      .post<GameData>(`/game/creategame`, newGame )
      .then((r) => r.data)
  );

export const getGameQrCode = (gameId: string): Promise<GameQr> =>
  enqueue(() => apiClient(`/GameData/{${gameId}`).then((r) => r.data));

export const getAllGames = (): Promise<GameData[]> =>
  enqueue(() =>
    apiClient(`/game/all`).then((r) => r.data.content ?? r.data)
  );

export const getGameData = (gameId: string): Promise<GameData> =>
  enqueue(() => 
    apiClient
      .post(`/Game`, {gameId})
      .then((r) => r.data)
    );

export const getUser = (): Promise<UserData> =>
  enqueue(() => apiClient(`/users/me`).then((r) => r.data));

export const addQuestion = (gameId: string | number, question: QuestionPayload): Promise<unknown> =>
  enqueue(() =>
    apiClient
      .post(`/game/${gameId}/questions`, question)
      .then((r) => r.data)
  );

