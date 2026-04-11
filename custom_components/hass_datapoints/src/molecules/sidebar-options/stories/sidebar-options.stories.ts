import { html } from "lit";
import "../sidebar-options";

/**
 * `sidebar-options` renders the sidebar panel for the history chart, containing controls
 * for datapoint scope, display options, and chart layout. All options are purely presentational —
 * state changes are communicated upward via custom events.
 *
 * @fires dp-scope-change - `{ value: string }` fired when the datapoint scope radio selection changes
 * @fires dp-display-change - `{ kind: string, value: boolean | string }` fired when any display option changes
 */
export default {
  title: "Molecules/Sidebar Options",
  component: "sidebar-options",
  parameters: {
    actions: {
      handles: [
        "dp-scope-change",
        "dp-display-change",
        "dp-radio-change",
        "dp-item-change",
      ],
    },
  },
  argTypes: {
    datapointScope: {
      control: "select",
      options: ["linked", "all", "hidden"],
      description:
        'Which annotation datapoints appear on the chart. One of "linked", "all", or "hidden".',
    },
    showIcons: {
      control: "boolean",
      description: "Whether datapoint icons are shown on the chart.",
    },
    showLines: {
      control: "boolean",
      description: "Whether dotted lines are drawn for each datapoint.",
    },
    showTooltips: {
      control: "boolean",
      description: "Whether chart tooltips are shown on hover.",
    },
    showHoverGuides: {
      control: "boolean",
      description: "Whether hover guide lines are emphasized on the chart.",
    },
    hoverSnapMode: {
      control: "select",
      options: ["follow_series", "snap_to_data_points"],
      description:
        "Whether hover follows the interpolated series or snaps to datapoints.",
    },
    showCorrelatedAnomalies: {
      control: "boolean",
      description:
        "Whether correlated anomalies across series are highlighted.",
    },
    showDataGaps: {
      control: "boolean",
      description: "Whether data gaps are visually indicated on the chart.",
    },
    dataGapThreshold: {
      control: "select",
      options: ["auto", "5m", "15m", "1h", "2h", "3h", "6h", "12h", "24h"],
      description:
        "Minimum gap duration to treat as a data gap. Only active when showDataGaps is true.",
    },
    yAxisMode: {
      control: "select",
      options: ["combined", "unique", "split"],
      description:
        'Y-axis layout mode. "combined" groups by unit, "unique" gives each series its own axis, "split" renders each series in its own row.',
    },
  },
  args: {
    datapointScope: "linked",
    showIcons: true,
    showLines: true,
    showTooltips: true,
    showHoverGuides: false,
    hoverSnapMode: "follow_series",
    showCorrelatedAnomalies: false,
    showDataGaps: true,
    dataGapThreshold: "2h",
    yAxisMode: "combined",
  },
  render: (args: RecordWithUnknownValues) => html`
    <sidebar-options
      .datapointScope=${args.datapointScope}
      .showIcons=${args.showIcons}
      .showLines=${args.showLines}
      .showTooltips=${args.showTooltips}
      .showHoverGuides=${args.showHoverGuides}
      .hoverSnapMode=${args.hoverSnapMode}
      .showCorrelatedAnomalies=${args.showCorrelatedAnomalies}
      .showDataGaps=${args.showDataGaps}
      .dataGapThreshold=${args.dataGapThreshold}
      .yAxisMode=${args.yAxisMode}
    ></sidebar-options>
  `,
};

/** All options at their default values. */
export const Default = {};

/** Datapoint scope set to show all datapoints regardless of selected targets. */
export const ScopeAll = {
  args: { datapointScope: "all" },
};

/** Datapoint scope set to hide all datapoints. */
export const ScopeHidden = {
  args: { datapointScope: "hidden" },
};

/** Data gaps turned off — the gap threshold select should be disabled and dimmed. */
export const DataGapsOff = {
  args: { showDataGaps: false },
};

/** All chart display options turned on. */
export const AllDisplayOptionsOn = {
  args: {
    showIcons: true,
    showLines: true,
    showTooltips: true,
    showHoverGuides: true,
    hoverSnapMode: "snap_to_data_points",
    showCorrelatedAnomalies: true,
    showDataGaps: true,
    dataGapThreshold: "1h",
  },
};

/** Y-axis mode set to unique — each series gets its own y-axis. */
export const YAxisUnique = {
  args: { yAxisMode: "unique" },
};

/** Y-axis mode set to split — each series rendered in its own chart row. */
export const YAxisSplit = {
  args: { yAxisMode: "split" },
};
