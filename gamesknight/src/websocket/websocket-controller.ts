import { connectWebSocket, onWsMessage, sendGameSocketMessage as sendWsMessage } from "./websocket";


export const connectGameSocket = (path = "/ws") => connectWebSocket(path);
export const onGameSocketMessage = (cb: (data: any) => void) => onWsMessage(cb);
// export const sendGameSocketMessage = (msg: any) => sendWsMessage(msg);

export const sendGameSocketMessage = (destination: string, body: unknown) => sendWsMessage(destination, body);
// {
//   stompClient.publish({
//     destination,
//     body: JSON.stringify(body),
//   });
// }