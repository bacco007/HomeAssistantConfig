import type { RangeZoomConfig } from "@/lib/timeline/timeline-scale";

export type { RangeZoomConfig } from "@/lib/timeline/timeline-scale";

export interface RangeBounds {
  min: number;
  max: number;
  config: RangeZoomConfig;
}
