/**
 * apiService.ts
 *
 * Fetches real 2026/27 La Liga data from the FastAPI backend (Understat).
 * Falls back gracefully to static data if the backend is unavailable.
 */

import { JornadaQuinielaData } from '../types/quiniela';

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.port === '3000' ? '' : 'http://localhost:8080');

export interface JornadaInfo {
  jornadaNumber: number;
  season: string;
  title: string;
  dateRange: string;
  isCompleted: boolean;
}

/** Fetch the list of available matchdays from the backend. */
export async function fetchJornadas(): Promise<JornadaInfo[]> {
  const res = await fetch(`${API_BASE}/api/jornadas`);
  if (!res.ok) throw new Error(`Backend error: ${res.status} ${res.statusText}`);
  return res.json();
}

/** Fetch all full jornadas with matches and scrutiny in one call */
export async function fetchAllJornadasFull(): Promise<JornadaQuinielaData[]> {
  const res = await fetch(`${API_BASE}/api/jornadas/all`);
  if (!res.ok) throw new Error(`Backend error: ${res.status} ${res.statusText}`);
  return res.json();
}

/** Fetch full data for a single jornada (matches, xG, probabilities, results). */
export async function fetchJornada(matchday: number): Promise<JornadaQuinielaData> {
  const res = await fetch(`${API_BASE}/api/jornada/${matchday}`);
  if (!res.ok) throw new Error(`Backend error: ${res.status} ${res.statusText}`);
  return res.json();
}

/** Fetch the next upcoming (non-completed) jornada for bet prediction. */
export async function fetchNextJornada(): Promise<JornadaQuinielaData> {
  const res = await fetch(`${API_BASE}/api/jornada/next`);
  if (!res.ok) throw new Error(`Backend error: ${res.status} ${res.statusText}`);
  return res.json();
}


/** Tell the backend to refresh its data cache (call after a new matchday). */
export async function clearDataCache(): Promise<void> {
  await fetch(`${API_BASE}/api/cache/clear`, { method: 'POST' });
}

/** Health-check: returns true if the backend is reachable. */
export async function isBackendOnline(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
