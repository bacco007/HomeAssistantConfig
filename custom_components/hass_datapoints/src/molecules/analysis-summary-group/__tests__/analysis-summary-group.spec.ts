import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../analysis-summary-group";
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
  props: { analysis?: Partial<NormalizedAnalysis>; entityId?: string } = {}
) {
  const el = document.createElement("analysis-summary-group") as HTMLElement & {
    analysis: NormalizedAnalysis;
    entityId: string;
    updateComplete: Promise<boolean>;
  };
  el.analysis = makeAnalysis(props.analysis);
  el.entityId = props.entityId ?? "sensor.test";
  document.body.appendChild(el);
  return el;
}

describe("analysis-summary-group", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  // ── group toggle ──────────────────────────────────────────────────────────

  describe("GIVEN show_summary_stats=false", () => {
    beforeEach(async () => {
      el = createElement({ analysis: { show_summary_stats: false } });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN analysis-group has checked=false", () => {
        expect.assertions(1);
        const group = el.shadowRoot!.querySelector(
          "analysis-group"
        ) as HTMLElement & { checked: boolean };
        expect(group.checked).toBe(false);
      });

      it("THEN analysis-group does not render its group body (slot content hidden)", () => {
        expect.assertions(1);
        const group = el.shadowRoot!.querySelector("analysis-group")!;
        const groupBody = group.shadowRoot!.querySelector(".group-body");
        expect(groupBody).toBeNull();
      });
    });
  });

  describe("GIVEN show_summary_stats=true", () => {
    beforeEach(async () => {
      el = createElement({ analysis: { show_summary_stats: true } });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN analysis-group has checked=true", () => {
        expect.assertions(1);
        const group = el.shadowRoot!.querySelector(
          "analysis-group"
        ) as HTMLElement & { checked: boolean };
        expect(group.checked).toBe(true);
      });

      it("THEN the shading checkbox is visible and unchecked", () => {
        expect.assertions(2);
        const shadingCheckbox = el.shadowRoot!.querySelector(
          "label.option input[type='checkbox']"
        ) as Nullable<HTMLInputElement>;
        expect(shadingCheckbox).not.toBeNull();
        expect(shadingCheckbox!.checked).toBe(false);
      });
    });
  });

  describe("GIVEN show_summary_stats=true and show_summary_stats_shading=true", () => {
    beforeEach(async () => {
      el = createElement({
        analysis: {
          show_summary_stats: true,
          show_summary_stats_shading: true,
        },
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the shading checkbox is checked", () => {
        expect.assertions(1);
        const shadingCheckbox = el.shadowRoot!.querySelector(
          "label.option input[type='checkbox']"
        ) as Nullable<HTMLInputElement>;
        expect(shadingCheckbox!.checked).toBe(true);
      });
    });
  });

  // ── dp-group-change → show_summary_stats ─────────────────────────────────

  describe("GIVEN a rendered summary group", () => {
    beforeEach(async () => {
      el = createElement({ analysis: { show_summary_stats: false } });
      await el.updateComplete;
    });

    describe("WHEN dp-group-change fires with checked=true", () => {
      it("THEN dispatches dp-group-analysis-change with key=show_summary_stats value=true", () => {
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
        expect(handler.mock.calls[0][0].detail.key).toBe("show_summary_stats");
        expect(handler.mock.calls[0][0].detail.value).toBe(true);
      });
    });

    describe("WHEN dp-group-change fires with checked=false", () => {
      it("THEN dispatches dp-group-analysis-change with key=show_summary_stats value=false", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-group-analysis-change", handler);
        const group = el.shadowRoot!.querySelector("analysis-group")!;
        group.dispatchEvent(
          new CustomEvent("dp-group-change", {
            detail: { checked: false },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.key).toBe("show_summary_stats");
        expect(handler.mock.calls[0][0].detail.value).toBe(false);
      });
    });
  });

  // ── shading checkbox → show_summary_stats_shading ────────────────────────

  describe("GIVEN show_summary_stats=true and show_summary_stats_shading=false", () => {
    beforeEach(async () => {
      el = createElement({
        analysis: {
          show_summary_stats: true,
          show_summary_stats_shading: false,
        },
      });
      await el.updateComplete;
    });

    describe("WHEN the shading checkbox is changed to checked", () => {
      it("THEN dispatches dp-group-analysis-change with key=show_summary_stats_shading value=true", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-group-analysis-change", handler);
        const shadingCheckbox = el.shadowRoot!.querySelector(
          "label.option input[type='checkbox']"
        ) as HTMLInputElement;
        shadingCheckbox.checked = true;
        shadingCheckbox.dispatchEvent(
          new Event("change", { bubbles: true, composed: true })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.key).toBe(
          "show_summary_stats_shading"
        );
        expect(handler.mock.calls[0][0].detail.value).toBe(true);
      });
    });
  });

  describe("GIVEN show_summary_stats=true and show_summary_stats_shading=true", () => {
    beforeEach(async () => {
      el = createElement({
        analysis: {
          show_summary_stats: true,
          show_summary_stats_shading: true,
        },
      });
      await el.updateComplete;
    });

    describe("WHEN the shading checkbox is changed to unchecked", () => {
      it("THEN dispatches dp-group-analysis-change with key=show_summary_stats_shading value=false", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-group-analysis-change", handler);
        const shadingCheckbox = el.shadowRoot!.querySelector(
          "label.option input[type='checkbox']"
        ) as HTMLInputElement;
        shadingCheckbox.checked = false;
        shadingCheckbox.dispatchEvent(
          new Event("change", { bubbles: true, composed: true })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.key).toBe(
          "show_summary_stats_shading"
        );
        expect(handler.mock.calls[0][0].detail.value).toBe(false);
      });
    });
  });

  // ── entityId propagation ──────────────────────────────────────────────────

  describe("GIVEN entityId=sensor.living_room_temp", () => {
    beforeEach(async () => {
      el = createElement({
        entityId: "sensor.living_room_temp",
        analysis: { show_summary_stats: false },
      });
      await el.updateComplete;
    });

    describe("WHEN dp-group-change fires", () => {
      it("THEN the dispatched event detail includes the correct entityId", () => {
        expect.assertions(1);
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
        expect(handler.mock.calls[0][0].detail.entityId).toBe(
          "sensor.living_room_temp"
        );
      });
    });
  });
});
