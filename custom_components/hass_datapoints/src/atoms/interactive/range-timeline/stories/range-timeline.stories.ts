import { html } from "lit";
import "../range-timeline";
import type { RangeBounds } from "../types";

// ---------------------------------------------------------------------------
// Shared fixture data
// ---------------------------------------------------------------------------

// A fixed reference point so stories are reproducible regardless of system time.
const REF = new Date("2024-01-15T00:00:00Z");

function makeBounds(zoomLevel: string): RangeBounds {
  const configs: Record<
    string,
    {
      boundsUnit: string;
      contextUnit: string;
      majorUnit: string;
      labelUnit: string;
      minorUnit: string;
      pixelsPerUnit: number;
      baselineMs: number;
      detailUnit?: string;
      detailStep?: number;
    }
  > = {
    day: {
      baselineMs: 48 * 3600_000,
      boundsUnit: "hour",
      contextUnit: "day",
      majorUnit: "hour",
      labelUnit: "hour",
      minorUnit: "hour",
      pixelsPerUnit: 9,
    },
    week_expanded: {
      baselineMs: 28 * 86400_000,
      boundsUnit: "day",
      contextUnit: "month",
      detailUnit: "hour",
      detailStep: 12,
      majorUnit: "day",
      labelUnit: "day",
      minorUnit: "day",
      pixelsPerUnit: 30,
    },
    month_short: {
      baselineMs: 180 * 86400_000,
      boundsUnit: "week",
      contextUnit: "month",
      detailUnit: "day",
      majorUnit: "week",
      labelUnit: "week",
      minorUnit: "week",
      pixelsPerUnit: 54,
    },
  };
  const config = configs[zoomLevel] ?? configs.day;
  // bounds: 3 days before → 3 days after reference
  const minMs = REF.getTime() - 3 * 86400_000;
  const maxMs = REF.getTime() + 3 * 86400_000;
  return { min: minMs, max: maxMs, config } as RangeBounds;
}

const DAY_BOUNDS = makeBounds("day");
const WEEK_BOUNDS = makeBounds("week_expanded");
const MONTH_BOUNDS = makeBounds("month_short");

const START = new Date("2024-01-15T08:00:00Z");
const END = new Date("2024-01-15T20:00:00Z");

// ---------------------------------------------------------------------------
// Default export
// ---------------------------------------------------------------------------

/**
 * `range-timeline` is a scrollable, interactive time range slider atom.
 *
 * The parent provides pre-computed `rangeBounds`, the effective `zoomLevel`,
 * `dateSnapping`, and `startTime`/`endTime`. Panel-specific overlays are
 * injected via `<slot name="timeline-overlays">` and `<slot name="track-overlays">`.
 *
 * @fires dp-range-draft         - `{ start, end }` on each drag frame
 * @fires dp-range-commit        - `{ start, end, push }` on drag complete
 * @fires dp-range-period-select - `{ unit, startTime }` period button clicked
 * @fires dp-range-period-hover  - `{ start, end }` period button hovered
 * @fires dp-range-period-leave  - period button left
 * @fires dp-range-scroll        - viewport scrolled
 */
export default {
  title: "Atoms/Interactive/Range Timeline",
  component: "range-timeline",
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
      description: "Resolved zoom level (no 'auto' — parent derives this).",
    },
    dateSnapping: {
      control: "select",
      options: ["auto", "hour", "day", "week", "month"],
      description: "Snap unit for dragging handles.",
    },
    isLiveEdge: {
      control: "boolean",
      description: "When true the end handle shows a red breathing animation.",
    },
  },
  args: {
    zoomLevel: "day",
    dateSnapping: "auto",
    isLiveEdge: false,
  },
  render: (args: RecordWithUnknownValues) => html`
    <div style="display: flex; padding: 8px 0;">
      <range-timeline
        .startTime=${START}
        .endTime=${END}
        .rangeBounds=${DAY_BOUNDS}
        .zoomLevel=${args.zoomLevel}
        .dateSnapping=${args.dateSnapping}
        .isLiveEdge=${args.isLiveEdge}
      ></range-timeline>
    </div>
  `,
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default day-level zoom with a selection spanning 8 am – 8 pm. */
export const Default = {};

/** End handle is on the live edge — shows red breathing indicator. */
export const LiveEdge = {
  args: { isLiveEdge: true },
  render: () => html`
    <div style="display: flex; padding: 8px 0;">
      <range-timeline
        .startTime=${new Date("2024-01-15T06:00:00Z")}
        .endTime=${new Date("2024-01-15T23:59:00Z")}
        .rangeBounds=${DAY_BOUNDS}
        zoomLevel="day"
        dateSnapping="auto"
        .isLiveEdge=${true}
      ></range-timeline>
    </div>
  `,
};

/** Week-expanded zoom: days as major ticks, 12-hour detail ticks. */
export const WeekExpanded = {
  render: () => html`
    <div style="display: flex; padding: 8px 0;">
      <range-timeline
        .startTime=${new Date("2024-01-13T00:00:00Z")}
        .endTime=${new Date("2024-01-16T00:00:00Z")}
        .rangeBounds=${WEEK_BOUNDS}
        zoomLevel="week_expanded"
        dateSnapping="auto"
        .isLiveEdge=${false}
      ></range-timeline>
    </div>
  `,
};

/** Month-short zoom: weeks as major ticks, days as detail ticks. */
export const MonthShort = {
  render: () => html`
    <div style="display: flex; padding: 8px 0;">
      <range-timeline
        .startTime=${new Date("2024-01-08T00:00:00Z")}
        .endTime=${new Date("2024-01-15T00:00:00Z")}
        .rangeBounds=${MONTH_BOUNDS}
        zoomLevel="month_short"
        dateSnapping="auto"
        .isLiveEdge=${false}
      ></range-timeline>
    </div>
  `,
};

/** Selection spans the full visible bounds — jump controls are hidden. */
export const FullRangeSelected = {
  render: () => html`
    <div style="display: flex; padding: 8px 0;">
      <range-timeline
        .startTime=${new Date(DAY_BOUNDS.min)}
        .endTime=${new Date(DAY_BOUNDS.max)}
        .rangeBounds=${DAY_BOUNDS}
        zoomLevel="day"
        dateSnapping="auto"
        .isLiveEdge=${false}
      ></range-timeline>
    </div>
  `,
};

/** Narrow one-hour selection centred in the day. */
export const NarrowSelection = {
  render: () => html`
    <div style="display: flex; padding: 8px 0;">
      <range-timeline
        .startTime=${new Date("2024-01-15T11:00:00Z")}
        .endTime=${new Date("2024-01-15T12:00:00Z")}
        .rangeBounds=${DAY_BOUNDS}
        zoomLevel="day"
        dateSnapping="hour"
      ></range-timeline>
    </div>
  `,
};

/** Slot demo: a coloured band injected into the track-overlays slot. */
export const WithTrackOverlay = {
  render: () => {
    const total = DAY_BOUNDS.max - DAY_BOUNDS.min;
    const leftPct =
      ((new Date("2024-01-15T06:00:00Z").getTime() - DAY_BOUNDS.min) / total) *
      100;
    const widthPct =
      ((new Date("2024-01-15T10:00:00Z").getTime() -
        new Date("2024-01-15T06:00:00Z").getTime()) /
        total) *
      100;
    return html`
      <div style="display: flex; padding: 8px 0;">
        <range-timeline
          .startTime=${START}
          .endTime=${END}
          .rangeBounds=${DAY_BOUNDS}
          zoomLevel="day"
          dateSnapping="auto"
        >
          <div
            slot="track-overlays"
            style="
              position: absolute;
              top: -4px; height: 12px;
              left: ${leftPct}%; width: ${widthPct}%;
              border-radius: 999px;
              background: color-mix(in srgb, var(--primary-color, #03a9f4) 32%, transparent);
              pointer-events: none;
            "
          ></div>
        </range-timeline>
      </div>
    `;
  },
};
