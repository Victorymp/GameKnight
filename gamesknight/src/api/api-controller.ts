import apiClient from "./api-client";
import { connectWebSocket, onWsMessage, sendWsMessage } from "./api-client";
import { type GameData, type GameQr, type UserData } from "../models/model";

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const result = queue.then(() => fn());
  queue = result.catch(() => {});
  return result;
}

export const createGame = (gameCode?: string): Promise<GameData> =>
  enqueue(() =>
    apiClient
      .post(`/Game/creategame`, { gameCode })
      .then((r) => r.data)
  );

export const getGameQrCode = (gameId: string): Promise<GameQr> =>
  enqueue(() => apiClient(`/GameData/{${gameId}`).then((r) => r.data));

export const getAllGameData = (): Promise<GameData[]> =>
  enqueue(() => apiClient(`/GameData/GetAll`).then((r) => r.data));

export const getGameData = (gameId: string): Promise<GameData> =>
  enqueue(() => 
    apiClient
      .post(`/Game`, {gameId})
      .then((r) => r.data)
    );

export const getUser = (): Promise<UserData> =>
  enqueue(() => apiClient(`/users/me`).then((r) => r.data));

export const connectGameSocket = (path = "/ws") => connectWebSocket(path);
export const onGameSocketMessage = (cb: (data: any) => void) => onWsMessage(cb);
export const sendGameSocketMessage = (msg: any) => sendWsMessage(msg);


