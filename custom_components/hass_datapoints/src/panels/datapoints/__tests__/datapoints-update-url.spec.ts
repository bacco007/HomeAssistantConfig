import { afterEach, describe, expect, it, vi } from "vitest";
import { HassRecordsHistoryPanel } from "../datapoints";

describe("HassRecordsHistoryPanel updateUrl", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GIVEN the panel has state to serialize", () => {
    describe("WHEN updating the URL", () => {
      it("THEN it passes serialized page state into the navigation context", () => {
        expect.assertions(3);
        const updateUrl = vi.fn();
        const panel = {
          _context: {
            navigation: {
              updateUrl,
            },
          },
          _entities: ["sensor.temp"],
          _seriesRows: [
            {
              entity_id: "sensor.temp",
              color: "#03a9f4",
              visible: true,
              analysis: null,
            },
          ],
          _targetSelection: {},
          _targetSelectionRaw: {},
          _datapointScope: "linked",
          _showChartDatapointIcons: true,
          _showChartDatapointLines: true,
          _showChartTooltips: true,
          _showChartEmphasizedHoverGuides: false,
          _chartHoverSnapMode: "follow_series",
          _delinkChartYAxis: false,
          _splitChartView: false,
          _showCorrelatedAnomalies: false,
          _showDataGaps: true,
          _dataGapThreshold: "2h",
          _contentSplitRatio: 0.5,
          _startTime: new Date("2025-01-01T00:00:00Z"),
          _endTime: new Date("2025-01-02T00:00:00Z"),
          _chartZoomCommittedRange: null,
          _comparisonWindows: [],
          _hours: 24,
          _sidebarCollapsed: false,
          _sidebarAccordionTargetsOpen: true,
          _sidebarAccordionDatapointsOpen: true,
          _sidebarAccordionAnalysisOpen: true,
          _sidebarAccordionChartOpen: true,
          _chartAnomalyOverlapMode: "all",
          _zoomLevel: "auto",
          _dateSnapping: "hour",
          _hiddenEventIds: [],
          _selectedComparisonWindowId: null,
          _seriesColorQueryKey:
            HassRecordsHistoryPanel.prototype._seriesColorQueryKey,
        };

        HassRecordsHistoryPanel.prototype._updateUrl.call(panel, {
          push: false,
        });

        expect(updateUrl).toHaveBeenCalledTimes(1);
        expect(updateUrl).toHaveBeenCalledWith(
          expect.objectContaining({
            pageState: expect.objectContaining({
              entities: ["sensor.temp"],
              datapoint_scope: "linked",
            }),
          })
        );
        expect(updateUrl.mock.calls[0][0].pageState.series_rows).toEqual([
          expect.objectContaining({
            entity_id: "sensor.temp",
          }),
        ]);
      });
    });
  });
});
