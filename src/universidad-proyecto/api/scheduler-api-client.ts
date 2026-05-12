import type { ScheduleResponse } from "./scheduler-api.js";

const BASE_URL = process.env.SCHEDULER_API_URL || 'http://localhost:3002';

export async function fetchSchedule(): Promise<ScheduleResponse> {
  const res = await fetch(`${BASE_URL}/api/schedule`);
  if (!res.ok) throw new Error(`/api/schedule falló: ${res.status}`);
  return res.json() as Promise<ScheduleResponse>;
}

export async function refreshSchedule(): Promise<ScheduleResponse> {
  const res = await fetch(`${BASE_URL}/api/schedule/refresh`);
  if (!res.ok) throw new Error(`/api/schedule/refresh falló: ${res.status}`);
  return res.json() as Promise<ScheduleResponse>;
}

export async function fetchGrafo(): Promise<{ success: boolean; data?: { vertices: number; aristas: number }; error?: string }> {
  const res = await fetch(`${BASE_URL}/api/schedule/grafo`);
  if (!res.ok) throw new Error(`/api/schedule/grafo falló: ${res.status}`);
  return res.json() as Promise<{ success: boolean; data?: { vertices: number; aristas: number }; error?: string }>;
}

export async function checkHealth(): Promise<{ ok: boolean; timestamp: string }> {
  const res = await fetch(`${BASE_URL}/api/health`);
  if (!res.ok) throw new Error(`/api/health falló: ${res.status}`);
  return res.json() as Promise<{ ok: boolean; timestamp: string }>;
}

