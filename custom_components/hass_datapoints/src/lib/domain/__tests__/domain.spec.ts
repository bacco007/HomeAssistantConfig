import { describe, expect, it, vi } from "vitest";
import {
  normalizeEntityIds,
  normalizeTargetValue,
  normalizeTargetSelection,
  mergeTargetSelections,
  resolveEntityIdsFromTarget,
  panelConfigTarget,
} from "@/lib/domain/target-selection";
import {
  normalizeHistorySeriesAnalysis,
  normalizeHistorySeriesRows,
  buildHistorySeriesRows,
  slugifySeriesName,
  parseSeriesColorsParam,
} from "@/lib/domain/history-series";
import { parseDateValue, createChartZoomRange } from "@/lib/domain/chart-zoom";

// Override COLORS so assertions use predictable values independent of constants.js
vi.mock("@/constants", async (importOriginal) => {
  const real = (await importOriginal()) as RecordWithUnknownValues;
  return { ...real, COLORS: ["#111111", "#222222", "#333333"] };
});

const DEFAULT_ANALYSIS = {
  expanded: false,
  sample_interval: "1m",
  sample_aggregate: "mean",
  anomaly_use_sampled_data: true,
  stepped_series: false,
  show_trend_lines: false,
  trend_method: "rolling_average",
  trend_window: "24h",
  show_trend_crosshairs: true,
  show_summary_stats: false,
  show_summary_stats_shading: false,
  show_rate_of_change: false,
  show_rate_crosshairs: true,
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
  anomaly_trend_method: "",
  anomaly_trend_window: "24h",
  show_delta_analysis: false,
  show_delta_tooltip: true,
  show_delta_lines: false,
  hide_source_series: false,
};

describe("domain libs", () => {
  describe("GIVEN mixed entity values", () => {
    describe("WHEN normalizeEntityIds is called", () => {
      it("THEN it returns trimmed string ids only", () => {
        expect.assertions(1);
        expect(normalizeEntityIds([" sensor.a ", null, ""])).toEqual([
          "sensor.a",
        ]);
      });
    });
  });

  describe("GIVEN target values in different shapes", () => {
    describe("WHEN normalizeTargetValue is called", () => {
      it("THEN it maps them into target arrays", () => {
        expect.assertions(2);
        expect(normalizeTargetValue("sensor.a")).toEqual({
          entity_id: ["sensor.a"],
        });
        expect(
          normalizeTargetValue({
            entity_id: ["sensor.a"],
            entities: ["sensor.b"],
            device_id: "device.one",
            area_id: ["kitchen"],
            label_id: "heating",
          })
        ).toEqual({
          entity_id: ["sensor.a", "sensor.b"],
          device_id: ["device.one"],
          area_id: ["kitchen"],
          label_id: ["heating"],
        });
      });
    });
  });

  describe("GIVEN duplicate target values", () => {
    describe("WHEN normalizeTargetSelection and mergeTargetSelections are called", () => {
      it("THEN they deduplicate each target bucket", () => {
        expect.assertions(2);
        expect(
          normalizeTargetSelection({
            entity_id: ["sensor.a", "sensor.a"],
            area_id: ["kitchen", "kitchen"],
          })
        ).toEqual({
          entity_id: ["sensor.a"],
          device_id: [],
          area_id: ["kitchen"],
          label_id: [],
        });

        expect(
          mergeTargetSelections(
            { entity_id: ["sensor.a"], device_id: ["device.one"] },
            { entity_id: ["sensor.b"], device_id: ["device.one"] }
          )
        ).toEqual({
          entity_id: ["sensor.a", "sensor.b"],
          device_id: ["device.one"],
          area_id: [],
          label_id: [],
        });
      });
    });
  });

  describe("GIVEN registry-backed targets", () => {
    describe("WHEN resolveEntityIdsFromTarget is called", () => {
      it("THEN it expands matching entities", () => {
        expect.assertions(1);
        const hass = {
          entities: {
            "sensor.alpha": {
              device_id: "device.one",
              area_id: "kitchen",
              labels: ["heating"],
            },
            "sensor.beta": {
              device_id: "device.two",
              area_id: "office",
              label_ids: ["power"],
            },
          },
        };

        expect(
          resolveEntityIdsFromTarget(hass, {
            entity_id: ["sensor.direct"],
            device_id: ["device.one"],
            area_id: ["office"],
            label_id: ["power"],
          })
        ).toEqual(["sensor.direct", "sensor.alpha", "sensor.beta"]);
      });
    });
  });

  describe("GIVEN panel config inputs", () => {
    describe("WHEN panelConfigTarget is called", () => {
      it("THEN it prefers target and falls back to entities", () => {
        expect.assertions(2);
        expect(
          panelConfigTarget({ target: { entity_id: ["sensor.a"] } })
        ).toEqual({
          entity_id: ["sensor.a"],
        });
        expect(panelConfigTarget({ entities: ["sensor.b"] })).toEqual({
          entity_id: ["sensor.b"],
        });
      });
    });
  });

  describe("GIVEN history series rows", () => {
    describe("WHEN normalizeHistorySeriesRows is called", () => {
      it("THEN it removes duplicates and fills fallback colors", () => {
        expect.assertions(1);
        expect(
          normalizeHistorySeriesRows([
            { entity_id: "sensor.a", color: "#abcdef", visible: false },
            { entity_id: "sensor.a", color: "#123456" },
            { entity_id: "sensor.b", color: "bad" },
          ])
        ).toEqual([
          {
            entity_id: "sensor.a",
            color: "#abcdef",
            visible: false,
            analysis: DEFAULT_ANALYSIS,
          },
          {
            entity_id: "sensor.b",
            color: "#333333",
            visible: true,
            analysis: DEFAULT_ANALYSIS,
          },
        ]);
      });
    });
  });

  describe("GIVEN legacy anomaly settings", () => {
    describe("WHEN normalizeHistorySeriesAnalysis is called", () => {
      it("THEN it preserves the configured method and anomaly windows", () => {
        expect.assertions(1);
        expect(
          normalizeHistorySeriesAnalysis({
            show_anomalies: true,
            anomaly_method: "comparison_window",
            anomaly_rate_window: "6h",
            anomaly_zscore_window: "7d",
            anomaly_persistence_window: "12h",
            anomaly_comparison_window_id: "baseline",
          })
        ).toEqual({
          ...DEFAULT_ANALYSIS,
          show_anomalies: true,
          anomaly_methods: ["comparison_window"],
          anomaly_rate_window: "6h",
          anomaly_zscore_window: "7d",
          anomaly_persistence_window: "12h",
          anomaly_comparison_window_id: "baseline",
        });
      });
    });
  });

  describe("GIVEN entity ids and previous rows", () => {
    describe("WHEN buildHistorySeriesRows is called", () => {
      it("THEN it preserves existing rows and adds defaults", () => {
        expect.assertions(1);
        expect(
          buildHistorySeriesRows(
            ["sensor.a", "sensor.b"],
            [{ entity_id: "sensor.b", color: "#ff0000", visible: false }]
          )
        ).toEqual([
          {
            entity_id: "sensor.a",
            color: "#111111",
            visible: true,
            analysis: DEFAULT_ANALYSIS,
          },
          {
            entity_id: "sensor.b",
            color: "#ff0000",
            visible: false,
            analysis: DEFAULT_ANALYSIS,
          },
        ]);
      });
    });
  });

  describe("GIVEN free text and query params", () => {
    describe("WHEN slugifySeriesName and parseSeriesColorsParam are called", () => {
      it("THEN they normalize them for URLs", () => {
        expect.assertions(2);
        expect(slugifySeriesName(" Living Room Temp ")).toBe(
          "living-room-temp"
        );
        expect(
          parseSeriesColorsParam("living-room-temp:#aabbcc,boiler:#112233")
        ).toEqual({
          "living-room-temp": "#aabbcc",
          boiler: "#112233",
        });
      });
    });
  });

  describe("GIVEN date values", () => {
    describe("WHEN parseDateValue and createChartZoomRange are called", () => {
      it("THEN they return valid parsed ranges only", () => {
        expect.assertions(4);
        expect(parseDateValue("2026-03-01T00:00:00Z")?.toISOString()).toBe(
          "2026-03-01T00:00:00.000Z"
        );
        expect(parseDateValue("nope")).toBeNull();
        expect(
          createChartZoomRange("2026-03-01T00:00:00Z", "2026-03-02T00:00:00Z")
        ).toEqual({
          start: new Date("2026-03-01T00:00:00Z").getTime(),
          end: new Date("2026-03-02T00:00:00Z").getTime(),
        });
        expect(
          createChartZoomRange("2026-03-02T00:00:00Z", "2026-03-01T00:00:00Z")
        ).toBeNull();
      });
    });
  });
});
