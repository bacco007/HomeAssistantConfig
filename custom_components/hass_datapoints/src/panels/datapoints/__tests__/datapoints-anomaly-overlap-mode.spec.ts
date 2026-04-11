import { afterEach, describe, expect, it, vi } from "vitest";
import { HassRecordsHistoryPanel } from "../datapoints";
import { normalizeHistorySeriesAnalysis } from "@/lib/domain/history-series";

describe("HassRecordsHistoryPanel anomaly overlap mode config", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GIVEN the chart is already mounted", () => {
    describe("WHEN the page-level anomaly overlap mode changes", () => {
      it("THEN the updated chart config forwards that mode to the chart and row analysis", () => {
        expect.assertions(3);
        const setConfig = vi.fn();
        let panel: RecordWithUnknownValues;
        const contentHost = {
          contains: (value: unknown) =>
            value === panel._chartEl || value === panel._listEl,
          classList: { toggle: vi.fn() },
          querySelector: (selector: string) => {
            if (selector === "#content-resizable-panes") {
              return { secondHidden: false };
            }
            return null;
          },
        };
        panel = {
          _entities: ["sensor.temp"],
          _seriesRows: [
            {
              entity_id: "sensor.temp",
              color: "#03a9f4",
              visible: true,
              analysis: normalizeHistorySeriesAnalysis(null),
            },
          ],
          _datapointScope: "all",
          _showChartDatapointIcons: true,
          _showChartDatapointLines: true,
          _showChartTooltips: true,
          _showChartEmphasizedHoverGuides: false,
          _chartHoverSnapMode: "follow_series",
          _showCorrelatedAnomalies: true,
          _chartAnomalyOverlapMode: "only",
          _delinkChartYAxis: false,
          _splitChartView: false,
          _showDataGaps: true,
          _dataGapThreshold: "2h",
          _hours: 24,
          _startTime: new Date("2026-03-01T00:00:00.000Z"),
          _endTime: new Date("2026-03-02T00:00:00.000Z"),
          _chartZoomCommittedRange: null,
          _recordsSearchQuery: "",
          _hiddenEventIds: [],
          _hoveredComparisonWindowId: null,
          _selectedComparisonWindowId: null,
          _chartEl: { setConfig, hass: null, isConnected: true },
          _historyChartMol: { _configKey: "" },
          _contentKey: JSON.stringify({
            entities: ["sensor.temp"],
            series_entity_ids: ["sensor.temp"],
            datapoint_scope: "all",
            start: "2026-03-01T00:00:00.000Z",
            end: "2026-03-02T00:00:00.000Z",
            hours: 24,
          }),
          _chartConfigKey: "",
          _listEl: { isConnected: true, setConfig: vi.fn(), hass: null },
          _listConfigKey: "",
          _contentHostEl: contentHost,
          _renderComparisonTabs: vi.fn(),
          _getPreviewComparisonWindows: () => [],
          _getPreloadComparisonWindows: () => [],
          _getComparisonPreviewOverlay: () => null,
          _applyContentSplitLayout: vi.fn(),
          _hass: null,
        };

        HassRecordsHistoryPanel.prototype._renderContent.call(panel);

        expect(setConfig).toHaveBeenCalledTimes(1);
        expect(setConfig.mock.calls[0][0].anomaly_overlap_mode).toBe("only");
        expect(
          setConfig.mock.calls[0][0].series_settings[0].analysis
            .anomaly_overlap_mode
        ).toBe("only");
      });
    });
  });
});
