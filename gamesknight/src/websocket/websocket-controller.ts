import { connectWebSocket, onWsMessage, sendWsMessage } from "./websocket";


export const connectGameSocket = (path = "/ws") => connectWebSocket(path);
export const onGameSocketMessage = (cb: (data: any) => void) => onWsMessage(cb);
export const sendGameSocketMessage = (msg: any) => sendWsMessage(msg);