import { html } from "lit";
import { expect, fn, userEvent } from "@storybook/test";
import "../target-row";
import type {
  NormalizedAnalysis,
  ComparisonWindow,
  HassEntityState,
} from "../types";

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

type DpTargetRowEl = HTMLElement & {
  shadowRoot: ShadowRoot;
  updateComplete: Promise<boolean>;
};

async function getEl(canvasElement: HTMLElement): Promise<DpTargetRowEl> {
  const el = canvasElement.querySelector("target-row") as DpTargetRowEl;
  await el.updateComplete;
  return el;
}

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

const BLANK_ANALYSIS: NormalizedAnalysis = {
  expanded: false,
  show_trend_lines: false,
  trend_method: "rolling_average",
  trend_window: "24h",
  show_trend_crosshairs: false,
  show_summary_stats: false,
  show_summary_stats_shading: false,
  show_rate_of_change: false,
  show_rate_crosshairs: false,
  rate_window: "1h",
  show_threshold_analysis: false,
  show_threshold_shading: false,
  threshold_value: "",
  threshold_direction: "above",
  show_anomalies: false,
  anomaly_methods: [],
  anomaly_overlap_mode: "all",
  anomaly_sensitivity: "medium",
  anomaly_rate_window: "1h",
  anomaly_zscore_window: "24h",
  anomaly_persistence_window: "1h",
  anomaly_comparison_window_id: null,
  show_delta_analysis: false,
  show_delta_tooltip: true,
  show_delta_lines: false,
  hide_source_series: false,
  sample_interval: "raw",
  sample_aggregate: "mean",
  stepped_series: false,
  anomaly_use_sampled_data: false,
  anomaly_trend_method: "",
  anomaly_trend_window: "24h",
};

const MOCK_STATE_OBJ: HassEntityState = {
  entity_id: "sensor.living_room_temperature",
  state: "21.5",
  attributes: {
    friendly_name: "Living Room Temperature",
    unit_of_measurement: "°C",
    icon: "mdi:thermometer",
    device_class: "temperature",
  },
  last_changed: "2024-01-01T00:00:00.000Z",
  last_updated: "2024-01-01T00:00:00.000Z",
  context: { id: "abc123", parent_id: null, user_id: null },
};

const EXPANDED_ANALYSIS: NormalizedAnalysis = {
  ...BLANK_ANALYSIS,
  expanded: true,
  show_trend_lines: true,
  trend_method: "rolling_average",
  trend_window: "24h",
  show_trend_crosshairs: true,
  show_summary_stats: true,
  show_anomalies: true,
  anomaly_methods: ["trend_residual", "rolling_zscore"],
  anomaly_sensitivity: "medium",
  anomaly_zscore_window: "24h",
  anomaly_overlap_mode: "only",
};

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

/**
 * `target-row` is a single entity row in the history panel sidebar.
 * It shows the entity's name, color swatch, visibility toggle, and an optional
 * expandable analysis panel with trend, threshold, anomaly, and delta options.
 *
 * @fires dp-row-color-change - `{ index, color }` — user changes the swatch color
 * @fires dp-row-visibility-change - `{ entityId, visible }` — user toggles row on/off
 * @fires dp-row-toggle-analysis - `{ entityId }` — user opens/closes the analysis panel
 * @fires dp-row-remove - `{ index }` — user removes the row
 * @fires dp-row-analysis-change - `{ entityId, key, value }` — user changes an analysis option
 */
export default {
  title: "Molecules/Target Row",
  component: "target-row",

  parameters: {
    // Log all custom events to the Actions tab
    actions: {
      handles: [
        "dp-row-color-change",
        "dp-row-visibility-change",
        "dp-row-toggle-analysis",
        "dp-row-remove",
        "dp-row-analysis-change",
      ],
    },
  },

  argTypes: {
    color: {
      control: "color",
      description: "Hex color for the series line and swatch",
    },
    visible: {
      control: "boolean",
      description:
        "Whether the series is shown on the chart — controls the toggle state and `is-hidden` opacity",
    },
    canShowDeltaAnalysis: {
      control: "boolean",
      description:
        "Enable delta analysis options (requires a comparison date window to be active)",
    },
    stateObj: {
      control: "object",
      description:
        "HA entity state object from `hass.states`. Provides the display name (`attributes.friendly_name`), unit (`attributes.unit_of_measurement`), and icon for `ha-state-icon`.",
    },
    index: {
      control: "number",
      description:
        "Zero-based position of this row in the list — included in `dp-row-remove` and `dp-row-color-change` events",
    },
    analysis: {
      control: "object",
      description:
        "Normalized analysis config object with all analysis settings as a flat record. The `expanded` field controls whether the analysis panel is open.",
    },
    comparisonWindows: {
      control: "object",
      description:
        "Array of `{ id, label? }` date windows available for comparison / delta analysis",
    },
  },

  // Shared defaults — all stories inherit these and can override specific fields
  args: {
    color: "#03a9f4",
    visible: true,
    analysis: BLANK_ANALYSIS,
    index: 0,
    canShowDeltaAnalysis: false,
    stateObj: MOCK_STATE_OBJ,
    comparisonWindows: [],
  },

  // Shared render — receives live args so Controls updates re-render the component
  render: (args: RecordWithUnknownValues) => html`
    <div style="max-width: 600px;">
      <target-row
        .color=${args.color}
        .visible=${args.visible}
        .analysis=${args.analysis}
        .index=${args.index}
        .canShowDeltaAnalysis=${args.canShowDeltaAnalysis}
        .stateObj=${args.stateObj}
        .comparisonWindows=${args.comparisonWindows}
      ></target-row>
    </div>
  `,
};

// ---------------------------------------------------------------------------
// Visual state stories
// ---------------------------------------------------------------------------

/**
 * Default collapsed row — entity name, color swatch, visibility toggle, remove and
 * analysis buttons all visible. Analysis panel is hidden.
 */
export const Default = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const sr = el.shadowRoot;

    expect(
      sr.querySelector(".history-target-name-text")?.textContent
    ).toContain("Living Room Temperature");
    expect(
      sr.querySelector(".history-target-entity-id")?.textContent
    ).toContain("sensor.living_room_temperature");

    const toggle = sr.querySelector(
      ".history-target-visible-toggle input"
    ) as HTMLInputElement;
    expect(toggle.checked).toBe(true);

    expect(sr.querySelector(".history-target-analysis")).toBeNull();
    expect(sr.querySelector(".history-target-analysis-toggle")).not.toBeNull();
  },
};

/**
 * Row with the full analysis panel expanded — shows all option groups including
 * trend lines with sub-options, summary stats, anomalies, and delta.
 */
export const AnalysisExpanded = {
  args: {
    analysis: EXPANDED_ANALYSIS,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const sr = el.shadowRoot;

    expect(sr.querySelector(".history-target-analysis")).not.toBeNull();
    expect(
      sr
        .querySelector(".history-target-row")
        ?.classList.contains("analysis-open")
    ).toBe(true);
    expect(
      sr
        .querySelector(".history-target-analysis-toggle")
        ?.classList.contains("is-open")
    ).toBe(true);

    // Trend group is now a child component — verify it is present and checked
    const trendGroup = sr.querySelector(
      "analysis-trend-group"
    ) as HTMLElement & { analysis: { show_trend_lines: boolean } };
    expect(trendGroup).not.toBeNull();
    expect(trendGroup.analysis.show_trend_lines).toBe(true);

    // The group body lives inside analysis-group's shadow DOM — verify via the trend group's group wrapper
    const trendGroupInner =
      trendGroup.shadowRoot?.querySelector("analysis-group");
    expect(trendGroupInner).not.toBeNull();
  },
};

/**
 * Hidden row — reduced opacity via `is-hidden` class, visibility toggle unchecked.
 */
export const Hidden = {
  args: {
    color: "#ff9800",
    visible: false,
    index: 1,
    stateObj: {
      entity_id: "sensor.outdoor_humidity",
      state: "72",
      attributes: {
        friendly_name: "Outdoor Humidity",
        unit_of_measurement: "%",
        icon: "mdi:water-percent",
      },
      last_changed: "",
      last_updated: "",
      context: null,
    } as unknown as HassEntityState,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const sr = el.shadowRoot;

    expect(
      sr.querySelector(".history-target-row")?.classList.contains("is-hidden")
    ).toBe(true);
    const toggle = sr.querySelector(
      ".history-target-visible-toggle input"
    ) as HTMLInputElement;
    expect(toggle.checked).toBe(false);
  },
};

/**
 * Threshold analysis group expanded with a configured value and shading direction.
 */
export const WithThresholdAnalysis = {
  args: {
    color: "#f44336",
    index: 2,
    stateObj: {
      entity_id: "sensor.boiler_temperature",
      state: "75",
      attributes: {
        friendly_name: "Boiler Temperature",
        unit_of_measurement: "°C",
        icon: "mdi:fire",
      },
      last_changed: "",
      last_updated: "",
      context: null,
    } as unknown as HassEntityState,
    analysis: {
      ...BLANK_ANALYSIS,
      expanded: true,
      show_threshold_analysis: true,
      show_threshold_shading: true,
      threshold_value: "80",
      threshold_direction: "above",
    },
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const sr = el.shadowRoot;

    // Threshold group is now a child component — verify it is present and has the correct analysis values
    const thresholdGroup = sr.querySelector(
      "analysis-threshold-group"
    ) as HTMLElement & {
      analysis: {
        show_threshold_analysis: boolean;
        threshold_value: string;
        threshold_direction: string;
      };
    };
    expect(thresholdGroup).not.toBeNull();
    expect(thresholdGroup.analysis.show_threshold_analysis).toBe(true);
    expect(thresholdGroup.analysis.threshold_value).toBe("80");
    expect(thresholdGroup.analysis.threshold_direction).toBe("above");
  },
};

/**
 * Delta analysis enabled with comparison windows listed in a select.
 */
export const WithDeltaAnalysis = {
  args: {
    color: "#4caf50",
    index: 3,
    canShowDeltaAnalysis: true,
    stateObj: {
      entity_id: "sensor.energy_consumption",
      state: "12.4",
      attributes: {
        friendly_name: "Energy Consumption",
        unit_of_measurement: "kWh",
        icon: "mdi:lightning-bolt",
      },
      last_changed: "",
      last_updated: "",
      context: null,
    } as unknown as HassEntityState,
    comparisonWindows: [
      { id: "win-1", label: "Last week" },
      { id: "win-2", label: "Same day last year" },
    ] as ComparisonWindow[],
    analysis: {
      ...BLANK_ANALYSIS,
      expanded: true,
      show_delta_analysis: true,
      show_delta_tooltip: true,
      show_delta_lines: false,
    },
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const sr = el.shadowRoot;

    // Delta group is now a child component — verify it is present and has the correct analysis values
    const deltaGroup = sr.querySelector(
      "analysis-delta-group"
    ) as HTMLElement & {
      analysis: { show_delta_analysis: boolean; show_delta_tooltip: boolean };
      canShowDeltaAnalysis: boolean;
    };
    expect(deltaGroup).not.toBeNull();
    expect(deltaGroup.analysis.show_delta_analysis).toBe(true);
    expect(deltaGroup.analysis.show_delta_tooltip).toBe(true);
    expect(deltaGroup.canShowDeltaAnalysis).toBe(true);
  },
};

/**
 * Binary sensor — analysis is NOT supported, so the expand button is hidden.
 */
export const BinarySensor = {
  args: {
    color: "#9c27b0",
    index: 4,
    stateObj: {
      entity_id: "binary_sensor.motion_hallway",
      state: "on",
      attributes: {
        friendly_name: "Hallway Motion",
        icon: "mdi:motion-sensor",
      },
      last_changed: "",
      last_updated: "",
      context: null,
    } as unknown as HassEntityState,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const sr = el.shadowRoot;

    expect(sr.querySelector(".history-target-analysis-toggle")).toBeNull();
    expect(sr.querySelector(".history-target-visible-toggle")).not.toBeNull();
    expect(sr.querySelector(".history-target-remove")).not.toBeNull();
  },
};

/**
 * Three rows stacked — demonstrates spacing, mixed visibility, and one expanded row.
 * Uses a custom render since multiple independent elements are needed.
 */
export const MultipleRows = {
  render: () => html`
    <div style="max-width: 600px; display: grid; gap: 10px;">
      <target-row
        .stateObj=${{
          entity_id: "sensor.living_room_temperature",
          state: "21.5",
          attributes: {
            friendly_name: "Living Room Temperature",
            unit_of_measurement: "°C",
            icon: "mdi:thermometer",
          },
          last_changed: "",
          last_updated: "",
          context: null,
        }}
        .color=${"#03a9f4"}
        .visible=${true}
        .analysis=${BLANK_ANALYSIS}
        .index=${0}
      ></target-row>
      <target-row
        .stateObj=${{
          entity_id: "sensor.outdoor_humidity",
          state: "72",
          attributes: {
            friendly_name: "Outdoor Humidity",
            unit_of_measurement: "%",
            icon: "mdi:water-percent",
          },
          last_changed: "",
          last_updated: "",
          context: null,
        }}
        .color=${"#ff9800"}
        .visible=${false}
        .analysis=${BLANK_ANALYSIS}
        .index=${1}
      ></target-row>
      <target-row
        .stateObj=${{
          entity_id: "sensor.energy_consumption",
          state: "12.4",
          attributes: {
            friendly_name: "Energy Consumption",
            unit_of_measurement: "kWh",
            icon: "mdi:lightning-bolt",
          },
          last_changed: "",
          last_updated: "",
          context: null,
        }}
        .color=${"#4caf50"}
        .visible=${true}
        .analysis=${EXPANDED_ANALYSIS}
        .index=${2}
      ></target-row>
    </div>
  `,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const rows = canvasElement.querySelectorAll("target-row");
    expect(rows.length).toBe(3);

    const hiddenEl = rows[1] as DpTargetRowEl;
    await hiddenEl.updateComplete;
    expect(
      hiddenEl.shadowRoot
        .querySelector(".history-target-row")
        ?.classList.contains("is-hidden")
    ).toBe(true);

    const expandedEl = rows[2] as DpTargetRowEl;
    await expandedEl.updateComplete;
    expect(
      expandedEl.shadowRoot.querySelector(".history-target-analysis")
    ).not.toBeNull();
  },
};

// ---------------------------------------------------------------------------
// Interaction / event-emission stories
// ---------------------------------------------------------------------------

/** Clicking × fires `dp-row-remove` with the row's index. */
export const EmitsRemove = {
  args: {
    index: 2,
    stateObj: {
      entity_id: "sensor.temp",
      state: "21.5",
      attributes: { friendly_name: "Temperature", unit_of_measurement: "°C" },
      last_changed: "",
      last_updated: "",
      context: null,
    } as unknown as HassEntityState,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const spy = fn();
    el.addEventListener("dp-row-remove", spy);

    await userEvent.click(
      el.shadowRoot.querySelector(".history-target-remove") as HTMLButtonElement
    );

    expect(spy).toHaveBeenCalledOnce();
    expect((spy.mock.calls[0][0] as CustomEvent).detail.index).toBe(2);
  },
};

/** Clicking the chevron fires `dp-row-toggle-analysis` with the entity ID. */
export const EmitsToggleAnalysis = {
  args: {
    stateObj: {
      entity_id: "sensor.energy",
      state: "10.2",
      attributes: { friendly_name: "Energy", icon: "mdi:lightning-bolt" },
      last_changed: "",
      last_updated: "",
      context: null,
    } as unknown as HassEntityState,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const spy = fn();
    el.addEventListener("dp-row-toggle-analysis", spy);

    await userEvent.click(
      el.shadowRoot.querySelector(
        ".history-target-analysis-toggle"
      ) as HTMLButtonElement
    );

    expect(spy).toHaveBeenCalledOnce();
    expect((spy.mock.calls[0][0] as CustomEvent).detail.entityId).toBe(
      "sensor.energy"
    );
  },
};

/** Toggling the visibility switch fires `dp-row-visibility-change`. */
export const EmitsVisibilityChange = {
  args: {
    stateObj: {
      entity_id: "sensor.humidity",
      state: "55",
      attributes: { friendly_name: "Humidity", icon: "mdi:water-percent" },
      last_changed: "",
      last_updated: "",
      context: null,
    } as unknown as HassEntityState,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const spy = fn();
    el.addEventListener("dp-row-visibility-change", spy);

    await userEvent.click(
      el.shadowRoot.querySelector(
        ".history-target-visible-toggle"
      ) as HTMLLabelElement
    );

    expect(spy).toHaveBeenCalledOnce();
    const detail = (spy.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.entityId).toBe("sensor.humidity");
    expect(detail.visible).toBe(false);
  },
};

/** Changing an analysis checkbox fires `dp-row-analysis-change` with the correct key. */
export const EmitsAnalysisChange = {
  args: {
    stateObj: {
      entity_id: "sensor.temp",
      state: "21.5",
      attributes: { friendly_name: "Temperature", unit_of_measurement: "°C" },
      last_changed: "",
      last_updated: "",
      context: null,
    } as unknown as HassEntityState,
    analysis: { ...BLANK_ANALYSIS, expanded: true },
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const spy = fn();
    el.addEventListener("dp-row-analysis-change", spy);

    // Trend group is now a child component — fire dp-group-analysis-change on it to simulate a change
    const trendGroup = el.shadowRoot.querySelector(
      "analysis-trend-group"
    ) as HTMLElement;
    trendGroup.dispatchEvent(
      new CustomEvent("dp-group-analysis-change", {
        detail: {
          entityId: "sensor.temp",
          key: "show_trend_lines",
          value: true,
        },
        bubbles: true,
        composed: true,
      })
    );

    expect(spy).toHaveBeenCalledOnce();
    const detail = (spy.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.entityId).toBe("sensor.temp");
    expect(detail.key).toBe("show_trend_lines");
    expect(detail.value).toBe(true);
  },
};
