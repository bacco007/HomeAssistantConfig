import { describe, expect, it, vi } from "vitest";
import { HassDatapointsHistoryPanel } from "../datapoints";
import { createMockHass } from "@/test-support/mock-hass";

vi.mock("@/lib/data/monitors-api", async () => {
  const actual = await vi.importActual("@/lib/data/monitors-api");
  return {
    ...actual,
    fetchMonitors: vi.fn(() =>
      Promise.resolve([
        {
          id: "monitor-1",
          type: "individual",
          name: "Temperature monitor",
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
      ])
    ),
  };
});

describe("HassDatapointsHistoryPanel AI query brief", () => {
  describe("GIVEN the current user is not an admin", () => {
    describe("WHEN monitor context is resolved", () => {
      it("THEN it returns the non-admin note without fetching monitors", async () => {
        expect.assertions(2);
        const panel = {
          _hass: createMockHass({
            user: { is_admin: false },
          }),
        };

        const result =
          await HassDatapointsHistoryPanel.prototype._resolveAiQueryBriefMonitorContext.call(
            panel
          );

        expect(result.access).toBe("not_admin");
        expect(result.note).toContain("not an admin");
      });
    });
  });

  describe("GIVEN current panel state is available", () => {
    describe("WHEN the AI brief dialog is opened", () => {
      it("THEN it opens the dialog with the latest entity and range state", async () => {
        expect.assertions(4);
        const dialog = {
          open: false,
          heading: "",
          text: "",
        };
        const panel = {
          shadowRoot: {} as ShadowRoot,
          _aiQueryBriefDialogComp: dialog,
          _mountAiQueryBriefDialogControl: vi.fn(),
          _resolveAiQueryBriefMonitorContext: vi.fn(() =>
            Promise.resolve({
              access: "loaded",
              monitors: [],
              note: "",
            })
          ),
          _hass: createMockHass(),
          _entities: ["sensor.temperature"],
          _targetSelectionRaw: { entity_id: ["sensor.temperature"] },
          _seriesRows: [
            {
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
            },
          ],
          _datapointScope: "linked",
          _startTime: new Date("2026-05-01T00:00:00.000Z"),
          _endTime: new Date("2026-05-02T00:00:00.000Z"),
          _chartZoomCommittedRange: null,
          _comparisonWindows: [],
          _selectedComparisonWindowId: null,
          _chartAnomalyOverlapMode: "all",
        };

        await HassDatapointsHistoryPanel.prototype._openAiQueryBriefDialog.call(
          panel
        );

        expect(dialog.open).toBe(true);
        expect(dialog.heading).toBe("AI query brief");
        expect(dialog.text).toContain("sensor.temperature");
        expect(dialog.text).toContain("2026-05-01T00:00:00.000Z");
      });
    });
  });

  describe("GIVEN the current user is an admin but the monitor request fails", () => {
    describe("WHEN monitor context is resolved", () => {
      it("THEN it reports the monitor context as unavailable", async () => {
        expect.assertions(2);
        const panel = {
          _hass: createMockHass({
            connection: {
              sendMessagePromise: vi.fn().mockRejectedValue(new Error("boom")),
            },
          }),
        };

        const result =
          await HassDatapointsHistoryPanel.prototype._resolveAiQueryBriefMonitorContext.call(
            panel
          );

        expect(result.access).toBe("unavailable");
        expect(result.note).toContain("request failed");
      });
    });
  });
});
