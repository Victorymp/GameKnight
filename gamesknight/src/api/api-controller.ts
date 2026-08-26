import apiClient from "./api-client";
import type { GameData, GameQr, QuestionImage, Image, Album, Player } from "../models/model";

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
  enqueue(() => apiClient(`/game/${gameId}`).then((r) => r.data));

export const getAllGames = (): Promise<GameData[]> =>
  enqueue(() =>
    apiClient(`/game/all`).then((r) => r.data.content ?? r.data)
  );

export const getGameData = (newGame: Omit<GameData, "id" | "gameQrB64">): Promise<GameData> =>
  enqueue(() => 
    apiClient
      .post(`/game`, newGame)
      .then((r) => r.data)
    );

export const fetchGame = (id: number): Promise<GameData> =>
  enqueue(() => apiClient(`/game/${id}`).then((r) => r.data))

export const getUser = (): Promise<Player> =>
  enqueue(() => apiClient(`/users/me`).then((r) => r.data));

export const addQuestion = (gameId: string | number, question: QuestionPayload): Promise<unknown> =>
  enqueue(() =>
    apiClient
      .post(`/game/${gameId}/questions`, question)
      .then((r) => r.data)
  );

export const fetchImage = (imageId: number): Promise<Image> =>
  enqueue(() =>
    apiClient
      .get<Image>(`/image/${imageId}`)
      .then((r)=> r.data))

export const fetchQuestionImage = (questionId: number): Promise<QuestionImage | null> =>
  enqueue(() =>
    apiClient
      .get<QuestionImage>(`/question/${questionId}/image`)
      .then((r)=> r.data)
      .catch((err) => {
      // 404 = question has no image, not an error worth logging loudly
      if (err.response?.status === 404) return null;
      console.error("Failed to fetch question image", err);
      return null;
    }));


export const fetchAlbums = (): Promise<Album[]> =>
  apiClient.get<Album[]>("/albums").then((r) => r.data);

export const fetchAlbum = (id: number): Promise<Album | null> =>
  apiClient.get<Album>(`/albums/${id}`)
    .then((r) => r.data)
    .catch((err) => {
      if (err.response?.status === 404) return null;
      throw err;
    });

export const createAlbum = (album: {
  title: string;
  description?: string;
  tags?: string;
  isPublic?: boolean;
  images?: Image[];
}): Promise<Album> =>
  apiClient.post<Album>("/albums", album).then((r) => r.data);

export const addGameToAlbum = (albumId: number, gameId: number): Promise<void> =>
  apiClient.post(`/albums/${albumId}/games/${gameId}`).then(() => {});

export const removeGameFromAlbum = (albumId: number, gameId: number): Promise<void> =>
  apiClient.delete(`/albums/${albumId}/games/${gameId}`).then(() => {});

export const updateAlbum = (id: number, updates: {
  title?: string;
  description?: string;
  tags?: string;
  isPublic?: boolean;
}): Promise<Album> =>
  apiClient.put<Album>(`/albums/${id}`, updates).then((r) => r.data);

export const fetchGamesByAlbum = (id: number): Promise<GameData[]> =>
  apiClient.get<GameData[]>(`/game/${id}/albums`).then((r) => r.data);