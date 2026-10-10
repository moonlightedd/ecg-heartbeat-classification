import { ECG_VALUE_COUNT } from './constants';

// CSV parsing and validation utilities.
// Each row must contain exactly 187 numerical ECG values.

export interface ParsedCsvResult {
  rows: number[][];
  errors: string[];
  rowCount: number;
}

function parseLine(line: string): string[] {
  // Handles both comma and semicolon delimiters, and trims whitespace.
  return line
    .trim()
    .split(/[,;]/)
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

export function parseCsv(text: string): ParsedCsvResult {
  const errors: string[] = [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { rows: [], errors: ['The file is empty.'], rowCount: 0 };
  }

  const rows: number[][] = [];

  // Detect if the first line is a header (contains non-numeric values)
  const firstLineValues = parseLine(lines[0]);
  const firstLineNumeric = firstLineValues.every((v) => v !== '' && !isNaN(Number(v)));

  const startIndex = firstLineNumeric ? 0 : 1;

  for (let i = startIndex; i < lines.length; i++) {
    const values = parseLine(lines[i]);

    if (values.length !== ECG_VALUE_COUNT) {
      errors.push(
        `Row ${i + 1}: expected ${ECG_VALUE_COUNT} values, found ${values.length}.`
      );
      continue;
    }

    const numericRow: number[] = [];
    let rowValid = true;

    for (let j = 0; j < values.length; j++) {
      const num = Number(values[j]);
      if (isNaN(num)) {
        errors.push(`Row ${i + 1}, column ${j + 1}: "${values[j]}" is not a valid number.`);
        rowValid = false;
        break;
      }
      numericRow.push(num);
    }

    if (rowValid) {
      rows.push(numericRow);
    }
  }

  return { rows, errors, rowCount: rows.length };
}

// Generate a sample CSV with realistic-looking ECG-like waveform patterns.
// This is synthetic data for demonstration — NOT real patient data.
export function generateSampleCsv(rowCount: number = 10): string {
  const rows: string[] = [];

  for (let r = 0; r < rowCount; r++) {
    const values: number[] = [];
    const beatType = r % 5; // cycle through pattern types for variety

    for (let i = 0; i < ECG_VALUE_COUNT; i++) {
      const t = i / ECG_VALUE_COUNT;
      let v = 0;

      if (beatType === 0) {
        // Normal-ish: small P wave, tall QRS, T wave
        v =
          0.1 * Math.exp(-Math.pow((t - 0.2) * 12, 2)) +
          0.9 * Math.exp(-Math.pow((t - 0.4) * 25, 2)) -
          0.2 * Math.exp(-Math.pow((t - 0.38) * 30, 2)) +
          0.25 * Math.exp(-Math.pow((t - 0.6) * 12, 2));
      } else if (beatType === 1) {
        // Wide QRS (ventricular-like)
        v =
          0.8 * Math.exp(-Math.pow((t - 0.4) * 10, 2)) -
          0.3 * Math.exp(-Math.pow((t - 0.38) * 12, 2)) +
          0.15 * Math.exp(-Math.pow((t - 0.65) * 10, 2));
      } else if (beatType === 2) {
        // Premature / supraventricular-like
        v =
          0.12 * Math.exp(-Math.pow((t - 0.15) * 14, 2)) +
          0.7 * Math.exp(-Math.pow((t - 0.35) * 22, 2)) +
          0.2 * Math.exp(-Math.pow((t - 0.55) * 12, 2));
      } else if (beatType === 3) {
        // Fusion-like
        v =
          0.5 * Math.exp(-Math.pow((t - 0.4) * 15, 2)) -
          0.15 * Math.exp(-Math.pow((t - 0.38) * 20, 2)) +
          0.18 * Math.exp(-Math.pow((t - 0.58) * 10, 2));
      } else {
        // Low-amplitude / unknown
        v = 0.3 * Math.exp(-Math.pow((t - 0.4) * 18, 2)) + 0.02 * Math.sin(t * 30);
      }

      // Add subtle noise
      v += (Math.random() - 0.5) * 0.02;
      values.push(parseFloat(v.toFixed(4)));
    }

    rows.push(values.join(','));
  }

  return rows.join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
