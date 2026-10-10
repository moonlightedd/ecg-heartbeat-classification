// Core type definitions for the ECG heartbeat classification project.
// These types are shared across all pages and components.

export type ModelKey = 'logistic_regression' | 'random_forest' | 'rf_oversampled';

export interface ModelMetric {
  key: ModelKey;
  name: string;
  shortName: string;
  accuracy: number;
  macroF1: number;
  description: string;
  isBest: boolean;
}

export type HeartbeatClass = 'N' | 'S' | 'V' | 'F' | 'Q';

export interface ClassLabel {
  code: HeartbeatClass;
  name: string;
  fullDescription: string;
  color: string;
}

export type PredictionStatus = 'idle' | 'demo' | 'live' | 'error';

export interface PredictionResult {
  rowIndex: number;
  predictedClass: HeartbeatClass;
  label: string;
  confidence: number | null; // null when confidence is not available (demo mode)
  source: 'demo' | 'live';
}

export interface PredictionSummary {
  counts: Record<HeartbeatClass, number>;
  total: number;
  results: PredictionResult[];
  source: 'demo' | 'live';
}

export type PageKey = 'dashboard' | 'ecg-analysis' | 'model-performance' | 'about';
