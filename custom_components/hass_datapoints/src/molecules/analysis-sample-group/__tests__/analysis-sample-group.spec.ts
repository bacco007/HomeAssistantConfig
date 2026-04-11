import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../analysis-sample-group";
import type { NormalizedAnalysis } from "../../target-row/types";

function makeAnalysis(
  overrides: Partial<NormalizedAnalysis> = {}
): NormalizedAnalysis {
  return {
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
    show_delta_tooltip: false,
    show_delta_lines: false,
    hide_source_series: false,
    sample_interval: "raw",
    sample_aggregate: "mean",
    anomaly_use_sampled_data: true,
    ...overrides,
  };
}

function createElement(
  props: {
    analysis?: Partial<NormalizedAnalysis>;
    entityId?: string;
  } = {}
) {
  const el = document.createElement("analysis-sample-group") as HTMLElement & {
    analysis: NormalizedAnalysis;
    entityId: string;
    updateComplete: Promise<boolean>;
  };
  el.analysis = makeAnalysis(props.analysis);
  el.entityId = props.entityId ?? "sensor.test";
  document.body.appendChild(el);
  return el;
}

describe("analysis-sample-group", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN sample_interval=raw", () => {
    beforeEach(async () => {
      el = createElement({ analysis: { sample_interval: "raw" } });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN interval inline-select shows raw as value", () => {
        const inlineSelects = el.shadowRoot!.querySelectorAll("inline-select");
        const intervalSelect = inlineSelects[0] as HTMLElement & {
          value: string;
        };
        expect(intervalSelect.value).toBe("raw");
      });

      it("THEN aggregate inline-select is not rendered", () => {
        const inlineSelects = el.shadowRoot!.querySelectorAll("inline-select");
        // Only one inline-select (interval) should be present when disabled
        expect(inlineSelects.length).toBe(1);
      });
    });
  });

  describe("GIVEN sample_interval=1m", () => {
    beforeEach(async () => {
      el = createElement({
        analysis: { sample_interval: "1m", sample_aggregate: "mean" },
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN interval inline-select shows 1m as value", () => {
        const inlineSelects = el.shadowRoot!.querySelectorAll("inline-select");
        const intervalSelect = inlineSelects[0] as HTMLElement & {
          value: string;
        };
        expect(intervalSelect.value).toBe("1m");
      });

      it("THEN aggregate inline-select is rendered", () => {
        const inlineSelects = el.shadowRoot!.querySelectorAll("inline-select");
        expect(inlineSelects.length).toBe(2);
      });
    });
  });

  describe("GIVEN a rendered sample group with entityId=sensor.temp", () => {
    beforeEach(async () => {
      el = createElement({
        analysis: { sample_interval: "1m", sample_aggregate: "mean" },
        entityId: "sensor.temp",
      });
      await el.updateComplete;
    });

    describe("WHEN interval inline-select emits dp-select-change to 5m", () => {
      it("THEN fires dp-group-analysis-change with key=sample_interval and value=5m", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-group-analysis-change", handler);
        const inlineSelects = el.shadowRoot!.querySelectorAll("inline-select");
        inlineSelects[0].dispatchEvent(
          new CustomEvent("dp-select-change", {
            detail: { value: "5m" },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.key).toBe("sample_interval");
        expect(handler.mock.calls[0][0].detail.value).toBe("5m");
      });
    });

    describe("WHEN aggregate inline-select emits dp-select-change to max", () => {
      it("THEN fires dp-group-analysis-change with key=sample_aggregate and value=max", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-group-analysis-change", handler);
        const inlineSelects = el.shadowRoot!.querySelectorAll("inline-select");
        inlineSelects[1].dispatchEvent(
          new CustomEvent("dp-select-change", {
            detail: { value: "max" },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.key).toBe("sample_aggregate");
        expect(handler.mock.calls[0][0].detail.value).toBe("max");
      });
    });
  });
});
