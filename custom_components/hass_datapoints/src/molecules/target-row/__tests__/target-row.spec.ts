import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  deriveSwatchIconColor,
  _hasConfiguredAnalysis,
  _hasActiveAnalysis,
} from "../target-row";
import type { NormalizedAnalysis } from "../types";

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

const MOCK_STATE_OBJ = {
  entity_id: "sensor.temperature",
  state: "21.5",
  attributes: {
    friendly_name: "Temperature",
    unit_of_measurement: "°C",
    icon: "mdi:thermometer",
    device_class: "temperature",
  },
  last_changed: "2024-01-01T00:00:00.000Z",
  last_updated: "2024-01-01T00:00:00.000Z",
  context: { id: "abc123", parent_id: null, user_id: null },
};

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("target-row") as HTMLElement & {
    stateObj: Nullable<RecordWithUnknownValues>;
    color: string;
    visible: boolean;
    analysis: NormalizedAnalysis;
    index: number;
    canShowDeltaAnalysis: boolean;
    updateComplete: Promise<boolean>;
  };
  Object.assign(el, {
    stateObj: MOCK_STATE_OBJ,
    color: "#03a9f4",
    visible: true,
    analysis: BLANK_ANALYSIS,
    index: 0,
    canShowDeltaAnalysis: false,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

// ---------------------------------------------------------------------------
// Module-level function unit tests
// ---------------------------------------------------------------------------

describe("deriveSwatchIconColor", () => {
  describe("GIVEN an invalid hex string", () => {
    describe("WHEN called with an empty string", () => {
      it("THEN returns #ffffff", () => {
        expect.assertions(1);
        expect(deriveSwatchIconColor("")).toBe("#ffffff");
      });
    });

    describe("WHEN called with a non-hex string", () => {
      it("THEN returns #ffffff", () => {
        expect.assertions(1);
        expect(deriveSwatchIconColor("invalid")).toBe("#ffffff");
      });
    });

    describe("WHEN called with a 3-character hex (not 6-character)", () => {
      it("THEN returns #ffffff", () => {
        expect.assertions(1);
        expect(deriveSwatchIconColor("#abc")).toBe("#ffffff");
      });
    });

    describe("WHEN called with a hex missing the # prefix", () => {
      it("THEN returns #ffffff", () => {
        expect.assertions(1);
        expect(deriveSwatchIconColor("03a9f4")).toBe("#ffffff");
      });
    });
  });

  describe("GIVEN a very dark color (#000000)", () => {
    describe("WHEN called", () => {
      it("THEN returns a light color (all rgb channels > 128)", () => {
        expect.assertions(1);
        const result = deriveSwatchIconColor("#000000");
        const match = result.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        expect(
          match &&
            parseInt(match[1], 10) > 128 &&
            parseInt(match[2], 10) > 128 &&
            parseInt(match[3], 10) > 128
        ).toBe(true);
      });
    });
  });

  describe("GIVEN a very light color (#ffffff)", () => {
    describe("WHEN called", () => {
      it("THEN returns a dark color (all rgb channels < 128)", () => {
        expect.assertions(1);
        const result = deriveSwatchIconColor("#ffffff");
        const match = result.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        expect(
          match &&
            parseInt(match[1], 10) < 128 &&
            parseInt(match[2], 10) < 128 &&
            parseInt(match[3], 10) < 128
        ).toBe(true);
      });
    });
  });

  describe("GIVEN a valid hex color", () => {
    describe("WHEN called", () => {
      it("THEN returns a string in rgb() format", () => {
        expect.assertions(1);
        const result = deriveSwatchIconColor("#03a9f4");
        expect(result).toMatch(/^rgb\(\d+,\s*\d+,\s*\d+\)$/);
      });
    });
  });
});

describe("_hasConfiguredAnalysis", () => {
  describe("GIVEN an analysis with all flags off", () => {
    describe("WHEN called", () => {
      it("THEN returns false", () => {
        expect.assertions(1);
        expect(_hasConfiguredAnalysis(BLANK_ANALYSIS)).toBe(false);
      });
    });
  });

  describe("GIVEN an analysis with show_trend_lines enabled", () => {
    describe("WHEN called", () => {
      it("THEN returns true", () => {
        expect.assertions(1);
        expect(
          _hasConfiguredAnalysis({ ...BLANK_ANALYSIS, show_trend_lines: true })
        ).toBe(true);
      });
    });
  });

  describe("GIVEN an analysis with show_summary_stats enabled", () => {
    describe("WHEN called", () => {
      it("THEN returns true", () => {
        expect.assertions(1);
        expect(
          _hasConfiguredAnalysis({
            ...BLANK_ANALYSIS,
            show_summary_stats: true,
          })
        ).toBe(true);
      });
    });
  });

  describe("GIVEN an analysis with show_rate_of_change enabled", () => {
    describe("WHEN called", () => {
      it("THEN returns true", () => {
        expect.assertions(1);
        expect(
          _hasConfiguredAnalysis({
            ...BLANK_ANALYSIS,
            show_rate_of_change: true,
          })
        ).toBe(true);
      });
    });
  });

  describe("GIVEN an analysis with show_threshold_analysis enabled", () => {
    describe("WHEN called", () => {
      it("THEN returns true", () => {
        expect.assertions(1);
        expect(
          _hasConfiguredAnalysis({
            ...BLANK_ANALYSIS,
            show_threshold_analysis: true,
          })
        ).toBe(true);
      });
    });
  });

  describe("GIVEN an analysis with show_anomalies enabled", () => {
    describe("WHEN called", () => {
      it("THEN returns true", () => {
        expect.assertions(1);
        expect(
          _hasConfiguredAnalysis({ ...BLANK_ANALYSIS, show_anomalies: true })
        ).toBe(true);
      });
    });
  });

  describe("GIVEN an analysis with show_delta_analysis enabled", () => {
    describe("WHEN called", () => {
      it("THEN returns true", () => {
        expect.assertions(1);
        expect(
          _hasConfiguredAnalysis({
            ...BLANK_ANALYSIS,
            show_delta_analysis: true,
          })
        ).toBe(true);
      });
    });
  });

  describe("GIVEN an analysis with hide_source_series enabled", () => {
    describe("WHEN called", () => {
      it("THEN returns true", () => {
        expect.assertions(1);
        expect(
          _hasConfiguredAnalysis({
            ...BLANK_ANALYSIS,
            hide_source_series: true,
          })
        ).toBe(true);
      });
    });
  });
});

describe("_hasActiveAnalysis", () => {
  describe("GIVEN an analysis with all flags off", () => {
    describe("WHEN called with hasComparisonWindow=false", () => {
      it("THEN returns false", () => {
        expect.assertions(1);
        expect(_hasActiveAnalysis(BLANK_ANALYSIS, false)).toBe(false);
      });
    });

    describe("WHEN called with hasComparisonWindow=true", () => {
      it("THEN returns false", () => {
        expect.assertions(1);
        expect(_hasActiveAnalysis(BLANK_ANALYSIS, true)).toBe(false);
      });
    });
  });

  describe("GIVEN an analysis with show_trend_lines enabled", () => {
    describe("WHEN called with hasComparisonWindow=false", () => {
      it("THEN returns true", () => {
        expect.assertions(1);
        expect(
          _hasActiveAnalysis(
            { ...BLANK_ANALYSIS, show_trend_lines: true },
            false
          )
        ).toBe(true);
      });
    });
  });

  describe("GIVEN an analysis with show_delta_analysis enabled but no comparison window", () => {
    describe("WHEN called with hasComparisonWindow=false", () => {
      it("THEN returns false", () => {
        expect.assertions(1);
        expect(
          _hasActiveAnalysis(
            { ...BLANK_ANALYSIS, show_delta_analysis: true },
            false
          )
        ).toBe(false);
      });
    });
  });

  describe("GIVEN an analysis with show_delta_analysis enabled and a comparison window present", () => {
    describe("WHEN called with hasComparisonWindow=true", () => {
      it("THEN returns true", () => {
        expect.assertions(1);
        expect(
          _hasActiveAnalysis(
            { ...BLANK_ANALYSIS, show_delta_analysis: true },
            true
          )
        ).toBe(true);
      });
    });
  });

  describe("GIVEN an analysis with only hide_source_series enabled", () => {
    describe("WHEN called with hasComparisonWindow=false", () => {
      it("THEN returns false (hide_source_series is not an active analysis flag)", () => {
        expect.assertions(1);
        expect(
          _hasActiveAnalysis(
            { ...BLANK_ANALYSIS, hide_source_series: true },
            false
          )
        ).toBe(false);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// Component DOM tests
// ---------------------------------------------------------------------------

describe("target-row", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a visible row", () => {
    beforeEach(async () => {
      el = createElement({ visible: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the row does not have the is-hidden class", () => {
        expect.assertions(1);
        const row = el.shadowRoot!.querySelector(".history-target-row");
        expect(row?.classList.contains("is-hidden")).toBe(false);
      });

      it("THEN the visibility checkbox is checked", () => {
        expect.assertions(1);
        const checkbox = el.shadowRoot!.querySelector(
          ".history-target-visible-toggle input"
        ) as HTMLInputElement;
        expect(checkbox.checked).toBe(true);
      });

      it("THEN the entity name is shown", () => {
        expect.assertions(1);
        const text = el.shadowRoot!.querySelector(
          ".history-target-name-text"
        )?.textContent;
        expect(text).toContain("Temperature");
      });

      it("THEN the entity ID is shown", () => {
        expect.assertions(1);
        const text = el.shadowRoot!.querySelector(
          ".history-target-entity-id"
        )?.textContent;
        expect(text).toContain("sensor.temperature");
      });
    });
  });

  describe("GIVEN a hidden row", () => {
    beforeEach(async () => {
      el = createElement({ visible: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the row has the is-hidden class", () => {
        expect.assertions(1);
        const row = el.shadowRoot!.querySelector(".history-target-row");
        expect(row?.classList.contains("is-hidden")).toBe(true);
      });

      it("THEN the visibility checkbox is not checked", () => {
        expect.assertions(1);
        const checkbox = el.shadowRoot!.querySelector(
          ".history-target-visible-toggle input"
        ) as HTMLInputElement;
        expect(checkbox.checked).toBe(false);
      });
    });
  });

  describe("GIVEN a row with analysis collapsed", () => {
    beforeEach(async () => {
      el = createElement({ analysis: { ...BLANK_ANALYSIS, expanded: false } });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the analysis panel is not in the DOM", () => {
        expect.assertions(1);
        const panel = el.shadowRoot!.querySelector(".history-target-analysis");
        expect(panel).toBeNull();
      });

      it("THEN the analysis toggle does not have is-open class", () => {
        expect.assertions(1);
        const btn = el.shadowRoot!.querySelector(
          ".history-target-analysis-toggle"
        );
        expect(btn?.classList.contains("is-open")).toBe(false);
      });
    });
  });

  describe("GIVEN a row with analysis expanded", () => {
    beforeEach(async () => {
      el = createElement({ analysis: { ...BLANK_ANALYSIS, expanded: true } });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the analysis panel is present", () => {
        expect.assertions(1);
        const panel = el.shadowRoot!.querySelector(".history-target-analysis");
        expect(panel).not.toBeNull();
      });

      it("THEN the row has analysis-open class", () => {
        expect.assertions(1);
        const row = el.shadowRoot!.querySelector(".history-target-row");
        expect(row?.classList.contains("analysis-open")).toBe(true);
      });

      it("THEN the analysis toggle has is-open class", () => {
        expect.assertions(1);
        const btn = el.shadowRoot!.querySelector(
          ".history-target-analysis-toggle"
        );
        expect(btn?.classList.contains("is-open")).toBe(true);
      });
    });
  });

  describe("GIVEN a binary_sensor row", () => {
    beforeEach(async () => {
      el = createElement({
        stateObj: {
          entity_id: "binary_sensor.motion",
          state: "on",
          attributes: { friendly_name: "Motion" },
          last_changed: "",
          last_updated: "",
          context: null,
        },
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the analysis toggle button is not shown", () => {
        expect.assertions(1);
        const btn = el.shadowRoot!.querySelector(
          ".history-target-analysis-toggle"
        );
        expect(btn).toBeNull();
      });
    });
  });

  describe("GIVEN a visible row", () => {
    beforeEach(async () => {
      el = createElement({ visible: true });
      await el.updateComplete;
    });

    describe("WHEN the visibility toggle changes", () => {
      it("THEN dispatches dp-row-visibility-change with visible=false", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-row-visibility-change", handler);
        const checkbox = el.shadowRoot!.querySelector(
          ".history-target-visible-toggle input"
        ) as HTMLInputElement;
        checkbox.checked = false; // simulate browser toggling the checkbox
        checkbox.dispatchEvent(new Event("change"));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.entityId).toBe(
          "sensor.temperature"
        );
        expect(handler.mock.calls[0][0].detail.visible).toBe(false);
      });
    });
  });

  describe("GIVEN a row", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN remove button is clicked", () => {
      it("THEN dispatches dp-row-remove with the row index", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-row-remove", handler);
        const btn = el.shadowRoot!.querySelector(
          ".history-target-remove"
        ) as HTMLButtonElement;
        btn.click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.index).toBe(0);
      });
    });

    describe("WHEN the analysis toggle button is clicked", () => {
      it("THEN dispatches dp-row-toggle-analysis", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-row-toggle-analysis", handler);
        const btn = el.shadowRoot!.querySelector(
          ".history-target-analysis-toggle"
        ) as HTMLButtonElement;
        btn.click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.entityId).toBe(
          "sensor.temperature"
        );
      });
    });
  });

  describe("GIVEN a row with analysis expanded and trend lines active", () => {
    beforeEach(async () => {
      el = createElement({
        analysis: { ...BLANK_ANALYSIS, expanded: true, show_trend_lines: true },
      });
      await el.updateComplete;
    });

    describe("WHEN a dp-group-analysis-change event fires from the trend group", () => {
      it("THEN dispatches dp-row-analysis-change with key show_trend_lines", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-row-analysis-change", handler);
        const trendGroup = el.shadowRoot!.querySelector(
          "analysis-trend-group"
        )!;
        trendGroup.dispatchEvent(
          new CustomEvent("dp-group-analysis-change", {
            detail: {
              entityId: "sensor.temperature",
              key: "show_trend_lines",
              value: true,
            },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.key).toBe("show_trend_lines");
        expect(handler.mock.calls[0][0].detail.entityId).toBe(
          "sensor.temperature"
        );
      });
    });
  });
});
