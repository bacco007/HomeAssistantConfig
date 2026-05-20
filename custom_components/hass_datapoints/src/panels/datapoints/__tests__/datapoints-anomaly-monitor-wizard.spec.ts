import { afterEach, describe, expect, it, vi } from "vitest";
import { HassDatapointsHistoryPanel } from "../datapoints";

describe("HassDatapointsHistoryPanel anomaly monitor wizard launch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GIVEN chart series include origin, related anomaly series, and a binary sensor", () => {
    describe("WHEN the panel opens the monitor wizard from chart analysis", () => {
      it("THEN it excludes the origin from suggestions and includes it in all-series while filtering out binary sensors", () => {
        expect.assertions(5);
        const openMonitorWizard = vi.fn();
        const panel = {
          _seriesRows: [
            {
              entity_id: "sensor.temperature",
              analysis: {
                show_anomalies: true,
                anomaly_methods: ["trend_residual"],
              },
            },
            {
              entity_id: "sensor.humidity",
              analysis: {
                show_anomalies: true,
                anomaly_methods: ["iqr"],
              },
            },
            {
              entity_id: "sensor.pressure",
              analysis: {
                show_anomalies: false,
                anomaly_methods: [],
              },
            },
            {
              entity_id: "binary_sensor.motion",
              analysis: {
                show_anomalies: true,
                anomaly_methods: ["iqr"],
              },
            },
          ],
          _openMonitorWizard: openMonitorWizard,
        };

        HassDatapointsHistoryPanel.prototype._openMonitorWizardFromChartAnalysis.call(
          panel,
          "sensor.temperature",
          { anomaly_methods: ["trend_residual"] }
        );

        expect(openMonitorWizard).toHaveBeenCalledOnce();
        expect(openMonitorWizard.mock.calls[0][0]).toEqual([
          "sensor.temperature",
        ]);
        expect(openMonitorWizard.mock.calls[0][3]).toEqual(["sensor.humidity"]);
        expect(openMonitorWizard.mock.calls[0][4]).toEqual([
          "sensor.temperature",
          "sensor.humidity",
          "sensor.pressure",
        ]);
        expect(openMonitorWizard.mock.calls[0][4]).not.toContain(
          "binary_sensor.motion"
        );
      });
    });
  });
});
