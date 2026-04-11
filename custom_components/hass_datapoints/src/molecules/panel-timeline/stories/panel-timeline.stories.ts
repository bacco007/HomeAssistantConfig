import { html } from "lit";
import "../panel-timeline";
import type { EventMarker } from "../types";
import type { RangeBounds } from "@/atoms/interactive/range-timeline/types";

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

const REF = new Date("2024-01-15T00:00:00Z");

const DAY_CONFIG = {
  baselineMs: 48 * 3600_000,
  boundsUnit: "hour",
  contextUnit: "day",
  majorUnit: "hour",
  labelUnit: "hour",
  minorUnit: "hour",
  pixelsPerUnit: 9,
};

const WEEK_CONFIG = {
  baselineMs: 28 * 86400_000,
  boundsUnit: "day",
  contextUnit: "month",
  detailUnit: "hour",
  detailStep: 12,
  majorUnit: "day",
  labelUnit: "day",
  minorUnit: "day",
  pixelsPerUnit: 30,
};

const DAY_BOUNDS: RangeBounds = {
  min: REF.getTime() - 3 * 86400_000,
  max: REF.getTime() + 3 * 86400_000,
  config: DAY_CONFIG,
} as RangeBounds;

const WEEK_BOUNDS: RangeBounds = {
  min: REF.getTime() - 10 * 86400_000,
  max: REF.getTime() + 10 * 86400_000,
  config: WEEK_CONFIG,
} as RangeBounds;

const START = new Date("2024-01-15T08:00:00Z");
const END = new Date("2024-01-15T20:00:00Z");

const SAMPLE_EVENTS: EventMarker[] = [
  { timestamp: new Date("2024-01-14T09:30:00Z"), color: "#03a9f4" },
  { timestamp: new Date("2024-01-15T14:15:00Z"), color: "#ff9800" },
  { timestamp: new Date("2024-01-16T06:45:00Z"), color: "#4caf50" },
];

// ---------------------------------------------------------------------------
// Default export
// ---------------------------------------------------------------------------

/**
 * `panel-timeline` wraps `range-timeline` and adds the panel-history-specific
 * overlay layers: hover preview, comparison preview, zoom highlights, chart hover
 * lines, and event dots.
 *
 * All `dp-range-*` events from the inner atom bubble through naturally.
 */
export default {
  title: "Molecules/Panel Timeline",
  component: "panel-timeline",
  parameters: {
    actions: {
      handles: [
        "dp-range-draft",
        "dp-range-commit",
        "dp-range-period-select",
        "dp-range-period-hover",
        "dp-range-period-leave",
        "dp-range-scroll",
      ],
    },
    layout: "padded",
  },
  argTypes: {
    zoomLevel: {
      control: "select",
      options: [
        "day",
        "week_expanded",
        "week_compressed",
        "month_short",
        "month_expanded",
        "month_compressed",
        "quarterly",
      ],
    },
    dateSnapping: {
      control: "select",
      options: ["auto", "hour", "day", "week", "month"],
    },
    isLiveEdge: { control: "boolean" },
    chartHoverTimeMs: {
      control: "number",
      description: "Timestamp (ms) of chart hover line. Set to null to hide.",
    },
    chartHoverWindowTimeMs: {
      control: "number",
      description: "Timestamp (ms) of comparison chart hover line.",
    },
  },
  args: {
    zoomLevel: "day",
    dateSnapping: "auto",
    isLiveEdge: false,
    chartHoverTimeMs: null,
    chartHoverWindowTimeMs: null,
  },
  render: (args: RecordWithUnknownValues) => html`
    <div style="display: flex; padding: 8px 0;">
      <panel-timeline
        .startTime=${START}
        .endTime=${END}
        .rangeBounds=${DAY_BOUNDS}
        .zoomLevel=${args.zoomLevel}
        .dateSnapping=${args.dateSnapping}
        .isLiveEdge=${args.isLiveEdge}
        .chartHoverTimeMs=${args.chartHoverTimeMs ?? null}
        .chartHoverWindowTimeMs=${args.chartHoverWindowTimeMs ?? null}
        .events=${[]}
      ></panel-timeline>
    </div>
  `,
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default day-level timeline with no overlays active. */
export const Default = {};

/** End handle shows live-edge breathing animation. */
export const LiveEdge = {
  render: () => html`
    <div style="display: flex; padding: 8px 0;">
      <panel-timeline
        .startTime=${new Date("2024-01-15T06:00:00Z")}
        .endTime=${new Date("2024-01-15T23:59:00Z")}
        .rangeBounds=${DAY_BOUNDS}
        zoomLevel="day"
        dateSnapping="auto"
        .isLiveEdge=${true}
        .events=${[]}
      ></panel-timeline>
    </div>
  `,
};

/** Chart hover line visible at a specific timestamp. */
export const ChartHoverLine = {
  render: () => html`
    <div style="display: flex; padding: 8px 0;">
      <panel-timeline
        .startTime=${START}
        .endTime=${END}
        .rangeBounds=${DAY_BOUNDS}
        zoomLevel="day"
        dateSnapping="auto"
        .chartHoverTimeMs=${new Date("2024-01-15T12:00:00Z").getTime()}
        .events=${[]}
      ></panel-timeline>
    </div>
  `,
};

/** Both chart hover line and comparison window hover line visible. */
export const ChartHoverWithComparisonLine = {
  render: () => html`
    <div style="display: flex; padding: 8px 0;">
      <panel-timeline
        .startTime=${START}
        .endTime=${END}
        .rangeBounds=${DAY_BOUNDS}
        zoomLevel="day"
        dateSnapping="auto"
        .chartHoverTimeMs=${new Date("2024-01-15T12:00:00Z").getTime()}
        .chartHoverWindowTimeMs=${new Date("2024-01-14T12:00:00Z").getTime()}
        .events=${[]}
      ></panel-timeline>
    </div>
  `,
};

/** Comparison window preview band. */
export const ComparisonPreview = {
  render: () => html`
    <div style="display: flex; padding: 8px 0;">
      <panel-timeline
        .startTime=${START}
        .endTime=${END}
        .rangeBounds=${DAY_BOUNDS}
        zoomLevel="day"
        dateSnapping="auto"
        .comparisonPreview=${{
          start: new Date("2024-01-14T08:00:00Z").getTime(),
          end: new Date("2024-01-14T20:00:00Z").getTime(),
        }}
        .events=${[]}
      ></panel-timeline>
    </div>
  `,
};

/** Zoom highlight band — shown when a chart zoom is active. */
export const ZoomHighlight = {
  render: () => html`
    <div style="display: flex; padding: 8px 0;">
      <panel-timeline
        .startTime=${START}
        .endTime=${END}
        .rangeBounds=${DAY_BOUNDS}
        zoomLevel="day"
        dateSnapping="auto"
        .zoomRange=${{
          start: new Date("2024-01-15T10:00:00Z").getTime(),
          end: new Date("2024-01-15T14:00:00Z").getTime(),
        }}
        .events=${[]}
      ></panel-timeline>
    </div>
  `,
};

/** Event dots rendered on the timeline. */
export const WithEvents = {
  render: () => html`
    <div style="display: flex; padding: 8px 0;">
      <panel-timeline
        .startTime=${START}
        .endTime=${END}
        .rangeBounds=${DAY_BOUNDS}
        zoomLevel="day"
        dateSnapping="auto"
        .events=${SAMPLE_EVENTS}
      ></panel-timeline>
    </div>
  `,
};

/** Week-expanded zoom with events. */
export const WeekWithEvents = {
  render: () => html`
    <div style="display: flex; padding: 8px 0;">
      <panel-timeline
        .startTime=${new Date("2024-01-13T00:00:00Z")}
        .endTime=${new Date("2024-01-16T00:00:00Z")}
        .rangeBounds=${WEEK_BOUNDS}
        zoomLevel="week_expanded"
        dateSnapping="day"
        .events=${SAMPLE_EVENTS}
      ></panel-timeline>
    </div>
  `,
};

/** All overlays visible simultaneously. */
export const AllOverlays = {
  render: () => html`
    <div style="display: flex; padding: 8px 0;">
      <panel-timeline
        .startTime=${START}
        .endTime=${END}
        .rangeBounds=${DAY_BOUNDS}
        zoomLevel="day"
        dateSnapping="auto"
        .comparisonPreview=${{
          start: new Date("2024-01-14T08:00:00Z").getTime(),
          end: new Date("2024-01-14T20:00:00Z").getTime(),
        }}
        .zoomRange=${{
          start: new Date("2024-01-15T10:00:00Z").getTime(),
          end: new Date("2024-01-15T14:00:00Z").getTime(),
        }}
        .chartHoverTimeMs=${new Date("2024-01-15T12:00:00Z").getTime()}
        .events=${SAMPLE_EVENTS}
      ></panel-timeline>
    </div>
  `,
};
