import apiClient from './api-client';

import { Projects, UserData } from './types';



let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const result = queue.then(() => fn());
  queue = result.catch(() => {});
  return result;
}

export const getProjects = (): Promise<Projects[]> =>
  enqueue(() => apiClient(`/projects/GetAll`).then(r => r.data));

export const getDataverseProjects = (): Promise<Projects[]> =>
  enqueue(() => apiClient(`/projects`).then(r => r.data));

export const getUser = (): Promise<UserData> =>
  enqueue(() => apiClient(`/users/me`).then(r => r.data));

export const createBooking = (data: {
  orderId: string;
  clientId?: string;
  contactName?: string;
  contactEmail?: string;
  telephone?: string;
  startDate?: string;
  dueDate?: string;
  services?: { id: string; name: string; quantity: number; division: string; elements?: string[] }[];
}): Promise<{ bookingId: string }> =>
  enqueue(() => apiClient.post(`/bookings`, data).then(r => r.data));

