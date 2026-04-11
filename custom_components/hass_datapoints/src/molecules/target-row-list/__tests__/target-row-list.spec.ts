import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../target-row-list";
import type { RowConfig } from "../target-row-list";
import type { NormalizedAnalysis } from "../../target-row/types";

const BLANK_ANALYSIS: NormalizedAnalysis = {
  expanded: false,
  show_trend_lines: false,
  trend_method: "rolling_average",
  trend_window: "24h",
  show_trend_crosshairs: false,
  show_summary_stats: false,
  show_rate_of_change: false,
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
};

const SAMPLE_ROWS: RowConfig[] = [
  {
    entity_id: "sensor.temperature",
    color: "#03a9f4",
    visible: true,
    analysis: BLANK_ANALYSIS,
  },
  {
    entity_id: "sensor.humidity",
    color: "#e040fb",
    visible: false,
    analysis: BLANK_ANALYSIS,
  },
  {
    entity_id: "sensor.pressure",
    color: "#69f0ae",
    visible: true,
    analysis: BLANK_ANALYSIS,
  },
];

const SAMPLE_STATES: Record<string, RecordWithUnknownValues> = {
  "sensor.temperature": {
    entity_id: "sensor.temperature",
    state: "21.5",
    attributes: {
      friendly_name: "Temperature",
      unit_of_measurement: "°C",
      icon: "mdi:thermometer",
    },
    last_changed: "2024-01-01T00:00:00.000Z",
    last_updated: "2024-01-01T00:00:00.000Z",
    context: { id: "a1", parent_id: null, user_id: null },
  },
  "sensor.humidity": {
    entity_id: "sensor.humidity",
    state: "55",
    attributes: {
      friendly_name: "Humidity",
      unit_of_measurement: "%",
      icon: "mdi:water-percent",
    },
    last_changed: "2024-01-01T00:00:00.000Z",
    last_updated: "2024-01-01T00:00:00.000Z",
    context: { id: "a2", parent_id: null, user_id: null },
  },
  "sensor.pressure": {
    entity_id: "sensor.pressure",
    state: "1013",
    attributes: {
      friendly_name: "Pressure",
      unit_of_measurement: "hPa",
      icon: "mdi:gauge",
    },
    last_changed: "2024-01-01T00:00:00.000Z",
    last_updated: "2024-01-01T00:00:00.000Z",
    context: { id: "a3", parent_id: null, user_id: null },
  },
};

function createElement(
  props: Partial<{
    rows: RowConfig[];
    states: Record<string, RecordWithUnknownValues>;
    canShowDeltaAnalysis: boolean;
    comparisonWindows: Array<{ id: string; label?: string }>;
  }> = {}
) {
  const el = document.createElement("target-row-list") as HTMLElement & {
    rows: RowConfig[];
    states: Record<string, RecordWithUnknownValues>;
    canShowDeltaAnalysis: boolean;
    comparisonWindows: Array<{ id: string; label?: string }>;
    updateComplete: Promise<boolean>;
  };
  Object.assign(el, {
    rows: SAMPLE_ROWS,
    states: SAMPLE_STATES,
    canShowDeltaAnalysis: false,
    comparisonWindows: [],
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("target-row-list", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a list with rows", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders one target-row per row", () => {
        expect.assertions(1);
        const rows = el.shadowRoot!.querySelectorAll("target-row");
        expect(rows).toHaveLength(3);
      });

      it("THEN does not show the empty state", () => {
        expect.assertions(1);
        const emptyEl = el.shadowRoot!.querySelector(".history-target-empty");
        expect(emptyEl).toBeNull();
      });

      it("THEN passes stateObj to the first row", async () => {
        expect.assertions(1);
        const firstRow = el.shadowRoot!.querySelector(
          "target-row"
        ) as HTMLElement & {
          stateObj: Nullable<RecordWithUnknownValues>;
          updateComplete: Promise<boolean>;
        };
        await firstRow.updateComplete;
        expect(
          (firstRow.stateObj?.attributes as RecordWithUnknownValues)
            ?.friendly_name
        ).toBe("Temperature");
      });

      it("THEN passes visible=false to the second row", async () => {
        expect.assertions(1);
        const rows = el.shadowRoot!.querySelectorAll(
          "target-row"
        ) as NodeListOf<
          HTMLElement & { visible: boolean; updateComplete: Promise<boolean> }
        >;
        await rows[1].updateComplete;
        expect(rows[1].visible).toBe(false);
      });

      it("THEN marks each row with data-row-index", () => {
        expect.assertions(3);
        const rows = el.shadowRoot!.querySelectorAll(
          "target-row[data-row-index]"
        );
        expect(rows[0].getAttribute("data-row-index")).toBe("0");
        expect(rows[1].getAttribute("data-row-index")).toBe("1");
        expect(rows[2].getAttribute("data-row-index")).toBe("2");
      });
    });
  });

  describe("GIVEN an empty list", () => {
    beforeEach(async () => {
      el = createElement({ rows: [] });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders no content", () => {
        expect.assertions(1);
        const emptyEl = el.shadowRoot!.querySelector(".history-target-empty");
        expect(emptyEl).toBeNull();
      });

      it("THEN does not render any target-row elements", () => {
        expect.assertions(1);
        const rows = el.shadowRoot!.querySelectorAll("target-row");
        expect(rows).toHaveLength(0);
      });
    });
  });

  describe("GIVEN a list with an expanded entity", () => {
    beforeEach(async () => {
      el = createElement({
        rows: [
          SAMPLE_ROWS[0],
          {
            ...SAMPLE_ROWS[1],
            analysis: { ...BLANK_ANALYSIS, expanded: true },
          },
          SAMPLE_ROWS[2],
        ],
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN passes analysis.expanded=true to the matching row and false to others", async () => {
        expect.assertions(2);
        const rows = el.shadowRoot!.querySelectorAll(
          "target-row"
        ) as NodeListOf<
          HTMLElement & {
            analysis: NormalizedAnalysis;
            updateComplete: Promise<boolean>;
          }
        >;
        await rows[1].updateComplete;
        expect(rows[1].analysis.expanded).toBe(true);
        expect(rows[0].analysis.expanded).not.toBe(true);
      });
    });
  });

  describe("GIVEN a list with rows", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN dp-row-remove fires from a child row", () => {
      it("THEN the event bubbles to the list host", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-row-remove", handler);

        const firstRow = el.shadowRoot!.querySelector(
          "target-row"
        ) as HTMLElement & {
          shadowRoot: ShadowRoot;
        };
        const removeBtn = firstRow.shadowRoot!.querySelector(
          ".history-target-remove"
        ) as HTMLButtonElement;
        removeBtn.click();

        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.index).toBe(0);
      });
    });

    describe("WHEN dp-row-toggle-analysis fires from a child row", () => {
      it("THEN the event bubbles to the list host", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-row-toggle-analysis", handler);

        const firstRow = el.shadowRoot!.querySelector(
          "target-row"
        ) as HTMLElement & {
          shadowRoot: ShadowRoot;
        };
        const toggleBtn = firstRow.shadowRoot!.querySelector(
          ".history-target-analysis-toggle"
        ) as HTMLButtonElement;
        toggleBtn.click();

        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.entityId).toBe(
          "sensor.temperature"
        );
      });
    });

    describe("WHEN a reorder drop fires", () => {
      it("THEN dispatches dp-rows-reorder with updated rows array", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-rows-reorder", handler);

        const rows = el.shadowRoot!.querySelectorAll(
          "target-row"
        ) as NodeListOf<HTMLElement>;

        // Trigger dragstart on row 0 — sets _dragSourceIndex = 0 on the component.
        // Do NOT bubble so that it only hits the @dragstart listener on rows[0].
        rows[0].dispatchEvent(
          new DragEvent("dragstart", {
            dataTransfer: new DataTransfer(),
            bubbles: false,
            cancelable: true,
          })
        );

        // Dispatch drop on row[1] with bubbles so it naturally reaches the @drop listener
        // on .history-target-table-body. composedPath() will include rows[1] natively.
        const dropEvent = new DragEvent("drop", {
          dataTransfer: new DataTransfer(),
          bubbles: true,
          cancelable: true,
        });
        // clientY=9999 → below any element midpoint → "after" position
        Object.defineProperty(dropEvent, "clientY", { value: 9999 });
        rows[1].dispatchEvent(dropEvent);

        expect(handler).toHaveBeenCalledOnce();
        const detail = handler.mock.calls[0][0].detail;
        // Row 0 dropped after row 1 → new order: [humidity, temperature, pressure]
        expect(detail.rows[0].entity_id).toBe("sensor.humidity");
        expect(detail.rows[1].entity_id).toBe("sensor.temperature");
      });
    });
  });
});
