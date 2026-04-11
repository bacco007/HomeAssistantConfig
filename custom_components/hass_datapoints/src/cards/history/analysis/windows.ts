const HOUR_MS = 60 * 60 * 1000;

export function getTrendWindowMs(value: string): number {
  const windows: RecordWithNumericValues = {
    "30m": 30 * 60 * 1000,
    "1h": HOUR_MS,
    "2h": 2 * HOUR_MS,
    "3h": 3 * HOUR_MS,
    "6h": 6 * HOUR_MS,
    "24h": 24 * HOUR_MS,
    "7d": 7 * 24 * HOUR_MS,
    "14d": 14 * 24 * HOUR_MS,
    "21d": 21 * 24 * HOUR_MS,
    "28d": 28 * 24 * HOUR_MS,
  };
  return windows[value] ?? windows["24h"];
}

export function getPersistenceWindowMs(value: string): number {
  const windows: RecordWithNumericValues = {
    "30m": 30 * 60 * 1000,
    "1h": HOUR_MS,
    "3h": 3 * HOUR_MS,
    "6h": 6 * HOUR_MS,
    "12h": 12 * HOUR_MS,
    "24h": 24 * HOUR_MS,
  };
  return windows[value] ?? windows["1h"];
}
