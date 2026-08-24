// api-client.ts
import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});




export default apiClient;

