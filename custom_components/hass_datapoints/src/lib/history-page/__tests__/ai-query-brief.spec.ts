import { describe, expect, it } from "vitest";
import {
  type AiQueryBriefAnomalySnapshot,
  buildAiQueryBrief,
} from "../ai-query-brief";
import { setFrontendLocale } from "@/lib/i18n/localize";
import { createMockHass } from "@/test-support/mock-hass";
import type { HistorySeriesRow } from "@/lib/domain/history-series";

function createRow(
  overrides: Partial<HistorySeriesRow> = {}
): HistorySeriesRow {
  return {
    entity_id: "sensor.temperature",
    color: "#ff0000",
    visible: true,
    analysis: {
      expanded: true,
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
      show_anomalies: true,
      anomaly_methods: ["trend_residual"],
      anomaly_overlap_mode: "all",
      anomaly_sensitivity: "medium",
      anomaly_rate_window: "1h",
      anomaly_zscore_window: "24h",
      anomaly_persistence_window: "1h",
      anomaly_comparison_window_id: null,
      anomaly_comparison_entity_id: null,
      anomaly_trend_method: "rolling_average",
      anomaly_trend_window: "24h",
      show_delta_analysis: false,
      show_delta_tooltip: true,
      show_delta_lines: false,
      hide_source_series: false,
      sample_interval: "1m",
      sample_aggregate: "mean",
      stepped_series: false,
      anomaly_use_sampled_data: true,
    },
    ...overrides,
  };
}

function createAnomalySnapshot(): AiQueryBriefAnomalySnapshot {
  return {
    available: true,
    current_range_label: "2026-05-01T00:00:00.000Z -> 2026-05-02T00:00:00.000Z",
    chart_anomaly_overlap_mode: "all",
    show_correlated_anomalies: true,
    correlated_anomaly_spans: [
      {
        start_time: "2026-05-01T12:00:00.000Z",
        end_time: "2026-05-01T12:10:00.000Z",
        entity_ids: ["sensor.temperature", "sensor.humidity"],
      },
    ],
    entity_findings: [
      {
        entity_id: "sensor.temperature",
        all_detected_clusters: [
          {
            point_count: 2,
            start_time: "2026-05-01T12:00:00.000Z",
            end_time: "2026-05-01T12:10:00.000Z",
            min_value: 20,
            max_value: 23,
            is_overlap: false,
            points: [
              {
                time: "2026-05-01T12:00:00.000Z",
                value: 20,
              },
              {
                time: "2026-05-01T12:10:00.000Z",
                value: 23,
              },
            ],
          },
        ],
        displayed_clusters: [
          {
            point_count: 2,
            start_time: "2026-05-01T12:00:00.000Z",
            end_time: "2026-05-01T12:10:00.000Z",
            min_value: 20,
            max_value: 23,
            is_overlap: false,
            points: [
              {
                time: "2026-05-01T12:00:00.000Z",
                value: 20,
              },
              {
                time: "2026-05-01T12:10:00.000Z",
                value: 23,
              },
            ],
          },
        ],
      },
    ],
  };
}

describe("buildAiQueryBrief", () => {
  describe("GIVEN one selected entity with anomaly analysis enabled", () => {
    describe("WHEN the brief is generated", () => {
      it("THEN it includes the entity, range, and anomaly query hints", () => {
        expect.assertions(7);
        const result = buildAiQueryBrief({
          hass: createMockHass(),
          entities: ["sensor.temperature"],
          targetSelectionRaw: { entity_id: ["sensor.temperature"] },
          seriesRows: [createRow()],
          datapointScope: "linked",
          startTime: new Date("2026-05-01T00:00:00.000Z"),
          endTime: new Date("2026-05-02T00:00:00.000Z"),
          committedZoomRange: null,
          comparisonWindows: [],
          selectedComparisonWindowId: null,
          chartAnomalyOverlapMode: "all",
          monitorContext: {
            access: "loaded",
            monitors: [],
            note: "",
          },
          anomalySnapshot: createAnomalySnapshot(),
        });

        expect(result.plainText).toContain("sensor.temperature");
        expect(result.plainText).toContain("hass_datapoints/anomalies");
        expect(result.plainText).toContain("2026-05-01T00:00:00.000Z");
        expect(result.plainText).toContain("CURRENT RANGE ANOMALY FINDINGS");
        expect(result.plainText).toContain(
          "Correlated anomaly periods across the selected datapoints:"
        );
        expect(result.plainText).toContain(
          "All detected anomaly cluster details:"
        );
        expect(result.metadata.entitySummaries[0].anomalyEnabled).toBe(true);
      });
    });
  });

  describe("GIVEN the frontend locale is Finnish", () => {
    describe("WHEN the brief is generated", () => {
      it("THEN it uses translated brief copy", async () => {
        expect.assertions(2);
        await setFrontendLocale("fi");

        const result = buildAiQueryBrief({
          hass: createMockHass(),
          entities: ["sensor.temperature"],
          targetSelectionRaw: { entity_id: ["sensor.temperature"] },
          seriesRows: [createRow()],
          datapointScope: "linked",
          startTime: new Date("2026-05-01T00:00:00.000Z"),
          endTime: new Date("2026-05-02T00:00:00.000Z"),
          committedZoomRange: null,
          comparisonWindows: [],
          selectedComparisonWindowId: null,
          chartAnomalyOverlapMode: "all",
          monitorContext: {
            access: "loaded",
            monitors: [],
            note: "",
          },
          anomalySnapshot: null,
        });

        expect(result.plainText).toContain(
          "AI-KYSELYTIIVISTELMÄ: HOME ASSISTANT DATAPOINTS -PANEELI"
        );
        expect(result.plainText).toContain("PANEELIN KONTEKSTI");

        await setFrontendLocale("en");
      }, 10000);
    });
  });

  describe("GIVEN an entity registry entry uses label_ids", () => {
    describe("WHEN the brief is generated", () => {
      it("THEN it includes the resolved label names in entity metadata", () => {
        expect.assertions(1);
        const hass = createMockHass({
          entities: {
            ...createMockHass().entities,
            "sensor.temperature": {
              entity_id: "sensor.temperature",
              device_id: "device_1",
              area_id: "area_1",
              label_ids: ["label_energy"],
            },
          },
          labels: {
            label_energy: {
              name: "Energy",
            },
          },
        });

        const result = buildAiQueryBrief({
          hass,
          entities: ["sensor.temperature"],
          targetSelectionRaw: { entity_id: ["sensor.temperature"] },
          seriesRows: [createRow()],
          datapointScope: "linked",
          startTime: new Date("2026-05-01T00:00:00.000Z"),
          endTime: new Date("2026-05-02T00:00:00.000Z"),
          committedZoomRange: null,
          comparisonWindows: [],
          selectedComparisonWindowId: null,
          chartAnomalyOverlapMode: "all",
          monitorContext: {
            access: "loaded",
            monitors: [],
            note: "",
          },
          anomalySnapshot: null,
        });

        expect(result.plainText).toContain('"labels": [\n    "Energy"\n  ]');
      });
    });
  });

  describe("GIVEN a row that references a comparison window", () => {
    describe("WHEN the brief is generated", () => {
      it("THEN it includes comparison-window query detail", () => {
        expect.assertions(2);
        const result = buildAiQueryBrief({
          hass: createMockHass(),
          entities: ["sensor.temperature"],
          targetSelectionRaw: { entity_id: ["sensor.temperature"] },
          seriesRows: [
            createRow({
              analysis: {
                ...createRow().analysis,
                anomaly_methods: ["comparison_window"],
                anomaly_comparison_window_id: "baseline",
              },
            }),
          ],
          datapointScope: "linked",
          startTime: new Date("2026-05-01T00:00:00.000Z"),
          endTime: new Date("2026-05-02T00:00:00.000Z"),
          committedZoomRange: null,
          comparisonWindows: [
            {
              id: "baseline",
              label: "Previous day",
              start_time: "2026-04-30T00:00:00.000Z",
              end_time: "2026-05-01T00:00:00.000Z",
            },
          ],
          selectedComparisonWindowId: "baseline",
          chartAnomalyOverlapMode: "all",
          monitorContext: {
            access: "loaded",
            monitors: [],
            note: "",
          },
          anomalySnapshot: null,
        });

        expect(result.plainText).toContain(
          "Comparison window anomaly query inputs:"
        );
        expect(result.plainText).toContain("2026-04-30T00:00:00.000Z");
      });
    });
  });

  describe("GIVEN relevant persisted monitors are available", () => {
    describe("WHEN the brief is generated", () => {
      it("THEN it includes only monitors that intersect the selected entities", () => {
        expect.assertions(2);
        const result = buildAiQueryBrief({
          hass: createMockHass(),
          entities: ["sensor.temperature"],
          targetSelectionRaw: { entity_id: ["sensor.temperature"] },
          seriesRows: [createRow()],
          datapointScope: "linked",
          startTime: new Date("2026-05-01T00:00:00.000Z"),
          endTime: new Date("2026-05-02T00:00:00.000Z"),
          committedZoomRange: null,
          comparisonWindows: [],
          selectedComparisonWindowId: null,
          chartAnomalyOverlapMode: "all",
          monitorContext: {
            access: "loaded",
            note: "",
            monitors: [
              {
                id: "monitor-1",
                type: "individual",
                name: "Living room temperature",
                enabled: true,
                look_back_hours: 24,
                scan_interval_minutes: 30,
                created_at: "2026-05-01T00:00:00.000Z",
                last_scan_at: null,
                last_anomaly_at: null,
                last_cluster_count: 0,
                last_scan_data_points: null,
                scan_history: [],
                device_id: null,
                anomaly_methods: ["trend_residual"],
                anomaly_sensitivity: "medium",
                anomaly_overlap_mode: "all",
                anomaly_rate_window: "1h",
                anomaly_zscore_window: "24h",
                anomaly_persistence_window: "1h",
                anomaly_trend_method: "rolling_average",
                anomaly_trend_window: "24h",
                sample_interval: null,
                sample_aggregate: "mean",
                anomaly_use_sampled_data: false,
                baseline_entity_id: null,
                baseline_time_offset_hours: 0,
                dismissed_windows: [],
                entity_id: "sensor.temperature",
              },
              {
                id: "monitor-2",
                type: "individual",
                name: "Hallway motion",
                enabled: true,
                look_back_hours: 24,
                scan_interval_minutes: 30,
                created_at: "2026-05-01T00:00:00.000Z",
                last_scan_at: null,
                last_anomaly_at: null,
                last_cluster_count: 0,
                last_scan_data_points: null,
                scan_history: [],
                device_id: null,
                anomaly_methods: ["trend_residual"],
                anomaly_sensitivity: "medium",
                anomaly_overlap_mode: "all",
                anomaly_rate_window: "1h",
                anomaly_zscore_window: "24h",
                anomaly_persistence_window: "1h",
                anomaly_trend_method: "rolling_average",
                anomaly_trend_window: "24h",
                sample_interval: null,
                sample_aggregate: "mean",
                anomaly_use_sampled_data: false,
                baseline_entity_id: null,
                baseline_time_offset_hours: 0,
                dismissed_windows: [],
                entity_id: "binary_sensor.motion",
              },
            ],
          },
          anomalySnapshot: null,
        });

        expect(result.metadata.relevantMonitorIds).toEqual(["monitor-1"]);
        expect(result.plainText).not.toContain("Hallway motion");
      });
    });
  });

  describe("GIVEN monitor access is unavailable", () => {
    describe("WHEN the brief is generated", () => {
      it("THEN it includes the monitor note without failing", () => {
        expect.assertions(2);
        const result = buildAiQueryBrief({
          hass: createMockHass({
            user: { is_admin: false },
          }),
          entities: ["sensor.temperature"],
          targetSelectionRaw: { entity_id: ["sensor.temperature"] },
          seriesRows: [createRow()],
          datapointScope: "linked",
          startTime: new Date("2026-05-01T00:00:00.000Z"),
          endTime: new Date("2026-05-02T00:00:00.000Z"),
          committedZoomRange: null,
          comparisonWindows: [],
          selectedComparisonWindowId: null,
          chartAnomalyOverlapMode: "all",
          monitorContext: {
            access: "not_admin",
            monitors: [],
            note: "Monitor context could not be included because the current Home Assistant user is not an admin.",
          },
          anomalySnapshot: null,
        });

        expect(result.plainText).toContain(
          "Monitor context could not be included because the current Home Assistant user is not an admin."
        );
        expect(result.metadata.monitorAccess).toBe("not_admin");
      });
    });
  });
});
