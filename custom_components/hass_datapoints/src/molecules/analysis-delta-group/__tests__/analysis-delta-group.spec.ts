import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../analysis-delta-group";
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
    show_delta_tooltip: false,
    show_delta_lines: false,
    hide_source_series: false,
    ...overrides,
  };
}

function createElement(
  props: {
    analysis?: Partial<NormalizedAnalysis>;
    entityId?: string;
    canShowDeltaAnalysis?: boolean;
  } = {}
) {
  const el = document.createElement("analysis-delta-group") as HTMLElement & {
    analysis: NormalizedAnalysis;
    entityId: string;
    canShowDeltaAnalysis: boolean;
    updateComplete: Promise<boolean>;
  };
  el.analysis = makeAnalysis(props.analysis);
  el.entityId = props.entityId ?? "sensor.test";
  el.canShowDeltaAnalysis = props.canShowDeltaAnalysis ?? false;
  document.body.appendChild(el);
  return el;
}

describe("analysis-delta-group", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN canShowDeltaAnalysis=false", () => {
    beforeEach(async () => {
      el = createElement({ canShowDeltaAnalysis: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders analysis-group with disabled=true", () => {
        expect.assertions(1);
        const group = el.shadowRoot!.querySelector(
          "analysis-group"
        ) as HTMLElement & { disabled: boolean };
        expect(group.disabled).toBe(true);
      });

      it("THEN renders analysis-group with checked=false", () => {
        expect.assertions(1);
        const group = el.shadowRoot!.querySelector(
          "analysis-group"
        ) as HTMLElement & { checked: boolean };
        expect(group.checked).toBe(false);
      });
    });
  });

  describe("GIVEN canShowDeltaAnalysis=true and show_delta_analysis=true", () => {
    beforeEach(async () => {
      el = createElement({
        canShowDeltaAnalysis: true,
        analysis: { show_delta_analysis: true },
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders analysis-group with checked=true", () => {
        expect.assertions(1);
        const group = el.shadowRoot!.querySelector(
          "analysis-group"
        ) as HTMLElement & { checked: boolean };
        expect(group.checked).toBe(true);
      });

      it("THEN renders analysis-group with disabled=false", () => {
        expect.assertions(1);
        const group = el.shadowRoot!.querySelector(
          "analysis-group"
        ) as HTMLElement & { disabled: boolean };
        expect(group.disabled).toBe(false);
      });
    });
  });

  describe("GIVEN a rendered delta group", () => {
    beforeEach(async () => {
      el = createElement({
        canShowDeltaAnalysis: true,
        analysis: { show_delta_analysis: false },
      });
      await el.updateComplete;
    });

    describe("WHEN dp-group-change fires with checked=true", () => {
      it("THEN dispatches dp-group-analysis-change with key=show_delta_analysis and value=true", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-group-analysis-change", handler);
        const group = el.shadowRoot!.querySelector("analysis-group")!;
        group.dispatchEvent(
          new CustomEvent("dp-group-change", {
            detail: { checked: true },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.key).toBe("show_delta_analysis");
        expect(handler.mock.calls[0][0].detail.value).toBe(true);
      });
    });
  });
});
