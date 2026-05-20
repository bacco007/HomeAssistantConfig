import { html } from "lit";
import "../range-scale";
import type { RangeBounds } from "../types";

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
  };
  const config = configs[zoomLevel] ?? configs.day;
  const minMs = REF.getTime() - 3 * 86400_000;
  const maxMs = REF.getTime() + 3 * 86400_000;
  return { min: minMs, max: maxMs, config } as RangeBounds;
}

const DAY_BOUNDS = makeBounds("day");
const WEEK_BOUNDS = makeBounds("week_expanded");

/**
 * `range-scale` renders tick marks, scale labels, and context dividers
 * for a range-timeline. It is a pure display component driven by `rangeBounds`.
 *
 * @fires dp-scale-period-select - period button clicked
 * @fires dp-scale-period-hover  - period button hovered
 * @fires dp-scale-period-leave  - period button left
 */
export default {
  title: "Atoms/Interactive/Range Timeline/Range Scale",
  component: "range-scale",
  parameters: {
    actions: {
      handles: [
        "dp-scale-period-select",
        "dp-scale-period-hover",
        "dp-scale-period-leave",
      ],
    },
    layout: "padded",
  },
  argTypes: {
    zoomLevel: {
      control: "select",
      options: ["day", "week_expanded", "week_compressed", "month_short"],
    },
    contentWidth: {
      control: { type: "range", min: 200, max: 2000, step: 50 },
    },
  },
  args: {
    zoomLevel: "day",
    contentWidth: 800,
  },
  render: (args: RecordWithUnknownValues) => html`
    <div
      style="position: relative; height: 60px; width: ${args.contentWidth}px; background: var(--card-background-color); border-radius: 8px; overflow: hidden;"
    >
      <range-scale
        .rangeBounds=${DAY_BOUNDS}
        .zoomLevel=${args.zoomLevel as string}
        .contentWidth=${args.contentWidth as number}
      ></range-scale>
    </div>
  `,
};

export const Default = {};

export const WeekExpanded = {
  args: { zoomLevel: "week_expanded", contentWidth: 1200 },
  render: (args: RecordWithUnknownValues) => html`
    <div
      style="position: relative; height: 60px; width: ${args.contentWidth}px; background: var(--card-background-color); border-radius: 8px; overflow: hidden;"
    >
      <range-scale
        .rangeBounds=${WEEK_BOUNDS}
        .zoomLevel=${args.zoomLevel as string}
        .contentWidth=${args.contentWidth as number}
      ></range-scale>
    </div>
  `,
};
