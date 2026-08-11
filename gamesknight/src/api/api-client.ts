// api-client.ts
import axios from "axios";
import { msalInstance } from "../auth/hooks/auth-provider";
import { Client, type IMessage } from "@stomp/stompjs";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const API_SCOPE = import.meta.env.VITE_USERS_SCOPE;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let msalInitPromise: Promise<void> | null = null;

apiClient.interceptors.request.use(async (config) => {
  if (!msalInitPromise) {
    msalInitPromise = msalInstance.initialize();
  }
  await msalInitPromise;

  const account = msalInstance.getActiveAccount();
  if (account) {
    const tokenResponse = await msalInstance.acquireTokenSilent({
      account,
      scopes: [API_SCOPE],
    });
    config.headers.Authorization = `Bearer ${tokenResponse.accessToken}`;
  }

  return config;
});

export default apiClient;

// --- STOMP WebSocket helper ---


let stompClient: Client | null = null;
let wsListeners: Set<(data: any) => void> = new Set();
let reconnectTimer: number | null = null;
let reconnectAttempts = 0;
let currentPath = "/ws";
let connectPromise: Promise<void> | null = null;
let connectResolvers: Array<() => void> = [];

function getWsBase(): string {
  if (API_URL) {
    return API_URL.replace(/^http/, "ws");
  }
  return window.location.origin.replace(/^http/, "ws");
}

export function connectWebSocket(path = "/ws"): Promise<void> {
  currentPath = path;

  if (stompClient && stompClient.connected) {
    return Promise.resolve();
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = new Promise((resolve) => {
    connectResolvers.push(resolve);
  });

  const brokerURL = `${getWsBase()}${path}`;
  stompClient = new Client({
    brokerURL,
    reconnectDelay: 0,
    onConnect: () => {
      reconnectAttempts = 0;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      stompClient?.subscribe("/topic/game", (message: IMessage) => {
        let payload: any;
        try {
          payload = JSON.parse(message.body);
        } catch {
          payload = message.body;
        }
        wsListeners.forEach((handler) => handler(payload));
      });

      connectResolvers.forEach((resolve) => resolve());
      connectResolvers = [];

      console.log("Connected to STOMP broker:", brokerURL);
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
  if (!stompClient || !stompClient.connected) {   // ← fixed: check .connected, not .active
    throw new Error("WebSocket is not open");
  }

  stompClient.publish({
    destination: "/app/game",
    body: typeof msg === "string" ? msg : JSON.stringify(msg),
  });
}
