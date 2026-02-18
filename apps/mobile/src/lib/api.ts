import Constants from 'expo-constants';
import type { WorkoutDTO, CreateWorkoutDTO } from '@gym-planner/shared';

const BASE_URL: string =
  (Constants.expoConfig?.extra?.['apiUrl'] as string | undefined) ??
  process.env['EXPO_PUBLIC_API_URL'] ??
  'http://localhost:3000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      (body as { message?: string } | null)?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export const api = {
  /** Fetch all workouts, newest first. */
  getWorkouts: () => request<WorkoutDTO[]>('/workouts'),

  /** Create a new workout. */
  createWorkout: (data: CreateWorkoutDTO) =>
    request<WorkoutDTO>('/workouts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
