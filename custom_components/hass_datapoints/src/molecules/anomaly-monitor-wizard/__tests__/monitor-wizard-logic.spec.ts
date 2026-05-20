import { describe, expect, it } from "vitest";
import {
  LOOK_BACK_OPTIONS,
  SCAN_INTERVAL_OPTIONS,
  defaultEntityConfig,
  configFromMonitor,
  entityConfigToAnalysis,
  toggleMethod,
  buildConfigPayload,
  validateStep1,
  validateStep2,
  autoPopulateMonitorName,
  buildOverlapOptions,
} from "../monitor-wizard-logic";
import type { AnomalyMonitor } from "@/lib/data/monitors-api";

describe("monitor-wizard-logic", () => {
  // ── Constants ────────────────────────────────────────────────────────────

  describe("GIVEN LOOK_BACK_OPTIONS", () => {
    it("THEN contains expected hour values", () => {
      const values = LOOK_BACK_OPTIONS.map((o) => o.value);
      expect(values).toEqual([6, 12, 24, 48, 168]);
    });
  });

  describe("GIVEN SCAN_INTERVAL_OPTIONS", () => {
    it("THEN contains expected minute values", () => {
      const values = SCAN_INTERVAL_OPTIONS.map((o) => o.value);
      expect(values).toEqual([15, 30, 60, 120, 360]);
    });
  });

  // ── defaultEntityConfig ──────────────────────────────────────────────────

  describe("GIVEN defaultEntityConfig", () => {
    describe("WHEN called with no prefill", () => {
      it("THEN returns sensible defaults", () => {
        const cfg = defaultEntityConfig();
        expect(cfg.anomaly_methods).toEqual(["trend_residual"]);
        expect(cfg.anomaly_overlap_mode).toBe("all");
        expect(cfg.anomaly_sensitivity).toBe("medium");
        expect(cfg.anomaly_rate_window).toBe("1h");
        expect(cfg.anomaly_zscore_window).toBe("24h");
        expect(cfg.anomaly_persistence_window).toBe("1h");
        expect(cfg.anomaly_comparison_window_id).toBeNull();
        expect(cfg.anomaly_comparison_entity_id).toBeNull();
        expect(cfg.anomaly_trend_method).toBe("rolling_average");
        expect(cfg.anomaly_trend_window).toBe("24h");
        expect(cfg.sample_interval).toBe("raw");
        expect(cfg.sample_aggregate).toBe("mean");
        expect(cfg.anomaly_use_sampled_data).toBe(false);
        expect(cfg.baseline_entity_id).toBeNull();
        expect(cfg.baseline_time_offset_hours).toBe(0);
      });
    });

    describe("WHEN called with a prefill", () => {
      it("THEN merges prefilled values", () => {
        const cfg = defaultEntityConfig({
          anomaly_methods: ["zscore"],
          anomaly_overlap_mode: "only",
          anomaly_sensitivity: "high",
          anomaly_comparison_entity_id: "sensor.reference",
          sample_interval: "5m",
        });
        expect(cfg.anomaly_methods).toEqual(["zscore"]);
        expect(cfg.anomaly_overlap_mode).toBe("only");
        expect(cfg.anomaly_sensitivity).toBe("high");
        expect(cfg.anomaly_comparison_entity_id).toBe("sensor.reference");
        expect(cfg.sample_interval).toBe("5m");
        // Non-prefilled fields use defaults
        expect(cfg.anomaly_rate_window).toBe("1h");
      });
    });

    describe("WHEN prefill has empty anomaly_methods", () => {
      it("THEN falls back to trend_residual", () => {
        const cfg = defaultEntityConfig({ anomaly_methods: [] });
        expect(cfg.anomaly_methods).toEqual(["trend_residual"]);
      });
    });

    describe("WHEN called with null prefill", () => {
      it("THEN returns defaults", () => {
        const cfg = defaultEntityConfig(null);
        expect(cfg.anomaly_methods).toEqual(["trend_residual"]);
      });
    });
  });

  // ── configFromMonitor ────────────────────────────────────────────────────

  describe("GIVEN configFromMonitor", () => {
    const makeMonitor = (
      overrides: Partial<AnomalyMonitor> = {}
    ): AnomalyMonitor =>
      ({
        id: "m1",
        type: "individual",
        name: "Test",
        entity_id: "sensor.temp",
        enabled: true,
        look_back_hours: 24,
        scan_interval_minutes: 30,
        anomaly_methods: ["trend_residual"],
        anomaly_sensitivity: "medium",
        anomaly_overlap_mode: "all",
        anomaly_rate_window: "1h",
        anomaly_zscore_window: "24h",
        anomaly_persistence_window: "1h",
        anomaly_trend_method: "rolling_average",
        anomaly_trend_window: "24h",
        sample_interval: "5m",
        sample_aggregate: "mean",
        anomaly_use_sampled_data: true,
        baseline_entity_id: null,
        baseline_time_offset_hours: 0,
        ...overrides,
      }) as unknown as AnomalyMonitor;

    describe("WHEN converting a monitor", () => {
      it("THEN extracts all analysis fields", () => {
        const m = makeMonitor();
        const cfg = configFromMonitor(m);
        expect(cfg.anomaly_methods).toEqual(["trend_residual"]);
        expect(cfg.anomaly_overlap_mode).toBe("all");
        expect(cfg.anomaly_sensitivity).toBe("medium");
        expect(cfg.sample_interval).toBe("5m");
        expect(cfg.anomaly_use_sampled_data).toBe(true);
      });
    });

    describe("WHEN monitor has null sample_interval", () => {
      it("THEN defaults to raw", () => {
        const m = makeMonitor({ sample_interval: null });
        const cfg = configFromMonitor(m);
        expect(cfg.sample_interval).toBe("raw");
      });
    });

    describe("WHEN monitor has baseline fields", () => {
      it("THEN extracts them", () => {
        const m = makeMonitor({
          anomaly_methods: ["comparison_window"],
          baseline_entity_id: "sensor.baseline",
          baseline_time_offset_hours: 24,
        } as Partial<AnomalyMonitor>);
        const cfg = configFromMonitor(m);
        expect(cfg.anomaly_methods).toEqual(["similar_entity"]);
        expect(cfg.anomaly_comparison_entity_id).toBe("sensor.baseline");
        expect(cfg.baseline_entity_id).toBe("sensor.baseline");
        expect(cfg.baseline_time_offset_hours).toBe(24);
      });
    });
  });

  // ── entityConfigToAnalysis ───────────────────────────────────────────────

  describe("GIVEN entityConfigToAnalysis", () => {
    describe("WHEN converting a config", () => {
      it("THEN produces a full analysis with wizard fields + defaults", () => {
        const cfg = defaultEntityConfig();
        const analysis = entityConfigToAnalysis(cfg);
        expect(analysis.show_anomalies).toBe(true);
        expect(analysis.anomaly_methods).toEqual(["trend_residual"]);
        expect(analysis.anomaly_overlap_mode).toBe("all");
        expect(analysis.anomaly_comparison_entity_id).toBeNull();
        expect(analysis.show_trend_lines).toBe(false);
        expect(analysis.show_summary_stats).toBe(false);
        expect(analysis.expanded).toBe(true);
        expect(analysis.threshold_value).toBe("0");
      });
    });

    describe("WHEN config has custom values", () => {
      it("THEN carries them through", () => {
        const cfg = defaultEntityConfig({
          anomaly_overlap_mode: "only",
          anomaly_sensitivity: "high",
          anomaly_comparison_window_id: "window-1",
          anomaly_comparison_entity_id: "sensor.reference",
        });
        const analysis = entityConfigToAnalysis(cfg);
        expect(analysis.anomaly_overlap_mode).toBe("only");
        expect(analysis.anomaly_sensitivity).toBe("high");
        expect(analysis.anomaly_comparison_window_id).toBe("window-1");
        expect(analysis.anomaly_comparison_entity_id).toBe("sensor.reference");
      });
    });
  });

  // ── toggleMethod ─────────────────────────────────────────────────────────

  describe("GIVEN toggleMethod", () => {
    describe("WHEN adding a method", () => {
      it("THEN appends to the list", () => {
        const cfg = defaultEntityConfig();
        const updated = toggleMethod(cfg, "zscore", true);
        expect(updated.anomaly_methods).toEqual(["trend_residual", "zscore"]);
      });
    });

    describe("WHEN removing a method", () => {
      it("THEN filters it out", () => {
        const cfg = defaultEntityConfig();
        const updated = toggleMethod(cfg, "trend_residual", false);
        expect(updated.anomaly_methods).toEqual([]);
      });
    });

    describe("WHEN toggling", () => {
      it("THEN does not mutate the original config", () => {
        const cfg = defaultEntityConfig();
        toggleMethod(cfg, "zscore", true);
        expect(cfg.anomaly_methods).toEqual(["trend_residual"]);
      });
    });
  });

  // ── buildConfigPayload ───────────────────────────────────────────────────

  describe("GIVEN buildConfigPayload", () => {
    describe("WHEN sample_interval is raw", () => {
      it("THEN does not include sampling fields", () => {
        const cfg = defaultEntityConfig();
        const payload = buildConfigPayload(cfg);
        expect(payload.sample_interval).toBeUndefined();
        expect(payload.anomaly_use_sampled_data).toBeUndefined();
      });
    });

    describe("WHEN sample_interval is set", () => {
      it("THEN includes sampling fields with anomaly_use_sampled_data=true", () => {
        const cfg = defaultEntityConfig({ sample_interval: "5m" });
        const payload = buildConfigPayload(cfg);
        expect(payload.sample_interval).toBe("5m");
        expect(payload.sample_aggregate).toBe("mean");
        expect(payload.anomaly_use_sampled_data).toBe(true);
      });
    });

    describe("WHEN baseline_entity_id is set", () => {
      it("THEN includes baseline fields", () => {
        const cfg = {
          ...defaultEntityConfig(),
          baseline_entity_id: "sensor.ref",
          baseline_time_offset_hours: 12,
        };
        const payload = buildConfigPayload(cfg);
        expect(payload.baseline_entity_id).toBe("sensor.ref");
        expect(payload.baseline_time_offset_hours).toBe(12);
      });
    });

    describe("WHEN similar_entity is set", () => {
      it("THEN maps it to comparison_window and uses the comparison entity as the baseline entity", () => {
        const cfg = {
          ...defaultEntityConfig(),
          anomaly_methods: ["similar_entity", "comparison_window"],
          anomaly_comparison_entity_id: "sensor.reference",
        };
        const payload = buildConfigPayload(cfg);
        expect(payload.anomaly_methods).toEqual(["comparison_window"]);
        expect(payload.baseline_entity_id).toBe("sensor.reference");
      });
    });

    describe("WHEN baseline_entity_id is null", () => {
      it("THEN does not include baseline fields", () => {
        const cfg = defaultEntityConfig();
        const payload = buildConfigPayload(cfg);
        expect(payload.baseline_entity_id).toBeUndefined();
      });
    });

    describe("WHEN trend_method is empty", () => {
      it("THEN defaults to rolling_average", () => {
        const cfg = { ...defaultEntityConfig(), anomaly_trend_method: "" };
        const payload = buildConfigPayload(cfg);
        expect(payload.anomaly_trend_method).toBe("rolling_average");
      });
    });
  });

  // ── validateStep1 ────────────────────────────────────────────────────────

  describe("GIVEN validateStep1", () => {
    describe("WHEN entityIds is empty", () => {
      it("THEN returns invalid", () => {
        const result = validateStep1([]);
        expect(result.valid).toBe(false);
        expect(result.error).toBeTruthy();
      });
    });

    describe("WHEN entityIds has entries", () => {
      it("THEN returns valid", () => {
        const result = validateStep1(["sensor.temp"]);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });
  });

  // ── validateStep2 ────────────────────────────────────────────────────────

  describe("GIVEN validateStep2", () => {
    describe("WHEN all entities have methods", () => {
      it("THEN returns valid", () => {
        const result = validateStep2(["sensor.temp"], () =>
          defaultEntityConfig()
        );
        expect(result.valid).toBe(true);
      });
    });

    describe("WHEN an entity has no methods", () => {
      it("THEN returns invalid", () => {
        const result = validateStep2(["sensor.temp"], () => ({
          ...defaultEntityConfig(),
          anomaly_methods: [],
        }));
        expect(result.valid).toBe(false);
        expect(result.error).toContain("detection method");
      });
    });

    describe("WHEN similar_entity method is used without a comparison entity", () => {
      it("THEN returns invalid", () => {
        const result = validateStep2(["sensor.temp"], () => ({
          ...defaultEntityConfig(),
          anomaly_methods: ["similar_entity"],
          anomaly_comparison_entity_id: null,
        }));
        expect(result.valid).toBe(false);
        expect(result.error).toContain("comparison entity");
      });
    });

    describe("WHEN similar_entity method has a comparison entity", () => {
      it("THEN returns valid", () => {
        const result = validateStep2(["sensor.temp"], () => ({
          ...defaultEntityConfig(),
          anomaly_methods: ["similar_entity"],
          anomaly_comparison_entity_id: "sensor.ref",
        }));
        expect(result.valid).toBe(true);
      });
    });
  });

  // ── autoPopulateMonitorName ──────────────────────────────────────────────

  describe("GIVEN autoPopulateMonitorName", () => {
    describe("WHEN currentName is already set", () => {
      it("THEN returns it unchanged", () => {
        expect(autoPopulateMonitorName("My Monitor", ["sensor.temp"])).toBe(
          "My Monitor"
        );
      });
    });

    describe("WHEN single entity", () => {
      it("THEN uses the entity suffix", () => {
        const name = autoPopulateMonitorName("", ["sensor.living_room_temp"]);
        expect(name).toBe("living_room_temp anomalies");
      });
    });

    describe("WHEN multiple entities", () => {
      it("THEN returns generic name", () => {
        const name = autoPopulateMonitorName("", ["sensor.a", "sensor.b"]);
        expect(name).toBe("Anomaly monitor");
      });
    });

    describe("WHEN no entities", () => {
      it("THEN returns anomalies with empty prefix", () => {
        const name = autoPopulateMonitorName("", []);
        expect(name).toBe(" anomalies");
      });
    });
  });

  // ── buildOverlapOptions ──────────────────────────────────────────────────

  describe("GIVEN buildOverlapOptions", () => {
    describe("WHEN entityCount is 2", () => {
      it("THEN returns all and any (no intermediate)", () => {
        const opts = buildOverlapOptions(2);
        expect(opts).toEqual([
          { value: "all", label: "All sensors" },
          { value: "any", label: "Any sensor" },
        ]);
      });
    });

    describe("WHEN entityCount is 4", () => {
      it("THEN includes intermediate options", () => {
        const opts = buildOverlapOptions(4);
        expect(opts).toHaveLength(4);
        expect(opts[0].value).toBe("all");
        expect(opts[1].value).toBe("any");
        expect(opts[2].value).toBe("any_2");
        expect(opts[3].value).toBe("any_3");
      });
    });

    describe("WHEN entityCount is 1", () => {
      it("THEN returns only all and any", () => {
        const opts = buildOverlapOptions(1);
        expect(opts).toEqual([
          { value: "all", label: "All sensors" },
          { value: "any", label: "Any sensor" },
        ]);
      });
    });
  });
});
