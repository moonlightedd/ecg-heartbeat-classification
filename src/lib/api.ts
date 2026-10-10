// API integration point for the Python backend.
//
// The frontend is designed to work WITHOUT a backend — in that case it runs in
// "demo" mode and clearly labels all predictions as demo data.
//
// To connect the Python pickle model backend:
//  1. Deploy a backend API that accepts an array of 187-value ECG rows and
//     returns predicted classes (and optional confidence scores).
//  2. Set the API base URL in the environment variable VITE_API_URL.
//  3. The predictBatch function below will automatically switch from demo to
//     live mode when a valid API endpoint is configured.
//
// DO NOT fabricate predictions. In demo mode, we do NOT generate fake class
// labels — we only show the UI states with a clear "Demo" badge and instruct
// the user to connect the backend for real predictions.

import type { PredictionResult, HeartbeatClass } from './types';

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export function isLiveMode(): boolean {
  return Boolean(API_URL && API_URL.length > 0);
}

export interface PredictBatchResponse {
  results: Array<{
    predictedClass: HeartbeatClass;
    confidence?: number;
  }>;
}

// Returns true if the backend is reachable (used by the UI to show status).
// In demo mode this always returns false.
export async function checkBackendHealth(): Promise<boolean> {
  if (!API_URL) return false;
  try {
    const res = await fetch(`${API_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

// The single integration point for real predictions.
// Call this from the ECG Analysis page after CSV upload + validation.
export async function predictBatch(
  rows: number[][],
  signal?: AbortSignal
): Promise<PredictBatchResponse> {
  if (!API_URL) {
    throw new Error(
      'Backend API is not configured. Set VITE_API_URL to enable live predictions.'
    );
  }

  const res = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signals: rows }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Backend returned ${res.status}: ${res.statusText}`);
  }

  return (await res.json()) as PredictBatchResponse;
}

// Maps the API response to the frontend PredictionResult shape.
export function mapPredictions(
  rows: number[][],
  response: PredictBatchResponse,
  source: 'demo' | 'live'
): PredictionResult[] {
  return rows.map((_, i) => {
    const pred = response.results[i];
    return {
      rowIndex: i,
      predictedClass: pred.predictedClass,
      label: pred.predictedClass,
      confidence: pred.confidence ?? null,
      source,
    };
  });
}
