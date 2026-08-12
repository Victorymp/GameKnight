// api-client.ts
import axios from "axios";
import { msalInstance } from "../auth/hooks/auth-provider";

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

