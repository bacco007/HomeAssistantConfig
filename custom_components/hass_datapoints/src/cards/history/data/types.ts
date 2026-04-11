/** A time-series data point: [timestamp in ms, numeric value]. */
export type Point = [number, number];

/** Normalised state entry returned by the HA history API (compressed format). */
export interface HaStateEntry {
  s?: string;
  state?: string;
  lu?: number;
  lc?: number;
  last_changed?: string;
  last_updated?: string;
  entity_id?: string;
}

/** Normalised statistics entry returned by the HA statistics API. */
export interface HaStatEntry {
  start?: number | string;
  mean?: Nullable<number | string>;
}

/** Internal intermediate state record used during normalisation. */
export interface NormalisedState {
  lu: number;
  s: string;
}

/** Return value of getAxisValueExtent. */
export interface ValueExtent {
  min: number;
  max: number;
}
