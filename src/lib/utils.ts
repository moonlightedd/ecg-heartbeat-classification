// Small utility helpers.

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatPercent(value: number, digits: number = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatF1(value: number, digits: number = 4): string {
  return value.toFixed(digits);
}
