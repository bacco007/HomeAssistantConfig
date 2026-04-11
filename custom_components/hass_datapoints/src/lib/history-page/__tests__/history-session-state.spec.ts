import { afterEach, describe, expect, it } from "vitest";

import {
  PANEL_HISTORY_PREFERENCES_KEY,
  PANEL_HISTORY_SESSION_KEY,
  buildHistoryPagePreferencesPayload,
  buildHistoryPageSessionState,
  normalizeHistoryPagePreferences,
  readHistoryPageSessionState,
  writeHistoryPageSessionState,
} from "@/lib/history-page/history-session-state";

afterEach(() => {
  window.sessionStorage.clear();
});

describe("history-session-state", () => {
  describe("GIVEN the history page session keys", () => {
    describe("WHEN they are read", () => {
      it("THEN they stay namespaced under the integration domain", () => {
        expect.assertions(2);

        expect(PANEL_HISTORY_PREFERENCES_KEY).toContain("hass_datapoints");
        expect(PANEL_HISTORY_SESSION_KEY).toContain("hass_datapoints");
      });
    });
  });

  describe("GIVEN a history page source object", () => {
    describe("WHEN the session helpers are used", () => {
      it("THEN they build, persist, and read the session payload", () => {
        expect.assertions(3);

        const source = {
          _entities: ["sensor.a"],
          _seriesRows: [
            { entity_id: "sensor.a", color: "#123456", visible: true },
          ],
          _targetSelection: { entity_id: ["sensor.a"] },
          _targetSelectionRaw: { entity_id: ["sensor.a"] },
          _datapointScope: "linked",
          _showChartDatapointIcons: true,
          _showChartDatapointLines: false,
          _showChartTooltips: true,
          _showChartEmphasizedHoverGuides: false,
          _chartHoverSnapMode: "snap_to_data_points",
          _contentSplitRatio: 0.42,
          _startTime: new Date("2026-04-01T00:00:00.000Z"),
          _endTime: new Date("2026-04-02T00:00:00.000Z"),
          _chartZoomCommittedRange: { start: 10, end: 20 },
          _comparisonWindows: [
            {
              label: "Saved",
              start: "2026-03-01T00:00:00.000Z",
              end: "2026-03-02T00:00:00.000Z",
            },
          ],
          _hours: 24,
          _sidebarCollapsed: true,
          _sidebarAccordionTargetsOpen: true,
          _sidebarAccordionDatapointsOpen: false,
          _sidebarAccordionAnalysisOpen: true,
          _sidebarAccordionChartOpen: true,
          _showCorrelatedAnomalies: false,
          _chartAnomalyOverlapMode: "all",
          _showDataGaps: false,
          _dataGapThreshold: "1h",
        };

        const built = buildHistoryPageSessionState(source);
        writeHistoryPageSessionState(source);

        expect(built.entities).toEqual(["sensor.a"]);
        expect(readHistoryPageSessionState()?.sidebar_collapsed).toBe(true);
        expect(readHistoryPageSessionState()?.date_windows).toHaveLength(1);
      });
    });
  });

  describe("GIVEN a source with hover snap mode configured", () => {
    describe("WHEN the session payload is built", () => {
      it("THEN it persists chart_hover_snap_mode", () => {
        expect.assertions(1);

        const built = buildHistoryPageSessionState({
          _entities: [],
          _seriesRows: [],
          _targetSelection: {},
          _targetSelectionRaw: {},
          _datapointScope: "linked",
          _showChartDatapointIcons: true,
          _showChartDatapointLines: true,
          _showChartTooltips: true,
          _showChartEmphasizedHoverGuides: false,
          _chartHoverSnapMode: "snap_to_data_points",
          _contentSplitRatio: 0.42,
          _startTime: null,
          _endTime: null,
          _chartZoomCommittedRange: null,
          _comparisonWindows: [],
          _hours: 24,
          _sidebarCollapsed: false,
          _sidebarAccordionTargetsOpen: true,
          _sidebarAccordionDatapointsOpen: true,
          _sidebarAccordionAnalysisOpen: true,
          _sidebarAccordionChartOpen: true,
          _showCorrelatedAnomalies: false,
          _chartAnomalyOverlapMode: "all",
          _showDataGaps: true,
          _dataGapThreshold: "2h",
        });

        expect(built.chart_hover_snap_mode).toBe("snap_to_data_points");
      });
    });
  });

  describe("GIVEN saved preferences", () => {
    describe("WHEN the preference helpers are called", () => {
      it("THEN they normalize values and build the persisted payload", () => {
        expect.assertions(5);

        const normalized = normalizeHistoryPagePreferences(
          {
            zoom_level: "day",
            date_snapping: "minute",
            series_colors: { "sensor.a": "#abcdef", broken: "red" },
            date_windows: [
              {
                label: "Saved",
                start: "2026-03-01T00:00:00.000Z",
                end: "2026-03-02T00:00:00.000Z",
              },
            ],
          },
          {
            zoomOptions: [{ value: "auto" }, { value: "day" }],
            snapOptions: [{ value: "hour" }, { value: "minute" }],
          }
        );

        expect(normalized.zoomLevel).toBe("day");
        expect(normalized.dateSnapping).toBe("minute");
        expect(normalized.preferredSeriesColors).toEqual({
          "sensor.a": "#abcdef",
        });

        expect(
          buildHistoryPagePreferencesPayload({
            _zoomLevel: "day",
            _dateSnapping: "minute",
            _entities: ["sensor.a"],
            _seriesRows: [{ entity_id: "sensor.a", color: "#123456" }],
            _targetSelection: { entity_id: ["sensor.a"] },
            _targetSelectionRaw: { entity_id: ["sensor.a"] },
            _datapointScope: "linked",
            _showChartDatapointIcons: true,
            _showChartDatapointLines: true,
            _showChartTooltips: true,
            _showChartEmphasizedHoverGuides: false,
            _chartHoverSnapMode: "follow_series",
            _delinkChartYAxis: false,
            _splitChartView: false,
            _showCorrelatedAnomalies: false,
            _chartAnomalyOverlapMode: "all",
            _showDataGaps: true,
            _dataGapThreshold: "2h",
            _contentSplitRatio: 0.5,
            _startTime: null,
            _endTime: null,
            _chartZoomCommittedRange: null,
            _hours: 24,
            _sidebarCollapsed: false,
            _sidebarAccordionTargetsOpen: true,
            _sidebarAccordionDatapointsOpen: true,
            _sidebarAccordionAnalysisOpen: true,
            _sidebarAccordionChartOpen: true,
            _preferredSeriesColors: {},
            _comparisonWindows: normalized.comparisonWindows,
          })
        ).toEqual({
          zoom_level: "day",
          date_snapping: "minute",
          series_colors: { "sensor.a": "#123456" },
          date_windows: normalized.comparisonWindows,
          page_state: expect.objectContaining({
            entities: ["sensor.a"],
            chart_hover_snap_mode: "follow_series",
          }),
        });
        expect(normalized.comparisonWindows).toHaveLength(1);
      });
    });
  });
});
