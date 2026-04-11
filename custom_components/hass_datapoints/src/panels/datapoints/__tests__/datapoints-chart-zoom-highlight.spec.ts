import { afterEach, describe, expect, it, vi } from "vitest";
import { HassRecordsHistoryPanel } from "../datapoints";

describe("HassRecordsHistoryPanel chart zoom highlight", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GIVEN content is being remounted with a committed chart zoom range", () => {
    describe("WHEN rendering the content area", () => {
      it("THEN it preserves the committed zoom range and refreshes the toolbar highlight", () => {
        expect.assertions(3);
        const originalCreateElement = document.createElement.bind(document);
        const chartSetConfig = vi.fn();
        const listSetConfig = vi.fn();
        const zoomRange = { start: 1_700_000_000_000, end: 1_700_003_600_000 };
        const updateChartZoomHighlight = vi.fn();
        const panel = {
          _entities: ["sensor.temp"],
          _seriesRows: [
            {
              entity_id: "sensor.temp",
              visible: true,
            },
          ],
          _datapointScope: "all",
          _startTime: new Date("2025-01-01T00:00:00Z"),
          _endTime: new Date("2025-01-02T00:00:00Z"),
          _hours: 24,
          _contentKey: "",
          _chartEl: null,
          _historyChartMol: null,
          _listEl: null,
          _chartConfigKey: "",
          _listConfigKey: "",
          _chartHoverTimeMs: 123,
          _chartZoomRange: null,
          _chartZoomCommittedRange: zoomRange,
          _hiddenEventIds: [],
          _showChartDatapointIcons: true,
          _showChartDatapointLines: true,
          _showChartTooltips: true,
          _showChartEmphasizedHoverGuides: false,
          _showCorrelatedAnomalies: false,
          _delinkChartYAxis: false,
          _splitChartView: false,
          _showDataGaps: true,
          _dataGapThreshold: "2h",
          _selectedComparisonWindowId: null,
          _hoveredComparisonWindowId: null,
          _recordsSearchQuery: "",
          _contentSplitRatio: 0.5,
          _getPreviewComparisonWindows: () => [],
          _getPreloadComparisonWindows: () => [],
          _getComparisonPreviewOverlay: () => null,
          _renderComparisonTabs: vi.fn(),
          _applyContentSplitLayout: vi.fn(),
          _updateChartHoverIndicator: vi.fn(),
          _updateChartZoomHighlight: updateChartZoomHighlight,
          _contentHostEl: document.createElement("div"),
        };

        vi.spyOn(document, "createElement").mockImplementation(
          (tagName: string, options?: ElementCreationOptions) => {
            if (tagName === "hass-datapoints-history-card") {
              const el = originalCreateElement(
                "div",
                options
              ) as HTMLDivElement & { setConfig: typeof chartSetConfig };
              el.setConfig = chartSetConfig;
              return el;
            }
            if (tagName === "hass-datapoints-list-card") {
              const el = originalCreateElement(
                "div",
                options
              ) as HTMLDivElement & { setConfig: typeof listSetConfig };
              el.setConfig = listSetConfig;
              return el;
            }
            return originalCreateElement(tagName, options);
          }
        );

        HassRecordsHistoryPanel.prototype._renderContent.call(panel);

        expect(panel._chartZoomCommittedRange).toEqual(zoomRange);
        expect(updateChartZoomHighlight).toHaveBeenCalled();
        expect(chartSetConfig).toHaveBeenCalledWith(
          expect.objectContaining({
            zoom_start_time: new Date(zoomRange.start).toISOString(),
            zoom_end_time: new Date(zoomRange.end).toISOString(),
          })
        );
      });
    });
  });

  describe("GIVEN a comparison tab is hovered", () => {
    describe("WHEN a committed chart zoom is applied", () => {
      it("THEN it clears the hover-only comparison preview state", () => {
        expect.assertions(4);
        const saveSessionState = vi.fn();
        const updateUrl = vi.fn();
        const syncListZoomState = vi.fn();
        const updateChartZoomHighlight = vi.fn();
        const renderComparisonTabs = vi.fn();
        const panel = {
          _chartZoomRange: null,
          _chartZoomCommittedRange: null,
          _hoveredComparisonWindowId: "february",
          _rangeToolbarComp: null,
          _saveSessionState: saveSessionState,
          _updateUrl: updateUrl,
          _syncListZoomState: syncListZoomState,
          _updateChartZoomHighlight: updateChartZoomHighlight,
          _renderComparisonTabs: renderComparisonTabs,
        };

        HassRecordsHistoryPanel.prototype._handleChartZoom.call(panel, {
          detail: {
            startTime: 100,
            endTime: 200,
            preview: false,
            source: "select",
          },
        });

        expect(panel._hoveredComparisonWindowId).toBeNull();
        expect(panel._chartZoomCommittedRange).toEqual({
          start: 100,
          end: 200,
        });
        expect(updateChartZoomHighlight).toHaveBeenCalledTimes(1);
        expect(renderComparisonTabs).toHaveBeenCalledTimes(1);
      });
    });
  });
});
