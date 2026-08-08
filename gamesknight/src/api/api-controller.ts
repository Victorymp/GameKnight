import apiClient from './api-client';

import { type GameData, type GameQr, type UserData } from '../models/model';

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const result = queue.then(() => fn());
  queue = result.catch(() => {});
  return result;
}

export const createGame = (gameCode?: string): Promise<GameData> =>
  enqueue(() => apiClient.post(`/GameData`, { gameCode }).then(r => r.data));

export const getGameQrCode = (gameId: string): Promise<GameQr> =>
  enqueue(() => apiClient(`/GameData/{${gameId}`).then(r => r.data));

export const getAllGameData = (): Promise<GameData[]> =>
  enqueue(() => apiClient(`/GameData/GetAll`).then(r => r.data));

export const getGameData = (): Promise<GameData[]> =>
  enqueue(() => apiClient(`/GameData`).then(r => r.data));

export const getUser = (): Promise<UserData> =>
  enqueue(() => apiClient(`/users/me`).then(r => r.data));


