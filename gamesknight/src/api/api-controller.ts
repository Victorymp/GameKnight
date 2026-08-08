import apiClient from './api-client';

import { GameData, UserData } from './types';



let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const result = queue.then(() => fn());
  queue = result.catch(() => {});
  return result;
}

export const getAllGameData = (): Promise<GameData[]> =>
  enqueue(() => apiClient(`/GameData/GetAll`).then(r => r.data));

export const getGameData = (): Promise<GameData[]> =>
  enqueue(() => apiClient(`/GameData`).then(r => r.data));

export const getUser = (): Promise<UserData> =>
  enqueue(() => apiClient(`/users/me`).then(r => r.data));


