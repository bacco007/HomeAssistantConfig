import { html } from "lit";
import { expect, fn, userEvent } from "@storybook/test";
import "../target-row-list";
import type { RowConfig } from "../target-row-list";
import type { NormalizedAnalysis } from "../../target-row/types";

// ---------------------------------------------------------------------------
// Fixtures
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

const SAMPLE_ROWS: RowConfig[] = [
  {
    entity_id: "sensor.living_room_temperature",
    color: "#03a9f4",
    visible: true,
    analysis: BLANK_ANALYSIS,
  },
  {
    entity_id: "sensor.bedroom_temperature",
    color: "#e040fb",
    visible: false,
    analysis: BLANK_ANALYSIS,
  },
  {
    entity_id: "sensor.outdoor_temperature",
    color: "#69f0ae",
    visible: true,
    analysis: { ...BLANK_ANALYSIS, show_trend_lines: true },
  },
];

const SAMPLE_STATES: Record<string, RecordWithUnknownValues> = {
  "sensor.living_room_temperature": {
    entity_id: "sensor.living_room_temperature",
    state: "21.5",
    attributes: {
      friendly_name: "Living Room",
      unit_of_measurement: "°C",
      icon: "mdi:thermometer",
      device_class: "temperature",
    },
    last_changed: "2024-01-01T00:00:00.000Z",
    last_updated: "2024-01-01T00:00:00.000Z",
    context: { id: "abc1", parent_id: null, user_id: null },
  },
  "sensor.bedroom_temperature": {
    entity_id: "sensor.bedroom_temperature",
    state: "19.2",
    attributes: {
      friendly_name: "Bedroom",
      unit_of_measurement: "°C",
      icon: "mdi:thermometer",
      device_class: "temperature",
    },
    last_changed: "2024-01-01T00:00:00.000Z",
    last_updated: "2024-01-01T00:00:00.000Z",
    context: { id: "abc2", parent_id: null, user_id: null },
  },
  "sensor.outdoor_temperature": {
    entity_id: "sensor.outdoor_temperature",
    state: "8.0",
    attributes: {
      friendly_name: "Outdoor",
      unit_of_measurement: "°C",
      icon: "mdi:thermometer-auto",
      device_class: "temperature",
    },
    last_changed: "2024-01-01T00:00:00.000Z",
    last_updated: "2024-01-01T00:00:00.000Z",
    context: { id: "abc3", parent_id: null, user_id: null },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ListEl = HTMLElement & {
  shadowRoot: ShadowRoot;
  updateComplete: Promise<boolean>;
};

async function getEl(canvasElement: HTMLElement): Promise<ListEl> {
  const el = canvasElement.querySelector("target-row-list") as ListEl;
  await el.updateComplete;
  return el;
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

/**
 * `target-row-list` renders an ordered list of `target-row` elements
 * with HTML5 drag-to-reorder support. Pass `rows` and `states` to populate the
 * list. An empty `rows` array shows an empty-state message. Expansion of the
 * analysis panel is driven by `analysis.expanded` inside each row's analysis object.
 *
 * @fires dp-rows-reorder - `{ rows: RowConfig[] }` Emitted after a drag-drop reorder.
 * @fires dp-row-color-change - Bubbled from child row. `{ index, color }`
 * @fires dp-row-visibility-change - Bubbled from child row. `{ entityId, visible }`
 * @fires dp-row-toggle-analysis - Bubbled from child row. `{ entityId }`
 * @fires dp-row-remove - Bubbled from child row. `{ index }`
 * @fires dp-row-analysis-change - Bubbled from child row. `{ entityId, key, value }`
 */
export default {
  title: "Molecules/Target Row List",
  component: "target-row-list",
  parameters: {
    actions: {
      handles: [
        "dp-rows-reorder",
        "dp-row-color-change",
        "dp-row-visibility-change",
        "dp-row-toggle-analysis",
        "dp-row-remove",
        "dp-row-analysis-change",
      ],
    },
  },
  argTypes: {
    rows: {
      control: "object",
      description:
        "Array of RowConfig objects, each with `entity_id`, `color`, `visible`, and `analysis` fields. Set `analysis.expanded = true` on a row to have its analysis panel open.",
    },
    states: {
      control: "object",
      description:
        "Map of entity_id → HA entity state object. Passed to `ha-state-icon` inside each colour swatch.",
    },
    canShowDeltaAnalysis: {
      control: "boolean",
      description:
        "Whether at least one comparison window exists, enabling the delta analysis option.",
    },
    comparisonWindows: {
      control: "object",
      description:
        "Array of date-window comparison objects available for delta analysis.",
    },
  },
  args: {
    rows: SAMPLE_ROWS,
    states: SAMPLE_STATES,
    canShowDeltaAnalysis: false,
    comparisonWindows: [],
  },
  render: (args: RecordWithUnknownValues) => html`
    <div style="max-width: 640px;">
      <target-row-list
        .rows=${args.rows}
        .states=${args.states}
        .canShowDeltaAnalysis=${args.canShowDeltaAnalysis}
        .comparisonWindows=${args.comparisonWindows}
      ></target-row-list>
    </div>
  `,
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Three rows: one hidden, one with trend analysis, all with different colors. */
export const Default = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const rows = el.shadowRoot.querySelectorAll("target-row");
    expect(rows).toHaveLength(3);
  },
};

/** No rows — displays the empty state message. */
export const Empty = {
  args: {
    rows: [],
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const emptyEl = el.shadowRoot.querySelector(".history-target-empty");
    expect(emptyEl).toBeNull();
    const rows = el.shadowRoot.querySelectorAll("target-row");
    expect(rows).toHaveLength(0);
  },
};

/** Analysis panel expanded for the first entity via analysis.expanded. */
export const WithExpandedAnalysis = {
  args: {
    rows: [
      { ...SAMPLE_ROWS[0], analysis: { ...BLANK_ANALYSIS, expanded: true } },
      SAMPLE_ROWS[1],
      SAMPLE_ROWS[2],
    ],
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const firstRow = el.shadowRoot.querySelector(
      "target-row"
    ) as HTMLElement & {
      updateComplete: Promise<boolean>;
    };
    await firstRow.updateComplete;
    // The first row should have analysis.expanded = true — verify the toggle has is-open class
    const toggleBtn = firstRow.shadowRoot!.querySelector(
      ".history-target-analysis-toggle"
    );
    expect(toggleBtn?.classList.contains("is-open")).toBe(true);
  },
};

/** Single row — simplest possible list. */
export const SingleRow = {
  args: {
    rows: [SAMPLE_ROWS[0]],
    states: {
      "sensor.living_room_temperature":
        SAMPLE_STATES["sensor.living_room_temperature"],
    },
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const rows = el.shadowRoot.querySelectorAll("target-row");
    expect(rows).toHaveLength(1);
  },
};

/** Many rows to verify layout at scale. */
export const ManyRows = {
  args: {
    rows: [
      ...SAMPLE_ROWS,
      {
        entity_id: "sensor.kitchen_temperature",
        color: "#ff7043",
        visible: true,
        analysis: BLANK_ANALYSIS,
      },
      {
        entity_id: "sensor.garage_temperature",
        color: "#ffd740",
        visible: true,
        analysis: BLANK_ANALYSIS,
      },
    ],
    states: {
      ...SAMPLE_STATES,
      "sensor.kitchen_temperature": {
        entity_id: "sensor.kitchen_temperature",
        state: "22.1",
        attributes: {
          friendly_name: "Kitchen",
          unit_of_measurement: "°C",
          icon: "mdi:thermometer",
          device_class: "temperature",
        },
        last_changed: "2024-01-01T00:00:00.000Z",
        last_updated: "2024-01-01T00:00:00.000Z",
        context: { id: "abc4", parent_id: null, user_id: null },
      },
      "sensor.garage_temperature": {
        entity_id: "sensor.garage_temperature",
        state: "5.3",
        attributes: {
          friendly_name: "Garage",
          unit_of_measurement: "°C",
          icon: "mdi:thermometer",
          device_class: "temperature",
        },
        last_changed: "2024-01-01T00:00:00.000Z",
        last_updated: "2024-01-01T00:00:00.000Z",
        context: { id: "abc5", parent_id: null, user_id: null },
      },
    },
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const rows = el.shadowRoot.querySelectorAll("target-row");
    expect(rows).toHaveLength(5);
  },
};

// ---------------------------------------------------------------------------
// Event stories
// ---------------------------------------------------------------------------

/** Clicking remove on a child row emits `dp-row-remove` with the correct index. */
export const EmitsRemove = {
  args: {
    rows: [SAMPLE_ROWS[0], SAMPLE_ROWS[1]],
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const spy = fn();
    el.addEventListener("dp-row-remove", spy);

    // Click remove on the second row (index 1)
    const rows = el.shadowRoot.querySelectorAll("target-row") as NodeListOf<
      HTMLElement & { shadowRoot: ShadowRoot }
    >;
    const secondRow = rows[1];
    const removeBtn = secondRow.shadowRoot.querySelector(
      ".history-target-remove"
    ) as HTMLButtonElement;
    await userEvent.click(removeBtn);

    expect(spy).toHaveBeenCalledOnce();
    expect((spy.mock.calls[0][0] as CustomEvent).detail.index).toBe(1);
  },
};

/** Clicking the analysis toggle on a child row emits `dp-row-toggle-analysis`. */
export const EmitsToggleAnalysis = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const spy = fn();
    el.addEventListener("dp-row-toggle-analysis", spy);

    const firstRow = el.shadowRoot.querySelector(
      "target-row"
    ) as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    const toggleBtn = firstRow.shadowRoot.querySelector(
      ".history-target-analysis-toggle"
    ) as HTMLButtonElement;
    await userEvent.click(toggleBtn);

    expect(spy).toHaveBeenCalledOnce();
    expect((spy.mock.calls[0][0] as CustomEvent).detail.entityId).toBe(
      "sensor.living_room_temperature"
    );
  },
};

/** Toggling visibility on a child row emits `dp-row-visibility-change`. */
export const EmitsVisibilityChange = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = await getEl(canvasElement);
    const spy = fn();
    el.addEventListener("dp-row-visibility-change", spy);

    const firstRow = el.shadowRoot.querySelector(
      "target-row"
    ) as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    const checkbox = firstRow.shadowRoot.querySelector(
      ".history-target-visible-toggle input"
    ) as HTMLInputElement;
    // Simulate browser toggling the checkbox before the change event fires
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event("change"));

    expect(spy).toHaveBeenCalledOnce();
    expect((spy.mock.calls[0][0] as CustomEvent).detail.entityId).toBe(
      "sensor.living_room_temperature"
    );
    expect((spy.mock.calls[0][0] as CustomEvent).detail.visible).toBe(false);
  },
};

/** Reorder emits `dp-rows-reorder` with the updated rows array. */
export const EmitsReorder = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = (await getEl(canvasElement)) as ListEl & { rows: RowConfig[] };
    const spy = fn();
    el.addEventListener("dp-rows-reorder", spy);

    const rows = el.shadowRoot.querySelectorAll(
      "target-row"
    ) as NodeListOf<HTMLElement>;

    // Trigger dragstart on row 0 → sets internal _dragSourceIndex = 0
    rows[0].dispatchEvent(
      new DragEvent("dragstart", {
        dataTransfer: new DataTransfer(),
        bubbles: true,
        cancelable: true,
      })
    );

    // Dispatch drop directly on row[1] — it bubbles to the tbody @drop listener,
    // and composedPath() will include the target-row element so _rowFromEvent finds it.
    const rowRect = rows[1].getBoundingClientRect();
    const dropEvent = new DragEvent("drop", {
      dataTransfer: new DataTransfer(),
      bubbles: true,
      cancelable: true,
      // below midpoint → "after" position (row 0 drops to index 1)
      clientY: rowRect.bottom + 1,
    });
    rows[1].dispatchEvent(dropEvent);

    expect(spy).toHaveBeenCalledOnce();
    const reorderedRows: RowConfig[] = (spy.mock.calls[0][0] as CustomEvent)
      .detail.rows;
    // Row 0 moved after row 1: new order is [bedroom, living_room, outdoor]
    expect(reorderedRows[0].entity_id).toBe("sensor.bedroom_temperature");
    expect(reorderedRows[1].entity_id).toBe("sensor.living_room_temperature");
  },
};
