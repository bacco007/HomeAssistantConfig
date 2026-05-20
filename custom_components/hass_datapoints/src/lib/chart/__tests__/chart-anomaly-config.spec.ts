import { describe, expect, it } from "vitest";
import { buildBackendAnomalyConfig } from "../chart-anomaly-config";

describe("chart-anomaly-config", () => {
  describe("GIVEN buildBackendAnomalyConfig", () => {
    describe("WHEN analysis has standard anomaly methods", () => {
      it("THEN it maps them directly", () => {
        expect.assertions(1);
        const config = buildBackendAnomalyConfig({
          anomaly_methods: ["iqr", "zscore"],
          anomaly_sensitivity: "medium",
        });
        expect(config.anomaly_methods).toEqual(["iqr", "zscore"]);
      });
    });

    describe("WHEN analysis includes similar_entity method", () => {
      it("THEN it maps similar_entity to comparison_window", () => {
        expect.assertions(2);
        const config = buildBackendAnomalyConfig({
          anomaly_methods: ["similar_entity", "iqr"],
          anomaly_comparison_entity_id: "sensor.other",
        });
        expect(config.anomaly_methods).toContain("comparison_window");
        expect(config.comparison_entity_id).toBe("sensor.other");
      });
    });

    describe("WHEN analysis includes both similar_entity and comparison_window", () => {
      it("THEN it deduplicates comparison_window", () => {
        expect.assertions(1);
        const config = buildBackendAnomalyConfig({
          anomaly_methods: ["similar_entity", "comparison_window"],
        });
        expect(
          config.anomaly_methods!.filter((m) => m === "comparison_window")
        ).toHaveLength(1);
      });
    });

    describe("WHEN analysis has anomaly_trend_method", () => {
      it("THEN it uses anomaly_trend_method over trend_method", () => {
        expect.assertions(2);
        const config = buildBackendAnomalyConfig({
          anomaly_methods: ["iqr"],
          anomaly_trend_method: "ema",
          anomaly_trend_window: "12h",
          trend_method: "linear_trend",
          trend_window: "24h",
        });
        expect(config.trend_method).toBe("ema");
        expect(config.trend_window).toBe("12h");
      });
    });

    describe("WHEN anomaly_use_sampled_data is not false", () => {
      it("THEN it includes sample_interval and sample_aggregate", () => {
        expect.assertions(2);
        const config = buildBackendAnomalyConfig({
          anomaly_methods: ["iqr"],
          sample_interval: "1h",
          sample_aggregate: "mean",
        });
        expect(config.sample_interval).toBe("1h");
        expect(config.sample_aggregate).toBe("mean");
      });
    });

    describe("WHEN anomaly_use_sampled_data is false", () => {
      it("THEN it omits sample settings", () => {
        expect.assertions(2);
        const config = buildBackendAnomalyConfig({
          anomaly_methods: ["iqr"],
          anomaly_use_sampled_data: false,
          sample_interval: "1h",
          sample_aggregate: "mean",
        });
        expect(config.sample_interval).toBeUndefined();
        expect(config.sample_aggregate).toBeUndefined();
      });
    });

    describe("WHEN no methods are provided", () => {
      it("THEN anomaly_methods is undefined", () => {
        expect.assertions(1);
        const config = buildBackendAnomalyConfig({});
        expect(config.anomaly_methods).toBeUndefined();
      });
    });
  });
});
