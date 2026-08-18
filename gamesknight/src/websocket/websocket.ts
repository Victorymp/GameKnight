// websocket.ts
import { Client, type IMessage } from "@stomp/stompjs";

import SockJS from "sockjs-client";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";


let stompClient: Client | null = null;
let currentPath: string = "/ws";
let connectPromise: Promise<void> | null = null;
let connectResolvers: Array<() => void> = [];
let reconnectTimer: number | null = null;
let reconnectAttempts = 0;
let wsListeners: Set<(data: any) => void> = new Set();

// Change the base ws url
function getHttpBase(): string {
  if (API_URL) return API_URL;
  return window.location.origin;
}

// Make a inital handshake with the web socket
export function connectWebSocket(path="/ws"): Promise<void> {
  currentPath = path;

  // Check if there is a client already connected
  if(stompClient && stompClient.connected) {
    // Promise is serverd there is no connection
    return Promise.resolve();
  }

  // Promise already created
  if (connectPromise){
    return connectPromise;
  }

  // If connection not closed add to a list of connections to close
  connectPromise = new Promise((resolve) => {
    connectResolvers.push(resolve);
  });

  // Create a new stomp client which has our websocket
  const sockJsUrl = `${getHttpBase()}${path}`;

  stompClient = new Client({
    webSocketFactory: () => new SockJS(sockJsUrl),
    reconnectDelay: 0,
    onConnect: () => {
      reconnectAttempts = 0;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      stompClient?.subscribe("/topic/game", (message: IMessage) => {
        let payload: any;

        // Can we parse the payload as a json
        try {
          payload = JSON.parse(message.body);
        } catch {
          payload = message.body;
        }
        // Give it a list of listeners which are interested in recieving a request
        wsListeners.forEach((handler) => handler(payload));
      });
      
      // Attatch new promises to old ones
      connectResolvers.forEach((resolve) => resolve());
      connectResolvers = [];

      console.log(`Connected to STOMP broker: ${sockJsUrl}`);
    },
    onStompError: (frame) => {
      console.warn("STOMP error", frame);
      scheduleReconnect(path);
    },
    onWebSocketClose: () => scheduleReconnect(path),
    onWebSocketError: () => scheduleReconnect(path),
  });
  stompClient.activate();
  return connectPromise;
}

function scheduleReconnect(path = currentPath) {
  if (reconnectTimer) return;

  connectPromise = null; // allow a fresh connect() to be awaited after reconnect
  reconnectAttempts += 1;
  const delay = Math.min(30000, 1000 * Math.pow(2, Math.min(reconnectAttempts, 6)));

  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
    }
    connectWebSocket(path);
  }, delay) as unknown as number;
}

export function onWsMessage(cb: (data: any) => void) {
  wsListeners.add(cb);
  return () => wsListeners.delete(cb);
}

export function sendWsMessage(msg: any) {
  console.log("sendWsMessage() called", {
    connected: !!stompClient?.connected,
    active: !!stompClient?.active,
    msg,
  });

  if (!stompClient || !stompClient.connected) {
    throw new Error("WebSocket is not open");
  }

  try {
    const body = typeof msg === "string" ? msg : JSON.stringify(msg);
    console.log("Publishing STOMP message", { destination: "/app/game", body });
    stompClient.publish({
      destination: "/app/game",
      body,
    });
  } catch (err) {
    console.error("Failed to publish STOMP message", err);
    throw err;
  }
}

export function sendGameSocketMessage(destination: string, body: unknown) {
  if (!stompClient || !stompClient.connected) {
    throw new Error("WebSocket is not open");
  }
  stompClient.publish({ destination, body: JSON.stringify(body) });
}

export function subscribeToUserQueue(
  destination: string,
  handler: (msg: any) => void
): () => void {
  if (!stompClient || !stompClient.connected) {   // ← fixed: check .connected, not .active
    throw new Error("WebSocket is not open");
  }
  console.log("subscribeToUserQueue called with:", destination, "connected:", stompClient?.connected);
  const sub = stompClient.subscribe(destination, (frame) => {
    try {
      handler(JSON.parse(frame.body));
    } catch (e) {
      console.error("Bad message on user queue", e);
    }
  });
  console.log("Subscribed, id:", sub.id);
  return () => sub.unsubscribe();
}