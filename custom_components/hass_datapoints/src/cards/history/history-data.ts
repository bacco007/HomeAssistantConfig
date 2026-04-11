/**
 * Re-export chart-side history data helpers from the split history-data modules.
 */

export type {
  HaStateEntry,
  HaStatEntry,
  NormalisedState,
  Point,
  ValueExtent,
} from "./data/types";
export { SAMPLE_INTERVAL_MS, downsamplePts } from "./data/downsampling";
export { binaryOffLabel, binaryOnLabel } from "./data/binary-labels";
export {
  getHistoryStatesForEntity,
  normalizeBinaryHistory,
  normalizeNumericHistory,
} from "./data/history-normalization";
export {
  mergeNumericHistoryWithStatistics,
  normalizeStatisticsHistory,
} from "./data/statistics-normalization";
export { getAxisValueExtent } from "./data/axis-extent";
