import type { ModelMetric, ClassLabel } from './types';

// Reported test metrics from the ML project — these are the actual values
// measured on the test set. Do NOT modify or invent new values.

export const MODELS: ModelMetric[] = [
  {
    key: 'logistic_regression',
    name: 'Logistic Regression',
    shortName: 'Logistic Reg.',
    accuracy: 91.42,
    macroF1: 0.6500,
    description:
      'A linear baseline model trained on the 187-dimensional ECG feature vectors. Establishes a reference for comparison.',
    isBest: false,
  },
  {
    key: 'random_forest',
    name: 'Random Forest',
    shortName: 'Rand. Forest',
    accuracy: 97.25,
    macroF1: 0.8602,
    description:
      'An ensemble of decision trees that captures non-linear relationships in the ECG signal features.',
    isBest: false,
  },
  {
    key: 'rf_oversampled',
    name: 'Random Forest + Random Oversampling',
    shortName: 'RF + Oversamp.',
    accuracy: 97.68,
    macroF1: 0.8783,
    description:
      'Random Forest trained on a class-balanced dataset using random oversampling. Best reported test performance.',
    isBest: true,
  },
];

export const BEST_MODEL = MODELS.find((m) => m.isBest)!;

// MIT-BIH standard AAMI heartbeat classification labels
export const CLASS_LABELS: ClassLabel[] = [
  {
    code: 'N',
    name: 'Normal',
    fullDescription: 'Normal beat — typical sinus rhythm origin.',
    color: '#0d9488',
  },
  {
    code: 'S',
    name: 'Supraventricular',
    fullDescription: 'Supraventricular ectopic beat — origin above the ventricles.',
    color: '#f59e0b',
  },
  {
    code: 'V',
    name: 'Ventricular',
    fullDescription: 'Ventricular ectopic beat — origin in the ventricles.',
    color: '#ef4444',
  },
  {
    code: 'F',
    name: 'Fusion',
    fullDescription: 'Fusion beat — a blend of normal and ventricular activation.',
    color: '#8b5cf6',
  },
  {
    code: 'Q',
    name: 'Unknown',
    fullDescription: 'Unclassifiable or paced beat — requires further review.',
    color: '#64748b',
  },
];

export const ECG_VALUE_COUNT = 187;

// Rows = true class, columns = predicted class. Order: N, S, V, F, Q
// Test set, Random Forest + Oversampling.
// Keep null until real values are exported from the Python notebook.
export const CONFUSION_MATRIX: number[][] | null = null;