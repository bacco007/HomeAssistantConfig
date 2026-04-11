import type { ValueExtent } from "./types";

/**
 * Computes the finite minimum and maximum of an array of values.
 * Returns `null` if there are no finite values.
 */
export function getAxisValueExtent(
  allValues: (number | Nullable<string> | undefined)[]
): Nullable<ValueExtent> {
  let min = Infinity;
  let max = -Infinity;
  for (const value of allValues) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      continue;
    }
    if (numeric < min) {
      min = numeric;
    }
    if (numeric > max) {
      max = numeric;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return null;
  }
  return { min, max };
}
